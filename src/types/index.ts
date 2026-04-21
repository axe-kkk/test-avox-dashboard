export type Role = 'admin' | 'manager' | 'agent' | 'viewer';

export type EngineStatus = 'active' | 'paused' | 'error' | 'training';
export type ChannelType = 'whatsapp' | 'messenger' | 'instagram' | 'email' | 'sms' | 'telegram' | 'web_widget' | 'ota_email' | 'viber';
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'escalated' | 'ai_handled';
export type GuestStatus = 'checked_in' | 'checked_out' | 'upcoming' | 'vip' | 'flagged';
export type SatisfactionScore = 1 | 2 | 3 | 4 | 5;

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  defaultLanguage: string;
  starRating: number;
  roomCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department: string;
  joinedAt: string;
  lastActiveAt: string;
  notificationsEnabled: boolean;
  workingHours: { start: string; end: string; days: number[] };
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  language: string;
  nationality: string;
  source: 'direct' | 'booking.com' | 'expedia' | 'airbnb' | 'agoda' | 'walk_in' | 'referral';
  tags: string[];
  totalVisits: number;
  lifetimeValue: number;
  lastInquiryAt: string;
  lastStayAt: string | null;
  upcomingStayAt: string | null;
  satisfactionScore: SatisfactionScore | null;
  status: GuestStatus;
  notes: string;
  companions: string[];
  preferredChannel: ChannelType;
}

export interface Reservation {
  id: string;
  guestId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  roomNumber: string;
  rateCode: string;
  ratePerNight: number;
  totalAmount: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  specialRequests: string[];
  adults: number;
  children: number;
  channel: string;
  bookingRef: string;
}

export type EngineName =
  | 'Conversion'
  | 'Reservation'
  | 'Upsell'
  | 'Arrival'
  | 'Concierge'
  | 'Recovery'
  | 'Reputation';

export interface AIEngine {
  id: string;
  name: EngineName;
  status: EngineStatus;
  actionsToday: number;
  mainKpi: { label: string; value: string };
  description: string;
  lastError: string | null;
  handledConversations: number;
  resolutionRate: number;
  avgResponseTime: string;
  errorCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'guest' | 'agent' | 'ai' | 'system';
  senderName: string;
  content: string;
  channel: ChannelType;
  engineName?: EngineName;
  timestamp: string;
  isInternal: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  guestId: string;
  guestName: string;
  channel: ChannelType;
  engineName: EngineName | null;
  status: ConversationStatus;
  assignedTo: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SequenceStep {
  id: string;
  type: 'message' | 'wait' | 'condition' | 'action';
  channel?: ChannelType;
  template?: string;
  waitDuration?: string;
  condition?: string;
  actionType?: string;
  order: number;
}

export interface Sequence {
  id: string;
  name: string;
  engineId: string;
  engineName: EngineName;
  status: 'active' | 'paused' | 'draft';
  enrolledGuests: number;
  completionRate: number;
  lastLaunch: string;
  steps: SequenceStep[];
  trigger: string;
  tags: string[];
}

export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  status: 'connected' | 'disconnected' | 'warning' | 'pending';
  messagesLast30d: number;
  avgResponseTime: string;
  conversionRate: number;
  accountName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  engineName: EngineName;
  channel: ChannelType;
  guestName: string;
  action: string;
  result: string;
  urgency: 'low' | 'normal' | 'high';
  conversationId?: string;
  guestId?: string;
}

export interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  unit?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  secondary?: number;
}
