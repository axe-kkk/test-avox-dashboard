import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus, GripVertical, Trash2, AlertTriangle, Link, X, Edit2, ChevronDown,
} from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';
import { Switch } from '../../components/ui/Switch';
import { getEngineSpec } from './lib/engineSpec';

type ConditionType = 'channel' | 'keyword' | 'tag' | 'intent';
type ActionType    = 'handle' | 'transfer' | 'escalate';

interface RoutingRule {
  id: string;
  condition: string;
  conditionType: ConditionType;
  action: ActionType;
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
  { id: 'r1', condition: 'Channel is WhatsApp or Messenger',  conditionType: 'channel', action: 'handle',   actionTarget: 'This engine'        },
  { id: 'r2', condition: 'Keyword: "cancel" or "refund"',      conditionType: 'keyword', action: 'transfer', actionTarget: 'Reservation Engine' },
  { id: 'r3', condition: 'Guest tag is VIP',                   conditionType: 'tag',     action: 'escalate', actionTarget: 'Front Office'       },
  { id: 'r4', condition: 'Intent: booking inquiry',            conditionType: 'intent',  action: 'handle',   actionTarget: 'This engine'        },
];

const EMPTY_RULE: RoutingRule = {
  id: '', condition: '', conditionType: 'channel', action: 'handle', actionTarget: 'This engine',
};

const TRANSFER_TARGETS = ['Conversion Engine', 'Reservation Engine', 'Upsell Engine', 'Concierge Engine', 'Recovery Engine'];
const DEPARTMENTS      = ['Front Office', 'Reservations', 'Concierge', 'Spa', 'Restaurant', 'Maintenance'];

/* Condition-type pill — neutral, uses surface tones */
const condTypeBadge: Record<ConditionType, string> = {
  channel: 'bg-brand-blue-50 text-brand-blue border-brand-blue-light',
  keyword: 'bg-surface-3 text-strong border-brand-border',
  tag:     'bg-surface-3 text-muted border-brand-border',
  intent:  'bg-brand-blue-50 text-brand-blue border-brand-blue-light',
};

const actionLabel: Record<ActionType, string> = {
  handle: 'Handle', transfer: 'Transfer', escalate: 'Escalate',
};

