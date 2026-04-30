import type { ChannelType, EngineName, ConversationStatus } from '../types';

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (diff < 0) return 'just now';
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  // Example: "22 Apr 2026, 14:32"
  const d = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const t = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${d}, ${t}`;
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export const channelLabels: Record<ChannelType, string> = {
  whatsapp: 'WhatsApp',
  messenger: 'Facebook',
  instagram: 'Instagram',
  email: 'Email',
  sms: 'SMS',
  telegram: 'Telegram',
  web_widget: 'Web Widget',
  ota_email: 'OTA Email',
  viber: 'Viber',
};

// All channels share a single neutral style — no rainbow
export const channelColors: Record<ChannelType, string> = {
  whatsapp:   'bg-[#F6F7F9] text-[#5C6370]',
  messenger:  'bg-[#F6F7F9] text-[#5C6370]',
  instagram:  'bg-[#F6F7F9] text-[#5C6370]',
  email:      'bg-[#F6F7F9] text-[#5C6370]',
  sms:        'bg-[#F6F7F9] text-[#5C6370]',
  telegram:   'bg-[#F6F7F9] text-[#5C6370]',
  web_widget: 'bg-[#F6F7F9] text-[#5C6370]',
  ota_email:  'bg-[#F6F7F9] text-[#5C6370]',
  viber:      'bg-[#F6F7F9] text-[#5C6370]',
};

// Engine tags — one subtle palette, differentiated only by text
export const engineColors: Record<EngineName, string> = {
  Conversion:  'bg-[#F6F7F9] text-[#0E1013]',
  Reservation: 'bg-[#F6F7F9] text-[#0E1013]',
  Upsell:      'bg-[#F6F7F9] text-[#0E1013]',
  Arrival:     'bg-[#F6F7F9] text-[#0E1013]',
  Concierge:   'bg-[#F6F7F9] text-[#0E1013]',
  Recovery:    'bg-[#F6F7F9] text-[#0E1013]',
  Reputation:  'bg-[#F6F7F9] text-[#0E1013]',
};

// Conversation status — brand colors only
export const statusColors: Record<ConversationStatus, string> = {
  open:       'bg-[#EEF2FC] text-[#2355A7]',
  pending:    'bg-[#F6F7F9] text-[#5C6370]',
  resolved:   'bg-[#F6F7F9] text-[#8B9299]',
  escalated:  'bg-[#0E1013] text-white',
  ai_handled: 'bg-[#F6F7F9] text-[#8B9299]',
};

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/* ─── Tag palette — shared between Inbox conv-rows and Guests filter ── */
export const TAG_PALETTE = [
  { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' }, // pink
  { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }, // amber
  { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' }, // blue
  { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' }, // green
  { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' }, // violet
  { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' }, // gray
] as const;

export function tagStyle(tag: string) {
  const t = tag.trim();
  const idx =
    Math.abs(Array.from(t).reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)) % TAG_PALETTE.length;
  return TAG_PALETTE[idx];
}
