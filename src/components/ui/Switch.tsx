import { cn } from '../../utils';

type Size = 'sm' | 'md';

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: Size;
  disabled?: boolean;
  /** Override the active (checked) track color. Defaults to brand-blue. */
  activeColor?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Pixel-precise toggle switch.
 *
 * The whole geometry (track w/h, thumb w/h, padding, travel distance)
 * is expressed in **inline-style pixels** so it never depends on `rem`
 * — which is critical here because the project sets `html { font-size: 12px }`
 * in globals.css, breaking any switcher built on Tailwind's spacing scale.
 */
const SIZES: Record<Size, {
  trackW: number; trackH: number;
  thumbSize: number; pad: number;
}> = {
  sm: { trackW: 32, trackH: 18, thumbSize: 14, pad: 2 },
  md: { trackW: 40, trackH: 22, thumbSize: 18, pad: 2 },
};

const OFF_COLOR = '#D1CFCF';

export function Switch({
  checked, onChange, size = 'md', disabled,
  activeColor = '#2355A7', className, ariaLabel,
}: SwitchProps) {
  const { trackW, trackH, thumbSize, pad } = SIZES[size];
  const travel = trackW - thumbSize - pad * 2;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: trackW,
        height: trackH,
        background: checked ? activeColor : OFF_COLOR,
      }}
      className={cn(
        'relative rounded-full flex-shrink-0 cursor-pointer transition-colors',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      <span
        style={{
          width: thumbSize,
          height: thumbSize,
          top: pad,
          left: pad,
          transform: `translateX(${checked ? travel : 0}px)`,
          transition: 'transform 200ms ease',
        }}
        className="absolute rounded-full bg-white shadow-sm pointer-events-none block"
      />
    </button>
  );
}
