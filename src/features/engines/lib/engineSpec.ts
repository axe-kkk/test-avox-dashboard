/**
 * Per-engine functional differences.
 *
 * The 7 engines aren't interchangeable — each one operates at a different
 * stage of the guest journey, so the defaults that come up in Settings,
 * Offers, Playground, etc. should reflect that. This file is the single
 * source of truth for those differences. Pages import it and key into
 * `engine.name` to render only what makes sense for that engine.
 */

import type { EngineName } from '../../../types';

export type Access = 'none' | 'read' | 'write';
type CategoryId = 'guest' | 'reservation' | 'billing' | 'housekeeping' | 'history';

export interface EngineSpec {
  /** Pre-filled system prompt — different operating principles per engine. */
  systemPrompt: string;

  /**
   * Default Guest Data Access by category. Concierge can't see Billing,
   * Reputation only needs History+Guest, etc.
   */
  pmsAccess: Record<CategoryId, Access>;

  /** Offer types this engine actually has reasons to offer. */
  offerTypes: string[];

  /** Default outbound channels checked in the Offers page. */
  defaultChannels: string[];

  /** Suggested test messages in the Playground empty state. */
  quickPrompts: string[];

  /** Default escalation department for Routing. */
  escalationDepartment: string;

  /** Headline metric for Analytics — what the engine is judged on. */
  keyMetric: { label: string; value: string; delta: number };

  /** Label of the engine-specific config sub-nav item. */
  configLabel: string;
}

const SYSTEM_PROMPTS: Record<EngineName, string> = {
  Conversion: `You are a friendly hotel booking assistant for Grand Palace Hotel. Your goal is to help potential guests find the perfect room and complete their booking.

When a guest inquires about availability:
1. Ask for their travel dates and number of guests
2. Present the best available rooms with highlights
3. Mention any current promotions
4. Guide them toward completing the booking

Always be warm, professional, and focused on conversion. Respond in the guest's language when possible.`,

  Reservation: `You manage existing reservations for Grand Palace Hotel — modifications, confirmations, cancellations.

When a guest reaches out:
1. Look up the reservation by name or booking reference
2. Confirm the change they want before applying it
3. Explain any rate, policy, or fee impact in plain terms
4. Send a confirmation summary at the end

Be concise and exact. Never assume — confirm dates, room type, and guest count before writing back to the PMS.`,

  Upsell: `You surface relevant upgrades and add-ons for confirmed guests at Grand Palace Hotel.

You can suggest:
- Room upgrades (when inventory allows)
- Spa packages, restaurant reservations, airport transfer
- Early check-in / late check-out

Lead with the benefit to the guest, not the price. Only pitch one offer per turn. If the guest declines, move on — never push twice.`,

  Arrival: `You handle pre-arrival communication for Grand Palace Hotel: confirmation, expectations, key collection.

Before check-in you should:
1. Confirm arrival time and transport needs
2. Capture preferences (pillow, allergies, special occasion)
3. Offer mobile key once eligible
4. Reassure that 24/7 reception is available

Tone: anticipatory and warm. Reduce friction; do not upsell unless asked.`,

  Concierge: `You are the in-stay digital concierge for Grand Palace Hotel, available 24/7.

You can help with:
- Restaurant reservations and dining recommendations
- Local attractions and transport
- Housekeeping coordination and room service
- Special occasion arrangements

Be attentive and proactive. If you cannot fulfill a request, escalate immediately to the duty manager.`,

  Recovery: `You handle guest complaints and service recovery at Grand Palace Hotel.

When a guest expresses dissatisfaction:
1. Acknowledge and apologize sincerely — never deflect
2. Establish what happened, in their words
3. Take an immediate action (room change, F&B credit, manager call)
4. Follow up within 30 minutes to confirm resolution

You are authorized to apply up to €100 of compensation per incident without human approval.`,

  Reputation: `You manage post-stay reputation at Grand Palace Hotel — reviews, follow-up, advocacy.

After check-out:
1. Send a brief, personalised thank-you within 6 hours
2. Ask one specific question (not generic "how was your stay?")
3. If the guest is happy, invite them to share a review
4. If not, route their feedback to the GM and skip the review ask

Tone: warm, low-pressure. Never bribe for reviews.`,
};

const PMS_ACCESS: Record<EngineName, Record<CategoryId, Access>> = {
  /* Pre-booking — only needs to see basic guest fields, no real reservation yet. */
  Conversion:  { guest: 'read', reservation: 'none', billing: 'none',  housekeeping: 'none',  history: 'read' },
  /* Owns reservations: read+write reservation, read billing for context. */
  Reservation: { guest: 'read', reservation: 'write', billing: 'read', housekeeping: 'none',  history: 'read' },
  /* Sees prices but does not modify financials. */
  Upsell:      { guest: 'read', reservation: 'read', billing: 'read',  housekeeping: 'none',  history: 'read' },
  /* Pre-arrival/check-in: writes housekeeping prefs, no billing. */
  Arrival:     { guest: 'read', reservation: 'read', billing: 'none',  housekeeping: 'write', history: 'read' },
  /* In-stay concierge: writes housekeeping/orders, no billing visibility. */
  Concierge:   { guest: 'read', reservation: 'read', billing: 'none',  housekeeping: 'write', history: 'read' },
  /* Service recovery: full picture incl. billing for compensation. */
  Recovery:    { guest: 'read', reservation: 'read', billing: 'write', housekeeping: 'read',  history: 'read' },
  /* Post-stay: history + guest profile only. */
  Reputation:  { guest: 'read', reservation: 'none', billing: 'none',  housekeeping: 'none',  history: 'read' },
};

