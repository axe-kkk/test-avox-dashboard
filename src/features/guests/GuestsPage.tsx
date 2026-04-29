import { useState, useMemo } from 'react';
import { mockGuests } from '../../data/mock/guests';
import type { Guest } from '../../types';
import { useApp } from '../../app/AppContext';

import { type Filters, DEFAULT_FILTERS, applyFilters, countFilters } from './lib/filters';
import { ALL_COLS, type ColId } from './lib/columns';

import { FilterPanel } from './components/FilterPanel';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { GuestsToolbar } from './components/GuestsToolbar';
import { GuestsTable } from './components/GuestsTable';
import { GuestDetailPanel } from './components/GuestDetailPanel';

export function GuestsPage() {
  const { addToast } = useApp();

  const [filtersOpen,   setFiltersOpen]   = useState(true);
  const [filters,       setFilters]       = useState<Filters>(DEFAULT_FILTERS);
  const [search,        setSearch]        = useState('');
  const [sortCol,       setSortCol]       = useState<ColId>('lastContact');
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('desc');
  const [visibleCols,   setVisibleCols]   = useState<Set<ColId>>(new Set(ALL_COLS.map(c => c.id)));
  const [colsMenuOpen,  setColsMenuOpen]  = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const filtered = useMemo(
    () => applyFilters(mockGuests, filters, search),
    [filters, search],
  );

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
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const toggleAll = () =>
    setSelectedIds(
      selectedIds.size === sorted.length && sorted.length > 0
        ? new Set()
        : new Set(sorted.map(g => g.id)),
    );

  const toggleCol = (id: ColId) =>
    setVisibleCols(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const activeFilterCount = countFilters(filters);

  return (
    <div
      className="flex h-full overflow-hidden bg-white"
      onClick={() => { setColsMenuOpen(false); setActionMenuOpen(false); }}
    >
      {filtersOpen && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          count={filtered.length}
          total={mockGuests.length}
          onReset={resetFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <GuestsToolbar
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen(v => !v)}
          activeFilterCount={activeFilterCount}
          search={search}
          onSearchChange={setSearch}
          selectedCount={selectedIds.size}
          actionMenuOpen={actionMenuOpen}
          onActionMenuToggle={() => setActionMenuOpen(v => !v)}
          onAction={label => { addToast({ type: 'success', title: label }); setActionMenuOpen(false); }}
          onExport={() => addToast({ type: 'success', title: 'Export started' })}
          colsMenuOpen={colsMenuOpen}
          onColsMenuToggle={() => setColsMenuOpen(v => !v)}
          visibleCols={visibleCols}
          onToggleCol={toggleCol}
        />

        <ActiveFilterChips
          filters={filters}
          onChange={setFilters}
          onResetAll={resetFilters}
        />

        <GuestsTable
          rows={sorted}
          totalCount={mockGuests.length}
          shownCols={Array.from(visibleCols)}
          sortCol={sortCol}
          sortDir={sortDir}
          onToggleSort={toggleSort}
          selectedIds={selectedIds}
          onToggleRow={toggleSelect}
          onToggleAll={toggleAll}
          selectedGuestId={selectedGuest?.id ?? null}
          onSelectGuest={g => setSelectedGuest(selectedGuest?.id === g.id ? null : g)}
          onResetFilters={resetFilters}
        />
      </div>

      {selectedGuest && (
        <GuestDetailPanel
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
        />
      )}
    </div>
  );
}
