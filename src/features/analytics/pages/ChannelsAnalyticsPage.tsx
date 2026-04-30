import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { AnalyticsShell } from '../components/AnalyticsShell';
import { KpiCard } from '../components/KpiCard';
import { SectionCard, chartTooltipStyle, axisTick } from '../components/SectionCard';
import { type Period, channelsAnalytics, channelsDaily } from '../lib/mockData';
import { formatCurrency } from '../../../utils';

export function ChannelsAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const totalActions = channelsAnalytics.reduce((s, c) => s + c.actions, 0);

  /* Parse response-time strings to seconds for the bar chart. */
  const responseTimeData = channelsAnalytics.map(c => {
    const m = c.avgResponse.match(/(\d+)m\s*(\d+)?s?/);
    const sOnly = c.avgResponse.match(/^(\d+)s$/);
    let seconds = 0;
    if (m) seconds = parseInt(m[1]) * 60 + (m[2] ? parseInt(m[2]) : 0);
    else if (sOnly) seconds = parseInt(sOnly[1]);
    return { channel: c.channel, seconds, label: c.avgResponse };
  }).sort((a, b) => a.seconds - b.seconds);

  const revenueData = [...channelsAnalytics].sort((a, b) => b.revenue - a.revenue);

  return (
    <AnalyticsShell
      eyebrow="Analytics"
      title="Channels"
      subtitle="How guests reach us — and what each channel returns."
      period={period}
      onPeriodChange={setPeriod}
    >
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Total actions" value={totalActions.toLocaleString()} delta={11} accent />
        {channelsAnalytics.slice(0, 4).map(c => (
          <KpiCard
            key={c.channel}
            label={c.channel}
            value={c.actions.toLocaleString()}
            hint={`${c.share}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {channelsAnalytics.slice(4).map(c => (
          <KpiCard
            key={c.channel}
            label={c.channel}
            value={c.actions.toLocaleString()}
            hint={`${c.share}%`}
          />
        ))}
      </div>

      <SectionCard title="Actions by channel — daily" subtitle="Multi-line view of channel activity">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={channelsDaily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" vertical={false} />
            <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={32} />
            <Tooltip {...chartTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#5C6370' }} iconSize={8} iconType="circle" />
            <Line type="monotone" dataKey="whatsapp"  name="WhatsApp"   stroke="#2355A7" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="webWidget" name="Web Widget" stroke="#0E1013" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="email"     name="Email"      stroke="#5C6370" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sms"       name="SMS"        stroke="#BED4F6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="telegram"  name="Telegram"   stroke="#C4C8CF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <div className="grid grid-cols-2 gap-5">
        <SectionCard title="Avg response time by channel" subtitle="Lower is better">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={responseTimeData} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => `${v}s`} />
              <YAxis dataKey="channel" type="category" tick={{ fontSize: 11, fill: '#5C6370' }} axisLine={false} tickLine={false} width={88} />
              <Tooltip {...chartTooltipStyle} formatter={(_v, _n, p: { payload?: { label?: string } }) => [p.payload?.label, 'Avg response']} />
              <Bar dataKey="seconds" fill="#2355A7" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Revenue attributed by channel" subtitle="Direct + upsell">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => `€${(Number(v)/1000).toFixed(0)}k`} />
              <YAxis dataKey="channel" type="category" tick={{ fontSize: 11, fill: '#5C6370' }} axisLine={false} tickLine={false} width={88} />
              <Tooltip {...chartTooltipStyle} formatter={(v) => [formatCurrency(Number(v)), 'Revenue']} />
              <Bar dataKey="revenue" fill="#0E1013" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Channel breakdown">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border">
              {['Channel', 'Actions', 'Conversations', 'Avg response', 'Revenue', 'Connects'].map((h, i) => (
                <th key={h} className={`py-2.5 text-[11px] font-semibold text-subtle ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {channelsAnalytics.map(c => (
              <tr key={c.channel} className="hover:bg-surface-2 transition-colors">
                <td className="py-2.5 text-[12px] text-strong font-medium">{c.channel}</td>
                <td className="py-2.5 text-[12px] text-strong tabular-nums text-right">{c.actions.toLocaleString()}</td>
                <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">{c.conversations.toLocaleString()}</td>
                <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">{c.avgResponse}</td>
                <td className="py-2.5 text-[12px] text-strong tabular-nums font-semibold text-right">{formatCurrency(c.revenue)}</td>
                <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">{c.connects.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </AnalyticsShell>
  );
}
