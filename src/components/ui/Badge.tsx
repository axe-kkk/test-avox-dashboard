import { cn } from '../../utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
  purple: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  );
}
