import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../utils';

/* ─── Pill chip — multi-select ─────────────────────────── */
export function FChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium border transition-colors select-none',
        active
          ? 'bg-brand-blue text-white border-brand-blue'
          : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue hover:bg-brand-blue-50',
      )}
    >{children}</button>
  );
}

/* ─── Checkbox row — boolean toggle (true / null) ──────── */
export function FCheck({
  checked, onClick, children,
}: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 py-1.5 group"
    >
      <span className={cn(
        'w-[15px] h-[15px] rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors',
        checked ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-border group-hover:border-brand-blue-light',
      )}>
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className={cn(
        'text-[12px] transition-colors',
        checked ? 'text-brand-blue font-medium' : 'text-muted group-hover:text-muted',
      )}>{children}</span>
    </button>
  );
}

/* ─── Collapsible filter section ───────────────────────── */
export function FSection({
  id, label, active, open, onToggle, children,
}: {
  id: string;
  label: string;
  active: boolean;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border-soft last:border-0">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <div className="flex items-center gap-2">
          {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue flex-shrink-0" />}
          <span className={cn(
            'text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors',
            active ? 'text-brand-blue' : 'text-subtle group-hover:text-muted',
          )}>{label}</span>
        </div>
        {open
          ? <ChevronUp   className="w-3.5 h-3.5 text-faint group-hover:text-muted transition-colors flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-faint group-hover:text-muted transition-colors flex-shrink-0" />}
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

/* ─── Inline dropdown — expands in place ───────────────── */
export function FDropdown({
  placeholder, selectedCount, onClear, children,
}: {
  placeholder: string;
  selectedCount: number;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const has = selectedCount > 0;
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full h-10 px-3 rounded-lg border flex items-center justify-between gap-2 transition-colors',
          open
            ? 'bg-white border-brand-blue ring-2 ring-brand-blue-light/30'
            : has
              ? 'bg-brand-blue-50 border-brand-blue-light hover:border-brand-blue'
              : 'bg-surface-3 border-brand-border hover:bg-white hover:border-faint',
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {has ? (
            <>
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-blue text-white text-[10px] font-medium flex items-center justify-center flex-shrink-0 leading-none tabular-nums">
                {selectedCount}
              </span>
              <span className="text-[12px] font-medium text-brand-blue truncate">
                {selectedCount} selected
              </span>
            </>
          ) : (
            <span className="text-[12px] text-subtle">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {has && onClear && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onClear(); }}
              className="w-4 h-4 rounded-full bg-brand-blue-light/60 text-brand-blue flex items-center justify-center text-[11px] leading-none hover:bg-brand-blue hover:text-white transition-colors cursor-pointer select-none"
            >×</span>
          )}
          <ChevronDown className={cn(
            'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150',
            open ? 'rotate-180 text-brand-blue' : 'text-faint',
          )} />
        </div>
      </button>

      {open && (
        <div className="mt-1.5 rounded-lg border border-brand-border bg-white overflow-hidden shadow-panel">
          <div className="max-h-[196px] overflow-y-auto p-1.5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Option row inside FDropdown ──────────────────────── */
export function FDropdownOption({
  checked, onClick, avatar, sublabel, children,
}: {
  checked: boolean;
  onClick: () => void;
  avatar?: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors',
        checked ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
      )}
    >
      <span className={cn(
        'w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors',
        checked ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-border',
      )}>
        {checked && (
          <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {avatar && (
        <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 leading-none">
          {avatar}
        </span>
      )}
      <div className="min-w-0">
        <p className={cn('text-[12px] leading-tight', checked ? 'text-brand-blue font-medium' : 'text-muted')}>
          {children}
        </p>
        {sublabel && <p className="text-[10px] text-subtle mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}
