export const GUEST_ASSIGNMENTS: Record<string, string> = {
  guest_001: 'user_001', guest_002: 'user_002', guest_003: 'user_003',
  guest_004: 'user_001', guest_005: 'user_002', guest_006: 'user_001',
  guest_007: 'user_003', guest_008: 'user_002', guest_009: 'user_001',
  guest_010: 'user_002',
};

export const LANG_LABELS: Record<string, string> = {
  de: 'German', en: 'English', fr: 'French', es: 'Spanish',
  it: 'Italian', ru: 'Russian', ar: 'Arabic', ja: 'Japanese',
};

export const SUGGESTED_TAGS = [
  'VIP', 'Returning', 'Business', 'Leisure', 'Family', 'Solo',
  'Couple', 'Honeymoon', 'Corporate', 'Anniversary',
];

export const TRAVEL_OPTIONS: [string, string][] = [
  ['solo',   'Solo'],
  ['couple', 'Couple'],
  ['kids',   'With kids'],
  ['group',  'Large group'],
];

export const STATUS_OPTIONS: [string, string][] = [
  ['new',       'New'],
  ['returning', 'Returning'],
  ['vip',       'VIP'],
  ['lost',      'Lost'],
];
