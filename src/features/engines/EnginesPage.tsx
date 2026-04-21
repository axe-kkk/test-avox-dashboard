import { useState } from 'react';
import { AlertTriangle, Play, Pause, Settings2, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatusDot } from '../../components/ui/StatusDot';
import { Tabs } from '../../components/ui/Tabs';
import { mockEngines } from '../../data/mock/engines';
import { mockActivity } from '../../data/mock/activity';
import { engineColors, formatRelativeTime, cn } from '../../utils';
import type { AIEngine, EngineName } from '../../types';
import { useApp, usePermission } from '../../app/AppContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { conversationsTrend } from '../../data/mock/analytics';

const engineDetailTabs = [
  { id: 'config', label: 'Configuration' },
  { id: 'performance', label: 'Performance' },
  { id: 'log', label: 'Action Log' },
];

const engineConfigs: Record<EngineName, { sections: { title: string; fields: { label: string; value: string; type?: string }[] }[] }> = {
  Conversion: {
    sections: [
      {
        title: 'Response Behavior',
        fields: [
          { label: 'Response Language', value: 'Match guest language' },
          { label: 'Tone', value: 'Warm & professional' },
          { label: 'Max Response Time', value: '2 minutes' },
          { label: 'Escalation Threshold', value: '3 unanswered turns' },
        ],
      },
      {
        title: 'Booking Rules',
        fields: [
          { label: 'Min Lead Time', value: '0 days' },
          { label: 'Auto-confirm Bookings', value: 'Yes — under 3 nights' },
          { label: 'Rate Display', value: 'Show best available rate' },
          { label: 'Availability Sync', value: 'Real-time via PMS' },
        ],
      },
      {
        title: 'Follow-up',
        fields: [
          { label: 'Follow-up After No Reply', value: '24 hours' },
          { label: 'Follow-up Limit', value: '2 messages' },
          { label: 'Routing on Escalation', value: 'Assign to Elena Kowalski' },
        ],
      },
    ],
  },
  Upsell: {
    sections: [
      {
        title: 'Offer Timing',
        fields: [
          { label: 'First Upsell Trigger', value: 'T+2h after booking' },
          { label: 'In-Stay Trigger', value: 'T+4h after check-in' },
          { label: 'Offer Expiry', value: '48 hours' },
        ],
      },
      {
        title: 'Revenue Thresholds',
        fields: [
          { label: 'Upgrade Min Differential', value: '€80 room difference' },
          { label: 'Commission Model', value: '15% of upsell value' },
          { label: 'Daily Revenue Target', value: '€3,500' },
        ],
      },
    ],
  },
  Arrival: {
    sections: [
      {
        title: 'Pre-Arrival Timing',
        fields: [
          { label: 'First Message At', value: 'T-72h before arrival' },
          { label: 'Reminder At', value: 'T-24h before arrival' },
          { label: 'Day-of Message', value: 'T-4h before arrival' },
        ],
      },
      {
        title: 'Data Collection',
        fields: [
          { label: 'Collect Preferences', value: 'Yes — pillow, floor, extras' },
          { label: 'Sync to PMS', value: 'Automatic on response' },
          { label: 'Early Check-in Offer', value: 'Yes — from 10:00 AM' },
        ],
      },
    ],
  },
  Concierge: {
    sections: [
      {
        title: 'Service Coverage',
        fields: [
          { label: 'Active Hours', value: '24/7' },
          { label: 'Languages Supported', value: '8 languages' },
          { label: 'Escalation Channel', value: 'SMS to duty manager' },
          { label: 'Restaurant Booking', value: 'Integrated — Le Jardin' },
        ],
      },
      {
        title: 'Response Rules',
        fields: [
          { label: 'Emergency Escalation', value: 'Immediate — Human override' },
          { label: 'Unknown Request Handling', value: 'Acknowledge & escalate' },
          { label: 'Maintenance Requests', value: 'Auto-ticket to Engineering' },
        ],
      },
    ],
  },
  Recovery: {
    sections: [
      {
        title: 'Detection',
        fields: [
          { label: 'Sentiment Threshold', value: 'Score < 3 triggers alert' },
          { label: 'Negative Keywords', value: 'Noise, cold, dirty, slow, unacceptable' },
          { label: 'Detection Lag', value: '< 30 seconds' },
        ],
      },
      {
        title: 'Compensation Logic',
        fields: [
          { label: 'Max Auto-Compensation', value: '€150 F&B credit' },
          { label: 'Above Threshold', value: 'Escalate to GM' },
          { label: 'VIP Auto-Compensation', value: '€300 + Room upgrade offer' },
        ],
      },
    ],
  },
  Reservation: {
    sections: [
      {
        title: 'Modification Rules',
        fields: [
          { label: 'Auto-approve Date Changes', value: 'Yes — same rate plan' },
          { label: 'Cancellation Policy', value: 'Enforce per booking terms' },
          { label: 'PMS Sync Delay', value: 'Real-time (< 5s)' },
        ],
      },
      {
        title: 'Channel Handling',
        fields: [
          { label: 'OTA Modifications', value: 'Accept — sync to PMS' },
          { label: 'Direct Modifications', value: 'Auto-confirm + email' },
          { label: 'Overbooking Alert', value: 'Yes — notify Revenue Manager' },
        ],
      },
    ],
  },
  Reputation: {
    sections: [
      {
        title: 'Review Requests',
        fields: [
          { label: 'Post-stay Delay', value: 'T+18h after checkout' },
          { label: 'Eligible Score', value: '≥ 4/5 satisfaction' },
          { label: 'Target Platforms', value: 'Google, Booking.com, TripAdvisor' },
        ],
      },
      {
        title: 'Public Response',
        fields: [
          { label: 'Respond to All Reviews', value: 'Yes — AI draft + human approve' },
          { label: 'Negative Review Alert', value: '< 3 stars — GM notified' },
          { label: 'Response Tone', value: 'Warm, owning, solution-focused' },
        ],
      },
    ],
  },
};

