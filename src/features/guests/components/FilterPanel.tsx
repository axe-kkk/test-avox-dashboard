import { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { Star, ChevronLeft } from 'lucide-react';
import { cn } from '../../../utils';
import {
  type Filters,
  type FilterSectionId,
  countFilters,
  activeSections,
} from '../lib/filters';
import { LANG_LABELS, SUGGESTED_TAGS, TRAVEL_OPTIONS, STATUS_OPTIONS } from '../lib/constants';
import {
  FChip, FCheck, FSection, FDropdown, FDropdownOption, FManagerDropdown, FTagDropdown,
} from './FilterPrimitives';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  count: number;
  total: number;
  onReset: () => void;
  onClose: () => void;
}

/* Sections that should auto-open on first mount */
const ALWAYS_OPEN: FilterSectionId[] = ['assignment', 'status'];

export function FilterPanel({ filters, onChange, count, onReset, onClose }: Props) {
  const active = activeSections(filters);
  const activeCount = countFilters(filters);

  /* Initial open state: any section that already has an active filter, plus the defaults. */
  const initialOpen = useMemo<Set<string>>(() => {
    const s = new Set<string>(ALWAYS_OPEN);
    (Object.keys(active) as FilterSectionId[]).forEach(k => { if (active[k]) s.add(k); });
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [openGroups, setOpenGroups] = useState<Set<string>>(initialOpen);

  /* Preserve scroll across re-renders */
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScroll = useRef(0);
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = savedScroll.current;
  });
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    savedScroll.current = e.currentTarget.scrollTop;
  };

  const toggleGroup = (id: string) =>
    setOpenGroups(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  /* Helpers — multi-select & boolean toggle */
  const multi = (field: 'languages' | 'travelWith' | 'clientStatus' | 'tags', val: string) => {
    const arr = filters[field] as string[];
    onChange({ ...filters, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };
  const bool = (field: keyof Filters, val: boolean) => {
    onChange({ ...filters, [field]: (filters[field] as boolean | null) === val ? null : val });
  };

  const S = (id: FilterSectionId, label: string, children: React.ReactNode) => (
    <FSection
      id={id}
      label={label}
      active={active[id]}
      open={openGroups.has(id)}
      onToggle={toggleGroup}
    >{children}</FSection>
  );

  return (
    <div className="w-[260px] flex-shrink-0 border-r border-brand-border flex flex-col overflow-hidden bg-white">

      {/* ── Header (matches Inbox sub-sidebar 56px) ──────── */}
      <div className="h-[56px] px-4 flex items-center justify-between border-b border-brand-border flex-shrink-0">
        <span className="text-[13px] font-semibold text-muted">Guests</span>
        <button
          onClick={onClose}
          title="Hide filters"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ── Summary cards: matches & filters ─────────────── */}
      <div className="p-3 flex gap-2 flex-shrink-0">
        <div className="flex-1 min-w-0 rounded-xl border border-brand-border bg-surface-2 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-subtle">Guests</p>
          <p className="text-[12px] mt-1 truncate">
            <span className="font-semibold text-muted tabular-nums">{count}</span>
            <span className="text-subtle"> match</span>
          </p>
        </div>
        <div className="flex-1 min-w-0 rounded-xl border border-brand-border bg-surface-2 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-subtle">Filters</p>
          <p className="text-[12px] mt-1 truncate">
            <span className={cn('font-semibold tabular-nums', activeCount > 0 ? 'text-brand-blue' : 'text-muted')}>{activeCount}</span>
            <span className="text-subtle"> applied</span>
          </p>
        </div>
      </div>

      {/* ── Scrollable filters ───────────────────────────── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-1">

        {S('assignment', 'Assigned to',
          <FManagerDropdown
            selectedUserIds={filters.assignedUserIds}
            onToggle={id => onChange({
              ...filters,
              assignedUserIds: filters.assignedUserIds.includes(id)
                ? filters.assignedUserIds.filter(x => x !== id)
                : [...filters.assignedUserIds, id],
            })}
            onClear={() => onChange({ ...filters, assignedUserIds: [] })}
          />,
        )}

        {S('status', 'Client status',
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(([v, l]) => (
              <FChip key={v} active={filters.clientStatus.includes(v)} onClick={() => multi('clientStatus', v)}>{l}</FChip>
            ))}
          </div>,
        )}

        {S('contact', 'Contact info',
          <div className="space-y-0.5">
            <FCheck checked={filters.hasPhone === true} onClick={() => bool('hasPhone', true)}>Has phone number</FCheck>
            <FCheck checked={filters.hasEmail === true} onClick={() => bool('hasEmail', true)}>Has email address</FCheck>
          </div>,
        )}

        {S('activity', 'Activity',
          <div className="space-y-0.5">
            <FCheck checked={filters.hasSequence    === true} onClick={() => bool('hasSequence', true)}>Active sequence</FCheck>
            <FCheck checked={filters.hasReservation === true} onClick={() => bool('hasReservation', true)}>Active reservation</FCheck>
            <FCheck checked={filters.hasCalls       === true} onClick={() => bool('hasCalls', true)}>Has calls</FCheck>
            <FCheck checked={filters.hasComplaints  === true} onClick={() => bool('hasComplaints', true)}>Has complaints</FCheck>
          </div>,
        )}

        {S('language', 'Language',
          <FDropdown
            placeholder="Any language"
            title="Languages"
            selectedCount={filters.languages.length}
            onClear={() => onChange({ ...filters, languages: [] })}
          >
            {Object.entries(LANG_LABELS).map(([code, lbl]) => (
              <FDropdownOption
                key={code}
                checked={filters.languages.includes(code)}
                onClick={() => multi('languages', code)}
                sublabel={code.toUpperCase()}
              >{lbl}</FDropdownOption>
            ))}
          </FDropdown>,
        )}

        {S('travel', 'Travels with',
          <div className="flex flex-wrap gap-2">
            {TRAVEL_OPTIONS.map(([v, l]) => (
              <FChip key={v} active={filters.travelWith.includes(v)} onClick={() => multi('travelWith', v)}>{l}</FChip>
            ))}
          </div>,
        )}

        {S('visits', 'Past visits',
          <div className="h-10 rounded-lg border border-brand-border bg-surface-3 flex divide-x divide-brand-border overflow-hidden focus-within:bg-white focus-within:border-brand-blue-light transition-colors">
            <label className="flex-1 min-w-0 flex items-center gap-2 px-3 cursor-text">
              <span className="text-[11px] font-semibold text-subtle flex-shrink-0">From</span>
              <input
                type="date"
                value={filters.visitFrom}
                onChange={e => onChange({ ...filters, visitFrom: e.target.value })}
                className="w-full min-w-0 bg-transparent outline-none text-[12px] text-muted tabular-nums"
              />
            </label>
            <label className="flex-1 min-w-0 flex items-center gap-2 px-3 cursor-text">
              <span className="text-[11px] font-semibold text-subtle flex-shrink-0">To</span>
              <input
                type="date"
                value={filters.visitTo}
                onChange={e => onChange({ ...filters, visitTo: e.target.value })}
                className="w-full min-w-0 bg-transparent outline-none text-[12px] text-muted tabular-nums"
              />
            </label>
          </div>,
        )}

        {S('finance', 'Total spend (€)',
          <div className="h-10 rounded-lg border border-brand-border bg-surface-3 flex divide-x divide-brand-border overflow-hidden focus-within:bg-white focus-within:border-brand-blue-light transition-colors">
            <label className="flex-1 min-w-0 flex items-center gap-2 px-3 cursor-text">
              <span className="text-[11px] font-semibold text-subtle flex-shrink-0">Min</span>
              <input
                type="number"
                placeholder="0"
                value={filters.spendMin}
                onChange={e => onChange({ ...filters, spendMin: e.target.value })}
                className="w-full min-w-0 bg-transparent outline-none text-[13px] text-muted placeholder:text-faint tabular-nums"
              />
            </label>
            <label className="flex-1 min-w-0 flex items-center gap-2 px-3 cursor-text">
              <span className="text-[11px] font-semibold text-subtle flex-shrink-0">Max</span>
              <input
                type="number"
                placeholder="∞"
                value={filters.spendMax}
                onChange={e => onChange({ ...filters, spendMax: e.target.value })}
                className="w-full min-w-0 bg-transparent outline-none text-[13px] text-muted placeholder:text-faint tabular-nums"
              />
            </label>
          </div>,
        )}

        {S('rating', 'Guest rating',
          <div>
            <p className="text-[10px] font-medium text-subtle mb-2">Minimum score</p>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => onChange({ ...filters, ratingMin: filters.ratingMin === s ? 0 : s })}
                  className="p-0.5"
                >
                  <Star className={cn(
                    'w-[20px] h-[20px] transition-colors',
                    s <= filters.ratingMin
                      ? 'fill-brand-blue text-brand-blue'
                      : 'fill-transparent text-faint hover:text-brand-blue-light',
                  )} />
                </button>
              ))}
              {filters.ratingMin > 0 && (
                <span className="text-[11px] text-brand-blue font-semibold ml-1.5">≥ {filters.ratingMin}</span>
              )}
            </div>
          </div>,
        )}

        {S('tags', 'Tags',
          <FTagDropdown
            tags={SUGGESTED_TAGS}
            selectedTags={filters.tags}
            onToggle={t => multi('tags', t)}
            onClear={() => onChange({ ...filters, tags: [] })}
          />,
        )}

        <div className="h-4" />
      </div>

      {/* ── Footer: Reset all (only when filters applied) ── */}
      {activeCount > 0 && (
        <div className="px-3 py-3 border-t border-brand-border flex-shrink-0 bg-white">
          <button
            onClick={onReset}
            className="w-full h-10 rounded-lg border border-brand-border bg-surface-3 text-[12px] font-medium text-brand-blue hover:bg-white hover:border-brand-blue-light transition-colors"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
