import { type ReactNode } from 'react';
import { DateRangePicker } from './DateRangePicker';
import type { Period } from '../lib/mockData';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
  rightSlot?: ReactNode;
  children: ReactNode;
}

export function AnalyticsShell({
  eyebrow, title, subtitle, period, onPeriodChange, rightSlot, children,
}: Props) {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em] mb-1.5">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[22px] font-semibold text-strong leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-muted mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightSlot}
          <DateRangePicker value={period} onChange={onPeriodChange} />
        </div>
      </div>
      {children}
    </div>
  );
}
