import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, RefreshCw, Zap, User, Bot, ChevronDown, AlertTriangle } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { mockGuests } from '../../data/mock/guests';
import { cn } from '../../utils';
import { getEngineSpec } from './lib/engineSpec';

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

  const [guestName, setGuestName] = useState('Test Guest');
  const [checkIn,   setCheckIn]   = useState('2026-05-10');
  const [checkOut,  setCheckOut]  = useState('2026-05-13');
  const [visits,    setVisits]    = useState('1');
  const [channel,   setChannel]   = useState('whatsapp');
  const [selectedGuestId, setSelectedGuestId] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!engine) return null;

  const sendMessage = (override?: string) => {
    const text = override ?? input;
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `m${Date.now()}`, role: 'guest', text, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const resp = getAutoReply(text);
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
    const g = mockGuests.find(gg => gg.id === guestId);
    if (!g) return;
    setGuestName(g.name);
    setChannel(g.preferredChannel);
    if (g.upcomingStayAt) setCheckIn(g.upcomingStayAt);
    if (g.lastStayAt)     setCheckOut(g.lastStayAt);
    setVisits(String(g.totalVisits));
    setSelectedGuestId(guestId);
  };

  const debugMsg = messages.find(m => m.id === selectedDebug && m.debug);

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── Left: Debug panel ── */}
      <div className="w-[300px] flex-shrink-0 border-r border-brand-border bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-border flex-shrink-0">
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Debug Panel</p>
          <p className="text-[10px] text-faint mt-0.5">Select a response to inspect</p>
        </div>

        {debugMsg?.debug ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">Intent</p>
              <div className="bg-surface-2 rounded-xl border border-brand-border p-3">
                <p
                  className="text-[12px] font-semibold text-strong"
                  style={{ fontFamily: "'Azeret Mono', monospace" }}
                >{debugMsg.debug.intent}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-brand-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-blue"
                      style={{ width: `${debugMsg.debug.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-brand-blue tabular-nums">
                    {(debugMsg.debug.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[10px] text-subtle mt-1">confidence</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">Knowledge Source</p>
              <div className="bg-surface-2 rounded-xl border border-brand-border p-3">
                <p className="text-[12px] text-strong">{debugMsg.debug.source}</p>
              </div>
            </div>

            {debugMsg.debug.integrations.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">Integrations Called</p>
                <div className="space-y-1.5">
                  {debugMsg.debug.integrations.map(int => (
                    <div key={int} className="bg-brand-blue-50 border border-brand-blue-light rounded-lg px-3 py-2">
                      <p
                        className="text-[11px] text-brand-blue"
                        style={{ fontFamily: "'Azeret Mono', monospace" }}
                      >{int}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">Routing Decision</p>
              <div className="bg-surface-2 rounded-xl border border-brand-border p-3">
                <p className="text-[12px] text-strong">{debugMsg.debug.routing}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">Cost</p>
              <div className="bg-surface-2 border border-brand-border rounded-xl p-3">
                <p
                  className="text-[18px] font-semibold tabular-nums text-strong leading-none"
                  style={{ fontFamily: "'Azeret Mono', monospace" }}
                >{debugMsg.debug.connects.toFixed(1)}</p>
                <p className="text-[10px] text-subtle mt-1">CONNECTS (estimated)</p>
                <p className="text-[10px] text-faint mt-2 leading-relaxed">
                  Test sessions do not deduct CONNECTS.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-2xl bg-surface-3 border border-brand-border flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-faint" />
              </div>
              <p className="text-[12px] text-subtle">Send a message to see debug info</p>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="px-4 py-3 border-t border-brand-border space-y-2 flex-shrink-0">
          <button
            onClick={() => { setMessages([]); setSelectedDebug(null); }}
            className="w-full flex items-center gap-2 h-8 px-3 rounded-lg border border-brand-border text-[12px] font-medium text-muted hover:bg-surface-3 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear chat
          </button>
          <button
            onClick={() => sendMessage('The noise is unacceptable, I need help now.')}
            className="w-full flex items-center gap-2 h-8 px-3 rounded-lg border border-brand-border bg-surface-2 text-[12px] font-medium text-strong hover:bg-white transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Simulate escalation
          </button>
        </div>
      </div>

      {/* ── Center: Chat ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface-2">

        {/* Guest profile panel */}
        <div className="flex-shrink-0 bg-white border-b border-brand-border px-5 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider flex-shrink-0">Test Profile</p>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedGuestId}
                  onChange={e => autoFillGuest(e.target.value)}
                  className="h-7 pl-2.5 pr-7 rounded-lg border border-brand-border bg-surface-3 text-[11px] text-muted appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                >
                  <option value="">Select real guest…</option>
                  {mockGuests.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-faint pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'Name',     value: guestName, set: setGuestName, type: 'text',   w: 'w-[130px]' },
                { label: 'Check-in', value: checkIn,   set: setCheckIn,   type: 'date',   w: 'w-[130px]' },
                { label: 'Check-out',value: checkOut,  set: setCheckOut,  type: 'date',   w: 'w-[130px]' },
                { label: 'Visits',   value: visits,    set: setVisits,    type: 'number', w: 'w-16'      },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-subtle flex-shrink-0">{f.label}</span>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className={cn('h-7 px-2 rounded-lg border border-brand-border bg-surface-3 text-[11px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white', f.w)}
                  />
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-subtle">Channel</span>
                <div className="relative">
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value)}
                    className="h-7 pl-2.5 pr-7 rounded-lg border border-brand-border bg-surface-3 text-[11px] text-muted appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                  >
                    {['whatsapp','email','sms','messenger','instagram','telegram'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-faint pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue text-white flex items-center justify-center text-[16px] font-semibold">
                {engine.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-strong">{engine.name} Engine Playground</p>
                <p className="text-[12px] text-subtle mt-1">Type a message below to test the engine</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-[400px]">
                {getEngineSpec(engine.name).quickPrompts.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="text-[12px] text-brand-blue bg-brand-blue-50 border border-brand-blue-light px-3 py-1.5 rounded-full hover:bg-white transition-colors"
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
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white',
                msg.role === 'guest' ? 'bg-strong' : 'bg-brand-blue',
              )}>
                {msg.role === 'guest' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className={cn(
                  'px-4 py-3 rounded-2xl text-[13px] leading-relaxed cursor-pointer transition-colors',
                  msg.role === 'guest'
                    ? 'bg-strong text-white rounded-tr-sm'
                    : cn(
                        'bg-white border text-strong rounded-tl-sm',
                        selectedDebug === msg.id ? 'border-brand-blue ring-2 ring-brand-blue-light/30' : 'border-brand-border',
                      ),
                )}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-subtle">
                    {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {msg.debug && <span className="text-[9px] text-faint">· Click to inspect</span>}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[480px]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-brand-blue">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-brand-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-faint"
                    style={{ animation: `bounce 1s ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-white border-t border-brand-border px-5 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Message as guest (${guestName})…`}
                className="w-full h-11 px-4 rounded-xl border border-brand-border bg-surface-3 text-[13px] text-strong placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-brand-blue text-white hover:bg-brand-blue-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-subtle mt-2 text-center">
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
