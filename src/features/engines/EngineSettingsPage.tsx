import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Sparkles, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';

const ENGINE_COLORS: Record<string, string> = {
  Conversion: '#2355A7', Reservation: '#0EA5E9', Upsell: '#8B5CF6',
  Arrival: '#10B981', Concierge: '#F59E0B', Recovery: '#EF4444', Reputation: '#EC4899',
};

const SYSTEM_PROMPTS: Record<string, string> = {
  Conversion: `You are a friendly hotel booking assistant for Grand Palace Hotel. Your goal is to help potential guests find the perfect room and complete their booking.

When a guest inquires about availability:
1. Ask for their travel dates and number of guests
2. Present the best available rooms with highlights
3. Mention any current promotions
4. Guide them toward completing the booking

Always be warm, professional, and focused on conversion. Respond in the guest's language when possible.`,
  Concierge: `You are the digital concierge for Grand Palace Hotel, available 24/7 to assist in-stay guests with any request.

You can help with:
- Restaurant reservations and dining recommendations
- Local attractions and transport arrangements
- Housekeeping and room service coordination
- Special occasion arrangements

Always be attentive, responsive, and proactive. If you cannot fulfill a request, escalate immediately to the duty manager.`,
};

const CONTEXT_VARS = [
  { name: '{{guest_name}}',       desc: 'Full name of the guest'            },
  { name: '{{check_in_date}}',    desc: 'Guest check-in date'               },
  { name: '{{check_out_date}}',   desc: 'Guest check-out date'              },
  { name: '{{room_type}}',        desc: 'Booked room type'                  },
  { name: '{{reservation_id}}',   desc: 'PMS reservation reference'         },
  { name: '{{total_nights}}',     desc: 'Number of nights booked'           },
  { name: '{{hotel_name}}',       desc: 'Property name'                     },
  { name: '{{language}}',         desc: 'Guest preferred language'          },
];

