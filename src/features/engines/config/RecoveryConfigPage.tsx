import { useState } from 'react';
import { Plus, Trash2, ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '../../../utils';
import { Switch } from '../../../components/ui/Switch';
import { useApp } from '../../../app/AppContext';

interface Category {
  id: string;
  label: string;
  enabled: boolean;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 'noise',         label: 'Noise',                enabled: true  },
  { id: 'cleanliness',   label: 'Cleanliness',          enabled: true  },
  { id: 'equipment',     label: 'Equipment / amenities', enabled: true  },
  { id: 'staff',         label: 'Staff behaviour',       enabled: true  },
  { id: 'food',          label: 'Food & beverage',       enabled: true  },
  { id: 'wifi',          label: 'Wi-Fi',                  enabled: true  },
  { id: 'temperature',   label: 'Temperature',           enabled: true  },
  { id: 'safety',        label: 'Safety',                 enabled: true  },
  { id: 'other',         label: 'Other',                  enabled: true  },
];

interface Tier {
  id: string;
  label: 'Low' | 'Medium' | 'High';
  drink: boolean;
  discount: boolean;
  upgrade: boolean;
  service: boolean;
  refund: boolean;
  maxAmount: string;
}

const INITIAL_TIERS: Tier[] = [
  { id: 'low',  label: 'Low',    drink: true,  discount: false, upgrade: false, service: true,  refund: false, maxAmount: '20'  },
  { id: 'med',  label: 'Medium', drink: true,  discount: true,  upgrade: false, service: true,  refund: false, maxAmount: '60'  },
  { id: 'high', label: 'High',   drink: true,  discount: true,  upgrade: true,  service: true,  refund: true,  maxAmount: '200' },
];

type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
type MatrixAction = 'ai_only' | 'reception' | 'manager';
const SEVERITIES: Severity[] = ['Low', 'Medium', 'High', 'Critical'];

const MATRIX_LABEL: Record<MatrixAction, string> = {
  ai_only:    'AI handles',
  reception:  'Escalate to reception',
  manager:    'Manager notification',
};

type Tab = 'categories' | 'compensation' | 'matrix';

