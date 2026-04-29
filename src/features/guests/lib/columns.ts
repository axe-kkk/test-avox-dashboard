import type { Guest } from '../../../types';

export type ColId =
  | 'name' | 'email' | 'phone' | 'assignedTo' | 'lastContact'
  | 'lastStay' | 'nextStay' | 'visits' | 'ltv' | 'language' | 'source';

export const ALL_COLS: { id: ColId; label: string; sortKey?: keyof Guest }[] = [
  { id: 'name',        label: 'Name',         sortKey: 'name'           },
  { id: 'email',       label: 'Email'                                    },
  { id: 'phone',       label: 'Phone'                                    },
  { id: 'assignedTo',  label: 'Assigned to'                              },
  { id: 'lastContact', label: 'Last contact', sortKey: 'lastInquiryAt'  },
  { id: 'lastStay',    label: 'Last stay',    sortKey: 'lastStayAt'     },
  { id: 'nextStay',    label: 'Next stay',    sortKey: 'upcomingStayAt' },
  { id: 'visits',      label: 'Visits',       sortKey: 'totalVisits'    },
  { id: 'ltv',         label: 'LTV',          sortKey: 'lifetimeValue'  },
  { id: 'language',    label: 'Language',     sortKey: 'language'       },
  { id: 'source',      label: 'Source',       sortKey: 'source'         },
];

/* Compact default — keeps Inbox-style breathing room. Other columns
   stay opt-in via the Columns menu. */
export const DEFAULT_COLS: ColId[] = [
  'name', 'email', 'lastContact', 'nextStay', 'visits', 'ltv',
];
