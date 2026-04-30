// Extended mock data for the Analytics module — TZ 7.x

import type { EngineName } from '../../../types';

export type Period = 'today' | '7d' | '30d' | '90d' | 'custom';

export const PERIOD_LABELS: Record<Period, string> = {
  today:  'Today',
  '7d':   'Last 7 days',
  '30d':  'Last 30 days',
  '90d':  'Last 90 days',
  custom: 'Custom range',
};

/* ── Engine identity ─────────────────────────────────────────── */
export const ENGINES: { name: EngineName; slug: string }[] = [
  { name: 'Conversion',  slug: 'conversion'  },
  { name: 'Reservation', slug: 'reservation' },
  { name: 'Upsell',      slug: 'upsell'      },
  { name: 'Arrival',     slug: 'arrival'     },
  { name: 'Concierge',   slug: 'concierge'   },
  { name: 'Recovery',    slug: 'recovery'    },
  { name: 'Reputation',  slug: 'reputation'  },
];

/* ── Series helpers ──────────────────────────────────────────── */
function days(from: number, n = 14): { date: string }[] {
  const arr: { date: string }[] = [];
  const start = new Date(2026, 3, from);
  for (let i = 0; i < n; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    arr.push({ date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) });
  }
  return arr;
}

/* ── 7.2 Overview ────────────────────────────────────────────── */
export const overviewActions = days(8).map((d, i) => ({
  ...d,
  total: 240 + Math.round(Math.sin(i * 0.7) * 60 + i * 8),
  ai:    180 + Math.round(Math.sin(i * 0.6) * 40 + i * 7),
  escalated: 28 + Math.round(Math.cos(i * 0.5) * 8 + i * 0.4),
}));

export const overviewByEngine: { engine: EngineName; actions: number; connects: number }[] = [
  { engine: 'Conversion',  actions: 1842, connects: 9210 },
  { engine: 'Reservation', actions:  986, connects: 4930 },
  { engine: 'Upsell',      actions:  644, connects: 3220 },
  { engine: 'Arrival',     actions:  531, connects: 2655 },
  { engine: 'Concierge',   actions: 2104, connects: 6312 },
  { engine: 'Recovery',    actions:  189, connects: 1890 },
  { engine: 'Reputation',  actions:  412, connects: 1648 },
];

export const overviewSplit = [
  { label: 'AI autonomous',     value: 5642, color: '#2355A7' },
  { label: 'Escalated to agent', value: 1066, color: '#0E1013' },
];

export const overviewTopActions: {
  type: string; engine: EngineName; count: number; connects: number; share: number;
}[] = [
  { type: 'AI guest Q&A',                 engine: 'Concierge',   count: 1432, connects: 4296, share: 14.6 },
  { type: 'AI booking inquiry response',  engine: 'Conversion',  count: 982,  connects: 3928, share: 13.3 },
  { type: 'Confirmation sent',            engine: 'Reservation', count: 854,  connects: 2562, share:  8.7 },
  { type: 'Upsell offer sent',            engine: 'Upsell',      count: 612,  connects: 3060, share: 10.4 },
  { type: 'Pre-arrival message',          engine: 'Arrival',     count: 498,  connects: 1992, share:  6.8 },
  { type: 'Service booking',              engine: 'Concierge',   count: 374,  connects: 1870, share:  6.4 },
  { type: 'Post-stay survey',             engine: 'Reputation',  count: 312,  connects: 1248, share:  4.2 },
  { type: 'Follow-up after abandoned',    engine: 'Conversion',  count: 286,  connects: 1144, share:  3.9 },
  { type: 'AI complaint response',        engine: 'Recovery',    count: 134,  connects: 1340, share:  4.6 },
  { type: 'Online check-in link',         engine: 'Arrival',     count: 128,  connects:  640, share:  2.2 },
];

/* ── 7.3 Connects ────────────────────────────────────────────── */
export const connectsDaily = days(8, 14).map((d, i) => ({
  ...d,
  connects: 820 + Math.round(Math.sin(i * 0.6) * 220 + Math.cos(i * 1.1) * 80 + i * 14),
}));

