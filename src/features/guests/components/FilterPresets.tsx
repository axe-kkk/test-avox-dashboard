import { cn } from '../../../utils';
import { PRESETS } from '../lib/presets';
import type { Filters } from '../lib/filters';

export function FilterPresets({
  filters, onApply,
}: {
  filters: Filters;
  onApply: (next: Filters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map(p => {
        const active = p.isActive(filters);
        return (
          <button
            key={p.id}
            onClick={() => onApply(p.apply(filters))}
            className={cn(
              'inline-flex items-center h-7 px-2.5 rounded-lg text-[11px] font-semibold border transition-colors',
              active
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-surface-3 text-muted border-brand-border hover:bg-white hover:border-brand-blue-light hover:text-brand-blue',
            )}
            title={p.hint}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
