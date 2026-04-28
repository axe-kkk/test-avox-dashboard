import { cn } from '../../utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function Input({ label, error, leading, trailing, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.12em]">{label}</label>
      )}
      <div className="relative flex items-center">
        {leading && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#8B9299]">
            {leading}
          </div>
        )}
        <input
          className={cn(
            'w-full border border-[#EDEEF1] rounded-lg bg-white text-[12px] text-[#0E1013] placeholder:text-[#8B9299]',
            'focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:border-[#BED4F6] transition-all',
            leading ? 'pl-9' : 'pl-3',
            trailing ? 'pr-9' : 'pr-3',
            'py-2',
            error && 'border-[#0E1013] ring-0',
            props.disabled && 'opacity-60 bg-[#F9F9F9] cursor-not-allowed',
            className,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 flex items-center text-[#8B9299]">{trailing}</div>
        )}
      </div>
      {error && <p className="text-[10px] text-[#0E1013] font-semibold">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.12em]">{label}</label>}
      <select
        className={cn(
          'w-full border border-[#EDEEF1] rounded-lg bg-white text-[12px] text-[#0E1013] px-3 py-2',
          'focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:border-[#BED4F6] transition-all',
          props.disabled && 'opacity-60 bg-[#F9F9F9] cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
