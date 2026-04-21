import { Mail, MessageSquare, Phone, Globe, AtSign } from 'lucide-react';
import type { ChannelType } from '../../types';
import { cn } from '../../utils';

interface ChannelIconProps {
  channel: ChannelType;
  size?: 'sm' | 'md';
  className?: string;
}

export function ChannelIcon({ channel, size = 'sm', className }: ChannelIconProps) {
  const cls = cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4', className);

  const icons: Record<ChannelType, React.ReactNode> = {
    whatsapp: (
      <span className={cn('font-bold text-green-600 flex items-center justify-center', size === 'sm' ? 'text-[10px]' : 'text-xs')}>WA</span>
    ),
    messenger: <MessageSquare className={cn(cls, 'text-blue-600')} />,
    instagram: <AtSign className={cn(cls, 'text-pink-600')} />,
    email: <Mail className={cn(cls, 'text-indigo-600')} />,
    sms: <Phone className={cn(cls, 'text-purple-600')} />,
    telegram: (
      <span className={cn('font-bold text-sky-500 flex items-center justify-center', size === 'sm' ? 'text-[10px]' : 'text-xs')}>TG</span>
    ),
    web_widget: <Globe className={cn(cls, 'text-cyan-600')} />,
    ota_email: <Mail className={cn(cls, 'text-amber-600')} />,
    viber: <MessageSquare className={cn(cls, 'text-violet-600')} />,
  };

  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-md',
      size === 'sm' ? 'w-5 h-5' : 'w-6 h-6',
    )}>
      {icons[channel]}
    </span>
  );
}
