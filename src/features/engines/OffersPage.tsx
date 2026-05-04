import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Check, X, Edit2, MessageSquare } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';
import { Switch } from '../../components/ui/Switch';
import { Select } from '../../components/ui/Select';
import { getEngineSpec } from './lib/engineSpec';

/* Inbox-style monochrome — every engine uses the brand-blue accent. */
const ENGINE_COLORS: Record<string, string> = {
  Conversion: '#2355A7', Reservation: '#2355A7', Upsell: '#2355A7',
  Arrival: '#2355A7', Concierge: '#2355A7', Recovery: '#2355A7', Reputation: '#2355A7',
};

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
  description: string;
  cost: string;
  category: string;
  condition: string;
  limit: string;
  validFrom: string;
  validTo: string;
  season: 'all' | 'high' | 'low';
  pmsCheck: boolean;
  status: 'active' | 'paused';
}

interface WhatsAppTemplate {
  name: string;
  lang: string;
  category: 'marketing' | 'utility' | 'authentication';
  status: 'approved' | 'pending' | 'rejected';
  updated: string;
  header: string;
  body: string;
  footer: string;
  cta: string;
}

interface TimelinePoint {
  id: string;
  days: number;
  messageType: string;
  channel: string;
}

const MOCK_OFFERS: Offer[] = [
  { id: 'o1', name: 'Room Upgrade — Honeymoon',  type: 'Room upgrade',        description: 'Complimentary upgrade to suite for honeymooners.',           cost: '0',     category: 'Stay',       condition: 'Tag: Honeymoon',      limit: '5/day',  validFrom: '2026-04-01', validTo: '2026-12-31', season: 'all',  pmsCheck: true,  status: 'active' },
  { id: 'o2', name: 'Early Check-in 10:00 AM',   type: 'Early check-in',      description: '10am check-in for stays of 3 nights or more.',               cost: '40',    category: 'Stay',       condition: 'Arrival 3+ nights',   limit: '10/day', validFrom: '2026-01-01', validTo: '2026-12-31', season: 'all',  pmsCheck: true,  status: 'active' },
  { id: 'o3', name: 'Spa Sunday Package',        type: 'Spa package',         description: 'Sunday spa day with massage + sauna access.',                cost: '120',   category: 'Wellness',   condition: 'Weekend stay',        limit: '8/day',  validFrom: '2026-04-01', validTo: '2026-09-30', season: 'high', pmsCheck: false, status: 'paused' },
  { id: 'o4', name: 'Airport Transfer Offer',    type: 'Airport transfer',    description: 'Free luxury sedan transfer for first-time guests.',          cost: '0',     category: 'Transfer',   condition: 'First-time guest',    limit: '20/day', validFrom: '2026-01-01', validTo: '2026-12-31', season: 'all',  pmsCheck: false, status: 'active' },
];

const EMPTY_OFFER: Offer = {
  id: '', name: '', type: 'Room upgrade', description: '', cost: '', category: 'Stay',
  condition: '', limit: '5/day', validFrom: '', validTo: '', season: 'all',
  pmsCheck: true, status: 'active',
};

const MOCK_TIMELINE: TimelinePoint[] = [
  { id: 't1', days: 7,  messageType: 'Informational',    channel: 'email'    },
  { id: 't2', days: 3,  messageType: 'Preferences',      channel: 'whatsapp' },
  { id: 't3', days: 1,  messageType: 'Reminder',         channel: 'whatsapp' },
];

const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  { name: 'pre_arrival_welcome',  lang: 'EN', category: 'utility',     status: 'approved', updated: 'Apr 18, 2026', header: 'Welcome to {{property_name}}', body: 'Hi {{1}}, your check-in on {{2}} is confirmed. Reply if you need anything.', footer: 'AVOX Concierge', cta: 'View booking' },
  { name: 'upsell_room_upgrade',  lang: 'EN', category: 'marketing',   status: 'approved', updated: 'Apr 12, 2026', header: 'A little extra for your stay',    body: 'Hi {{1}}, want a Junior Suite upgrade for {{2}}? Limited rooms left.', footer: 'AVOX', cta: 'See upgrade' },
  { name: 'post_stay_review',     lang: 'EN', category: 'utility',     status: 'approved', updated: 'Apr 10, 2026', header: 'How was your stay?',              body: 'Hi {{1}}, thanks for staying with us. We\'d love your feedback.',      footer: 'AVOX Reputation', cta: 'Leave review' },
  { name: 'pre_arrival_de',       lang: 'DE', category: 'utility',     status: 'pending',  updated: 'Apr 21, 2026', header: 'Willkommen im {{property_name}}', body: 'Hallo {{1}}, dein Check-in am {{2}} ist bestätigt.',                   footer: 'AVOX', cta: 'Buchung ansehen' },
];

