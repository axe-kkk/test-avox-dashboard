import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../utils';
import { Switch } from '../../../components/ui/Switch';
import { Select } from '../../../components/ui/Select';
import { useApp } from '../../../app/AppContext';

interface UpgradeRule {
  id: string;
  source: string;
  target: string;
  priceMethod: 'fixed' | 'percent_diff' | 'free';
  amount: string;
}

const ROOM_TYPES = ['Standard Queen', 'Deluxe King', 'Junior Suite', 'Presidential'];

const INITIAL_RULES: UpgradeRule[] = [
  { id: 'r1', source: 'Standard Queen', target: 'Deluxe King',     priceMethod: 'fixed',         amount: '40' },
  { id: 'r2', source: 'Deluxe King',    target: 'Junior Suite',     priceMethod: 'percent_diff', amount: '60' },
  { id: 'r3', source: 'Junior Suite',   target: 'Presidential',     priceMethod: 'percent_diff', amount: '50' },
  { id: 'r4', source: 'Standard Queen', target: 'Junior Suite',     priceMethod: 'free',          amount: '0'  },
];

export function UpsellConfigPage() {
  const { addToast } = useApp();

  const [rules, setRules]               = useState<UpgradeRule[]>(INITIAL_RULES);
  const [atBooking, setAtBooking]       = useState(true);
  const [daysBefore, setDaysBefore]     = useState({ enabled: true, days: '3' });
  const [atCheckin, setAtCheckin]       = useState(true);
  const [maxOffers, setMaxOffers]       = useState('2');
  const [pmsCheck, setPmsCheck]         = useState(true);
  const [whenUnavailable, setWhenUnavailable] = useState<'none' | 'alt' | 'waitlist'>('alt');

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6 space-y-5">

      {/* Upgrade matrix */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-strong">Upgrade matrix</p>
            <p className="text-[11px] text-subtle mt-0.5">Source room → target room with pricing rule</p>
          </div>
          <button
            onClick={() => setRules(prev => [...prev, { id: `r${Date.now()}`, source: ROOM_TYPES[0], target: ROOM_TYPES[1], priceMethod: 'fixed', amount: '0' }])}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add rule
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle">Source</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle">Target</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle">Method</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle">Amount</th>
              <th className="w-9" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {rules.map(r => (
              <tr key={r.id} className="hover:bg-surface-2 transition-colors">
                <td className="px-5 py-2.5">
                  <Select
                    size="sm"
                    value={r.source}
                    onChange={v => setRules(prev => prev.map(x => x.id === r.id ? { ...x, source: v } : x))}
                    options={ROOM_TYPES}
                  />
                </td>
                <td className="px-5 py-2.5">
                  <Select
                    size="sm"
                    value={r.target}
                    onChange={v => setRules(prev => prev.map(x => x.id === r.id ? { ...x, target: v } : x))}
                    options={ROOM_TYPES}
                  />
                </td>
                <td className="px-5 py-2.5">
                  <Select
                    size="sm"
                    value={r.priceMethod}
                    onChange={v => setRules(prev => prev.map(x => x.id === r.id ? { ...x, priceMethod: v as UpgradeRule['priceMethod'] } : x))}
                    options={[
                      { value: 'fixed',        label: 'Fixed amount' },
                      { value: 'percent_diff', label: '% of price diff' },
                      { value: 'free',         label: 'Free' },
                    ]}
                  />
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={r.amount}
                      disabled={r.priceMethod === 'free'}
                      onChange={e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, amount: e.target.value } : x))}
                      className="w-20 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-strong text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white disabled:opacity-40"
                    />
                    <span className="text-[11px] text-subtle">{r.priceMethod === 'percent_diff' ? '%' : '€'}</span>
                  </div>
                </td>
                <td className="px-5 py-2.5 text-center">
                  <button
                    onClick={() => setRules(prev => prev.filter(x => x.id !== r.id))}
                    className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timing */}
      <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
        <p className="text-[13px] font-semibold text-strong">When to pitch the upgrade</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch checked={atBooking} onChange={setAtBooking} />
          <span className="text-[12px] text-strong">At booking confirmation</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch checked={daysBefore.enabled} onChange={v => setDaysBefore({ ...daysBefore, enabled: v })} />
          <span className="text-[12px] text-strong inline-flex items-center gap-2">
            <input
              type="number"
              value={daysBefore.days}
              onChange={e => setDaysBefore({ ...daysBefore, days: e.target.value })}
              disabled={!daysBefore.enabled}
              className="w-12 h-7 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white disabled:opacity-40"
            />
            days before check-in
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch checked={atCheckin} onChange={setAtCheckin} />
          <span className="text-[12px] text-strong">At check-in</span>
        </label>
      </div>

      {/* Limits */}
      <div className="bg-white rounded-2xl border border-brand-border p-5">
        <p className="text-[13px] font-semibold text-strong mb-3">Frequency cap</p>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-strong">Max</span>
          <input
            type="number"
            value={maxOffers}
            onChange={e => setMaxOffers(e.target.value)}
            className="w-14 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
          />
          <span className="text-[12px] text-subtle">upsell pitches per guest journey</span>
        </div>
      </div>

      {/* Inventory awareness */}
      <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
        <p className="text-[13px] font-semibold text-strong">Inventory awareness</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch checked={pmsCheck} onChange={setPmsCheck} />
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-strong">Check PMS availability before pitching</p>
            <p className="text-[11px] text-subtle mt-0.5">Engine confirms inventory in Cloudbeds before suggesting an upgrade.</p>
          </div>
        </label>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">If unavailable</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'none',     label: "Don't pitch"             },
              { id: 'alt',      label: 'Pitch alternative'        },
              { id: 'waitlist', label: 'Add to waitlist'          },
            ] as const).map(o => (
              <button
                key={o.id}
                onClick={() => setWhenUnavailable(o.id)}
                className={cn(
                  'h-9 rounded-xl border text-[12px] font-semibold transition-colors',
                  whenUnavailable === o.id
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                )}
              >{o.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pb-2">
        <button
          onClick={() => addToast({ type: 'success', title: 'Upsell rules saved' })}
          className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
        >Save changes</button>
      </div>
    </div>
  );
}
