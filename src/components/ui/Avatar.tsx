import { cn, getInitials } from '../../utils';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-sm',
};

const palettes = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-indigo-100 text-indigo-700',
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % palettes.length;
  return hash;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const palette = palettes[hashName(name)];
  return (
    <span className={cn(
      'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
      sizes[size],
      palette,
      className,
    )}>
      {getInitials(name)}
    </span>
  );
}
