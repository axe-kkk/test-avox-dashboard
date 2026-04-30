import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';
import { cn, tagStyle } from '../../../utils';
import { Avatar } from '../../../components/ui/Avatar';
import { mockUsers } from '../../../data/mock/users';

/* ════════════════════════════════════════════════════════════════════
   UNIFIED FILTER FIELD — single trigger row that opens a popover.
   Used by every filter section in FilterPanel for visual consistency.
   ════════════════════════════════════════════════════════════════════ */

function usePopoverPos(triggerRef: React.RefObject<HTMLButtonElement | null>, width: number) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState<{ top: number; left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      if (!t) return;
      const margin = 8;
      const w = Math.max(width, t.width);
      let left = t.left;
      if (left + w + margin > window.innerWidth) {
        left = Math.max(margin, window.innerWidth - w - margin);
      }
      setPos({ top: t.bottom + 6, left, width: w });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, width]);
  return { open, setOpen, pos };
}

export function FilterField({
  icon: Icon, label, summary, count, active, onClear, popoverWidth = 280, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  summary?: string;
  count?: number;
  active: boolean;
  onClear?: () => void;
  popoverWidth?: number;
  children: React.ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const { open, setOpen, pos } = usePopoverPos(triggerRef, popoverWidth);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors border text-left',
          active
            ? 'bg-brand-blue-50 border-brand-blue-light hover:border-brand-blue'
            : open
              ? 'bg-white border-brand-blue ring-2 ring-brand-blue-light/30'
              : 'bg-surface-2 border-brand-border hover:bg-white hover:border-faint',
        )}
      >
        <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-brand-blue' : 'text-subtle')} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-[12px] font-semibold leading-tight', active ? 'text-brand-blue' : 'text-muted')}>{label}</p>
          {summary && <p className={cn('text-[10px] truncate leading-tight mt-0.5', active ? 'text-brand-blue/70' : 'text-subtle')}>{summary}</p>}
        </div>
        {active && count != null && count > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-blue text-white text-[10px] font-medium flex items-center justify-center leading-none flex-shrink-0 tabular-nums">
            {count}
          </span>
        )}
        <ChevronDown className={cn('w-3.5 h-3.5 flex-shrink-0 transition-transform', open ? 'rotate-180 text-brand-blue' : '-rotate-90 text-faint')} />
      </button>
      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 60 }}
          className="bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-subtle truncate">{label}</p>
            {onClear && active && (
              <button
                type="button"
                onClick={onClear}
                className="text-[12px] font-semibold text-brand-blue hover:underline flex-shrink-0"
              >
                Clear{count != null && count > 1 ? ` (${count})` : ''}
              </button>
            )}
          </div>
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}

