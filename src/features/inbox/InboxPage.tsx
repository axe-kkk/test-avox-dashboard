import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Send, FileText, ArrowUpRight, ArrowLeft, CheckCircle, Phone, Mail, Plus, Star, Tag, ChevronDown, Filter,
  AlertTriangle, Settings2, Smile, Paperclip, Mic, Languages, MoreHorizontal, ArrowLeftRight, ChevronRight, X,
  User, BedDouble, Database, Zap, Activity, TrendingUp, PhoneCall,
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { mockConversations } from '../../data/mock/conversations';
import { mockGuests } from '../../data/mock/guests';
import { mockReservations } from '../../data/mock/reservations';
import { mockUsers } from '../../data/mock/users';
import { formatDateTime, formatRelativeTime, formatDate, formatCurrency, channelLabels, cn } from '../../utils';
import type { Conversation } from '../../types';
import { useApp } from '../../app/AppContext';

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
  urgent: 'border-l-[#2355A7]',
  high:   'border-l-[#D1CFCF]',
  normal: 'border-l-transparent',
  low:    'border-l-transparent',
};

const statusDot: Record<string, string> = {
  open:       'bg-[#2355A7]',
  pending:    'bg-[#D1CFCF]',
  escalated:  'bg-[#0E1013]',
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
  { id: 'front_desk', label: 'Front Desk' },
  { id: 'concierge', label: 'Concierge' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'fnb', label: 'F&B' },
  { id: 'engineering', label: 'Engineering' },
] as const;

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
  return code.toUpperCase();
}

// ── Conversation row ────────────────────────────────────────────────────────

