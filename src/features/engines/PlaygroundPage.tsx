import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, RefreshCw, Zap, User, Bot, ChevronDown, AlertTriangle } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { mockGuests } from '../../data/mock/guests';
import { cn, formatDateTime } from '../../utils';

const ENGINE_COLORS: Record<string, string> = {
  Conversion: '#2355A7', Reservation: '#0EA5E9', Upsell: '#8B5CF6',
  Arrival: '#10B981', Concierge: '#F59E0B', Recovery: '#EF4444', Reputation: '#EC4899',
};

interface ChatMessage {
  id: string;
  role: 'guest' | 'agent';
  text: string;
  ts: Date;
  debug?: {
    intent: string;
    confidence: number;
    source: string;
    connects: number;
    routing: string;
    integrations: string[];
  };
}

const MOCK_RESPONSES: Record<string, ChatMessage['debug'] & { reply: string }> = {
  default: {
    reply: "Thank you for your message! How can I assist you today at Grand Palace Hotel?",
    intent: 'general_inquiry', confidence: 0.91, source: 'Q&A Pair #12',
    connects: 1.4, routing: 'Handled by this engine', integrations: [],
  },
  booking: {
    reply: "I'd be happy to help you with your booking! We have availability for your dates. Our Deluxe King Room starts at €240/night with breakfast included. Shall I proceed?",
    intent: 'booking_inquiry', confidence: 0.97, source: 'PMS live data',
    connects: 2.1, routing: 'Handled by this engine', integrations: ['Cloudbeds PMS — get_availability'],
  },
  upgrade: {
    reply: "Excellent news! I can offer you a complimentary room upgrade to our Junior Suite — it features a stunning city view and a separate seating area. Shall I confirm the upgrade?",
    intent: 'upsell_opportunity', confidence: 0.88, source: 'Offer: Room Upgrade — VIP',
    connects: 1.8, routing: 'Handled by this engine', integrations: ['Cloudbeds PMS — update_reservation'],
  },
  spa: {
    reply: "Our Serenity Spa has availability this afternoon at 3:00 PM and 5:00 PM. The Couples' Massage package is €180 for 90 minutes. Would you like me to book it?",
    intent: 'spa_inquiry', confidence: 0.94, source: 'MCP: book_spa_appointment',
    connects: 2.3, routing: 'Handled by this engine', integrations: ['Spa & Dining MCP — check_spa_availability'],
  },
  complaint: {
    reply: "I sincerely apologize for the inconvenience. I've immediately notified our duty manager who will visit your room within 5 minutes. We'll also apply a €50 F&B credit to your account.",
    intent: 'guest_complaint', confidence: 0.99, source: 'Recovery flow',
    connects: 3.1, routing: 'Escalated → Front Office (GM notified)', integrations: ['Cloudbeds PMS — get_reservation', 'Cloudbeds PMS — add_compensation'],
  },
};

function getAutoReply(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('book') || lower.includes('room') || lower.includes('avail')) return MOCK_RESPONSES.booking;
  if (lower.includes('upgrade')) return MOCK_RESPONSES.upgrade;
  if (lower.includes('spa') || lower.includes('massage')) return MOCK_RESPONSES.spa;
  if (lower.includes('complaint') || lower.includes('noise') || lower.includes('terrible') || lower.includes('unacceptable')) return MOCK_RESPONSES.complaint;
  return MOCK_RESPONSES.default;
}

