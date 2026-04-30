import { useEffect, useState } from 'react';
import {
  X, ArrowLeft, ChevronRight, Star,
  User, BedDouble, MessageSquare, TrendingUp, Tag, Activity,
  Mail, Phone, Send, Sparkles, ListPlus,
} from 'lucide-react';
import { cn, formatDate, formatDateTime, formatCurrency } from '../../../utils';
import { Avatar } from '../../../components/ui/Avatar';
import { ChannelIcon } from '../../../components/ui/ChannelIcon';
import { mockReservations } from '../../../data/mock/reservations';
import { mockConversations } from '../../../data/mock/conversations';
import { mockUsers } from '../../../data/mock/users';
import type { Guest } from '../../../types';
import { GUEST_ASSIGNMENTS, LANG_LABELS } from '../lib/constants';
import { useApp } from '../../../app/AppContext';

type Section = 'info' | 'reservations' | 'messages' | 'revenue' | 'tags_notes' | 'actions';

const MENU: { id: Section; label: string; icon: typeof User }[] = [
  { id: 'info',         label: 'User info',     icon: User         },
  { id: 'reservations', label: 'Reservations',  icon: BedDouble    },
  { id: 'messages',     label: 'Messages',      icon: MessageSquare },
  { id: 'revenue',      label: 'Revenue',       icon: TrendingUp   },
  { id: 'tags_notes',   label: 'Tags & notes',  icon: Tag          },
  { id: 'actions',      label: 'Quick actions', icon: Activity     },
];

interface Props {
  guest: Guest;
  onClose: () => void;
}