export function EngineRoutingPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [rules, setRules]                       = useState<RoutingRule[]>(MOCK_RULES);
  const [ruleDraft, setRuleDraft]               = useState<RoutingRule | null>(null);
  const [draggingId, setDraggingId]             = useState<string | null>(null);
  const [dragOverId, setDragOverId]             = useState<string | null>(null);
  const [sentimentToggle, setSentimentToggle]   = useState(true);
  const [sentimentCount, setSentimentCount]     = useState('3');
  const [escKeywords, setEscKeywords]           = useState('unacceptable, terrible, disgusting, complaint, refund, lawsuit');
  const [confidence, setConfidence]             = useState(70);
  const spec = engine ? getEngineSpec(engine.name) : null;
  const [escDepartment, setEscDepartment]       = useState(spec?.escalationDepartment ?? 'Front Office');
  const [fallback, setFallback]                 = useState('escalate');

  if (!engine) return null;

  /* ── Drag-and-drop reorder (native HTML5 DnD, no extra deps) ── */
  const onDragStart = (id: string) => setDraggingId(id);
  const onDragOver  = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggingId) setDragOverId(id);
  };
  const onDrop = (id: string) => {
    if (!draggingId || draggingId === id) { setDraggingId(null); setDragOverId(null); return; }
    setRules(prev => {
      const from = prev.findIndex(r => r.id === draggingId);
      const to   = prev.findIndex(r => r.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    addToast({ type: 'success', title: 'Rule order updated' });
    setDraggingId(null);
    setDragOverId(null);
  };

  const saveRule = () => {
    if (!ruleDraft) return;
    if (!ruleDraft.condition.trim()) { addToast({ type: 'warning', title: 'Condition required' }); return; }
    if (ruleDraft.id) {
      setRules(prev => prev.map(r => r.id === ruleDraft.id ? ruleDraft : r));
      addToast({ type: 'success', title: 'Rule updated' });
    } else {
      setRules(prev => [...prev, { ...ruleDraft, id: `r${Date.now()}` }]);
      addToast({ type: 'success', title: 'Rule added' });
    }
    setRuleDraft(null);
  };

  return (
    <div className="max-w-[860px] mx-auto px-6 py-6 space-y-5">

      {/* ── Connected channels ── */}
      <div className="bg-white rounded-2xl border border-brand-border p-5">
        <p className="text-[13px] font-semibold text-strong mb-4">Connected Channels</p>
        <div className="grid grid-cols-4 gap-3">
          {CHANNELS_CONFIG.map(ch => (
            <div
              key={ch.id}
              className={cn(
                'flex items-center justify-between px-3.5 py-3 rounded-xl border transition-colors',
                ch.connected ? 'border-brand-border bg-surface-2' : 'border-dashed border-brand-border bg-white',
              )}
            >
              <div>
                <p className="text-[12px] font-medium text-strong">{ch.label}</p>
                <p className={cn('text-[10px] mt-0.5', ch.connected ? 'text-brand-blue' : 'text-subtle')}>
                  {ch.connected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              {!ch.connected ? (
                <button
                  onClick={() => addToast({ type: 'info', title: `Connect ${ch.label}` })}
                  className="flex items-center gap-1 text-[10px] font-semibold text-brand-blue hover:underline"
                >
                  <Link className="w-3 h-3" />
                  Connect
                </button>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Routing rules ── */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-strong">Routing Rules</p>
            <p className="text-[11px] text-subtle mt-0.5">Rules are evaluated top to bottom. Drag the handle to reorder.</p>
          </div>
          <button
            onClick={() => setRuleDraft({ ...EMPTY_RULE })}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add rule
          </button>
        </div>

        <div className="divide-y divide-border-soft">
          {rules.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[12px] text-subtle">No routing rules yet. Add one to get started.</p>
            </div>
          ) : rules.map((rule, idx) => (
            <div
              key={rule.id}
              draggable
              onDragStart={() => onDragStart(rule.id)}
              onDragOver={e => onDragOver(e, rule.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => onDrop(rule.id)}
              onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 group transition-colors',
                draggingId === rule.id  ? 'opacity-40' : 'opacity-100',
                dragOverId === rule.id  ? 'bg-brand-blue-50' : 'hover:bg-surface-2',
              )}
            >
              <div className="text-faint cursor-grab active:cursor-grabbing flex-shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>
              <span className="w-5 h-5 rounded-full bg-surface-3 border border-brand-border text-[10px] font-bold text-subtle flex items-center justify-center flex-shrink-0 tabular-nums">
                {idx + 1}
              </span>

              {/* IF */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-faint uppercase flex-shrink-0">IF</span>
                <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border flex-shrink-0', condTypeBadge[rule.conditionType])}>
                  {rule.conditionType}
                </span>
                <span className="text-[12px] text-strong truncate">{rule.condition}</span>
              </div>

              {/* THEN */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-bold text-faint uppercase">THEN</span>
                <span
                  className={cn(
                    'text-[12px] font-semibold',
                    rule.action === 'escalate' ? 'text-brand-black' : 'text-brand-blue',
                  )}
                >{actionLabel[rule.action]}</span>
                <span className="text-[12px] text-muted">→ {rule.actionTarget}</span>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => setRuleDraft(rule)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle opacity-0 group-hover:opacity-100 hover:bg-surface-3 hover:text-brand-blue transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-faint opacity-0 group-hover:opacity-100 hover:bg-surface-3 hover:text-brand-black transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Escalation rules ── */}
      <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-brand-black" />
          <p className="text-[13px] font-semibold text-strong">Escalation Rules</p>
        </div>

        {/* Sentiment */}
        <div className="flex items-start gap-4">
          <Switch
            checked={sentimentToggle}
            onChange={setSentimentToggle}
            className="mt-0.5"
          />
          <div className="flex-1">
            <p className="text-[13px] font-medium text-strong mb-1.5">Sentiment-based escalation</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted">Escalate after</span>
              <input
                type="number"
                value={sentimentCount}
                onChange={e => setSentimentCount(e.target.value)}
                disabled={!sentimentToggle}
                className="w-14 h-8 px-2.5 rounded-lg border border-brand-border bg-surface-2 text-[13px] text-strong text-center focus:outline-none focus:ring-2 focus:ring-brand-blue-light disabled:opacity-40"
              />
              <span className="text-[12px] text-muted">negative messages in a row</span>
            </div>
          </div>
        </div>

        {/* Escalation keywords */}
        <div>
          <label className="block text-[12px] font-semibold text-muted mb-1.5">Escalation keywords</label>
          <input
            value={escKeywords}
            onChange={e => setEscKeywords(e.target.value)}
            className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
          />
          <p className="text-[10px] text-subtle mt-1">Comma-separated. Any match triggers immediate escalation.</p>
        </div>

        {/* Confidence threshold */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-semibold text-muted">Confidence threshold</label>
            <span
              className="text-[13px] font-semibold text-brand-blue tabular-nums"
              style={{ fontFamily: "'Azeret Mono', monospace" }}
            >{confidence}%</span>
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
            <span className="text-[10px] text-subtle">0% — Always escalate</span>
            <span className="text-[10px] text-subtle">100% — Never escalate</span>
          </div>
          <p className="text-[11px] text-muted mt-2">
            When AI confidence falls below {confidence}%, the conversation is escalated.
          </p>
        </div>

        {/* Escalation department */}
        <div>
          <label className="block text-[12px] font-semibold text-muted mb-1.5">Escalation department</label>
          <div className="relative">
            <select
              value={escDepartment}
              onChange={e => setEscDepartment(e.target.value)}
              className="w-full h-9 pl-3 pr-9 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            >
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Fallback ── */}
      <div className="bg-white rounded-2xl border border-brand-border p-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-strong mb-0.5">Fallback behavior</p>
          <p className="text-[12px] text-subtle">What to do when no routing rule matches</p>
        </div>
        <div className="relative">
          <select
            value={fallback}
            onChange={e => setFallback(e.target.value)}
            className="h-9 pl-3 pr-9 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
          >
            <option value="handle">Handle with this engine</option>
            <option value="escalate">Escalate to {escDepartment}</option>
            <option value="ignore">Ignore</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pb-2">
        <button
          onClick={() => addToast({ type: 'success', title: 'Routing saved' })}
          className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
        >
          Save routing
        </button>
      </div>

      {/* ═════════════════════════════════════════════════
         Routing rule Add/Edit modal
      ═════════════════════════════════════════════════ */}
      {ruleDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setRuleDraft(null)} aria-label="Close" />
          <div className="relative w-[560px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">
                  {ruleDraft.id ? 'Edit rule' : 'New rule'}
                </p>
                <h3 className="text-[15px] font-semibold text-strong">
                  IF condition matches → take action
                </h3>
              </div>
              <button onClick={() => setRuleDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Condition type */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Condition type</p>
                <div className="grid grid-cols-4 gap-2">
                  {(['channel', 'keyword', 'tag', 'intent'] as ConditionType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setRuleDraft({ ...ruleDraft, conditionType: t })}
                      className={cn(
                        'h-9 rounded-xl text-[12px] font-semibold border transition-colors capitalize',
                        ruleDraft.conditionType === t
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                      )}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Condition</p>
                <input
                  value={ruleDraft.condition}
                  onChange={e => setRuleDraft({ ...ruleDraft, condition: e.target.value })}
                  placeholder={
                    ruleDraft.conditionType === 'channel'
                      ? 'Channel is WhatsApp or Messenger'
                      : ruleDraft.conditionType === 'keyword'
                        ? 'Keyword: "cancel" or "refund"'
                        : ruleDraft.conditionType === 'tag'
                          ? 'Guest tag is VIP'
                          : 'Intent: booking inquiry'
                  }
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>

              {/* Action */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Action</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['handle', 'transfer', 'escalate'] as ActionType[]).map(a => (
                    <button
                      key={a}
                      onClick={() => setRuleDraft({
                        ...ruleDraft,
                        action: a,
                        actionTarget:
                          a === 'handle'   ? 'This engine'    :
                          a === 'transfer' ? TRANSFER_TARGETS[0] :
                                             DEPARTMENTS[0],
                      })}
                      className={cn(
                        'h-9 rounded-xl text-[12px] font-semibold border transition-colors',
                        ruleDraft.action === a
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                      )}
                    >{actionLabel[a]}</button>
                  ))}
                </div>
              </div>

              {ruleDraft.action !== 'handle' && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">
                    {ruleDraft.action === 'transfer' ? 'Transfer to' : 'Escalate to'}
                  </p>
                  <div className="relative">
                    <select
                      value={ruleDraft.actionTarget}
                      onChange={e => setRuleDraft({ ...ruleDraft, actionTarget: e.target.value })}
                      className="w-full h-9 pl-3 pr-9 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    >
                      {(ruleDraft.action === 'transfer' ? TRANSFER_TARGETS : DEPARTMENTS).map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2">
              <button
                onClick={() => setRuleDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveRule}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >{ruleDraft.id ? 'Save changes' : 'Add rule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
