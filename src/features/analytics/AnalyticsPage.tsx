import { useState } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import {
  conversationsTrend,
  revenueTrend,
  channelVolume,
  enginePerformance,
  satisfactionDistribution,
  guestSources,
} from '../../data/mock/analytics';
import { useApp } from '../../app/AppContext';
import { formatCurrency, cn } from '../../utils';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const analyticsTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'engines', label: 'Engines' },
  { id: 'channels', label: 'Channels' },
  { id: 'guests', label: 'Guest Insights' },
];

const periods = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'];

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#0ea5e9', '#ec4899', '#8b5cf6', '#10b981'];

const chartTooltipStyle = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)',
  },
};

function MetricCard({ label, value, change, formatter = (v: number) => v.toLocaleString() }: {
  label: string;
  value: number;
  change: number;
  formatter?: (v: number) => string;
}) {
  const positive = change >= 0;
  return (
    <Card>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{formatter(value)}</p>
      <div className="flex items-center gap-1 mt-1.5">
        {positive ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
        <span className={cn('text-xs font-medium', positive ? 'text-emerald-600' : 'text-rose-600')}>
          {positive ? '+' : ''}{change}% vs prev period
        </span>
      </div>
    </Card>
  );
}

export function AnalyticsPage() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('Last 30 days');

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Performance insights across all engines, channels, and guests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  p === period ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => addToast({ type: 'info', title: 'Export started', message: 'PDF report will be ready in a moment' })}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button size="sm" variant="outline" onClick={() => addToast({ type: 'success', title: 'Report scheduled', message: 'Weekly PDF will be emailed every Monday' })}>
            <Calendar className="w-3.5 h-3.5" /> Schedule Report
          </Button>
        </div>
      </div>

      <Tabs tabs={analyticsTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Total Conversations" value={1547} change={12} />
            <MetricCard label="AI Resolution Rate" value={89} change={3} formatter={v => `${v}%`} />
            <MetricCard label="Avg Response Time" value={82} change={-14} formatter={v => `${v}s`} />
            <MetricCard label="Upsell Revenue" value={47640} change={18} formatter={v => formatCurrency(v)} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-[1fr_1fr] gap-5">
            <Card>
              <CardHeader title="Conversation Volume" subtitle="AI handled vs escalated" />
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={conversationsTrend} {...chartTooltipStyle}>
                  <defs>
                    <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Area type="monotone" dataKey="value" name="Total" stroke="#6366f1" fill="url(#cg1)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="secondary" name="Escalated" stroke="#f43f5e" fill="url(#cg2)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <CardHeader title="Revenue Impact" subtitle="Upsell and booking revenue driven by AI" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueTrend} barSize={16}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip {...chartTooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="value" name="Total Revenue" fill="#6366f1" radius={[4,4,0,0]} />
                  <Bar dataKey="secondary" name="Upsell Revenue" fill="#22c55e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Satisfaction */}
          <div className="grid grid-cols-[360px_1fr] gap-5">
            <Card>
              <CardHeader title="Guest Satisfaction Distribution" />
              <div className="space-y-2">
                {satisfactionDistribution.map((item, i) => (
                  <div key={item.score} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-14">{item.score}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(item.count / 500) * 100}%`,
                          background: ['#22c55e', '#86efac', '#fbbf24', '#f97316', '#f43f5e'][i],
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Average Score</span>
                <span className="font-bold text-slate-900">4.51 / 5</span>
              </div>
            </Card>

            <Card>
              <CardHeader title="AI vs Human Handling Ratio" />
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={[{ value: 89 }, { value: 11 }]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill="#6366f1" />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">89%</p>
                    <p className="text-xs text-slate-500">Resolved by AI</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-500">11%</p>
                    <p className="text-xs text-slate-400">Human handoff</p>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>• 1,376 AI-only resolutions</p>
                    <p>• 171 escalated to agents</p>
                    <p>• Avg human response: 4m 12s</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ENGINES */}
      {activeTab === 'engines' && (
        <div className="space-y-5">
          <Card>
            <CardHeader title="Engine Performance Summary" subtitle="Actions, resolution rates, and revenue contribution" />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Engine', 'Total Actions', 'Resolved', 'Rate', 'Revenue Impact'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider first:pl-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enginePerformance.map(ep => (
                    <tr key={ep.engine} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-0 pr-4">
                        <span className="text-sm font-semibold text-slate-900">{ep.engine}</span>
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums font-medium text-slate-800">{ep.actions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-slate-600">{ep.resolved.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${ep.rate}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{ep.rate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {ep.revenue > 0 ? (
                          <span className="text-sm font-semibold text-emerald-700">{formatCurrency(ep.revenue)}</span>
                        ) : ep.revenue < 0 ? (
                          <span className="text-sm font-semibold text-rose-600">{formatCurrency(ep.revenue)}</span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Actions by Engine" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={enginePerformance} layout="vertical" barSize={20}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="engine" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="actions" name="Total Actions" fill="#6366f1" radius={[0,4,4,0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* CHANNELS */}
      {activeTab === 'channels' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Card>
              <CardHeader title="Message Volume by Channel" />
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={channelVolume} layout="vertical" barSize={18}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="channel" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="volume" name="Messages" radius={[0,4,4,0]}>
                    {channelVolume.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <CardHeader title="Channel Distribution" subtitle="Share of total messages" />
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={channelVolume} cx="50%" cy="50%" outerRadius={80} dataKey="volume" paddingAngle={2}>
                      {channelVolume.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {channelVolume.map(c => (
                    <div key={c.channel} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-xs text-slate-600">{c.channel}</span>
                      <span className="text-xs font-semibold text-slate-800 ml-auto pl-4">{c.volume.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* GUESTS */}
      {activeTab === 'guests' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="New Guests (30d)" value={142} change={8} />
            <MetricCard label="Returning Guests" value={312} change={4} />
            <MetricCard label="Avg Lifetime Value" value={18400} change={12} formatter={v => formatCurrency(v)} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card>
              <CardHeader title="Guest Sources" subtitle="Bookings by acquisition channel" />
              <div className="space-y-2">
                {guestSources.map((source, i) => (
                  <div key={source.source} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-slate-600 flex-1">{source.source}</span>
                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${(source.count / 500) * 100}%`, background: COLORS[i] }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-8 text-right">{source.count}</span>
                    <span className="text-xs text-slate-400 w-20 text-right">LTV {formatCurrency(source.ltv)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Satisfaction Score Trend" subtitle="Average score over time" />
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={[
                  { date: 'Feb', value: 4.1 }, { date: 'Mar', value: 4.3 }, { date: 'Apr', value: 4.5 },
                ]}>
                  <defs>
                    <linearGradient id="satGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3.5, 5]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Area type="monotone" dataKey="value" name="Avg Score" stroke="#22c55e" fill="url(#satGrad)" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
