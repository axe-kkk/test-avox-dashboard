import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';
import { AnalyticsShell } from '../components/AnalyticsShell';
import { KpiCard } from '../components/KpiCard';
import { SectionCard, chartTooltipStyle } from '../components/SectionCard';
import { Select } from '../components/Select';
import { type Period, departments, deptSplitOrigin, deptSplitState } from '../lib/mockData';

export function DepartmentsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const visible = deptFilter === 'all' ? departments : departments.filter(d => d.id === deptFilter);
  const totalOrigin = deptSplitOrigin.reduce((s, x) => s + x.value, 0);
  const totalState  = deptSplitState.reduce((s, x) => s + x.value, 0);

  return (
    <AnalyticsShell
      eyebrow="Team"
      title="Departments"
      subtitle="Workload and quality metrics across hotel departments."
      period={period}
      onPeriodChange={setPeriod}
      rightSlot={
        <Select
          prefix="Department"
          value={deptFilter}
          align="right"
          width={220}
          options={[
            { value: 'all', label: 'All departments' },
            ...departments.map(d => ({ value: d.id, label: d.name })),
          ]}
          onChange={setDeptFilter}
        />
      }
    >
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Total conversations"  value="2,032" delta={6} />
        <KpiCard label="Active today"          value="64"   delta={2} />
        <KpiCard label="Avg per day"           value="8.4"  delta={4} />
        <KpiCard label="Avg response time"     value="1m 06s" delta={-8} invertDelta accent />
        <KpiCard label="Avg CSAT"              value="4.6"  delta={2} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <SectionCard title="Escalated from AI vs Direct" subtitle="Origin of department workload">
          <div className="grid grid-cols-[1fr_180px] items-center gap-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptSplitOrigin} dataKey="value" nameKey="label" innerRadius={56} outerRadius={88} paddingAngle={2} strokeWidth={0}>
                  {deptSplitOrigin.map(s => <Cell key={s.label} fill={s.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {deptSplitOrigin.map(s => {
                const pct = ((s.value / totalOrigin) * 100).toFixed(1);
                return (
                  <div key={s.label}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-[11px] text-muted">{s.label}</span>
                    </div>
                    <p className="text-[16px] font-semibold text-strong tabular-nums leading-none">
                      {pct}<span className="text-[11px] text-subtle">%</span>
                    </p>
                    <p className="text-[10px] text-subtle mt-1 tabular-nums">{s.value.toLocaleString()} conversations</p>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Resolved vs Open" subtitle="State of conversations">
          <div className="grid grid-cols-[1fr_180px] items-center gap-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptSplitState} dataKey="value" nameKey="label" innerRadius={56} outerRadius={88} paddingAngle={2} strokeWidth={0}>
                  {deptSplitState.map(s => <Cell key={s.label} fill={s.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {deptSplitState.map(s => {
                const pct = ((s.value / totalState) * 100).toFixed(1);
                return (
                  <div key={s.label}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-[11px] text-muted">{s.label}</span>
                    </div>
                    <p className="text-[16px] font-semibold text-strong tabular-nums leading-none">
                      {pct}<span className="text-[11px] text-subtle">%</span>
                    </p>
                    <p className="text-[10px] text-subtle mt-1 tabular-nums">{s.value.toLocaleString()} conversations</p>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Department breakdown">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border">
              {['Department', 'Conversations', 'Avg response', 'Avg resolution', 'CSAT'].map((h, i) => (
                <th key={h} className={`py-2.5 text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {visible.map(d => (
              <tr key={d.id} className="hover:bg-surface-2 transition-colors">
                <td className="py-2.5 text-[12px] text-strong font-medium">{d.name}</td>
                <td className="py-2.5 text-[12px] text-strong tabular-nums text-right">{d.conversations.toLocaleString()}</td>
                <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">{d.response}</td>
                <td className="py-2.5 text-[12px] text-muted tabular-nums text-right">{d.resolution}</td>
                <td className="py-2.5 text-right">
                  <span className="inline-flex items-center gap-1 text-[12px] text-strong font-semibold tabular-nums">
                    <Star className="w-3 h-3 fill-brand-blue text-brand-blue" />
                    {d.csat}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </AnalyticsShell>
  );
}
