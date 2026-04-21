import { useState } from 'react';
import { Search, Filter, Send, FileText, ArrowUpRight, CheckCircle, Phone, Mail, Plus, Star, Tag, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { mockConversations } from '../../data/mock/conversations';
import { mockGuests } from '../../data/mock/guests';
import { mockReservations } from '../../data/mock/reservations';
import { formatRelativeTime, formatDate, formatCurrency, engineColors, statusColors, channelLabels, cn } from '../../utils';
import type { Conversation } from '../../types';
import { useApp } from '../../app/AppContext';

const inboxTabs = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Mine' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'ai', label: 'AI Handled' },
];

const priorityColors = {
  urgent: 'border-l-rose-500',
  high: 'border-l-amber-400',
  normal: 'border-l-transparent',
  low: 'border-l-transparent',
};

function ConversationRow({ conv, isActive, onClick }: { conv: Conversation; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors relative border-l-2',
        isActive ? 'bg-blue-50/60 border-l-blue-500' : priorityColors[conv.priority],
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={conv.guestName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn('text-sm font-semibold truncate', conv.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700')}>
              {conv.guestName}
            </span>
            <ChannelIcon channel={conv.channel} size="sm" />
            {conv.unreadCount > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {conv.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate leading-relaxed">{conv.lastMessage}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {conv.engineName && (
              <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', engineColors[conv.engineName])}>
                {conv.engineName}
              </span>
            )}
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', statusColors[conv.status])}>
              {conv.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-[10px] text-slate-400 whitespace-nowrap">{formatRelativeTime(conv.lastMessageAt)}</p>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg }: { msg: import('../../types').Message }) {
  const isGuest = msg.sender === 'guest';
  const isInternal = msg.isInternal;
  const isSystem = msg.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full">
          <span>⚙</span>
          <span>{msg.content}</span>
        </div>
      </div>
    );
  }

  if (isInternal) {
    return (
      <div className="flex gap-3 my-2">
        <Avatar name={msg.senderName} size="xs" />
        <div className="max-w-[70%] bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-amber-800">{msg.senderName}</span>
            <Badge variant="amber" size="sm">Internal</Badge>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">{msg.content}</p>
          <p className="text-[10px] text-amber-600 mt-1">{formatRelativeTime(msg.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 my-2', isGuest ? '' : 'flex-row-reverse')}>
      {isGuest
        ? <Avatar name={msg.senderName} size="xs" />
        : <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700 flex-shrink-0">AI</div>
      }
      <div className={cn(
        'max-w-[72%] rounded-2xl px-4 py-2.5',
        isGuest
          ? 'bg-white border border-slate-100 rounded-tl-sm'
          : 'bg-slate-900 text-white rounded-tr-sm',
      )}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn('text-xs font-semibold', isGuest ? 'text-slate-900' : 'text-white/80')}>
            {msg.senderName}
          </span>
          {msg.engineName && (
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', engineColors[msg.engineName])}>
              {msg.engineName}
            </span>
          )}
        </div>
        <p className={cn('text-sm leading-relaxed', isGuest ? 'text-slate-800' : 'text-white/95')}>{msg.content}</p>
        <p className={cn('text-[10px] mt-1', isGuest ? 'text-slate-400' : 'text-white/50')}>
          {formatRelativeTime(msg.timestamp)} · {channelLabels[msg.channel]}
        </p>
      </div>
    </div>
  );
}

export function InboxPage() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [activeConv, setActiveConv] = useState<Conversation>(mockConversations[0]);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const guest = mockGuests.find(g => g.id === activeConv.guestId);
  const reservation = mockReservations.find(r => r.guestId === activeConv.guestId);

  const filteredConversations = mockConversations.filter(c => {
    if (activeTab === 'mine') return c.assignedTo === 'user_003';
    if (activeTab === 'unassigned') return c.assignedTo === null;
    if (activeTab === 'ai') return c.status === 'ai_handled';
    return true;
  });

  const handleSend = () => {
    if (!replyText.trim()) return;
    addToast({ type: 'success', title: 'Message sent', message: `Replied to ${activeConv.guestName}` });
    setReplyText('');
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Conversation List */}
      <div className="w-[320px] flex-shrink-0 border-r border-slate-100 bg-white flex flex-col">
        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-100 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
        <Tabs tabs={inboxTabs} activeTab={activeTab} onChange={setActiveTab} className="px-4 flex-shrink-0" />
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeConv.id}
              onClick={() => setActiveConv(conv)}
            />
          ))}
        </div>
      </div>

      {/* Center: Conversation Thread */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Thread Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
          <Avatar name={activeConv.guestName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">{activeConv.guestName}</h2>
              <ChannelIcon channel={activeConv.channel} size="sm" />
              {activeConv.engineName && (
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', engineColors[activeConv.engineName])}>
                  {activeConv.engineName}
                </span>
              )}
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColors[activeConv.status])}>
                {activeConv.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{channelLabels[activeConv.channel]} · {formatRelativeTime(activeConv.lastMessageAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="xs" variant="secondary" onClick={() => addToast({ type: 'info', title: 'Booking created', message: 'Draft booking opened in PMS' })}>
              <Plus className="w-3 h-3" /> Booking
            </Button>
            <Button size="xs" variant="secondary" onClick={() => addToast({ type: 'success', title: 'Upsell sent', message: 'Offer sent to guest' })}>
              <Star className="w-3 h-3" /> Upsell
            </Button>
            <Button size="xs" variant="danger" onClick={() => addToast({ type: 'warning', title: 'Escalated', message: 'Conversation sent to manager' })}>
              <ArrowUpRight className="w-3 h-3" /> Escalate
            </Button>
            <Button size="xs" variant="secondary" onClick={() => addToast({ type: 'success', title: 'Resolved', message: 'Conversation marked as resolved' })}>
              <CheckCircle className="w-3 h-3" /> Resolve
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeConv.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No messages in this conversation yet.
            </div>
          ) : (
            activeConv.messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))
          )}
        </div>

        {/* Reply Box */}
        <div className="bg-white border-t border-slate-100 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3 mb-2">
            <button
              onClick={() => setIsInternal(false)}
              className={cn('text-xs font-medium px-3 py-1 rounded-full transition-colors', !isInternal ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
            >
              Reply
            </button>
            <button
              onClick={() => setIsInternal(true)}
              className={cn('text-xs font-medium px-3 py-1 rounded-full transition-colors flex items-center gap-1', isInternal ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
            >
              <Tag className="w-3 h-3" /> Internal Note
            </button>
          </div>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={isInternal ? 'Write an internal note (not visible to guest)...' : `Reply to ${activeConv.guestName}...`}
            rows={3}
            className={cn(
              'w-full resize-none text-sm rounded-xl border px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
              isInternal
                ? 'bg-amber-50 border-amber-200 text-amber-900 focus:ring-amber-200'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-200',
            )}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button size="xs" variant="ghost" onClick={() => {}}>
                <FileText className="w-3 h-3" /> Templates
              </Button>
            </div>
            <Button size="sm" variant="primary" onClick={handleSend} disabled={!replyText.trim()}>
              <Send className="w-3.5 h-3.5" /> Send
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Guest Profile */}
      <div className="w-[280px] flex-shrink-0 border-l border-slate-100 bg-white overflow-y-auto">
        {guest ? (
          <div className="p-5 space-y-5">
            {/* Guest Header */}
            <div className="text-center">
              <Avatar name={guest.name} size="lg" className="mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-900">{guest.name}</h3>
              <p className="text-xs text-slate-500">{guest.nationality} · {guest.language.toUpperCase()}</p>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {guest.tags.map(tag => (
                  <Badge key={tag} variant={tag === 'VIP' ? 'purple' : 'default'}>{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact</p>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{guest.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{guest.phone}</span>
              </div>
            </div>

            {/* Reservation */}
            {reservation && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Reservation</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Ref</span>
                    <span className="font-mono font-medium text-slate-800">{reservation.bookingRef}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Room</span>
                    <span className="font-medium text-slate-800">{reservation.roomType} · #{reservation.roomNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-medium text-slate-800">{formatDate(reservation.checkIn)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Check-out</span>
                    <span className="font-medium text-slate-800">{formatDate(reservation.checkOut)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Rate</span>
                    <span className="font-medium text-slate-800">{formatCurrency(reservation.ratePerNight)}/night</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(reservation.totalAmount)}</span>
                  </div>
                </div>
                {reservation.specialRequests.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Special Requests</p>
                    {reservation.specialRequests.map(req => (
                      <p key={req} className="text-xs text-slate-600 leading-relaxed">· {req}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Guest Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-0.5">Total Stays</p>
                <p className="text-lg font-semibold text-slate-900">{guest.totalVisits}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-0.5">Lifetime Value</p>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(guest.lifetimeValue)}</p>
              </div>
            </div>

            {/* Satisfaction */}
            {guest.satisfactionScore && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Satisfaction</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={cn('w-4 h-4', i <= (guest.satisfactionScore ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                  ))}
                </div>
              </div>
            )}

            {/* Companions */}
            {guest.companions.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Travel Party</p>
                {guest.companions.map(c => (
                  <div key={c} className="flex items-center gap-2 mb-1.5">
                    <Avatar name={c} size="xs" />
                    <span className="text-xs text-slate-700">{c}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {guest.notes && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notes</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2">{guest.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            No guest profile found.
          </div>
        )}
      </div>
    </div>
  );
}
