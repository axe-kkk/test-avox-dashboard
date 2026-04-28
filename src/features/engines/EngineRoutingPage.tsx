import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, GripVertical, Trash2, AlertTriangle, Link } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';

const ENGINE_COLORS: Record<string, string> = {
  Conversion: '#2355A7', Reservation: '#2355A7', Upsell: '#2355A7',
  Arrival: '#2355A7', Concierge: '#2355A7', Recovery: '#2355A7', Reputation: '#2355A7',
};

interface RoutingRule {
  id: string;
  condition: string;
  conditionType: 'channel' | 'keyword' | 'tag' | 'intent';
  action: 'handle' | 'transfer' | 'escalate';
  actionTarget: string;
}

const CHANNELS_CONFIG = [
  { id: 'whatsapp',   label: 'WhatsApp',    connected: true  },
  { id: 'sms',        label: 'SMS',         connected: false },
  { id: 'messenger',  label: 'Messenger',   connected: true  },
  { id: 'instagram',  label: 'Instagram',   connected: true  },
  { id: 'telegram',   label: 'Telegram',    connected: false },
  { id: 'viber',      label: 'Viber',       connected: false },
  { id: 'email',      label: 'Email',       connected: true  },
  { id: 'web_widget', label: 'Web Widget',  connected: true  },
];

const MOCK_RULES: RoutingRule[] = [
  { id: 'r1', condition: 'Channel is WhatsApp or Messenger',    conditionType: 'channel',  action: 'handle',   actionTarget: 'This engine'        },
  { id: 'r2', condition: 'Keyword: "cancel" or "refund"',        conditionType: 'keyword',  action: 'transfer', actionTarget: 'Reservation Engine' },
  { id: 'r3', condition: 'Guest tag is VIP',                     conditionType: 'tag',      action: 'escalate', actionTarget: 'Front Office'       },
  { id: 'r4', condition: 'Intent: booking inquiry',              conditionType: 'intent',   action: 'handle',   actionTarget: 'This engine'        },
];