const OFFER_TYPES: Record<EngineName, string[]> = {
  Conversion:  ['Room upgrade', 'Discount %', 'Fixed discount', 'Gift'],
  Reservation: ['Early check-in', 'Late check-out', 'Room upgrade'],
  Upsell:      ['Room upgrade', 'Spa package', 'Restaurant reservation', 'Airport transfer', 'Gift'],
  Arrival:     ['Early check-in', 'Airport transfer', 'Free service'],
  Concierge:   ['Spa package', 'Restaurant reservation', 'Free service', 'Gift'],
  Recovery:    ['Discount %', 'Fixed discount', 'Free service', 'Gift'],
  Reputation:  ['Discount %', 'Gift'],
};

const DEFAULT_CHANNELS: Record<EngineName, string[]> = {
  Conversion:  ['whatsapp', 'email', 'web_widget' as never],
  Reservation: ['email', 'whatsapp'],
  Upsell:      ['whatsapp', 'email'],
  Arrival:     ['whatsapp', 'sms', 'email'],
  Concierge:   ['whatsapp', 'sms'],
  Recovery:    ['whatsapp', 'sms'],
  Reputation:  ['email', 'whatsapp'],
};

const QUICK_PROMPTS: Record<EngineName, string[]> = {
  Conversion:  ['Hi, I need to book a room', 'Do you have availability for May 12–15?', 'How much is a Deluxe King?', 'Any promotions right now?'],
  Reservation: ['I need to change my dates', 'Cancel my booking', 'Can I add another guest to my reservation?', 'What is your cancellation policy?'],
  Upsell:      ['Can I get an upgrade?', 'I want to book the spa', 'Any nice restaurants you can book for me?', 'Need an airport transfer'],
  Arrival:     ['Can I check in early?', 'What time can I get my key?', 'Need transport from CDG', 'I have a peanut allergy'],
  Concierge:   ['Recommend a restaurant nearby', 'Need extra towels', 'Book me a taxi for 8 PM', 'Any tickets for the Louvre tomorrow?'],
  Recovery:    ['The room is too noisy', 'Service was unacceptable', 'I want a refund', 'My booking was double-charged'],
  Reputation:  ['I want to leave a review', 'Loved my stay, thank you', 'Can I share feedback privately?', 'How do I get a copy of my invoice?'],
};

const ESCALATION_DEPT: Record<EngineName, string> = {
  Conversion:  'Reservations',
  Reservation: 'Reservations',
  Upsell:      'Reservations',
  Arrival:     'Front Office',
  Concierge:   'Front Office',
  Recovery:    'Front Office',
  Reputation:  'Front Office',
};

const KEY_METRIC: Record<EngineName, EngineSpec['keyMetric']> = {
  Conversion:  { label: 'Conversion rate',     value: '34%',   delta:  6 },
  Reservation: { label: 'Modification success',value: '92%',   delta:  3 },
  Upsell:      { label: 'Upsell take rate',    value: '21%',   delta: 11 },
  Arrival:     { label: 'Pre-arrival completion', value: '78%', delta:  4 },
  Concierge:   { label: 'Avg CSAT',            value: '4.6/5', delta:  2 },
  Recovery:    { label: 'Recovery rate',       value: '81%',   delta:  9 },
  Reputation:  { label: 'Review submission',   value: '38%',   delta:  7 },
};

const CONFIG_LABEL: Record<EngineName, string> = {
  Conversion:  'Web & Booking',
  Reservation: 'Booking Flow',
  Upsell:      'Upgrade Rules',
  Arrival:     'Arrival Setup',
  Concierge:   'Local Knowledge',
  Recovery:    'Complaint Handling',
  Reputation:  'Reviews & Surveys',
};

export function getEngineSpec(name: string): EngineSpec {
  const key = name as EngineName;
  const fallbackPrompt = `You are the AI ${name} agent for Grand Palace Hotel. Stay within your scope and respond in the guest's language.`;
  return {
    systemPrompt:         SYSTEM_PROMPTS[key]     ?? fallbackPrompt,
    pmsAccess:            PMS_ACCESS[key]         ?? PMS_ACCESS.Conversion,
    offerTypes:           OFFER_TYPES[key]        ?? OFFER_TYPES.Conversion,
    defaultChannels:      DEFAULT_CHANNELS[key]   ?? ['whatsapp', 'email'],
    quickPrompts:         QUICK_PROMPTS[key]      ?? QUICK_PROMPTS.Conversion,
    escalationDepartment: ESCALATION_DEPT[key]    ?? 'Front Office',
    keyMetric:            KEY_METRIC[key]         ?? { label: 'Resolution rate', value: '—', delta: 0 },
    configLabel:          CONFIG_LABEL[key]       ?? 'Configuration',
  };
}
