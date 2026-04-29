import { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { Star, ChevronLeft } from 'lucide-react';
import { cn } from '../../../utils';
import { mockUsers } from '../../../data/mock/users';
import {
  type Filters,
  type FilterSectionId,
  countFilters,
  activeSections,
} from '../lib/filters';
import { LANG_LABELS, SUGGESTED_TAGS, TRAVEL_OPTIONS, STATUS_OPTIONS } from '../lib/constants';
import { FChip, FCheck, FSection, FDropdown, FDropdownOption } from './FilterPrimitives';
import { FilterPresets } from './FilterPresets';

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

export function FilterPanel({ filters, onChange, count, total, onReset, onClose }: Props) {
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
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-semibold text-muted">Guests</span>
          <span className="text-[10px] text-subtle tabular-nums">
            {count}/{total}
          </span>
        </div>
        <button
          onClick={onClose}
          title="Hide filters"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ── Presets + active reset ───────────────────────── */}
      <div className="px-4 pt-3 pb-2 border-b border-border-soft flex-shrink-0">
        <FilterPresets filters={filters} onApply={onChange} />

        {activeCount > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="min-w-[16px] h-4 px-1 rounded-full bg-brand-blue text-white text-[10px] font-medium flex items-center justify-center leading-none flex-shrink-0 tabular-nums">
                {activeCount}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-subtle font-semibold">
                {activeCount === 1 ? '1 filter' : `${activeCount} filters`}
              </span>
            </div>
            <button
              onClick={onReset}
              className="text-[11px] font-semibold text-brand-blue hover:underline"
            >Reset all</button>
          </div>
        )}
      </div>

      {/* ── Scrollable filters ───────────────────────────── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-1">

        {S('assignment', 'Assigned to',
          <FDropdown
            placeholder="Any manager"
            selectedCount={filters.assignedUserId ? 1 : 0}
            onClear={() => onChange({ ...filters, assignedUserId: '' })}
          >
            {mockUsers.map(u => {
              const initials = u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
              return (
                <FDropdownOption
                  key={u.id}
                  checked={filters.assignedUserId === u.id}
                  onClick={() => onChange({
                    ...filters,
                    assignedUserId: filters.assignedUserId === u.id ? '' : u.id,
                  })}
                  avatar={initials}
                  sublabel={u.department}
                >{u.name}</FDropdownOption>
              );
            })}
          </FDropdown>,
        )}

        {S('status', 'Client status',
          <div className="flex flex-wrap gap-1.5">
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
            selectedCount={filters.languages.length}
            onClear={() => onChange({ ...filters, languages: [] })}
          >
            {Object.entries(LANG_LABELS).map(([code, lbl]) => (
              <FDropdownOption
                key={code}
                checked={filters.languages.includes(code)}
                onClick={() => multi('languages', code)}
              >{lbl}</FDropdownOption>
            ))}
          </FDropdown>,
        )}

        {S('travel', 'Travels with',
          <div className="flex flex-wrap gap-1.5">
            {TRAVEL_OPTIONS.map(([v, l]) => (
              <FChip key={v} active={filters.travelWith.includes(v)} onClick={() => multi('travelWith', v)}>{l}</FChip>
            ))}
          </div>,
        )}

        {S('visits', 'Past visits',
          <div className="grid grid-cols-2 gap-2">
            {([['From', 'visitFrom'], ['To', 'visitTo']] as const).map(([lbl, field]) => (
              <div key={field}>
                <p className="text-[10px] text-subtle mb-1.5">{lbl}</p>
                <input
                  type="date"
                  value={filters[field]}
                  onChange={e => onChange({ ...filters, [field]: e.target.value })}
                  className="w-full h-10 px-2.5 rounded-lg border border-brand-border bg-surface-3 text-[11px] text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
                />
              </div>
            ))}
          </div>,
        )}

        {S('finance', 'Total spend (€)',
          <div className="grid grid-cols-2 gap-2">
            {([['Min', 'spendMin', '0'], ['Max', 'spendMax', '∞']] as const).map(([lbl, field, ph]) => (
              <div key={field}>
                <p className="text-[10px] text-subtle mb-1.5">{lbl}</p>
                <input
                  type="number"
                  placeholder={ph}
                  value={filters[field]}
                  onChange={e => onChange({ ...filters, [field]: e.target.value })}
                  className="w-full h-10 px-2.5 rounded-lg border border-brand-border bg-surface-3 text-[12px] text-muted placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
                />
              </div>
            ))}
          </div>,
        )}

        {S('rating', 'Guest rating',
          <div>
            <p className="text-[10px] text-subtle mb-2">Minimum score</p>
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
          <FDropdown
            placeholder="Any tag"
            selectedCount={filters.tags.length}
            onClear={() => onChange({ ...filters, tags: [] })}
          >
            {SUGGESTED_TAGS.map(t => (
              <FDropdownOption
                key={t}
                checked={filters.tags.includes(t)}
                onClick={() => multi('tags', t)}
              >{t}</FDropdownOption>
            ))}
          </FDropdown>,
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