export function GuestDetailPanel({ guest, onClose }: Props) {
  const [section, setSection] = useState<Section | null>(null);
  const { addToast } = useApp();

  const reservations  = mockReservations.filter(r => r.guestId === guest.id);
  const conversations = mockConversations.filter(c => c.guestId === guest.id);
  const assignedUser  = mockUsers.find(u => u.id === GUEST_ASSIGNMENTS[guest.id]);
  const activeMeta    = section ? MENU.find(m => m.id === section) : null;

  /* When user switches to another guest, collapse the open section. */
  useEffect(() => { setSection(null); }, [guest.id]);

  return (
    <div className="w-[272px] flex-shrink-0 border-l border-brand-border bg-white relative overflow-hidden flex flex-col">

      {/* ── Identity + stats block (56px to match toolbar) ── */}
      <div className="h-[56px] px-4 border-b border-brand-border flex-shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar name={guest.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[13px] font-semibold text-muted truncate leading-tight">{guest.name}</h3>
              {guest.tags.includes('VIP') && (
                <Star className="w-3 h-3 fill-brand-blue text-brand-blue flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-subtle leading-tight">
              <span className="tabular-nums"><span className="font-semibold text-muted">{guest.totalVisits}</span> visits</span>
              <span className="text-faint">·</span>
              <span className="font-semibold text-brand-blue tabular-nums">{formatCurrency(guest.lifetimeValue)}</span>
              {guest.satisfactionScore && (
                <>
                  <span className="text-faint">·</span>
                  <span className="font-semibold text-muted tabular-nums">{guest.satisfactionScore}★</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-surface-3 border border-brand-border flex items-center justify-center text-subtle hover:bg-white hover:text-muted transition-colors flex-shrink-0"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Menu (no circle wrappers, larger icons) ──────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {MENU.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className="w-full px-3 py-2.5 flex items-center gap-3 rounded-xl hover:bg-surface-3 transition-colors"
            >
              <Icon className="w-5 h-5 text-muted flex-shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[12px] font-semibold text-muted truncate">{label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-faint flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Sliding detail ────────────────────────────────── */}
      <div
        className={cn(
          'absolute inset-0 bg-white flex flex-col transition-transform duration-200 ease-out',
          section ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!section}
      >
        <div className="h-[56px] px-4 border-b border-brand-border flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setSection(null)}
            className="w-10 h-10 rounded-full border border-brand-border bg-surface-3 flex items-center justify-center text-subtle hover:bg-white hover:text-muted transition-colors flex-shrink-0"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-muted truncate leading-tight">{activeMeta?.label}</p>
            <p className="text-[10px] text-subtle truncate leading-tight">{guest.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-brand-border bg-surface-3 flex items-center justify-center text-subtle hover:bg-white hover:text-muted transition-colors flex-shrink-0"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* INFO */}
          {section === 'info' && (
            <>
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-subtle">Contact</p>
                <div className="rounded-xl border border-brand-border bg-surface-2 divide-y divide-border-soft">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <Mail className="w-4 h-4 flex-shrink-0 text-subtle" />
                    <span className="text-[12px] text-muted truncate">{guest.email}</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <Phone className="w-4 h-4 flex-shrink-0 text-subtle" />
                    <span className="text-[12px] text-muted tabular-nums truncate">{guest.phone}</span>
                  </div>
                </div>

                {assignedUser && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2">
                    <Avatar name={assignedUser.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-muted truncate leading-tight">{assignedUser.name}</p>
                      <p className="text-[10px] text-subtle truncate leading-tight mt-0.5">{assignedUser.department}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-subtle">Profile</p>
                <div className="rounded-xl border border-brand-border bg-surface-2 divide-y divide-border-soft">
                  {([
                    ['Nationality',       guest.nationality],
                    ['Language',          LANG_LABELS[guest.language] ?? guest.language.toUpperCase()],
                    ['Source',            guest.source === 'booking.com' ? 'Booking.com' : guest.source.replace('_', ' ')],
                    ['Preferred channel', guest.preferredChannel.replace('_', ' ')],
                    ['Status',            guest.status.replace('_', ' ')],
                  ] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center px-3 py-2.5">
                      <span className="text-[12px] text-subtle">{k}</span>
                      <span className="text-[12px] font-medium text-muted text-right max-w-[150px] truncate capitalize">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {guest.companions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold text-subtle">Travel party</p>
                  <div className="space-y-1.5">
                    {guest.companions.map(c => (
                      <div key={c} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2">
                        <Avatar name={c} size="lg" />
                        <span className="text-[12px] font-medium text-muted truncate">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* RESERVATIONS */}
          {section === 'reservations' && (
            <>
              {reservations.length === 0 ? (
                <p className="text-[12px] text-subtle py-6 text-center">No reservations found.</p>
              ) : reservations.map(res => (
                <div
                  key={res.id}
                  className="rounded-2xl border border-brand-border bg-surface-2 p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-muted">{res.roomType}</span>
                    <span className="text-[10px] font-medium text-brand-blue bg-brand-blue-50 px-2 py-0.5 rounded-md capitalize">
                      {res.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[10px] text-subtle font-mono">{res.bookingRef}</p>
                  {([
                    ['Check-in',  formatDate(res.checkIn)],
                    ['Check-out', formatDate(res.checkOut)],
                    ['Room',      `#${res.roomNumber}`],
                    ['Total',     formatCurrency(res.totalAmount)],
                  ] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-baseline py-1.5 border-b border-border-soft last:border-0">
                      <span className="text-[11px] text-subtle">{k}</span>
                      <span className={cn('text-[12px] font-medium text-right', k === 'Total' ? 'text-brand-blue' : 'text-muted')}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* MESSAGES */}
          {section === 'messages' && (
            <>
              {conversations.length === 0 ? (
                <p className="text-[12px] text-subtle py-6 text-center">No conversations found.</p>
              ) : conversations.map(conv => (
                <div
                  key={conv.id}
                  className="rounded-2xl border border-brand-border bg-surface-2 p-3 hover:bg-white transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <ChannelIcon channel={conv.channel} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-muted line-clamp-2 leading-snug">{conv.lastMessage}</p>
                      <p className="text-[10px] text-subtle mt-1">{formatDateTime(conv.lastMessageAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* REVENUE */}
          {section === 'revenue' && (
            <>
              <div className="rounded-2xl bg-brand-blue-50 border border-brand-blue-light p-3">
                <p className="text-[11px] font-semibold text-brand-blue mb-1">Lifetime Value</p>
                <p
                  className="text-[22px] font-semibold text-brand-blue tabular-nums leading-none"
                >{formatCurrency(guest.lifetimeValue)}</p>
                <p className="text-[11px] text-muted mt-1">
                  {guest.totalVisits} visits · avg {formatCurrency(guest.totalVisits > 0 ? Math.round(guest.lifetimeValue / guest.totalVisits) : 0)} / stay
                </p>
              </div>
              <div className="rounded-2xl border border-brand-border bg-white overflow-hidden">
                {[
                  { label: 'Room Revenue',      pct: 0.72 },
                  { label: 'F&B',               pct: 0.15 },
                  { label: 'Spa & Experiences', pct: 0.09 },
                  { label: 'Upsells',           pct: 0.04 },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    className={cn('flex justify-between items-center px-3 py-2.5', i < arr.length - 1 && 'border-b border-border-soft')}
                  >
                    <span className="text-[12px] text-muted">{item.label}</span>
                    <span className="text-[12px] font-semibold text-muted tabular-nums">
                      {formatCurrency(Math.round(guest.lifetimeValue * item.pct))}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAGS & NOTES */}
          {section === 'tags_notes' && (
            <>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-subtle">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {guest.tags.length === 0 ? (
                    <p className="text-[12px] text-subtle">No tags yet.</p>
                  ) : guest.tags.map(tag => (
                    <span
                      key={tag}
                      className={cn(
                        'text-[11px] font-medium px-2.5 py-1 rounded-md',
                        tag === 'VIP'
                          ? 'bg-brand-blue-50 text-brand-blue'
                          : 'bg-surface-3 text-muted border border-brand-border',
                      )}
                    >{tag}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-subtle">Notes</p>
                {guest.notes ? (
                  <p className="text-[12px] text-muted leading-relaxed bg-surface-2 rounded-2xl p-3 border border-brand-border whitespace-pre-line">
                    {guest.notes}
                  </p>
                ) : (
                  <p className="text-[12px] text-subtle">No notes yet.</p>
                )}
              </div>
            </>
          )}

          {/* QUICK ACTIONS */}
          {section === 'actions' && (
            <div className="space-y-2">
              {[
                { id: 'send_msg',     label: 'Send message',     hint: 'Open Inbox with this guest', icon: Send     },
                { id: 'send_upsell',  label: 'Send upsell',      hint: 'Use the Upsell engine',      icon: Sparkles },
                { id: 'add_seq',      label: 'Add to sequence',  hint: 'Enrol into automation',      icon: ListPlus },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    onClick={() => addToast({ type: 'success', title: a.label })}
                    className="w-full flex items-center gap-3 rounded-xl border border-brand-border bg-surface-3 hover:bg-white p-3 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12px] font-semibold text-muted">{a.label}</p>
                      <p className="text-[10px] text-subtle">{a.hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
