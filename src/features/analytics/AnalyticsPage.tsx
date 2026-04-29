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

const COLORS = ['#2355A7', '#BED4F6', '#0E1013', '#D1CFCF'];

const chartTooltipStyle = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #EDEEF1',
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
      <p className="text-[11px] text-[#8B9299] uppercase tracking-wider font-medium">{label}</p>
      <p
        className="text-[26px] font-semibold text-[#0E1013] tabular-nums leading-none mt-1 mb-2"
      >{formatter(value)}</p>
      <div className="flex items-center gap-1 mt-1.5">
        {positive ? <TrendingUp className="w-3 h-3 text-[#2355A7]" /> : <TrendingDown className="w-3 h-3 text-[#5C6370]" />}
        <span className={cn('text-xs font-medium', positive ? 'text-[#2355A7]' : 'text-[#5C6370]')}>
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
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Hero banner */}
      <Card className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#8B9299] uppercase tracking-[0.22em] mb-3">
              Performance insights · All engines
            </p>
            <h1
              className="text-[36px] font-semibold text-[#0E1013] leading-none tracking-tight"
            >
              Analytics
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#F6F7F9] rounded-xl p-1 border border-[#EDEEF1]">
              {periods.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors',
                    p === period ? 'bg-white text-[#2355A7] shadow-soft' : 'text-[#5C6370] hover:text-[#0E1013]',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToast({ type: 'info', title: 'Export started', message: 'PDF report will be ready in a moment' })}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        </div>
      </Card>

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
                      <stop offset="5%" stopColor="#2355A7" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2355A7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E1013" stopOpacity={0.10} />
                      <stop offset="95%" stopColor="#0E1013" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Area type="monotone" dataKey="value" name="Total" stroke="#2355A7" fill="url(#cg1)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="secondary" name="Escalated" stroke="#0E1013" fill="url(#cg2)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <CardHeader title="Revenue Impact" subtitle="Upsell and booking revenue driven by AI" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueTrend} barSize={16}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip {...chartTooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="value" name="Total Revenue" fill="#2355A7" radius={[4,4,0,0]} />
                  <Bar dataKey="secondary" name="Upsell Revenue" fill="#BED4F6" radius={[4,4,0,0]} />
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
                    <span className="text-xs text-[#5C6370] w-14">{item.score}</span>
                    <div className="flex-1 bg-[#F6F7F9] rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(item.count / 500) * 100}%`,
                          background: ['#2355A7', '#BED4F6', '#D1CFCF', '#5C6370', '#0E1013'][i],
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#0E1013] w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#EDEEF1] flex justify-between text-xs">
                <span className="text-[#5C6370]">Average Score</span>
                <span className="font-semibold text-[#0E1013] tabular-nums">4.51 / 5</span>
              </div>
            </Card>

            <Card>
              <CardHeader title="AI vs Human Handling Ratio" />
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={[{ value: 89 }, { value: 11 }]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill="#2355A7" />
                      <Cell fill="#D1CFCF" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <div>
                    <p className="text-[28px] font-semibold text-[#0E1013] tabular-nums leading-none">89%</p>
                    <p className="text-[12px] text-[#8B9299] mt-0.5">Resolved by AI</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-semibold text-[#8B9299] tabular-nums">11%</p>
                    <p className="text-xs text-[#8B9299]">Human handoff</p>
                  </div>
                  <div className="text-xs text-[#5C6370] space-y-1">
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
                  <tr className="border-b border-[#EDEEF1]">
                    {['Engine', 'Total Actions', 'Resolved', 'Rate', 'Revenue Impact'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider first:pl-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEEF1]">
                  {enginePerformance.map(ep => (
                    <tr key={ep.engine} className="hover:bg-[#F9F9F9] transition-colors">
                      <td className="py-3 pl-0 pr-4">
                        <span className="text-sm font-semibold text-[#0E1013]">{ep.engine}</span>
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums font-medium text-[#0E1013]">{ep.actions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-[#5C6370]">{ep.resolved.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#F6F7F9] rounded-full h-1.5">
                            <div className="bg-[#2355A7] h-1.5 rounded-full" style={{ width: `${ep.rate}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[#0E1013]">{ep.rate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {ep.revenue > 0 ? (
                          <span className="text-sm font-semibold text-[#2355A7]">{formatCurrency(ep.revenue)}</span>
                        ) : ep.revenue < 0 ? (
                          <span className="text-sm font-semibold text-[#0E1013]">{formatCurrency(ep.revenue)}</span>
                        ) : (
                          <span className="text-sm text-[#D1CFCF]">—</span>
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
                <XAxis type="number" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="engine" type="category" tick={{ fontSize: 11, fill: '#5C6370' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="actions" name="Total Actions" fill="#2355A7" radius={[0,4,4,0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#BED4F6" radius={[0,4,4,0]} />
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
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="channel" type="category" tick={{ fontSize: 11, fill: '#5C6370' }} axisLine={false} tickLine={false} width={72} />
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
                      <span className="text-xs text-[#5C6370]">{c.channel}</span>
                      <span className="text-xs font-semibold text-[#0E1013] ml-auto pl-4">{c.volume.toLocaleString()}</span>
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
                    <span className="text-xs text-[#5C6370] flex-1">{source.source}</span>
                    <div className="w-24 bg-[#F6F7F9] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${(source.count / 500) * 100}%`, background: COLORS[i] }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#0E1013] w-8 text-right">{source.count}</span>
                    <span className="text-xs text-[#8B9299] w-20 text-right">LTV {formatCurrency(source.ltv)}</span>
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
                      <stop offset="5%" stopColor="#2355A7" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2355A7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3.5, 5]} tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Area type="monotone" dataKey="value" name="Avg Score" stroke="#2355A7" fill="url(#satGrad)" strokeWidth={2.5} dot={{ fill: '#2355A7', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
