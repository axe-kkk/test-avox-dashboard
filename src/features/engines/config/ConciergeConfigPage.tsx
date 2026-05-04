import { useState } from 'react';
import { Plus, Trash2, MapPin, Search } from 'lucide-react';
import { cn } from '../../../utils';
import { Switch } from '../../../components/ui/Switch';
import { Select } from '../../../components/ui/Select';
import { useApp } from '../../../app/AppContext';

interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  distance: string;
  hours: string;
  priceRange: string;
  note: string;
  active: boolean;
}

const CATEGORIES = ['Restaurants', 'Transport', 'Attractions', 'Shopping', 'Medical', 'Entertainment'];

const INITIAL_PLACES: Place[] = [
  { id: 'p1', name: 'Le Cinq',                category: 'Restaurants',   address: '31 Av. George V',     distance: '1.4 km', hours: '12:30–14:00, 19:30–22:00', priceRange: '€€€€',  note: '3-Michelin-star — booking 2 weeks ahead.', active: true  },
  { id: 'p2', name: 'Bistro Paul Bert',       category: 'Restaurants',   address: '18 Rue Paul Bert',     distance: '5.2 km', hours: '12–14, 19:30–23:00',        priceRange: '€€',    note: 'Classic Paris bistro — guests love it.',    active: true  },
  { id: 'p3', name: 'Louvre Museum',           category: 'Attractions',   address: 'Rue de Rivoli',        distance: '0.7 km', hours: '09:00–18:00 (closed Tue)',  priceRange: '€',     note: 'Skip-the-line ticket bookable via concierge.', active: true },
  { id: 'p4', name: 'Pharmacie Anglaise',     category: 'Medical',       address: '6 Rue Castiglione',    distance: '0.3 km', hours: '08:00–22:00',                priceRange: '€',     note: 'English-speaking pharmacist on shift.',     active: true  },
];

interface Service {
  id: string;
  name: string;
  desc: string;
  price: string;
  method: 'auto_pms' | 'escalate' | 'external_api';
  hours: string;
  enabled: boolean;
}

const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Spa booking',         desc: 'In-house spa appointments',     price: 'from €120',   method: 'auto_pms',     hours: '08:00–22:00',  enabled: true  },
  { id: 's2', name: 'Restaurant',           desc: 'In-house & partner restaurants', price: '—',           method: 'auto_pms',     hours: '12:00–23:00', enabled: true  },
  { id: 's3', name: 'Airport transfer',     desc: 'Sedan, van or limousine',        price: 'from €85',    method: 'external_api', hours: '24/7',          enabled: true  },
  { id: 's4', name: 'Guided tour',          desc: 'Private city tours',             price: 'from €180',   method: 'escalate',     hours: '09:00–18:00', enabled: false },
  { id: 's5', name: 'Laundry',              desc: 'Same-day laundry & dry-clean',   price: 'per item',    method: 'auto_pms',     hours: '07:00–19:00', enabled: true  },
];

interface Trigger {
  id: string;
  condition: string;
  action: string;
  enabled: boolean;
}

const INITIAL_TRIGGERS: Trigger[] = [
  { id: 't1', condition: 'Guest 2+ days without interaction',  action: 'Ask if everything is OK',          enabled: true  },
  { id: 't2', condition: 'Mid-stay (50% through reservation)', action: 'Suggest spa or restaurant',         enabled: true  },
  { id: 't3', condition: 'Last day of stay',                    action: 'Send useful checkout info',         enabled: true  },
];

const TRIGGER_ACTIONS = [
  'Ask if everything is OK',
  'Suggest spa or restaurant',
  'Send useful checkout info',
  'Recommend a local attraction',
  'Offer free amenity',
];

type Tab = 'local' | 'services' | 'triggers';

