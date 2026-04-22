import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Send, FileText, ArrowUpRight, CheckCircle, Phone, Mail, Plus, Star, Tag, ChevronDown, Filter,
  AlertTriangle, Settings2, Smile, Paperclip, Mic, Languages, MoreHorizontal,
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { mockConversations } from '../../data/mock/conversations';
import { mockGuests } from '../../data/mock/guests';
import { mockReservations } from '../../data/mock/reservations';
import { mockUsers } from '../../data/mock/users';
import { formatRelativeTime, formatDate, formatCurrency, channelLabels, cn } from '../../utils';
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
  urgent: 'border-l-[#0E1013]',
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
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-[#EDEEF1] hover:bg-[#F9F9F9] transition-colors border-l-2',
        isActive ? 'bg-[#F9F9F9] border-l-[#0E1013]' : priorityBorder[conv.priority],
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={conv.guestName} size="sm" />
        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cn(
              'text-[13px] truncate',
              conv.unreadCount > 0 ? 'font-semibold text-[#0E1013]' : 'font-medium text-[#0E1013]',
            )}>
              {conv.guestName}
            </span>
            <span className="text-[11px] text-[#8B9299] whitespace-nowrap flex-shrink-0">
              {formatRelativeTime(conv.lastMessageAt)}
            </span>
          </div>

          {/* Last message */}
          <p className="text-[12px] text-[#5C6370] truncate leading-relaxed">
            {conv.lastMessage}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5">
            <ChannelIcon channel={conv.channel} size="sm" />
            <span className="text-[11px] text-[#8B9299]">{channelLabels[conv.channel]}</span>
            {conv.engineName && (
              <>
                <span className="text-[#D1CFCF]">·</span>
                <span className="text-[11px] text-[#8B9299]">{conv.engineName}</span>
              </>
            )}
            {conv.unreadCount > 0 && (
              <span className="ml-auto w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: '#2355A7' }}>
                {conv.unreadCount}
              </span>
            )}
            {conv.status === 'escalated' && (
              <span className="ml-auto text-[10px] font-semibold text-[#0E1013] bg-[#F6F7F9] px-1.5 py-0.5 rounded">
                Escalated
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Message bubble ──────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: import('../../types').Message }) {
  const isGuest   = msg.sender === 'guest';
  const isInternal = msg.isInternal;
  const isSystem  = msg.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="flex items-center gap-2 text-[11px] text-[#8B9299] bg-[#F6F7F9] px-3 py-1.5 rounded-full border border-[#EDEEF1]">
          <ChannelIcon channel={msg.channel} size="sm" />
          <span>{msg.content}</span>
          <span className="text-[#D1CFCF]">·</span>
          <span className="tabular-nums">{formatRelativeTime(msg.timestamp)}</span>
        </div>
      </div>
    );
  }

  if (isInternal) {
    return (
      <div className="flex gap-2.5 my-2">
        <Avatar name={msg.senderName} size="xs" />
        <div className="max-w-[70%] bg-white border border-[#EDEEF1] rounded-xl px-3.5 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[12px] font-semibold text-[#0E1013]">{msg.senderName}</span>
            <span className="text-[10px] text-[#2355A7] bg-[#EEF2FC] px-1.5 py-0.5 rounded">Note</span>
          </div>
          <p className="text-[13px] text-[#0E1013] leading-relaxed">{msg.content}</p>
          <p className="text-[10px] text-[#8B9299] mt-1">{formatRelativeTime(msg.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2.5 my-2', isGuest ? '' : 'flex-row-reverse')}>
      {isGuest
        ? <Avatar name={msg.senderName} size="xs" />
        : (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: '#2355A7' }}>
            AI
          </div>
        )
      }
      <div
        className={cn(
          'max-w-[72%] rounded-2xl px-4 py-2.5',
          isGuest ? 'bg-white border border-[#EDEEF1] rounded-tl-sm' : 'rounded-tr-sm',
        )}
        style={!isGuest ? { backgroundColor: '#2355A7' } : undefined}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <ChannelIcon channel={msg.channel} size="sm" className={cn(isGuest ? 'opacity-80' : 'text-white/80')} />
          <span className={cn('text-[11px] font-semibold', isGuest ? 'text-[#8B9299]' : 'text-white/75')}>
            {msg.senderName}
          </span>
          {msg.engineName && (
            <span className={cn('text-[10px]', isGuest ? 'text-[#8B9299]' : 'text-white/55')}>
              · {msg.engineName}
            </span>
          )}
          <span className={cn('text-[10px] ml-auto tabular-nums', isGuest ? 'text-[#D1CFCF]' : 'text-white/55')}>
            {formatRelativeTime(msg.timestamp)}
          </span>
        </div>
        <p className={cn('text-[13px] leading-relaxed', isGuest ? 'text-[#0E1013]' : 'text-white')}>
          {msg.content}
        </p>
      </div>
    </div>
  );
}

