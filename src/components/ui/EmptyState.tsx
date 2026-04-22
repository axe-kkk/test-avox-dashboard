import { cn } from '../../utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[#F6F7F9] border border-[#EDEEF1] flex items-center justify-center mb-4 text-[#8B9299]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#0E1013] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#5C6370] max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