function EngineCard({ engine, isActive, onClick }: { engine: AIEngine; isActive: boolean; onClick: () => void }) {
  const canManage = usePermission('manage_engines');
  const { addToast } = useApp();
  return (
    <Card
      hover
      className={cn('cursor-pointer transition-all', isActive && 'ring-2 ring-slate-900 shadow-panel')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusDot status={engine.status} />
            <h3 className="text-sm font-semibold text-slate-900">{engine.name}</h3>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">{engine.description}</p>
        </div>
      </div>
      {engine.lastError && (
        <div className="flex items-start gap-1.5 bg-rose-50 rounded-lg px-2.5 py-2 mb-3">
          <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-rose-700 leading-relaxed">{engine.lastError}</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-[10px] text-slate-400">Today</p>
          <p className="text-base font-bold text-slate-900 tabular-nums">{engine.actionsToday}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">{engine.mainKpi.label}</p>
          <p className="text-base font-bold text-slate-900">{engine.mainKpi.value}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">Resolution</p>
          <p className="text-base font-bold text-slate-900">{(engine.resolutionRate * 100).toFixed(0)}%</p>
        </div>
      </div>
      {canManage && (
        <div className="flex gap-2 pt-3 border-t border-slate-50">
          <Button
            size="xs"
            variant={engine.status === 'active' ? 'secondary' : 'primary'}
            onClick={e => {
              e.stopPropagation();
              addToast({ type: 'success', title: engine.status === 'active' ? `${engine.name} paused` : `${engine.name} activated` });
            }}
          >
            {engine.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {engine.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
          <Button size="xs" variant="ghost">
            <Settings2 className="w-3 h-3" /> Config
          </Button>
        </div>
      )}
    </Card>
  );
}

function EngineDetail({ engine }: { engine: AIEngine }) {
  const [activeTab, setActiveTab] = useState('config');
  const config = engineConfigs[engine.name];
  const engineActions = mockActivity.filter(a => a.engineName === engine.name);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('px-3 py-1 rounded-full text-sm font-semibold', engineColors[engine.name])}>
              {engine.name}
            </div>
            <StatusDot status={engine.status} showLabel />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] text-slate-400">Total Handled</p>
              <p className="text-sm font-bold text-slate-900 tabular-nums">{engine.handledConversations.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400">Avg Response</p>
              <p className="text-sm font-bold text-slate-900">{engine.avgResponseTime}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400">Errors (30d)</p>
              <p className={cn('text-sm font-bold', engine.errorCount > 3 ? 'text-rose-600' : 'text-slate-900')}>{engine.errorCount}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">{engine.description}</p>
      </div>

      <Tabs tabs={engineDetailTabs} activeTab={activeTab} onChange={setActiveTab} className="px-6" />

      <div className="p-6">
        {activeTab === 'config' && (
          <div className="space-y-6">
            {config.sections.map(section => (
              <div key={section.title}>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{section.title}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {section.fields.map(field => (
                    <div key={field.label} className="bg-slate-50 rounded-xl px-4 py-3">
                      <p className="text-[10px] text-slate-400 mb-0.5">{field.label}</p>
                      <p className="text-sm font-medium text-slate-800">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Conversations', value: engine.handledConversations.toLocaleString(), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
                { label: 'Resolution Rate', value: `${(engine.resolutionRate * 100).toFixed(1)}%`, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Avg Response', value: engine.avgResponseTime, icon: Clock, color: 'text-violet-600 bg-violet-50' },
                { label: 'Error Count', value: engine.errorCount.toString(), icon: XCircle, color: 'text-rose-600 bg-rose-50' },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-4">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mb-2', m.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-500">{m.label}</p>
                    <p className="text-xl font-bold text-slate-900">{m.value}</p>
                  </div>
                );
              })}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Conversation Volume (12 days)</h4>
              <div className="bg-slate-50 rounded-xl p-4">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={conversationsTrend}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="space-y-2">
            {engineActions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No recent actions for this engine.</p>
            ) : engineActions.map(item => (
              <div key={item.id} className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-800">{item.guestName}</span>
                    <span className="text-[10px] text-slate-400">{formatRelativeTime(item.timestamp)}</span>
                    {item.urgency === 'high' && (
                      <Badge variant="danger" size="sm">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{item.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.result}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function EnginesPage() {
  const [selectedEngine, setSelectedEngine] = useState<AIEngine | null>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">AI Engines</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure and monitor all 7 operational AI engines</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {mockEngines.map(engine => (
          <EngineCard
            key={engine.id}
            engine={engine}
            isActive={selectedEngine?.id === engine.id}
            onClick={() => setSelectedEngine(engine === selectedEngine ? null : engine)}
          />
        ))}
      </div>

      {selectedEngine && (
        <EngineDetail engine={selectedEngine} />
      )}
    </div>
  );
}
