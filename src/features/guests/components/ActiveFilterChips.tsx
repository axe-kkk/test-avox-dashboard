import { X } from 'lucide-react';
import { mockUsers } from '../../../data/mock/users';
import type { Filters } from '../lib/filters';
import { LANG_LABELS } from '../lib/constants';

interface Chip { id: string; label: string; clear: () => void }

function buildChips(filters: Filters, set: (next: Filters) => void): Chip[] {
  const out: Chip[] = [];

  if (filters.assignedUserId) {
    const u = mockUsers.find(x => x.id === filters.assignedUserId);
    out.push({
      id: 'assignedUserId',
      label: `Manager: ${u?.name ?? filters.assignedUserId}`,
      clear: () => set({ ...filters, assignedUserId: '' }),
    });
  }

  if (filters.clientStatus.length) {
    out.push({
      id: 'clientStatus',
      label: `Status: ${filters.clientStatus.join(', ')}`,
      clear: () => set({ ...filters, clientStatus: [] }),
    });
  }

  if (filters.hasPhone === true) {
    out.push({ id: 'hasPhone', label: 'Has phone', clear: () => set({ ...filters, hasPhone: null }) });
  }
  if (filters.hasEmail === true) {
    out.push({ id: 'hasEmail', label: 'Has email', clear: () => set({ ...filters, hasEmail: null }) });
  }

  if (filters.hasSequence === true) {
    out.push({ id: 'hasSequence', label: 'Active sequence', clear: () => set({ ...filters, hasSequence: null }) });
  }
  if (filters.hasReservation !== null) {
    out.push({
      id: 'hasReservation',
      label: filters.hasReservation ? 'Coming soon' : 'No reservation',
      clear: () => set({ ...filters, hasReservation: null }),
    });
  }
  if (filters.hasCalls === true) {
    out.push({ id: 'hasCalls', label: 'Has calls', clear: () => set({ ...filters, hasCalls: null }) });
  }
  if (filters.hasComplaints === true) {
    out.push({ id: 'hasComplaints', label: 'Has complaints', clear: () => set({ ...filters, hasComplaints: null }) });
  }

  if (filters.languages.length) {
    const names = filters.languages.map(c => LANG_LABELS[c] ?? c.toUpperCase());
    out.push({
      id: 'languages',
      label: `Lang: ${names.join(', ')}`,
      clear: () => set({ ...filters, languages: [] }),
    });
  }

  if (filters.travelWith.length) {
    out.push({
      id: 'travelWith',
      label: `Travels: ${filters.travelWith.join(', ')}`,
      clear: () => set({ ...filters, travelWith: [] }),
    });
  }

  if (filters.visitFrom || filters.visitTo) {
    const range = `${filters.visitFrom || '…'} → ${filters.visitTo || '…'}`;
    out.push({
      id: 'visits',
      label: `Visited: ${range}`,
      clear: () => set({ ...filters, visitFrom: '', visitTo: '' }),
    });
  }

  if (filters.spendMin || filters.spendMax) {
    const range = `${filters.spendMin || '0'} – ${filters.spendMax || '∞'} €`;
    out.push({
      id: 'finance',
      label: `Spend: ${range}`,
      clear: () => set({ ...filters, spendMin: '', spendMax: '' }),
    });
  }

  if (filters.ratingMin > 0) {
    out.push({
      id: 'ratingMin',
      label: `Rating ≥ ${filters.ratingMin}`,
      clear: () => set({ ...filters, ratingMin: 0 }),
    });
  }

  if (filters.tags.length) {
    out.push({
      id: 'tags',
      label: `Tags: ${filters.tags.join(', ')}`,
      clear: () => set({ ...filters, tags: [] }),
    });
  }

  return out;
}

export function ActiveFilterChips({
  filters, onChange, onResetAll,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onResetAll: () => void;
}) {
  const chips = buildChips(filters, onChange);
  if (!chips.length) return null;

  return (
    <div className="px-4 py-2 flex items-center gap-1.5 flex-wrap border-b border-border-soft bg-white">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle mr-1">Filters</span>
      {chips.map(c => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1 h-6 pl-2.5 pr-1 rounded-full bg-brand-blue-50 border border-brand-blue-light text-[11px] font-medium text-brand-blue max-w-[260px]"
        >
          <span className="truncate">{c.label}</span>
          <button
            onClick={c.clear}
            className="w-4 h-4 rounded-full hover:bg-brand-blue hover:text-white text-brand-blue flex items-center justify-center flex-shrink-0 transition-colors"
            title="Remove filter"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <button
        onClick={onResetAll}
        className="text-[11px] font-semibold text-subtle hover:text-brand-blue ml-1 transition-colors"
      >Clear all</button>
    </div>
  );
}
