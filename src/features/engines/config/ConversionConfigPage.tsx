import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../utils';
import { Switch } from '../../../components/ui/Switch';
import { Select } from '../../../components/ui/Select';
import { useApp } from '../../../app/AppContext';

interface UrlPattern {
  id: string;
  url: string;
  greeting: string;
  delaySec: number;
}

const INITIAL_URLS: UrlPattern[] = [
  { id: 'p1', url: '/rooms',    greeting: 'Need help picking the right room?',   delaySec: 8  },
  { id: 'p2', url: '/offers',   greeting: 'Curious about current promotions?',    delaySec: 5  },
  { id: 'p3', url: '/location', greeting: 'Want directions or transport tips?',    delaySec: 12 },
];

const ROOM_TYPES = [
  { id: 'standard',     label: 'Standard Queen', show: true,  feature: false },
  { id: 'deluxe',       label: 'Deluxe King',     show: true,  feature: true  },
  { id: 'junior_suite', label: 'Junior Suite',    show: true,  feature: true  },
  { id: 'presidential', label: 'Presidential',    show: false, feature: false },
];

type Tab = 'widget' | 'abandonment' | 'availability';

export function ConversionConfigPage() {
  const { addToast } = useApp();
  const [tab, setTab] = useState<Tab>('widget');

  /* Widget Triggers */
  const [urls, setUrls] = useState<UrlPattern[]>(INITIAL_URLS);
  const [newOnly,    setNewOnly]    = useState(true);
  const [coolHours,  setCoolHours]  = useState('24');
  const [hideMobile, setHideMobile] = useState(false);

  /* Booking Abandonment */
  const [abandonMin, setAbandonMin] = useState('5');
  const [action, setAction] = useState<'web_chat' | 'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [recoveryMsg, setRecoveryMsg] = useState(
    "Hi {{guest_name}}, looks like you didn't finish your booking — can I help with anything?",
  );
  const [includeOffer, setIncludeOffer] = useState(true);
  const [chosenOffer, setChosenOffer]   = useState('Room Upgrade — Honeymoon');
  const [perVisitorLimit, setPerVisitorLimit] = useState('1');

  /* Availability Display */
  const [displayMode, setDisplayMode] = useState<'prices' | 'avail_only' | 'redirect'>('prices');
  const [rooms, setRooms]         = useState(ROOM_TYPES);
  const [showPhotos, setShowPhotos]     = useState(true);
  const [showAmenities, setShowAmenities] = useState(true);
  const [showOccupancy, setShowOccupancy] = useState(true);
  const [currency, setCurrency] = useState('EUR');
  const [autoCurrency, setAutoCurrency] = useState(true);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'widget',       label: 'Website widget triggers' },
    { id: 'abandonment',  label: 'Booking abandonment'      },
    { id: 'availability', label: 'Availability display'    },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6 space-y-5">

      {/* Tabs */}
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

      {/* ── Website widget triggers ── */}
      {tab === 'widget' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-strong">Site URL patterns</p>
                <p className="text-[11px] text-subtle mt-0.5">Where the proactive widget appears, with greeting and delay</p>
              </div>
              <button
                onClick={() => setUrls(prev => [...prev, { id: `p${Date.now()}`, url: '', greeting: '', delaySec: 5 }])}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add URL
              </button>
            </div>
            <div className="divide-y divide-border-soft">
              {urls.map(u => (
                <div key={u.id} className="grid grid-cols-[160px_1fr_90px_28px] gap-3 items-center px-5 py-3">
                  <input
                    value={u.url}
                    onChange={e => setUrls(prev => prev.map(x => x.id === u.id ? { ...x, url: e.target.value } : x))}
                    placeholder="/rooms"
                    className="h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                  <input
                    value={u.greeting}
                    onChange={e => setUrls(prev => prev.map(x => x.id === u.id ? { ...x, greeting: e.target.value } : x))}
                    placeholder="Need help picking a room?"
                    className="h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={u.delaySec}
                      onChange={e => setUrls(prev => prev.map(x => x.id === u.id ? { ...x, delaySec: Number(e.target.value) } : x))}
                      className="w-14 h-9 px-2 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    />
                    <span className="text-[11px] text-subtle">sec</span>
                  </div>
                  <button
                    onClick={() => setUrls(prev => prev.filter(x => x.id !== u.id))}
                    className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
            <p className="text-[13px] font-semibold text-strong">Display conditions</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={newOnly} onChange={setNewOnly} />
              <span className="text-[12px] text-strong">Only show to new visitors</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={hideMobile} onChange={setHideMobile} />
              <span className="text-[12px] text-strong">Don't show on mobile</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-strong">Don't show again for</span>
              <input
                type="number"
                value={coolHours}
                onChange={e => setCoolHours(e.target.value)}
                className="w-16 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <span className="text-[12px] text-subtle">hours after dismissal</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking abandonment ── */}
      {tab === 'abandonment' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
            <p className="text-[13px] font-semibold text-strong">Trigger</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-strong">Trigger after</span>
              <input
                type="number"
                value={abandonMin}
                onChange={e => setAbandonMin(e.target.value)}
                className="w-14 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <span className="text-[12px] text-subtle">minutes of inactivity on the booking page</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Recovery action</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'web_chat', label: 'Show web-chat message' },
                { id: 'whatsapp', label: 'Send WhatsApp (if contact)' },
                { id: 'sms',      label: 'Send SMS' },
                { id: 'email',    label: 'Send email' },
              ] as const).map(o => (
                <button
                  key={o.id}
                  onClick={() => setAction(o.id)}
                  className={cn(
                    'h-9 px-3 text-left rounded-xl border text-[12px] font-medium transition-colors',
                    action === o.id
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                  )}
                >{o.label}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Recovery message</p>
            <textarea
              value={recoveryMsg}
              onChange={e => setRecoveryMsg(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={includeOffer} onChange={setIncludeOffer} />
              <span className="text-[12px] text-strong">Include an offer in the message</span>
            </label>
            {includeOffer && (
              <Select
                value={chosenOffer}
                onChange={setChosenOffer}
                className="w-full"
                options={[
                  'Room Upgrade — Honeymoon',
                  'Early Check-in 10 AM',
                  'Spa Sunday Package',
                  'Free Airport Transfer',
                ]}
              />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5">
            <p className="text-[13px] font-semibold text-strong mb-3">Limits</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-strong">Max</span>
              <input
                type="number"
                value={perVisitorLimit}
                onChange={e => setPerVisitorLimit(e.target.value)}
                className="w-14 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <span className="text-[12px] text-subtle">recovery messages per visitor per day</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Availability display ── */}
      {tab === 'availability' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Display mode</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'prices',     label: 'Prices & availability' },
                { id: 'avail_only', label: 'Availability only'      },
                { id: 'redirect',   label: 'Redirect to booking'    },
              ] as const).map(m => (
                <button
                  key={m.id}
                  onClick={() => setDisplayMode(m.id)}
                  className={cn(
                    'h-9 rounded-xl border text-[12px] font-semibold transition-colors',
                    displayMode === m.id
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                  )}
                >{m.label}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border">
              <p className="text-[13px] font-semibold text-strong">Room types</p>
              <p className="text-[11px] text-subtle mt-0.5">Which rooms to surface, and which to lead with</p>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle">Room</th>
                  <th className="px-5 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-subtle">Show</th>
                  <th className="px-5 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-subtle">Recommend first</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {rooms.map(r => (
                  <tr key={r.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3 text-[13px] text-strong">{r.label}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex">
                        <Switch
                          size="sm"
                          checked={r.show}
                          onChange={v => setRooms(prev => prev.map(x => x.id === r.id ? { ...x, show: v } : x))}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex">
                        <Switch
                          size="sm"
                          checked={r.feature}
                          onChange={v => setRooms(prev => prev.map(x => x.id === r.id ? { ...x, feature: v } : x))}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Response format</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={showPhotos} onChange={setShowPhotos} />
              <span className="text-[12px] text-strong">Show room photo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={showAmenities} onChange={setShowAmenities} />
              <span className="text-[12px] text-strong">Show amenities</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={showOccupancy} onChange={setShowOccupancy} />
              <span className="text-[12px] text-strong">Show max occupancy</span>
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Currency</p>
            <div className="flex items-center gap-3">
              <Select
                value={currency}
                onChange={setCurrency}
                options={['EUR', 'USD', 'GBP', 'CHF', 'JPY']}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch size="sm" checked={autoCurrency} onChange={setAutoCurrency} />
                <span className="text-[12px] text-strong">Auto-detect by guest location</span>
              </label>
            </div>
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
