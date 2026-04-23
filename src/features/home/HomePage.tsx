import { useState } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, Bot,
  DollarSign, MessageSquare,
} from 'lucide-react';
import { StatusDot } from '../../components/ui/StatusDot';
import { mockEngines } from '../../data/mock/engines';
import { mockActivity } from '../../data/mock/activity';
import { summaryMetrics } from '../../data/mock/analytics';
import { formatDateTime, formatCurrency, cn } from '../../utils';
import type { EngineName } from '../../types';
import { Card } from '../../components/ui/Card';

const kpiCards = [
  {
    label: 'Conversations today',
    value: summaryMetrics.conversationsToday,
    change: summaryMetrics.conversationsChange,
    format: (v: number) => String(v),
    icon: MessageSquare,
  },
  {
    label: 'Pending escalations',
    value: summaryMetrics.pendingEscalations,
    change: summaryMetrics.escalationsChange,
    format: (v: number) => String(v),
    invertChange: true,
    icon: AlertTriangle,
  },
  {
    label: 'AI bookings handled',
    value: summaryMetrics.aiBookingsHandled,
    change: summaryMetrics.aiBookingsChange,
    format: (v: number) => String(v),
    icon: Bot,
  },
  {
    label: 'Upsell revenue',
    value: summaryMetrics.upsellRevenue,
    change: summaryMetrics.upsellRevenueChange,
    format: (v: number) => formatCurrency(v),
    icon: DollarSign,
  },
];

const engineFilters: ('all' | EngineName)[] = ['all', 'Conversion', 'Upsell', 'Recovery', 'Concierge'];

