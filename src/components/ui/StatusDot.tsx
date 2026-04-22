import { cn } from '../../utils';

type Status = 'active' | 'paused' | 'error' | 'warning' | 'connected' | 'disconnected' | 'pending' | 'training';

const colors: Record<Status, string> = {
  active:       'bg-[#2355A7]',
  connected:    'bg-[#2355A7]',
  training:     'bg-[#2355A7]',
  pending:      'bg-[#D1CFCF]',
  paused:       'bg-[#D1CFCF]',
  warning:      'bg-[#5C6370]',
  error:        'bg-[#0E1013]',
  disconnected: 'bg-[#D1CFCF]',
};

const shouldPulse: Record<Status, boolean> = {
  active: true, connected: true, training: true, pending: false,
  paused: false, warning: false, error: false, disconnected: false,
};

const labels: Record<Status, string> = {
  active: 'Active', connected: 'Connected', paused: 'Paused',
  warning: 'Warning', pending: 'Pending', error: 'Error',
  disconnected: 'Disconnected', training: 'Training',
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
        shouldPulse[status] && 'animate-pulse',
      )} />
      {showLabel && (
        <span className="text-[12px] font-medium text-[#5C6370]">{labels[status]}</span>
      )}
    </span>
  );
}
