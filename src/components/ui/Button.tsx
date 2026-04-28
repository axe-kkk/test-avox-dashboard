import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary:   'bg-[#2355A7] text-white hover:bg-[#1f4b93]',
  secondary: 'bg-[#EEF2FC] text-[#2355A7] hover:bg-[#E3EBFA]',
  ghost:     'bg-transparent text-[#5C6370] hover:bg-[#F6F7F9] hover:text-[#0E1013]',
  danger:    'bg-[#0E1013] text-white hover:bg-[#1a1f26]',
  outline:   'border border-[#EDEEF1] bg-white text-[#0E1013] hover:bg-[#F6F7F9]',
};

const sizes = {
  xs: 'px-2.5 py-1   text-[10px] rounded-lg  gap-1',
  sm: 'px-3   py-1.5 text-[12px] rounded-xl  gap-1.5',
  md: 'px-4   py-2   text-[12px] rounded-xl  gap-2',
  lg: 'px-5   py-2.5 text-[12px] rounded-xl  gap-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BED4F6]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
