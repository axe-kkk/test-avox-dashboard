import type { ChannelType } from '../../types';
import { cn } from '../../utils';

interface ChannelIconProps {
  channel: ChannelType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function BrandIcon({ channel, className }: { channel: ChannelType; className: string }) {
  const common = {
    className,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
  } as const;

  // Monochrome, recognisable marks. No brand colors.
  switch (channel) {
    case 'instagram':
      return (
        <svg {...common} aria-label="Instagram">
          <rect x="6.25" y="6.25" width="11.5" height="11.5" rx="3" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="15.9" cy="8.25" r="0.8" fill="currentColor" />
        </svg>
      );

    case 'messenger':
      // Facebook (as label): simplified "f" mark
      return (
        <svg {...common} aria-label="Facebook">
          <path
            d="M13.3 20v-6.2h2.1l.3-2.4h-2.4V9.9c0-.7.2-1.2 1.2-1.2h1.3V6.6c-.2 0-1 0-2 0-2 0-3.4 1.2-3.4 3.5v1.3H8.2v2.4h2.2V20h2.9Z"
            fill="currentColor"
          />
        </svg>
      );

    case 'whatsapp':
      // Chat bubble + handset
      return (
        <svg {...common} aria-label="WhatsApp">
          <path
            d="M12 20.2c-1.5 0-3-.4-4.2-1.1l-2.8.8.9-2.6A7.4 7.4 0 0 1 4.6 13c0-4.1 3.3-7.4 7.4-7.4s7.4 3.3 7.4 7.4-3.3 7.4-7.4 7.4Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M10 9.6c.3-.3.6-.3.9 0l.7.9c.2.3.2.6 0 .8l-.4.5c.5.9 1.2 1.6 2.1 2.1l.5-.4c.2-.2.5-.2.8 0l.9.7c.3.2.3.6 0 .9-.6.7-1.4 1-2.3.8-2.5-.6-4.6-2.7-5.2-5.2-.2-.9.1-1.7.8-2.3Z"
            fill="currentColor"
          />
        </svg>
      );

    case 'email':
    case 'ota_email':
      return (
        <svg {...common} aria-label="Email">
          <path
            d="M6.5 8.2h11c.8 0 1.5.7 1.5 1.5v8.2c0 .8-.7 1.5-1.5 1.5h-11c-.8 0-1.5-.7-1.5-1.5V9.7c0-.8.7-1.5 1.5-1.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M6.8 9.4 12 13.1l5.2-3.7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'telegram':
      return (
        <svg {...common} aria-label="Telegram">
          <path
            d="M19.4 6.3 5.9 11.7c-.8.3-.8 1.4.1 1.6l3.7 1 1.4 4.2c.2.7 1.1.8 1.5.3l2.1-2.4 3.9 2.9c.6.4 1.4.1 1.5-.6l2-11c.2-.9-.7-1.7-1.7-1.3Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9.6 14.3 18.2 8.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'sms':
      return (
        <svg {...common} aria-label="SMS">
          <path
            d="M7.2 7.6h9.6c1 0 1.8.8 1.8 1.8v5.8c0 1-.8 1.8-1.8 1.8H11l-3.3 2.3v-2.3H7.2c-1 0-1.8-.8-1.8-1.8V9.4c0-1 .8-1.8 1.8-1.8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M8.4 11.2h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M8.4 13.8h4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case 'web_widget':
      return (
        <svg {...common} aria-label="Web widget">
          <path
            d="M6.4 7.4h11.2c.9 0 1.6.7 1.6 1.6v6.8c0 .9-.7 1.6-1.6 1.6H6.4c-.9 0-1.6-.7-1.6-1.6V9c0-.9.7-1.6 1.6-1.6Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M4.8 10h14.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case 'viber':
    default:
      return (
        <svg {...common} aria-label="Chat">
          <path
            d="M7.2 7.6h9.6c1 0 1.8.8 1.8 1.8v5.8c0 1-.8 1.8-1.8 1.8H11l-3.3 2.3v-2.3H7.2c-1 0-1.8-.8-1.8-1.8V9.4c0-1 .8-1.8 1.8-1.8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function ChannelIcon({ channel, size = 'sm', className }: ChannelIconProps) {
  const cls = cn(
    size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6',
    'text-[#8B9299]',
    className,
  );

  return (
    <span className="inline-flex items-center justify-center">
      <BrandIcon channel={channel} className={cls} />
    </span>
  );
}
