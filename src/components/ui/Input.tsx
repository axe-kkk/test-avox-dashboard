import { cn } from '../../utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function Input({ label, error, leading, trailing, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-700">{label}</label>
      )}
      <div className="relative flex items-center">
        {leading && (
          <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
            {leading}
          </div>
        )}
        <input
          className={cn(
            'w-full border border-slate-200 rounded-lg bg-white text-sm text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300',
            'transition-colors',
            leading ? 'pl-9' : 'pl-3',
            trailing ? 'pr-9' : 'pr-3',
            'py-2',
            error && 'border-rose-400 focus:ring-rose-300',
            className,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 flex items-center text-slate-400">
            {trailing}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-700">{label}</label>}
      <select
        className={cn(
          'w-full border border-slate-200 rounded-lg bg-white text-sm text-slate-900 px-3 py-2',
          'focus:outline-none focus:ring-2 focus:ring-slate-300',
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