export function PlaygroundPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDebug, setSelectedDebug] = useState<string | null>(null);

  /* Guest profile state */
  const [guestName, setGuestName] = useState('Test Guest');
  const [checkIn, setCheckIn] = useState('2026-05-10');
  const [checkOut, setCheckOut] = useState('2026-05-13');
  const [roomType, setRoomType] = useState('Deluxe King');
  const [visits, setVisits] = useState('1');
  const [channel, setChannel] = useState('whatsapp');
  const [selectedGuestId, setSelectedGuestId] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!engine) return null;
  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'guest',
      text: input,
      ts: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const resp = getAutoReply(input);
      const agentMsg: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: 'agent',
        text: resp.reply,
        ts: new Date(),
        debug: {
          intent: resp.intent,
          confidence: resp.confidence,
          source: resp.source,
          connects: resp.connects,
          routing: resp.routing,
          integrations: resp.integrations,
        },
      };
      setIsTyping(false);
      setMessages(prev => [...prev, agentMsg]);
      setSelectedDebug(agentMsg.id);
    }, 1200 + Math.random() * 600);
  };

  const autoFillGuest = (guestId: string) => {
    const g = mockGuests.find(g => g.id === guestId);
    if (!g) return;
    setGuestName(g.name);
    setChannel(g.preferredChannel);
    if (g.upcomingStayAt) setCheckIn(g.upcomingStayAt);
    if (g.lastStayAt) setCheckOut(g.lastStayAt);
    setVisits(String(g.totalVisits));
    setSelectedGuestId(guestId);
  };

  const debugMsg = messages.find(m => m.id === selectedDebug && m.debug);

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── Left: Debug panel ── */}
      <div className="w-[300px] flex-shrink-0 border-r border-[#EDEEF1] bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#EDEEF1] flex-shrink-0">
          <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider">Debug Panel</p>
          <p className="text-[10px] text-[#A0A6B0] mt-0.5">Select a response to inspect</p>
        </div>

        {debugMsg?.debug ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Intent</p>
              <div className="bg-[#F9F9F9] rounded-xl border border-[#EDEEF1] p-3">
                <p className="text-[12px] font-mono font-semibold text-[#3D4550]">{debugMsg.debug.intent}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-[#EDEEF1] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${debugMsg.debug.confidence * 100}%`, background: color }} />
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>{(debugMsg.debug.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-[10px] text-[#A0A6B0] mt-1">confidence</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Knowledge Source</p>
              <div className="bg-[#F9F9F9] rounded-xl border border-[#EDEEF1] p-3">
                <p className="text-[12px] text-[#3D4550]">{debugMsg.debug.source}</p>
              </div>
            </div>

            {debugMsg.debug.integrations.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Integrations Called</p>
                <div className="space-y-1.5">
                  {debugMsg.debug.integrations.map(int => (
                    <div key={int} className="bg-[#EEF2FC] border border-[#BED4F6] rounded-lg px-3 py-2">
                      <p className="text-[11px] font-mono text-[#2355A7]">{int}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Routing Decision</p>
              <div className="bg-[#F9F9F9] rounded-xl border border-[#EDEEF1] p-3">
                <p className="text-[12px] text-[#3D4550]">{debugMsg.debug.routing}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider mb-2">Cost</p>
              <div className="bg-[#FEF9C3] border border-[#FDE68A] rounded-xl p-3">
                <p className="text-[18px] font-bold tabular-nums text-[#D97706]" style={{ fontFamily: "'Azeret Mono', monospace" }}>
                  {debugMsg.debug.connects.toFixed(1)}
                </p>
                <p className="text-[10px] text-[#D97706] mt-0.5">CONNECTS (estimated)</p>
                <p className="text-[9px] text-[#A0A6B0] mt-1">Test sessions do not deduct CONNECTS</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#F6F7F9] flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-[#C4C8CF]" />
              </div>
              <p className="text-[12px] text-[#8B9299]">Send a message to see debug info</p>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="px-4 py-3 border-t border-[#EDEEF1] space-y-2 flex-shrink-0">
          <button
            onClick={() => { setMessages([]); setSelectedDebug(null); }}
            className="w-full flex items-center gap-2 h-8 px-3 rounded-lg border border-[#EDEEF1] text-[12px] font-medium text-[#5C6370] hover:bg-[#F6F7F9] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear chat
          </button>
          <button
            onClick={() => sendMessage()}
            className="w-full flex items-center gap-2 h-8 px-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] text-[12px] font-medium text-[#D97706] hover:bg-[#FEF9C3] transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Simulate escalation
          </button>
        </div>
      </div>

      {/* ── Center: Chat ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F8FA]">

        {/* Guest profile panel */}
        <div className="flex-shrink-0 bg-white border-b border-[#EDEEF1] px-5 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider flex-shrink-0">Test Profile</p>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedGuestId}
                  onChange={e => autoFillGuest(e.target.value)}
                  className="h-7 pl-2.5 pr-7 rounded-lg border border-[#EDEEF1] bg-[#F6F7F9] text-[11px] text-[#5C6370] appearance-none focus:outline-none focus:ring-2 focus:ring-[#BED4F6]"
                >
                  <option value="">Select real guest…</option>
                  {mockGuests.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#A0A6B0] pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'Name',    value: guestName,   set: setGuestName,   type: 'text',   w: 'w-[130px]' },
                { label: 'Check-in', value: checkIn,    set: setCheckIn,     type: 'date',   w: 'w-[130px]' },
                { label: 'Check-out', value: checkOut,  set: setCheckOut,    type: 'date',   w: 'w-[130px]' },
                { label: 'Visits',  value: visits,      set: setVisits,      type: 'number', w: 'w-16'      },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#A0A6B0] flex-shrink-0">{f.label}</span>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className={cn('h-7 px-2 rounded-lg border border-[#EDEEF1] bg-[#F6F7F9] text-[11px] text-[#3D4550] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white', f.w)}
                  />
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#A0A6B0]">Channel</span>
                <div className="relative">
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value)}
                    className="h-7 pl-2.5 pr-7 rounded-lg border border-[#EDEEF1] bg-[#F6F7F9] text-[11px] appearance-none focus:outline-none focus:ring-2 focus:ring-[#BED4F6]"
                  >
                    {['whatsapp','email','sms','messenger','instagram','telegram'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#A0A6B0] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-[18px] font-bold" style={{ background: color }}>
                {engine.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-[#3D4550]">{engine.name} Engine Playground</p>
                <p className="text-[12px] text-[#8B9299] mt-1">Type a message below to test the engine</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-[400px]">
                {['Hi, I need to book a room', 'Can I get an upgrade?', 'I want to book the spa', 'The noise is unacceptable'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="text-[12px] text-[#2355A7] bg-[#EEF2FC] px-3 py-1.5 rounded-full hover:bg-[#E3EBFA] transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn('flex gap-3 max-w-[480px]', msg.role === 'guest' ? 'ml-auto flex-row-reverse' : '')}
              onClick={() => msg.debug && setSelectedDebug(msg.id === selectedDebug ? null : msg.id)}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold',
                msg.role === 'guest' ? 'bg-[#8B9299]' : '',
              )} style={msg.role === 'agent' ? { background: color } : {}}>
                {msg.role === 'guest' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className={cn(
                  'px-4 py-3 rounded-2xl text-[13px] leading-relaxed cursor-pointer transition-all',
                  msg.role === 'guest'
                    ? 'bg-[#3D4550] text-white rounded-tr-sm'
                    : cn('bg-white border text-[#3D4550] rounded-tl-sm', selectedDebug === msg.id ? 'border-[#2355A7] shadow-[0_0_0_2px_#BED4F6/30]' : 'border-[#EDEEF1]'),
                )}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-[#A0A6B0]">{msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  {msg.debug && (
                    <span className="text-[9px] text-[#A0A6B0]">· Click to inspect</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[480px]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px]" style={{ background: color }}>
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-[#EDEEF1] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                {[0,1,2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#D1D5DB]"
                    style={{ animation: `bounce 1s ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-white border-t border-[#EDEEF1] px-5 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Message as guest (${guestName})…`}
                className="w-full h-11 px-4 rounded-xl border border-[#EDEEF1] bg-[#F6F7F9] text-[13px] text-[#3D4550] placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40"
              style={{ background: color }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#C4C8CF] mt-2 text-center">
            Test sessions do not deduct CONNECTS · Responses use current engine configuration
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
