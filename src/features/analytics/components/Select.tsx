import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../../utils';

interface Option<V extends string> {
  value: V;
  label: string;
}

interface Props<V extends string> {
  value: V;
  options: Option<V>[];
  onChange: (v: V) => void;
  /** Prefix shown on the trigger when an option is selected, e.g. "Engine". */
  prefix?: string;
  /** Optional left-side icon for the trigger. */
  icon?: ReactNode;
  width?: number;
  align?: 'left' | 'right';
}

export function Select<V extends string>({
  value, options, onChange, prefix, icon, width = 200, align = 'left',
}: Props<V>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value) ?? options[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'h-10 pl-3 pr-2.5 inline-flex items-center gap-2 rounded-xl border bg-white text-[12px] font-medium transition-colors',
          open
            ? 'border-brand-blue-light ring-2 ring-brand-blue-light text-strong'
            : 'border-brand-border text-muted hover:text-strong hover:border-faint',
        )}
      >
        {icon && <span className="text-subtle flex-shrink-0">{icon}</span>}
        <span className="truncate text-strong">
          {prefix && <span className="text-subtle font-normal">{prefix}: </span>}
          {current?.label}
        </span>
        <ChevronDown className={cn('w-3 h-3 text-subtle transition-transform flex-shrink-0', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5 max-h-[280px] overflow-y-auto',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          style={{ width }}
        >
          {prefix && (
            <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">{prefix}</p>
          )}
          {options.map(o => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn(
                  'w-full text-left px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between gap-2 transition-colors',
                  active
                    ? 'bg-brand-blue-50 text-brand-blue font-semibold'
                    : 'text-muted hover:bg-surface-3 hover:text-strong',
                )}
              >
                <span className="truncate">{o.label}</span>
                {active && <Check className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
