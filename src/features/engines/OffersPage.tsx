import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, Send, Check } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';

/* Inbox-style monochrome — every engine uses the brand-blue accent. */
const ENGINE_COLORS: Record<string, string> = {
  Conversion: '#2355A7', Reservation: '#2355A7', Upsell: '#2355A7',
  Arrival: '#2355A7', Concierge: '#2355A7', Recovery: '#2355A7', Reputation: '#2355A7',
};

const OFFER_TYPES = [
  'Room upgrade', 'Early check-in', 'Late check-out', 'Spa package',
  'Restaurant reservation', 'Airport transfer', 'Discount %', 'Fixed discount',
  'Free service', 'Gift',
];

const CHANNELS = [
  { id: 'whatsapp',  label: 'WhatsApp'   },
  { id: 'sms',       label: 'SMS'         },
  { id: 'rcs',       label: 'RCS'         },
  { id: 'messenger', label: 'Messenger'   },
  { id: 'instagram', label: 'Instagram'   },
  { id: 'telegram',  label: 'Telegram'    },
  { id: 'viber',     label: 'Viber'       },
  { id: 'email',     label: 'Email'       },
];

interface Offer {
  id: string;
  name: string;
  type: string;
  condition: string;
  limit: string;
  status: 'active' | 'paused';
}

interface TimelinePoint {
  id: string;
  days: number;
  messageType: string;
  channel: string;
}

const MOCK_OFFERS: Offer[] = [
  { id: 'o1', name: 'Room Upgrade — Honeymoon',  type: 'Room upgrade',        condition: 'Tag: Honeymoon',      limit: '5/day',  status: 'active' },
  { id: 'o2', name: 'Early Check-in 10:00 AM',   type: 'Early check-in',      condition: 'Arrival 3+ nights',   limit: '10/day', status: 'active' },
  { id: 'o3', name: 'Spa Sunday Package',         type: 'Spa package',         condition: 'Weekend stay',        limit: '8/day',  status: 'paused' },
  { id: 'o4', name: 'Airport Transfer Offer',     type: 'Airport transfer',    condition: 'First-time guest',    limit: '20/day', status: 'active' },
];

const MOCK_TIMELINE: TimelinePoint[] = [
  { id: 't1', days: 7,  messageType: 'Informational',    channel: 'email'    },
  { id: 't2', days: 3,  messageType: 'Preferences',      channel: 'whatsapp' },
  { id: 't3', days: 1,  messageType: 'Reminder',         channel: 'whatsapp' },
];

const WHATSAPP_TEMPLATES = [
  { name: 'pre_arrival_welcome',  lang: 'EN', category: 'utility',     status: 'approved', updated: 'Apr 18, 2026' },
  { name: 'upsell_room_upgrade',  lang: 'EN', category: 'marketing',   status: 'approved', updated: 'Apr 12, 2026' },
  { name: 'post_stay_review',     lang: 'EN', category: 'utility',     status: 'approved', updated: 'Apr 10, 2026' },
  { name: 'pre_arrival_de',       lang: 'DE', category: 'utility',     status: 'pending',  updated: 'Apr 21, 2026' },
];

const MASS_SERVICES = [
  { name: 'Vonage',      connected: true  },
  { name: 'Mailchimp',   connected: false },
  { name: 'Brevo',       connected: true  },
  { name: 'Espooter',    connected: false },
];

