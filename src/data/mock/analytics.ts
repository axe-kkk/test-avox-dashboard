import type { ChartDataPoint } from '../../types';

export const conversationsTrend: ChartDataPoint[] = [
  { date: 'Apr 10', value: 124, secondary: 38 },
  { date: 'Apr 11', value: 142, secondary: 41 },
  { date: 'Apr 12', value: 98, secondary: 22 },
  { date: 'Apr 13', value: 87, secondary: 19 },
  { date: 'Apr 14', value: 156, secondary: 48 },
  { date: 'Apr 15', value: 178, secondary: 52 },
  { date: 'Apr 16', value: 193, secondary: 57 },
  { date: 'Apr 17', value: 167, secondary: 44 },
  { date: 'Apr 18', value: 145, secondary: 38 },
  { date: 'Apr 19', value: 139, secondary: 31 },
  { date: 'Apr 20', value: 184, secondary: 49 },
  { date: 'Apr 21', value: 92, secondary: 24 },
];

export const revenueTrend: ChartDataPoint[] = [
  { date: 'Apr 10', value: 4200, secondary: 840 },
  { date: 'Apr 11', value: 5800, secondary: 1120 },
  { date: 'Apr 12', value: 3100, secondary: 620 },
  { date: 'Apr 13', value: 2900, secondary: 580 },
  { date: 'Apr 14', value: 6400, secondary: 1840 },
  { date: 'Apr 15', value: 7200, secondary: 2100 },
  { date: 'Apr 16', value: 8100, secondary: 2640 },
  { date: 'Apr 17', value: 6900, secondary: 1980 },
  { date: 'Apr 18', value: 5600, secondary: 1540 },
  { date: 'Apr 19', value: 5100, secondary: 1320 },
  { date: 'Apr 20', value: 7800, secondary: 2280 },
  { date: 'Apr 21', value: 3840, secondary: 1180 },
];

export const channelVolume: { channel: string; volume: number; color: string }[] = [
  { channel: 'WhatsApp', volume: 1842, color: '#25D366' },
  { channel: 'Email', volume: 986, color: '#6366f1' },
  { channel: 'Messenger', volume: 412, color: '#0084FF' },
  { channel: 'Web Widget', volume: 534, color: '#0ea5e9' },
  { channel: 'SMS', volume: 643, color: '#8b5cf6' },
  { channel: 'Instagram', volume: 289, color: '#E1306C' },
  { channel: 'Telegram', volume: 178, color: '#2AABEE' },
  { channel: 'OTA Email', volume: 321, color: '#f59e0b' },
];

export const enginePerformance: {
  engine: string;
  actions: number;
  resolved: number;
  rate: number;
  revenue: number;
}[] = [
  { engine: 'Conversion', actions: 1842, resolved: 1621, rate: 88, revenue: 142800 },
  { engine: 'Reservation', actions: 986, resolved: 897, rate: 91, revenue: 0 },
  { engine: 'Upsell', actions: 644, resolved: 509, rate: 79, revenue: 84600 },
  { engine: 'Arrival', actions: 531, resolved: 499, rate: 94, revenue: 18400 },
  { engine: 'Concierge', actions: 2104, resolved: 1936, rate: 92, revenue: 6200 },
  { engine: 'Recovery', actions: 189, resolved: 134, rate: 71, revenue: -2400 },
  { engine: 'Reputation', actions: 412, resolved: 354, rate: 86, revenue: 0 },
];

export const satisfactionDistribution: { score: string; count: number }[] = [
  { score: '5 stars', count: 284 },
  { score: '4 stars', count: 142 },
  { score: '3 stars', count: 48 },
  { score: '2 stars', count: 18 },
  { score: '1 star', count: 6 },
];

export const guestSources: { source: string; count: number; ltv: number }[] = [
  { source: 'Direct', count: 412, ltv: 8400 },
  { source: 'Booking.com', count: 298, ltv: 4200 },
  { source: 'Expedia', count: 184, ltv: 3800 },
  { source: 'Airbnb', count: 89, ltv: 2900 },
  { source: 'Agoda', count: 67, ltv: 3100 },
  { source: 'Referral', count: 54, ltv: 6800 },
  { source: 'Walk-in', count: 31, ltv: 1200 },
];

export const summaryMetrics = {
  conversationsToday: 92,
  conversationsChange: +14,
  pendingEscalations: 3,
  escalationsChange: -1,
  aiBookingsHandled: 18,
  aiBookingsChange: +4,
  upsellRevenue: 3840,
  upsellRevenueChange: +620,
};