function SystemEvent({ text }: { text: string }) {
  return (
    <div className="flex justify-center my-3">
      <div className="text-[11px] text-[#8B9299] bg-[#F6F7F9] px-3 py-1.5 rounded-full border border-[#EDEEF1]">
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

  const [activeConv, setActiveConv] = useState<Conversation>(mockConversations[0]);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendChannel, setSendChannel] = useState<Conversation['channel']>('whatsapp');
  const [sendChannelOpen, setSendChannelOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [chatActionsOpen, setChatActionsOpen] = useState(false);

  const [profileTab, setProfileTab] = useState('info');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeQuery, setMergeQuery] = useState('');

  const guest = mockGuests.find(g => g.id === activeConv.guestId);
  const reservation = mockReservations.find(r => r.guestId === activeConv.guestId);
  const assignee = activeConv.assignedTo ? mockUsers.find(u => u.id === activeConv.assignedTo) : null;

  const conversationStatusOptions: { id: Conversation['status']; label: string }[] = [
    { id: 'open', label: 'New' },
    { id: 'pending', label: 'Pending' },
    { id: 'ai_handled', label: 'Paused' },
    { id: 'escalated', label: 'Urgent' },
    { id: 'resolved', label: 'Closed' },
  ];

  const statusLabel = (s: Conversation['status']) => {
    if (s === 'open') return 'New';
    if (s === 'pending') return 'Pending';
    if (s === 'ai_handled') return 'Paused';
    if (s === 'escalated') return 'Urgent';
    if (s === 'resolved') return 'Closed';
    return s;
  };

  const availableChannels = useMemo(() => {
    const set = new Set<Conversation['channel']>();
    for (const c of mockConversations) set.add(c.channel);
    return Array.from(set);
  }, []);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of mockConversations) for (const t of c.tags ?? []) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

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
    const set = new Set<Conversation['channel']>();
    for (const m of activeConv.messages) set.add(m.channel);
    if (set.size === 0) set.add(activeConv.channel);
    return Array.from(set);
  }, [activeConv]);

  const translator = useMemo(() => {
    const guestLang = guest?.language;
    const replyLang = guestLang ?? 'en';
    return { read: guestLang ?? 'en', reply: replyLang };
  }, [guest]);

  const threadSystemEvents = useMemo(() => {
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
    if (!replyText.trim()) return;
    addToast({ type: 'success', title: 'Message sent' });
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
                className="h-8 px-3 rounded-lg bg-[#F6F7F9] border border-[#EDEEF1] text-[12px] font-medium text-[#0E1013] flex items-center gap-2 hover:bg-white transition-colors"
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
                        activeView === v ? 'bg-[#EEF2FC] text-[#0E1013]' : 'text-[#5C6370] hover:bg-[#F6F7F9] hover:text-[#0E1013]',
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
                        activeView === v ? 'bg-[#EEF2FC] text-[#0E1013]' : 'text-[#5C6370] hover:bg-[#F6F7F9] hover:text-[#0E1013]',
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
                    <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Filters</p>
                    <button
                      className="text-[11px] font-semibold text-[#2355A7] hover:underline"
                      onClick={() => { setChannelFilter(new Set()); setTagFilter(new Set()); }}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] mb-2">Channels</p>
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
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0E1013] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
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
              isActive={conv.id === activeConv.id}
              onClick={() => setActiveConv(conv)}
            />
          ))}
        </div>
      </div>

      {/* New conversation modal */}
      {newConvOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <button
            className="absolute inset-0 bg-[#0E1013]/20"
            onClick={() => setNewConvOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-[520px] max-w-[calc(100vw-32px)] bg-white border border-[#EDEEF1] rounded-2xl shadow-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] mb-1">New conversation</p>
                <h3 className="text-[16px] font-semibold text-[#0E1013]" style={{ fontFamily: "'Azeret Mono', monospace" }}>
                  Start a thread
                </h3>
              </div>
              <button className="text-[#8B9299] hover:text-[#5C6370]" onClick={() => setNewConvOpen(false)}>×</button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] mb-2">Channel</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableChannels.map(ch => {
                    const selected = newConvChannel === ch;
                    return (
                      <button
                        key={ch}
                        onClick={() => setNewConvChannel(ch)}
                        className={cn(
                          'px-2.5 py-1.5 rounded-lg text-[12px] font-medium border transition-colors',
                          selected ? 'bg-[#EEF2FC] border-[#BED4F6] text-[#2355A7]' : 'bg-white border-[#EDEEF1] text-[#5C6370] hover:bg-[#F6F7F9]',
                        )}
                      >
                        {channelLabels[ch]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] mb-2">Message</p>
                <textarea
                  value={newConvMessage}
                  onChange={e => setNewConvMessage(e.target.value)}
                  rows={4}
                  placeholder="Write the first message…"
                  className="w-full resize-none text-[13px] rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] px-4 py-3 placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setNewConvOpen(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!newConvMessage.trim()}
                  onClick={() => {
                    addToast({
                      type: 'success',
                      title: 'Conversation created',
                      message: `Channel: ${channelLabels[newConvChannel]}`,
                    });
                    setNewConvOpen(false);
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Center: thread ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F9F9F9]">
        {/* Thread header */}
        <div className="bg-white border-b border-[#EDEEF1] px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <Avatar name={activeConv.guestName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-semibold text-[#0E1013]">{activeConv.guestName}</h2>
              <ChannelIcon channel={activeConv.channel} size="sm" />
              <span className="text-[12px] text-[#8B9299]">{channelLabels[activeConv.channel]}</span>
              {activeConv.status === 'escalated' && (
                <span className="text-[11px] font-semibold text-[#0E1013] bg-[#F6F7F9] px-1.5 py-0.5 rounded">Escalated</span>
              )}
            </div>
            <p className="text-[11px] text-[#8B9299] mt-0.5">
              {activeConv.engineName ? `${activeConv.engineName} engine` : 'No engine assigned'} · {formatRelativeTime(activeConv.lastMessageAt)}
            </p>
          </div>

          {/* Assignment + status (keep compact) */}
          <div className="relative">
            <button
              onClick={() => setAssigneeOpen(v => !v)}
              className="h-8 px-3 rounded-lg bg-[#F6F7F9] border border-[#EDEEF1] text-[12px] font-medium text-[#0E1013] flex items-center gap-2 hover:bg-white transition-colors"
              title="Department / employee"
            >
              <span className="text-[#8B9299]">{assignee?.department ?? 'Unassigned'}</span>
              <span className="text-[#0E1013] font-semibold">{assignee?.name?.split(' ')[0] ?? '—'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8B9299]" />
            </button>
            {assigneeOpen && (
              <div className="absolute right-0 mt-2 w-[260px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Departments</p>
                {Array.from(new Set(mockUsers.map(u => u.department))).map(dep => (
                  <div key={dep} className="px-1.5 py-1">
                    <div className="px-1.5 py-1 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">
                      {dep}
                    </div>
                    {mockUsers.filter(u => u.department === dep).map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setAssigneeOpen(false);
                          setActiveConv(prev => ({ ...prev, assignedTo: u.id }));
                          addToast({ type: 'success', title: 'Assigned', message: `${u.name}` });
                        }}
                        className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F6F7F9] transition-colors flex items-center justify-between text-[12px]"
                      >
                        <span className="font-medium text-[#0E1013]">{u.name}</span>
                        <span className="text-[#8B9299]">{u.role}</span>
                      </button>
                    ))}
                  </div>
                ))}
                <div className="my-1 h-px bg-[#EDEEF1]" />
                <button
                  onClick={() => { setAssigneeOpen(false); setActiveConv(prev => ({ ...prev, assignedTo: null })); }}
                  className="w-full px-2.5 py-2 rounded-lg hover:bg-[#F6F7F9] transition-colors text-left text-[12px] font-medium text-[#0E1013]"
                >
                  Unassign
                </button>
              </div>
            )}
          </div>

          {/* Status dropdown (spec UA list) */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(v => !v)}
              className="h-8 px-3 rounded-lg bg-white border border-[#EDEEF1] text-[12px] font-semibold text-[#0E1013] flex items-center gap-2 hover:bg-[#F6F7F9] transition-colors"
              title="Status"
            >
              <span className="text-[#2355A7]">{statusLabel(activeConv.status)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8B9299]" />
            </button>
            {statusOpen && (
              <div className="absolute right-0 mt-2 w-[220px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Status</p>
                {conversationStatusOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setStatusOpen(false);
                      setActiveConv(prev => ({ ...prev, status: opt.id }));
                      addToast({ type: 'info', title: 'Status updated', message: opt.label });
                    }}
                    className={cn(
                      'w-full px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors',
                      activeConv.status === opt.id ? 'bg-[#EEF2FC] text-[#0E1013]' : 'text-[#5C6370] hover:bg-[#F6F7F9] hover:text-[#0E1013]',
                    )}
                  >
                    <span className="font-medium">{opt.label}</span>
                    {activeConv.status === opt.id && <span className="text-[#2355A7] font-semibold">•</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Channel + translator (compact) */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setSendChannelOpen(v => !v)}
                className="h-8 px-3 rounded-lg bg-[#F6F7F9] border border-[#EDEEF1] text-[12px] font-medium text-[#0E1013] flex items-center gap-2 hover:bg-white transition-colors"
                title="Send via"
              >
                <span className="uppercase tracking-[0.08em]">{channelLabels[sendChannel]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8B9299]" />
              </button>
              {sendChannelOpen && (
                <div className="absolute right-0 mt-2 w-[220px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                  <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Channels</p>
                  {availableChannels.map(ch => {
                    const enabled = clientChannels.includes(ch);
                    const active = sendChannel === ch;
                    return (
                      <button
                        key={ch}
                        disabled={!enabled}
                        onClick={() => { setSendChannelOpen(false); setSendChannel(ch); }}
                        className={cn(
                          'w-full px-2.5 py-2 rounded-lg text-[12px] flex items-center justify-between transition-colors',
                          !enabled && 'opacity-40 cursor-not-allowed',
                          enabled && (active ? 'bg-[#EEF2FC] text-[#0E1013]' : 'text-[#5C6370] hover:bg-[#F6F7F9] hover:text-[#0E1013]'),
                        )}
                      >
                        <span className="font-medium">{channelLabels[ch]}</span>
                        {active && <span className="text-[#2355A7] font-semibold">•</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className="h-8 px-3 rounded-lg bg-white border border-[#EDEEF1] flex items-center gap-2"
              title={`Read ${languageLabel(translator.read)} · Reply ${languageLabel(translator.reply)}`}
            >
              <Languages className="w-4 h-4 text-[#2355A7]" />
              <div className="text-[11px] font-semibold text-[#0E1013] whitespace-nowrap">
                {languageLabel(translator.read)} → {languageLabel(translator.reply)}
              </div>
            </div>
          </div>

          {/* Actions (move to one menu to reduce overload) */}
          <div className="relative">
            <button
              onClick={() => setChatActionsOpen(v => !v)}
              className="h-8 w-8 rounded-lg bg-[#F6F7F9] border border-[#EDEEF1] flex items-center justify-center text-[#5C6370] hover:bg-white transition-colors"
              title="Actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {chatActionsOpen && (
              <div className="absolute right-0 mt-2 w-[220px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                <p className="px-2 py-1.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em]">Actions</p>
                <button
                  className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors flex items-center gap-2"
                  onClick={() => { setChatActionsOpen(false); addToast({ type: 'info', title: 'Draft booking created' }); }}
                >
                  <Plus className="w-3.5 h-3.5 text-[#2355A7]" /> Booking
                </button>
                <button
                  className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors flex items-center gap-2"
                  onClick={() => { setChatActionsOpen(false); addToast({ type: 'success', title: 'Upsell sent' }); }}
                >
                  <Star className="w-3.5 h-3.5 text-[#2355A7]" /> Upsell
                </button>
                <button
                  className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors flex items-center gap-2"
                  onClick={() => { setChatActionsOpen(false); addToast({ type: 'warning', title: 'Escalated' }); }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#0E1013]" /> Escalate
                </button>
                <button
                  className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors flex items-center gap-2"
                  onClick={() => { setChatActionsOpen(false); addToast({ type: 'success', title: 'Resolved' }); }}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#2355A7]" /> Resolve
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeConv.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[13px] text-[#8B9299]">
              No messages yet.
            </div>
          ) : (
            <>
              {threadSystemEvents.map((e, i) => <SystemEvent key={`${e}-${i}`} text={e} />)}
              {activeConv.messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
            </>
          )}
        </div>

        {/* Reply box */}
        <div className="bg-white border-t border-[#EDEEF1] px-5 py-3.5 flex-shrink-0">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setIsInternal(false)}
              className={cn('text-[12px] font-medium px-3 py-1 rounded-full transition-colors',
                !isInternal ? 'bg-[#0E1013] text-white' : 'text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9]',
              )}
            >Reply</button>
            <button
              onClick={() => setIsInternal(true)}
              className={cn('text-[12px] font-medium px-3 py-1 rounded-full transition-colors flex items-center gap-1',
                isInternal ? 'bg-[#EEF2FC] text-[#2355A7]' : 'text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9]',
              )}
            >
              <Tag className="w-3 h-3" /> Note
            </button>
          </div>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={isInternal ? 'Internal note (not visible to guest)…' : `Reply to ${activeConv.guestName}…`}
            rows={3}
            className={cn(
              'w-full resize-none text-[13px] rounded-xl border px-4 py-2.5 placeholder:text-[#8B9299] focus:outline-none focus:ring-2 transition-colors',
              isInternal
                ? 'bg-white border-[#BED4F6] text-[#0E1013] focus:ring-[#BED4F6]'
                : 'bg-[#F6F7F9] border-[#EDEEF1] text-[#0E1013] focus:ring-[#BED4F6] focus:bg-white',
            )}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Button size="xs" variant="ghost">
                <FileText className="w-3 h-3" /> Templates
              </Button>
              <Button size="xs" variant="ghost">
                <Smile className="w-3 h-3" /> Emoji
              </Button>
              <Button size="xs" variant="ghost">
                <Paperclip className="w-3 h-3" /> Attach
              </Button>
              <Button size="xs" variant="ghost">
                <Mic className="w-3 h-3" /> Voice
              </Button>
            </div>
            <Button size="sm" variant="primary" onClick={handleSend} disabled={!replyText.trim()}>
              <Send className="w-3.5 h-3.5" /> Send
            </Button>
          </div>
        </div>
      </div>

      {/* ── Right: guest sidebar ── */}
      <div className="w-[260px] flex-shrink-0 border-l border-[#EDEEF1] bg-white overflow-y-auto">
        {guest ? (
          <div className="p-4 space-y-4">
            {/* Guest header + menu */}
            <div className="pt-1">
              <div className="flex items-start gap-3">
                <Avatar name={guest.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold text-[#0E1013] truncate">{guest.name}</h3>
                      <p className="text-[12px] text-[#8B9299] mt-0.5">{guest.nationality} · {guest.language.toUpperCase()}</p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setProfileMenuOpen(v => !v)}
                        className="w-8 h-8 rounded-lg bg-[#F6F7F9] border border-[#EDEEF1] flex items-center justify-center text-[#5C6370] hover:bg-white transition-colors"
                        title="More"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {profileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-[200px] bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 p-1.5">
                          <button
                            className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors"
                            onClick={() => { setProfileMenuOpen(false); addToast({ type: 'info', title: 'Blocked', message: `${guest.name} blocked` }); }}
                          >
                            Block
                          </button>
                          <button
                            className="w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium text-[#0E1013] hover:bg-[#F6F7F9] transition-colors"
                            onClick={() => { setProfileMenuOpen(false); setMergeOpen(true); }}
                          >
                            Merge…
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {guest.tags.includes('VIP') && (
                    <span className="inline-flex mt-2 text-[11px] font-semibold text-white bg-[#0E1013] px-2.5 py-0.5 rounded-full">VIP</span>
                  )}
                </div>
              </div>

              {mergeOpen && (
                <div className="mt-3 p-3 bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl">
                  <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.18em] mb-2">Merge chats</p>
                  <input
                    value={mergeQuery}
                    onChange={e => setMergeQuery(e.target.value)}
                    placeholder="Enter chat ID…"
                    className="w-full h-9 px-3 rounded-lg border border-[#EDEEF1] bg-white text-[12px] text-[#0E1013] placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6]"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="xs" variant="outline" onClick={() => { setMergeOpen(false); setMergeQuery(''); }}>
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      variant="primary"
                      disabled={!mergeQuery.trim()}
                      onClick={() => {
                        addToast({ type: 'success', title: 'Merged', message: `Applied merge with ${mergeQuery}` });
                        setMergeOpen(false);
                        setMergeQuery('');
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs
              tabs={[
                { id: 'info', label: 'Info' },
                { id: 'reservations', label: 'Reservations' },
                { id: 'pms', label: 'PMS' },
                { id: 'actions', label: 'Actions' },
                { id: 'engines', label: 'Engines log' },
                { id: 'signals', label: 'Signals' },
                { id: 'props', label: 'Props' },
                { id: 'tags', label: 'Tags & notes' },
              ]}
              activeTab={profileTab}
              onChange={setProfileTab}
              className="mt-3"
            />

            {profileTab === 'info' && (
              <>
                {/* Contact */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Contact</p>
                  <div className="flex items-center gap-2 text-[12px] text-[#5C6370]">
                    <Mail className="w-3.5 h-3.5 text-[#D1CFCF]" />
                    <span className="truncate">{guest.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[#5C6370]">
                    <Phone className="w-3.5 h-3.5 text-[#D1CFCF]" />
                    <span>{guest.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-2.5">
                    <p className="text-[10px] text-[#8B9299]">Total stays</p>
                    <p
                      className="text-[20px] font-semibold text-[#0E1013] mt-0.5 tabular-nums leading-tight"
                      style={{ fontFamily: "'Azeret Mono', monospace" }}
                    >{guest.totalVisits}</p>
                  </div>
                  <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-2.5">
                    <p className="text-[10px] text-[#8B9299]">Lifetime value</p>
                    <p
                      className="text-[14px] font-semibold text-[#0E1013] mt-0.5 tabular-nums leading-tight"
                      style={{ fontFamily: "'Azeret Mono', monospace" }}
                    >{formatCurrency(guest.lifetimeValue)}</p>
                  </div>
                </div>
              </>
            )}

            {/* Reservation */}
            {profileTab === 'reservations' && reservation && (
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Reservation</p>
                {[
                  ['Ref',      reservation.bookingRef],
                  ['Room',     `${reservation.roomType} · #${reservation.roomNumber}`],
                  ['Check-in', formatDate(reservation.checkIn)],
                  ['Check-out',formatDate(reservation.checkOut)],
                  ['Total',    formatCurrency(reservation.totalAmount)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-[12px]">
                    <span className="text-[#8B9299]">{label}</span>
                    <span className="font-medium text-[#0E1013] text-right max-w-[140px] truncate">{val}</span>
                  </div>
                ))}
                {reservation.specialRequests.length > 0 && (
                  <div className="pt-1.5 border-t border-[#EDEEF1] mt-1.5">
                    {reservation.specialRequests.map(r => (
                      <p key={r} className="text-[11px] text-[#5C6370] leading-relaxed">· {r}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {profileTab === 'actions' && (
              <div className="space-y-2">
                <Button size="sm" variant="primary" className="w-full" onClick={() => addToast({ type: 'info', title: 'Create booking', message: 'Booking flow opened' })}>
                  Create / Edit booking
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => addToast({ type: 'info', title: 'Upsell', message: 'Upsell flow opened' })}>
                  Send upsell
                </Button>
              </div>
            )}

            {profileTab === 'engines' && (
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3">
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Engines log</p>
                <p className="text-[12px] text-[#5C6370] leading-relaxed">
                  AI engine actions for this guest will be shown here.
                </p>
              </div>
            )}

            {profileTab === 'signals' && (
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3">
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Satisfaction signals</p>
                <p className="text-[12px] text-[#5C6370] leading-relaxed">
                  Complaints, ratings, sentiment tags history.
                </p>
              </div>
            )}

            {profileTab === 'pms' && (
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3">
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">PMS data</p>
                <p className="text-[12px] text-[#5C6370] leading-relaxed">
                  Past visits, total spend, preferences — sourced from PMS.
                </p>
              </div>
            )}

            {profileTab === 'props' && (
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3">
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">User properties</p>
                <p className="text-[12px] text-[#5C6370] leading-relaxed">
                  Automatically collected properties (site interactions, ad attribution).
                </p>
              </div>
            )}

            {/* Satisfaction */}
            {profileTab === 'info' && guest.satisfactionScore && (
              <div>
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-1.5">Satisfaction</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i <= (guest.satisfactionScore ?? 0) ? 'fill-[#2355A7] text-[#2355A7]' : 'text-[#D1CFCF] fill-transparent',
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {profileTab === 'tags' && guest.notes && (
              <div>
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-1.5">Notes</p>
                <p className="text-[12px] text-[#5C6370] leading-relaxed bg-[#F9F9F9] border border-[#EDEEF1] rounded-lg px-3 py-2">{guest.notes}</p>
              </div>
            )}

            {/* Tags */}
            {profileTab === 'tags' && (
              <div>
              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1">
                {guest.tags.map(tag => (
                  <span key={tag} className="text-[11px] font-medium text-[#5C6370] bg-[#F6F7F9] border border-[#EDEEF1] px-2 py-0.5 rounded-md">{tag}</span>
                ))}
              </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-[13px] text-[#8B9299]">
            No guest profile.
          </div>
        )}
      </div>
    </div>
  );
}
