import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn, tagStyle } from '../../../utils';
import { Avatar } from '../../../components/ui/Avatar';
import { mockUsers } from '../../../data/mock/users';

/* ─── Pill chip — multi-select ─────────────────────────── */
export function FChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center h-7 px-3 rounded-full text-[11px] font-medium border transition-colors select-none',
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
      className="w-full flex items-center gap-3 py-2 group"
    >
      <span className={cn(
        'w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors',
        checked ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-border group-hover:border-brand-blue-light',
      )}>
        {checked && (
          <svg width="11" height="9" viewBox="0 0 9 7" fill="none">
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
    <div>
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

/* ─── Floating dropdown — portaled, renders over the page ── */
export function FDropdown({
  placeholder, title, selectedCount, onClear, children,
}: {
  placeholder: string;
  title?: string;
  selectedCount: number;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const has = selectedCount > 0;

  /* Compute position from trigger box on open / on scroll-resize */
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      if (!t) return;
      setPos({ top: t.bottom + 6, left: t.left, width: t.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  /* Click-outside to close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
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

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: Math.max(pos.width, 240), zIndex: 60 }}
          className="rounded-xl border border-brand-border bg-white overflow-hidden shadow-panel"
        >
          {title && (
            <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-subtle uppercase tracking-[0.18em] truncate">{title}</p>
              {has && onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[12px] font-semibold text-brand-blue hover:underline flex-shrink-0"
                >Clear ({selectedCount})</button>
              )}
            </div>
          )}
          <div className="max-h-[300px] overflow-y-auto p-1.5">
            {children}
          </div>
        </div>,
        document.body,
      )}
    </>
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
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
        checked ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
      )}
    >
      <span className={cn(
        'w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors',
        checked ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-border',
      )}>
        {checked && (
          <svg width="11" height="9" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {avatar && (
        <span className="w-7 h-7 rounded-full bg-surface-3 border border-brand-border text-muted text-[10px] font-bold flex items-center justify-center flex-shrink-0 leading-none">
          {avatar}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn('text-[12px] leading-tight font-medium', checked ? 'text-brand-blue' : 'text-muted')}>
          {children}
        </p>
        {sublabel && <p className="text-[10px] text-subtle mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}

/* ─── Manager picker — multi-select dept × people popover ──
   Trigger looks identical to FDropdown. Panel is a wide 2-column
   grid: departments on the left, filtered managers on the right
   with a search input. Multi-select: click a row to toggle.    */
const MANAGER_PANEL_W = 560;
const MANAGER_LIST_H  = 420;

export function FManagerDropdown({
  selectedUserIds, onToggle, onClear, placeholder = 'Any manager',
}: {
  selectedUserIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  placeholder?: string;
}) {
  const [open,  setOpen]  = useState(false);
  const [dept,  setDept]  = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(mockUsers.map(u => u.department))).sort((a, b) => a.localeCompare(b)),
    [],
  );

  const selectedSet = useMemo(() => new Set(selectedUserIds), [selectedUserIds]);
  const selectedUsers = useMemo(
    () => mockUsers.filter(u => selectedSet.has(u.id)),
    [selectedSet],
  );
  const has = selectedUserIds.length > 0;

  /* Per-department selected counts for the left column badges */
  const deptCounts = useMemo(() => {
    const m = new Map<string, number>();
    selectedUsers.forEach(u => m.set(u.department, (m.get(u.department) ?? 0) + 1));
    return m;
  }, [selectedUsers]);

  /* Position the floating panel; clamp to viewport */
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      if (!t) return;
      const margin = 8;
      let left = t.left;
      if (left + MANAGER_PANEL_W + margin > window.innerWidth) {
        left = Math.max(margin, window.innerWidth - MANAGER_PANEL_W - margin);
      }
      setPos({ top: t.bottom + 6, left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  /* Click-outside to close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* When opened, default the dept tab to first selected manager's dept */
  useEffect(() => {
    if (!open) return;
    setDept(selectedUsers[0]?.department ?? departments[0] ?? null);
    setQuery('');
  }, [open, selectedUsers, departments]);

  const filtered = useMemo(() => {
    const list = dept ? mockUsers.filter(u => u.department === dept) : mockUsers;
    const q = query.trim().toLowerCase();
    return q ? list.filter(u => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q)) : list;
  }, [dept, query]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
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
                {selectedUserIds.length}
              </span>
              <span className="text-[12px] font-medium text-brand-blue truncate">
                {selectedUserIds.length === 1
                  ? selectedUsers[0]?.name ?? '1 selected'
                  : `${selectedUserIds.length} selected`}
              </span>
            </>
          ) : (
            <span className="text-[12px] text-subtle">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {has && (
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

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: MANAGER_PANEL_W, zIndex: 60 }}
          className="bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden"
        >
          <div className="grid grid-cols-[220px_1fr]">
            {/* Left: departments */}
            <div className="border-r border-brand-border">
              <div className="px-4 py-3 border-b border-brand-border">
                <p className="text-[11px] font-semibold text-subtle uppercase tracking-[0.18em]">Departments</p>
              </div>
              <div className="overflow-y-auto p-2" style={{ maxHeight: MANAGER_LIST_H + 64 }}>
                {departments.map(d => {
                  const active   = d === dept;
                  const dCount   = deptCounts.get(d) ?? 0;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setDept(d); setQuery(''); }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-3 rounded-xl text-left transition-colors',
                        active ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
                      )}
                    >
                      <span className={cn('text-[13px] font-medium truncate flex-1', active ? 'text-brand-blue' : 'text-muted')}>{d}</span>
                      {dCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-blue text-white text-[11px] font-semibold flex items-center justify-center leading-none flex-shrink-0 tabular-nums">
                          {dCount}
                        </span>
                      )}
                      <ChevronDown className={cn('w-4 h-4 -rotate-90 flex-shrink-0', active ? 'text-brand-blue' : 'text-faint')} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: people */}
            <div>
              <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-subtle uppercase tracking-[0.18em] truncate">
                  {dept ?? 'People'}
                </p>
                {has && (
                  <button
                    type="button"
                    onClick={() => { onClear(); }}
                    className="text-[12px] font-semibold text-brand-blue hover:underline flex-shrink-0"
                  >Clear ({selectedUserIds.length})</button>
                )}
              </div>
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
              <div className="overflow-y-auto p-2" style={{ maxHeight: MANAGER_LIST_H }}>
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
                        'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors',
                        active ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
                      )}
                    >
                      <span className={cn(
                        'w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors',
                        active ? 'bg-brand-blue border-brand-blue' : 'bg-white border-brand-border',
                      )}>
                        {active && (
                          <svg width="11" height="9" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <Avatar name={u.name} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className={cn('text-[13px] font-medium truncate leading-tight', active ? 'text-brand-blue' : 'text-muted')}>
                          {u.name}
                        </div>
                        <div className="text-[11px] text-subtle truncate leading-tight mt-0.5">{u.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}


/* ─── Tag picker — popover with colored chip-labels ─────── */
const TAG_PANEL_W = 460;

export function FTagDropdown({
  tags, selectedTags, onToggle, onClear, placeholder = 'Any tag',
}: {
  tags: readonly string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
  placeholder?: string;
}) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const selectedSet = useMemo(() => new Set(selectedTags), [selectedTags]);
  const has = selectedTags.length > 0;

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      if (!t) return;
      const margin = 8;
      let left = t.left;
      if (left + TAG_PANEL_W + margin > window.innerWidth) {
        left = Math.max(margin, window.innerWidth - TAG_PANEL_W - margin);
      }
      setPos({ top: t.bottom + 6, left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => { if (open) setQuery(''); }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tags.filter(t => t.toLowerCase().includes(q)) : tags;
  }, [tags, query]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
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
        <div className="flex items-center gap-1.5 min-w-0">
          {has ? (
            <>
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-blue text-white text-[10px] font-medium flex items-center justify-center flex-shrink-0 leading-none tabular-nums">
                {selectedTags.length}
              </span>
              <span className="text-[12px] font-medium text-brand-blue truncate">
                {selectedTags.length === 1 ? selectedTags[0] : `${selectedTags.length} selected`}
              </span>
            </>
          ) : (
            <span className="text-[12px] text-subtle">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {has && (
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

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: TAG_PANEL_W, zIndex: 60 }}
          className="bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-subtle uppercase tracking-[0.18em] truncate">Tags</p>
            {has && (
              <button
                type="button"
                onClick={onClear}
                className="text-[12px] font-semibold text-brand-blue hover:underline flex-shrink-0"
              >Clear ({selectedTags.length})</button>
            )}
          </div>

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

          <div className="p-3 max-h-[420px] overflow-y-auto">
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
                        'inline-flex items-center h-9 px-4 rounded-full border text-[13px] font-bold uppercase tracking-wider transition-all',
                        'hover:scale-[1.04] active:scale-[0.98]',
                        active ? 'ring-2 ring-offset-2' : '',
                      )}
                      style={{
                        backgroundColor: s.bg,
                        color: s.text,
                        borderColor: s.border,
                      }}
                      title={t}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
