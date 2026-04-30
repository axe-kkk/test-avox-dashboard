import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { AnalyticsShell } from '../components/AnalyticsShell';
import { KpiCard } from '../components/KpiCard';
import { SectionCard, chartTooltipStyle, axisTick } from '../components/SectionCard';
import { type Period, loadHeatmap, loadHourly } from '../lib/mockData';
import { cn } from '../../../utils';

export function LoadPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [selectedDay, setSelectedDay] = useState<string>('Fri');

  const max = useMemo(() => {
    let m = 0;
    for (const row of loadHeatmap) for (const v of row.hours) if (v > m) m = v;
    return m;
  }, []);

  const peakCell = useMemo(() => {
    let best = { day: '', hour: 0, value: 0 };
    for (const row of loadHeatmap) {
      row.hours.forEach((v, h) => {
        if (v > best.value) best = { day: row.day, hour: h, value: v };
      });
    }
    return best;
  }, []);

  /* Single-hue progression — soft floor (0.06) so even small values are visible. */
  const cellBg = (v: number) => {
    if (v === 0) return '#F4F5F7';
    const r = Math.min(1, v / max);
    const opacity = 0.06 + r * 0.94;
    return `rgba(35, 85, 167, ${opacity.toFixed(2)})`;
  };

  const LEGEND_STEPS = [0.05, 0.25, 0.45, 0.65, 0.85, 1];

  return (
    <AnalyticsShell
      eyebrow="Team"
      title="Load"
      subtitle="When the system is busiest — and how AI absorbs the peaks."
      period={period}
      onPeriodChange={setPeriod}
    >
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Peak load (concurrent)"   value="47"   delta={14} />
        <KpiCard label="Busiest day"               value="Fri"  hint={`${peakCell.value} actions`} />
        <KpiCard label="Busiest hour"              value="14:00" hint="midweek" />
        <KpiCard label="AI rate at peak"           value="62%"  delta={4}  accent />
        <KpiCard label="Avg AI response at peak"   value="12s"  delta={-9} invertDelta />
      </div>

      <SectionCard
        title="Heatmap"
        subtitle="Click a row to see the hourly breakdown for that day"
      >
        <div className="space-y-1.5">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: '48px repeat(24, minmax(0, 1fr))' }}
          >
            <div />
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className={cn(
                  'text-[10px] font-medium tabular-nums text-center',
                  h % 3 === 0 ? 'text-subtle' : 'text-faint',
                )}
              >
                {h % 3 === 0 ? h.toString().padStart(2, '0') : ''}
              </div>
            ))}
          </div>

          {loadHeatmap.map(row => {
            const isSelected = selectedDay === row.day;
            return (
              <div
                key={row.day}
                onClick={() => setSelectedDay(row.day)}
                className="grid gap-1 items-center cursor-pointer group"
                style={{ gridTemplateColumns: '48px repeat(24, minmax(0, 1fr))' }}
              >
                <div className={cn(
                  'text-[11px] font-semibold pr-3 text-right transition-colors',
                  isSelected ? 'text-brand-blue' : 'text-muted group-hover:text-strong',
                )}>
                  {row.day}
                </div>
                {row.hours.map((v, h) => (
                  <div
                    key={h}
                    title={`${row.day} ${h.toString().padStart(2, '0')}:00 — ${v} actions`}
                    className={cn(
                      'aspect-square rounded-[5px] transition-all',
                      isSelected
                        ? 'outline outline-1 outline-brand-blue/40'
                        : 'group-hover:outline group-hover:outline-1 group-hover:outline-brand-border',
                    )}
                    style={{ background: cellBg(v) }}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-brand-border">
          <span className="text-[11px] font-semibold text-subtle">Less</span>
          <div className="flex items-center gap-1">
            {LEGEND_STEPS.map(r => (
              <span
                key={r}
                className="w-5 h-3 rounded-[3px]"
                style={{
                  background: r === 0.05 ? '#F4F5F7' : `rgba(35, 85, 167, ${(0.06 + r * 0.94).toFixed(2)})`,
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-subtle">More</span>
        </div>
      </SectionCard>

      <SectionCard
        title={`Hourly breakdown — ${selectedDay}`}
        subtitle="Bars: total actions · Line: AI resolution rate"
      >
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={loadHourly} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F7" vertical={false} />
            <XAxis dataKey="hour" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left"  tick={axisTick} axisLine={false} tickLine={false} width={32} />
            <YAxis yAxisId="right" orientation="right" tick={axisTick} axisLine={false} tickLine={false} width={32} tickFormatter={v => `${v}%`} />
            <Tooltip {...chartTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#5C6370' }} iconSize={8} iconType="circle" />
            <Bar yAxisId="left"  dataKey="total" name="Actions" fill="#C4C8CF" radius={[6, 6, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="aiRate" name="AI rate" stroke="#2355A7" strokeWidth={2.5} dot={{ fill: '#2355A7', r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Hourly load detail">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border">
              {['Hour', 'Total actions', 'AI', 'Operators', 'Avg queue', 'AI %'].map((h, i) => (
                <th key={h} className={`py-2.5 text-[11px] font-semibold text-subtle ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {loadHourly.map(h => (
              <tr key={h.hour} className="hover:bg-surface-2 transition-colors">
                <td className="py-2 text-[12px] text-strong tabular-nums font-medium">{h.hour}</td>
                <td className="py-2 text-[12px] text-strong tabular-nums text-right">{h.total}</td>
                <td className="py-2 text-[12px] text-muted tabular-nums text-right">{h.ai}</td>
                <td className="py-2 text-[12px] text-muted tabular-nums text-right">{h.agents}</td>
                <td className="py-2 text-[12px] text-muted tabular-nums text-right">{h.queue}s</td>
                <td className="py-2 text-[12px] text-brand-blue tabular-nums font-semibold text-right">{h.aiRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </AnalyticsShell>
  );
}
