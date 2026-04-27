import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import {
  Search, ChevronDown, ChevronUp, Star, X, SlidersHorizontal,
  Settings2, Download, MessageSquare, ChevronLeft,
  Mail, Phone,
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { mockGuests } from '../../data/mock/guests';
import { mockUsers } from '../../data/mock/users';
import { mockReservations } from '../../data/mock/reservations';
import { mockConversations } from '../../data/mock/conversations';
import { formatDate, formatCurrency, formatDateTime, cn } from '../../utils';
import type { Guest } from '../../types';
import { useApp } from '../../app/AppContext';

/* ─── Mock assignments ─── */
const GUEST_ASSIGNMENTS: Record<string, string> = {
  guest_001: 'user_001', guest_002: 'user_002', guest_003: 'user_003',
  guest_004: 'user_001', guest_005: 'user_002', guest_006: 'user_001',
  guest_007: 'user_003', guest_008: 'user_002', guest_009: 'user_001', guest_010: 'user_002',
};

const LANG_LABELS: Record<string, string> = {
  de: 'German', en: 'English', fr: 'French', es: 'Spanish',
  it: 'Italian', ru: 'Russian', ar: 'Arabic', ja: 'Japanese',
};

const SUGGESTED_TAGS = ['VIP', 'Returning', 'Business', 'Leisure', 'Family', 'Solo', 'Couple', 'Honeymoon', 'Corporate', 'Anniversary'];

/* ─── Filters ─── */
interface Filters {
  assignedUserId: string;
  hasSequence: boolean | null;
  hasPhone: boolean | null;
  hasEmail: boolean | null;
  languages: string[];
  travelWith: string[];
  clientStatus: string[];
  hasReservation: boolean | null;
  visitFrom: string;
  visitTo: string;
  spendMin: string;
  spendMax: string;
  hasCalls: boolean | null;
  hasComplaints: boolean | null;
  ratingMin: number;
  tags: string[];
}

const DEFAULT_FILTERS: Filters = {
  assignedUserId: '', hasSequence: null, hasPhone: null, hasEmail: null,
  languages: [], travelWith: [], clientStatus: [], hasReservation: null,
  visitFrom: '', visitTo: '', spendMin: '', spendMax: '',
  hasCalls: null, hasComplaints: null, ratingMin: 0, tags: [],
};

function countFilters(f: Filters): number {
  let n = 0;
  if (f.assignedUserId) n++;
  if (f.hasSequence !== null) n++;
  if (f.hasPhone !== null || f.hasEmail !== null) n++;
  if (f.languages.length) n++;
  if (f.travelWith.length) n++;
  if (f.clientStatus.length) n++;
  if (f.hasReservation !== null) n++;
  if (f.visitFrom || f.visitTo) n++;
  if (f.spendMin || f.spendMax) n++;
  if (f.hasCalls !== null) n++;
  if (f.hasComplaints !== null) n++;
  if (f.ratingMin > 0) n++;
  if (f.tags.length) n++;
  return n;
}

function applyFilters(guests: Guest[], filters: Filters, search: string): Guest[] {
  return guests.filter(g => {
    if (search) {
      const q = search.toLowerCase();
      if (!g.name.toLowerCase().includes(q) && !g.email.toLowerCase().includes(q)) return false;
    }
    if (filters.assignedUserId && GUEST_ASSIGNMENTS[g.id] !== filters.assignedUserId) return false;
    if (filters.hasPhone === true && !g.phone) return false;
    if (filters.hasEmail === true && !g.email) return false;
    if (filters.languages.length && !filters.languages.includes(g.language)) return false;
    if (filters.travelWith.length) {
      const ok = filters.travelWith.some(t =>
        t === 'solo' ? g.companions.length === 0 :
        t === 'couple' ? g.companions.length === 1 :
        t === 'kids' ? g.tags.includes('Family') :
        t === 'group' ? g.companions.length >= 3 : false
      );
      if (!ok) return false;
    }
    if (filters.clientStatus.length) {
      const ok = filters.clientStatus.some(s =>
        s === 'vip' ? g.tags.includes('VIP') :
        s === 'new' ? g.totalVisits <= 1 :
        s === 'returning' ? g.totalVisits > 1 :
        s === 'lost' ? (!g.upcomingStayAt && g.status === 'checked_out') : false
      );
      if (!ok) return false;
    }
    if (filters.hasReservation === true && !g.upcomingStayAt) return false;
    if (filters.hasReservation === false && g.upcomingStayAt) return false;
    if (filters.visitFrom && g.lastStayAt && g.lastStayAt < filters.visitFrom) return false;
    if (filters.visitTo && g.lastStayAt && g.lastStayAt > filters.visitTo) return false;
    if (filters.spendMin && g.lifetimeValue < Number(filters.spendMin)) return false;
    if (filters.spendMax && g.lifetimeValue > Number(filters.spendMax)) return false;
    if (filters.ratingMin > 0 && (!g.satisfactionScore || g.satisfactionScore < filters.ratingMin)) return false;
    if (filters.tags.length && !filters.tags.some(t => g.tags.includes(t))) return false;
    return true;
  });
}

/* ─── Columns ─── */
type ColId = 'name' | 'email' | 'phone' | 'assignedTo' | 'lastContact' | 'lastStay' | 'nextStay' | 'visits' | 'ltv' | 'language' | 'source';

const ALL_COLS: { id: ColId; label: string; sortKey?: keyof Guest }[] = [
  { id: 'name',        label: 'Name',          sortKey: 'name'           },
  { id: 'email',       label: 'Email'                                     },
  { id: 'phone',       label: 'Phone'                                     },
  { id: 'assignedTo',  label: 'Assigned to'                               },
  { id: 'lastContact', label: 'Last contact',  sortKey: 'lastInquiryAt'  },
  { id: 'lastStay',    label: 'Last stay',     sortKey: 'lastStayAt'     },
  { id: 'nextStay',    label: 'Next stay',     sortKey: 'upcomingStayAt' },
  { id: 'visits',      label: 'Visits',        sortKey: 'totalVisits'    },
  { id: 'ltv',         label: 'LTV',           sortKey: 'lifetimeValue'  },
  { id: 'language',    label: 'Language',      sortKey: 'language'       },
  { id: 'source',      label: 'Source',        sortKey: 'source'         },
];

/* ═══════════════════════════════════════════════
   FILTER PANEL — sub-components (outside to prevent remount on re-render)
═══════════════════════════════════════════════ */

/** Pill chip — multi-select */
function FChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium border transition-all select-none',
        active
          ? 'bg-[#2355A7] text-white border-[#2355A7]'
          : 'bg-white text-[#5C6370] border-[#E4E6EA] hover:border-[#2355A7] hover:text-[#2355A7] hover:bg-[#F0F5FF]',
      )}
    >{children}</button>
  );
}

