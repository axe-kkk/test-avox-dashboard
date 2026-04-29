import {
  Search, SlidersHorizontal, MessageSquare, Download, Settings2, ChevronDown,
} from 'lucide-react';
import { cn } from '../../../utils';
import { ALL_COLS, type ColId } from '../lib/columns';

interface Props {
  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  selectedCount: number;
  actionMenuOpen: boolean;
  onActionMenuToggle: () => void;
  onAction: (label: string) => void;
  onExport: () => void;
  colsMenuOpen: boolean;
  onColsMenuToggle: () => void;
  visibleCols: Set<ColId>;
  onToggleCol: (id: ColId) => void;
}

export function GuestsToolbar({
  filtersOpen, onToggleFilters, activeFilterCount,
  search, onSearchChange, selectedCount,
  actionMenuOpen, onActionMenuToggle, onAction, onExport,
  colsMenuOpen, onColsMenuToggle, visibleCols, onToggleCol,
}: Props) {
  return (
    <div className="h-[56px] px-4 flex items-center gap-2 border-b border-brand-border flex-shrink-0 bg-white">

      {!filtersOpen && (
        <button
          onClick={e => { e.stopPropagation(); onToggleFilters(); }}
          className={cn(
            'h-10 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium border transition-colors',
            activeFilterCount > 0
              ? 'bg-brand-blue text-white border-brand-blue'
              : 'bg-surface-3 text-muted border-brand-border hover:bg-white hover:border-faint',
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="min-w-[16px] h-4 px-1 rounded-full bg-white text-brand-blue text-[10px] font-medium flex items-center justify-center leading-none tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}

      {/* Search */}
      <div className="relative w-[260px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-brand-border bg-surface-3 text-[12px] text-muted placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
        />
      </div>

      {selectedCount > 0 && (
        <span className="text-[12px] text-subtle whitespace-nowrap">{selectedCount} selected</span>
      )}

      {/* Right buttons */}
      <div className="ml-auto flex items-center gap-1.5">

        {/* Message / action */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={onActionMenuToggle}
            disabled={selectedCount === 0}
            className={cn(
              'h-10 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium border transition-colors',
              actionMenuOpen && selectedCount > 0
                ? 'bg-brand-blue text-white border-brand-blue'
                : selectedCount > 0
                  ? 'bg-surface-3 text-muted border-brand-border hover:bg-white hover:border-faint'
                  : 'bg-surface-3 text-faint border-brand-border cursor-not-allowed',
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message
            <ChevronDown className="w-3 h-3" />
          </button>
          {actionMenuOpen && selectedCount > 0 && (
            <div className="absolute right-0 top-full mt-1 w-[180px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
              {['Send message', 'Send upsell', 'Add to sequence', 'Export selected'].map(a => (
                <button
                  key={a}
                  onClick={() => onAction(a)}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] text-muted hover:bg-surface-3 transition-colors"
                >{a}</button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <button
          onClick={onExport}
          className="h-10 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium text-muted bg-surface-3 border border-brand-border hover:bg-white hover:border-faint transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>

        {/* Columns */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={onColsMenuToggle}
            className={cn(
              'h-10 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium border transition-colors',
              colsMenuOpen
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-surface-3 text-muted border-brand-border hover:bg-white hover:border-faint',
            )}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Columns
          </button>
          {colsMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-[200px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
              <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Visible columns</p>
              {ALL_COLS.filter(c => c.id !== 'name').map(col => {
                const active = visibleCols.has(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => onToggleCol(col.id)}
                    className={cn(
                      'w-full px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors',
                      active ? 'bg-brand-blue-50 text-brand-blue' : 'text-muted hover:bg-surface-3',
                    )}
                  >
                    <span className="font-medium">{col.label}</span>
                    {active && <span className="text-brand-blue text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