export function EngineRoutingPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [rules, setRules] = useState<RoutingRule[]>(MOCK_RULES);
  const [sentimentToggle, setSentimentToggle] = useState(true);
  const [sentimentCount, setSentimentCount] = useState('3');
  const [escKeywords, setEscKeywords] = useState('unacceptable, terrible, disgusting, complaint, refund, lawsuit');
  const [confidence, setConfidence] = useState(70);
  const [fallback, setFallback] = useState('escalate');

  if (!engine) return null;
  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';

  const condTypeColor: Record<string, string> = {
    channel: 'bg-[#EEF2FC] text-[#2355A7]',
    keyword: 'bg-[#FEF9C3] text-[#D97706]',
    tag:     'bg-[#FCE7F3] text-[#DB2777]',
    intent:  'bg-[#F0FDF4] text-[#16A34A]',
  };

  const actionColor: Record<string, string> = {
    handle:   'text-[#16A34A]',
    transfer: 'text-[#2355A7]',
    escalate: 'text-[#EF4444]',
  };

  return (
    <div className="max-w-[860px] mx-auto px-6 py-6 space-y-5">

      {/* ── Connected channels ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] p-5">
        <p className="text-[13px] font-semibold text-[#3D4550] mb-4">Connected Channels</p>
        <div className="grid grid-cols-4 gap-3">
          {CHANNELS_CONFIG.map(ch => (
            <div
              key={ch.id}
              className={cn(
                'flex items-center justify-between px-3.5 py-3 rounded-xl border transition-colors',
                ch.connected ? 'border-[#EDEEF1] bg-[#F9F9F9]' : 'border-dashed border-[#E4E6EA] bg-white',
              )}
            >
              <div>
                <p className="text-[12px] font-medium text-[#3D4550]">{ch.label}</p>
                <p className={cn('text-[10px] mt-0.5', ch.connected ? 'text-[#16A34A]' : 'text-[#A0A6B0]')}>
                  {ch.connected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              {!ch.connected && (
                <button
                  onClick={() => addToast({ type: 'info', title: `Connect ${ch.label}` })}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#2355A7] hover:underline"
                >
                  <Link className="w-3 h-3" />
                  Connect
                </button>
              )}
              {ch.connected && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Routing rules ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EDEEF1] flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#3D4550]">Routing Rules</p>
            <p className="text-[11px] text-[#8B9299] mt-0.5">Rules are evaluated top to bottom. Drag to reorder.</p>
          </div>
          <button
            onClick={() => setRules(prev => [...prev, { id: `r${Date.now()}`, condition: 'New condition', conditionType: 'channel', action: 'handle', actionTarget: 'This engine' }])}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold text-white transition-colors"
            style={{ background: color }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add rule
          </button>
        </div>

        <div className="divide-y divide-[#F2F3F5]">
          {rules.map((rule, idx) => (
            <div key={rule.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] group">
              <div className="text-[#D1D5DB] cursor-grab flex-shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>
              <span className="w-5 h-5 rounded-full bg-[#F1F5F9] text-[10px] font-bold text-[#94A3B8] flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>

              {/* IF */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-[#A0A6B0] uppercase flex-shrink-0">IF</span>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0', condTypeColor[rule.conditionType])}>
                  {rule.conditionType}
                </span>
                <span className="text-[12px] text-[#3D4550] truncate">{rule.condition}</span>
              </div>

              {/* THEN */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-bold text-[#A0A6B0] uppercase">THEN</span>
                <span className={cn('text-[12px] font-semibold', actionColor[rule.action])}>
                  {rule.action === 'handle' ? 'Handle' : rule.action === 'transfer' ? 'Transfer' : 'Escalate'}
                </span>
                <span className="text-[12px] text-[#5C6370]">→ {rule.actionTarget}</span>
              </div>

              <button
                onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-transparent group-hover:text-[#C4C8CF] hover:!text-[#EF4444] hover:bg-[#FEE2E2] transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Escalation rules ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] p-5 space-y-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          <p className="text-[13px] font-semibold text-[#3D4550]">Escalation Rules</p>
        </div>

        {/* Sentiment */}
        <div className="flex items-start gap-4">
          <div
            onClick={() => setSentimentToggle(v => !v)}
            className="mt-0.5 rounded-full relative transition-colors cursor-pointer flex-shrink-0"
            style={{ width: 40, height: 22, background: sentimentToggle ? '#2355A7' : '#D1D5DB' }}
          >
            <span className={cn('absolute top-0.5 rounded-full bg-white shadow-sm transition-transform', sentimentToggle ? 'translate-x-5' : 'translate-x-0.5')} style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[#3D4550] mb-1.5">Sentiment-based escalation</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#5C6370]">Escalate after</span>
              <input
                type="number"
                value={sentimentCount}
                onChange={e => setSentimentCount(e.target.value)}
                disabled={!sentimentToggle}
                className="w-14 h-8 px-2.5 rounded-lg border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-center focus:outline-none focus:ring-2 focus:ring-[#BED4F6] disabled:opacity-40"
              />
              <span className="text-[12px] text-[#5C6370]">negative messages in a row</span>
            </div>
          </div>
        </div>

        {/* Escalation keywords */}
        <div>
          <label className="block text-[12px] font-semibold text-[#5C6370] mb-1.5">Escalation keywords</label>
          <input
            value={escKeywords}
            onChange={e => setEscKeywords(e.target.value)}
            className="w-full h-9 px-3 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-[#3D4550] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition-colors"
          />
          <p className="text-[10px] text-[#A0A6B0] mt-1">Comma-separated. Any match triggers immediate escalation.</p>
        </div>

        {/* Confidence threshold */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-semibold text-[#5C6370]">Confidence threshold</label>
            <span className="text-[13px] font-bold tabular-nums" style={{ color }}>{confidence}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={confidence}
            onChange={e => setConfidence(Number(e.target.value))}
            className="w-full accent-[#2355A7] h-1.5 rounded-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#A0A6B0]">0% — Always escalate</span>
            <span className="text-[10px] text-[#A0A6B0]">100% — Never escalate</span>
          </div>
          <p className="text-[11px] text-[#8B9299] mt-2">
            When AI confidence falls below {confidence}%, the conversation is escalated.
          </p>
        </div>
      </div>

      {/* ── Fallback ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] p-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-[#3D4550] mb-0.5">Fallback behavior</p>
          <p className="text-[12px] text-[#8B9299]">What to do when no routing rule matches</p>
        </div>
        <div className="relative">
          <select
            value={fallback}
            onChange={e => setFallback(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-[#3D4550] appearance-none focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white"
          >
            <option value="handle">Handle with this engine</option>
            <option value="escalate">Escalate to Front Office</option>
            <option value="ignore">Ignore</option>
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A6B0] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pb-2">
        <button
          onClick={() => addToast({ type: 'success', title: 'Routing saved' })}
          className="h-9 px-5 rounded-xl text-[13px] font-semibold text-white transition-colors"
          style={{ background: color }}
        >
          Save routing
        </button>
      </div>
    </div>
  );
}
