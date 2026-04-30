import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ArrowRight, X } from 'lucide-react';
import { cn } from '../../../utils';
import { type Period, PERIOD_LABELS } from '../lib/mockData';

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const triggerLabel =
    value === 'custom' && appliedFrom && appliedTo
      ? `${formatDate(appliedFrom)} → ${formatDate(appliedTo)}`
      : PERIOD_LABELS[value];

  const handlePick = (p: Period) => {
    if (p === 'custom') {
      setCustomOpen(true);
      // Pre-fill with sensible defaults if empty
      if (!from || !to) {
        const today = new Date();
        const past = new Date(today);
        past.setDate(today.getDate() - 14);
        setFrom(past.toISOString().slice(0, 10));
        setTo(today.toISOString().slice(0, 10));
      }
      return;
    }
    onChange(p);
    setOpen(false);
    setCustomOpen(false);
  };

  const applyCustom = () => {
    if (!from || !to) return;
    if (new Date(from) > new Date(to)) return;
    setAppliedFrom(from);
    setAppliedTo(to);
    onChange('custom');
    setOpen(false);
    setCustomOpen(false);
  };

  const cancelCustom = () => {
    setCustomOpen(false);
    setFrom(appliedFrom);
    setTo(appliedTo);
  };

  const validRange = from && to && new Date(from) <= new Date(to);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(v => !v); setCustomOpen(false); }}
        className={cn(
          'h-10 pl-3 pr-2.5 inline-flex items-center gap-2 rounded-xl border bg-white text-[12px] font-medium transition-colors',
          open
            ? 'border-brand-blue-light ring-2 ring-brand-blue-light text-strong'
            : 'border-brand-border text-muted hover:text-strong hover:border-faint',
        )}
      >
        <Calendar className="w-3.5 h-3.5 text-subtle" />
        <span className="text-strong tabular-nums">{triggerLabel}</span>
        <ChevronDown className={cn('w-3 h-3 text-subtle transition-transform', open && 'rotate-180')} />
      </button>

      {open && !customOpen && (
        <div className="absolute right-0 top-full mt-1 w-[200px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => {
            const isActive = p === value;
            return (
              <button
                key={p}
                onClick={() => handlePick(p)}
                className={cn(
                  'w-full text-left px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors',
                  isActive
                    ? 'bg-brand-blue-50 text-brand-blue font-semibold'
                    : 'text-muted hover:bg-surface-3 hover:text-strong',
                )}
              >
                <span>{PERIOD_LABELS[p]}</span>
                {p === 'custom' && <ArrowRight className="w-3 h-3 opacity-60" />}
              </button>
            );
          })}
        </div>
      )}

      {customOpen && (
        <div className="absolute right-0 top-full mt-1 w-[320px] bg-white border border-brand-border rounded-xl shadow-panel z-50 overflow-hidden">
          <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-brand-border">
            <p className="text-[12px] font-semibold text-strong">Custom range</p>
            <button
              onClick={cancelCustom}
              className="w-6 h-6 inline-flex items-center justify-center rounded-md text-subtle hover:text-strong hover:bg-surface-3 transition-colors"
              title="Back"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle mb-1.5">From</label>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={e => setFrom(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-brand-border bg-white text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle mb-1.5">To</label>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={e => setTo(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-brand-border bg-white text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light tabular-nums"
              />
            </div>
          </div>
          <div className="px-4 pb-3.5 pt-2 flex items-center justify-end gap-2 border-t border-brand-border">
            <button
              onClick={cancelCustom}
              className="h-9 px-3.5 rounded-lg border border-brand-border text-[12px] font-medium text-muted hover:bg-surface-3 hover:text-strong transition-colors"
            >Cancel</button>
            <button
              onClick={applyCustom}
              disabled={!validRange}
              className={cn(
                'h-9 px-4 rounded-lg text-[12px] font-semibold transition-colors',
                validRange
                  ? 'bg-brand-blue text-white hover:bg-brand-blue-hover'
                  : 'bg-surface-3 text-faint cursor-not-allowed',
              )}
            >Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}