const EMPTY_TEMPLATE: WhatsAppTemplate = {
  name: '', lang: 'EN', category: 'utility', status: 'pending', updated: '',
  header: '', body: '', footer: '', cta: '',
};

const TEMPLATE_VARIABLES = [
  { token: '{{1}}', mapsTo: 'guest_name'      },
  { token: '{{2}}', mapsTo: 'check_in_date'   },
  { token: '{{3}}', mapsTo: 'room_type'       },
  { token: '{{4}}', mapsTo: 'reservation_id'  },
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

  const spec = engine ? getEngineSpec(engine.name) : null;

  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(WHATSAPP_TEMPLATES);
  const [timeline, setTimeline] = useState<TimelinePoint[]>(MOCK_TIMELINE);
  const [services, setServices] = useState(MASS_SERVICES);
  const [activeTab, setTab] = useState<'offers' | 'timeline' | 'templates' | 'services'>('offers');
  const [channels, setChannels] = useState<string[]>(spec?.defaultChannels ?? ['whatsapp', 'email']);

  /* Offer modal state */
  const [offerDraft, setOfferDraft] = useState<Offer | null>(null);
  const openNewOffer  = () => setOfferDraft({
    ...EMPTY_OFFER,
    type: spec?.offerTypes[0] ?? EMPTY_OFFER.type,
  });
  const openEditOffer = (o: Offer) => setOfferDraft({ ...o });
  const saveOffer = () => {
    if (!offerDraft) return;
    if (!offerDraft.name.trim()) { addToast({ type: 'warning', title: 'Name required' }); return; }
    if (offerDraft.id) {
      setOffers(prev => prev.map(o => o.id === offerDraft.id ? offerDraft : o));
      addToast({ type: 'success', title: 'Offer updated' });
    } else {
      const next = { ...offerDraft, id: `o${Date.now()}` };
      setOffers(prev => [...prev, next]);
      addToast({ type: 'success', title: 'Offer created' });
    }
    setOfferDraft(null);
  };

  /* Template modal state */
  const [tplDraft, setTplDraft] = useState<WhatsAppTemplate | null>(null);
  const openNewTemplate  = () => setTplDraft({ ...EMPTY_TEMPLATE });
  const openEditTemplate = (t: WhatsAppTemplate) => setTplDraft({ ...t });
  const saveTemplate = () => {
    if (!tplDraft) return;
    if (!tplDraft.name.trim()) { addToast({ type: 'warning', title: 'Template name required' }); return; }
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const exists = templates.some(t => t.name === tplDraft.name);
    if (exists) {
      setTemplates(prev => prev.map(t => t.name === tplDraft.name ? { ...tplDraft, updated: today } : t));
      addToast({ type: 'success', title: 'Template saved' });
    } else {
      setTemplates(prev => [...prev, { ...tplDraft, updated: today, status: 'pending' }]);
      addToast({ type: 'success', title: 'Template created — pending approval' });
    }
    setTplDraft(null);
  };

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
              onClick={openNewOffer}
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
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEditOffer(offer)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-brand-blue transition-colors"
                          title="Edit offer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setOffers(prev => prev.filter(o => o.id !== offer.id))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                          title="Delete offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                          <Select
                            size="sm"
                            className="w-full"
                            triggerClassName="!bg-white"
                            value={point.messageType}
                            onChange={v => setTimeline(prev => prev.map(p => p.id === point.id ? { ...p, messageType: v } : p))}
                            options={['Informational', 'Reminder', 'Preferences', 'Upsell']}
                          />
                        </div>
                        <div>
                          <p className="text-[10px] text-subtle mb-1">Channel</p>
                          <Select
                            size="sm"
                            className="w-full"
                            triggerClassName="!bg-white"
                            value={point.channel}
                            onChange={v => setTimeline(prev => prev.map(p => p.id === point.id ? { ...p, channel: v } : p))}
                            options={CHANNELS.map(c => ({ value: c.id, label: c.label }))}
                          />
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
            <p className="text-[13px] font-semibold text-strong">{templates.length} templates</p>
            <button
              onClick={openNewTemplate}
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
                  {['Template name', 'Language', 'Category', 'Approval', 'Updated', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-subtle uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {templates.map(tpl => (
                  <tr key={tpl.name} className="hover:bg-surface-2 transition-colors cursor-pointer" onClick={() => openEditTemplate(tpl)}>
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
                          : tpl.status === 'rejected'
                            ? 'bg-surface-3 text-brand-black border-brand-border'
                            : 'bg-surface-3 text-subtle border-brand-border',
                      )}>
                        {tpl.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-subtle">{tpl.updated}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); openEditTemplate(tpl); }}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-brand-blue transition-colors"
                        title="Edit template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
            {services.map(svc => (
              <div key={svc.name} className="bg-white rounded-2xl border border-brand-border p-5 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-strong">{svc.name}</p>
                  <p className={cn('text-[12px] mt-0.5', svc.connected ? 'text-brand-blue' : 'text-subtle')}>
                    {svc.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {svc.connected ? (
                    <Switch
                      checked
                      onChange={() => setServices(prev => prev.map(s => s.name === svc.name ? { ...s, connected: false } : s))}
                    />
                  ) : (
                    <button
                      onClick={() => setServices(prev => prev.map(s => s.name === svc.name ? { ...s, connected: true } : s))}
                      className="h-8 px-3 rounded-lg text-[12px] font-medium text-brand-blue bg-brand-blue-50 border border-brand-blue-light hover:bg-white transition-colors"
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

      {/* ═════════════════════════════════════════════════
         Offer Add/Edit modal
      ═════════════════════════════════════════════════ */}
      {offerDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setOfferDraft(null)} aria-label="Close" />
          <div className="relative w-[640px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">
                  {offerDraft.id ? 'Edit offer' : 'New offer'}
                </p>
                <h3 className="text-[16px] font-semibold text-strong">
                  {offerDraft.id ? offerDraft.name || 'Untitled offer' : 'Configure a new offer'}
                </h3>
              </div>
              <button onClick={() => setOfferDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Name + type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Name</p>
                  <input
                    value={offerDraft.name}
                    onChange={e => setOfferDraft({ ...offerDraft, name: e.target.value })}
                    placeholder="e.g. Spa Sunday Package"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Type</p>
                  <Select
                    className="w-full"
                    triggerClassName="!text-[13px]"
                    value={offerDraft.type}
                    onChange={v => setOfferDraft({ ...offerDraft, type: v })}
                    options={spec?.offerTypes ?? []}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Description for guest</p>
                <textarea
                  value={offerDraft.description}
                  onChange={e => setOfferDraft({ ...offerDraft, description: e.target.value })}
                  rows={2}
                  placeholder="One-line pitch the engine will paraphrase…"
                  className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>

              {/* Cost + category + limit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Cost (€)</p>
                  <input
                    type="number"
                    value={offerDraft.cost}
                    onChange={e => setOfferDraft({ ...offerDraft, cost: e.target.value })}
                    placeholder="0"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Category</p>
                  <input
                    value={offerDraft.category}
                    onChange={e => setOfferDraft({ ...offerDraft, category: e.target.value })}
                    placeholder="Stay, F&B, Wellness…"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Daily limit</p>
                  <input
                    value={offerDraft.limit}
                    onChange={e => setOfferDraft({ ...offerDraft, limit: e.target.value })}
                    placeholder="5/day"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
              </div>

              {/* Validity dates + season */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Valid from</p>
                  <input
                    type="date"
                    value={offerDraft.validFrom}
                    onChange={e => setOfferDraft({ ...offerDraft, validFrom: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Valid to</p>
                  <input
                    type="date"
                    value={offerDraft.validTo}
                    onChange={e => setOfferDraft({ ...offerDraft, validTo: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Season</p>
                  <Select
                    className="w-full"
                    triggerClassName="!text-[13px]"
                    value={offerDraft.season}
                    onChange={v => setOfferDraft({ ...offerDraft, season: v as Offer['season'] })}
                    options={[
                      { value: 'all',  label: 'All year' },
                      { value: 'high', label: 'High season' },
                      { value: 'low',  label: 'Low season' },
                    ]}
                  />
                </div>
              </div>

              {/* Targeting condition */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Targeting condition</p>
                <input
                  value={offerDraft.condition}
                  onChange={e => setOfferDraft({ ...offerDraft, condition: e.target.value })}
                  placeholder="Tag: Honeymoon, or Stay >= 3 nights…"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>

              {/* PMS check toggle */}
              <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-brand-border bg-surface-2 p-3">
                <Switch
                  checked={offerDraft.pmsCheck}
                  onChange={v => setOfferDraft({ ...offerDraft, pmsCheck: v })}
                />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-strong">Check availability via PMS</p>
                  <p className="text-[11px] text-subtle mt-0.5 leading-relaxed">
                    Engine confirms inventory in Cloudbeds before pitching this offer.
                  </p>
                </div>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setOfferDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveOffer}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >{offerDraft.id ? 'Save changes' : 'Create offer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════
         WhatsApp Template editor (with live preview)
      ═════════════════════════════════════════════════ */}
      {tplDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setTplDraft(null)} aria-label="Close" />
          <div className="relative w-[860px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">
                  {tplDraft.updated ? 'Edit template' : 'New template'}
                </p>
                <h3 className="text-[16px] font-semibold text-strong">
                  {tplDraft.name || 'Untitled template'}
                </h3>
              </div>
              <button onClick={() => setTplDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-[1fr_320px]">
              {/* Editor */}
              <div className="px-6 py-5 space-y-4 border-r border-brand-border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Name</p>
                    <input
                      value={tplDraft.name}
                      onChange={e => setTplDraft({ ...tplDraft, name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                      placeholder="snake_case_name"
                      className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Language</p>
                    <Select
                      className="w-full"
                      triggerClassName="!text-[13px]"
                      value={tplDraft.lang}
                      onChange={v => setTplDraft({ ...tplDraft, lang: v })}
                      options={['EN', 'DE', 'FR', 'ES', 'IT', 'RU']}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Category</p>
                  <div className="flex gap-2">
                    {(['marketing', 'utility', 'authentication'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => setTplDraft({ ...tplDraft, category: c })}
                        className={cn(
                          'h-8 px-3 rounded-lg text-[11px] font-semibold border transition-colors capitalize',
                          tplDraft.category === c
                            ? 'bg-brand-blue text-white border-brand-blue'
                            : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                        )}
                      >{c}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Header</p>
                  <input
                    value={tplDraft.header}
                    onChange={e => setTplDraft({ ...tplDraft, header: e.target.value })}
                    placeholder="Welcome to {{property_name}}"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Body</p>
                  <textarea
                    value={tplDraft.body}
                    onChange={e => setTplDraft({ ...tplDraft, body: e.target.value })}
                    rows={4}
                    placeholder="Hi {{1}}, your check-in on {{2}} is confirmed."
                    className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Footer (optional)</p>
                    <input
                      value={tplDraft.footer}
                      onChange={e => setTplDraft({ ...tplDraft, footer: e.target.value })}
                      placeholder="AVOX Concierge"
                      className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Button (CTA)</p>
                    <input
                      value={tplDraft.cta}
                      onChange={e => setTplDraft({ ...tplDraft, cta: e.target.value })}
                      placeholder="View booking"
                      className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    />
                  </div>
                </div>

                {/* Variable mapping */}
                <div className="rounded-xl border border-brand-border bg-surface-2 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-2.5">
                    Variable mapping
                  </p>
                  <div className="space-y-1.5">
                    {TEMPLATE_VARIABLES.map(v => (
                      <div key={v.token} className="flex items-center justify-between text-[12px]">
                        <span
                          className="text-brand-blue font-semibold"
                        >{v.token}</span>
                        <span className="text-subtle">→</span>
                        <span
                          className="text-muted font-medium"
                        >{v.mapsTo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-surface-2 px-5 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-3">
                  WhatsApp preview
                </p>
                <div className="rounded-2xl bg-[#E5DDD5] p-3 min-h-[280px]">
                  <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm shadow-sm p-3 max-w-[90%]">
                    {tplDraft.header && (
                      <p className="text-[12px] font-bold text-brand-black mb-1.5">{tplDraft.header}</p>
                    )}
                    <p className="text-[12px] text-brand-black whitespace-pre-line leading-relaxed">
                      {tplDraft.body || <span className="text-subtle italic">Body preview…</span>}
                    </p>
                    {tplDraft.footer && (
                      <p className="text-[10px] text-strong/60 mt-2">{tplDraft.footer}</p>
                    )}
                    <p className="text-[9px] text-strong/50 text-right mt-1.5 tabular-nums">14:32 ✓✓</p>
                  </div>
                  {tplDraft.cta && (
                    <button className="mt-2 w-[90%] h-8 rounded-2xl bg-white text-[12px] font-semibold text-[#075E54] border border-brand-border flex items-center justify-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      {tplDraft.cta}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-subtle mt-3 leading-relaxed">
                  Variables show as raw <code className="font-mono text-brand-blue">{'{{N}}'}</code> placeholders here.
                  At runtime they are substituted with the values mapped above.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setTplDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveTemplate}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >{tplDraft.updated ? 'Save changes' : 'Submit for approval'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
