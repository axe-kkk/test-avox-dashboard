import { cn } from '../../utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-[#F6F7F9] text-[#5C6370]',
  blue:    'bg-[#BED4F6] text-[#2355A7]',
  dark:    'bg-[#0E1013] text-white',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-md',
      size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-[12px]',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  );
}