export function HomePage() {
  const [activityFilter, setActivityFilter] = useState<'all' | EngineName>('all');

  const filteredActivity = activityFilter === 'all'
    ? mockActivity
    : mockActivity.filter(a => a.engineName === activityFilter);

  return (
    <div className="p-6 space-y-5 max-w-[1440px] mx-auto">

      {/* ── Hero Banner ───────────────────────────────────── */}
      <Card className="px-8 py-7">
        <div className="grid grid-cols-[1fr_420px] gap-10 items-center">
          <div>
            <p className="text-[11px] font-medium text-[#8B9299] uppercase tracking-[0.22em] mb-4">
              Monday, 21 April 2026 · The Grand Meridian, Paris
            </p>
            <h1
              className="text-[44px] font-semibold text-[#0E1013] leading-[1.02] tracking-tight"
              style={{ fontFamily: "'Azeret Mono', monospace" }}
            >
              Operations
            </h1>
            <p className="text-[14px] text-[#5C6370] leading-relaxed mt-3 max-w-[56ch]">
              AI-first guest operations. Clear state, fewer escalations, and a calm control surface for the team.
            </p>
            <div className="mt-6 flex items-center gap-10">
              {[
                { label: 'Active engines', value: '6 / 7' },
                { label: 'Resolution rate', value: '89%' },
                { label: 'Uptime', value: '99.9%' },
              ].map(s => (
                <div key={s.label}>
                  <p
                    className="text-[18px] font-semibold text-[#0E1013] tabular-nums leading-none"
                    style={{ fontFamily: "'Azeret Mono', monospace" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[11px] text-[#8B9299] mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual placeholder (neutral, intentional) */}
          <div className="rounded-2xl bg-[#F9F9F9] border border-[#EDEEF1] p-6">
            <p className="text-[11px] font-medium text-[#8B9299] uppercase tracking-[0.22em] mb-3">
              Live snapshot
            </p>
            <div className="space-y-3">
              {[
                { k: 'Nominal systems', v: '6' },
                { k: 'Paused', v: '1' },
                { k: 'Open escalations', v: String(summaryMetrics.pendingEscalations) },
              ].map(row => (
                <div key={row.k} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#5C6370]">{row.k}</span>
                  <span className="text-[12px] font-semibold text-[#0E1013]" style={{ fontFamily: "'Azeret Mono', monospace" }}>
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-[#EDEEF1] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2355A7]" />
              <span className="text-[12px] text-[#5C6370]">All nominal</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── KPI Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map(card => {
          const Icon = card.icon;
          const positive = card.invertChange ? card.change <= 0 : card.change >= 0;
          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-medium text-[#8B9299] uppercase tracking-wider">
                  {card.label}
                </p>
                <div className="w-7 h-7 rounded-lg bg-[#EEF2FC] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#2355A7]" />
                </div>
              </div>
              <p
                className="text-[38px] font-semibold text-[#0E1013] tabular-nums leading-none mb-3"
                style={{ fontFamily: "'Azeret Mono', monospace" }}
              >
                {card.format(card.value)}
              </p>
              <div className="flex items-center gap-1.5">
                {positive ? <TrendingUp className="w-3 h-3 text-[#2355A7]" /> : <TrendingDown className="w-3 h-3 text-[#5C6370]" />}
                <span className={cn('text-[12px] font-medium', positive ? 'text-[#2355A7]' : 'text-[#5C6370]')}>
                  {card.change > 0 ? '+' : ''}{card.change} vs yesterday
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_300px] gap-4">

        {/* Engine Status */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EDEEF1] flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#0E1013]">AI Engine Status</h3>
              <p className="text-[12px] text-[#8B9299] mt-0.5">Live operational state · 7 engines</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="active" />
              <span className="text-[12px] text-[#8B9299]">6 active · 1 paused</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9F9F9]">
                <th className="text-left px-6 py-2.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider w-36">Engine</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider w-20">Today</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Main KPI</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider w-24">Resolution</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEF1]">
              {mockEngines.map(engine => (
                <tr key={engine.id} className="hover:bg-[#F9F9F9] transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <StatusDot status={engine.status} />
                      <span className="text-[13px] font-medium text-[#0E1013]">{engine.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[15px] font-semibold text-[#0E1013] tabular-nums" style={{ fontFamily: "'Azeret Mono', monospace" }}>
                      {engine.actionsToday}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-[15px] font-semibold text-[#0E1013] tabular-nums" style={{ fontFamily: "'Azeret Mono', monospace" }}>
                      {engine.mainKpi.value}
                    </p>
                    <p className="text-[10px] text-[#8B9299] mt-0.5">{engine.mainKpi.label}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[15px] font-semibold text-[#0E1013] tabular-nums" style={{ fontFamily: "'Azeret Mono', monospace" }}>
                      {(engine.resolutionRate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {engine.status === 'active' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2355A7] bg-[#EEF2FC] px-2 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2355A7]" />Live
                      </span>
                    )}
                    {engine.status === 'paused' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5C6370] bg-[#F6F7F9] px-2 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D1CFCF]" />Paused
                      </span>
                    )}
                    {engine.status === 'error' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0E1013] bg-[#F6F7F9] px-2 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0E1013]" />Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {mockEngines.filter(e => e.lastError).map(engine => (
            <div key={`err-${engine.id}`} className="flex items-start gap-3 px-6 py-3 bg-[#F9F9F9] border-t border-[#EDEEF1]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#0E1013] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#0E1013]">
                <span className="font-semibold">{engine.name}:</span> {engine.lastError}
              </p>
            </div>
          ))}
        </Card>

        {/* Activity feed */}
        <Card padding="none" className="flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-[#EDEEF1] flex-shrink-0">
            <h3 className="text-[14px] font-semibold text-[#0E1013] mb-3">Activity</h3>
            <div className="flex gap-1 flex-wrap">
              {engineFilters.map(f => (
                <button
                  key={f}
                  onClick={() => setActivityFilter(f)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize',
                    activityFilter === f
                      ? 'bg-[#2355A7] text-white'
                      : 'bg-[#F6F7F9] text-[#5C6370] hover:text-[#2355A7] hover:bg-[#EEF2FC]',
                  )}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredActivity.map((item, i) => (
              <div
                key={item.id}
                className={cn('px-4 py-3 hover:bg-[#F9F9F9] transition-colors', i > 0 && 'border-t border-[#EDEEF1]')}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#BED4F6] flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[12px] font-semibold text-[#0E1013] truncate">{item.guestName}</span>
                      <span className="text-[10px] text-[#8B9299] whitespace-nowrap flex-shrink-0">
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                    <span className="inline-block text-[10px] font-medium text-[#2355A7] bg-[#EEF2FC] px-1.5 py-0.5 rounded mb-1.5">
                      {item.engineName}
                    </span>
                    <p className="text-[12px] text-[#5C6370] leading-relaxed">{item.action}</p>
                    <p className="text-[11px] text-[#8B9299] mt-0.5">{item.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