export const connectsByChannel = [
  { channel: 'Web Widget', value: 9120 },
  { channel: 'WhatsApp',   value: 7480 },
  { channel: 'Email',      value: 4630 },
  { channel: 'SMS',        value: 2860 },
  { channel: 'Telegram',   value: 1420 },
  { channel: 'Viber',      value:  980 },
  { channel: 'Messenger',  value:  870 },
  { channel: 'Instagram',  value:  720 },
  { channel: 'RCS',        value:  310 },
];

export const ENGINE_ACTION_TYPES: Record<EngineName, { type: string; connects: number }[]> = {
  Conversion: [
    { type: 'Pre-sale general consultation', connects: 1820 },
    { type: 'Proactive widget trigger',      connects:  480 },
    { type: 'AI booking inquiry response',   connects: 3928 },
    { type: 'Room availability check',       connects:  640 },
    { type: 'Rate proposal sent',            connects:  720 },
    { type: 'Booking link sent',             connects:  920 },
    { type: 'Abandoned booking follow-up',   connects: 1144 },
    { type: 'Offer/discount applied',        connects:  410 },
    { type: 'Booking completed',             connects:  280 },
  ],
  Reservation: [
    { type: 'Confirmation sent',                connects: 2562 },
    { type: 'Modification processed',           connects:  720 },
    { type: 'Cancellation processed',           connects:  430 },
    { type: 'Alternative dates proposed',       connects:  280 },
    { type: 'Upcoming stay reminder',           connects:  490 },
    { type: 'Payment link sent',                connects:  320 },
    { type: 'Cancellation policy reply',        connects:  180 },
    { type: 'Future-stay credit offered',       connects:   95 },
  ],
  Upsell: [
    { type: 'Room upgrade offer',          connects: 1120 },
    { type: 'Add-on service offer',        connects:  890 },
    { type: 'Early/late check-in/out',     connects:  720 },
    { type: 'Upgrade availability check',  connects:  240 },
    { type: 'Offer accepted',              connects:  290 },
    { type: 'Offer declined',              connects:  180 },
    { type: 'Re-offer after decline',      connects:  120 },
    { type: 'Upgrade confirmed in PMS',    connects:   95 },
  ],
  Arrival: [
    { type: 'Pre-arrival info',             connects: 1992 },
    { type: 'Check-in reminder',            connects:  430 },
    { type: 'Guest preferences collected',  connects:  280 },
    { type: 'Online check-in link',         connects:  640 },
    { type: 'Check-in instructions',        connects:  290 },
    { type: 'Digital key issued',           connects:  180 },
    { type: 'Room-ready notification',      connects:  220 },
    { type: 'Welcome message',              connects:  410 },
    { type: 'Preferences saved to PMS',     connects:   95 },
  ],
  Concierge: [
    { type: 'AI guest Q&A',                  connects: 4296 },
    { type: 'Recommendations sent',          connects:  680 },
    { type: 'Service booking made',          connects: 1870 },
    { type: 'In-stay message sent',          connects:  430 },
    { type: 'Map / route sent',              connects:  180 },
    { type: 'Escalation to reception',       connects:  240 },
    { type: 'Hotel info sent',               connects:  290 },
  ],
  Recovery: [
    { type: 'Complaint detected & classified', connects:  290 },
    { type: 'AI complaint response',           connects: 1340 },
    { type: 'Compensation offered (auto)',     connects:  240 },
    { type: 'Compensation escalated',          connects:  180 },
    { type: 'Manager escalation (severity)',   connects:  220 },
    { type: 'Resolution follow-up',            connects:   95 },
    { type: 'Resolution confirmation',         connects:   75 },
  ],
  Reputation: [
    { type: 'Post-stay survey sent',           connects: 1248 },
    { type: 'Survey response collected',       connects:  340 },
    { type: 'Positive guest → review platform', connects:  180 },
    { type: 'Negative review reply draft',     connects:  290 },
    { type: 'Negative review reply published', connects:  120 },
    { type: 'Thank-you message sent',          connects:  240 },
  ],
};

