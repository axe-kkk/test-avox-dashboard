import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, X, Plus,
} from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { conversationsTrend } from '../../data/mock/analytics';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';
import { getEngineSpec } from './lib/engineSpec';

type Period = 'today' | '7d' | '30d' | '90d' | 'custom';

const PERIOD_LABELS: Record<Period, string> = {
  today:  'Today',
  '7d':   'Last 7 days',
  '30d':  'Last 30 days',
  '90d':  'Last 90 days',
  custom: 'Custom range',
};

const TOP_INTENTS = [
  { intent: 'general_inquiry',     count: 412, share: 30, delta:  3 },
  { intent: 'booking_inquiry',     count: 298, share: 22, delta:  8 },
  { intent: 'upsell_opportunity',  count: 184, share: 13, delta:  4 },
  { intent: 'spa_inquiry',         count: 126, share:  9, delta: -2 },
  { intent: 'cancellation',        count:  98, share:  7, delta: -5 },
  { intent: 'guest_complaint',     count:  47, share:  3, delta:  1 },
];

const UNANSWERED = [
  { id: 'u1', question: 'Do you have an EV charger?',                     count: 12, lastSeen: '2 hours ago' },
  { id: 'u2', question: 'Can I bring my emotional support dog?',           count:  9, lastSeen: '6 hours ago' },
  { id: 'u3', question: 'Is there a kosher kitchen option?',               count:  7, lastSeen: '1 day ago'  },
  { id: 'u4', question: 'Do you accept American Express Centurion card?', count:  6, lastSeen: '1 day ago'  },
  { id: 'u5', question: 'Can the spa accommodate a wheelchair?',           count:  5, lastSeen: '2 days ago' },
];

const CHANNEL_BREAKDOWN = [
  { channel: 'WhatsApp',  count: 524, color: '#2355A7' },
  { channel: 'Email',     count: 312, color: '#5C6370' },
  { channel: 'Web',       count: 198, color: '#8B9299' },
  { channel: 'Messenger', count: 145, color: '#BED4F6' },
  { channel: 'Other',     count:  88, color: '#C4C8CF' },
];

const RESOLUTION_PIE = [
  { label: 'Resolved',   value: 1456, color: '#2355A7' },
  { label: 'Escalated',  value:  198, color: '#8B9299' },
  { label: 'Abandoned',  value:   76, color: '#C4C8CF' },
];