/* ─── Manager picker panel (dept × people grid) ─────────── */
export function ManagerPickerPanel({
  selectedIds, onToggle,
}: { selectedIds: string[]; onToggle: (id: string) => void }) {
  const departments = useMemo(
    () => Array.from(new Set(mockUsers.map(u => u.department))).sort((a, b) => a.localeCompare(b)),
    [],
  );
  const selectedSet   = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedUsers = useMemo(() => mockUsers.filter(u => selectedSet.has(u.id)), [selectedSet]);
  const [dept,  setDept]  = useState<string | null>(selectedUsers[0]?.department ?? departments[0] ?? null);
  const [query, setQuery] = useState('');
  const deptCounts = useMemo(() => {
    const m = new Map<string, number>();
    selectedUsers.forEach(u => m.set(u.department, (m.get(u.department) ?? 0) + 1));
    return m;
  }, [selectedUsers]);
  const filtered = useMemo(() => {
    const list = dept ? mockUsers.filter(u => u.department === dept) : mockUsers;
    const q = query.trim().toLowerCase();
    return q ? list.filter(u => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q)) : list;
  }, [dept, query]);

  return (
    <div className="grid grid-cols-[200px_1fr]">
      <div className="border-r border-brand-border">
        <div className="overflow-y-auto p-2 max-h-[420px]">
          {departments.map(d => {
            const active = d === dept;
            const dCount = deptCounts.get(d) ?? 0;
            return (
              <button
                key={d}
                type="button"
                onClick={() => { setDept(d); setQuery(''); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors',
                  active ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
                )}
              >
                <span className={cn('text-[12px] font-medium truncate flex-1', active ? 'text-brand-blue' : 'text-muted')}>{d}</span>
                {dCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-blue text-white text-[10px] font-semibold flex items-center justify-center leading-none flex-shrink-0 tabular-nums">
                    {dCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search manager…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-brand-border bg-surface-3 text-[13px] text-muted placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-2 max-h-[360px]">
          {filtered.length === 0 ? (
            <div className="px-3 py-10 text-center text-[13px] text-subtle">No results</div>
          ) : filtered.map(u => {
            const active = selectedSet.has(u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onToggle(u.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                  active ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
                )}
              >
                <span className={cn(
                  'w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors',
                  active ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-border',
                )}>
                  {active && (
                    <svg width="11" height="9" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <Avatar name={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className={cn('text-[13px] font-medium truncate leading-tight', active ? 'text-brand-blue' : 'text-muted')}>{u.name}</div>
                  <div className="text-[11px] text-subtle truncate leading-tight mt-0.5">{u.role}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Tag picker panel (colored chip grid) ──────────────── */
export function TagPickerPanel({
  tags, selectedTags, onToggle,
}: { tags: readonly string[]; selectedTags: string[]; onToggle: (t: string) => void }) {
  const [query, setQuery] = useState('');
  const selectedSet = useMemo(() => new Set(selectedTags), [selectedTags]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tags.filter(t => t.toLowerCase().includes(q)) : tags;
  }, [tags, query]);

  return (
    <>
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tags…"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-brand-border bg-surface-3 text-[13px] text-muted placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition"
          />
        </div>
      </div>
      <div className="p-3 max-h-[360px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-3 py-10 text-center text-[13px] text-subtle">No tags match.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map(t => {
              const s = tagStyle(t);
              const active = selectedSet.has(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onToggle(t)}
                  className={cn(
                    'inline-flex items-center h-9 px-4 rounded-full border text-[12px] font-semibold transition-all',
                    'hover:scale-[1.04] active:scale-[0.98]',
                    active ? 'ring-2 ring-offset-2' : '',
                  )}
                  style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
                  title={t}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Multi-select option list (Status, Travel, Language) ── */
export function OptionListPanel({
  options, selected, onToggle,
}: {
  options: { value: string; label: string; sublabel?: string; leading?: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  return (
    <div className="p-2 max-h-[360px] overflow-y-auto">
      {options.map(o => {
        const active = selectedSet.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
              active ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
            )}
          >
            <span className={cn(
              'w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors',
              active ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-border',
            )}>
              {active && (
                <svg width="11" height="9" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            {o.leading && (
              <span className="w-7 h-7 rounded-full bg-surface-3 border border-brand-border text-muted text-[10px] font-bold flex items-center justify-center flex-shrink-0 leading-none">
                {o.leading}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className={cn('text-[13px] font-medium truncate leading-tight', active ? 'text-brand-blue' : 'text-muted')}>{o.label}</div>
              {o.sublabel && <div className="text-[11px] text-subtle truncate leading-tight mt-0.5">{o.sublabel}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Boolean check list (Contact, Activity) ────────────── */
export function BoolListPanel({
  items, onToggle,
}: {
  items: { key: string; label: string; checked: boolean }[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="p-2 max-h-[360px] overflow-y-auto">
      {items.map(i => (
        <button
          key={i.key}
          type="button"
          onClick={() => onToggle(i.key)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
            i.checked ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
          )}
        >
          <span className={cn(
            'w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors',
            i.checked ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-border',
          )}>
            {i.checked && (
              <svg width="11" height="9" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span className={cn('text-[13px] font-medium leading-tight flex-1 truncate', i.checked ? 'text-brand-blue' : 'text-muted')}>{i.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Range panel (date range or number range) ──────────── */
export function RangePanel({
  type, fromValue, toValue, fromPlaceholder, toPlaceholder, onChange,
}: {
  type: 'date' | 'number';
  fromValue: string;
  toValue: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  onChange: (next: { from: string; to: string }) => void;
}) {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-subtle w-12 flex-shrink-0">From</span>
        <input
          type={type}
          value={fromValue}
          placeholder={fromPlaceholder}
          onChange={e => onChange({ from: e.target.value, to: toValue })}
          className="flex-1 h-10 px-3 rounded-lg border border-brand-border bg-surface-3 text-[13px] text-muted placeholder:text-faint tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-subtle w-12 flex-shrink-0">To</span>
        <input
          type={type}
          value={toValue}
          placeholder={toPlaceholder}
          onChange={e => onChange({ from: fromValue, to: e.target.value })}
          className="flex-1 h-10 px-3 rounded-lg border border-brand-border bg-surface-3 text-[13px] text-muted placeholder:text-faint tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
        />
      </div>
    </div>
  );
}

/* ─── Star rating panel ─────────────────────────────────── */
export function StarRatingPanel({
  value, onChange,
}: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="p-4">
      <p className="text-[11px] font-medium text-subtle mb-2">Minimum score</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(value === s ? 0 : s)}
            className="p-1 transition-transform hover:scale-110 active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className={cn(
              'transition-colors',
              s <= value ? 'fill-brand-blue text-brand-blue' : 'fill-transparent text-faint hover:text-brand-blue-light',
            )}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
        {value > 0 && (
          <span className="text-[12px] text-brand-blue font-semibold ml-2">≥ {value}</span>
        )}
      </div>
    </div>
  );
}