export function OffersPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [timeline, setTimeline] = useState<TimelinePoint[]>(MOCK_TIMELINE);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [activeTab, setTab] = useState<'offers' | 'timeline' | 'templates' | 'services'>('offers');
  const [channels, setChannels] = useState<string[]>(['whatsapp', 'email']);

  if (!engine) return null;
  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';

  /* Pre-Arrival Timeline tab is only meaningful for the Arrival engine. */
  const isArrival = engine.name === 'Arrival';
  const tabs = [
    { id: 'offers' as const,    label: 'Offers'              },
    ...(isArrival ? [{ id: 'timeline' as const, label: 'Pre-Arrival Timeline' }] : []),
    { id: 'templates' as const, label: 'WhatsApp Templates'  },
    { id: 'services' as const,  label: 'Mass Send Services'  },
  ];

  /* If user lands on a tab that no longer exists for this engine, fall back. */
  const currentTabValid = tabs.some(t => t.id === activeTab);
  if (!currentTabValid && activeTab === 'timeline') {
    setTab('offers');
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-6">

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-surface-3 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-[13px] font-medium transition-all',
              activeTab === t.id ? 'bg-white text-strong shadow-sm' : 'text-subtle hover:text-muted',
            )}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Offers list ── */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-strong">{offers.length} offers configured</p>
            <button
              onClick={() => setShowAddOffer(true)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-colors"
              style={{ background: color }}
            >
              <Plus className="w-4 h-4" />
              Add offer
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  {['Name', 'Type', 'Condition', 'Daily limit', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-subtle uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {offers.map(offer => (
                  <tr key={offer.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-strong">{offer.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-muted bg-surface-3 px-2.5 py-1 rounded-md border border-brand-border">{offer.type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-muted">{offer.condition}</td>
                    <td className="px-5 py-3.5 text-[12px] text-muted tabular-nums">{offer.limit}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: o.status === 'active' ? 'paused' : 'active' } : o))}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors',
                          offer.status === 'active'
                            ? 'bg-brand-blue-50 text-brand-blue border border-brand-blue-light hover:bg-white'
                            : 'bg-surface-3 text-subtle border border-brand-border hover:bg-white',
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', offer.status === 'active' ? 'bg-brand-blue' : 'bg-brand-gray')} />
                        {offer.status === 'active' ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setOffers(prev => prev.filter(o => o.id !== offer.id))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Send window + channels */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
            <p className="text-[13px] font-semibold text-strong">Send Windows</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Pre-arrival',  placeholder: 'days before check-in' },
                { label: 'Post-stay',    placeholder: 'hours after check-out' },
              ].map(w => (
                <div key={w.label} className="flex items-center gap-2">
                  <span className="text-[12px] text-muted whitespace-nowrap">{w.label} —</span>
                  <input type="number" placeholder="3" className="w-16 h-8 px-2.5 rounded-lg border border-brand-border bg-surface-2 text-[13px] text-center focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white" />
                  <span className="text-[12px] text-subtle">{w.placeholder}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-muted mb-2.5">Send channels</p>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map(ch => {
                  const active = channels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setChannels(prev => active ? prev.filter(c => c !== ch.id) : [...prev, ch.id])}
                      className={cn(
                        'flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium border transition-all',
                        active ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-muted border-brand-border hover:border-brand-blue hover:text-brand-blue',
                      )}
                    >
                      {active && <Check className="w-3 h-3" />}
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pre-Arrival Timeline ── */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-brand-border p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[13px] font-semibold text-strong">Send schedule — days before check-in</p>
              <button
                onClick={() => setTimeline(prev => [...prev, { id: `t${Date.now()}`, days: 2, messageType: 'Informational', channel: 'email' }])}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium text-white transition-colors"
                style={{ background: color }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add point
              </button>
            </div>

            {/* Timeline visual */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-brand-border" />
              <div className="space-y-5">
                {timeline.sort((a, b) => b.days - a.days).map((point, idx) => (
                  <div key={point.id} className="relative flex items-start gap-4 pl-14">
                    {/* Dot on line */}
                    <div
                      className="absolute left-[18px] w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                      style={{ background: color }}
                    />
                    {/* Day badge */}
                    <div
                      className="absolute left-0 w-12 text-center text-[10px] font-bold rounded-md py-0.5"
                      style={{ background: `${color}18`, color }}
                    >
                      T−{point.days}d
                    </div>

                    <div className="flex-1 bg-surface-2 border border-brand-border rounded-xl p-4 flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] text-subtle mb-1">Days before</p>
                          <input
                            type="number"
                            value={point.days}
                            onChange={e => setTimeline(prev => prev.map(p => p.id === point.id ? { ...p, days: Number(e.target.value) } : p))}
                            className="w-full h-8 px-2.5 rounded-lg border border-brand-border bg-white text-[13px] text-center focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-subtle mb-1">Type</p>
                          <div className="relative">
                            <select
                              value={point.messageType}
                              onChange={e => setTimeline(prev => prev.map(p => p.id === point.id ? { ...p, messageType: e.target.value } : p))}
                              className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-brand-border bg-white text-[12px] appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                            >
                              {['Informational', 'Reminder', 'Preferences', 'Upsell'].map(t => <option key={t}>{t}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-subtle pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-subtle mb-1">Channel</p>
                          <div className="relative">
                            <select
                              value={point.channel}
                              onChange={e => setTimeline(prev => prev.map(p => p.id === point.id ? { ...p, channel: e.target.value } : p))}
                              className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-brand-border bg-white text-[12px] appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                            >
                              {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-subtle pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setTimeline(prev => prev.filter(p => p.id !== point.id))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Send conditions */}
            <div className="mt-6 pt-5 border-t border-border-soft space-y-2">
              <p className="text-[12px] font-semibold text-muted mb-3">Send conditions</p>
              {[
                'Only for confirmed reservations',
                'Do not send to returning guests (2+ visits)',
              ].map(cond => (
                <label key={cond} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-brand-blue" />
                  <span className="text-[13px] text-strong">{cond}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WhatsApp Templates ── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-strong">{WHATSAPP_TEMPLATES.length} templates</p>
            <button
              onClick={() => addToast({ type: 'success', title: 'Template editor opening…' })}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-colors"
              style={{ background: color }}
            >
              <Plus className="w-4 h-4" />
              Create template
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  {['Template name', 'Language', 'Category', 'Approval', 'Updated'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-subtle uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {WHATSAPP_TEMPLATES.map(tpl => (
                  <tr key={tpl.name} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-mono text-strong">{tpl.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-semibold text-muted bg-surface-3 px-2 py-0.5 rounded-md">{tpl.lang}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-muted capitalize">{tpl.category}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                        tpl.status === 'approved'
                          ? 'bg-brand-blue-50 text-brand-blue border-brand-blue-light'
                          : 'bg-surface-3 text-subtle border-brand-border',
                      )}>
                        {tpl.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-subtle">{tpl.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Mass Send Services ── */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {MASS_SERVICES.map(svc => (
              <div key={svc.name} className="bg-white rounded-2xl border border-brand-border p-5 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-strong">{svc.name}</p>
                  <p className={cn('text-[12px] mt-0.5', svc.connected ? 'text-brand-blue' : 'text-subtle')}>
                    {svc.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {svc.connected && (
                    <div
                      className="relative cursor-pointer"
                      style={{ width: 40, height: 22 }}
                    >
                      <div className="w-full h-full rounded-full bg-brand-blue" />
                      <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm" />
                    </div>
                  )}
                  {!svc.connected && (
                    <button
                      onClick={() => addToast({ type: 'info', title: `Connect ${svc.name}` })}
                      className="h-8 px-3 rounded-lg text-[12px] font-medium text-brand-blue bg-brand-blue-50 hover:bg-brand-blue-50 transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => addToast({ type: 'info', title: 'Custom connector form' })}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-brand-border text-[13px] text-subtle hover:border-brand-blue-light hover:text-brand-blue transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Connect new service
          </button>
        </div>
      )}
    </div>
  );
}
