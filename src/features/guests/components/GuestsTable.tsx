import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn, formatDate, formatDateTime, formatCurrency } from '../../../utils';
import { Avatar } from '../../../components/ui/Avatar';
import { mockUsers } from '../../../data/mock/users';
import type { Guest } from '../../../types';
import { ALL_COLS, type ColId } from '../lib/columns';
import { GUEST_ASSIGNMENTS, LANG_LABELS } from '../lib/constants';

interface Props {
  rows: Guest[];
  totalCount: number;
  shownCols: ColId[];
  sortCol: ColId;
  sortDir: 'asc' | 'desc';
  onToggleSort: (col: ColId) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  selectedGuestId: string | null;
  onSelectGuest: (g: Guest) => void;
  onResetFilters: () => void;
}

function SortIco({
  col, sortCol, sortDir,
}: { col: ColId; sortCol: ColId; sortDir: 'asc' | 'desc' }) {
  if (sortCol !== col) return <ChevronDown className="w-3 h-3 text-faint opacity-0 group-hover:opacity-100 transition-opacity" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3 h-3 text-brand-blue" />
    : <ChevronDown className="w-3 h-3 text-brand-blue" />;
}

function renderCell(colId: ColId, guest: Guest) {
  const userId = GUEST_ASSIGNMENTS[guest.id];
  const user   = mockUsers.find(u => u.id === userId);

  switch (colId) {
    case 'name':
      return (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={guest.name} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[12px] font-medium text-strong truncate">{guest.name}</p>
              {guest.tags.includes('VIP') && (
                <span className="text-[9px] font-bold text-brand-blue bg-brand-blue-50 px-1.5 py-0.5 rounded tracking-wider flex-shrink-0">VIP</span>
              )}
            </div>
          </div>
        </div>
      );
    case 'email':
      return <span className="text-[12px] text-muted truncate max-w-[180px] block">{guest.email}</span>;
    case 'phone':
      return <span className="text-[12px] text-muted whitespace-nowrap">{guest.phone}</span>;
    case 'assignedTo':
      return user ? (
        <div className="flex items-center gap-2">
          <Avatar name={user.name} size="xs" />
          <div>
            <p className="text-[12px] text-muted whitespace-nowrap">{user.name.split(' ')[0]}</p>
            <p className="text-[10px] text-subtle">{user.department}</p>
          </div>
        </div>
      ) : <span className="text-faint text-[12px]">—</span>;
    case 'lastContact':
      return <span className="text-[12px] text-muted whitespace-nowrap">{formatDateTime(guest.lastInquiryAt)}</span>;
    case 'lastStay':
      return guest.lastStayAt
        ? <span className="text-[12px] text-muted whitespace-nowrap">{formatDate(guest.lastStayAt)}</span>
        : <span className="text-faint text-[12px]">—</span>;
    case 'nextStay':
      return guest.upcomingStayAt
        ? (
          <span className="inline-flex items-center text-[12px] font-medium text-brand-blue bg-brand-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap">
            {formatDate(guest.upcomingStayAt)}
          </span>
        )
        : <span className="text-faint text-[12px]">—</span>;
    case 'visits':
      return <span className="text-[12px] font-semibold text-strong tabular-nums">{guest.totalVisits}</span>;
    case 'ltv':
      return (
        <span
          className="text-[12px] font-semibold text-brand-blue tabular-nums"
        >{formatCurrency(guest.lifetimeValue)}</span>
      );
    case 'language':
      return <span className="text-[12px] text-muted">{LANG_LABELS[guest.language] ?? guest.language.toUpperCase()}</span>;
    case 'source':
      return (
        <span className="inline-flex items-center text-[11px] font-medium text-muted bg-surface-3 border border-brand-border px-2 py-0.5 rounded-md whitespace-nowrap capitalize">
          {guest.source === 'booking.com' ? 'Booking.com' : guest.source.replace('_', ' ')}
        </span>
      );
  }
}

export function GuestsTable({
  rows, totalCount, shownCols, sortCol, sortDir, onToggleSort,
  selectedIds, onToggleRow, onToggleAll,
  selectedGuestId, onSelectGuest, onResetFilters,
}: Props) {
  const cols = ALL_COLS.filter(c => shownCols.includes(c.id));

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-brand-border">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.size === rows.length && rows.length > 0}
                onChange={onToggleAll}
                className="rounded border-brand-border accent-[#2355A7]"
              />
            </th>
            {cols.map(col => {
              const sortable = !!col.sortKey;
              const isActive = sortCol === col.id;
              return (
                <th
                  key={col.id}
                  onClick={sortable ? () => onToggleSort(col.id) : undefined}
                  className={cn(
                    'px-4 py-3 text-left whitespace-nowrap group',
                    sortable ? 'cursor-pointer' : '',
                  )}
                >
                  <span className={cn(
                    'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors',
                    isActive ? 'text-brand-blue' : 'text-subtle group-hover:text-muted',
                  )}>
                    {col.label}
                    {sortable && <SortIco col={col.id} sortCol={sortCol} sortDir={sortDir} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length + 1} className="px-4 py-16 text-center">
                <p className="text-[13px] text-subtle mb-2">No guests match the current filters</p>
                <button
                  onClick={onResetFilters}
                  className="text-[12px] font-medium text-brand-blue hover:underline"
                >Reset filters</button>
              </td>
            </tr>
          ) : rows.map(guest => (
            <tr
              key={guest.id}
              onClick={() => onSelectGuest(guest)}
              className={cn(
                'cursor-pointer transition-colors border-b border-border-soft last:border-0',
                selectedGuestId === guest.id
                  ? 'bg-brand-blue-50'
                  : 'hover:bg-surface-3',
              )}
            >
              <td
                className="px-4 py-3"
                onClick={e => { e.stopPropagation(); onToggleRow(guest.id); }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(guest.id)}
                  onChange={() => {}}
                  className="rounded border-brand-border accent-[#2355A7]"
                />
              </td>
              {cols.map(col => (
                <td key={col.id} className="px-4 py-3">{renderCell(col.id, guest)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* tiny footer info */}
      {rows.length > 0 && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-subtle">
          Showing <span className="font-semibold text-strong">{rows.length}</span> of {totalCount}
        </div>
      )}
    </div>
  );
}