export const connectsLog: {
  id: string; date: string; engine: EngineName; type: string; channel: string;
  guestId: string; connects: number;
}[] = Array.from({ length: 24 }).map((_, i) => {
  const engineNames: EngineName[] = ['Conversion', 'Reservation', 'Upsell', 'Arrival', 'Concierge', 'Recovery', 'Reputation'];
  const channels = ['WhatsApp', 'Email', 'Web Widget', 'SMS', 'Telegram', 'Messenger', 'Instagram'];
  const engine = engineNames[i % engineNames.length];
  const types = ENGINE_ACTION_TYPES[engine];
  const t = types[i % types.length];
  return {
    id: `log-${i}`,
    date: `21 Apr 2026, ${String(8 + (i % 12)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    engine,
    type: t.type,
    channel: channels[i % channels.length],
    guestId: `G-${10000 + i}`,
    connects: Math.round(t.connects / 30 + (i % 4)),
  };
});

/* ── Engine pages 7.4-7.10 ───────────────────────────────────── */
export const engineDailyMix: Record<EngineName, { date: string;[k: string]: number | string }[]> = {
  Conversion: days(8).map((d, i) => ({ ...d,
    inquiry: 60 + Math.round(Math.sin(i) * 12 + i),
    proposal: 38 + Math.round(Math.cos(i) * 8),
    followup: 18 + (i % 5),
    booking: 9 + (i % 3),
  })),
  Reservation: days(8).map((d, i) => ({ ...d,
    confirmation: 42 + Math.round(Math.sin(i * 0.8) * 8),
    modification: 14 + (i % 4),
    cancellation: 8 + (i % 3),
    reminder: 22 + Math.round(Math.cos(i) * 6),
  })),
  Upsell: days(8).map((d, i) => ({ ...d,
    sent: 32 + Math.round(Math.cos(i) * 8),
    accepted: 12 + (i % 4),
    declined: 8 + (i % 3),
  })),
  Arrival: days(8).map((d, i) => ({ ...d,
    pre: 28 + Math.round(Math.sin(i) * 6),
    prefs: 12 + (i % 4),
    checkin: 18 + (i % 5),
    welcome: 22 + Math.round(Math.cos(i) * 4),
  })),
  Concierge: days(8).map((d, i) => ({ ...d,
    ai: 84 + Math.round(Math.sin(i) * 14 + i),
    rec: 28 + (i % 6),
    booking: 14 + (i % 4),
    instay: 22 + Math.round(Math.cos(i) * 4),
    escalation: 6 + (i % 3),
  })),
  Recovery: days(8).map((d, i) => ({ ...d,
    detected: 8 + (i % 3),
    aiReply: 6 + (i % 3),
    compensation: 3 + (i % 2),
    escalated: 2 + (i % 2),
  })),
  Reputation: days(8).map((d, i) => ({ ...d,
    survey: 22 + Math.round(Math.sin(i) * 4),
    response: 14 + (i % 4),
    redirect: 8 + (i % 3),
    reply: 4 + (i % 2),
  })),
};

export const conversionFunnel = [
  { stage: 'Inquiry',    actions: 1842, connects: 7368, conv: 100 },
  { stage: 'Proposal',   actions: 1102, connects: 4408, conv: 60 },
  { stage: 'Follow-up',  actions:  624, connects: 1872, conv: 56 },
  { stage: 'Booking',    actions:  286, connects:  858, conv: 46 },
];

export const conversionPages = [
  { page: '/rooms/deluxe-suite',  conv: 12.4 },
  { page: '/offers/spring-2026',  conv:  9.8 },
  { page: '/rooms/penthouse',     conv:  8.7 },
  { page: '/dining/le-jardin',    conv:  6.2 },
  { page: '/spa/packages',        conv:  4.5 },
];

export const reservationOutcome = [
  { label: 'Fully cancelled',   value: 162, color: '#0E1013' },
  { label: 'Saved (alt dates)', value:  84, color: '#2355A7' },
  { label: 'Saved (credit)',    value:  43, color: '#BED4F6' },
];

export const upsellOffers = [
  { name: 'Suite upgrade',     sent: 412, accepted: 124, revenue: 28400, connects: 1648 },
  { name: 'Spa package',       sent: 286, accepted:  92, revenue: 16800, connects: 1144 },
  { name: 'Late check-out',    sent: 198, accepted:  88, revenue:  4400, connects:  792 },
  { name: 'Airport transfer',  sent: 142, accepted:  46, revenue:  6900, connects:  568 },
  { name: 'Dinner reservation',sent: 108, accepted:  42, revenue:  3200, connects:  432 },
];

export const upsellRevenueDaily = days(8).map((d, i) => ({ ...d,
  revenue: 1800 + Math.round(Math.sin(i * 0.6) * 720 + i * 70),
}));

export const arrivalGuests = [
  { name: 'Élise Caron',       date: '23 Apr 2026', pre: true,  prefs: true,  checkin: true,  key: true,  connects: 18 },
  { name: 'Henrik Bauer',      date: '23 Apr 2026', pre: true,  prefs: true,  checkin: true,  key: false, connects: 14 },
  { name: 'Mei Tanaka',        date: '24 Apr 2026', pre: true,  prefs: false, checkin: false, key: false, connects:  9 },
  { name: 'Diego Fernández',   date: '24 Apr 2026', pre: true,  prefs: true,  checkin: true,  key: true,  connects: 18 },
  { name: 'Aisha Al-Mansouri', date: '25 Apr 2026', pre: false, prefs: false, checkin: false, key: false, connects:  6 },
  { name: 'Theo Lambert',      date: '25 Apr 2026', pre: true,  prefs: true,  checkin: true,  key: true,  connects: 18 },
];

export const conciergeSplit = [
  { label: 'AI resolved',         value: 1936, color: '#2355A7' },
  { label: 'Escalated to reception', value: 168, color: '#0E1013' },
];

export const conciergeEscalations = [
  { question: 'Is parking available for an oversized vehicle?',  count: 8,  lastSeen: '2h ago' },
  { question: 'Do you accommodate kosher dietary requirements?', count: 6,  lastSeen: '5h ago' },
  { question: 'Can the spa accommodate a wheelchair?',           count: 5,  lastSeen: '1d ago' },
  { question: 'Do you have an EV charger on-site?',              count: 4,  lastSeen: '1d ago' },
  { question: 'Pet policy for emotional support animals?',       count: 3,  lastSeen: '2d ago' },
];

export const recoveryCategories = [
  { category: 'Noise',        count: 28 },
  { category: 'Cleanliness',  count: 22 },
  { category: 'Equipment',    count: 18 },
  { category: 'Staff',        count: 12 },
  { category: 'Food',         count:  9 },
  { category: 'Other',        count:  6 },
];

export const recoverySplit = [
  { label: 'AI resolved',     value: 134, color: '#2355A7' },
  { label: 'Escalated', value:  55, color: '#0E1013' },
];

export const recoveryLog = [
  { date: '21 Apr 2026', guest: 'Élise Caron',       category: 'Noise',       severity: 'High',   status: 'Resolved',   compensation: 60, connects: 18 },
  { date: '21 Apr 2026', guest: 'Henrik Bauer',      category: 'Cleanliness', severity: 'Medium', status: 'Escalated',  compensation:  0, connects: 12 },
  { date: '20 Apr 2026', guest: 'Mei Tanaka',        category: 'Equipment',   severity: 'Low',    status: 'Resolved',   compensation: 30, connects:  9 },
  { date: '20 Apr 2026', guest: 'Diego Fernández',   category: 'Staff',       severity: 'High',   status: 'In review',  compensation:  0, connects: 14 },
  { date: '19 Apr 2026', guest: 'Aisha Al-Mansouri', category: 'Food',        severity: 'Low',    status: 'Resolved',   compensation: 25, connects:  8 },
];

export const reputationDaily = days(8).map((d, i) => ({
  ...d,
  score: +(4.1 + Math.sin(i * 0.6) * 0.18 + i * 0.04).toFixed(2),
}));

export const reputationActionsByType = [
  { type: 'Surveys sent',         count: 312 },
  { type: 'Redirects to platform',count:  98 },
  { type: 'Negative replies',     count:  42 },
  { type: 'Thank-you messages',   count: 264 },
];

export const reputationLog = [
  { date: '21 Apr 2026', guest: 'Élise Caron',     score: 5, channel: 'Email',    platform: 'Booking.com',  status: 'auto'    },
  { date: '21 Apr 2026', guest: 'Henrik Bauer',    score: 4, channel: 'WhatsApp', platform: 'Direct',       status: 'auto'    },
  { date: '20 Apr 2026', guest: 'Mei Tanaka',      score: 2, channel: 'Email',    platform: 'TripAdvisor',  status: 'pending' },
  { date: '20 Apr 2026', guest: 'Diego Fernández', score: 5, channel: 'SMS',      platform: 'Google',       status: 'done'    },
  { date: '19 Apr 2026', guest: 'Aisha Al-Mansouri',score: 3,channel: 'Email',    platform: 'Direct',       status: 'auto'    },
];

/* ── 7.11 Channels ───────────────────────────────────────────── */
export const channelsAnalytics = [
  { channel: 'WhatsApp',  conversations: 1842, actions: 6420, avgResponse: '1m 12s', revenue: 124000, connects: 7480, share: 32.6 },
  { channel: 'Web Widget',conversations:  864, actions: 4310, avgResponse:  '24s',   revenue:  86400, connects: 9120, share: 21.9 },
  { channel: 'Email',     conversations:  984, actions: 2860, avgResponse: '4m 30s', revenue:  68200, connects: 4630, share: 14.5 },
  { channel: 'SMS',       conversations:  526, actions: 1820, avgResponse:  '52s',   revenue:  18400, connects: 2860, share:  9.2 },
  { channel: 'Telegram',  conversations:  312, actions:  920, avgResponse: '1m 04s', revenue:  10800, connects: 1420, share:  4.6 },
  { channel: 'Viber',     conversations:  148, actions:  640, avgResponse: '1m 28s', revenue:   6200, connects:  980, share:  3.2 },
  { channel: 'Messenger', conversations:  198, actions:  720, avgResponse: '2m 10s', revenue:   8400, connects:  870, share:  3.6 },
  { channel: 'Instagram', conversations:  142, actions:  480, avgResponse: '3m 12s', revenue:   4900, connects:  720, share:  2.4 },
  { channel: 'RCS',       conversations:   58, actions:  220, avgResponse:  '46s',   revenue:   1800, connects:  310, share:  1.2 },
];

export const channelsDaily = days(8).map((d, i) => ({ ...d,
  whatsapp:  120 + Math.round(Math.sin(i * 0.7) * 22),
  webWidget:  90 + Math.round(Math.cos(i * 0.7) * 16),
  email:      52 + Math.round(Math.sin(i * 0.4) * 8),
  sms:        38 + (i % 6),
  telegram:   28 + (i % 4),
}));

/* ── 7.12 Operators ──────────────────────────────────────────── */
export const operators = [
  { id: 'op-1', name: 'Léa Martin',     status: 'online' as const,  handled: 142, open:  4, response: '52s',   resolution: '6m 22s', csat: 4.7 },
  { id: 'op-2', name: 'Marco Rossi',    status: 'online' as const,  handled: 128, open:  6, response: '1m 04s',resolution: '7m 14s', csat: 4.6 },
  { id: 'op-3', name: 'Sara Lindqvist', status: 'offline' as const, handled: 118, open:  0, response: '58s',   resolution: '6m 48s', csat: 4.8 },
  { id: 'op-4', name: 'Felix Müller',   status: 'online' as const,  handled:  98, open:  3, response: '1m 12s',resolution: '8m 02s', csat: 4.4 },
  { id: 'op-5', name: 'Yuki Tanaka',    status: 'offline' as const, handled:  86, open:  0, response: '46s',   resolution: '5m 56s', csat: 4.9 },
  { id: 'op-6', name: 'Adrien Dubois',  status: 'online' as const,  handled:  72, open:  2, response: '1m 18s',resolution: '7m 32s', csat: 4.5 },
];

export const operatorsDaily = days(8).map((d, i) => ({ ...d,
  ai:     38 + Math.round(Math.sin(i * 0.6) * 8),
  direct: 24 + Math.round(Math.cos(i * 0.5) * 6),
  response: 56 + Math.round(Math.sin(i * 0.4) * 8),
}));

/* ── 7.13 Departments ────────────────────────────────────────── */
export const departments = [
  { id: 'front_desk',  name: 'Front Desk',   conversations: 824, response: '1m 02s', resolution: '6m 48s', csat: 4.6 },
  { id: 'concierge',   name: 'Concierge',    conversations: 612, response: '54s',    resolution: '5m 22s', csat: 4.8 },
  { id: 'housekeeping',name: 'Housekeeping', conversations: 218, response: '1m 28s', resolution: '8m 14s', csat: 4.4 },
  { id: 'fnb',         name: 'F&B',          conversations: 286, response: '1m 12s', resolution: '7m 02s', csat: 4.5 },
  { id: 'engineering', name: 'Engineering',  conversations:  92, response: '2m 04s', resolution: '14m 30s',csat: 4.3 },
];

export const deptSplitOrigin = [
  { label: 'Escalated from AI', value: 1284, color: '#2355A7' },
  { label: 'Direct',            value:  748, color: '#0E1013' },
];

export const deptSplitState = [
  { label: 'Resolved', value: 1842, color: '#2355A7' },
  { label: 'Open',     value:  190, color: '#0E1013' },
];

/* ── 7.14 Load (heatmap) ─────────────────────────────────────── */
export const loadHeatmap: { day: string; hours: number[] }[] = (() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d, di) => ({
    day: d,
    hours: Array.from({ length: 24 }).map((_, h) => {
      const peak = Math.exp(-Math.pow((h - (di < 5 ? 12 : 19)) / 4, 2));
      const evening = Math.exp(-Math.pow((h - 20) / 3, 2));
      const base = peak * 38 + evening * 22 + Math.random() * 6;
      return Math.round(base);
    }),
  }));
})();

export const loadHourly = Array.from({ length: 24 }).map((_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  total: Math.round(Math.exp(-Math.pow((h - 14) / 5, 2)) * 48 + Math.random() * 6),
  ai: Math.round(Math.exp(-Math.pow((h - 14) / 5, 2)) * 36 + Math.random() * 4),
  agents: Math.round(Math.exp(-Math.pow((h - 14) / 5, 2)) * 12 + Math.random() * 3),
  queue: Math.round(Math.random() * 8 + (h > 18 || h < 8 ? 0 : 4)),
  aiRate: Math.round(58 + Math.random() * 24),
}));

/* ── 7.15 Guest insights ─────────────────────────────────────── */
export const guestSatisfactionDist = [
  { score: '5', count: 284 },
  { score: '4', count: 142 },
  { score: '3', count:  48 },
  { score: '2', count:  18 },
  { score: '1', count:   6 },
];

export const guestSourcesDist = [
  { label: 'Direct',     value: 412, color: '#2355A7' },
  { label: 'OTA',        value: 638, color: '#0E1013' },
  { label: 'Other',      value:  85, color: '#BED4F6' },
];

export const guestNewVsReturning = [
  { label: 'New',         value: 412, color: '#2355A7' },
  { label: 'Returning',   value: 723, color: '#0E1013' },
];

/* ── 7.16 Scheduled reports ──────────────────────────────────── */
export const scheduledReports = [
  { id: 'r-1', name: 'Weekly executive summary', frequency: 'Weekly',   recipients: ['ceo@hotel.com', 'gm@hotel.com'],     lastRun: '21 Apr 2026', status: 'active' as const },
  { id: 'r-2', name: 'Daily ops digest',          frequency: 'Daily',    recipients: ['ops@hotel.com'],                     lastRun: '22 Apr 2026', status: 'active' as const },
  { id: 'r-3', name: 'Monthly Connects billing',  frequency: 'Monthly',  recipients: ['finance@hotel.com'],                 lastRun: '01 Apr 2026', status: 'active' as const },
  { id: 'r-4', name: 'Conversion engine deep-dive',frequency: 'Weekly',  recipients: ['marketing@hotel.com'],               lastRun: '14 Apr 2026', status: 'paused' as const },
  { id: 'r-5', name: 'Recovery escalations',      frequency: 'Daily',    recipients: ['quality@hotel.com', 'gm@hotel.com'], lastRun: '22 Apr 2026', status: 'active' as const },
];
