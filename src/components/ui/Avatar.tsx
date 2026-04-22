import { cn, getInitials } from '../../utils';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-[11px]',
  lg: 'w-10 h-10 text-[12px]',
};

// Brand-aligned palette — strict neutrals + single blue accent
const palettes = [
  'bg-[#BED4F6] text-[#2355A7]',
  'bg-[#F6F7F9] text-[#5C6370]',
  'bg-[#2355A7] text-white',
  'bg-[#D1CFCF] text-[#0E1013]',
  'bg-[#FFFFFF] text-[#0E1013] border border-[#EDEEF1]',
  'bg-[#F6F7F9] text-[#5C6370]',
  'bg-[#0E1013] text-white',
];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % palettes.length;
  return h;
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
