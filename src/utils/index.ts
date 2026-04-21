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
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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
  messenger: 'Messenger',
  instagram: 'Instagram',
  email: 'Email',
  sms: 'SMS',
  telegram: 'Telegram',
  web_widget: 'Web Widget',
  ota_email: 'OTA Email',
  viber: 'Viber',
};

export const channelColors: Record<ChannelType, string> = {
  whatsapp: 'bg-green-100 text-green-700',
  messenger: 'bg-blue-100 text-blue-700',
  instagram: 'bg-pink-100 text-pink-700',
  email: 'bg-indigo-100 text-indigo-700',
  sms: 'bg-purple-100 text-purple-700',
  telegram: 'bg-sky-100 text-sky-700',
  web_widget: 'bg-cyan-100 text-cyan-700',
  ota_email: 'bg-amber-100 text-amber-700',
  viber: 'bg-violet-100 text-violet-700',
};

export const engineColors: Record<EngineName, string> = {
  Conversion: 'bg-emerald-100 text-emerald-700',
  Reservation: 'bg-blue-100 text-blue-700',
  Upsell: 'bg-amber-100 text-amber-700',
  Arrival: 'bg-sky-100 text-sky-700',
  Concierge: 'bg-violet-100 text-violet-700',
  Recovery: 'bg-rose-100 text-rose-700',
  Reputation: 'bg-indigo-100 text-indigo-700',
};

export const statusColors: Record<ConversationStatus, string> = {
  open: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  escalated: 'bg-rose-100 text-rose-700',
  ai_handled: 'bg-violet-100 text-violet-700',
};

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
