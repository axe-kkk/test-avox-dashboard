import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { mockActivity } from '../../data/mock/activity';
import { formatDateTime, cn } from '../../utils';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { conversationsTrend } from '../../data/mock/analytics';

const ENGINE_COLORS: Record<string, string> = {
  Conversion:  '#2355A7',
  Reservation: '#0EA5E9',
  Upsell:      '#8B5CF6',
  Arrival:     '#10B981',
  Concierge:   '#F59E0B',
  Recovery:    '#EF4444',
  Reputation:  '#EC4899',
};

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  active:   { dot: 'bg-[#16A34A]', bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', label: 'Active'   },
  paused:   { dot: 'bg-[#F59E0B]', bg: 'bg-[#FEF9C3]', text: 'text-[#D97706]', label: 'Paused'   },
  error:    { dot: 'bg-[#EF4444]', bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', label: 'Error'    },
  inactive: { dot: 'bg-[#C4C8CF]', bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', label: 'Inactive' },
};

/* ═══════════════════════════════════════════════
   ENGINE PAGE LAYOUT (6.2)
═══════════════════════════════════════════════ */
export function EnginePage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  if (!engine) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[16px] font-semibold text-[#3D4550] mb-2">Engine not found</p>
          <button onClick={() => navigate('/engines')} className="text-[13px] text-[#2355A7] hover:underline">← Back to Engines</button>
        </div>
      </div>
    );
  }

  const sc = STATUS_CONFIG[engine.status] ?? STATUS_CONFIG.inactive;
  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';

  /* Current sub-page from URL */
  const parts = location.pathname.split('/');
  const activeSub = parts[3] ?? '';

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--color-brand-bg, #F7F8FA)' }}>

      {/* ── Engine header ── */}
      <div className="flex-shrink-0 bg-white border-b border-[#EDEEF1] px-6 py-4">
        <div className="flex items-center justify-between max-w-[1100px] mx-auto">

          {/* Left: back + engine identity */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/engines')}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B9299] hover:bg-[#F6F7F9] hover:text-[#5C6370] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              {/* Color badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                style={{ background: color }}
              >
                {engine.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[16px] font-semibold text-[#3D4550]">{engine.name} Engine</h1>
                  <span className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold', sc.bg, sc.text)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                    {sc.label}
                  </span>
                </div>
                <p className="text-[12px] text-[#8B9299] mt-0.5 max-w-[480px] truncate">{engine.description}</p>
              </div>
            </div>
          </div>

          {/* Right: key metrics */}
          <div className="flex items-center gap-6">
            {[
              { label: 'Today',      value: String(engine.actionsToday),                            unit: 'actions'   },
              { label: 'Handled',    value: engine.handledConversations.toLocaleString(),            unit: 'total'     },
              { label: 'Resolution', value: `${(engine.resolutionRate * 100).toFixed(0)}%`,         unit: 'rate'      },
              { label: 'Avg reply',  value: engine.avgResponseTime,                                  unit: ''          },
            ].map(m => (
              <div key={m.label} className="text-right">
                <p className="text-[10px] text-[#8B9299] uppercase tracking-wider">{m.label}</p>
                <p
                  className="text-[16px] font-semibold tabular-nums leading-tight"
                  style={{ fontFamily: "'Azeret Mono', monospace", color }}
                >
                  {m.value}
                </p>
                {m.unit && <p className="text-[9px] text-[#C4C8CF]">{m.unit}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {engine.lastError && (
          <div className="max-w-[1100px] mx-auto mt-3 flex items-start gap-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#DC2626]">{engine.lastError}</p>
          </div>
        )}
      </div>

      {/* ── Sub-page content ── */}
      <div className="flex-1 overflow-auto">
        <Outlet context={{ engine, color }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ENGINE OVERVIEW PAGE — index route (6.2 content)
═══════════════════════════════════════════════ */
export function EngineOverviewPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);
  if (!engine) return null;

  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';
  const engineActions = mockActivity.filter(a => a.engineName === engine.name);
  const errors = mockActivity.filter(a => a.engineName === engine.name && a.urgency === 'high');

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-5">

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Conversations handled', value: engine.handledConversations.toLocaleString(), sub: `Resolution ${(engine.resolutionRate * 100).toFixed(0)}%`, icon: TrendingUp },
          { label: 'Actions today',          value: String(engine.actionsToday),                  sub: 'vs yesterday +12%',                                        icon: CheckCircle2 },
          { label: 'Avg response time',       value: engine.avgResponseTime,                       sub: 'all channels',                                            icon: Clock },
          { label: 'Errors (30d)',            value: String(engine.errorCount),                    sub: engine.errorCount > 3 ? 'Review recommended' : 'All clear', icon: XCircle },
        ].map(kpi => {
          const Icon = kpi.icon;
          const isWarn = kpi.label.startsWith('Error') && engine.errorCount > 3;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-[#EDEEF1] p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider leading-tight">{kpi.label}</p>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p
                className="text-[28px] font-bold tabular-nums leading-none"
                style={{ fontFamily: "'Azeret Mono', monospace", color: isWarn ? '#EF4444' : color }}
              >
                {kpi.value}
              </p>
              <p className={cn('text-[11px] mt-1.5', isWarn ? 'text-[#EF4444]' : 'text-[#A0A6B0]')}>{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Chart + Error log ── */}
      <div className="grid grid-cols-[1fr_380px] gap-5">

        {/* Volume chart */}
        <div className="bg-white rounded-2xl border border-[#EDEEF1] p-5">
          <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider mb-4">
            Conversation Volume — last 12 days
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={conversationsTrend}>
              <defs>
                <linearGradient id={`grad-${engine.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #EDEEF1', borderRadius: '12px', fontSize: '12px' }}
                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 2' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`url(#grad-${engine.id})`}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Action / Error log */}
        <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#EDEEF1] flex items-center justify-between flex-shrink-0">
            <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider">Recent Actions</p>
            {errors.length > 0 && (
              <span className="text-[9px] font-bold text-[#EF4444] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
                {errors.length} error{errors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#F2F3F5]">
            {engineActions.length === 0 ? (
              <p className="text-[13px] text-[#8B9299] text-center py-10">No recent actions.</p>
            ) : engineActions.map(item => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors',
                  item.urgency === 'high' && 'bg-[#FFF5F5]',
                )}
              >
                <ChannelIcon channel={item.channel} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[12px] font-medium text-[#3D4550] truncate">{item.guestName}</span>
                    <span className="text-[10px] text-[#A0A6B0] flex-shrink-0">{formatDateTime(item.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-[#5C6370]">{item.action}</p>
                  <p className="text-[10px] text-[#A0A6B0] mt-0.5">{item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
