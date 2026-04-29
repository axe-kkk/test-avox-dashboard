import type { Guest } from '../../../types';
import { GUEST_ASSIGNMENTS } from './constants';

export interface Filters {
  assignedUserId: string;
  hasSequence: boolean | null;
  hasPhone: boolean | null;
  hasEmail: boolean | null;
  languages: string[];
  travelWith: string[];
  clientStatus: string[];
  hasReservation: boolean | null;
  visitFrom: string;
  visitTo: string;
  spendMin: string;
  spendMax: string;
  hasCalls: boolean | null;
  hasComplaints: boolean | null;
  ratingMin: number;
  tags: string[];
}

export const DEFAULT_FILTERS: Filters = {
  assignedUserId: '', hasSequence: null, hasPhone: null, hasEmail: null,
  languages: [], travelWith: [], clientStatus: [], hasReservation: null,
  visitFrom: '', visitTo: '', spendMin: '', spendMax: '',
  hasCalls: null, hasComplaints: null, ratingMin: 0, tags: [],
};

export function countFilters(f: Filters): number {
  let n = 0;
  if (f.assignedUserId) n++;
  if (f.hasSequence !== null) n++;
  if (f.hasPhone !== null || f.hasEmail !== null) n++;
  if (f.languages.length) n++;
  if (f.travelWith.length) n++;
  if (f.clientStatus.length) n++;
  if (f.hasReservation !== null) n++;
  if (f.visitFrom || f.visitTo) n++;
  if (f.spendMin || f.spendMax) n++;
  if (f.hasCalls !== null) n++;
  if (f.hasComplaints !== null) n++;
  if (f.ratingMin > 0) n++;
  if (f.tags.length) n++;
  return n;
}

export function applyFilters(guests: Guest[], filters: Filters, search: string): Guest[] {
  return guests.filter(g => {
    if (search) {
      const q = search.toLowerCase();
      if (!g.name.toLowerCase().includes(q) && !g.email.toLowerCase().includes(q)) return false;
    }
    if (filters.assignedUserId && GUEST_ASSIGNMENTS[g.id] !== filters.assignedUserId) return false;
    if (filters.hasPhone === true && !g.phone) return false;
    if (filters.hasEmail === true && !g.email) return false;
    if (filters.languages.length && !filters.languages.includes(g.language)) return false;
    if (filters.travelWith.length) {
      const ok = filters.travelWith.some(t =>
        t === 'solo'   ? g.companions.length === 0 :
        t === 'couple' ? g.companions.length === 1 :
        t === 'kids'   ? g.tags.includes('Family') :
        t === 'group'  ? g.companions.length >= 3 : false,
      );
      if (!ok) return false;
    }
    if (filters.clientStatus.length) {
      const ok = filters.clientStatus.some(s =>
        s === 'vip'       ? g.tags.includes('VIP') :
        s === 'new'       ? g.totalVisits <= 1 :
        s === 'returning' ? g.totalVisits > 1 :
        s === 'lost'      ? (!g.upcomingStayAt && g.status === 'checked_out') : false,
      );
      if (!ok) return false;
    }
    if (filters.hasReservation === true  && !g.upcomingStayAt) return false;
    if (filters.hasReservation === false &&  g.upcomingStayAt) return false;
    if (filters.visitFrom && g.lastStayAt && g.lastStayAt < filters.visitFrom) return false;
    if (filters.visitTo   && g.lastStayAt && g.lastStayAt > filters.visitTo)   return false;
    if (filters.spendMin && g.lifetimeValue < Number(filters.spendMin)) return false;
    if (filters.spendMax && g.lifetimeValue > Number(filters.spendMax)) return false;
    if (filters.ratingMin > 0 && (!g.satisfactionScore || g.satisfactionScore < filters.ratingMin)) return false;
    if (filters.tags.length && !filters.tags.some(t => g.tags.includes(t))) return false;
    return true;
  });
}

/* Per-section active flags — used for highlighting & default-open state */
export type FilterSectionId =
  | 'assignment' | 'contact' | 'activity' | 'language' | 'travel'
  | 'status' | 'visits' | 'finance' | 'rating' | 'tags';

export function activeSections(f: Filters): Record<FilterSectionId, boolean> {
  return {
    assignment: !!f.assignedUserId,
    contact:    f.hasPhone !== null || f.hasEmail !== null,
    activity:   f.hasSequence !== null || f.hasReservation !== null
                || f.hasCalls !== null || f.hasComplaints !== null,
    language:   f.languages.length > 0,
    travel:     f.travelWith.length > 0,
    status:     f.clientStatus.length > 0,
    visits:     !!(f.visitFrom || f.visitTo),
    finance:    !!(f.spendMin || f.spendMax),
    rating:     f.ratingMin > 0,
    tags:       f.tags.length > 0,
  };
}
