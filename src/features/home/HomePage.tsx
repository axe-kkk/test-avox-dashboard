import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Bot, DollarSign, MessageSquare } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { Avatar } from '../../components/ui/Avatar';
import { mockEngines } from '../../data/mock/engines';
import { mockActivity } from '../../data/mock/activity';
import { summaryMetrics } from '../../data/mock/analytics';
import { engineColors, formatRelativeTime, formatCurrency } from '../../utils';
import type { EngineName } from '../../types';

const summaryCards = [
  {
    label: 'Conversations Today',
    value: summaryMetrics.conversationsToday,
    change: summaryMetrics.conversationsChange,
    icon: MessageSquare,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    unit: '',
  },
  {
    label: 'Pending Escalations',
    value: summaryMetrics.pendingEscalations,
    change: summaryMetrics.escalationsChange,
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    unit: '',
    invertChange: true,
  },
  {
    label: 'AI Bookings Handled',
    value: summaryMetrics.aiBookingsHandled,
    change: summaryMetrics.aiBookingsChange,
    icon: Bot,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    unit: '',
  },
  {
    label: 'Upsell Revenue',
    value: summaryMetrics.upsellRevenue,
    change: summaryMetrics.upsellRevenueChange,
    icon: DollarSign,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    unit: '€',
  },
];

const urgencyColors = {
  low: 'bg-slate-100 text-slate-500',
  normal: 'bg-blue-50 text-blue-600',
  high: 'bg-rose-50 text-rose-600',
};

export function HomePage() {
  const [activityFilter, setActivityFilter] = useState<'all' | EngineName>('all');

  const filteredActivity = activityFilter === 'all'
    ? mockActivity
    : mockActivity.filter(a => a.engineName === activityFilter);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Operations Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monday, 21 April 2026 · The Grand Meridian, Paris</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map(card => {
          const Icon = card.icon;
          const positive = card.invertChange ? card.change <= 0 : card.change >= 0;
          return (
            <Card key={card.label} className="group">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">
                  {card.unit === '€'
                    ? formatCurrency(card.value)
                    : card.value}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                {positive
                  ? <TrendingUp className="w-3 h-3 text-emerald-600" />
                  : <TrendingDown className="w-3 h-3 text-rose-600" />
                }
                <span className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {card.change > 0 ? '+' : ''}{card.unit === '€' ? formatCurrency(Math.abs(card.change)) : card.change} vs yesterday
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-5">
        {/* Engine Status */}
        <Card padding="none">
          <CardHeader
            title="AI Engine Status"
            subtitle="Live operational status of all 7 engines"
            className="px-5 pt-5 pb-0 mb-4"
          />
          <div className="divide-y divide-slate-50">
            {mockEngines.map(engine => (
              <div key={engine.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="w-28 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={engine.status} />
                    <span className="text-sm font-semibold text-slate-800">{engine.name}</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Actions today</p>
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">{engine.actionsToday}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">{engine.mainKpi.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{engine.mainKpi.value}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Resolution</p>
                    <p className="text-sm font-semibold text-slate-900">{(engine.resolutionRate * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-24 text-right">
                  <Badge
                    variant={engine.status === 'active' ? 'success' : engine.status === 'paused' ? 'warning' : 'danger'}
                  >
                    {engine.status === 'active' ? 'Live' : engine.status === 'paused' ? 'Paused' : 'Error'}
                  </Badge>
                </div>
                {engine.lastError && (
                  <div className="w-full mt-1 col-span-full">
                    <p className="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg ml-28">
                      ⚠ {engine.lastError}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Activity Feed */}
        <Card padding="none" className="flex flex-col">
          <div className="px-5 pt-5 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Activity Feed</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time engine actions</p>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  activityFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {(['Conversion', 'Upsell', 'Recovery', 'Concierge'] as EngineName[]).map(name => (
                <button
                  key={name}
                  onClick={() => setActivityFilter(name)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    activityFilter === name ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredActivity.map(item => (
              <div key={item.id} className="px-5 py-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <ChannelIcon channel={item.channel} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-xs font-semibold text-slate-900">{item.guestName}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${engineColors[item.engineName]}`}>
                        {item.engineName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.result}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-slate-400 whitespace-nowrap">{formatRelativeTime(item.timestamp)}</p>
                    {item.urgency === 'high' && (
                      <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        URGENT
                      </span>
                    )}
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
