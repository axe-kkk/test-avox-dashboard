import { Mail, MessageSquare, Phone, Globe, AtSign, Hash } from 'lucide-react';
import type { ChannelType } from '../../types';
import { cn } from '../../utils';

interface ChannelIconProps {
  channel: ChannelType;
  size?: 'sm' | 'md';
  className?: string;
}

// All icons in the same neutral slate — no rainbow
export function ChannelIcon({ channel, size = 'sm', className }: ChannelIconProps) {
  const cls = cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4', 'text-[#8B9299]', className);

  const icons: Record<ChannelType, React.ReactNode> = {
    whatsapp:   <MessageSquare className={cls} />,
    messenger:  <MessageSquare className={cls} />,
    instagram:  <AtSign className={cls} />,
    email:      <Mail className={cls} />,
    sms:        <Phone className={cls} />,
    telegram:   <Hash className={cls} />,
    web_widget: <Globe className={cls} />,
    ota_email:  <Mail className={cls} />,
    viber:      <MessageSquare className={cls} />,
  };

  return <span className="inline-flex items-center justify-center">{icons[channel]}</span>;
}
