import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../utils';
import { Switch } from '../../../components/ui/Switch';
import { useApp } from '../../../app/AppContext';

interface Step {
  id: string;
  label: string;
  enabled: boolean;
}

const INITIAL_STEPS: Step[] = [
  { id: 'dates',    label: 'Choose dates',         enabled: true  },
  { id: 'room',     label: 'Choose room',           enabled: true  },
  { id: 'guests',   label: 'Number of guests',      enabled: true  },
  { id: 'profile',  label: 'Guest details',         enabled: true  },
  { id: 'requests', label: 'Special requests',      enabled: true  },
  { id: 'confirm',  label: 'Review & confirm',      enabled: true  },
];

interface PolicyTier {
  id: string;
  label: string;
  rate: 'flexible' | 'moderate' | 'strict';
  text: string;
}

const INITIAL_POLICIES: PolicyTier[] = [
  { id: 'p1', label: 'Flexible', rate: 'flexible', text: 'Free cancellation up to 24 hours before check-in. After that, the first night is charged.' },
  { id: 'p2', label: 'Moderate', rate: 'moderate', text: 'Free cancellation up to 5 days before check-in. After that, 50% of the stay is charged.' },
  { id: 'p3', label: 'Strict',   rate: 'strict',   text: 'Non-refundable. Full stay charged at booking; no cancellation fees waived.' },
];

type Tab = 'flow' | 'cancel';

export function ReservationConfigPage() {
  const { addToast } = useApp();
  const [tab, setTab] = useState<Tab>('flow');

  const [steps, setSteps]                 = useState<Step[]>(INITIAL_STEPS);
  const [draggingId, setDraggingId]       = useState<string | null>(null);
  const [prepayment, setPrepayment]       = useState<'none' | 'card' | 'full'>('card');
  const [confirmation, setConfirmation]   = useState<'auto' | 'manual'>('auto');
  const [confirmMsg, setConfirmMsg]       = useState(
    'Booking confirmed, {{guest_name}}! Your {{room_type}} on {{check_in_date}} is reserved. Reply with any special requests.',
  );

  const [policies, setPolicies]           = useState<PolicyTier[]>(INITIAL_POLICIES);
  const [offerAlternatives, setOfferAlt]  = useState(true);
  const [offerCredit, setOfferCredit]     = useState(true);
  const [escalatePenalty, setEscalatePenalty] = useState(true);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'flow',   label: 'Booking flow'        },
    { id: 'cancel', label: 'Cancellation policy' },
  ];

  const onDragStart = (id: string) => setDraggingId(id);
  const onDrop = (id: string) => {
    if (!draggingId || draggingId === id) { setDraggingId(null); return; }
    setSteps(prev => {
      const from = prev.findIndex(s => s.id === draggingId);
      const to   = prev.findIndex(s => s.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggingId(null);
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6 space-y-5">

      <div className="flex border-b border-brand-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2.5 text-[12px] font-semibold border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-subtle hover:text-strong',
            )}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'flow' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border">
              <p className="text-[13px] font-semibold text-strong">Booking flow steps</p>
              <p className="text-[11px] text-subtle mt-0.5">Drag to reorder. Toggle to skip a step entirely.</p>
            </div>
            <div className="divide-y divide-border-soft">
              {steps.map((s, idx) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => onDragStart(s.id)}
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={() => onDrop(s.id)}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 transition-colors',
                    draggingId === s.id ? 'opacity-40' : 'hover:bg-surface-2',
                  )}
                >
                  <GripVertical className="w-4 h-4 text-faint cursor-grab active:cursor-grabbing flex-shrink-0" />
                  <span className="w-5 h-5 rounded-full bg-surface-3 border border-brand-border text-[10px] font-bold text-subtle flex items-center justify-center flex-shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-[13px] text-strong">{s.label}</span>
                  <Switch
                    size="sm"
                    checked={s.enabled}
                    onChange={v => setSteps(prev => prev.map(x => x.id === s.id ? { ...x, enabled: v } : x))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Prepayment</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'none', label: 'No prepayment'        },
                { id: 'card', label: 'Card guarantee only'   },
                { id: 'full', label: 'Full prepayment'       },
              ] as const).map(o => (
                <button
                  key={o.id}
                  onClick={() => setPrepayment(o.id)}
                  className={cn(
                    'h-9 rounded-xl border text-[12px] font-semibold transition-colors',
                    prepayment === o.id
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                  )}
                >{o.label}</button>
              ))}
            </div>
            <p className="text-[10px] text-subtle">
              Payment gateway:&nbsp;
              <a className="text-brand-blue hover:underline" href="#">Stripe Connect</a> · configured.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Confirmation</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'auto',   label: 'Automatic (instant)'        },
                { id: 'manual', label: 'After operator review'      },
              ] as const).map(o => (
                <button
                  key={o.id}
                  onClick={() => setConfirmation(o.id)}
                  className={cn(
                    'h-9 rounded-xl border text-[12px] font-semibold transition-colors',
                    confirmation === o.id
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                  )}
                >{o.label}</button>
              ))}
            </div>
            <textarea
              value={confirmMsg}
              onChange={e => setConfirmMsg(e.target.value)}
              rows={3}
              placeholder="Booking confirmed, {{guest_name}}…"
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            />
          </div>
        </div>
      )}

      {tab === 'cancel' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-strong">Cancellation policies</p>
                <p className="text-[11px] text-subtle mt-0.5">One per rate type — text shown to guest at booking</p>
              </div>
              <button
                onClick={() => setPolicies(prev => [...prev, { id: `p${Date.now()}`, label: 'New tier', rate: 'flexible', text: '' }])}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add policy
              </button>
            </div>
            <div className="divide-y divide-border-soft">
              {policies.map(p => (
                <div key={p.id} className="px-5 py-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      value={p.label}
                      onChange={e => setPolicies(prev => prev.map(x => x.id === p.id ? { ...x, label: e.target.value } : x))}
                      className="h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-semibold text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    />
                    <span className={cn(
                      'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                      p.rate === 'strict'   ? 'bg-surface-3 text-brand-black border-brand-border' :
                      p.rate === 'moderate' ? 'bg-surface-3 text-strong      border-brand-border' :
                                              'bg-brand-blue-50 text-brand-blue border-brand-blue-light',
                    )}>
                      {p.rate}
                    </span>
                    <button
                      onClick={() => setPolicies(prev => prev.filter(x => x.id !== p.id))}
                      className="ml-auto w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={p.text}
                    onChange={e => setPolicies(prev => prev.map(x => x.id === p.id ? { ...x, text: e.target.value } : x))}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">When a guest cancels</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={offerAlternatives} onChange={setOfferAlt} />
              <span className="text-[12px] text-strong">Offer alternative dates before processing</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={offerCredit} onChange={setOfferCredit} />
              <span className="text-[12px] text-strong">Offer credit for a future stay</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={escalatePenalty} onChange={setEscalatePenalty} />
              <span className="text-[12px] text-strong">Escalate to manager if cancellation falls inside penalty window</span>
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-end pb-2">
        <button
          onClick={() => addToast({ type: 'success', title: 'Configuration saved' })}
          className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
        >Save changes</button>
      </div>
    </div>
  );
}
