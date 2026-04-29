import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Send, FileText, ArrowUpRight, ArrowLeft, CheckCircle, Phone, Mail, Plus, Star, Tag, ChevronDown, Filter,
  AlertTriangle, Settings2, Smile, Paperclip, Mic, Languages, MoreHorizontal, ArrowLeftRight, ChevronRight, X,
  User, BedDouble, Database, Zap, Activity, TrendingUp, PhoneCall, ArrowDownUp, MailOpen, Combine, Keyboard, Check, Building2,
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { mockConversations } from '../../data/mock/conversations';
import { mockGuests } from '../../data/mock/guests';
import { mockReservations } from '../../data/mock/reservations';
import { mockUsers } from '../../data/mock/users';
import { lookupTranslation } from '../../data/mock/translations';
import { formatDateTime, formatRelativeTime, formatDate, formatCurrency, channelLabels, cn } from '../../utils';
import type { Conversation } from '../../types';
import { useApp } from '../../app/AppContext';
import { usePopover } from '../../hooks/usePopover';
import { useFocusTrap } from '../../hooks/useFocusTrap';

type InboxView =
  | 'all'
  | 'unread'
  | 'new'
  | 'pending'
  | 'paused'
  | 'urgent'
  | 'closed'
  | 'my_all'
  | 'my_new'
  | 'my_pending'
  | 'my_paused'
  | 'my_urgent'
  | 'my_closed';

type GuestSidebarSection =
  | 'info'
  | 'reservation'
  | 'pms'
  | 'actions'
  | 'engines'
  | 'signals'
  | 'properties'
  | 'calls'
  | 'tags_notes';

const viewLabels: Record<InboxView, string> = {
  all: 'All',
  unread: 'Unread',
  new: 'New',
  pending: 'Pending',
  paused: 'Paused',
  urgent: 'Urgent',
  closed: 'Closed',
  my_all: 'Assigned to me',
  my_new: 'My new',
  my_pending: 'My pending',
  my_paused: 'My paused',
  my_urgent: 'My urgent',
  my_closed: 'My closed',
};

const priorityBorder: Record<string, string> = {
  urgent: 'border-l-brand-blue',
  high:   'border-l-[#D1CFCF]',
  normal: 'border-l-transparent',
  low:    'border-l-transparent',
};

const statusDot: Record<string, string> = {
  open:       'bg-brand-blue',
  pending:    'bg-[#D1CFCF]',
  escalated:  'bg-brand-black',
  resolved:   'bg-[#D1CFCF]',
  ai_handled: 'bg-[#D1CFCF]',
};

const mockTemplates = [
  { id: 't1', category: 'Welcome',   title: 'Welcome greeting',      body: 'Dear {{guest_name}}, welcome to {{hotel_name}}! We are delighted to have you with us. Please do not hesitate to reach out if there is anything we can do to make your stay more comfortable.' },
  { id: 't2', category: 'Welcome',   title: 'Pre-arrival message',   body: 'Dear {{guest_name}}, we are looking forward to welcoming you on {{check_in_date}}. Your room will be ready from 15:00. Please let us know your estimated arrival time.' },
  { id: 't3', category: 'Check-in',  title: 'Early check-in offer',  body: 'Dear {{guest_name}}, we are pleased to inform you that early check-in is available for your arrival. We can have your room ready by 11:00 for a small additional fee. Would you like us to arrange this?' },
  { id: 't4', category: 'Check-in',  title: 'Room ready',            body: 'Dear {{guest_name}}, great news — your room {{room_number}} is now ready! Our team at reception is looking forward to welcoming you. Safe travels!' },
  { id: 't5', category: 'Upsell',    title: 'Spa package',           body: 'Dear {{guest_name}}, we would like to offer you our exclusive Spa & Wellness package during your stay. Enjoy a 60-minute massage and full access to our facilities for just €80. Shall we book a slot for you?' },
  { id: 't6', category: 'Upsell',    title: 'Dinner reservation',    body: 'Dear {{guest_name}}, we would love to invite you to experience our award-winning restaurant Le Jardin. We have availability tonight at 19:30 and 21:00. May we reserve a table for you?' },
  { id: 't7', category: 'Upsell',    title: 'Room upgrade',          body: 'Dear {{guest_name}}, we are pleased to offer you a complimentary room upgrade to our {{room_type}} suite, subject to availability. Would you like us to arrange this for your stay?' },
  { id: 't8', category: 'Check-out', title: 'Late check-out offer',  body: 'Dear {{guest_name}}, we hope you are enjoying your stay! We can offer you a late check-out until 14:00 at no extra charge. Would you like to extend your morning with us?' },
  { id: 't9', category: 'Check-out', title: 'Farewell & feedback',   body: 'Dear {{guest_name}}, it has been a pleasure hosting you. We hope your stay exceeded your expectations. We would be grateful if you could share your experience with a review. Safe travels!' },
  { id: 't10', category: 'Apology',  title: 'Inconvenience apology', body: 'Dear {{guest_name}}, we sincerely apologise for any inconvenience caused. We take all feedback seriously and have already taken steps to address this. As a token of our apology, we would like to offer you a complimentary amenity.' },
  { id: 't11', category: 'Apology',  title: 'Noise apology',         body: 'Dear {{guest_name}}, we sincerely apologise for the disturbance you experienced. We have taken immediate action to resolve the issue and ensure your comfort for the remainder of your stay.' },
  { id: 't12', category: 'Request',  title: 'Extra towels',          body: 'Dear {{guest_name}}, of course! We will have fresh towels delivered to your room within the next 15 minutes. Is there anything else we can assist you with?' },
  { id: 't13', category: 'Request',  title: 'Housekeeping scheduled',body: 'Dear {{guest_name}}, housekeeping has been scheduled for your room at {{time}}. Our team will make every effort to minimise any disruption. Thank you for your patience.' },
];

const templateCategories = ['All', 'Welcome', 'Check-in', 'Upsell', 'Check-out', 'Apology', 'Request'];

const allReplyChannels: Conversation['channel'][] = [
  'whatsapp', 'email', 'messenger', 'instagram', 'telegram', 'sms', 'viber', 'web_widget',
];

const deptOptions = [
  { id: 'front_desk',  label: 'Front Desk'  },
  { id: 'concierge',   label: 'Concierge'   },
  { id: 'housekeeping',label: 'Housekeeping' },
  { id: 'fnb',         label: 'F&B'          },
  { id: 'engineering', label: 'Engineering'  },
] as const;

type DeptId = (typeof deptOptions)[number]['id'];

function getConvDept(conv: Conversation): DeptId {
  const tags = (conv.tags ?? []).join(' ').toLowerCase();
  const msg   = conv.lastMessage.toLowerCase();
  const engine = (conv.engineName ?? '').toLowerCase();
  if (tags.includes('maintenance') || tags.includes('repair') || msg.includes('broken') ||
      msg.includes('repair') || msg.includes('maintenance') || engine === 'recovery')
    return 'engineering';
  if (tags.includes('housekeep') || tags.includes('clean') || tags.includes('towel') ||
      msg.includes('housekeep') || msg.includes('towel') || msg.includes('cleaning'))
    return 'housekeeping';
  if (tags.includes('restaurant') || tags.includes('dining') || tags.includes('food') ||
      tags.includes('fnb') || msg.includes('restaurant') || msg.includes('breakfast') ||
      msg.includes('dinner') || msg.includes('lunch') || msg.includes('wine') || msg.includes('bordeaux'))
    return 'fnb';
  if (engine === 'concierge' || tags.includes('concierge') || tags.includes('recommendation') ||
      msg.includes('recommend') || msg.includes('taxi') || msg.includes('tour'))
    return 'concierge';
  return 'front_desk';
}

function languageLabel(code?: string) {
  if (!code) return '—';
  const c = code.toLowerCase();
  if (c === 'en') return 'English';
  if (c === 'fr') return 'French';
  if (c === 'de') return 'German';
  if (c === 'it') return 'Italian';
  if (c === 'es') return 'Spanish';
  if (c === 'uk') return 'Ukrainian';
  if (c === 'pl') return 'Polish';
  if (c === 'ru') return 'Russian';
  return code.toUpperCase();
}