export function ConciergeConfigPage() {
  const { addToast } = useApp();
  const [tab, setTab] = useState<Tab>('local');

  const [places, setPlaces]       = useState<Place[]>(INITIAL_PLACES);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch]       = useState('');

  const [services, setServices]   = useState<Service[]>(INITIAL_SERVICES);
  const [triggers, setTriggers]   = useState<Trigger[]>(INITIAL_TRIGGERS);

  const filteredPlaces = places.filter(p =>
    (categoryFilter === 'All' || p.category === categoryFilter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'local',    label: 'Local area knowledge' },
    { id: 'services', label: 'Service booking'       },
    { id: 'triggers', label: 'In-stay triggers'      },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-6 space-y-5">

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

      {/* ── Local knowledge ── */}
      {tab === 'local' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search places…"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-brand-border bg-white text-[12px] text-strong placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
              />
            </div>
            <div className="flex gap-1.5 ml-auto">
              <button
                onClick={() => addToast({ type: 'info', title: 'CSV import' })}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white text-[12px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >
                Import CSV
              </button>
              <button
                onClick={() => addToast({ type: 'info', title: 'Searching nearby places via Google Maps…' })}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white text-[12px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                Find on Google Maps
              </button>
              <button
                onClick={() => setPlaces(prev => [...prev, { id: `p${Date.now()}`, name: 'New place', category: CATEGORIES[0], address: '', distance: '', hours: '', priceRange: '€', note: '', active: false }])}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add place
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', ...CATEGORIES].map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={cn(
                  'h-7 px-3 rounded-full text-[11px] font-medium border transition-colors',
                  categoryFilter === c
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                )}
              >{c}</button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  {['Name', 'Category', 'Address', 'Distance', 'Hours', '€', 'Active', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-subtle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filteredPlaces.map(p => (
                  <tr key={p.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-2.5 text-[12px] font-semibold text-strong">{p.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] font-medium text-muted bg-surface-3 px-2 py-0.5 rounded-md border border-brand-border">{p.category}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-muted">{p.address}</td>
                    <td className="px-4 py-2.5 text-[11px] text-muted tabular-nums">{p.distance}</td>
                    <td className="px-4 py-2.5 text-[11px] text-muted">{p.hours}</td>
                    <td className="px-4 py-2.5 text-[11px] font-semibold text-strong tabular-nums">{p.priceRange}</td>
                    <td className="px-4 py-2.5">
                      <Switch
                        size="sm"
                        checked={p.active}
                        onChange={v => setPlaces(prev => prev.map(x => x.id === p.id ? { ...x, active: v } : x))}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setPlaces(prev => prev.filter(x => x.id !== p.id))}
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
        </div>
      )}

      {/* ── Service booking ── */}
      {tab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setServices(prev => [...prev, { id: `s${Date.now()}`, name: 'New service', desc: '', price: '—', method: 'escalate', hours: '24/7', enabled: false }])}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add service
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden divide-y divide-border-soft">
            {services.map(s => (
              <div key={s.id} className="px-5 py-4 grid grid-cols-[40px_1fr_140px_140px_28px] items-center gap-4">
                <Switch
                  size="sm"
                  checked={s.enabled}
                  onChange={v => setServices(prev => prev.map(x => x.id === s.id ? { ...x, enabled: v } : x))}
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-strong">{s.name}</p>
                  <p className="text-[11px] text-subtle">{s.desc} · {s.hours}</p>
                </div>
                <Select
                  size="sm"
                  className="w-full"
                  value={s.method}
                  onChange={v => setServices(prev => prev.map(x => x.id === s.id ? { ...x, method: v as Service['method'] } : x))}
                  options={[
                    { value: 'auto_pms',     label: 'Auto via PMS' },
                    { value: 'escalate',     label: 'Escalate to reception' },
                    { value: 'external_api', label: 'External API' },
                  ]}
                />
                <div className="text-[12px] text-muted tabular-nums text-right">{s.price}</div>
                <button
                  onClick={() => setServices(prev => prev.filter(x => x.id !== s.id))}
                  className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── In-stay triggers ── */}
      {tab === 'triggers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setTriggers(prev => [...prev, { id: `t${Date.now()}`, condition: '', action: TRIGGER_ACTIONS[0], enabled: false }])}
              className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add trigger
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden divide-y divide-border-soft">
            {triggers.map(t => (
              <div key={t.id} className="px-5 py-4 grid grid-cols-[40px_1fr_220px_28px] items-center gap-3">
                <Switch
                  size="sm"
                  checked={t.enabled}
                  onChange={v => setTriggers(prev => prev.map(x => x.id === t.id ? { ...x, enabled: v } : x))}
                />
                <input
                  value={t.condition}
                  onChange={e => setTriggers(prev => prev.map(x => x.id === t.id ? { ...x, condition: e.target.value } : x))}
                  placeholder="Guest N days without interaction…"
                  className="h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
                <Select
                  className="w-full"
                  value={t.action}
                  onChange={v => setTriggers(prev => prev.map(x => x.id === t.id ? { ...x, action: v } : x))}
                  options={TRIGGER_ACTIONS}
                />
                <button
                  onClick={() => setTriggers(prev => prev.filter(x => x.id !== t.id))}
                  className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pb-2">
        <button
          onClick={() => addToast({ type: 'success', title: 'Concierge configuration saved' })}
          className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
        >Save changes</button>
      </div>
    </div>
  );
}