/** Checkbox row — boolean toggle */
function FCheck({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 py-1.5 group"
    >
      <span className={cn(
        'w-[15px] h-[15px] rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all',
        checked ? 'bg-[#2355A7] border-[#2355A7]' : 'bg-white border-[#D5D8DE] group-hover:border-[#2355A7]',
      )}>
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className={cn('text-[12px] transition-colors', checked ? 'text-[#2355A7] font-medium' : 'text-[#5C6370] group-hover:text-[#3D4550]')}>{children}</span>
    </button>
  );
}

/** Collapsible section — defined outside FilterPanel to prevent remount */
function FSection({
  id, label, active, open, onToggle, children,
}: {
  id: string; label: string; active: boolean;
  open: boolean; onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#F2F3F5] last:border-0">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <div className="flex items-center gap-2">
          {active && <span className="w-1.5 h-1.5 rounded-full bg-[#2355A7] flex-shrink-0" />}
          <span className={cn(
            'text-[12px] font-semibold transition-colors',
            active ? 'text-[#2355A7]' : 'text-[#3D4550] group-hover:text-[#2355A7]',
          )}>{label}</span>
        </div>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-[#A0A6B0] group-hover:text-[#2355A7] transition-colors flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-[#A0A6B0] group-hover:text-[#2355A7] transition-colors flex-shrink-0" />}
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

/** Inline dropdown — expands in place, avoids overflow-clip issues */
function FDropdown({
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
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full h-9 px-3 rounded-xl border flex items-center justify-between gap-2 transition-all',
          open
            ? 'bg-white border-[#2355A7] ring-2 ring-[#BED4F6]/30'
            : has
              ? 'bg-[#EEF2FC] border-[#BED4F6] hover:border-[#2355A7]'
              : 'bg-[#F6F7F9] border-[#E4E6EA] hover:bg-white hover:border-[#C8CBD0]',
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {has ? (
            <>
              <span className="w-[18px] h-[18px] rounded-full bg-[#2355A7] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 leading-none">
                {selectedCount}
              </span>
              <span className="text-[12px] font-medium text-[#2355A7] truncate">{selectedCount} selected</span>
            </>
          ) : (
            <span className="text-[12px] text-[#8B9299]">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {has && onClear && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onClear(); }}
              className="w-4 h-4 rounded-full bg-[#BED4F6]/60 text-[#2355A7] flex items-center justify-center text-[11px] leading-none hover:bg-[#2355A7] hover:text-white transition-colors cursor-pointer select-none"
            >×</span>
          )}
          <ChevronDown className={cn('w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150',
            open ? 'rotate-180 text-[#2355A7]' : 'text-[#A0A6B0]',
          )} />
        </div>
      </button>

      {/* Expanded list */}
      {open && (
        <div className="mt-1.5 rounded-xl border border-[#EDEEF1] bg-white overflow-hidden shadow-[0_4px_20px_rgba(35,85,167,0.10)]">
          <div className="max-h-[196px] overflow-y-auto p-1.5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/** Option row inside FDropdown */
function FDropdownOption({
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
        checked ? 'bg-[#EEF2FC]' : 'hover:bg-[#F6F7F9]',
      )}
    >
      {/* Checkbox */}
      <span className={cn(
        'w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-all',
        checked ? 'bg-[#2355A7] border-[#2355A7]' : 'bg-white border-[#D5D8DE]',
      )}>
        {checked && (
          <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {/* Avatar (optional) */}
      {avatar && (
        <span className="w-5 h-5 rounded-full bg-[#2355A7] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 leading-none">
          {avatar}
        </span>
      )}
      {/* Label */}
      <div className="min-w-0">
        <p className={cn('text-[12px] leading-tight', checked ? 'text-[#2355A7] font-medium' : 'text-[#3D4550]')}>{children}</p>
        {sublabel && <p className="text-[10px] text-[#A0A6B0] mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}

/* ─── Main FilterPanel ─── */
function FilterPanel({ filters, onChange, count, onReset, onClose }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  count: number;
  onReset: () => void;
  onClose: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(['assignment', 'contact', 'activity', 'language', 'travel', 'status', 'visits', 'finance', 'rating', 'tags'])
  );

  /* ── Preserve scroll position across re-renders ── */
  const scrollRef  = useRef<HTMLDivElement>(null);
  const savedScroll = useRef(0);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = savedScroll.current;
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    savedScroll.current = (e.currentTarget).scrollTop;
  };

  const toggleGroup = (id: string) =>
    setOpenGroups(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const multi = (field: 'languages' | 'travelWith' | 'clientStatus' | 'tags', val: string) => {
    const arr = filters[field] as string[];
    onChange({ ...filters, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };

  const bool = (field: keyof Filters, val: boolean) => {
    onChange({ ...filters, [field]: (filters[field] as boolean | null) === val ? null : val });
  };

  const activeCount = countFilters(filters);

  /* helpers for per-section active state */
  const sActive = {
    assignment: !!filters.assignedUserId,
    contact:    filters.hasPhone !== null || filters.hasEmail !== null,
    activity:   filters.hasSequence !== null || filters.hasReservation !== null || filters.hasCalls !== null || filters.hasComplaints !== null,
    language:   filters.languages.length > 0,
    travel:     filters.travelWith.length > 0,
    status:     filters.clientStatus.length > 0,
    visits:     !!(filters.visitFrom || filters.visitTo),
    finance:    !!(filters.spendMin || filters.spendMax),
    rating:     filters.ratingMin > 0,
    tags:       filters.tags.length > 0,
  };

  const S = (id: keyof typeof sActive, label: string, children: React.ReactNode) => (
    <FSection
      id={id} label={label}
      active={sActive[id]}
      open={openGroups.has(id)}
      onToggle={toggleGroup}
    >{children}</FSection>
  );


  return (
    <div className="w-[252px] flex-shrink-0 border-r border-[#EDEEF1] flex flex-col overflow-hidden bg-white">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-[#EDEEF1] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[32px] font-bold text-[#3D4550] leading-none tabular-nums"
              style={{ fontFamily: "'Azeret Mono', monospace" }}
            >{count}</span>
            <span className="text-[13px] text-[#8B9299] font-medium">guests</span>
          </div>
          <button
            onClick={onClose}
            title="Hide filters"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8B9299] hover:bg-[#F0F1F3] hover:text-[#5C6370] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {activeCount > 0 ? (
          <div className="flex items-center justify-between bg-[#EEF2FC] rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#2355A7] text-white text-[9px] font-bold flex items-center justify-center leading-none flex-shrink-0">{activeCount}</span>
              <span className="text-[11px] text-[#2355A7] font-medium">{activeCount === 1 ? '1 filter' : `${activeCount} filters`} applied</span>
            </div>
            <button onClick={onReset} className="text-[11px] font-semibold text-[#2355A7] hover:underline">Reset</button>
          </div>
        ) : (
          <p className="text-[11px] text-[#C4C8CF]">No filters applied</p>
        )}
      </div>

      {/* ── Scrollable filters ── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-1">

        {S('assignment', 'Assigned to',
          <FDropdown
            placeholder="Any manager"
            selectedCount={filters.assignedUserId ? 1 : 0}
            onClear={() => onChange({ ...filters, assignedUserId: '' })}
          >
            {mockUsers.map(u => {
              const initials = u.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
              return (
                <FDropdownOption
                  key={u.id}
                  checked={filters.assignedUserId === u.id}
                  onClick={() => onChange({ ...filters, assignedUserId: filters.assignedUserId === u.id ? '' : u.id })}
                  avatar={initials}
                  sublabel={u.department}
                >
                  {u.name}
                </FDropdownOption>
              );
            })}
          </FDropdown>
        )}

        {S('contact', 'Contact info',
          <div className="space-y-0.5">
            <FCheck checked={filters.hasPhone === true}  onClick={() => bool('hasPhone', true)}>Has phone number</FCheck>
            <FCheck checked={filters.hasEmail === true}  onClick={() => bool('hasEmail', true)}>Has email address</FCheck>
          </div>
        )}

        {S('activity', 'Activity',
          <div className="space-y-0.5">
            <FCheck checked={filters.hasSequence   === true} onClick={() => bool('hasSequence', true)}>Active sequence</FCheck>
            <FCheck checked={filters.hasReservation === true} onClick={() => bool('hasReservation', true)}>Active reservation</FCheck>
            <FCheck checked={filters.hasCalls      === true} onClick={() => bool('hasCalls', true)}>Has calls</FCheck>
            <FCheck checked={filters.hasComplaints === true} onClick={() => bool('hasComplaints', true)}>Has complaints</FCheck>
            <div className="pt-1.5">
              <p className="text-[10px] text-[#A0A6B0] mb-1.5">Website activity after</p>
              <input type="date"
                className="w-full h-8 px-2.5 rounded-lg border border-[#E4E6EA] bg-[#F9F9F9] text-[11px] text-[#3D4550] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition-colors"
              />
            </div>
          </div>
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
              >
                {lbl}
              </FDropdownOption>
            ))}
          </FDropdown>
        )}

        {S('travel', 'Travels with',
          <div className="flex flex-wrap gap-1.5">
            {[['solo','Solo'],['couple','Couple'],['kids','With kids'],['group','Large group']].map(([v, l]) => (
              <FChip key={v} active={filters.travelWith.includes(v)} onClick={() => multi('travelWith', v)}>{l}</FChip>
            ))}
          </div>
        )}

        {S('status', 'Client status',
          <div className="flex flex-wrap gap-1.5">
            {[['new','New'],['returning','Returning'],['vip','VIP'],['lost','Lost']].map(([v, l]) => (
              <FChip key={v} active={filters.clientStatus.includes(v)} onClick={() => multi('clientStatus', v)}>{l}</FChip>
            ))}
          </div>
        )}

        {S('visits', 'Past visits',
          <div className="grid grid-cols-2 gap-2">
            {[['From','visitFrom'],['To','visitTo']].map(([lbl, field]) => (
              <div key={field}>
                <p className="text-[10px] text-[#A0A6B0] mb-1.5">{lbl}</p>
                <input type="date"
                  value={filters[field as 'visitFrom'|'visitTo']}
                  onChange={e => onChange({ ...filters, [field]: e.target.value })}
                  className="w-full h-8 px-2 rounded-lg border border-[#E4E6EA] bg-[#F9F9F9] text-[10px] text-[#3D4550] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition-colors"
                />
              </div>
            ))}
          </div>
        )}

        {S('finance', 'Total spend (€)',
          <div className="grid grid-cols-2 gap-2">
            {[['Min','spendMin','0'],['Max','spendMax','∞']].map(([lbl, field, ph]) => (
              <div key={field}>
                <p className="text-[10px] text-[#A0A6B0] mb-1.5">{lbl}</p>
                <input type="number" placeholder={ph}
                  value={filters[field as 'spendMin'|'spendMax']}
                  onChange={e => onChange({ ...filters, [field]: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-lg border border-[#E4E6EA] bg-[#F9F9F9] text-[12px] text-[#3D4550] placeholder:text-[#C4C8CF] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition-colors"
                />
              </div>
            ))}
          </div>
        )}

        {S('rating', 'Guest rating',
          <div>
            <p className="text-[10px] text-[#A0A6B0] mb-2">Minimum score</p>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => onChange({ ...filters, ratingMin: filters.ratingMin === s ? 0 : s })} className="p-0.5">
                  <Star className={cn('w-[22px] h-[22px] transition-all',
                    s <= filters.ratingMin ? 'fill-[#2355A7] text-[#2355A7]' : 'fill-transparent text-[#D5D8DE] hover:text-[#BED4F6]',
                  )} />
                </button>
              ))}
              {filters.ratingMin > 0 && (
                <span className="text-[11px] text-[#2355A7] font-semibold ml-1.5">≥ {filters.ratingMin}</span>
              )}
            </div>
          </div>
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
              >
                {t}
              </FDropdownOption>
            ))}
          </FDropdown>
        )}

        <div className="h-5" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GUEST DETAIL PANEL
═══════════════════════════════════════════════ */
function GuestDetailPanel({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const reservations = mockReservations.filter(r => r.guestId === guest.id);
  const conversations = mockConversations.filter(c => c.guestId === guest.id);
  const assignedUser = mockUsers.find(u => u.id === GUEST_ASSIGNMENTS[guest.id]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'stays',    label: 'Stays'    },
    { id: 'messages', label: 'Messages' },
    { id: 'revenue',  label: 'Revenue'  },
  ];

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-[#EDEEF1] bg-white flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-0 border-b border-[#EDEEF1] flex-shrink-0">
        <div className="flex items-start gap-3 mb-4">
          <Avatar name={guest.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <h2 className="text-[14px] font-semibold text-[#3D4550]">{guest.name}</h2>
              {guest.tags.includes('VIP') && (
                <span className="text-[9px] font-bold text-[#2355A7] bg-[#EEF2FC] px-1.5 py-0.5 rounded tracking-wider">VIP</span>
              )}
            </div>
            <p className="text-[11px] text-[#8B9299]">{guest.nationality} · {LANG_LABELS[guest.language] ?? guest.language.toUpperCase()}</p>
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {guest.tags.filter(t => t !== 'VIP').slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] text-[#5C6370] bg-[#F6F7F9] border border-[#EDEEF1] px-2 py-0.5 rounded-md">{tag}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-[#8B9299] hover:bg-[#F6F7F9] hover:text-[#5C6370] transition-colors text-[16px] leading-none">×</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Visits', value: String(guest.totalVisits), mono: true, blue: true },
            { label: 'LTV',    value: formatCurrency(guest.lifetimeValue), mono: true, blue: true },
            { label: 'Rating', value: null, stars: guest.satisfactionScore },
          ].map((s, i) => (
            <div key={i} className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-2.5 text-center">
              <p className="text-[9px] text-[#8B9299] uppercase tracking-wider mb-1">{s.label}</p>
              {s.stars !== undefined ? (
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={cn('w-2.5 h-2.5', i <= (s.stars ?? 0) ? 'fill-[#2355A7] text-[#2355A7]' : 'fill-transparent text-[#D1CFCF]')} />
                  ))}
                </div>
              ) : (
                <p className={cn('text-[13px] font-semibold tabular-nums', s.blue ? 'text-[#2355A7]' : 'text-[#3D4550]')} style={s.mono ? { fontFamily: "'Azeret Mono', monospace" } : {}}>{s.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="space-y-1.5 pb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#C4C8CF] flex-shrink-0" />
            <span className="text-[12px] text-[#5C6370] truncate">{guest.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#C4C8CF] flex-shrink-0" />
            <span className="text-[12px] text-[#5C6370]">{guest.phone}</span>
          </div>
          {assignedUser && (
            <div className="flex items-center gap-2">
              <Avatar name={assignedUser.name} size="xs" />
              <span className="text-[12px] text-[#5C6370]">{assignedUser.name}</span>
              <span className="text-[10px] text-[#8B9299]">· {assignedUser.department}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex -mx-5 px-5 border-t border-[#EDEEF1]">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn(
                'px-3 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-colors',
                activeTab === t.id ? 'text-[#2355A7] border-[#2355A7]' : 'text-[#8B9299] border-transparent hover:text-[#3D4550]',
              )}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {activeTab === 'overview' && (
          <>
            {guest.satisfactionScore && (
              <div>
                <p className="text-[10px] font-semibold text-[#2355A7] uppercase tracking-wider mb-2">Satisfaction</p>
                <div className="flex gap-1 items-center">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={cn('w-4 h-4', i <= (guest.satisfactionScore ?? 0) ? 'fill-[#2355A7] text-[#2355A7]' : 'fill-transparent text-[#D1CFCF]')} />
                  ))}
                  <span className="text-[12px] font-semibold text-[#3D4550] ml-1">{guest.satisfactionScore}/5</span>
                </div>
              </div>
            )}
            {guest.notes && (
              <div>
                <p className="text-[10px] font-semibold text-[#2355A7] uppercase tracking-wider mb-1.5">Notes</p>
                <p className="text-[12px] text-[#5C6370] leading-relaxed bg-[#F9F9F9] rounded-xl p-3 border border-[#EDEEF1]">{guest.notes}</p>
              </div>
            )}
            {guest.companions.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#2355A7] uppercase tracking-wider mb-2">Travel party</p>
                <div className="space-y-1.5">
                  {guest.companions.map(c => (
                    <div key={c} className="flex items-center gap-2">
                      <Avatar name={c} size="xs" />
                      <span className="text-[12px] text-[#5C6370]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold text-[#2355A7] uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {guest.tags.map(tag => (
                  <span key={tag} className={cn('text-[11px] font-medium px-2.5 py-1 rounded-md', tag === 'VIP' ? 'bg-[#EEF2FC] text-[#2355A7]' : 'bg-[#F6F7F9] text-[#5C6370] border border-[#EDEEF1]')}>{tag}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'stays' && (
          <div className="space-y-2.5">
            {reservations.length === 0 ? (
              <p className="text-[13px] text-[#8B9299] py-4 text-center">No reservations found.</p>
            ) : reservations.map(res => (
              <div key={res.id} className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#3D4550]">{res.roomType}</span>
                  <span className="text-[10px] font-medium text-[#2355A7] bg-[#EEF2FC] px-2 py-0.5 rounded-md capitalize">{res.status.replace('_', ' ')}</span>
                </div>
                <p className="text-[10px] text-[#8B9299] font-mono">{res.bookingRef}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[['Check-in', formatDate(res.checkIn)], ['Check-out', formatDate(res.checkOut)], ['Room', `#${res.roomNumber}`], ['Total', formatCurrency(res.totalAmount)]].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-[10px] text-[#8B9299]">{l}</p>
                      <p className={cn('text-[12px] font-medium', l === 'Total' ? 'text-[#2355A7]' : 'text-[#3D4550]')}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="text-[13px] text-[#8B9299] py-4 text-center">No conversations found.</p>
            ) : conversations.map(conv => (
              <div key={conv.id} className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <ChannelIcon channel={conv.channel} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#3D4550] truncate">{conv.lastMessage}</p>
                    <p className="text-[10px] text-[#8B9299] mt-0.5">{formatDateTime(conv.lastMessageAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-3">
            <div className="p-4 bg-[#EEF2FC] rounded-xl">
              <p className="text-[10px] font-semibold text-[#2355A7] uppercase tracking-wider mb-1">Lifetime Value</p>
              <p className="text-[24px] font-semibold text-[#2355A7] tabular-nums" style={{ fontFamily: "'Azeret Mono', monospace" }}>{formatCurrency(guest.lifetimeValue)}</p>
              <p className="text-[11px] text-[#5C6370] mt-0.5">{guest.totalVisits} visits · avg {formatCurrency(guest.totalVisits > 0 ? Math.round(guest.lifetimeValue / guest.totalVisits) : 0)} / stay</p>
            </div>
            <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl overflow-hidden">
              {[
                { label: 'Room Revenue',      pct: 0.72 },
                { label: 'F&B',               pct: 0.15 },
                { label: 'Spa & Experiences', pct: 0.09 },
                { label: 'Upsells',           pct: 0.04 },
              ].map((item, i, arr) => (
                <div key={item.label} className={cn('flex justify-between items-center px-4 py-2.5', i < arr.length - 1 && 'border-b border-[#EDEEF1]')}>
                  <span className="text-[12px] text-[#5C6370]">{item.label}</span>
                  <span className="text-[12px] font-semibold text-[#3D4550]">{formatCurrency(Math.round(guest.lifetimeValue * item.pct))}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export function GuestsPage() {
  const { addToast } = useApp();
  const [filtersOpen, setFiltersOpen]   = useState(true);
  const [filters, setFilters]           = useState<Filters>(DEFAULT_FILTERS);
  const [search, setSearch]             = useState('');
  const [sortCol, setSortCol]           = useState<ColId>('lastContact');
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('desc');
  const [visibleCols, setVisibleCols]   = useState<Set<ColId>>(new Set(ALL_COLS.map(c => c.id)));
  const [colsMenuOpen, setColsMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const filtered = useMemo(() => applyFilters(mockGuests, filters, search), [filters, search]);

  const sorted = useMemo(() => {
    const col = ALL_COLS.find(c => c.id === sortCol);
    if (!col?.sortKey) return filtered;
    const key = col.sortKey;
    return [...filtered].sort((a, b) => {
      const av = a[key]; const bv = b[key];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const toggleSort = (col: ColId) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () =>
    setSelectedIds(selectedIds.size === sorted.length && sorted.length > 0 ? new Set() : new Set(sorted.map(g => g.id)));

  const shownCols = ALL_COLS.filter(c => visibleCols.has(c.id));
  const activeFilterCount = countFilters(filters);

  /* Sort icon */
  const SortIco = ({ col }: { col: ColId }) => {
    if (sortCol !== col) return <ChevronDown className="w-3 h-3 text-[#D1CFCF] opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#2355A7]" /> : <ChevronDown className="w-3 h-3 text-[#2355A7]" />;
  };

  /* Cell renderer */
  const renderCell = (colId: ColId, guest: Guest) => {
    const userId = GUEST_ASSIGNMENTS[guest.id];
    const user   = mockUsers.find(u => u.id === userId);

    switch (colId) {
      case 'name': return (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={guest.name} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-medium text-[#3D4550] truncate">{guest.name}</p>
              {guest.tags.includes('VIP') && (
                <span className="text-[8px] font-bold text-[#2355A7] bg-[#EEF2FC] px-1.5 py-0.5 rounded tracking-wider flex-shrink-0">VIP</span>
              )}
            </div>
          </div>
        </div>
      );
      case 'email': return (
        <span className="text-[12px] text-[#5C6370] truncate max-w-[180px] block">{guest.email}</span>
      );
      case 'phone': return (
        <span className="text-[12px] text-[#5C6370] whitespace-nowrap">{guest.phone}</span>
      );
      case 'assignedTo': return user ? (
        <div className="flex items-center gap-2">
          <Avatar name={user.name} size="xs" />
          <div>
            <p className="text-[12px] text-[#5C6370] whitespace-nowrap">{user.name.split(' ')[0]}</p>
            <p className="text-[10px] text-[#8B9299]">{user.department}</p>
          </div>
        </div>
      ) : <span className="text-[#D1CFCF] text-[12px]">—</span>;
      case 'lastContact': return (
        <span className="text-[12px] text-[#5C6370] whitespace-nowrap">{formatDateTime(guest.lastInquiryAt)}</span>
      );
      case 'lastStay': return guest.lastStayAt
        ? <span className="text-[12px] text-[#5C6370] whitespace-nowrap">{formatDate(guest.lastStayAt)}</span>
        : <span className="text-[#D1CFCF] text-[12px]">—</span>;
      case 'nextStay': return guest.upcomingStayAt
        ? (
          <span className="inline-flex items-center text-[12px] font-medium text-[#2355A7] bg-[#EEF2FC] px-2 py-0.5 rounded-md whitespace-nowrap">
            {formatDate(guest.upcomingStayAt)}
          </span>
        )
        : <span className="text-[#D1CFCF] text-[12px]">—</span>;
      case 'visits': return (
        <span className="text-[13px] font-semibold text-[#3D4550] tabular-nums">{guest.totalVisits}</span>
      );
      case 'ltv': return (
        <span className="text-[13px] font-semibold text-[#2355A7] tabular-nums" style={{ fontFamily: "'Azeret Mono', monospace" }}>
          {formatCurrency(guest.lifetimeValue)}
        </span>
      );
      case 'language': return (
        <span className="text-[12px] text-[#5C6370]">{LANG_LABELS[guest.language] ?? guest.language.toUpperCase()}</span>
      );
      case 'source': return (
        <span className="inline-flex items-center text-[11px] font-medium text-[#5C6370] bg-[#F6F7F9] border border-[#EDEEF1] px-2 py-0.5 rounded-md whitespace-nowrap capitalize">
          {guest.source === 'booking.com' ? 'Booking.com' : guest.source.replace('_', ' ')}
        </span>
      );
    }
  };

  return (
    <div
      className="flex h-full overflow-hidden bg-white"
      onClick={() => { setColsMenuOpen(false); setActionMenuOpen(false); }}
    >
      {/* ── Filter Panel ── */}
      {filtersOpen && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          count={filtered.length}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Toolbar */}
        <div className="h-[52px] px-4 flex items-center gap-2 border-b border-[#EDEEF1] flex-shrink-0 bg-white">

          {/* Show filters button (when panel closed) */}
          {!filtersOpen && (
            <button
              onClick={e => { e.stopPropagation(); setFiltersOpen(true); }}
              className={cn(
                'h-8 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium border transition-colors',
                activeFilterCount > 0
                  ? 'bg-[#EEF2FC] text-[#2355A7] border-[#BED4F6]'
                  : 'bg-[#F6F7F9] text-[#5C6370] border-[#EDEEF1] hover:bg-white hover:border-[#D1CFCF]',
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#2355A7] text-white text-[9px] font-bold flex items-center justify-center leading-none">{activeFilterCount}</span>
              )}
            </button>
          )}

          {/* Search */}
          <div className="relative w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B9299] pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full h-8 pl-9 pr-3 rounded-lg border border-[#EDEEF1] bg-[#F6F7F9] text-[12px] text-[#3D4550] placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition"
            />
          </div>

          {selectedIds.size > 0 && (
            <span className="text-[12px] text-[#8B9299] whitespace-nowrap">{selectedIds.size} selected</span>
          )}

          {/* Right buttons */}
          <div className="ml-auto flex items-center gap-1.5">

            {/* Message / action */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setActionMenuOpen(v => !v)}
                disabled={selectedIds.size === 0}
                className={cn(
                  'h-8 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium border transition-colors',
                  selectedIds.size > 0
                    ? 'bg-[#EEF2FC] text-[#2355A7] border-[#BED4F6] hover:bg-[#E3EBFA]'
                    : 'bg-[#F6F7F9] text-[#C4C8CF] border-[#EDEEF1] cursor-not-allowed',
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message
                <ChevronDown className="w-3 h-3" />
              </button>
              {actionMenuOpen && selectedIds.size > 0 && (
                <div className="absolute right-0 top-full mt-1 w-[180px] bg-white border border-[#EDEEF1] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 p-1.5">
                  {['Send message', 'Send upsell', 'Add to sequence', 'Export selected'].map(action => (
                    <button key={action}
                      onClick={() => { addToast({ type: 'success', title: action }); setActionMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] text-[#3D4550] hover:bg-[#F6F7F9] transition-colors"
                    >{action}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Export */}
            <button
              onClick={() => addToast({ type: 'success', title: 'Export started' })}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium text-[#5C6370] bg-[#F6F7F9] border border-[#EDEEF1] hover:bg-white hover:border-[#D1CFCF] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {/* Column picker */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setColsMenuOpen(v => !v)}
                className={cn(
                  'h-8 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium border transition-colors',
                  colsMenuOpen
                    ? 'bg-[#EEF2FC] text-[#2355A7] border-[#BED4F6]'
                    : 'bg-[#F6F7F9] text-[#5C6370] border-[#EDEEF1] hover:bg-white hover:border-[#D1CFCF]',
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Columns
              </button>
              {colsMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-[190px] bg-white border border-[#EDEEF1] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 p-2">
                  <p className="text-[10px] font-semibold text-[#2355A7] uppercase tracking-[0.12em] px-1.5 mb-2">Visible columns</p>
                  {ALL_COLS.filter(c => c.id !== 'name').map(col => (
                    <button key={col.id}
                      onClick={() => setVisibleCols(prev => {
                        const n = new Set(prev);
                        n.has(col.id) ? n.delete(col.id) : n.add(col.id);
                        return n;
                      })}
                      className="w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg hover:bg-[#F6F7F9] text-[12px] text-[#3D4550] transition-colors"
                    >
                      <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors', visibleCols.has(col.id) ? 'bg-[#2355A7] border-[#2355A7]' : 'border-[#EDEEF1] bg-white')}>
                        {visibleCols.has(col.id) && <span className="text-white text-[9px] leading-none">✓</span>}
                      </div>
                      {col.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#EDEEF1]">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === sorted.length && sorted.length > 0}
                    onChange={toggleAll}
                    className="rounded border-[#EDEEF1] accent-[#2355A7]"
                  />
                </th>
                {shownCols.map(col => {
                  const sortable = !!col.sortKey;
                  const isActive = sortCol === col.id;
                  return (
                    <th
                      key={col.id}
                      onClick={sortable ? () => toggleSort(col.id) : undefined}
                      className={cn(
                        'px-4 py-3 text-left whitespace-nowrap group',
                        sortable ? 'cursor-pointer' : '',
                      )}
                    >
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors',
                        isActive ? 'text-[#2355A7]' : 'text-[#8B9299] group-hover:text-[#5C6370]',
                      )}>
                        {col.label}
                        {sortable && <SortIco col={col.id} />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={shownCols.length + 1} className="px-4 py-16 text-center">
                    <p className="text-[14px] text-[#8B9299] mb-2">No guests match the current filters</p>
                    <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-[12px] font-medium text-[#2355A7] hover:underline">Reset filters</button>
                  </td>
                </tr>
              ) : sorted.map((guest, idx) => (
                <tr
                  key={guest.id}
                  onClick={() => setSelectedGuest(selectedGuest?.id === guest.id ? null : guest)}
                  className={cn(
                    'cursor-pointer transition-colors border-b border-[#F4F5F7] last:border-0',
                    selectedGuest?.id === guest.id
                      ? 'bg-[#EEF2FC]'
                      : idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F9]' : 'bg-[#FAFAFA] hover:bg-[#F6F7F9]',
                  )}
                >
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(guest.id); }}>
                    <input type="checkbox" checked={selectedIds.has(guest.id)} onChange={() => {}} className="rounded border-[#EDEEF1] accent-[#2355A7]" />
                  </td>
                  {shownCols.map(col => (
                    <td key={col.id} className="px-4 py-3">{renderCell(col.id, guest)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="h-9 px-4 flex items-center justify-between border-t border-[#EDEEF1] flex-shrink-0 bg-white">
          <span className="text-[11px] text-[#8B9299]">
            <span className="font-medium text-[#3D4550]">{sorted.length}</span> of {mockGuests.length} guests
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[11px] font-medium text-[#2355A7] hover:underline flex items-center gap-1 transition-opacity"
            >
              <X className="w-3 h-3" />
              Clear {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* ── Guest detail panel ── */}
      {selectedGuest && (
        <GuestDetailPanel guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
      )}
    </div>
  );
}
