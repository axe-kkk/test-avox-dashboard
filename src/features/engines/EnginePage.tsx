import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { mockActivity } from '../../data/mock/activity';
import { formatDateTime, cn } from '../../utils';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { conversationsTrend } from '../../data/mock/analytics';

/* Inbox-style monochrome — engine identity comes from name, not colour. */
const ENGINE_COLORS: Record<string, string> = {
  Conversion:  '#2355A7',
  Reservation: '#2355A7',
  Upsell:      '#2355A7',
  Arrival:     '#2355A7',
  Concierge:   '#2355A7',
  Recovery:    '#2355A7',
  Reputation:  '#2355A7',
};

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  active:   { dot: 'bg-brand-blue', bg: 'bg-brand-blue-50', text: 'text-brand-blue', label: 'Active'   },
  paused:   { dot: 'bg-brand-gray', bg: 'bg-surface-3',     text: 'text-subtle',     label: 'Paused'   },
  error:    { dot: 'bg-brand-black', bg: 'bg-brand-black/10', text: 'text-brand-black', label: 'Error'   },
  inactive: { dot: 'bg-faint',      bg: 'bg-surface-3',     text: 'text-subtle',     label: 'Inactive' },
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
          <p className="text-[16px] font-semibold text-strong mb-2">Engine not found</p>
          <button onClick={() => navigate('/engines')} className="text-[13px] text-brand-blue hover:underline">← Back to Engines</button>
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

      {/* ── Engine header — compact, dense, inbox-style ── */}
      <div className="flex-shrink-0 bg-white border-b border-brand-border px-6 py-3">
        <div className="flex items-center justify-between max-w-[1100px] mx-auto gap-6">

          {/* Left: back + engine identity */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/engines')}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors flex-shrink-0"
              title="Back to engines"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            {/* Brand-blue badge */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ background: color }}
            >
              {engine.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[13px] font-semibold text-strong truncate">{engine.name} Engine</h1>
                <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0', sc.bg, sc.text)}>
                  <span className={cn('w-1 h-1 rounded-full', sc.dot)} />
                  {sc.label}
                </span>
              </div>
              <p className="text-[11px] text-subtle mt-0.5 max-w-[420px] truncate">{engine.description}</p>
            </div>
          </div>

          {/* Right: key metrics — tight inbox-style row */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {[
              { label: 'Today',      value: String(engine.actionsToday),                                       unit: 'actions' },
              { label: 'Handled',    value: engine.handledConversations.toLocaleString('en-US'),               unit: 'total'   },
              { label: 'Resolution', value: `${(engine.resolutionRate * 100).toFixed(0)}%`,                    unit: 'rate'    },
              { label: 'Avg reply',  value: engine.avgResponseTime,                                            unit: ''        },
            ].map(m => (
              <div key={m.label} className="flex items-baseline gap-1.5">
                <p className="text-[9px] font-semibold text-subtle uppercase tracking-[0.14em]">{m.label}</p>
                <p className="text-[13px] font-semibold tabular-nums leading-none text-strong">
                  {m.value}
                </p>
                {m.unit && <p className="text-[9px] text-faint">{m.unit}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {engine.lastError && (
          <div className="max-w-[1100px] mx-auto mt-3 flex items-start gap-2.5 bg-surface-3 border border-brand-border rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-brand-black flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-strong">{engine.lastError}</p>
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
    <div className="max-w-[1100px] mx-auto px-6 py-5 space-y-4">

      {/* ── KPI cards — compact, inbox-density ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Conversations handled', value: engine.handledConversations.toLocaleString('en-US'), sub: `Resolution ${(engine.resolutionRate * 100).toFixed(0)}%`, icon: TrendingUp },
          { label: 'Actions today',          value: String(engine.actionsToday),                         sub: 'vs yesterday +12%',                                        icon: CheckCircle2 },
          { label: 'Avg response time',      value: engine.avgResponseTime,                              sub: 'all channels',                                              icon: Clock },
          { label: 'Errors (30d)',           value: String(engine.errorCount),                           sub: engine.errorCount > 3 ? 'Review recommended' : 'All clear', icon: XCircle },
        ].map(kpi => {
          const Icon = kpi.icon;
          const isWarn = kpi.label.startsWith('Error') && engine.errorCount > 3;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-brand-border p-3.5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] leading-tight">{kpi.label}</p>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-blue-50">
                  <Icon className="w-3.5 h-3.5 text-brand-blue" />
                </div>
              </div>
              <p
                className={cn(
                  'text-[20px] font-semibold tabular-nums leading-none',
                  isWarn ? 'text-brand-black' : 'text-strong',
                )}
              >
                {kpi.value}
              </p>
              <p className={cn('text-[10px] mt-1', isWarn ? 'text-brand-black font-medium' : 'text-subtle')}>{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Chart + Recent Actions ── */}
      <div className="grid grid-cols-[1fr_360px] gap-4">

        {/* Volume chart */}
        <div className="bg-white rounded-xl border border-brand-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">
              Conversation Volume
            </p>
            <span className="text-[10px] text-subtle">Last 12 days</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={conversationsTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${engine.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8B9299' }} axisLine={false} tickLine={false} width={26} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #EDEEF1', borderRadius: '10px', fontSize: '11px' }}
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

        {/* Recent actions log */}
        <div className="bg-white rounded-xl border border-brand-border overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between flex-shrink-0">
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">Recent Actions</p>
            {errors.length > 0 && (
              <span className="text-[9px] font-bold text-white bg-brand-black px-1.5 py-0.5 rounded-full">
                {errors.length} error{errors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border-soft">
            {engineActions.length === 0 ? (
              <p className="text-[11px] text-subtle text-center py-8">No recent actions.</p>
            ) : engineActions.map(item => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface-2 transition-colors',
                  item.urgency === 'high' && 'bg-surface-2',
                )}
              >
                <ChannelIcon channel={item.channel} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[12px] font-medium text-strong truncate">{item.guestName}</span>
                    <span className="text-[10px] text-subtle flex-shrink-0 tabular-nums">{formatDateTime(item.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-muted leading-snug">{item.action}</p>
                  <p className="text-[10px] text-subtle mt-0.5 leading-snug">{item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
