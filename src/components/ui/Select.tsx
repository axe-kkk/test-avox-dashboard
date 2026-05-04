import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils';

export type SelectOption =
  | string
  | { value: string; label: string; disabled?: boolean };

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
}

interface MenuPos {
  left: number;
  top: number;
  width: number;
  flipUp: boolean;
}

function normalize(o: SelectOption) {
  return typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o };
}

function readScale() {
  if (typeof window === 'undefined') return 1;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--ui-scale').trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

const MENU_GAP = 4;
const MAX_VISUAL_HEIGHT = 256;

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className,
  triggerClassName,
  size = 'md',
  align = 'left',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const items = options.map(normalize);
  const selectedIdx = items.findIndex((o) => o.value === value);
  const selected = selectedIdx >= 0 ? items[selectedIdx] : null;

  function recalcPos() {
    const t = wrapRef.current;
    if (!t) return;
    const rect = t.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < MAX_VISUAL_HEIGHT + MENU_GAP && rect.top > spaceBelow;
    const top = flipUp ? rect.top - MENU_GAP : rect.bottom + MENU_GAP;
    const left = align === 'right' ? rect.right : rect.left;
    setPos({ left, top, width: rect.width, flipUp });
  }

  useLayoutEffect(() => {
    if (!open) return;
    recalcPos();
    function onScrollOrResize() { recalcPos(); }
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocPointer);
    return () => document.removeEventListener('mousedown', onDocPointer);
  }, [open]);

  useEffect(() => {
    if (open) setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
  }, [open, selectedIdx]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLLIElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  function move(delta: number) {
    if (!items.length) return;
    let next = activeIndex;
    for (let i = 0; i < items.length; i++) {
      next = (next + delta + items.length) % items.length;
      if (!items[next].disabled) break;
    }
    setActiveIndex(next);
  }

  function commit(idx: number) {
    const item = items[idx];
    if (!item || item.disabled) return;
    onChange(item.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else move(1); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); if (!open) setOpen(true); else move(-1); return; }
    if (e.key === 'Home')      { e.preventDefault(); setActiveIndex(items.findIndex(o => !o.disabled)); return; }
    if (e.key === 'End')       { e.preventDefault(); for (let i = items.length - 1; i >= 0; i--) { if (!items[i].disabled) { setActiveIndex(i); break; } } return; }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      if (activeIndex >= 0) commit(activeIndex);
      return;
    }
    if (e.key === 'Escape')    { if (open) { e.preventDefault(); setOpen(false); } return; }
    if (e.key === 'Tab')       { setOpen(false); return; }
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const ch = e.key.toLowerCase();
      const start = (activeIndex + 1) % items.length;
      for (let i = 0; i < items.length; i++) {
        const idx = (start + i) % items.length;
        if (!items[idx].disabled && items[idx].label.toLowerCase().startsWith(ch)) {
          setActiveIndex(idx);
          if (!open) commit(idx);
          break;
        }
      }
    }
  }

  const triggerH = size === 'sm' ? 'h-8' : 'h-9';

  const menu = open && pos
    ? (() => {
        const scale = readScale();
        const visualWidth = pos.width;
        const intrinsicWidth = visualWidth / scale;
        const intrinsicMaxH = MAX_VISUAL_HEIGHT / scale;
        const originY = pos.flipUp ? 'bottom' : 'top';
        const originX = align === 'right' ? 'right' : 'left';
        const transform = `scale(${scale})${pos.flipUp ? ' translateY(-100%)' : ''}`;
        const leftCss = align === 'right' ? undefined : pos.left;
        const rightCss = align === 'right' ? window.innerWidth - pos.left : undefined;
        return createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            style={{
              position: 'fixed',
              left: leftCss,
              right: rightCss,
              top: pos.top,
              width: intrinsicWidth,
              maxHeight: intrinsicMaxH,
              transform,
              transformOrigin: `${originY} ${originX}`,
              zIndex: 1000,
            }}
            className="overflow-auto py-1 rounded-xl border border-brand-border bg-white shadow-panel"
          >
            {items.map((opt, i) => {
              const isSelected = i === selectedIdx;
              const isActive = i === activeIndex;
              return (
                <li
                  key={opt.value}
                  data-idx={i}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                  onMouseDown={(e) => { e.preventDefault(); commit(i); }}
                  className={cn(
                    'mx-1 px-2.5 h-8 flex items-center justify-between gap-2 rounded-lg text-[12px] cursor-pointer select-none',
                    opt.disabled
                      ? 'text-faint cursor-not-allowed'
                      : isSelected
                        ? 'bg-brand-blue-light text-brand-blue font-semibold'
                        : isActive
                          ? 'bg-brand-blue-50 text-strong'
                          : 'text-strong',
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        );
      })()
    : null;

  return (
    <div ref={wrapRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={cn(
          'w-full flex items-center justify-between gap-2 pl-3 pr-2.5 rounded-xl border bg-surface-2',
          'text-[12px] text-strong text-left transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light',
          triggerH,
          open ? 'border-brand-blue-light ring-2 ring-brand-blue-light' : 'border-brand-border',
          disabled && 'opacity-60 cursor-not-allowed',
          triggerClassName,
        )}
      >
        <span className={cn('truncate', !selected && 'text-subtle')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-subtle transition-transform flex-shrink-0',
            open && 'rotate-180',
          )}
        />
      </button>
      {menu}
    </div>
  );
}