function ConvRow({ conv, isActive, onClick }: {
  conv: Conversation; isActive: boolean; onClick: () => void;
}) {
  const lastChannel = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1]?.channel : conv.channel;
  const guest = mockGuests.find(g => g.id === conv.guestId);
  const primaryTag =
    (guest?.tags?.includes('VIP') ? 'VIP' : guest?.tags?.[0]) ??
    conv.tags?.[0];

  const tagBadge = useMemo(() => {
    if (!primaryTag) return null;
    const t = primaryTag.trim();
    if (!t) return null;
    const letter = t[0]?.toUpperCase() ?? '';

    const preset: Record<string, string> = {
      VIP: 'bg-[#F59E0B]/15 text-[#92400E] border-[#F59E0B]/25',
      Anniversary: 'bg-[#8B5CF6]/12 text-[#5B21B6] border-[#8B5CF6]/20',
      Honeymoon: 'bg-[#EC4899]/12 text-[#9D174D] border-[#EC4899]/20',
      'Baby cot': 'bg-[#EAB308]/15 text-[#854D0E] border-[#EAB308]/25',
      'Maintenance issue': 'bg-[#EF4444]/12 text-[#991B1B] border-[#EF4444]/20',
    };

    const palette = [
      'bg-[#2355A7]/10 text-[#1D4ED8] border-[#2355A7]/20',
      'bg-[#0E1013]/8 text-[#0E1013] border-[#0E1013]/15',
      'bg-[#10B981]/12 text-[#047857] border-[#10B981]/20',
      'bg-[#F97316]/12 text-[#9A3412] border-[#F97316]/20',
      'bg-[#06B6D4]/12 text-[#155E75] border-[#06B6D4]/20',
      'bg-[#64748B]/12 text-[#334155] border-[#64748B]/20',
    ];

    const cls = preset[t] ?? (() => {
      let h = 0;
      for (let i = 0; i < t.length; i++) h = (h + t.charCodeAt(i)) % palette.length;
      return palette[h];
    })();

    return { letter, cls, title: t };
  }, [primaryTag]);
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 pt-3.5 pb-3 border-b border-[#EDEEF1] hover:bg-[#F9F9F9] transition-colors border-l-4',
        isActive ? 'bg-[#EEF2FC] border-l-[#2355A7]' : 'border-l-transparent',
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar
          name={conv.guestName}
          size="sm"
          badge={<ChannelIcon channel={lastChannel} size="sm" className="text-[#2355A7]" />}
        />
        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn(
                'text-[14px] truncate',
                conv.unreadCount > 0 ? 'font-semibold text-[#5C6370]' : 'font-medium text-[#5C6370]',
              )}>
                {conv.guestName}
              </span>
              {tagBadge && (
                <span
                  className={cn(
                    'w-5 h-5 flex items-center justify-center flex-shrink-0',
                    'text-[8px] font-semibold leading-none',
                    'rounded-[4px]',
                    'border',
                    tagBadge.cls,
                  )}
                  title={tagBadge.title}
                  aria-label={`Tag: ${tagBadge.title}`}
                >
                  {tagBadge.letter}
                </span>
              )}
            </div>
            {conv.unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#2355A7] flex-shrink-0" aria-label="Unread" />
            )}
          </div>

          {/* Last message */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] text-[#5C6370] truncate leading-relaxed min-w-0">
              {conv.lastMessage}
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-[#8B9299] tabular-nums whitespace-nowrap">
                {formatRelativeTime(conv.lastMessageAt)}
              </span>
            </div>
          </div>
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
        <div className="flex items-center gap-2 text-[10px] text-[#8B9299] bg-[#F6F7F9] px-3 py-1.5 rounded-full border border-[#EDEEF1]">
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
          <Avatar name={msg.senderName} size="xs" />
        </div>
        <div
          className="max-w-[70%] flex flex-col gap-1 items-end"
        >
          {/* Sender meta */}
          <div className="flex items-center gap-1.5 px-1 flex-row-reverse">
            <span className="text-[10px] font-medium text-[#8B9299]">{msg.senderName}</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#A07B20]">
              Note
            </span>
          </div>

          {/* Note body — subtle yellow */}
          <div
            className="relative rounded-2xl rounded-tr-sm px-4 pt-3 pb-7"
            style={{ backgroundColor: '#FFFBEB', border: '1px solid #F5E2A0' }}
          >
            <p className="text-[10px] leading-relaxed" style={{ color: '#3D2E00' }}>
              {cleanContent}
            </p>

            {/* Timestamp inside note bubble (bottom-right) */}
            <span className="absolute bottom-1.5 right-3 text-[10px] tabular-nums select-none text-[#C4C8CF]">
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
          ? <Avatar name={msg.senderName} size="xs" />
          : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
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
          <span className="text-[10px] font-medium text-[#8B9299]">{msg.senderName}</span>
          {msg.engineName && (
            <span className="text-[10px] text-[#BED4F6] font-medium">{msg.engineName}</span>
          )}
        </div>

        {/* Bubble body */}
        <div
          className={cn(
            'relative rounded-2xl px-4 pt-3 pb-7 transition-colors',
            isGuest
              ? cn(
                  'border rounded-tl-sm',
                  // When showing original (foreign lang), give a subtle tint to signal "raw / untranslated"
                  showOriginal
                    ? 'bg-[#F9F9F9] border-[#E2E5EA]'
                    : 'bg-white border-[#EDEEF1]',
                )
              : 'rounded-tr-sm',
          )}
          style={!isGuest ? { backgroundColor: '#2355A7' } : undefined}
        >
          {/* Language badge when showing original */}
          {canTranslate && showOriginal && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#8B9299] bg-[#EDEEF1] px-1.5 py-0.5 rounded-sm">
                {guestLang.toUpperCase()}
              </span>
              <span className="text-[10px] text-[#8B9299]">Original</span>
            </div>
          )}

          <p
            className={cn(
              'text-[10px] leading-relaxed transition-all',
              isGuest
                ? showOriginal
                  ? 'text-[#5C6370] italic'   // Foreign-language look: muted + italic
                  : 'text-[#0E1013]'
                : 'text-white',
            )}
          >
            {displayText}
          </p>

          {/* Timestamp inside bubble (bottom-right) */}
          <span
            className={cn(
              'absolute bottom-1.5 right-3 text-[10px] tabular-nums select-none',
              isGuest ? 'text-[#C4C8CF]' : 'text-white/65',
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
                  ? 'bg-[#F6F7F9] text-[#8B9299] border-[#E2E5EA] hover:bg-white hover:text-[#5C6370]'
                  : 'bg-[#EEF2FC] text-[#2355A7] border-[#BED4F6] hover:bg-white',
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
      <div className="text-[10px] text-[#8B9299] bg-[#F6F7F9] px-3 py-1.5 rounded-full border border-[#EDEEF1]">
        {text}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export function InboxPage() {
  const { addToast } = useApp();
  const [params, setParams] = useSearchParams();
  const activeView = (params.get('view') as InboxView | null) ?? 'all';
  const [viewsOpen, setViewsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [listSettingsOpen, setListSettingsOpen] = useState(false);

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
  const [myLang, setMyLang] = useState<'en' | 'uk' | 'pl' | 'de' | 'fr' | 'es' | 'it'>('en');
  const [replyLang, setReplyLang] = useState<'en' | 'uk' | 'pl' | 'de' | 'fr' | 'es' | 'it'>('en');
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
    for (const c of mockConversations) set.add(c.channel);
    // Ensure filter shows the full set of supported channels.
    for (const ch of ['sms', 'telegram', 'viber', 'web_widget'] as Conversation['channel'][]) set.add(ch);
    return Array.from(set);
  }, []);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of mockConversations) for (const t of c.tags ?? []) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  useEffect(() => {
    // Close guest drawer when switching conversations.
    setGuestSidebarOpen(false);
    setGuestSidebarSection('info');
    setProfileMenuOpen(false);
    setMergeOpen(false);
    setMergeQuery('');
  }, [activeConv?.id]);

  const urgentConversations = useMemo(() => {
    return mockConversations.filter(c => c.priority === 'urgent' || c.status === 'escalated');
  }, []);

  const urgentCount = urgentConversations.length;
  const urgentByDept = useMemo(() => {
    const counts: Record<(typeof deptOptions)[number]['id'], number> = deptOptions.reduce((acc, d) => {
      acc[d.id] = 0;
      return acc;
    }, {} as Record<(typeof deptOptions)[number]['id'], number>);

    // Lightweight heuristic: distribute by engine / tags
    for (const c of urgentConversations) {
      const tagStr = (c.tags ?? []).join(' ').toLowerCase();
      if (tagStr.includes('maintenance') || c.engineName === 'Recovery') counts.engineering += 1;
      else if (tagStr.includes('vip') || c.engineName === 'Concierge') counts.concierge += 1;
      else counts.front_desk += 1;
    }
    return counts;
  }, [urgentConversations]);

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
    const read = (['en', 'uk', 'pl', 'de', 'fr', 'es', 'it'].includes(guestLang) ? guestLang : 'en') as typeof myLang;
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

  const languageOptions = useMemo(() => (['en', 'de', 'fr', 'es', 'it', 'uk', 'pl'] as const), []);

  function mockTranslate(text: string, from: string, to: string) {
    if (!text.trim()) return text;
    if (from === to) return text;
    // Demo-only: no external translation service in mock.
    // Keep it visibly "translated" without changing meaning.
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

    for (const c of mockConversations) {
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
    return mockConversations.filter(c => {
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
  }, [activeView, channelFilter, tagFilter, searchQuery]);

  const handleSend = () => {
    if (!activeConv) return;
    if (!replyText.trim()) return;
    const now = new Date().toISOString();
    const content = isInternal
      ? replyText.trim()
      : (translatorEnabled ? translateMyToReply(replyText.trim()) : replyText.trim());

    setActiveConv(prev => {
      if (!prev) return prev;
      const nextMsg: import('../../types').Message = {
        id: `msg_local_${Date.now()}`,
        conversationId: prev.id,
        sender: isInternal ? 'agent' : 'agent',
        senderName: isInternal ? 'Internal note' : 'Sophie',
        content,
        channel: sendChannel,
        timestamp: now,
        isInternal,
      };

      const nextMessages = [...(prev.messages ?? []), nextMsg];
      return {
        ...prev,
        messages: nextMessages,
        lastMessage: content,
        lastMessageAt: now,
      };
    });

    addToast({ type: 'success', title: isInternal ? 'Note saved' : 'Message sent' });
    setReplyText('');
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: list ── */}
      <div className="w-[300px] flex-shrink-0 border-r border-[#EDEEF1] bg-white flex flex-col">
        {/* Inbox menu row (views + filters + add) */}
        <div className="px-3 py-2.5 border-b border-[#EDEEF1]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setViewsOpen(v => !v)}
                className="h-8 px-3 rounded-lg bg-[#F6F7F9] border border-[#EDEEF1] text-[12px] font-medium text-[#5C6370] flex items-center gap-2 hover:bg-white transition-colors"
              >
                <span className="font-semibold uppercase tracking-[0.08em]">ALL</span>
                <span className="text-[#8B9299] font-semibold tabular-nums">{counts.unread}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8B9299]" />
              </button>

              {viewsOpen && (
                <div className="absolute left-0 mt-2 w-[260px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Statuses</p>
                  </div>
                  {(['unread', 'new', 'pending', 'paused', 'urgent', 'closed'] as InboxView[]).map(v => (
                    <button
                      key={v}
                      onClick={() => { setViewsOpen(false); setParams(prev => { prev.set('view', v); return prev; }); }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] transition-colors',
                        activeView === v ? 'bg-[#EEF2FC] text-[#5C6370]' : 'text-[#5C6370] hover:bg-[#F6F7F9] hover:text-[#5C6370]',
                      )}
                    >
                      <span className="font-medium">{viewLabels[v]}</span>
                      <span className="text-[#8B9299] tabular-nums font-semibold">{counts[v]}</span>
                    </button>
                  ))}
                  <div className="my-2 h-px bg-[#EDEEF1]" />
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Mine</p>
                  </div>
                  {(['my_all', 'my_new', 'my_pending', 'my_paused', 'my_urgent', 'my_closed'] as InboxView[]).map(v => (
                    <button
                      key={v}
                      onClick={() => { setViewsOpen(false); setParams(prev => { prev.set('view', v); return prev; }); }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] transition-colors',
                        activeView === v ? 'bg-[#EEF2FC] text-[#5C6370]' : 'text-[#5C6370] hover:bg-[#F6F7F9] hover:text-[#5C6370]',
                      )}
                    >
                      <span className="font-medium">{viewLabels[v]}</span>
                      <span className="text-[#8B9299] tabular-nums font-semibold">{counts[v]}</span>
                    </button>
                  ))}
                  <div className="my-2 h-px bg-[#EDEEF1]" />
                  <button
                    onClick={() => { setViewsOpen(false); addToast({ type: 'info', title: 'Add new Inbox', message: 'Inbox configuration will be added next.' }); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#2355A7] hover:bg-[#EEF2FC] transition-colors"
                  >
                    Add new Inbox
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setFiltersOpen(v => !v)}
                className="h-8 w-8 rounded-lg bg-[#F6F7F9] border border-[#EDEEF1] flex items-center justify-center text-[#5C6370] hover:bg-white transition-colors"
                title="Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
              {filtersOpen && (
                <div className="absolute left-0 mt-2 w-[280px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Filter channels</p>
                    <button
                      className="text-[11px] font-semibold text-[#2355A7] hover:underline"
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
                                  ? 'bg-[#EEF2FC] border-[#BED4F6] text-[#2355A7]'
                                  : 'bg-[#F6F7F9] border-[#EDEEF1] text-[#5C6370] hover:bg-white',
                              )}
                            >
                              {channelLabels[ch]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] mb-2">Tags</p>
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
                                  ? 'bg-[#0E1013] border-[#0E1013] text-white'
                                  : 'bg-[#F6F7F9] border-[#EDEEF1] text-[#5C6370] hover:bg-white',
                              )}
                            >
                              {t}
                            </button>
                          );
                        })}
                        {availableTags.length === 0 && (
                          <span className="text-[11px] text-[#8B9299]">No tags.</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => addToast({ type: 'info', title: 'Custom filters', message: 'Custom filter builder will be added next.' })}
                        className="w-full h-8 rounded-lg border border-[#EDEEF1] bg-white text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors"
                      >
                        Create custom filter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => { setNewConvOpen(true); setNewConvMessage(''); }}
              className="ml-auto h-8 w-8 rounded-lg bg-[#EEF2FC] border border-[#BED4F6] flex items-center justify-center text-[#2355A7] hover:bg-[#E3EBFA] transition-colors"
              title="Add conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search (as part of submenu spec) */}
          <div className="relative mt-2.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B9299]" />
            <input
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-[#F6F7F9] rounded-lg border border-[#EDEEF1] placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setUrgentOpen(v => !v)}
                  className="w-8 h-7 rounded-md hover:bg-white transition-colors flex items-center justify-center"
                  title="Urgent"
                >
                  <div className="relative">
                    <AlertTriangle className="w-4 h-4 text-[#0E1013]" />
                    {urgentCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#2355A7] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                        {urgentCount}
                      </span>
                    )}
                  </div>
                </button>
                {urgentOpen && (
                  <div className="absolute right-0 mt-2 w-[260px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-2">
                    <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">
                      Departments
                    </p>
                    {deptOptions.map(d => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setUrgentOpen(false);
                          setParams(prev => { prev.set('view', 'urgent'); return prev; });
                          addToast({ type: 'info', title: d.label, message: `${urgentByDept[d.id]} open items` });
                        }}
                        className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F6F7F9] transition-colors flex items-center justify-between text-[12px]"
                      >
                        <span className="font-medium text-[#0E1013]">{d.label}</span>
                        <span className="font-semibold text-[#8B9299] tabular-nums">{urgentByDept[d.id]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setListSettingsOpen(v => !v)}
                  className="w-8 h-7 rounded-md hover:bg-white transition-colors flex items-center justify-center"
                  title="List settings"
                >
                  <Settings2 className="w-4 h-4 text-[#8B9299]" />
                </button>
                {listSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-[220px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-2">
                    <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">
                      List view
                    </p>
                    {[
                      { id: 'compact', label: 'Compact' },
                      { id: 'comfortable', label: 'Comfortable' },
                      { id: 'detailed', label: 'Detailed' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setListSettingsOpen(false); addToast({ type: 'info', title: 'List view', message: opt.label }); }}
                        className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F6F7F9] transition-colors text-left text-[12px] text-[#0E1013] font-medium"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <ConvRow
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeConv?.id}
              onClick={() => { setActiveConv(conv); setReplyText(''); }}
            />
          ))}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <button className="absolute inset-0 bg-[#0E1013]/20" onClick={() => setNewConvOpen(false)} aria-label="Close" />
            <div className="relative w-[560px] max-w-[calc(100vw-32px)] bg-white border border-[#EDEEF1] rounded-2xl shadow-panel overflow-hidden">

              {/* Header */}
              <div className="px-6 pt-5 pb-4 border-b border-[#EDEEF1] flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] mb-1">Compose</p>
                  <h3 className="text-[16px] font-semibold text-[#5C6370]" style={{ fontFamily: "'Azeret Mono', monospace" }}>New conversation</h3>
                </div>
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8B9299] hover:bg-[#F6F7F9] hover:text-[#5C6370] transition-colors text-[18px] leading-none mt-0.5"
                  onClick={() => { setNewConvOpen(false); setNewConvRecipient(''); setNewConvSubject(''); setNewConvGuestSearch(''); setNewConvGuestId(null); setNewConvMessage(''); }}
                >×</button>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

                {/* ── Channel grid ── */}
                <div>
                  <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2.5">Channel</p>
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
                              ? 'bg-[#EEF2FC] border-[#BED4F6] text-[#2355A7]'
                              : 'bg-[#F9F9F9] border-[#EDEEF1] text-[#5C6370] hover:bg-white hover:border-[#D1D5DB]',
                          )}
                        >
                          <ChannelIcon channel={ch} size="md" className={sel ? 'text-[#2355A7]' : 'text-[#8B9299]'} />
                          {channelLabels[ch]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Guest search ── */}
                <div>
                  <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Guest profile</p>
                  {selectedGuest ? (
                    <div className="flex items-center gap-3 p-3 bg-[#EEF2FC] border border-[#BED4F6] rounded-xl">
                      <Avatar name={selectedGuest.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#5C6370] truncate">{selectedGuest.name}</p>
                        <p className="text-[11px] text-[#5C6370] truncate">{selectedGuest.email}</p>
                      </div>
                      <button
                        onClick={() => { setNewConvGuestId(null); setNewConvGuestSearch(''); }}
                        className="text-[#8B9299] hover:text-[#5C6370] text-[16px] leading-none"
                      >×</button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C8CF]" />
                      <input
                        value={newConvGuestSearch}
                        onChange={e => setNewConvGuestSearch(e.target.value)}
                        placeholder="Search guest by name or email…"
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-[#5C6370] placeholder:text-[#C4C8CF] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white"
                      />
                      {filteredGuests.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-10 p-1.5 max-h-[160px] overflow-y-auto">
                          {filteredGuests.map(g => (
                            <button
                              key={g.id}
                              onClick={() => { setNewConvGuestId(g.id); setNewConvGuestSearch(''); if (!newConvRecipient) setNewConvRecipient(isEmail ? g.email : g.phone ?? ''); }}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F6F7F9] flex items-center gap-2.5 transition-colors"
                            >
                              <Avatar name={g.name} size="sm" />
                              <div className="min-w-0">
                                <p className="text-[12px] font-medium text-[#5C6370] truncate">{g.name}</p>
                                <p className="text-[11px] text-[#8B9299] truncate">{g.email}</p>
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
                      <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">{recipientLabel}</p>
                      <input
                        value={newConvRecipient}
                        onChange={e => setNewConvRecipient(e.target.value)}
                        placeholder={recipientPh}
                        type={isEmail ? 'email' : 'text'}
                        className="w-full h-9 px-3 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-[#5C6370] placeholder:text-[#C4C8CF] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white"
                      />
                    </div>

                    {isEmail && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Subject</p>
                        <input
                          value={newConvSubject}
                          onChange={e => setNewConvSubject(e.target.value)}
                          placeholder="E.g. Your upcoming stay at Grand Suites"
                          className="w-full h-9 px-3 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-[#5C6370] placeholder:text-[#C4C8CF] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Widget note */}
                {isWidget && (
                  <div className="flex items-start gap-2.5 p-3 bg-[#F6F7F9] border border-[#EDEEF1] rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-[#8B9299] flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-[#5C6370] leading-relaxed">Web Widget conversations can only be initiated by the guest. You cannot start an outbound thread via this channel.</p>
                  </div>
                )}

                {/* ── Message ── */}
                {!isWidget && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Message</p>
                    <textarea
                      value={newConvMessage}
                      onChange={e => setNewConvMessage(e.target.value)}
                      rows={4}
                      placeholder="Write the first message…"
                      className="w-full resize-none text-[13px] rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] px-4 py-3 placeholder:text-[#C4C8CF] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#EDEEF1] flex items-center justify-between gap-3">
                <p className="text-[11px] text-[#8B9299]">
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
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F9F9F9]">
        {activeConv ? (
          <>
            {/* Thread header */}
            <div className="relative z-30 bg-white border-b border-[#EDEEF1] px-5 py-3 flex items-center gap-2 flex-shrink-0">
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
                  className="h-10 px-3 rounded-lg bg-[#F6F7F9] border border-[#EDEEF1] text-[#5C6370] flex items-center gap-2 hover:bg-white transition-colors max-w-[240px]"
                  title="Department / employee"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#3D4550] truncate">
                      {assignee?.name ?? 'Unassigned'}
                    </span>
                    <span className="text-[12px] text-[#8B9299] flex-shrink-0">·</span>
                    <span className="text-[12px] text-[#8B9299] truncate">
                      {assignee?.department ?? (assigneeDept ?? 'Department')}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8B9299]" />
                </button>
                {assigneeOpen && (
                  <div className="absolute left-0 mt-2 w-[540px] bg-white border border-[#EDEEF1] rounded-2xl shadow-panel z-[200] overflow-hidden">
                    <div className="grid grid-cols-[220px_1fr]">
                      {/* Left: departments */}
                      <div className="border-r border-[#EDEEF1]">
                        <div className="px-3 py-2 border-b border-[#EDEEF1]">
                          <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Departments</p>
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
                                  active ? 'bg-[#EEF2FC]' : 'hover:bg-[#F6F7F9]',
                                )}
                              >
                                <span className={cn('text-[12px] font-medium truncate', active ? 'text-[#2355A7]' : 'text-[#3D4550]')}>{dep}</span>
                                <ChevronDown className={cn('w-3.5 h-3.5 ml-auto -rotate-90', active ? 'text-[#2355A7]' : 'text-[#C4C8CF]')} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: people */}
                      <div>
                        <div className="px-3 py-2 border-b border-[#EDEEF1] flex items-center justify-between gap-2">
                          <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] truncate">
                            {assigneeDept ?? 'People'}
                          </p>
                          <button
                            type="button"
                            onClick={() => { setAssigneeOpen(false); setActiveConv(prev => (prev ? { ...prev, assignedTo: null } : prev)); }}
                            className="text-[11px] font-semibold text-[#2355A7] hover:underline flex-shrink-0"
                          >
                            Unassign
                          </button>
                        </div>
                        <div className="px-3 pt-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B9299]" />
                            <input
                              value={assigneeQuery}
                              onChange={e => setAssigneeQuery(e.target.value)}
                              placeholder="Search manager…"
                              className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#EDEEF1] bg-[#F6F7F9] text-[12px] text-[#3D4550] placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition"
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
                                  active ? 'bg-[#EEF2FC]' : 'hover:bg-[#F6F7F9]',
                                )}
                              >
                                <span className={cn(
                                  'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                                  active ? 'bg-[#2355A7] text-white' : 'bg-[#F6F7F9] text-[#5C6370] border border-[#EDEEF1]',
                                )}>{initials}</span>
                                <div className="min-w-0">
                                  <div className={cn('text-[12px] font-medium truncate', active ? 'text-[#2355A7]' : 'text-[#3D4550]')}>
                                    {u.name}
                                  </div>
                                  <div className="text-[10px] text-[#8B9299] truncate">{u.role}</div>
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
                            <div className="px-3 py-10 text-center text-[12px] text-[#8B9299]">
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
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeConv.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[14px] text-[#8B9299]">
                  No messages yet.
                </div>
              ) : (
                <>
                  {threadSystemEvents.map((e, i) => <SystemEvent key={`${e}-${i}`} text={e} />)}
                  {activeConv.messages.map(msg => (
                    <Bubble
                      key={msg.id}
                      msg={msg}
                      translatorEnabled={translatorEnabled}
                      translateGuestToMy={translateGuestToMy}
                      guestLang={translator.read}
                      myLang={myLang}
                      showOriginalById={showOriginalById}
                      toggleOriginal={toggleOriginal}
                    />
                  ))}
                </>
              )}
            </div>

            {/* ── Reply box ── */}
            <div className="bg-white border-t border-[#EDEEF1] flex-shrink-0">

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
                    'flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium transition-colors border',
                    sendChannelOpen
                      ? 'bg-[#EEF2FC] text-[#2355A7] border-[#BED4F6]'
                      : 'bg-[#F6F7F9] text-[#5C6370] border-[#EDEEF1] hover:text-[#0E1013] hover:bg-white',
                  )}
                >
                  <ChannelIcon channel={sendChannel} size="sm" className={sendChannelOpen ? 'text-[#2355A7]' : 'text-[#8B9299]'} />
                  {channelLabels[sendChannel]}
                  <ChevronDown className="w-3 h-3 text-[#8B9299]" />
                </button>

                {sendChannelOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-[200px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                    <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Send via</p>
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
                            active   ? 'bg-[#EEF2FC] font-semibold text-[#2355A7]' : 'text-[#0E1013] hover:bg-[#F6F7F9]',
                            !enabled && 'opacity-40 cursor-not-allowed',
                          )}
                        >
                          <ChannelIcon channel={ch} size="sm" className={active ? 'text-[#2355A7]' : 'text-[#8B9299]'} />
                          <span className="flex-1">{channelLabels[ch]}</span>
                          {!enabled && <span className="text-[10px] text-[#C4C8CF] font-normal">n/a</span>}
                          {active    && <span className="text-[#2355A7] text-[12px]">·</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-[#EDEEF1] mx-1" />

              <button
                type="button"
                onClick={() => setIsInternal(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium transition-colors',
                  isInternal
                    ? 'bg-[#F6F7F9] text-[#0E1013] border border-[#EDEEF1]'
                    : 'text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9]',
                )}
              >
                <Tag className="w-3 h-3" /> Note
              </button>

              {/* Divider */}
              <div className="w-px h-4 bg-[#EDEEF1] mx-1" />

              <button
                type="button"
                disabled={isInternal}
                onClick={() => setTranslatorEnabled(v => !v)}
                title={isInternal ? 'Translator is disabled for internal notes' : 'Live translation'}
                className={cn(
                  'flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium transition-colors',
                  isInternal && 'opacity-35 cursor-not-allowed',
                  translatorEnabled && !isInternal
                    ? 'bg-[#EEF2FC] text-[#2355A7] border border-[#BED4F6]'
                    : 'text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9]',
                )}
              >
                <Languages className="w-3.5 h-3.5" /> Translate
              </button>
            </div>

            {/* Translator settings bar — shown only when active */}
            {translatorEnabled && !isInternal && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#F6F7F9] rounded-xl border border-[#EDEEF1]">
                <Languages className="w-3.5 h-3.5 text-[#2355A7] flex-shrink-0" />

                {/* Source language */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setMyLangOpen(v => !v); setReplyLangOpen(false); }}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-white border border-[#EDEEF1] text-[11px] font-semibold text-[#0E1013] hover:border-[#BED4F6] transition-colors"
                  >
                    {languageLabel(myLang)}
                    <ChevronDown className="w-3 h-3 text-[#8B9299]" />
                  </button>
                  {myLangOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-[200px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">I write in</p>
                      {languageOptions.map(l => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => { setMyLang(l as any); setMyLangOpen(false); }}
                          className={cn(
                            'w-full px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors',
                            myLang === l ? 'bg-[#EEF2FC] text-[#0E1013]' : 'text-[#5C6370] hover:bg-[#F6F7F9]',
                          )}
                        >
                          <span className="font-medium">{languageLabel(l)}</span>
                          {myLang === l && <span className="text-[#2355A7] text-[10px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#C4C8CF] flex-shrink-0" />

                {/* Target language */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setReplyLangOpen(v => !v); setMyLangOpen(false); }}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-white border border-[#EDEEF1] text-[11px] font-semibold text-[#0E1013] hover:border-[#BED4F6] transition-colors"
                  >
                    {languageLabel(replyLang)}
                    <ChevronDown className="w-3 h-3 text-[#8B9299]" />
                  </button>
                  {replyLangOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-[200px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Send as</p>
                      {languageOptions.map(l => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => { setReplyLang(l as any); setReplyLangOpen(false); }}
                          className={cn(
                            'w-full px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors',
                            replyLang === l ? 'bg-[#EEF2FC] text-[#0E1013]' : 'text-[#5C6370] hover:bg-[#F6F7F9]',
                          )}
                        >
                          <span className="font-medium">{languageLabel(l)}</span>
                          {replyLang === l && <span className="text-[#2355A7] text-[10px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="ml-auto text-[10px] text-[#8B9299] hidden sm:block">
                  Guest reads in {languageLabel(replyLang)}
                </p>
              </div>
            )}

            {/* Textarea area */}
            {(!translatorEnabled || isInternal) ? (
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={isInternal ? 'Internal note — not visible to guest…' : 'Write a reply…'}
                rows={3}
                className={cn(
                  'w-full resize-none text-[13px] rounded-xl border px-4 py-3 placeholder:text-[#C4C8CF]',
                  'focus:outline-none focus:ring-2 focus:ring-[#BED4F6] transition-colors',
                  isInternal
                    ? 'bg-[#FAFAFA] border-[#EDEEF1] text-[#0E1013]'
                    : 'bg-[#F6F7F9] border-[#EDEEF1] text-[#0E1013] focus:bg-white focus:border-[#BED4F6]',
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
                    className="w-full h-full resize-none text-[13px] rounded-xl border border-[#EDEEF1] bg-white px-4 py-3 placeholder:text-[#C4C8CF] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:border-[#BED4F6] transition-colors"
                  />
                  <span className="absolute bottom-2 left-3 text-[9px] font-semibold text-[#C4C8CF] uppercase tracking-wider pointer-events-none">
                    {languageLabel(myLang)}
                  </span>
                </div>

                {/* Swap indicator */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#F6F7F9] border border-[#EDEEF1] flex items-center justify-center">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#C4C8CF]" />
                  </div>
                </div>

                {/* Target (what guest receives) */}
                <div className="flex-1 min-w-0 relative">
                  <textarea
                    value={replyText.trim() ? translateMyToReply(replyText) : ''}
                    readOnly
                    placeholder={`Will be sent in ${languageLabel(replyLang)}…`}
                    rows={3}
                    className="w-full h-full resize-none text-[13px] rounded-xl border border-[#EDEEF1] bg-[#F6F7F9] px-4 py-3 text-[#5C6370] placeholder:text-[#C4C8CF] cursor-default"
                  />
                  <span className="absolute bottom-2 left-3 text-[9px] font-semibold text-[#C4C8CF] uppercase tracking-wider pointer-events-none">
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
              <div className="border-t border-[#EDEEF1] bg-white">
                {/* Search + close */}
                <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                  <div className="flex-1 relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#C4C8CF]" />
                    <input
                      autoFocus
                      value={templateSearch}
                      onChange={e => setTemplateSearch(e.target.value)}
                      placeholder="Search templates…"
                      className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#EDEEF1] bg-[#F6F7F9] text-[12px] text-[#5C6370] placeholder:text-[#C4C8CF] focus:outline-none focus:ring-2 focus:ring-[#BED4F6]"
                    />
                  </div>
                  <button
                    onClick={() => { setTemplatesOpen(false); setTemplateSearch(''); setTemplateCategory('All'); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8B9299] hover:bg-[#F6F7F9] hover:text-[#5C6370] transition-colors text-[16px] leading-none"
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
                          ? 'bg-[#2355A7] text-white'
                          : 'bg-[#F6F7F9] text-[#5C6370] hover:bg-[#EDEEF1]',
                      )}
                    >{cat}</button>
                  ))}
                </div>

                {/* Template list */}
                <div className="max-h-[220px] overflow-y-auto divide-y divide-[#F4F5F7]">
                  {filtered.length === 0 ? (
                    <p className="px-4 py-4 text-[12px] text-[#8B9299]">No templates found.</p>
                  ) : filtered.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setReplyText(t.body);
                        setTemplatesOpen(false);
                        setTemplateSearch('');
                        setTemplateCategory('All');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F7F9] transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] font-semibold text-[#5C6370] group-hover:text-[#2355A7] transition-colors">{t.title}</span>
                        <span className="text-[10px] font-medium text-[#8B9299] bg-[#F6F7F9] border border-[#EDEEF1] px-1.5 py-0.5 rounded-md">{t.category}</span>
                      </div>
                      <p className="text-[11px] text-[#8B9299] leading-snug line-clamp-1">{t.body}</p>
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
                  'flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors',
                  templatesOpen ? 'bg-[#2355A7] text-white' : 'text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9]',
                )}
              >
                <FileText className="w-3.5 h-3.5" /> Templates
              </button>
              <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9] transition-colors">
                <Smile className="w-3.5 h-3.5" /> Emoji
              </button>
              <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9] transition-colors">
                <Paperclip className="w-3.5 h-3.5" /> Attach
              </button>
              <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9] transition-colors">
                <Mic className="w-3.5 h-3.5" /> Voice
              </button>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={handleSend}
              disabled={!replyText.trim() || !activeConv}
            >
              <Send className="w-3.5 h-3.5" /> Send
            </Button>
          </div>
        </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="flex items-start gap-4 max-w-[560px]">
              <div className="w-12 h-12 rounded-2xl bg-[#F6F7F9] border border-[#EDEEF1] flex items-center justify-center flex-shrink-0">
                <ArrowLeft className="w-6 h-6 text-[#2355A7]" />
              </div>
              <div className="pt-1">
                <h2 className="text-[14px] font-semibold text-[#3D4550] mb-1">Select a chat on the left</h2>
                <p className="text-[12px] text-[#8B9299] leading-relaxed">
                  Click any conversation to open the thread and start replying.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: guest sidebar ── */}
      <div className="w-[272px] flex-shrink-0 border-l border-[#EDEEF1] bg-white relative overflow-hidden">
        {guest ? (
          <>
            {/* ── Guest identity block ── */}
            <div className="px-4 pt-4 pb-3 border-b border-[#EDEEF1]">
              <div className="flex items-start justify-between gap-2">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={guest.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-[13px] font-semibold text-[#5C6370] truncate leading-tight">{guest.name}</h3>
                      {guest.tags.includes('VIP') && (
                        <span className="text-[9px] font-bold tracking-wider text-white bg-[#2355A7] px-1.5 py-0.5 rounded">VIP</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8B9299] mt-0.5">{guest.nationality} · {guest.language.toUpperCase()}</p>
                  </div>
                </div>
                {/* ··· menu */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setProfileMenuOpen(v => !v)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8B9299] hover:bg-[#F6F7F9] hover:text-[#5C6370] transition-colors"
                    title="More"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-1 w-[200px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Guest</p>
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); setMergeOpen(true); }}>
                        <ArrowLeftRight className="w-3.5 h-3.5 text-[#8B9299]" /> Merge profiles…
                      </button>
                      <div className="my-1 h-px bg-[#EDEEF1]" />
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Conversation</p>
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); addToast({ type: 'info', title: 'Chat exported' }); }}>
                        <FileText className="w-3.5 h-3.5 text-[#8B9299]" /> Export chat
                      </button>
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); addToast({ type: 'info', title: 'Notifications muted' }); }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-[#8B9299]" /> Mute notifications
                      </button>
                      <div className="my-1 h-px bg-[#EDEEF1]" />
                      <button className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors flex items-center gap-2"
                        onClick={() => { setProfileMenuOpen(false); addToast({ type: 'info', title: 'Blocked', message: `${guest.name} blocked` }); }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-[#8B9299]" /> Block guest
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Merge UI */}
              {mergeOpen && (
                <div className="mt-3 p-3 bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl">
                  <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] mb-2">Merge profiles</p>
                  <input
                    value={mergeQuery}
                    onChange={e => setMergeQuery(e.target.value)}
                    placeholder="Enter guest ID…"
                    className="w-full h-8 px-3 rounded-lg border border-[#EDEEF1] bg-white text-[12px] text-[#5C6370] placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6]"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="xs" variant="outline" onClick={() => { setMergeOpen(false); setMergeQuery(''); }}>Cancel</Button>
                    <Button size="xs" variant="primary" disabled={!mergeQuery.trim()}
                      onClick={() => { addToast({ type: 'success', title: 'Merged', message: `Applied merge with ${mergeQuery}` }); setMergeOpen(false); setMergeQuery(''); }}
                    >Apply</Button>
                  </div>
                </div>
              )}

              {/* Key stats row removed */}
            </div>

            {/* ── Menu + sliding detail panel ── */}
            {(() => {
              const menu = [
                { id: 'info' as const,        label: 'User info',            icon: User },
                { id: 'reservation' as const, label: 'Reservations',         icon: BedDouble },
                { id: 'pms' as const,         label: 'PMS data',              icon: Database },
                { id: 'actions' as const,     label: 'Quick actions',        icon: Activity },
                { id: 'engines' as const,     label: 'Engines log',          icon: Zap },
                { id: 'signals' as const,     label: 'Satisfaction signals', icon: TrendingUp },
                { id: 'properties' as const,  label: 'User properties',      icon: Settings2 },
                { id: 'calls' as const,       label: 'Calls',                icon: PhoneCall },
                { id: 'tags_notes' as const,  label: 'Tags & notes',         icon: Tag },
              ];

              const activeMeta = menu.find(m => m.id === guestSidebarSection) ?? menu[0];
              const openSection = (id: GuestSidebarSection) => {
                setGuestSidebarSection(id);
                setGuestSidebarOpen(true);
              };

              return (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-2">
                      <div className="rounded-2xl border border-[#EDEEF1] bg-white overflow-hidden">
                        {menu.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => openSection(id)}
                            className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-[#F6F7F9] transition-colors border-b border-[#F4F5F7] last:border-0"
                          >
                            <div className="w-8 h-8 rounded-xl bg-[#F6F7F9] border border-[#EDEEF1] flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-[#5C6370]" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-[12px] font-semibold text-[#5C6370] truncate">{label}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#C4C8CF] flex-shrink-0" />
                          </button>
                        ))}
                      </div>
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
                    <div className="px-3 py-3 border-b border-[#EDEEF1] flex items-center gap-2">
                      <button
                        onClick={() => setGuestSidebarOpen(false)}
                        className="w-8 h-8 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] flex items-center justify-center hover:bg-white transition-colors"
                        title="Back"
                      >
                        <ArrowLeft className="w-4 h-4 text-[#5C6370]" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-[#5C6370] truncate">{activeMeta.label}</p>
                        <p className="text-[10px] text-[#8B9299] truncate">{guest.name}</p>
                      </div>
                      <button
                        onClick={() => setGuestSidebarOpen(false)}
                        className="w-8 h-8 rounded-xl hover:bg-[#F6F7F9] text-[#8B9299] hover:text-[#3D4550] transition-colors flex items-center justify-center"
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
                            <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Contact</p>
                            <div className="flex items-center gap-2 text-[12px] text-[#5C6370]">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0 text-[#C4C8CF]" />
                              <span className="truncate">{guest.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-[#5C6370]">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#C4C8CF]" />
                              <span className="truncate">{guest.phone}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Profile</p>
                            {[
                              ['Nationality', guest.nationality],
                              ['Language', guest.language.toUpperCase()],
                              ['Source', guest.source],
                              ['Preferred channel', channelLabels[guest.preferredChannel]],
                              ['Status', guest.status],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between items-baseline py-2 border-b border-[#F4F5F7] last:border-0">
                                <span className="text-[11px] text-[#8B9299]">{k}</span>
                                <span className="text-[12px] font-medium text-[#3D4550] text-right max-w-[150px] truncate">{v}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* RESERVATIONS */}
                      {guestSidebarSection === 'reservation' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Current / upcoming reservation</p>
                            {reservation ? (
                              <div className="space-y-0">
                                {[
                                  ['Room', `#${reservation.roomNumber} · ${reservation.roomType}`],
                                  ['Dates', `${formatDate(reservation.checkIn)} → ${formatDate(reservation.checkOut)}`],
                                  ['Rate code', reservation.rateCode],
                                  ['Rate/night', formatCurrency(reservation.ratePerNight)],
                                ].map(([label, val]) => (
                                  <div key={label} className="flex justify-between items-baseline py-2 border-b border-[#F4F5F7] last:border-0">
                                    <span className="text-[11px] text-[#8B9299]">{label}</span>
                                    <span className="text-[12px] font-medium text-[#3D4550] text-right max-w-[160px] truncate">{val}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[12px] text-[#8B9299]">No active reservation.</p>
                            )}
                          </div>

                          {reservation?.specialRequests?.length ? (
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Special requests</p>
                              <div className="rounded-2xl border border-[#EDEEF1] bg-[#F9F9F9] p-3 space-y-1">
                                {reservation.specialRequests.map(r => (
                                  <p key={r} className="text-[12px] text-[#5C6370] leading-relaxed">- {r}</p>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* PMS */}
                      {guestSidebarSection === 'pms' && (
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-[#EDEEF1] bg-white p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Past visits</p>
                              <p className="text-[12px] font-semibold text-[#3D4550]" style={{ fontFamily: "'Azeret Mono', monospace" }}>{guest.totalVisits}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F4F5F7]">
                              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Total spend</p>
                              <p className="text-[12px] font-semibold text-[#2355A7]" style={{ fontFamily: "'Azeret Mono', monospace" }}>{formatCurrency(guest.lifetimeValue)}</p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Preferences</p>
                            <div className="rounded-2xl border border-[#EDEEF1] bg-[#F9F9F9] p-3 space-y-1">
                              {[
                                'Quiet room',
                                'Late check-out',
                                'High floor',
                                'Extra pillows',
                                'Non-smoking floor',
                              ].map(p => (
                                <div key={p} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#BED4F6]" />
                                  <p className="text-[12px] text-[#5C6370]">{p}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QUICK ACTIONS */}
                      {guestSidebarSection === 'actions' && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Quick actions</p>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={() => addToast({ type: 'info', title: 'Booking', message: 'Create / edit booking (mock)' })}
                              className="rounded-2xl border border-[#EDEEF1] bg-[#F6F7F9] hover:bg-white transition-colors px-3 py-3 text-left"
                            >
                              <div className="flex flex-col items-start">
                                <p className="text-[12px] font-semibold text-[#3D4550] leading-tight">Create / edit booking</p>
                                <p className="text-[10px] text-[#8B9299] mt-1 leading-tight">PMS / booking workflow</p>
                              </div>
                            </button>
                            <button
                              onClick={() => addToast({ type: 'success', title: 'Upsell', message: 'Upsell sent (mock)' })}
                              className="rounded-2xl border border-[#BED4F6] bg-[#2355A7]/10 hover:bg-[#2355A7]/15 transition-colors px-3 py-3 text-left"
                            >
                              <div className="flex flex-col items-start">
                                <p className="text-[12px] font-semibold text-[#2355A7] leading-tight">Send upsell</p>
                                <p className="text-[10px] text-[#5C6370] mt-1 leading-tight">Offer add-ons to the guest</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ENGINES LOG */}
                      {guestSidebarSection === 'engines' && (
                        <div className="space-y-0">
                          <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">All engine actions</p>
                          {[
                            { engine: 'Upsell',     action: 'Dinner package offered',         result: 'Accepted',  time: '21 Apr 2026, 11:15' },
                            { engine: 'Arrival',    action: 'Pre-arrival message sent',      result: 'Delivered', time: '20 Apr 2026, 09:00' },
                            { engine: 'Concierge',  action: 'Restaurant recommendation',     result: 'Clicked',   time: '14 Apr 2026, 12:44' },
                            { engine: 'Reputation', action: 'Review request triggered',      result: 'Pending',   time: '15 Apr 2026, 18:00' },
                          ].map((entry, i) => (
                            <div key={i} className="py-2.5 border-b border-[#F4F5F7] last:border-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[12px] font-semibold text-[#3D4550] truncate">{entry.engine}</p>
                                <span className="text-[10px] text-[#C4C8CF] flex-shrink-0">{entry.time}</span>
                              </div>
                              <p className="text-[12px] text-[#5C6370] mt-0.5">{entry.action}</p>
                              <span className="inline-flex mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F6F7F9] border border-[#EDEEF1] text-[#5C6370]">{entry.result}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SIGNALS */}
                      {guestSidebarSection === 'signals' && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Ratings</p>
                            <div className="rounded-2xl border border-[#EDEEF1] bg-white p-3 space-y-2">
                              {[
                                { date: '21 Apr 2026', score: 5, note: 'Loved the room setup' },
                                { date: '12 Mar 2025', score: 4, note: 'Small delay at check-in' },
                              ].map((s, i) => (
                                <div key={i} className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex gap-0.5">
                                      {[1,2,3,4,5].map(j => (
                                        <Star key={j} className={cn('w-3 h-3', j <= s.score ? 'fill-[#2355A7] text-[#2355A7]' : 'fill-transparent text-[#D1CFCF]')} />
                                      ))}
                                    </div>
                                    <p className="text-[11px] text-[#5C6370] mt-1 leading-relaxed">{s.note}</p>
                                  </div>
                                  <span className="text-[10px] text-[#8B9299] flex-shrink-0">{s.date}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Complaints</p>
                            <div className="rounded-2xl border border-[#EDEEF1] bg-[#F9F9F9] p-3 space-y-2">
                              {[
                                { date: '5 Aug 2024', text: 'Noise from adjacent room', resolved: true },
                                { date: '12 Mar 2025', text: 'Check-in wait time', resolved: true },
                              ].map((c, i) => (
                                <div key={i} className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[12px] text-[#5C6370]">{c.text}</p>
                                    <p className="text-[10px] text-[#C4C8CF] mt-0.5">{c.date}</p>
                                  </div>
                                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', c.resolved ? 'bg-[#EEF2FC] text-[#2355A7] border-[#BED4F6]' : 'bg-white text-[#8B9299] border-[#EDEEF1]')}>
                                    {c.resolved ? 'Resolved' : 'Open'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Sentiment tags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['Loyal', 'Anniversary', 'Quiet preference', 'High spender'].map(t => (
                                <span key={t} className="text-[11px] text-[#5C6370] bg-[#F6F7F9] border border-[#EDEEF1] px-2.5 py-1 rounded-full">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* USER PROPERTIES */}
                      {guestSidebarSection === 'properties' && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Automatically collected data</p>
                          <div className="rounded-2xl border border-[#EDEEF1] bg-white p-3 space-y-2">
                            {[
                              ['UTM source', 'google / cpc'],
                              ['Last website visit', '2d ago'],
                              ['Viewed pages', 'Spa, Rooms, Restaurant'],
                              ['Campaign', 'Spring getaway'],
                              ['Device', 'Mobile'],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between items-baseline py-1.5 border-b border-[#F4F5F7] last:border-0">
                                <span className="text-[11px] text-[#8B9299]">{k}</span>
                                <span className="text-[12px] font-medium text-[#3D4550] text-right max-w-[160px] truncate">{v}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-[#8B9299] leading-relaxed">
                            Configurable separately. Shown as an example.
                          </p>
                        </div>
                      )}

                      {/* CALLS */}
                      {guestSidebarSection === 'calls' && (
                        <div className="space-y-0">
                          <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-3">Inbound / outbound calls</p>
                          {[
                            { dir: 'in',  duration: '3m 42s', date: '21 Apr, 10:30', status: 'answered' },
                            { dir: 'out', duration: '1m 15s', date: '20 Apr, 14:00', status: 'answered' },
                            { dir: 'in',  duration: '—',      date: '18 Apr, 09:22', status: 'missed' },
                            { dir: 'out', duration: '5m 08s', date: '15 Apr, 16:45', status: 'answered' },
                          ].map((call, i) => (
                            <div key={i} className="flex gap-2.5 py-2.5 border-b border-[#F4F5F7] last:border-0">
                              <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold',
                                call.dir === 'in' ? 'bg-[#EEF2FC] text-[#2355A7]' : 'bg-[#F6F7F9] text-[#5C6370]',
                              )}>
                                {call.dir === 'in' ? '↙' : '↗'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <p className="text-[12px] font-medium text-[#0E1013]">{call.dir === 'in' ? 'Inbound' : 'Outbound'}</p>
                                  <span className={cn('text-[10px] font-medium', call.status === 'missed' ? 'text-[#8B9299]' : 'text-[#5C6370]')}>{call.duration}</span>
                                </div>
                                <p className="text-[10px] text-[#8B9299] mt-0.5">{call.date}</p>
                                <div className="flex gap-1.5 mt-1.5">
                                  {call.status === 'answered' ? (
                                    <>
                                      <button className="text-[10px] font-medium text-[#2355A7] hover:underline">▶ Listen</button>
                                      <span className="text-[#D1CFCF]">·</span>
                                      <button className="text-[10px] font-medium text-[#2355A7] hover:underline">Transcript</button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-[#8B9299]">Missed call</span>
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
                        const TAG_PALETTE = [
                          { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' }, // pink
                          { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }, // amber
                          { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' }, // blue
                          { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' }, // green
                          { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' }, // violet
                          { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' }, // gray
                        ] as const;
                        const tagStyle = (t: string) => {
                          const idx = Math.abs(Array.from(t).reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)) % TAG_PALETTE.length;
                          return TAG_PALETTE[idx];
                        };
                        const addTag = (t: string) => {
                          const tag = t.trim();
                          if (tag && !editableTags.includes(tag)) setEditableTags(prev => [...prev, tag]);
                          setNewTagInput('');
                        };
                        return (
                          <>
                            <div className="rounded-2xl border border-[#EDEEF1] bg-white overflow-hidden">
                              <div className="px-4 py-3 border-b border-[#F4F5F7] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-[#8B9299]" />
                                  <p className="text-[12px] font-semibold text-[#5C6370]">Tags</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-[#C4C8CF]" />
                              </div>

                              <div className="px-4 py-3 border-b border-[#F4F5F7]">
                                {editableTags.length === 0 ? (
                                  <p className="text-[12px] text-[#8B9299]">This user has no tags</p>
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

                              <div className="px-4 py-3 border-b border-[#F4F5F7]">
                                <button
                                  className="w-full h-10 px-3 rounded-xl border border-[#EDEEF1] bg-white text-left text-[12px] text-[#8B9299] flex items-center justify-between"
                                  onClick={() => { /* noop: visual only */ }}
                                  type="button"
                                >
                                  <span className="truncate">
                                    {newTagInput.trim() ? newTagInput : 'Find and add a tag…'}
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-[#C4C8CF] flex-shrink-0" />
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
                                <div className="rounded-xl border border-[#EDEEF1] bg-white">
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
                                  <div className="border-t border-[#F4F5F7] p-3">
                                    <button
                                      onClick={() => addTag(newTagInput || 'New tag')}
                                      className="w-full h-10 rounded-xl border border-[#BED4F6] bg-[#2355A7]/10 text-[#2355A7] text-[12px] font-semibold hover:bg-[#2355A7]/15 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Create new tag
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1 border-t border-[#EDEEF1]">
                              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider pt-1">Notes</p>
                              <textarea
                                value={editableNotes}
                                onChange={e => setEditableNotes(e.target.value)}
                                rows={6}
                                placeholder="Add a note about this guest…"
                                className="w-full resize-none text-[12px] text-[#0E1013] rounded-2xl border border-[#EDEEF1] bg-[#F9F9F9] px-3 py-2.5 placeholder:text-[#C4C8CF] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white leading-relaxed"
                              />
                              <button
                                onClick={() => addToast({ type: 'success', title: 'Notes saved' })}
                                className="w-full h-9 rounded-xl bg-[#F6F7F9] border border-[#EDEEF1] text-[12px] font-semibold text-[#5C6370] hover:bg-white hover:text-[#3D4550] transition-colors"
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
            <div className="w-full rounded-2xl border border-[#EDEEF1] bg-[#F9F9F9] p-5 text-center">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EDEEF1] flex items-center justify-center mx-auto mb-3">
                <User className="w-5 h-5 text-[#8B9299]" />
              </div>
              <p className="text-[12px] font-semibold text-[#3D4550]">No guest selected</p>
              <p className="text-[10px] text-[#8B9299] mt-1 leading-relaxed">
                Open a conversation on the left to view the guest profile.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
