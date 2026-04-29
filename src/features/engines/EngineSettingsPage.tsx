import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, ChevronDown, ChevronRight, X, Check } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';
import { Switch } from '../../components/ui/Switch';
import { getEngineSpec } from './lib/engineSpec';

/* AI-improved version returned by the mock "Improve with AI" action.
   In a real product this would come from a model — here it's a curated
   rewrite that highlights the kind of polish the feature is meant to add. */
function improvePromptMock(text: string, engineName: string): string {
  const head = `You are the AI ${engineName} agent for Grand Palace Hotel — a 5-star property in central Paris. Speak in the guest's language whenever possible and stay strictly within your scope.\n\n`;
  const cleaned = text
    .replace(/^You are.*?\.\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return `${head}Operating principles:\n• Be warm, concise, and proactive — never robotic.\n• Confirm guest intent before booking, charging, or escalating.\n• Surface relevant offers only when they fit the context.\n• Hand off to a human if the guest is upset or asks twice for one.\n\n${cleaned}\n\nClosing: end every conversation by inviting the guest to reach out again — same channel, no friction.`;
}

/* Per-field switcher value: none | read | write */
type Access = 'none' | 'read' | 'write';

const PMS_CATEGORIES: { id: string; label: string; fields: string[]; defaultAccess: Access }[] = [
  {
    id: 'guest',
    label: 'Guest Profile',
    fields: ['Name', 'Email', 'Phone', 'Language', 'Country', 'VIP status'],
    defaultAccess: 'read',
  },
  {
    id: 'reservation',
    label: 'Reservation',
    fields: ['Check-in date', 'Check-out date', 'Room type', 'Guest count', 'Booking source', 'Reservation status'],
    defaultAccess: 'read',
  },
  {
    id: 'billing',
    label: 'Billing',
    fields: ['Total amount', 'Balance due', 'Payment method', 'Invoice'],
    defaultAccess: 'none',
  },
  {
    id: 'housekeeping',
    label: 'Housekeeping',
    fields: ['Room status', 'Cleaning schedule', 'Special requests'],
    defaultAccess: 'read',
  },
  {
    id: 'history',
    label: 'History',
    fields: ['Previous visits', 'Guest notes', 'Preferences', 'Complaints'],
    defaultAccess: 'read',
  },
];

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      <div className="px-6 py-4 border-b border-brand-border">
        <p className="text-[13px] font-semibold text-strong">{title}</p>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-muted mb-1.5">{label}</label>
      {hint && <p className="text-[11px] text-subtle mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = 'w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors';
const selectCls = `${inputCls} appearance-none pr-8 cursor-pointer`;

/* Three-state pill switcher for access level (per field & per category) */
function AccessPill({
  value,
  onChange,
  size = 'md',
}: {
  value: Access;
  onChange: (v: Access) => void;
  size?: 'sm' | 'md';
}) {
  const opts: { v: Access; l: string }[] = [
    { v: 'none', l: 'No Access' },
    { v: 'read', l: 'Read' },
    { v: 'write', l: 'Write' },
  ];
  return (
    <div className={cn(
      'inline-flex items-center bg-surface-3 border border-brand-border rounded-lg p-0.5',
      size === 'sm' ? 'gap-0.5' : 'gap-0.5',
    )}>
      {opts.map(o => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            'rounded-md font-medium transition-colors',
            size === 'sm' ? 'h-6 px-2 text-[10px]' : 'h-7 px-3 text-[11px]',
            value === o.v
              ? 'bg-brand-blue text-white'
              : 'text-muted hover:text-strong',
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

/* Compact 3-icon switch for individual fields (×, ●, ✎) */
function FieldAccessSwitch({
  value,
  onChange,
}: {
  value: Access;
  onChange: (v: Access) => void;
}) {
  const opts: { v: Access; label: string; icon: React.ReactNode }[] = [
    { v: 'none',  label: 'No access', icon: <X className="w-3 h-3" /> },
    { v: 'read',  label: 'Read',      icon: <span className="w-1.5 h-1.5 rounded-full bg-current" /> },
    { v: 'write', label: 'Write',     icon: <Check className="w-3 h-3" /> },
  ];
  return (
    <div className="inline-flex items-center gap-1">
      {opts.map(o => (
        <button
          key={o.v}
          type="button"
          title={o.label}
          aria-label={o.label}
          onClick={() => onChange(o.v)}
          className={cn(
            'w-6 h-6 inline-flex items-center justify-center rounded-md border transition-colors',
            value === o.v
              ? 'bg-brand-blue border-brand-blue text-white'
              : 'bg-white border-brand-border text-faint hover:text-muted hover:border-brand-blue-light',
          )}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

/* Tiny diff-renderer used by the Improve-with-AI modal */
function PromptDiff({ before, after }: { before: string; after: string }) {
  const beforeLines = before.split('\n');
  const afterLines  = after.split('\n');
  const beforeSet = new Set(beforeLines.map(l => l.trim()).filter(Boolean));
  const afterSet  = new Set(afterLines.map(l => l.trim()).filter(Boolean));
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-brand-border bg-surface-2 overflow-hidden">
        <div className="px-3 py-2 border-b border-brand-border bg-white">
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em]">Current</p>
        </div>
        <div className="p-3 max-h-[420px] overflow-y-auto font-mono text-[11px] leading-relaxed">
          {beforeLines.map((line, i) => {
            const removed = line.trim() && !afterSet.has(line.trim());
            return (
              <div
                key={i}
                className={cn(
                  'whitespace-pre-wrap py-0.5 px-1 rounded',
                  removed ? 'bg-brand-gray/30 text-muted line-through decoration-1' : 'text-strong',
                )}
              >
                {line || ' '}
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl border border-brand-blue-light bg-brand-blue-50/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-brand-blue-light bg-white flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-brand-blue" />
          <p className="text-[10px] font-semibold text-brand-blue uppercase tracking-[0.16em]">Improved</p>
        </div>
        <div className="p-3 max-h-[420px] overflow-y-auto font-mono text-[11px] leading-relaxed">
          {afterLines.map((line, i) => {
            const added = line.trim() && !beforeSet.has(line.trim());
            return (
              <div
                key={i}
                className={cn(
                  'whitespace-pre-wrap py-0.5 px-1 rounded',
                  added ? 'bg-brand-blue-50 text-brand-blue' : 'text-strong',
                )}
              >
                {line || ' '}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function EngineSettingsPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [engineName, setEngineName] = useState(engine ? `${engine.name} Agent` : '');
  const [description, setDescription] = useState(engine?.description?.slice(0, 120) ?? '');
  const [lang, setLang] = useState('en');
  const [autoDetect, setAutoDetect] = useState(true);
  const [tone, setTone] = useState('friendly');
  const [customTone, setCustomTone] = useState(
    'Warm but precise. Slight literary touch. Refer to luxury without being pompous. Use the guest\'s first name once early on, then switch to "you".',
  );
  const [maxMessages, setMaxMessages] = useState('10');
  const [fallback, setFallback] = useState('escalate');
  const [limitConnects, setLimitConnects] = useState(false);
  const spec = engine ? getEngineSpec(engine.name) : null;
  const [promptText, setPromptText] = useState(spec?.systemPrompt ?? '');
  const [guardrails, setGuardrails] = useState({
    noCompetitors: true,
    noDiscounts: true,
    scopeOnly: true,
  });

  /* Per-category collapsed flag */
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() => ({
    guest:        true,
    reservation:  false,
    billing:      false,
    housekeeping: false,
    history:      false,
  }));

  /* Per-field access state, seeded from the engine spec — Concierge ≠ Recovery
     ≠ Reputation in what they're allowed to read or write. See engineSpec.ts. */
  const [fieldAccess, setFieldAccess] = useState<Record<string, Access>>(() => {
    const map: Record<string, Access> = {};
    for (const cat of PMS_CATEGORIES) {
      const lvl = spec?.pmsAccess[cat.id as keyof typeof spec.pmsAccess] ?? cat.defaultAccess;
      for (const f of cat.fields) {
        map[`${cat.id}:${f}`] = lvl;
      }
    }
    return map;
  });

  /* Improve-with-AI diff modal */
  const [diffOpen, setDiffOpen] = useState(false);
  const improved = useMemo(
    () => (engine ? improvePromptMock(promptText, engine.name) : ''),
    [promptText, engine],
  );

  if (!engine) return null;
  const charCount = promptText.length;

  /* Aggregate access for a category — used to render the right-side pill
     state at the category header. If all fields share the same level we
     show that level; otherwise we show the highest. */
  function categoryAggregate(catId: string): Access {
    const cat = PMS_CATEGORIES.find(c => c.id === catId)!;
    const levels = cat.fields.map(f => fieldAccess[`${catId}:${f}`]);
    if (levels.every(l => l === levels[0])) return levels[0];
    if (levels.includes('write')) return 'write';
    if (levels.includes('read')) return 'read';
    return 'none';
  }

  function setCategoryAccess(catId: string, level: Access) {
    const cat = PMS_CATEGORIES.find(c => c.id === catId)!;
    setFieldAccess(prev => {
      const next = { ...prev };
      for (const f of cat.fields) next[`${catId}:${f}`] = level;
      return next;
    });
  }

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
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 bg-brand-blue">
                {engine.name.slice(0, 2).toUpperCase()}
              </div>
              <button className="h-9 px-3 rounded-xl border border-brand-border text-[12px] text-muted hover:bg-surface-3 transition-colors">
                Upload image
              </button>
            </div>
          </FormRow>
        </div>
        <FormRow label="Internal description" hint="Max 200 characters">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 200))}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
          />
          <p className="text-[10px] text-subtle mt-1 text-right">{description.length}/200</p>
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
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
            </div>
          </FormRow>
          <FormRow label="Communication tone">
            <div className="relative">
              <select value={tone} onChange={e => setTone(e.target.value)} className={selectCls}>
                {[['professional','Professional'],['friendly','Friendly'],['casual','Casual'],['custom','Custom']].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
            </div>
          </FormRow>
        </div>

        {/* Custom tone — only when "custom" is selected */}
        {tone === 'custom' && (
          <FormRow
            label="Custom tone instructions"
            hint="Free-form notes that the engine will follow. Up to 600 characters."
          >
            <textarea
              value={customTone}
              onChange={e => setCustomTone(e.target.value.slice(0, 600))}
              rows={4}
              placeholder="e.g. Warm and concise. Use British English. Mention our garden view whenever it fits."
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
            />
            <p className="text-[10px] text-subtle mt-1 text-right">{customTone.length}/600</p>
          </FormRow>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <Switch checked={autoDetect} onChange={setAutoDetect} />
          <span className="text-[13px] text-strong font-medium">Auto-detect guest language</span>
          <span className="text-[11px] text-subtle">Engine responds in the guest's language</span>
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
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
            </div>
          </FormRow>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-muted mb-2">CONNECTS limit</label>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <Switch checked={limitConnects} onChange={setLimitConnects} />
            <span className="text-[13px] text-strong">{limitConnects ? 'Custom limit' : 'No limit'}</span>
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
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
            />
            <div className="flex items-center justify-between mt-1.5">
              <button
                onClick={() => setDiffOpen(true)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-brand-blue hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Improve with AI
              </button>
              <span className={cn('text-[10px]', charCount > 4500 ? 'text-brand-black' : 'text-subtle')}>
                {charCount.toLocaleString()} / 5,000
              </span>
            </div>
          </div>
        </FormRow>

        {/* Guardrails */}
        <div>
          <p className="text-[12px] font-semibold text-muted mb-3">Guardrails</p>
          <div className="space-y-2">
            {[
              { key: 'noCompetitors', label: "Don't discuss competitors" },
              { key: 'noDiscounts',   label: "Don't promise discounts without configured offer" },
              { key: 'scopeOnly',     label: "Only handle topics within this engine's scope" },
            ].map(g => (
              <label key={g.key} className="flex items-center gap-3 cursor-pointer">
                <Switch
                  size="sm"
                  checked={guardrails[g.key as keyof typeof guardrails]}
                  onChange={v => setGuardrails(prev => ({ ...prev, [g.key]: v }))}
                />
                <span className="text-[12px] text-strong">{g.label}</span>
              </label>
            ))}
            <div className="mt-2">
              <input placeholder="Add custom guardrail rule…" className={cn(inputCls, 'text-[12px]')} />
            </div>
          </div>
        </div>
      </FieldGroup>

      {/* ── Guest Data Access — collapsible per-category, per-field switch ── */}
      <FieldGroup title="Guest Data Access">
        <p className="text-[11px] text-subtle -mt-2">Control which data this engine can read or modify.</p>
        <div className="space-y-2">
          {PMS_CATEGORIES.map(cat => {
            const open = openCats[cat.id];
            const aggregate = categoryAggregate(cat.id);
            return (
              <div
                key={cat.id}
                className="rounded-xl border border-brand-border overflow-hidden"
              >
                {/* Category header — click expand area to toggle. Using a
                    div (not button) so the nested AccessPill buttons remain
                    valid HTML. */}
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors',
                    open ? 'bg-surface-2' : 'bg-white',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                    className={cn(
                      'flex items-center gap-3 flex-1 min-w-0 text-left rounded-lg -mx-1 px-1 py-1',
                      'hover:bg-white transition-colors',
                    )}
                    aria-expanded={open}
                  >
                    {open
                      ? <ChevronDown className="w-3.5 h-3.5 text-subtle flex-shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-subtle flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-strong">{cat.label}</p>
                      {!open && (
                        <p className="text-[11px] text-subtle truncate">{cat.fields.join(' · ')}</p>
                      )}
                    </div>
                  </button>
                  <AccessPill
                    value={aggregate}
                    onChange={(v) => setCategoryAccess(cat.id, v)}
                  />
                </div>

                {/* Per-field rows */}
                {open && (
                  <div className="border-t border-brand-border divide-y divide-border-soft">
                    {cat.fields.map(field => {
                      const key = `${cat.id}:${field}`;
                      const v = fieldAccess[key];
                      return (
                        <div
                          key={field}
                          className="flex items-center justify-between gap-4 px-4 py-2.5 bg-white"
                        >
                          <div>
                            <p className="text-[12px] font-medium text-strong">{field}</p>
                            <p className="text-[10px] text-subtle capitalize">
                              {v === 'none' ? 'No access' : v === 'read' ? 'Read only' : 'Read & write'}
                            </p>
                          </div>
                          <FieldAccessSwitch
                            value={v}
                            onChange={(next) =>
                              setFieldAccess(prev => ({ ...prev, [key]: next }))
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FieldGroup>

      {/* ── Improve-with-AI diff modal ── */}
      {diffOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="AI-improved system prompt"
        >
          <button
            className="absolute inset-0 bg-brand-black/30"
            onClick={() => setDiffOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-[860px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">
                  Improve with AI
                </p>
                <h3 className="text-[16px] font-semibold text-strong">Suggested system prompt</h3>
                <p className="text-[11px] text-subtle mt-1">
                  Review the diff before applying. Removed lines are struck through, added lines are highlighted.
                </p>
              </div>
              <button
                onClick={() => setDiffOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <PromptDiff before={promptText} after={improved} />
            </div>
            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setDiffOpen(false)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >
                Keep current
              </button>
              <button
                onClick={() => {
                  setPromptText(improved);
                  setDiffOpen(false);
                  addToast({ type: 'success', title: 'Prompt updated' });
                }}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >
                Apply changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
