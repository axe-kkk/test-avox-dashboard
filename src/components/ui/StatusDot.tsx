import { cn } from '../../utils';

type Status = 'active' | 'paused' | 'error' | 'warning' | 'connected' | 'disconnected' | 'pending' | 'training';

const colors: Record<Status, string> = {
  active: 'bg-emerald-500',
  connected: 'bg-emerald-500',
  paused: 'bg-amber-400',
  warning: 'bg-amber-400',
  pending: 'bg-amber-400',
  error: 'bg-rose-500',
  disconnected: 'bg-slate-300',
  training: 'bg-blue-400',
};

const pulse: Record<Status, boolean> = {
  active: true,
  connected: true,
  paused: false,
  warning: false,
  pending: true,
  error: false,
  disconnected: false,
  training: true,
};

const labels: Record<Status, string> = {
  active: 'Active',
  connected: 'Connected',
  paused: 'Paused',
  warning: 'Warning',
  pending: 'Pending',
  error: 'Error',
  disconnected: 'Disconnected',
  training: 'Training',
};

interface StatusDotProps {
  status: Status;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusDot({ status, showLabel = false, size = 'sm', className }: StatusDotProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn(
        'rounded-full flex-shrink-0',
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
        colors[status],
        pulse[status] && 'animate-pulse',
      )} />
      {showLabel && (
        <span className="text-xs font-medium text-slate-600">{labels[status]}</span>
      )}
    </span>
  );
}
