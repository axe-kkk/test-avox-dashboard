import { type ReactNode } from 'react';
import { cn } from '../../../utils';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, action, className, children }: Props) {
  return (
    <div
      className={cn('bg-white rounded-2xl border border-brand-border', className)}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-strong leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-subtle mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

export const chartTooltipStyle = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #EDEEF1',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#3D4550',
    boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)',
  },
  cursor: { fill: '#F6F7F9' },
};

export const axisTick = { fontSize: 10, fill: '#8B9299' };
