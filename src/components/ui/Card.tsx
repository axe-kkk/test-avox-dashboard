import { cn } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, padding = 'md', hover = false, onClick }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  return (
    <div
      className={cn(
        'bg-white',
        paddings[padding],
        hover && 'transition-all hover:shadow-card cursor-pointer',
        className,
      )}
      style={{
        border: '1px solid var(--color-brand-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-[13px] font-semibold text-[#0E1013]">{title}</h3>
        {subtitle && <p className="text-[12px] text-[#8B9299] mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