export function EngineAnalyticsPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [period, setPeriod] = useState<Period>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [unanswered, setUnanswered] = useState(UNANSWERED);

  if (!engine) return null;
  const spec = getEngineSpec(engine.name);

  const periodLabel = period === 'custom' && customFrom && customTo
    ? `${customFrom} → ${customTo}`
    : PERIOD_LABELS[period];

  const totalConv    = engine.handledConversations;
  const totalActions = engine.actionsToday * 30;

  const kpis = [
    { label: 'Conversations',      value: totalConv.toLocaleString('en-US'),                 delta: 12 },
    { label: 'Resolution rate',    value: `${(engine.resolutionRate * 100).toFixed(0)}%`,    delta:  4 },
    { label: 'Actions',            value: totalActions.toLocaleString('en-US'),               delta:  8 },
    { label: 'CONNECTS spent',     value: '4.2k',                                              delta: 18 },
    { label: spec.keyMetric.label, value: spec.keyMetric.value,                                delta: spec.keyMetric.delta, accent: true },
  ];

  const totalResolution = RESOLUTION_PIE.reduce((s, x) => s + x.value, 0);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-5 space-y-4">

      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1">Analytics</p>
          <h2 className="text-[15px] font-semibold text-strong">Performance · {periodLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={period}
              onChange={e => {
                const v = e.target.value as Period;
                setPeriod(v);
                if (v === 'custom') setShowCustom(true);
              }}
              className="h-9 pl-3 pr-9 rounded-xl border border-brand-border bg-white text-[12px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
            >
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI cards — 5th card is the engine-specific keyMetric */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map(kpi => {
          const TrendIcon = kpi.delta > 0 ? TrendingUp : kpi.delta < 0 ? TrendingDown : Minus;
          const positive = kpi.delta > 0;
          return (
            <div
              key={kpi.label}
              className={cn(
                'rounded-xl border p-3.5',
                kpi.accent ? 'bg-brand-blue-50 border-brand-blue-light' : 'bg-white border-brand-border',
              )}
            >
              <p
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-[0.12em] mb-2 leading-tight',
                  kpi.accent ? 'text-brand-blue' : 'text-subtle',
                )}
              >{kpi.label}</p>
              <p
                className={cn(
                  'text-[20px] font-semibold tabular-nums leading-none',
                  kpi.accent ? 'text-brand-blue' : 'text-strong',
                )}
                style={{ fontFamily: "'Azeret Mono', monospace" }}
              >{kpi.value}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendIcon className={cn('w-3 h-3', positive ? 'text-brand-blue' : 'text-brand-black')} />
                <span className={cn(
                  'text-[10px] font-semibold tabular-nums',
                  positive ? 'text-brand-blue' : 'text-brand-black',
                )}>
                  {kpi.delta > 0 ? '+' : ''}{kpi.delta}%
                </span>
                <span className="text-[10px] text-subtle ml-0.5">vs prev</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Volume chart */}
      <div className="bg-white rounded-2xl border border-brand-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1">
              {spec.keyMetric.label} trend
            </p>
            <p className="text-[12px] text-muted">Daily breakdown</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={conversationsTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="vol-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2355A7" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2355A7" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #EDEEF1', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)' }}
              cursor={{ stroke: '#2355A7', strokeWidth: 1, strokeDasharray: '4 2' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2355A7"
              fill="url(#vol-grad)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Channel + resolution breakdown */}
      <div className="grid grid-cols-2 gap-4">

        {/* Channel breakdown — bar chart */}
        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1">
            Conversations by channel
          </p>
          <p className="text-[12px] text-muted mb-4">Where guests reach us</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CHANNEL_BREAKDOWN} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="channel" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #EDEEF1', borderRadius: '12px', fontSize: '11px' }}
                cursor={{ fill: '#F6F7F9' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {CHANNEL_BREAKDOWN.map(c => (
                  <Cell key={c.channel} fill={c.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution donut */}
        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1">
            Resolution outcome
          </p>
          <p className="text-[12px] text-muted mb-4">Resolved · Escalated · Abandoned</p>
          <div className="grid grid-cols-[1fr_140px] items-center gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={RESOLUTION_PIE}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {RESOLUTION_PIE.map(r => <Cell key={r.label} fill={r.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #EDEEF1', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {RESOLUTION_PIE.map(r => {
                const pct = ((r.value / totalResolution) * 100).toFixed(0);
                return (
                  <div key={r.label} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="text-muted flex-1 truncate">{r.label}</span>
                    <span
                      className="text-strong font-semibold tabular-nums"
                      style={{ fontFamily: "'Azeret Mono', monospace" }}
                    >{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Intents + Unanswered tables */}
      <div className="grid grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">Top Intents</p>
            <p className="text-[12px] text-muted mt-0.5">What guests ask most</p>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-subtle uppercase tracking-wider">Intent</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-semibold text-subtle uppercase tracking-wider">Count</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-semibold text-subtle uppercase tracking-wider">Share</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-semibold text-subtle uppercase tracking-wider">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {TOP_INTENTS.map(t => {
                const positive = t.delta > 0;
                const TrendIcon = t.delta > 0 ? TrendingUp : t.delta < 0 ? TrendingDown : Minus;
                return (
                  <tr key={t.intent} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-2.5">
                      <span
                        className="text-[12px] text-strong font-semibold"
                        style={{ fontFamily: "'Azeret Mono', monospace" }}
                      >{t.intent}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="text-[12px] font-medium text-strong tabular-nums">
                        {t.count.toLocaleString('en-US')}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-12 h-1 bg-brand-border rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue" style={{ width: `${(t.share / 30) * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-muted tabular-nums w-7">{t.share}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums',
                          positive ? 'text-brand-blue' : 'text-brand-black',
                        )}
                      >
                        <TrendIcon className="w-3 h-3" />
                        {t.delta > 0 ? '+' : ''}{t.delta}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">Unanswered</p>
              <p className="text-[12px] text-muted mt-0.5">Questions the engine couldn't resolve</p>
            </div>
            <span className="text-[10px] font-semibold text-brand-blue bg-brand-blue-50 border border-brand-blue-light px-2 py-0.5 rounded-md tabular-nums">
              {unanswered.length} open
            </span>
          </div>
          <div className="divide-y divide-border-soft max-h-[300px] overflow-y-auto">
            {unanswered.length === 0 ? (
              <p className="text-[12px] text-subtle text-center py-8">All questions covered. 🎉</p>
            ) : unanswered.map(u => (
              <div key={u.id} className="flex items-start gap-3 px-5 py-2.5 hover:bg-surface-2 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-strong font-medium">{u.question}</p>
                  <p className="text-[10px] text-subtle mt-0.5">
                    Asked {u.count} times · last {u.lastSeen}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUnanswered(prev => prev.filter(x => x.id !== u.id));
                    addToast({ type: 'success', title: 'Q&A draft created — review in Knowledge Base' });
                  }}
                  className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg bg-brand-blue-50 border border-brand-blue-light text-brand-blue text-[11px] font-semibold hover:bg-white transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <Plus className="w-3 h-3" />
                  Create Q&A
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom range modal */}
      {showCustom && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setShowCustom(false)} aria-label="Close" />
          <div className="relative w-[420px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-strong">Custom date range</h3>
              <button onClick={() => setShowCustom(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">From</p>
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">To</p>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowCustom(false); setPeriod('30d'); }}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={() => {
                  if (!customFrom || !customTo) { addToast({ type: 'warning', title: 'Pick both dates' }); return; }
                  setShowCustom(false);
                }}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