const PMS_CATEGORIES = [
  {
    label: 'Guest Profile',
    fields: ['Name', 'Email', 'Phone', 'Language', 'Country', 'VIP status'],
    defaultAccess: 'read' as const,
  },
  {
    label: 'Reservation',
    fields: ['Check-in / Check-out dates', 'Room type', 'Guest count', 'Booking source', 'Reservation status'],
    defaultAccess: 'read' as const,
  },
  {
    label: 'Billing',
    fields: ['Total amount', 'Balance due', 'Payment method', 'Invoice'],
    defaultAccess: 'none' as const,
  },
  {
    label: 'Housekeeping',
    fields: ['Room status', 'Cleaning schedule', 'Special requests'],
    defaultAccess: 'read' as const,
  },
  {
    label: 'History',
    fields: ['Previous visits', 'Guest notes', 'Preferences', 'Complaints'],
    defaultAccess: 'read' as const,
  },
];

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#EDEEF1]">
        <p className="text-[13px] font-semibold text-[#3D4550]">{title}</p>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[#5C6370] mb-1.5">{label}</label>
      {hint && <p className="text-[11px] text-[#A0A6B0] mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = 'w-full h-9 px-3 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-[#3D4550] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition-colors';
const selectCls = `${inputCls} appearance-none pr-8 cursor-pointer`;

export function EngineSettingsPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [engineName, setEngineName] = useState(engine ? `${engine.name} Agent` : '');
  const [description, setDescription] = useState(engine?.description?.slice(0, 120) ?? '');
  const [lang, setLang] = useState('en');
  const [autoDetect, setAutoDetect] = useState(true);
  const [tone, setTone] = useState('friendly');
  const [maxMessages, setMaxMessages] = useState('10');
  const [fallback, setFallback] = useState('escalate');
  const [limitConnects, setLimitConnects] = useState(false);
  const [promptText, setPromptText] = useState(
    engine ? (SYSTEM_PROMPTS[engine.name] ?? `You are an AI assistant for ${engine.name} operations at Grand Palace Hotel.`) : ''
  );
  const [pmsAccess, setPmsAccess] = useState<Record<string, 'none' | 'read' | 'write'>>(
    Object.fromEntries(PMS_CATEGORIES.map(c => [c.label, c.defaultAccess]))
  );
  const [guardrails, setGuardrails] = useState({
    noCompetitors: true,
    noDiscounts: true,
    scopeOnly: true,
  });
  const [showPromptHelper, setShowPromptHelper] = useState(false);

  if (!engine) return null;
  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';
  const charCount = promptText.length;

  return (
    <div className="max-w-[860px] mx-auto px-6 py-6 space-y-5">

      {/* ── Identification ── */}
      <FieldGroup title="Identification">
        <div className="grid grid-cols-2 gap-5">
          <FormRow label="Engine name">
            <input value={engineName} onChange={e => setEngineName(e.target.value)} className={inputCls} />
          </FormRow>
          <FormRow label="Avatar">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={{ background: color }}>
                {engine.name.slice(0, 2).toUpperCase()}
              </div>
              <button className="h-9 px-3 rounded-xl border border-[#EDEEF1] text-[12px] text-[#5C6370] hover:bg-[#F6F7F9] transition-colors">Upload image</button>
            </div>
          </FormRow>
        </div>
        <FormRow label="Internal description" hint="Max 200 characters">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 200))}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-[#3D4550] resize-none focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition-colors"
          />
          <p className="text-[10px] text-[#A0A6B0] mt-1 text-right">{description.length}/200</p>
        </FormRow>
      </FieldGroup>

      {/* ── Language & Tone ── */}
      <FieldGroup title="Language & Tone">
        <div className="grid grid-cols-2 gap-5">
          <FormRow label="Primary language">
            <div className="relative">
              <select value={lang} onChange={e => setLang(e.target.value)} className={selectCls}>
                {[['en','English'],['de','German'],['fr','French'],['es','Spanish'],['it','Italian'],['ar','Arabic'],['ja','Japanese'],['ru','Russian']].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A6B0] pointer-events-none" />
            </div>
          </FormRow>
          <FormRow label="Communication tone">
            <div className="relative">
              <select value={tone} onChange={e => setTone(e.target.value)} className={selectCls}>
                {[['professional','Professional'],['friendly','Friendly'],['casual','Casual'],['custom','Custom']].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A6B0] pointer-events-none" />
            </div>
          </FormRow>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setAutoDetect(v => !v)}
            className={cn('w-10 h-5.5 rounded-full relative transition-colors cursor-pointer', autoDetect ? 'bg-[#2355A7]' : 'bg-[#D1D5DB]')}
            style={{ width: 40, height: 22 }}
          >
            <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform', autoDetect ? 'translate-x-5' : 'translate-x-0.5')} style={{ width: 18, height: 18 }} />
          </div>
          <span className="text-[13px] text-[#3D4550] font-medium">Auto-detect guest language</span>
          <span className="text-[11px] text-[#A0A6B0]">Engine responds in the guest's language</span>
        </label>
      </FieldGroup>

      {/* ── Behavior Limits ── */}
      <FieldGroup title="Behavior Limits">
        <div className="grid grid-cols-2 gap-5">
          <FormRow label="Max messages per conversation">
            <input type="number" min={1} max={50} value={maxMessages} onChange={e => setMaxMessages(e.target.value)} className={inputCls} />
          </FormRow>
          <FormRow label="Fallback behavior">
            <div className="relative">
              <select value={fallback} onChange={e => setFallback(e.target.value)} className={selectCls}>
                <option value="escalate">Escalate to operator</option>
                <option value="default_msg">Default message</option>
                <option value="faq">Suggest FAQ</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0A6B0] pointer-events-none" />
            </div>
          </FormRow>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#5C6370] mb-2">CONNECTS limit</label>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <div
              onClick={() => setLimitConnects(v => !v)}
              className="rounded-full relative transition-colors cursor-pointer flex-shrink-0"
              style={{ width: 40, height: 22, background: limitConnects ? '#2355A7' : '#D1D5DB' }}
            >
              <span className={cn('absolute top-0.5 rounded-full bg-white shadow-sm transition-transform flex-shrink-0', limitConnects ? 'translate-x-5' : 'translate-x-0.5')} style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-[13px] text-[#3D4550]">{limitConnects ? 'Custom limit' : 'No limit'}</span>
          </label>
          {limitConnects && (
            <div className="flex gap-3">
              <input type="number" placeholder="Per day" className={cn(inputCls, 'flex-1')} />
              <input type="number" placeholder="Per month" className={cn(inputCls, 'flex-1')} />
            </div>
          )}
        </div>
      </FieldGroup>

      {/* ── Instructions ── */}
      <FieldGroup title="Instructions">
        <FormRow label="System Prompt" hint="Defines how this engine behaves. Max 5,000 characters.">
          <div className="relative">
            <textarea
              value={promptText}
              onChange={e => setPromptText(e.target.value.slice(0, 5000))}
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] text-[#3D4550] font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition-colors"
            />
            <div className="flex items-center justify-between mt-1.5">
              <button
                onClick={() => setShowPromptHelper(true)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[#2355A7] hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Improve with AI
              </button>
              <span className={cn('text-[10px]', charCount > 4500 ? 'text-[#EF4444]' : 'text-[#A0A6B0]')}>
                {charCount.toLocaleString()} / 5,000
              </span>
            </div>
          </div>
        </FormRow>

        {/* Guardrails */}
        <div>
          <p className="text-[12px] font-semibold text-[#5C6370] mb-3">Guardrails</p>
          <div className="space-y-2">
            {[
              { key: 'noCompetitors', label: "Don't discuss competitors" },
              { key: 'noDiscounts',   label: "Don't promise discounts without configured offer" },
              { key: 'scopeOnly',     label: "Only handle topics within this engine's scope" },
            ].map(g => (
              <label key={g.key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setGuardrails(prev => ({ ...prev, [g.key]: !prev[g.key as keyof typeof prev] }))}
                  className="rounded-full relative transition-colors cursor-pointer flex-shrink-0"
                  style={{ width: 32, height: 18, background: guardrails[g.key as keyof typeof guardrails] ? '#2355A7' : '#D1D5DB' }}
                >
                  <span
                    className={cn('absolute top-0.5 rounded-full bg-white shadow-sm transition-transform', guardrails[g.key as keyof typeof guardrails] ? 'translate-x-3.5' : 'translate-x-0.5')}
                    style={{ width: 14, height: 14 }}
                  />
                </div>
                <span className="text-[12px] text-[#3D4550]">{g.label}</span>
              </label>
            ))}
            <div className="mt-2">
              <input placeholder="Add custom guardrail rule…" className={cn(inputCls, 'text-[12px]')} />
            </div>
          </div>
        </div>

        {/* Context Variables */}
        <div>
          <p className="text-[12px] font-semibold text-[#5C6370] mb-3">Context Variables</p>
          <div className="grid grid-cols-2 gap-2">
            {CONTEXT_VARS.map(v => (
              <div key={v.name} className="flex items-center justify-between gap-2 bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-mono font-semibold text-[#2355A7] truncate">{v.name}</p>
                  <p className="text-[10px] text-[#8B9299]">{v.desc}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard?.writeText(v.name); addToast({ type: 'success', title: 'Copied!' }); }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-[#A0A6B0] hover:bg-[#EEF2FC] hover:text-[#2355A7] transition-colors flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </FieldGroup>

      {/* ── Guest Data Access ── */}
      <FieldGroup title="Guest Data Access">
        <div className="space-y-3">
          {PMS_CATEGORIES.map(cat => (
            <div key={cat.label} className="flex items-start gap-4 py-3 border-b border-[#F2F3F5] last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#3D4550] mb-0.5">{cat.label}</p>
                <p className="text-[11px] text-[#8B9299]">{cat.fields.join(' · ')}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {(['none', 'read', 'write'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setPmsAccess(prev => ({ ...prev, [cat.label]: level }))}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize',
                      pmsAccess[cat.label] === level
                        ? 'bg-[#2355A7] text-white'
                        : 'bg-[#F6F7F9] text-[#8B9299] hover:bg-[#EEF2FC] hover:text-[#2355A7]',
                    )}
                  >
                    {level === 'none' ? 'No access' : level}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PMS Sync */}
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-4 flex items-start gap-3 mt-2">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-[#16A34A]">PMS Connected</p>
            <p className="text-[11px] text-[#5C6370] mt-0.5">Cloudbeds · Last sync 2 min ago · 142 active reservations</p>
          </div>
        </div>
      </FieldGroup>

      {/* ── Save ── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button className="h-9 px-4 rounded-xl border border-[#EDEEF1] text-[13px] font-medium text-[#5C6370] hover:bg-[#F6F7F9] transition-colors">
          Discard
        </button>
        <button
          onClick={() => addToast({ type: 'success', title: 'Settings saved' })}
          className="h-9 px-5 rounded-xl text-[13px] font-semibold text-white transition-colors"
          style={{ background: color }}
        >
          Save settings
        </button>
      </div>
    </div>
  );
}