export function RecoveryConfigPage() {
  const { addToast } = useApp();
  const [tab, setTab] = useState<Tab>('categories');

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [autoClassify, setAutoClassify] = useState(true);

  const [tiers, setTiers]                 = useState<Tier[]>(INITIAL_TIERS);
  const [requireApproval, setRequireApproval] = useState(true);
  const [approvalAmount, setApprovalAmount]   = useState('100');

  const [matrix, setMatrix] = useState<Record<string, MatrixAction>>(() => {
    const m: Record<string, MatrixAction> = {};
    for (const c of INITIAL_CATEGORIES) {
      for (const s of SEVERITIES) {
        m[`${c.id}:${s}`] = s === 'Critical' ? 'manager' : s === 'High' ? 'reception' : 'ai_only';
      }
    }
    return m;
  });
  const [criticalKeywords, setCriticalKeywords] = useState(
    'bedbug, cockroach, water leak, broken lock, theft, danger, ambulance',
  );

  const onDragStart = (id: string) => setDraggingId(id);
  const onDrop = (id: string) => {
    if (!draggingId || draggingId === id) { setDraggingId(null); return; }
    setCategories(prev => {
      const from = prev.findIndex(c => c.id === draggingId);
      const to   = prev.findIndex(c => c.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggingId(null);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'categories',   label: 'Complaint categories' },
    { id: 'compensation', label: 'Compensation policy'   },
    { id: 'matrix',       label: 'Severity matrix'        },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-5">

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

      {/* ── Categories ── */}
      {tab === 'categories' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-strong">Complaint categories</p>
                <p className="text-[11px] text-subtle mt-0.5">Drag to reorder priority. Disable a category to skip it entirely.</p>
              </div>
              <button
                onClick={() => setCategories(prev => [...prev, { id: `c${Date.now()}`, label: 'New category', enabled: true }])}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add category
              </button>
            </div>
            <div className="divide-y divide-border-soft">
              {categories.map((c, idx) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => onDragStart(c.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(c.id)}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 transition-colors',
                    draggingId === c.id ? 'opacity-40' : 'hover:bg-surface-2',
                  )}
                >
                  <GripVertical className="w-4 h-4 text-faint cursor-grab active:cursor-grabbing flex-shrink-0" />
                  <span className="w-5 h-5 rounded-full bg-surface-3 border border-brand-border text-[10px] font-bold text-subtle flex items-center justify-center flex-shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <input
                    value={c.label}
                    onChange={e => setCategories(prev => prev.map(x => x.id === c.id ? { ...x, label: e.target.value } : x))}
                    className="flex-1 h-8 px-3 rounded-lg border border-transparent hover:border-brand-border bg-transparent text-[13px] text-strong focus:outline-none focus:border-brand-blue focus:bg-white"
                  />
                  <Switch
                    size="sm"
                    checked={c.enabled}
                    onChange={v => setCategories(prev => prev.map(x => x.id === c.id ? { ...x, enabled: v } : x))}
                  />
                  <button
                    onClick={() => setCategories(prev => prev.filter(x => x.id !== c.id))}
                    className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={autoClassify} onChange={setAutoClassify} />
              <div>
                <p className="text-[13px] font-semibold text-strong">AI automatically classifies complaints</p>
                <p className="text-[11px] text-subtle mt-0.5">If off, agent has to ask the guest to pick a category.</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── Compensation policy ── */}
      {tab === 'compensation' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border">
              <p className="text-[13px] font-semibold text-strong">Compensation tiers</p>
              <p className="text-[11px] text-subtle mt-0.5">What the agent can offer autonomously per severity</p>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle">Tier</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-subtle">Free drink</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-subtle">Discount</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-subtle">Upgrade</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-subtle">Free service</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-subtle">Partial refund</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-subtle">Max €</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {tiers.map(tier => (
                  <tr key={tier.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border',
                        tier.label === 'High'   ? 'bg-brand-black text-white border-brand-black' :
                        tier.label === 'Medium' ? 'bg-surface-3 text-strong border-brand-border'   :
                                                  'bg-brand-blue-50 text-brand-blue border-brand-blue-light',
                      )}>
                        {tier.label}
                      </span>
                    </td>
                    {(['drink', 'discount', 'upgrade', 'service', 'refund'] as const).map(k => (
                      <td key={k} className="px-4 py-3 text-center">
                        <div className="inline-flex">
                          <Switch
                            size="sm"
                            checked={tier[k]}
                            onChange={v => setTiers(prev => prev.map(t => t.id === tier.id ? { ...t, [k]: v } : t))}
                          />
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        value={tier.maxAmount}
                        onChange={e => setTiers(prev => prev.map(t => t.id === tier.id ? { ...t, maxAmount: e.target.value } : t))}
                        className="w-20 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-right text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Manager approval</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={requireApproval} onChange={setRequireApproval} />
              <span className="text-[12px] text-strong inline-flex items-center gap-2">
                Require manager approval for compensation above
                <input
                  type="number"
                  value={approvalAmount}
                  onChange={e => setApprovalAmount(e.target.value)}
                  disabled={!requireApproval}
                  className="w-16 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white disabled:opacity-40"
                />
                €
              </span>
            </label>
          </div>
        </div>
      )}

      {/* ── Severity matrix ── */}
      {tab === 'matrix' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle bg-surface-2 sticky left-0">Category</th>
                  {SEVERITIES.map(s => (
                    <th key={s} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {categories.filter(c => c.enabled).map(c => (
                  <tr key={c.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-2 text-[12px] font-semibold text-strong bg-surface-2 sticky left-0 border-r border-brand-border">
                      {c.label}
                    </td>
                    {SEVERITIES.map(s => {
                      const key = `${c.id}:${s}`;
                      const val = matrix[key] ?? 'ai_only';
                      return (
                        <td key={s} className="px-2 py-2">
                          <div className="relative">
                            <select
                              value={val}
                              onChange={e => setMatrix({ ...matrix, [key]: e.target.value as MatrixAction })}
                              className={cn(
                                'w-full h-8 pl-2 pr-7 rounded-lg border text-[11px] appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light',
                                val === 'manager'    ? 'bg-brand-black text-white border-brand-black' :
                                val === 'reception'  ? 'bg-surface-3 text-strong border-brand-border'   :
                                                       'bg-brand-blue-50 text-brand-blue border-brand-blue-light',
                              )}
                            >
                              {(Object.keys(MATRIX_LABEL) as MatrixAction[]).map(a => (
                                <option key={a} value={a}>{MATRIX_LABEL[a]}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-70" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Critical-severity keywords</p>
            <p className="text-[11px] text-subtle">If any of these appear in a guest message, severity is forced to <span className="font-semibold text-strong">Critical</span>.</p>
            <textarea
              value={criticalKeywords}
              onChange={e => setCriticalKeywords(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pb-2">
        <button
          onClick={() => addToast({ type: 'success', title: 'Recovery configuration saved' })}
          className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
        >Save changes</button>
      </div>
    </div>
  );
}
