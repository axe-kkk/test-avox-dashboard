import type { Filters } from './filters';
import { DEFAULT_FILTERS } from './filters';

export interface Preset {
  id: string;
  label: string;
  /** Hint shown on the chip — kept very short. */
  hint?: string;
  apply: (base: Filters) => Filters;
  /** Heuristic: is this preset's signature currently in `f`? */
  isActive: (f: Filters) => boolean;
}

export const PRESETS: Preset[] = [
  {
    id: 'vip',
    label: 'VIP',
    apply: () => ({ ...DEFAULT_FILTERS, clientStatus: ['vip'] }),
    isActive: f => f.clientStatus.length === 1 && f.clientStatus[0] === 'vip',
  },
  {
    id: 'coming-soon',
    label: 'Coming soon',
    apply: () => ({ ...DEFAULT_FILTERS, hasReservation: true }),
    isActive: f => f.hasReservation === true,
  },
  {
    id: 'new',
    label: 'New',
    apply: () => ({ ...DEFAULT_FILTERS, clientStatus: ['new'] }),
    isActive: f => f.clientStatus.length === 1 && f.clientStatus[0] === 'new',
  },
  {
    id: 'complaints',
    label: 'Complaints',
    apply: () => ({ ...DEFAULT_FILTERS, hasComplaints: true }),
    isActive: f => f.hasComplaints === true,
  },
];