const TAG_PALETTE = [
  { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' }, // pink
  { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }, // amber
  { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' }, // blue
  { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' }, // green
  { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' }, // violet
  { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' }, // gray
] as const;

function tagStyle(tag: string) {
  const t = tag.trim();
  const idx =
    Math.abs(Array.from(t).reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)) % TAG_PALETTE.length;
  return TAG_PALETTE[idx];
}

// ── Conversation row ────────────────────────────────────────────────────────

function ConvRow({ conv, isActive, onClick, listView = 'comfortable' }: {
  conv: Conversation; isActive: boolean; onClick: () => void;
  listView?: 'compact' | 'comfortable' | 'detailed';
}) {
  const lastChannel = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1]?.channel : conv.channel;
  const guest = mockGuests.find(g => g.id === conv.guestId);
  const [openTag, setOpenTag] = useState<string | null>(null);
  const rowTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of guest?.tags ?? []) {
      const v = t.trim();
      if (v) set.add(v);
    }
    for (const t of conv.tags ?? []) {
      const v = t.trim();
      if (v) set.add(v);
    }
    return Array.from(set);
  }, [guest?.tags, conv.tags]);

  const isCompact = listView === 'compact';
  const isDetailed = listView === 'detailed';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left border-b border-brand-border hover:bg-surface-2 transition-colors border-l-4',
        isCompact ? 'px-4 py-2' : 'px-4 pt-3.5 pb-3',
        isActive ? 'bg-brand-blue-50 border-l-brand-blue' : 'border-l-transparent',
      )}
    >
      <div className={cn('flex gap-2.5', isCompact ? 'items-center' : 'items-start')}>
        {!isCompact && (
          <Avatar
            name={conv.guestName}
            size="lg"
            badge={<ChannelIcon channel={lastChannel} size="sm" className="text-brand-blue" />}
          />
        )}
        <div className="flex-1 min-w-0">
          {/* Name + time (always shown) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isCompact && (
                <ChannelIcon channel={lastChannel} size="sm" className="text-subtle flex-shrink-0" />
              )}
              <span className={cn(
                'truncate',
                isCompact ? 'text-[12px]' : 'text-[14px]',
                conv.unreadCount > 0 ? 'font-semibold text-muted' : 'font-medium text-muted',
              )}>
                {conv.guestName}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-subtle tabular-nums whitespace-nowrap">
                {formatRelativeTime(conv.lastMessageAt)}
              </span>
              {conv.unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" aria-label="Unread" />
              )}
            </div>
          </div>

          {/* Last message — hidden in compact */}
          {!isCompact && (
            <p className="text-[10px] text-muted truncate leading-relaxed min-w-0 mt-0.5">
              {conv.lastMessage}
            </p>
          )}

          {/* Tags — only in detailed mode */}
          {isDetailed && rowTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {rowTags.map(t => {
                const s = tagStyle(t);
                const letter = t.trim().charAt(0).toUpperCase();
                const isOpen = openTag === t;
                return (
                  <span
                    key={t}
                    className={cn(
                      'inline-flex items-center border font-bold uppercase tracking-wider select-none transition-all duration-150 ease-out will-change-transform',
                      isOpen
                        ? 'h-7 px-3 rounded-full text-[10px]'
                        : 'w-7 h-7 justify-center rounded-full text-[10px]',
                      'hover:scale-[1.03] active:scale-[0.98]',
                    )}
                    style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
                    title={isOpen ? 'Collapse tag' : t}
                    role="button"
                    tabIndex={0}
                    aria-label={isOpen ? `Tag: ${t}` : `Tag: ${t}. Click to expand.`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenTag(prev => (prev === t ? null : t));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenTag(prev => (prev === t ? null : t));
                      }
                    }}
                  >
                    {isOpen ? t : letter}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Message bubble ──────────────────────────────────────────────────────────
function Bubble({
  msg,
  translatorEnabled,
  translateGuestToMy,
  guestLang,
  myLang,
  showOriginalById,
  toggleOriginal,
}: {
  msg: import('../../types').Message;
  translatorEnabled: boolean;
  translateGuestToMy: (text: string) => string;
  guestLang: string;
  myLang: string;
  showOriginalById: Set<string>;
  toggleOriginal: (id: string) => void;
}) {
  const isGuest    = msg.sender === 'guest';
  const isInternal = msg.isInternal;
  const isSystem   = msg.sender === 'system';

  // Strip any [XX] prefix that mock translation may have stored (e.g. "[DE] Guten Tag")
  const langPrefixMatch = msg.content.match(/^\[([A-Z]{2})\]\s*/);
  const msgLangCode     = langPrefixMatch ? langPrefixMatch[1] : null;
  const cleanContent    = langPrefixMatch
    ? msg.content.replace(/^\[[A-Z]{2}\]\s*/, '')
    : msg.content;

  const canTranslate  = translatorEnabled && isGuest && !isInternal && !isSystem;
  const showOriginal  = canTranslate && showOriginalById.has(msg.id);

  // "Translated" view  → clean content run through the translator (prefixed stripped)
  // "Original"  view  → the raw guest text, displayed as-is so it looks foreign to the agent
  const translatedText = translateGuestToMy(cleanContent).replace(/^\[[A-Z]{2}\]\s*/, '');
  const displayText    = canTranslate
    ? (showOriginal ? cleanContent : translatedText)
    : cleanContent;

  // ── System message ──────────────────────────────────────────────────────
  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="flex items-center gap-2 text-[10px] text-subtle bg-surface-3 px-3 py-1.5 rounded-full border border-brand-border">
          <ChannelIcon channel={msg.channel} size="sm" />
          <span>{cleanContent}</span>
          <span className="text-[#D1CFCF]">·</span>
          <span className="tabular-nums">{formatDateTime(msg.timestamp)}</span>
        </div>
      </div>
    );
  }

  // ── Internal note ───────────────────────────────────────────────────────
  if (isInternal) {
    return (
      <div className="flex gap-2.5 my-2 flex-row-reverse items-end">
        <div className="flex-shrink-0">
          <Avatar name={msg.senderName} size="lg" />
        </div>
        <div
          className="max-w-[70%] flex flex-col gap-1 items-end"
        >
          {/* Sender meta */}
          <div className="flex items-center gap-1.5 px-1 flex-row-reverse">
            <span className="text-[10px] font-medium text-subtle">{msg.senderName}</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#A07B20]">
              Note
            </span>
          </div>

          {/* Note body — subtle yellow. min-w prevents short notes
              from collapsing under the absolute-positioned timestamp. */}
          <div
            className="relative rounded-2xl rounded-tr-sm px-4 pt-3 pb-7 min-w-[148px]"
            style={{ backgroundColor: '#FFFBEB', border: '1px solid #F5E2A0' }}
          >
            <p className="text-[10px] leading-relaxed" style={{ color: '#3D2E00' }}>
              {cleanContent}
            </p>

            {/* Timestamp inside note bubble (bottom-right) */}
            <span className="absolute bottom-1.5 right-3 text-[10px] tabular-nums select-none text-faint">
              {formatDateTime(msg.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Regular guest / AI message ──────────────────────────────────────────
  return (
    <div className={cn('flex gap-2.5 my-2 items-end', isGuest ? '' : 'flex-row-reverse')}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isGuest
          ? <Avatar name={msg.senderName} size="lg" />
          : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
              style={{ backgroundColor: '#2355A7' }}
            >
              AI
            </div>
          )
        }
      </div>

      {/* Bubble column */}
      <div className={cn('max-w-[72%] flex flex-col gap-1', isGuest ? 'items-start' : 'items-end')}>

        {/* Sender meta row */}
        <div className={cn('flex items-center gap-1.5 px-1', isGuest ? '' : 'flex-row-reverse')}>
          <ChannelIcon channel={msg.channel} size="sm" className="opacity-60" />
          <span className="text-[10px] font-medium text-subtle">{msg.senderName}</span>
          {msg.engineName && (
            <span className="text-[10px] text-[#BED4F6] font-medium">{msg.engineName}</span>
          )}
        </div>

        {/* Bubble body — min-w guarantees short messages don't collapse below
            the timestamp width, otherwise the absolute-positioned timestamp
            overlaps the text. */}
        <div
          className={cn(
            'relative rounded-2xl px-4 pt-3 pb-7 transition-colors min-w-[148px]',
            isGuest
              ? cn(
                  'border rounded-tl-sm',
                  // When showing original (foreign lang), give a subtle tint to signal "raw / untranslated"
                  showOriginal
                    ? 'bg-surface-2 border-[#E2E5EA]'
                    : 'bg-white border-brand-border',
                )
              : 'rounded-tr-sm',
          )}
          style={!isGuest ? { backgroundColor: '#2355A7' } : undefined}
        >
          {/* Language badge when showing original */}
          {canTranslate && showOriginal && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-subtle bg-brand-border px-1.5 py-0.5 rounded-sm">
                {guestLang.toUpperCase()}
              </span>
              <span className="text-[10px] text-subtle">Original</span>
            </div>
          )}

          <p
            className={cn(
              'text-[10px] leading-relaxed transition-all',
              isGuest
                ? showOriginal
                  ? 'text-muted italic'   // Foreign-language look: muted + italic
                  : 'text-brand-black'
                : 'text-white',
            )}
          >
            {displayText}
          </p>

          {/* Timestamp inside bubble (bottom-right) */}
          <span
            className={cn(
              'absolute bottom-1.5 right-3 text-[10px] tabular-nums select-none',
              isGuest ? 'text-faint' : 'text-white/65',
            )}
          >
            {formatDateTime(msg.timestamp)}
          </span>
        </div>

        {/* Footer row */}
        <div className={cn('flex items-center gap-2 px-1', isGuest ? '' : 'flex-row-reverse')}>
          {/* Translated ↔ Original toggle */}
          {canTranslate && (
            <button
              type="button"
              onClick={() => toggleOriginal(msg.id)}
              className={cn(
                'flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 border transition-all',
                showOriginal
                  ? 'bg-surface-3 text-subtle border-[#E2E5EA] hover:bg-white hover:text-muted'
                  : 'bg-brand-blue-50 text-brand-blue border-brand-blue-light hover:bg-white',
              )}
            >
              <Languages className="w-3 h-3" />
              {showOriginal
                ? 'Show translated'
                : 'Show original'}
            </button>
          )}

          {/* Sent-in-language badge for outgoing translated AI messages */}
          {!isGuest && msgLangCode && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-white/50 bg-white/10 rounded-full px-2 py-0.5">
              <Languages className="w-3 h-3" />
              {msgLangCode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemEvent({ text }: { text: string }) {
  return (
    <div className="flex justify-center my-3">
      <div className="text-[10px] text-subtle bg-surface-3 px-3 py-1.5 rounded-full border border-brand-border">
        {text}
      </div>
    </div>
  );
}

function DateDivider({ date }: { date: Date }) {
  const today = new Date();
  const yest  = new Date(); yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  let label: string;
  if (sameDay(date, today)) label = 'Today';
  else if (sameDay(date, yest)) label = 'Yesterday';
  else label = date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex items-center gap-2 my-4" role="separator" aria-label={label}>
      <div className="flex-1 h-px bg-brand-border" />
      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-subtle bg-white px-2 py-0.5 rounded-full border border-brand-border">
        {label}
      </span>
      <div className="flex-1 h-px bg-brand-border" />
    </div>
  );
}

type SortKey = 'newest' | 'oldest' | 'unread';

const sortLabels: Record<SortKey, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  unread: 'Unread first',
};

// ── Page ────────────────────────────────────────────────────────────────────
export function InboxPage() {
  const { addToast } = useApp();
  const [params, setParams] = useSearchParams();
  const activeView = (params.get('view') as InboxView | null) ?? 'all';

  // Local copy of conversations so we can mark-as-unread, send replies, etc.
  // without mutating mock data shared across pages.
  const [conversations, setConversations] = useState<Conversation[]>(() => mockConversations);

  const [viewsOpen, setViewsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [listSettingsOpen, setListSettingsOpen] = useState(false);
  const [listView, setListView] = useState<'compact' | 'comfortable' | 'detailed'>('comfortable');
  const [filterDept, setFilterDept] = useState<DeptId | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mergeConvOpen, setMergeConvOpen] = useState(false);
  const [mergeConvQuery, setMergeConvQuery] = useState('');

  // Refs for keyboard shortcuts and composer autosize
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const convListRef = useRef<HTMLDivElement | null>(null);

  // Focus traps for the page's two real modals.
  const newConvDialogRef = useFocusTrap<HTMLDivElement>(newConvOpen);
  const shortcutsDialogRef = useFocusTrap<HTMLDivElement>(shortcutsOpen);

  const [channelFilter, setChannelFilter] = useState<Set<Conversation['channel']>>(new Set());
  const [tagFilter, setTagFilter] = useState<Set<string>>(new Set());

  const [newConvChannel, setNewConvChannel] = useState<Conversation['channel']>('whatsapp');
  const [newConvMessage, setNewConvMessage] = useState('');
  const [newConvRecipient, setNewConvRecipient] = useState('');
  const [newConvSubject, setNewConvSubject] = useState('');
  const [newConvGuestSearch, setNewConvGuestSearch] = useState('');
  const [newConvGuestId, setNewConvGuestId] = useState<string | null>(null);

  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendChannel, setSendChannel] = useState<Conversation['channel']>('whatsapp');
  const [sendChannelOpen, setSendChannelOpen] = useState(false);
  const [translatorEnabled, setTranslatorEnabled] = useState(false);
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [myLang, setMyLang] = useState<'en' | 'uk' | 'pl' | 'de' | 'fr' | 'es' | 'it' | 'ru'>('en');
  const [replyLang, setReplyLang] = useState<'en' | 'uk' | 'pl' | 'de' | 'fr' | 'es' | 'it' | 'ru'>('en');
  const [myLangOpen, setMyLangOpen] = useState(false);
  const [replyLangOpen, setReplyLangOpen] = useState(false);
  const [showOriginalById, setShowOriginalById] = useState<Set<string>>(new Set());
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [assigneeDept, setAssigneeDept] = useState<string | null>(null);
  const [assigneeQuery, setAssigneeQuery] = useState('');

  const [guestSidebarOpen, setGuestSidebarOpen] = useState(false);
  const [guestSidebarSection, setGuestSidebarSection] = useState<GuestSidebarSection>('info');
  const [newTagInput, setNewTagInput] = useState('');
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [editableNotes, setEditableNotes] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeQuery, setMergeQuery] = useState('');

  const guest = activeConv ? mockGuests.find(g => g.id === activeConv.guestId) : undefined;
  const reservation = activeConv ? mockReservations.find(r => r.guestId === activeConv.guestId) : undefined;
  const assignee = activeConv?.assignedTo ? mockUsers.find(u => u.id === activeConv.assignedTo) : null;
  const departments = useMemo(() => {
    return Array.from(new Set(mockUsers.map(u => u.department))).sort((a, b) => a.localeCompare(b));
  }, []);

  // Status selector removed (kept status logic elsewhere).

  const availableChannels = useMemo(() => {
    const set = new Set<Conversation['channel']>();
    for (const c of conversations) set.add(c.channel);
    // Ensure filter shows the full set of supported channels.
    for (const ch of ['sms', 'telegram', 'viber', 'web_widget'] as Conversation['channel'][]) set.add(ch);
    return Array.from(set);
  }, [conversations]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of conversations) for (const t of c.tags ?? []) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [conversations]);

  useEffect(() => {
    // Close guest drawer when switching conversations.
    setGuestSidebarOpen(false);
    setGuestSidebarSection('info');
    setProfileMenuOpen(false);
    setMergeOpen(false);
    setMergeQuery('');
    setMergeConvOpen(false);
    setMergeConvQuery('');
  }, [activeConv?.id]);

  const urgentConversations = useMemo(() => {
    return conversations.filter(c => c.priority === 'urgent' || c.status === 'escalated');
  }, [conversations]);

  const urgentCount = urgentConversations.length;
  const convsByDept = useMemo(() => {
    const counts = deptOptions.reduce((acc, d) => {
      acc[d.id] = 0;
      return acc;
    }, {} as Record<DeptId, number>);
    for (const c of conversations) counts[getConvDept(c)] += 1;
    return counts;
  }, [conversations]);

  const clientChannels = useMemo(() => {
    // In the spec: enabled only if available for this client. For mock, we assume all connected channels are possible,
    // but visually "available" are those that appear in the thread.
    if (!activeConv) return allReplyChannels;
    const set = new Set<Conversation['channel']>();
    for (const m of activeConv.messages) set.add(m.channel);
    if (set.size === 0) set.add(activeConv.channel);
    return Array.from(set);
  }, [activeConv]);

  const translator = useMemo(() => {
    const guestLang = (guest?.language ?? 'en').toLowerCase();
    const read = (['en', 'uk', 'pl', 'de', 'fr', 'es', 'it', 'ru'].includes(guestLang) ? guestLang : 'en') as typeof myLang;
    return { read };
  }, [guest]);

  useEffect(() => {
    if (!activeConv) return;
    setReplyLang(translator.read);
    setShowOriginalById(new Set());
    if (clientChannels.length > 0 && !clientChannels.includes(sendChannel)) {
      setSendChannel(clientChannels[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id, translator.read]);

  useEffect(() => {
    if (!activeConv) return;
    if (guest) {
      setEditableTags([...guest.tags]);
      setEditableNotes(guest.notes ?? '');
    }
    setNewTagInput('');
  }, [activeConv?.id]);

  // Composer autosize: grow with content up to 40 % of viewport.
  useEffect(() => {
    const ta = replyTextareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const max = Math.floor(window.innerHeight * 0.4);
    ta.style.height = Math.min(ta.scrollHeight, max) + 'px';
  }, [replyText, isInternal, translatorEnabled]);

  /**
   * Replace `{{guest_name}}` style tokens with values from the current
   * conversation context. Unknown tokens are left as-is so authors notice
   * them and can fill them in manually.
   */
  const fillTemplate = useCallback((body: string): string => {
    const upcomingDate = guest?.upcomingStayAt
      ? formatDate(guest.upcomingStayAt)
      : '{{check_in_date}}';
    const map: Record<string, string> = {
      guest_name:     guest?.name ?? '{{guest_name}}',
      hotel_name:     'Grand Suites',
      room_number:    reservation?.roomNumber ?? '{{room_number}}',
      room_type:      reservation?.roomType ?? '{{room_type}}',
      check_in_date:  upcomingDate,
      time:           '{{time}}',
    };
    return body.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (whole, key: string) => {
      const v = map[key.toLowerCase()];
      return v ?? whole;
    });
  }, [guest, reservation]);

  const languageOptions = useMemo(() => (['en', 'de', 'fr', 'es', 'it', 'uk', 'pl', 'ru'] as const), []);

  function mockTranslate(text: string, from: string, to: string) {
    if (!text.trim()) return text;
    if (from === to) return text;
    // Hand-curated ru↔en pairs live in data/mock/translations.ts.
    const hit = lookupTranslation(text, from, to);
    if (hit !== null) return hit;
    // Fallback for languages we haven't seeded — keep it visibly "translated".
    return `[${to.toUpperCase()}] ${text}`;
  }

  const translateGuestToMy = useMemo(() => {
    return (text: string) => mockTranslate(text, translator.read, myLang);
  }, [translator.read, myLang]);

  const translateMyToReply = useMemo(() => {
    return (text: string) => mockTranslate(text, myLang, replyLang);
  }, [myLang, replyLang]);

  function toggleOriginal(id: string) {
    setShowOriginalById(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const threadSystemEvents = useMemo(() => {
    if (!activeConv) return [];
    const events: string[] = [];
    if (activeConv.assignedTo) events.push(`Assigned to ${activeConv.assignedTo}`);
    events.push(`Status: ${activeConv.status}`);
    if (activeConv.priority === 'urgent') events.push('Priority set to urgent');
    return events;
  }, [activeConv]);

  const counts = useMemo(() => {
    const by: Record<InboxView, number> = Object.keys(viewLabels).reduce((acc, k) => {
      acc[k as InboxView] = 0;
      return acc;
    }, {} as Record<InboxView, number>);

    for (const c of conversations) {
      by.all += 1;
      if (c.unreadCount > 0) by.unread += 1;
      if (c.status === 'open' && c.unreadCount > 0) by.new += 1;
      if (c.status === 'pending') by.pending += 1;
      if (c.status === 'ai_handled') by.paused += 1;
      if (c.priority === 'urgent' || c.status === 'escalated') by.urgent += 1;
      if (c.status === 'resolved') by.closed += 1;

      if (c.assignedTo === 'user_003') {
        by.my_all += 1;
        if (c.status === 'open' && c.unreadCount > 0) by.my_new += 1;
        if (c.status === 'pending') by.my_pending += 1;
        if (c.status === 'ai_handled') by.my_paused += 1;
        if (c.priority === 'urgent' || c.status === 'escalated') by.my_urgent += 1;
        if (c.status === 'resolved') by.my_closed += 1;
      }
    }

    return by;
  }, []);

  const filtered = useMemo(() => {
    return conversations.filter(c => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = `${c.guestName} ${c.lastMessage}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (channelFilter.size > 0 && !channelFilter.has(c.channel)) return false;
      if (tagFilter.size > 0) {
        const tags = c.tags ?? [];
        let ok = false;
        for (const t of tags) {
          if (tagFilter.has(t)) { ok = true; break; }
        }
        if (!ok) return false;
      }

      if (filterDept && getConvDept(c) !== filterDept) return false;

      switch (activeView) {
        case 'all': return true;
        case 'unread': return c.unreadCount > 0;
        case 'new': return c.status === 'open' && c.unreadCount > 0;
        case 'pending': return c.status === 'pending';
        case 'paused': return c.status === 'ai_handled';
        case 'urgent': return c.priority === 'urgent' || c.status === 'escalated';
        case 'closed': return c.status === 'resolved';
        case 'my_all': return c.assignedTo === 'user_003';
        case 'my_new': return c.assignedTo === 'user_003' && c.status === 'open' && c.unreadCount > 0;
        case 'my_pending': return c.assignedTo === 'user_003' && c.status === 'pending';
        case 'my_paused': return c.assignedTo === 'user_003' && c.status === 'ai_handled';
        case 'my_urgent': return c.assignedTo === 'user_003' && (c.priority === 'urgent' || c.status === 'escalated');
        case 'my_closed': return c.assignedTo === 'user_003' && c.status === 'resolved';
        default: return true;
      }
    });
  }, [activeView, channelFilter, tagFilter, searchQuery, conversations, filterDept]);

  const sortedConversations = useMemo(() => {
    const arr = [...filtered];
    switch (sortKey) {
      case 'newest':
        arr.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        break;
      case 'oldest':
        arr.sort((a, b) => new Date(a.lastMessageAt).getTime() - new Date(b.lastMessageAt).getTime());
        break;
      case 'unread':
        arr.sort((a, b) => {
          const ua = a.unreadCount > 0 ? 1 : 0;
          const ub = b.unreadCount > 0 ? 1 : 0;
          if (ua !== ub) return ub - ua;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });
        break;
    }
    return arr;
  }, [filtered, sortKey]);

  const markAsUnread = useCallback((id: string) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, unreadCount: Math.max(1, c.unreadCount) } : c,
    ));
    addToast({ type: 'info', title: 'Marked as unread' });
  }, [addToast]);

  const markAsRead = useCallback((id: string) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, unreadCount: 0 } : c,
    ));
  }, []);

  const handleConvOpen = useCallback((conv: Conversation) => {
    setActiveConv(conv);
    setReplyText('');
    if (conv.unreadCount > 0) markAsRead(conv.id);
  }, [markAsRead]);

  // ── Keyboard shortcuts ───────────────────────────────────────────
  // Global hotkeys for the Inbox page. Skipped when focus is in an editable
  // element so users can still type into search / textareas freely. Cmd+Enter
  // to send is wired on the textarea directly (handled separately).
  useEffect(() => {
    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    };

    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Escape closes the topmost popover regardless of focus.
      if (e.key === 'Escape') {
        if (shortcutsOpen)     { setShortcutsOpen(false); return; }
        if (newConvOpen)       { setNewConvOpen(false); return; }
        if (assigneeOpen)      { setAssigneeOpen(false); return; }
        if (templatesOpen)     { setTemplatesOpen(false); return; }
        if (sortOpen)          { setSortOpen(false); return; }
        if (filtersOpen)       { setFiltersOpen(false); return; }
        if (viewsOpen)         { setViewsOpen(false); return; }
        if (urgentOpen)        { setUrgentOpen(false); return; }
        if (listSettingsOpen)  { setListSettingsOpen(false); return; }
        if (sendChannelOpen)   { setSendChannelOpen(false); return; }
        if (myLangOpen)        { setMyLangOpen(false); return; }
        if (replyLangOpen)     { setReplyLangOpen(false); return; }
        if (profileMenuOpen)   { setProfileMenuOpen(false); return; }
        if (mergeConvOpen)     { setMergeConvOpen(false); return; }
        if (mergeOpen)         { setMergeOpen(false); return; }
        if (guestSidebarOpen)  { setGuestSidebarOpen(false); return; }
        return;
      }

      if (isEditable(e.target)) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (e.key === 'r' && activeConv) {
        e.preventDefault();
        replyTextareaRef.current?.focus();
        return;
      }
      if (e.key === 'e' && activeConv) {
        e.preventDefault();
        markAsUnread(activeConv.id);
        setActiveConv(null);
        return;
      }
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        const list = sortedConversations;
        if (list.length === 0) return;
        const idx = activeConv ? list.findIndex(c => c.id === activeConv.id) : -1;
        const next = list[Math.min(list.length - 1, idx + 1)];
        if (next) handleConvOpen(next);
        return;
      }
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        const list = sortedConversations;
        if (list.length === 0) return;
        const idx = activeConv ? list.findIndex(c => c.id === activeConv.id) : 0;
        const prev = list[Math.max(0, idx - 1)];
        if (prev) handleConvOpen(prev);
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [
    shortcutsOpen, newConvOpen, assigneeOpen, templatesOpen, sortOpen, filtersOpen,
    viewsOpen, urgentOpen, listSettingsOpen, sendChannelOpen, myLangOpen, replyLangOpen,
    profileMenuOpen, mergeConvOpen, mergeOpen, guestSidebarOpen,
    activeConv, sortedConversations, handleConvOpen, markAsUnread,
  ]);

  const handleSend = () => {
    if (!activeConv) return;
    if (!replyText.trim()) return;
    const now = new Date().toISOString();
    const content = isInternal
      ? replyText.trim()
      : (translatorEnabled ? translateMyToReply(replyText.trim()) : replyText.trim());

    const nextMsg: import('../../types').Message = {
      id: `msg_local_${Date.now()}`,
      conversationId: activeConv.id,
      sender: 'agent',
      senderName: isInternal ? 'Internal note' : 'Sophie',
      content,
      channel: sendChannel,
      timestamp: now,
      isInternal,
    };

    setActiveConv(prev => {
      if (!prev) return prev;
      const nextMessages = [...(prev.messages ?? []), nextMsg];
      return {
        ...prev,
        messages: nextMessages,
        lastMessage: content,
        lastMessageAt: now,
      };
    });

    setConversations(prev => prev.map(c =>
      c.id === activeConv.id
        ? { ...c, messages: [...c.messages, nextMsg], lastMessage: content, lastMessageAt: now }
        : c,
    ));

    addToast({ type: 'success', title: isInternal ? 'Note saved' : 'Message sent' });
    setReplyText('');
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: list ── */}
      <div className="w-[300px] flex-shrink-0 border-r border-brand-border bg-white flex flex-col">
        {/* Inbox menu row (views + filters + add) */}
        <div className="px-3 py-2.5 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setViewsOpen(v => !v)}
                className={cn(
                  'group h-10 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-2 transition-colors',
                  viewsOpen
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'bg-surface-3 border-brand-border text-[#5C6370] hover:bg-brand-blue hover:border-brand-blue hover:text-white',
                )}
              >
                <span className="font-semibold uppercase tracking-[0.08em]">ALL</span>
                <span className={cn('font-semibold tabular-nums', viewsOpen ? 'text-white/80' : 'text-[#8B9299] group-hover:text-white/80')}>{counts.unread}</span>
                <ChevronDown className={cn('w-3.5 h-3.5', viewsOpen ? 'text-white/80' : 'text-[#8B9299] group-hover:text-white/80')} />
              </button>

              {viewsOpen && (
                <div className="absolute left-0 mt-2 w-[260px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Statuses</p>
                  </div>
                  {(['unread', 'new', 'pending', 'paused', 'urgent', 'closed'] as InboxView[]).map(v => (
                    <button
                      key={v}
                      onClick={() => { setViewsOpen(false); setParams(prev => { prev.set('view', v); return prev; }); }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] transition-colors',
                        activeView === v ? 'bg-brand-blue-50 text-muted' : 'text-muted hover:bg-surface-3 hover:text-muted',
                      )}
                    >
                      <span className="font-medium">{viewLabels[v]}</span>
                      <span className="text-subtle tabular-nums font-semibold">{counts[v]}</span>
                    </button>
                  ))}
                  <div className="my-2 h-px bg-brand-border" />
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Mine</p>
                  </div>
                  {(['my_all', 'my_new', 'my_pending', 'my_paused', 'my_urgent', 'my_closed'] as InboxView[]).map(v => (
                    <button
                      key={v}
                      onClick={() => { setViewsOpen(false); setParams(prev => { prev.set('view', v); return prev; }); }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] transition-colors',
                        activeView === v ? 'bg-brand-blue-50 text-muted' : 'text-muted hover:bg-surface-3 hover:text-muted',
                      )}
                    >
                      <span className="font-medium">{viewLabels[v]}</span>
                      <span className="text-subtle tabular-nums font-semibold">{counts[v]}</span>
                    </button>
                  ))}
                  <div className="my-2 h-px bg-brand-border" />
                  <button
                    onClick={() => { setViewsOpen(false); addToast({ type: 'info', title: 'Add new Inbox', message: 'Inbox configuration will be added next.' }); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-brand-blue hover:bg-brand-blue-50 transition-colors"
                  >
                    Add new Inbox
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setFiltersOpen(v => !v)}
                className={cn(
                  'h-10 w-10 rounded-lg border flex items-center justify-center transition-colors',
                  filtersOpen
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'bg-surface-3 border-brand-border text-[#5C6370] hover:bg-brand-blue hover:border-brand-blue hover:text-white',
                )}
                title="Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
              {filtersOpen && (
                <div className="absolute left-0 mt-2 w-[280px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Filter channels</p>
                    <button
                      className="text-[11px] font-semibold text-brand-blue hover:underline"
                      onClick={() => { setChannelFilter(new Set()); setTagFilter(new Set()); }}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="sr-only">Channels</p>
                      <div className="flex flex-wrap gap-1.5">
                        {availableChannels.map(ch => {
                          const selected = channelFilter.has(ch);
                          return (
                            <button
                              key={ch}
                              onClick={() => {
                                setChannelFilter(prev => {
                                  const next = new Set(prev);
                                  next.has(ch) ? next.delete(ch) : next.add(ch);
                                  return next;
                                });
                              }}
                              className={cn(
                                'px-2 py-1 rounded-md text-[11px] font-medium border transition-colors',
                                selected
                                  ? 'bg-brand-blue-50 border-brand-blue-light text-brand-blue'
                                  : 'bg-surface-3 border-brand-border text-muted hover:bg-white',
                              )}
                            >
                              {channelLabels[ch]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em] mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-auto pr-1">
                        {availableTags.map(t => {
                          const selected = tagFilter.has(t);
                          return (
                            <button
                              key={t}
                              onClick={() => {
                                setTagFilter(prev => {
                                  const next = new Set(prev);
                                  next.has(t) ? next.delete(t) : next.add(t);
                                  return next;
                                });
                              }}
                              className={cn(
                                'px-2 py-1 rounded-md text-[11px] font-medium border transition-colors',
                                selected
                                  ? 'bg-brand-black border-brand-black text-white'
                                  : 'bg-surface-3 border-brand-border text-muted hover:bg-white',
                              )}
                            >
                              {t}
                            </button>
                          );
                        })}
                        {availableTags.length === 0 && (
                          <span className="text-[11px] text-subtle">No tags.</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => addToast({ type: 'info', title: 'Custom filters', message: 'Custom filter builder will be added next.' })}
                        className="w-full h-8 rounded-lg border border-brand-border bg-white text-[12px] font-medium text-brand-black hover:bg-surface-3 transition-colors"
                      >
                        Create custom filter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen(v => !v)}
                className={cn(
                  'group h-10 px-2.5 rounded-lg border text-[12px] font-medium flex items-center gap-1.5 transition-colors',
                  sortOpen
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'bg-surface-3 border-brand-border text-[#5C6370] hover:bg-brand-blue hover:border-brand-blue hover:text-white',
                )}
                title="Sort"
                aria-haspopup="menu"
                aria-expanded={sortOpen}
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                <ChevronDown className={cn('w-3 h-3', sortOpen ? 'text-white/80' : 'text-[#8B9299] group-hover:text-white/80')} />
              </button>
              {sortOpen && (
                <div role="menu" className="absolute left-0 mt-2 w-[180px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
                  <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Sort by</p>
                  {(Object.keys(sortLabels) as SortKey[]).map(k => (
                    <button
                      key={k}
                      role="menuitemradio"
                      aria-checked={sortKey === k}
                      onClick={() => { setSortKey(k); setSortOpen(false); }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] transition-colors',
                        sortKey === k ? 'bg-brand-blue-50 text-brand-blue' : 'text-muted hover:bg-surface-3',
                      )}
                    >
                      <span className="font-medium">{sortLabels[k]}</span>
                      {sortKey === k && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => { setNewConvOpen(true); setNewConvMessage(''); }}
              className="ml-auto h-10 w-10 rounded-lg bg-brand-blue-50 border border-brand-blue-light flex items-center justify-center text-brand-blue hover:bg-[#E3EBFA] transition-colors"
              title="Add conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search (as part of submenu spec) */}
          <div className="relative mt-2.5 z-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle" />
            <input
              ref={searchInputRef}
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search conversations"
              className="w-full h-10 pl-9 pr-3 text-[12px] bg-surface-3 rounded-lg border border-brand-border placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => { setUrgentOpen(v => !v); setListSettingsOpen(false); }}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-colors flex items-center justify-center',
                    urgentOpen
                      ? 'bg-brand-blue text-white'
                      : filterDept
                        ? 'text-brand-blue hover:bg-brand-blue hover:text-white'
                        : 'text-[#8B9299] hover:bg-brand-blue hover:text-white',
                  )}
                  title="Filter by department"
                >
                  <div className="relative">
                    <Building2 className="w-4 h-4" />
                    {filterDept && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-blue" />
                    )}
                  </div>
                </button>
                {urgentOpen && (
                  <div className="absolute right-0 mt-2 w-[220px] bg-white border border-brand-border rounded-xl shadow-panel z-[300] p-2">
                    <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">
                      Departments
                    </p>
                    {/* All */}
                    <button
                      onClick={() => { setFilterDept(null); setUrgentOpen(false); }}
                      className={cn(
                        'w-full px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between text-[12px]',
                        !filterDept ? 'bg-brand-blue-50 text-brand-blue' : 'hover:bg-surface-3 text-brand-black',
                      )}
                    >
                      <span className="font-medium">All</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('font-semibold tabular-nums', !filterDept ? 'text-brand-blue' : 'text-subtle')}>
                          {conversations.length}
                        </span>
                        {!filterDept && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                    {deptOptions.map(d => {
                      const isActive = filterDept === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() => { setFilterDept(isActive ? null : d.id); setUrgentOpen(false); }}
                          className={cn(
                            'w-full px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between text-[12px]',
                            isActive ? 'bg-brand-blue-50 text-brand-blue' : 'hover:bg-surface-3 text-brand-black',
                          )}
                        >
                          <span className="font-medium">{d.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn('font-semibold tabular-nums', isActive ? 'text-brand-blue' : 'text-subtle')}>
                              {convsByDept[d.id]}
                            </span>
                            {isActive && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => { setListSettingsOpen(v => !v); setUrgentOpen(false); }}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-colors flex items-center justify-center',
                    listSettingsOpen
                      ? 'bg-brand-blue text-white'
                      : 'text-[#8B9299] hover:bg-brand-blue hover:text-white',
                  )}
                  title="List settings"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                {listSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-[220px] bg-white border border-brand-border rounded-xl shadow-panel z-[300] p-2">
                    <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">
                      List view
                    </p>
                    {([
                      { id: 'compact',     label: 'Compact',     desc: 'Name + time only'          },
                      { id: 'comfortable', label: 'Comfortable', desc: 'Name + preview'             },
                      { id: 'detailed',    label: 'Detailed',    desc: 'With tags'                  },
                    ] as const).map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setListView(opt.id); setListSettingsOpen(false); }}
                        className={cn(
                          'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-colors text-left',
                          listView === opt.id ? 'bg-brand-blue-50 text-brand-blue' : 'hover:bg-surface-3 text-brand-black',
                        )}
                      >
                        <div>
                          <p className="text-[12px] font-medium">{opt.label}</p>
                          <p className="text-[10px] text-subtle">{opt.desc}</p>
                        </div>
                        {listView === opt.id && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conversation list */}
        <div ref={convListRef} className="flex-1 overflow-y-auto">
          {sortedConversations.map(conv => (
            <ConvRow
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeConv?.id}
              onClick={() => handleConvOpen(conv)}
              listView={listView}
            />
          ))}
          {sortedConversations.length === 0 && (
            <div className="px-6 py-10 text-center text-[12px] text-subtle">
              No conversations match the current filters.
            </div>
          )}
        </div>
      </div>

      {/* New conversation modal */}
      {newConvOpen && (() => {
        const isPhone   = ['whatsapp','sms','viber','telegram'].includes(newConvChannel);
        const isEmail   = newConvChannel === 'email';
        const isSocial  = ['messenger','instagram'].includes(newConvChannel);
        const isWidget  = newConvChannel === 'web_widget';

        const recipientLabel    = isPhone  ? 'Phone number' : isEmail ? 'Email address' : isSocial ? 'Profile URL or username' : '';
        const recipientPh       = isPhone  ? '+1 234 567 8900' : isEmail ? 'guest@example.com' : isSocial ? '@username or https://…' : '';

        const filteredGuests = mockGuests.filter(g =>
          newConvGuestSearch.trim() === '' ? false :
          g.name.toLowerCase().includes(newConvGuestSearch.toLowerCase()) ||
          g.email.toLowerCase().includes(newConvGuestSearch.toLowerCase())
        );
        const selectedGuest = mockGuests.find(g => g.id === newConvGuestId);

        const canCreate = !isWidget && newConvRecipient.trim() && newConvMessage.trim();

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="New conversation">
            <button className="absolute inset-0 bg-brand-black/20" onClick={() => setNewConvOpen(false)} aria-label="Close" />
            <div ref={newConvDialogRef} className="relative w-[560px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden">

              {/* Header */}
              <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em] mb-1">Compose</p>
                  <h3 className="text-[16px] font-semibold text-muted">New conversation</h3>
                </div>
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors text-[18px] leading-none mt-0.5"
                  onClick={() => { setNewConvOpen(false); setNewConvRecipient(''); setNewConvSubject(''); setNewConvGuestSearch(''); setNewConvGuestId(null); setNewConvMessage(''); }}
                >×</button>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

                {/* ── Channel grid ── */}
                <div>
                  <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2.5">Channel</p>
                  <div className="grid grid-cols-4 gap-2">
                    {allReplyChannels.map(ch => {
                      const sel = newConvChannel === ch;
                      return (
                        <button
                          key={ch}
                          onClick={() => { setNewConvChannel(ch); setNewConvRecipient(''); setNewConvSubject(''); }}
                          className={cn(
                            'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[11px] font-medium transition-colors',
                            sel
                              ? 'bg-brand-blue-50 border-brand-blue-light text-brand-blue'
                              : 'bg-surface-2 border-brand-border text-muted hover:bg-white hover:border-[#D1D5DB]',
                          )}
                        >
                          <ChannelIcon channel={ch} size="md" className={sel ? 'text-brand-blue' : 'text-subtle'} />
                          {channelLabels[ch]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Guest search ── */}
                <div>
                  <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">Guest profile</p>
                  {selectedGuest ? (
                    <div className="flex items-center gap-3 p-3 bg-brand-blue-50 border border-brand-blue-light rounded-xl">
                      <Avatar name={selectedGuest.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-muted truncate">{selectedGuest.name}</p>
                        <p className="text-[11px] text-muted truncate">{selectedGuest.email}</p>
                      </div>
                      <button
                        onClick={() => { setNewConvGuestId(null); setNewConvGuestSearch(''); }}
                        className="text-subtle hover:text-muted text-[16px] leading-none"
                      >×</button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                      <input
                        value={newConvGuestSearch}
                        onChange={e => setNewConvGuestSearch(e.target.value)}
                        placeholder="Search guest by name or email…"
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-muted placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                      />
                      {filteredGuests.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-brand-border rounded-xl shadow-panel z-10 p-1.5 max-h-[160px] overflow-y-auto">
                          {filteredGuests.map(g => (
                            <button
                              key={g.id}
                              onClick={() => { setNewConvGuestId(g.id); setNewConvGuestSearch(''); if (!newConvRecipient) setNewConvRecipient(isEmail ? g.email : g.phone ?? ''); }}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-surface-3 flex items-center gap-2.5 transition-colors"
                            >
                              <Avatar name={g.name} size="sm" />
                              <div className="min-w-0">
                                <p className="text-[12px] font-medium text-muted truncate">{g.name}</p>
                                <p className="text-[11px] text-subtle truncate">{g.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Channel-specific recipient fields ── */}
                {!isWidget && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">{recipientLabel}</p>
                      <input
                        value={newConvRecipient}
                        onChange={e => setNewConvRecipient(e.target.value)}
                        placeholder={recipientPh}
                        type={isEmail ? 'email' : 'text'}
                        className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-muted placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                      />
                    </div>

                    {isEmail && (
                      <div>
                        <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">Subject</p>
                        <input
                          value={newConvSubject}
                          onChange={e => setNewConvSubject(e.target.value)}
                          placeholder="E.g. Your upcoming stay at Grand Suites"
                          className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-muted placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Widget note */}
                {isWidget && (
                  <div className="flex items-start gap-2.5 p-3 bg-surface-3 border border-brand-border rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-subtle flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-muted leading-relaxed">Web Widget conversations can only be initiated by the guest. You cannot start an outbound thread via this channel.</p>
                  </div>
                )}

                {/* ── Message ── */}
                {!isWidget && (
                  <div>
                    <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">Message</p>
                    <textarea
                      value={newConvMessage}
                      onChange={e => setNewConvMessage(e.target.value)}
                      rows={4}
                      placeholder="Write the first message…"
                      className="w-full resize-none text-[13px] rounded-xl border border-brand-border bg-surface-2 px-4 py-3 placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-brand-border flex items-center justify-between gap-3">
                <p className="text-[11px] text-subtle">
                  {selectedGuest ? `To: ${selectedGuest.name}` : newConvRecipient ? `To: ${newConvRecipient}` : 'No recipient selected'}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setNewConvOpen(false); setNewConvRecipient(''); setNewConvSubject(''); setNewConvGuestSearch(''); setNewConvGuestId(null); setNewConvMessage(''); }}>Cancel</Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!canCreate}
                    onClick={() => {
                      addToast({ type: 'success', title: 'Conversation created', message: `Via ${channelLabels[newConvChannel]} → ${newConvRecipient}` });
                      setNewConvOpen(false);
                      setNewConvRecipient(''); setNewConvSubject(''); setNewConvGuestSearch(''); setNewConvGuestId(null); setNewConvMessage('');
                    }}
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </Button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Center: thread ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface-2">
        {activeConv ? (
          <>
            {/* Thread header */}
            <div className="relative z-30 bg-white border-b border-brand-border px-5 py-3 flex items-center gap-2 flex-shrink-0">
              {/* Assignment + status (keep compact) */}
              <div className="relative">
                <button
                  onClick={() => {
                    const nextOpen = !assigneeOpen;
                    setAssigneeOpen(nextOpen);
                    if (nextOpen) {
                      setAssigneeDept(assignee?.department ?? departments[0] ?? null);
                      setAssigneeQuery('');
                    }
                  }}
                  className="h-10 px-3 rounded-lg bg-surface-3 border border-brand-border text-muted flex items-center gap-2 hover:bg-white transition-colors max-w-[240px]"
                  title="Department / employee"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-strong truncate">
                      {assignee?.name ?? 'Unassigned'}
                    </span>
                    <span className="text-[12px] text-subtle flex-shrink-0">·</span>
                    <span className="text-[12px] text-subtle truncate">
                      {assignee?.department ?? (assigneeDept ?? 'Department')}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-subtle" />
                </button>
                {assigneeOpen && (
                  <div className="absolute left-0 mt-2 w-[540px] bg-white border border-brand-border rounded-2xl shadow-panel z-[200] overflow-hidden">
                    <div className="grid grid-cols-[220px_1fr]">
                      {/* Left: departments */}
                      <div className="border-r border-brand-border">
                        <div className="px-3 py-2 border-b border-brand-border">
                          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Departments</p>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto p-2">
                          {departments.map(dep => {
                            const active = dep === assigneeDept;
                            return (
                              <button
                                key={dep}
                                type="button"
                                onClick={() => { setAssigneeDept(dep); setAssigneeQuery(''); }}
                                className={cn(
                                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors',
                                  active ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
                                )}
                              >
                                <span className={cn('text-[12px] font-medium truncate', active ? 'text-brand-blue' : 'text-strong')}>{dep}</span>
                                <ChevronDown className={cn('w-3.5 h-3.5 ml-auto -rotate-90', active ? 'text-brand-blue' : 'text-faint')} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: people */}
                      <div>
                        <div className="px-3 py-2 border-b border-brand-border flex items-center justify-between gap-2">
                          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em] truncate">
                            {assigneeDept ?? 'People'}
                          </p>
                          <button
                            type="button"
                            onClick={() => { setAssigneeOpen(false); setActiveConv(prev => (prev ? { ...prev, assignedTo: null } : prev)); }}
                            className="text-[11px] font-semibold text-brand-blue hover:underline flex-shrink-0"
                          >
                            Unassign
                          </button>
                        </div>
                        <div className="px-3 pt-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle" />
                            <input
                              value={assigneeQuery}
                              onChange={e => setAssigneeQuery(e.target.value)}
                              placeholder="Search manager…"
                              className="w-full h-8 pl-8 pr-3 rounded-lg border border-brand-border bg-surface-3 text-[12px] text-strong placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition"
                            />
                          </div>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto p-2">
                          {(assigneeDept ? mockUsers.filter(u => u.department === assigneeDept) : mockUsers)
                            .filter(u => {
                              const q = assigneeQuery.trim().toLowerCase();
                              if (!q) return true;
                              return `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q);
                            })
                            .map(u => {
                            const active = activeConv?.assignedTo === u.id;
                            const initials = u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
                            return (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setAssigneeOpen(false);
                                  setActiveConv(prev => (prev ? { ...prev, assignedTo: u.id } : prev));
                                  addToast({ type: 'success', title: 'Assigned', message: `${u.name}` });
                                }}
                                className={cn(
                                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors',
                                  active ? 'bg-brand-blue-50' : 'hover:bg-surface-3',
                                )}
                              >
                                <span className={cn(
                                  'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                                  active ? 'bg-brand-blue text-white' : 'bg-surface-3 text-muted border border-brand-border',
                                )}>{initials}</span>
                                <div className="min-w-0">
                                  <div className={cn('text-[12px] font-medium truncate', active ? 'text-brand-blue' : 'text-strong')}>
                                    {u.name}
                                  </div>
                                  <div className="text-[10px] text-subtle truncate">{u.role}</div>
                                </div>
                              </button>
                            );
                          })}
                          {((assigneeDept ? mockUsers.filter(u => u.department === assigneeDept) : mockUsers)
                            .filter(u => {
                              const q = assigneeQuery.trim().toLowerCase();
                              if (!q) return true;
                              return `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q);
                            }).length === 0) && (
                            <div className="px-3 py-10 text-center text-[12px] text-subtle">
                              No results
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status menu removed */}

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!activeConv) return;
                    markAsUnread(activeConv.id);
                    setActiveConv(null);
                  }}
                  title="Mark as unread (E)"
                  aria-label="Mark as unread"
                  className="h-10 w-10 rounded-lg border border-brand-border bg-surface-3 text-muted flex items-center justify-center hover:bg-white hover:text-brand-black transition-colors"
                >
                  <MailOpen className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShortcutsOpen(true)}
                  title="Keyboard shortcuts (?)"
                  aria-label="Keyboard shortcuts"
                  className="h-10 w-10 rounded-lg border border-brand-border bg-surface-3 text-muted flex items-center justify-center hover:bg-white hover:text-brand-black transition-colors"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeConv.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[14px] text-subtle">
                  No messages yet.
                </div>
              ) : (
                <>
                  {threadSystemEvents.map((e, i) => <SystemEvent key={`${e}-${i}`} text={e} />)}
                  {(() => {
                    const out: React.ReactNode[] = [];
                    let lastDateKey = '';
                    for (const msg of activeConv.messages) {
                      const d = new Date(msg.timestamp);
                      const dateKey = d.toDateString();
                      if (dateKey !== lastDateKey) {
                        out.push(
                          <DateDivider key={`div-${dateKey}`} date={d} />,
                        );
                        lastDateKey = dateKey;
                      }
                      out.push(
                        <Bubble
                          key={msg.id}
                          msg={msg}
                          translatorEnabled={translatorEnabled}
                          translateGuestToMy={translateGuestToMy}
                          guestLang={translator.read}
                          myLang={myLang}
                          showOriginalById={showOriginalById}
                          toggleOriginal={toggleOriginal}
                        />,
                      );
                    }
                    return out;
                  })()}
                </>
              )}
            </div>

            {/* ── Reply box ── */}
            <div className="bg-white border-t border-brand-border flex-shrink-0">

          {/* ── Zone B: Compose ──────────────────────────────────────────────
               HOW the message is composed: mode tabs + translator + textarea  */}
          <div className="px-4 pt-3 pb-2">

            {/* Mode row: Channel | Reply / Note | Translate */}
            <div className="flex items-center gap-1 mb-3">

              {/* Channel dropdown — FIRST */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSendChannelOpen(v => !v)}
                  className={cn(
                    'flex items-center gap-1.5 h-10 px-3 rounded-full text-[12px] font-medium transition-colors border',
                    sendChannelOpen
                      ? 'bg-brand-blue-50 text-brand-blue border-brand-blue-light'
                      : 'bg-surface-3 text-muted border-brand-border hover:text-brand-black hover:bg-white',
                  )}
                >
                  <ChannelIcon channel={sendChannel} size="sm" className={sendChannelOpen ? 'text-brand-blue' : 'text-subtle'} />
                  {channelLabels[sendChannel]}
                  <ChevronDown className="w-3 h-3 text-subtle" />
                </button>

                {sendChannelOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-[200px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
                    <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Send via</p>
                    {allReplyChannels.map(ch => {
                      const enabled = clientChannels.includes(ch);
                      const active  = sendChannel === ch;
                      return (
                        <button
                          key={ch}
                          type="button"
                          disabled={!enabled}
                          onClick={() => { setSendChannel(ch); setSendChannelOpen(false); }}
                          className={cn(
                            'w-full text-left px-2.5 py-2 rounded-lg text-[12px] flex items-center gap-2.5 transition-colors',
                            active   ? 'bg-brand-blue-50 font-semibold text-brand-blue' : 'text-brand-black hover:bg-surface-3',
                            !enabled && 'opacity-40 cursor-not-allowed',
                          )}
                        >
                          <ChannelIcon channel={ch} size="sm" className={active ? 'text-brand-blue' : 'text-subtle'} />
                          <span className="flex-1">{channelLabels[ch]}</span>
                          {!enabled && <span className="text-[10px] text-faint font-normal">n/a</span>}
                          {active    && <span className="text-brand-blue text-[12px]">·</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-brand-border mx-1" />

              <button
                type="button"
                onClick={() => setIsInternal(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 h-10 px-3 rounded-full text-[12px] font-medium transition-colors',
                  isInternal
                    ? 'bg-surface-3 text-brand-black border border-brand-border'
                    : 'text-subtle hover:text-muted hover:bg-surface-3',
                )}
              >
                <Tag className="w-3 h-3" /> Note
              </button>

              {/* Divider */}
              <div className="w-px h-4 bg-brand-border mx-1" />

              <button
                type="button"
                disabled={isInternal}
                onClick={() => setTranslatorEnabled(v => !v)}
                title={isInternal ? 'Translator is disabled for internal notes' : 'Live translation'}
                className={cn(
                  'flex items-center gap-1.5 h-10 px-3 rounded-full text-[12px] font-medium transition-colors',
                  isInternal && 'opacity-35 cursor-not-allowed',
                  translatorEnabled && !isInternal
                    ? 'bg-brand-blue-50 text-brand-blue border border-brand-blue-light'
                    : 'text-subtle hover:text-muted hover:bg-surface-3',
                )}
              >
                <Languages className="w-3.5 h-3.5" /> Translate
              </button>
            </div>

            {/* Translator settings bar — shown only when active */}
            {translatorEnabled && !isInternal && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-surface-3 rounded-xl border border-brand-border">
                <Languages className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" />

                {/* Source language */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setMyLangOpen(v => !v); setReplyLangOpen(false); }}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-white border border-brand-border text-[11px] font-semibold text-muted hover:border-brand-blue-light transition-colors"
                  >
                    {languageLabel(myLang)}
                    <ChevronDown className="w-3 h-3 text-subtle" />
                  </button>
                  {myLangOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-[200px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">I write in</p>
                      {languageOptions.map(l => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => { setMyLang(l as any); setMyLangOpen(false); }}
                          className={cn(
                            'w-full px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors',
                            myLang === l ? 'bg-brand-blue-50 text-brand-blue' : 'text-muted hover:bg-surface-3',
                          )}
                        >
                          <span className="font-medium">{languageLabel(l)}</span>
                          {myLang === l && <span className="text-brand-blue text-[10px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ArrowLeftRight className="w-3.5 h-3.5 text-faint flex-shrink-0" />

                {/* Target language */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setReplyLangOpen(v => !v); setMyLangOpen(false); }}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-white border border-brand-border text-[11px] font-semibold text-muted hover:border-brand-blue-light transition-colors"
                  >
                    {languageLabel(replyLang)}
                    <ChevronDown className="w-3 h-3 text-subtle" />
                  </button>
                  {replyLangOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-[200px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Send as</p>
                      {languageOptions.map(l => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => { setReplyLang(l as any); setReplyLangOpen(false); }}
                          className={cn(
                            'w-full px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors',
                            replyLang === l ? 'bg-brand-blue-50 text-brand-blue' : 'text-muted hover:bg-surface-3',
                          )}
                        >
                          <span className="font-medium">{languageLabel(l)}</span>
                          {replyLang === l && <span className="text-brand-blue text-[10px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="ml-auto text-[10px] text-subtle hidden sm:block">
                  Guest reads in {languageLabel(replyLang)}
                </p>
              </div>
            )}

            {/* Textarea area */}
            {(!translatorEnabled || isInternal) ? (
              <textarea
                ref={replyTextareaRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isInternal ? 'Internal note — not visible to guest…' : 'Write a reply… (⌘+Enter to send)'}
                rows={3}
                className={cn(
                  'w-full resize-none text-[13px] rounded-xl border px-4 py-3 placeholder:text-faint',
                  'focus:outline-none focus:ring-2 focus:ring-brand-blue-light transition-colors',
                  'min-h-[88px] max-h-[40vh] overflow-y-auto',
                  isInternal
                    ? 'bg-[#FAFAFA] border-brand-border text-brand-black'
                    : 'bg-surface-3 border-brand-border text-brand-black focus:bg-white focus:border-brand-blue-light',
                )}
              />
            ) : (
              /* Translation split panel */
              <div className="flex gap-2 items-stretch">
                {/* Source (what I write) */}
                <div className="flex-1 min-w-0 relative">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Write in ${languageLabel(myLang)}…`}
                    rows={3}
                    className="w-full h-full resize-none text-[13px] rounded-xl border border-brand-border bg-white px-4 py-3 placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light transition-colors"
                  />
                  <span className="absolute bottom-2 left-3 text-[9px] font-semibold text-faint uppercase tracking-wider pointer-events-none">
                    {languageLabel(myLang)}
                  </span>
                </div>

                {/* Swap indicator */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-surface-3 border border-brand-border flex items-center justify-center">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-faint" />
                  </div>
                </div>

                {/* Target (what guest receives) */}
                <div className="flex-1 min-w-0 relative">
                  <textarea
                    value={replyText.trim() ? translateMyToReply(replyText) : ''}
                    readOnly
                    placeholder={`Will be sent in ${languageLabel(replyLang)}…`}
                    rows={3}
                    className="w-full h-full resize-none text-[13px] rounded-xl border border-brand-border bg-surface-3 px-4 py-3 text-muted placeholder:text-faint cursor-default"
                  />
                  <span className="absolute bottom-2 left-3 text-[9px] font-semibold text-faint uppercase tracking-wider pointer-events-none">
                    {languageLabel(replyLang)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Templates panel ─────────────────────────────────────────────
               Slides up from the toolbar when Templates is clicked.           */}
          {templatesOpen && (() => {
            const filtered = mockTemplates.filter(t =>
              (templateCategory === 'All' || t.category === templateCategory) &&
              (templateSearch === '' || t.title.toLowerCase().includes(templateSearch.toLowerCase()) || t.body.toLowerCase().includes(templateSearch.toLowerCase()))
            );
            return (
              <div className="border-t border-brand-border bg-white">
                {/* Search + close */}
                <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                  <div className="flex-1 relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
                    <input
                      autoFocus
                      value={templateSearch}
                      onChange={e => setTemplateSearch(e.target.value)}
                      placeholder="Search templates…"
                      className="w-full h-8 pl-8 pr-3 rounded-lg border border-brand-border bg-surface-3 text-[12px] text-muted placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                    />
                  </div>
                  <button
                    onClick={() => { setTemplatesOpen(false); setTemplateSearch(''); setTemplateCategory('All'); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors text-[16px] leading-none"
                  >×</button>
                </div>

                {/* Category pills */}
                <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-none">
                  {templateCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategory(cat)}
                      className={cn(
                        'flex-shrink-0 h-6 px-2.5 rounded-full text-[11px] font-medium transition-colors',
                        templateCategory === cat
                          ? 'bg-brand-blue text-white'
                          : 'bg-surface-3 text-muted hover:bg-brand-border',
                      )}
                    >{cat}</button>
                  ))}
                </div>

                {/* Template list */}
                <div className="max-h-[220px] overflow-y-auto divide-y divide-border-soft">
                  {filtered.length === 0 ? (
                    <p className="px-4 py-4 text-[12px] text-subtle">No templates found.</p>
                  ) : filtered.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setReplyText(fillTemplate(t.body));
                        setTemplatesOpen(false);
                        setTemplateSearch('');
                        setTemplateCategory('All');
                        requestAnimationFrame(() => replyTextareaRef.current?.focus());
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-surface-3 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] font-semibold text-muted group-hover:text-brand-blue transition-colors">{t.title}</span>
                        <span className="text-[10px] font-medium text-subtle bg-surface-3 border border-brand-border px-1.5 py-0.5 rounded-md">{t.category}</span>
                      </div>
                      <p className="text-[11px] text-subtle leading-snug line-clamp-1">{fillTemplate(t.body)}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── Zone C: Toolbar ──────────────────────────────────────────────*/}
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setTemplatesOpen(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 h-10 px-2.5 rounded-lg text-[11px] font-medium transition-colors',
                  templatesOpen ? 'bg-brand-blue text-white' : 'text-subtle hover:text-muted hover:bg-surface-3',
                )}
              >
                <FileText className="w-3.5 h-3.5" /> Templates
              </button>
              <button className="flex items-center gap-1.5 h-10 px-2.5 rounded-lg text-[11px] font-medium text-subtle hover:text-muted hover:bg-surface-3 transition-colors">
                <Smile className="w-3.5 h-3.5" /> Emoji
              </button>
              <button className="flex items-center gap-1.5 h-10 px-2.5 rounded-lg text-[11px] font-medium text-subtle hover:text-muted hover:bg-surface-3 transition-colors">
                <Paperclip className="w-3.5 h-3.5" /> Attach
              </button>
              <button className="flex items-center gap-1.5 h-10 px-2.5 rounded-lg text-[11px] font-medium text-subtle hover:text-muted hover:bg-surface-3 transition-colors">
                <Mic className="w-3.5 h-3.5" /> Voice
              </button>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={handleSend}
              disabled={!replyText.trim() || !activeConv}
              className="h-10"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </Button>
          </div>
        </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="flex items-start gap-4 max-w-[560px]">
              <div className="w-12 h-12 rounded-2xl bg-surface-3 border border-brand-border flex items-center justify-center flex-shrink-0">
                <ArrowLeft className="w-6 h-6 text-brand-blue" />
              </div>
              <div className="pt-1">
                <h2 className="text-[14px] font-semibold text-strong mb-1">Select a chat on the left</h2>
                <p className="text-[12px] text-subtle leading-relaxed">
                  Click any conversation to open the thread and start replying.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: guest sidebar ── */}
      <div className="w-[272px] flex-shrink-0 border-l border-brand-border bg-white relative overflow-hidden">
        {guest ? (
          <>
            {/* ── Guest identity block ── */}
            <div className="px-4 py-3 border-b border-brand-border">
              <div className="flex items-center justify-between gap-2">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={guest.name} size="lg" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-[13px] font-semibold text-muted truncate leading-tight">{guest.name}</h3>
                      {guest.tags.includes('VIP') && (
                        <span className="text-[9px] font-bold tracking-wider text-white bg-brand-blue px-1.5 py-0.5 rounded">VIP</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* ··· menu */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setProfileMenuOpen(v => !v)}
                    className={cn(
                      'w-10 h-10 rounded-lg border border-brand-border flex items-center justify-center transition-colors',
                      profileMenuOpen
                        ? 'bg-brand-blue border-brand-blue text-white'
                        : 'bg-surface-3 text-[#5C6370] hover:bg-brand-blue hover:border-brand-blue hover:text-white',
                    )}
                    title="More"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-1 w-[200px] bg-white border border-brand-border rounded-xl shadow-panel z-50 p-1.5">
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Guest</p>
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-brand-black hover:bg-surface-3 transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); setMergeOpen(true); }}>
                        <ArrowLeftRight className="w-3.5 h-3.5 text-subtle" /> Merge profiles…
                      </button>
                      <div className="my-1 h-px bg-brand-border" />
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.18em]">Conversation</p>
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-brand-black hover:bg-surface-3 transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); setMergeConvOpen(true); setMergeConvQuery(''); }}>
                        <Combine className="w-3.5 h-3.5 text-subtle" /> Merge conversations…
                      </button>
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-brand-black hover:bg-surface-3 transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); if (activeConv) markAsUnread(activeConv.id); }}>
                        <MailOpen className="w-3.5 h-3.5 text-subtle" /> Mark as unread
                      </button>
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-brand-black hover:bg-surface-3 transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); addToast({ type: 'info', title: 'Chat exported' }); }}>
                        <FileText className="w-3.5 h-3.5 text-subtle" /> Export chat
                      </button>
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-brand-black hover:bg-surface-3 transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); addToast({ type: 'info', title: 'Notifications muted' }); }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-subtle" /> Mute notifications
                      </button>
                      <div className="my-1 h-px bg-brand-border" />
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-brand-black hover:bg-surface-3 transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); addToast({ type: 'info', title: 'Blocked', message: `${guest.name} blocked` }); }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-subtle" /> Block guest
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Merge profiles UI */}
              {mergeOpen && (
                <div className="mt-3 p-3 bg-surface-2 border border-brand-border rounded-xl">
                  <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em] mb-2">Merge profiles</p>
                  <input
                    value={mergeQuery}
                    onChange={e => setMergeQuery(e.target.value)}
                    placeholder="Enter guest ID…"
                    className="w-full h-8 px-3 rounded-lg border border-brand-border bg-white text-[12px] text-muted placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="xs" variant="outline" onClick={() => { setMergeOpen(false); setMergeQuery(''); }}>Cancel</Button>
                    <Button size="xs" variant="primary" disabled={!mergeQuery.trim()}
                      onClick={() => { addToast({ type: 'success', title: 'Merged', message: `Applied merge with ${mergeQuery}` }); setMergeOpen(false); setMergeQuery(''); }}
                    >Apply</Button>
                  </div>
                </div>
              )}

              {/* Merge conversations UI — similar pattern, picks another conv */}
              {mergeConvOpen && activeConv && (() => {
                const candidates = conversations.filter(c =>
                  c.id !== activeConv.id &&
                  (mergeConvQuery.trim() === '' ||
                    c.guestName.toLowerCase().includes(mergeConvQuery.toLowerCase()) ||
                    c.id.toLowerCase().includes(mergeConvQuery.toLowerCase())),
                );
                const applyMerge = (otherId: string) => {
                  const other = conversations.find(c => c.id === otherId);
                  if (!other) return;
                  setConversations(prev => {
                    const mergedMessages = [...activeConv.messages, ...other.messages]
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    const merged: Conversation = {
                      ...activeConv,
                      messages: mergedMessages,
                      lastMessage: mergedMessages[mergedMessages.length - 1]?.content ?? activeConv.lastMessage,
                      lastMessageAt: mergedMessages[mergedMessages.length - 1]?.timestamp ?? activeConv.lastMessageAt,
                      unreadCount: activeConv.unreadCount + other.unreadCount,
                      tags: Array.from(new Set([...(activeConv.tags ?? []), ...(other.tags ?? [])])),
                    };
                    return prev
                      .filter(c => c.id !== other.id)
                      .map(c => c.id === activeConv.id ? merged : c);
                  });
                  setActiveConv(prev => prev && prev.id === activeConv.id
                    ? { ...prev, messages: [...prev.messages, ...other.messages].sort((a,b) =>
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) }
                    : prev);
                  setMergeConvOpen(false);
                  setMergeConvQuery('');
                  addToast({ type: 'success', title: 'Conversations merged', message: `${other.guestName} → ${activeConv.guestName}` });
                };
                return (
                  <div className="mt-3 p-3 bg-surface-2 border border-brand-border rounded-xl">
                    <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em] mb-2">Merge conversations</p>
                    <input
                      value={mergeConvQuery}
                      onChange={e => setMergeConvQuery(e.target.value)}
                      placeholder="Search by name or ID…"
                      autoFocus
                      className="w-full h-8 px-3 rounded-lg border border-brand-border bg-white text-[12px] text-muted placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                    />
                    <div className="mt-2 max-h-[160px] overflow-y-auto rounded-lg border border-brand-border bg-white">
                      {candidates.length === 0 ? (
                        <p className="px-3 py-3 text-[11px] text-subtle">No matches.</p>
                      ) : candidates.slice(0, 20).map(c => (
                        <button
                          key={c.id}
                          onClick={() => applyMerge(c.id)}
                          className="w-full text-left px-3 py-2 hover:bg-surface-3 flex items-center justify-between gap-2 border-b border-border-soft last:border-0"
                        >
                          <span className="text-[12px] text-strong truncate">{c.guestName}</span>
                          <span className="text-[10px] text-subtle tabular-nums flex-shrink-0">{c.id}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="xs" variant="outline" onClick={() => { setMergeConvOpen(false); setMergeConvQuery(''); }}>Cancel</Button>
                    </div>
                    <p className="mt-2 text-[10px] text-subtle leading-relaxed">
                      Merging keeps the current conversation and folds the other thread's messages into it ordered by timestamp.
                    </p>
                  </div>
                );
              })()}

              {/* Key stats row removed */}
            </div>

            {/* ── Menu + sliding detail panel ── */}
            {(() => {
              type MenuItem = { id: GuestSidebarSection; label: string; icon: typeof User };
              const menuGroups: { label: string; items: MenuItem[] }[] = [
                {
                  label: 'Guest',
                  items: [
                    { id: 'info',        label: 'User info',    icon: User     },
                    { id: 'reservation', label: 'Reservations', icon: BedDouble },
                    { id: 'pms',         label: 'PMS data',     icon: Database  },
                  ],
                },
                {
                  label: 'Activity',
                  items: [
                    { id: 'actions', label: 'Quick actions',        icon: Activity   },
                    { id: 'engines', label: 'Engines log',          icon: Zap        },
                    { id: 'signals', label: 'Satisfaction signals', icon: TrendingUp },
                  ],
                },
                {
                  label: 'Details',
                  items: [
                    { id: 'properties', label: 'User properties', icon: Settings2 },
                    { id: 'calls',      label: 'Calls',            icon: PhoneCall },
                    { id: 'tags_notes', label: 'Tags & notes',     icon: Tag       },
                  ],
                },
              ];

              const allItems: MenuItem[] = menuGroups.flatMap(g => g.items);
              const activeMeta = allItems.find(m => m.id === guestSidebarSection) ?? allItems[0];
              const openSection = (id: GuestSidebarSection) => {
                setGuestSidebarSection(id);
                setGuestSidebarOpen(true);
              };

              return (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {allItems.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => openSection(id)}
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

                  {/* Sliding detail */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-white flex flex-col transition-transform duration-200 ease-out',
                      guestSidebarOpen ? 'translate-x-0' : 'translate-x-full',
                    )}
                    aria-hidden={!guestSidebarOpen}
                  >
                    <div className="h-[49px] px-3 border-b border-brand-border flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setGuestSidebarOpen(false)}
                        className="w-8 h-8 rounded-xl border border-brand-border bg-surface-2 flex items-center justify-center hover:bg-white transition-colors"
                        title="Back"
                      >
                        <ArrowLeft className="w-4 h-4 text-muted" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-muted truncate leading-tight">{activeMeta.label}</p>
                        <p className="text-[10px] text-subtle truncate leading-tight">{guest.name}</p>
                      </div>
                      <button
                        onClick={() => setGuestSidebarOpen(false)}
                        className="w-8 h-8 rounded-xl hover:bg-surface-3 text-subtle hover:text-strong transition-colors flex items-center justify-center"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* INFO */}
                      {guestSidebarSection === 'info' && (
                        <>
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Contact</p>
                            <div className="flex items-center gap-2 text-[12px] text-muted">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0 text-faint" />
                              <span className="truncate">{guest.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-muted">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-faint" />
                              <span className="truncate">{guest.phone}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Profile</p>
                            {[
                              ['Nationality', guest.nationality],
                              ['Language', guest.language.toUpperCase()],
                              ['Source', guest.source],
                              ['Preferred channel', channelLabels[guest.preferredChannel]],
                              ['Status', guest.status],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between items-baseline py-2 border-b border-border-soft last:border-0">
                                <span className="text-[11px] text-subtle">{k}</span>
                                <span className="text-[12px] font-medium text-strong text-right max-w-[150px] truncate">{v}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* RESERVATIONS */}
                      {guestSidebarSection === 'reservation' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Current / upcoming reservation</p>
                            {reservation ? (
                              <div className="space-y-0">
                                {[
                                  ['Room', `#${reservation.roomNumber} · ${reservation.roomType}`],
                                  ['Dates', `${formatDate(reservation.checkIn)} → ${formatDate(reservation.checkOut)}`],
                                  ['Rate code', reservation.rateCode],
                                  ['Rate/night', formatCurrency(reservation.ratePerNight)],
                                ].map(([label, val]) => (
                                  <div key={label} className="flex justify-between items-baseline py-2 border-b border-border-soft last:border-0">
                                    <span className="text-[11px] text-subtle">{label}</span>
                                    <span className="text-[12px] font-medium text-strong text-right max-w-[160px] truncate">{val}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[12px] text-subtle">No active reservation.</p>
                            )}
                          </div>

                          {reservation?.specialRequests?.length ? (
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Special requests</p>
                              <div className="rounded-2xl border border-brand-border bg-surface-2 p-3 space-y-1">
                                {reservation.specialRequests.map(r => (
                                  <p key={r} className="text-[12px] text-muted leading-relaxed">- {r}</p>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* PMS */}
                      {guestSidebarSection === 'pms' && (
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-brand-border bg-white p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Past visits</p>
                              <p className="text-[12px] font-semibold text-strong">{guest.totalVisits}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-soft">
                              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Total spend</p>
                              <p className="text-[12px] font-semibold text-brand-blue">{formatCurrency(guest.lifetimeValue)}</p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Preferences</p>
                            <div className="rounded-2xl border border-brand-border bg-surface-2 p-3 space-y-1">
                              {[
                                'Quiet room',
                                'Late check-out',
                                'High floor',
                                'Extra pillows',
                                'Non-smoking floor',
                              ].map(p => (
                                <div key={p} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-light" />
                                  <p className="text-[12px] text-muted">{p}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QUICK ACTIONS */}
                      {guestSidebarSection === 'actions' && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Quick actions</p>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={() => addToast({ type: 'info', title: 'Booking', message: 'Create / edit booking (mock)' })}
                              className="rounded-2xl border border-brand-border bg-surface-3 hover:bg-white transition-colors px-3 py-3 text-left"
                            >
                              <div className="flex flex-col items-start">
                                <p className="text-[12px] font-semibold text-strong leading-tight">Create / edit booking</p>
                                <p className="text-[10px] text-subtle mt-1 leading-tight">PMS / booking workflow</p>
                              </div>
                            </button>
                            <button
                              onClick={() => addToast({ type: 'success', title: 'Upsell', message: 'Upsell sent (mock)' })}
                              className="rounded-2xl border border-brand-blue-light bg-brand-blue/10 hover:bg-brand-blue/15 transition-colors px-3 py-3 text-left"
                            >
                              <div className="flex flex-col items-start">
                                <p className="text-[12px] font-semibold text-brand-blue leading-tight">Send upsell</p>
                                <p className="text-[10px] text-muted mt-1 leading-tight">Offer add-ons to the guest</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ENGINES LOG */}
                      {guestSidebarSection === 'engines' && (
                        <div className="space-y-0">
                          <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">All engine actions</p>
                          {[
                            { engine: 'Upsell',     action: 'Dinner package offered',         result: 'Accepted',  time: '21 Apr 2026, 11:15' },
                            { engine: 'Arrival',    action: 'Pre-arrival message sent',      result: 'Delivered', time: '20 Apr 2026, 09:00' },
                            { engine: 'Concierge',  action: 'Restaurant recommendation',     result: 'Clicked',   time: '14 Apr 2026, 12:44' },
                            { engine: 'Reputation', action: 'Review request triggered',      result: 'Pending',   time: '15 Apr 2026, 18:00' },
                          ].map((entry, i) => (
                            <div key={i} className="py-2.5 border-b border-border-soft last:border-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[12px] font-semibold text-strong truncate">{entry.engine}</p>
                                <span className="text-[10px] text-faint flex-shrink-0">{entry.time}</span>
                              </div>
                              <p className="text-[12px] text-muted mt-0.5">{entry.action}</p>
                              <span className="inline-flex mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-3 border border-brand-border text-muted">{entry.result}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SIGNALS */}
                      {guestSidebarSection === 'signals' && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Ratings</p>
                            <div className="rounded-2xl border border-brand-border bg-white p-3 space-y-2">
                              {[
                                { date: '21 Apr 2026', score: 5, note: 'Loved the room setup' },
                                { date: '12 Mar 2025', score: 4, note: 'Small delay at check-in' },
                              ].map((s, i) => (
                                <div key={i} className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex gap-0.5">
                                      {[1,2,3,4,5].map(j => (
                                        <Star key={j} className={cn('w-3 h-3', j <= s.score ? 'fill-brand-blue text-brand-blue' : 'fill-transparent text-[#D1CFCF]')} />
                                      ))}
                                    </div>
                                    <p className="text-[11px] text-muted mt-1 leading-relaxed">{s.note}</p>
                                  </div>
                                  <span className="text-[10px] text-subtle flex-shrink-0">{s.date}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Complaints</p>
                            <div className="rounded-2xl border border-brand-border bg-surface-2 p-3 space-y-2">
                              {[
                                { date: '5 Aug 2024', text: 'Noise from adjacent room', resolved: true },
                                { date: '12 Mar 2025', text: 'Check-in wait time', resolved: true },
                              ].map((c, i) => (
                                <div key={i} className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[12px] text-muted">{c.text}</p>
                                    <p className="text-[10px] text-faint mt-0.5">{c.date}</p>
                                  </div>
                                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', c.resolved ? 'bg-brand-blue-50 text-brand-blue border-brand-blue-light' : 'bg-white text-subtle border-brand-border')}>
                                    {c.resolved ? 'Resolved' : 'Open'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Sentiment tags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['Loyal', 'Anniversary', 'Quiet preference', 'High spender'].map(t => (
                                <span key={t} className="text-[11px] text-muted bg-surface-3 border border-brand-border px-2.5 py-1 rounded-full">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* USER PROPERTIES */}
                      {guestSidebarSection === 'properties' && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Automatically collected data</p>
                          <div className="rounded-2xl border border-brand-border bg-white p-3 space-y-2">
                            {[
                              ['UTM source', 'google / cpc'],
                              ['Last website visit', '2d ago'],
                              ['Viewed pages', 'Spa, Rooms, Restaurant'],
                              ['Campaign', 'Spring getaway'],
                              ['Device', 'Mobile'],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between items-baseline py-1.5 border-b border-border-soft last:border-0">
                                <span className="text-[11px] text-subtle">{k}</span>
                                <span className="text-[12px] font-medium text-strong text-right max-w-[160px] truncate">{v}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-subtle leading-relaxed">
                            Configurable separately. Shown as an example.
                          </p>
                        </div>
                      )}

                      {/* CALLS */}
                      {guestSidebarSection === 'calls' && (
                        <div className="space-y-0">
                          <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-3">Inbound / outbound calls</p>
                          {[
                            { dir: 'in',  duration: '3m 42s', date: '21 Apr, 10:30', status: 'answered' },
                            { dir: 'out', duration: '1m 15s', date: '20 Apr, 14:00', status: 'answered' },
                            { dir: 'in',  duration: '—',      date: '18 Apr, 09:22', status: 'missed' },
                            { dir: 'out', duration: '5m 08s', date: '15 Apr, 16:45', status: 'answered' },
                          ].map((call, i) => (
                            <div key={i} className="flex gap-2.5 py-2.5 border-b border-border-soft last:border-0">
                              <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold',
                                call.dir === 'in' ? 'bg-brand-blue-50 text-brand-blue' : 'bg-surface-3 text-muted',
                              )}>
                                {call.dir === 'in' ? '↙' : '↗'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <p className="text-[12px] font-medium text-brand-black">{call.dir === 'in' ? 'Inbound' : 'Outbound'}</p>
                                  <span className={cn('text-[10px] font-medium', call.status === 'missed' ? 'text-subtle' : 'text-muted')}>{call.duration}</span>
                                </div>
                                <p className="text-[10px] text-subtle mt-0.5">{call.date}</p>
                                <div className="flex gap-1.5 mt-1.5">
                                  {call.status === 'answered' ? (
                                    <>
                                      <button className="text-[10px] font-medium text-brand-blue hover:underline">▶ Listen</button>
                                      <span className="text-[#D1CFCF]">·</span>
                                      <button className="text-[10px] font-medium text-brand-blue hover:underline">Transcript</button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-subtle">Missed call</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TAGS + NOTES */}
                      {guestSidebarSection === 'tags_notes' && (() => {
                        const suggested = [
                          'VIP', 'Returning', 'Loyal', 'Anniversary', 'High spender',
                          'Corporate', 'Group booking', 'Long stay', 'Early bird',
                          'Promo-sensitive', 'Quiet preference', 'Late checkout',
                        ];
                        const addTag = (t: string) => {
                          const tag = t.trim();
                          if (tag && !editableTags.includes(tag)) setEditableTags(prev => [...prev, tag]);
                          setNewTagInput('');
                        };
                        return (
                          <>
                            <div className="rounded-2xl border border-brand-border bg-white overflow-hidden">
                              <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-subtle" />
                                  <p className="text-[12px] font-semibold text-muted">Tags</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-faint" />
                              </div>

                              <div className="px-4 py-3 border-b border-border-soft">
                                {editableTags.length === 0 ? (
                                  <p className="text-[12px] text-subtle">This user has no tags</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {editableTags.map(tag => {
                                      const s = tagStyle(tag);
                                      return (
                                        <button
                                          key={tag}
                                          onClick={() => setEditableTags(prev => prev.filter(t => t !== tag))}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider"
                                          style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
                                          title="Remove tag"
                                        >
                                          {tag}
                                          <span className="text-[12px] leading-none opacity-70">×</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="px-4 py-3 border-b border-border-soft">
                                <button
                                  className="w-full h-10 px-3 rounded-xl border border-brand-border bg-white text-left text-[12px] text-subtle flex items-center justify-between"
                                  onClick={() => { /* noop: visual only */ }}
                                  type="button"
                                >
                                  <span className="truncate">
                                    {newTagInput.trim() ? newTagInput : 'Find and add a tag…'}
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-faint flex-shrink-0" />
                                </button>
                                <input
                                  value={newTagInput}
                                  onChange={e => setNewTagInput(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && newTagInput.trim()) {
                                      e.preventDefault();
                                      addTag(newTagInput);
                                    }
                                  }}
                                  className="sr-only"
                                  aria-label="Find and add a tag"
                                />
                              </div>

                              <div className="px-4 py-3">
                                <div className="rounded-xl border border-brand-border bg-white">
                                  <div className="max-h-[210px] overflow-y-auto p-3 flex flex-wrap gap-2">
                                    {suggested.map(tag => {
                                      const s = tagStyle(tag);
                                      const isSelected = editableTags.includes(tag);
                                      return (
                                        <button
                                          key={tag}
                                          onClick={() => (isSelected ? null : addTag(tag))}
                                          disabled={isSelected}
                                          className={cn(
                                            'px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-colors',
                                            isSelected ? 'opacity-40 cursor-default' : 'hover:opacity-90',
                                          )}
                                          style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
                                        >
                                          {tag}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <div className="border-t border-border-soft p-3">
                                    <button
                                      onClick={() => addTag(newTagInput || 'New tag')}
                                      className="w-full h-10 rounded-xl border border-brand-blue-light bg-brand-blue/10 text-brand-blue text-[12px] font-semibold hover:bg-brand-blue/15 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Create new tag
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1 border-t border-brand-border">
                              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider pt-1">Notes</p>
                              <textarea
                                value={editableNotes}
                                onChange={e => setEditableNotes(e.target.value)}
                                rows={6}
                                placeholder="Add a note about this guest…"
                                className="w-full resize-none text-[12px] text-brand-black rounded-2xl border border-brand-border bg-surface-2 px-3 py-2.5 placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white leading-relaxed"
                              />
                              <button
                                onClick={() => addToast({ type: 'success', title: 'Notes saved' })}
                                className="w-full h-9 rounded-xl bg-surface-3 border border-brand-border text-[12px] font-semibold text-muted hover:bg-white hover:text-strong transition-colors"
                              >Save notes</button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="w-full rounded-2xl border border-brand-border bg-surface-2 p-5 text-center">
              <div className="w-11 h-11 rounded-2xl bg-white border border-brand-border flex items-center justify-center mx-auto mb-3">
                <User className="w-5 h-5 text-subtle" />
              </div>
              <p className="text-[12px] font-semibold text-strong">No guest selected</p>
              <p className="text-[10px] text-subtle mt-1 leading-relaxed">
                Open a conversation on the left to view the guest profile.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts cheat sheet */}
      {shortcutsOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <button
            className="absolute inset-0 bg-brand-black/30"
            onClick={() => setShortcutsOpen(false)}
            aria-label="Close"
          />
          <div
            ref={shortcutsDialogRef}
            className="relative w-[440px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden"
          >
            <div className="px-6 pt-5 pb-3 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.18em] mb-1">Keyboard</p>
                <h3 className="text-[16px] font-semibold text-strong">Shortcuts</h3>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-4">
              {[
                { keys: ['J'], label: 'Next conversation' },
                { keys: ['K'], label: 'Previous conversation' },
                { keys: ['/'], label: 'Focus search' },
                { keys: ['R'], label: 'Reply (focus composer)' },
                { keys: ['E'], label: 'Mark as unread + close' },
                { keys: ['⌘', 'Enter'], label: 'Send reply' },
                { keys: ['Esc'], label: 'Close popover / modal' },
                { keys: ['?'], label: 'Show this help' },
              ].map(row => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2 border-b border-border-soft last:border-0"
                >
                  <span className="text-[12px] text-strong">{row.label}</span>
                  <span className="flex items-center gap-1">
                    {row.keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="min-w-[24px] h-6 px-1.5 inline-flex items-center justify-center rounded-md border border-brand-border bg-surface-3 text-[11px] font-semibold text-strong tabular-nums"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
              <p className="mt-3 text-[10px] text-subtle leading-relaxed">
                Shortcuts ignore typing in inputs. Esc still works everywhere.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
