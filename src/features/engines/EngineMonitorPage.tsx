import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity, Pause, Play, AlertTriangle, CheckCircle2, ArrowRight,
  Filter, ChevronDown, MessageSquare, UserCheck, Bell, Mail, Webhook,
} from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { mockActivity } from '../../data/mock/activity';
import { mockGuests } from '../../data/mock/guests';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { Switch } from '../../components/ui/Switch';
import { cn, formatDateTime } from '../../utils';
import { useApp } from '../../app/AppContext';
import type { ActivityItem } from '../../types';

type SeverityFilter = 'all' | 'errors';
type ErrorKind     = 'api_error' | 'delivery_failed' | 'low_confidence' | 'guardrail';
type ErrorSeverity = 'low' | 'medium' | 'high';

interface ErrorEntry {
  id: string;
  kind: ErrorKind;
  severity: ErrorSeverity;
  message: string;
  ts: string;
  guestName?: string;
}

const ERROR_KIND_LABEL: Record<ErrorKind, string> = {
  api_error:        'API error',
  delivery_failed:  'Delivery failed',
  low_confidence:   'Low confidence',
  guardrail:        'Guardrail triggered',
};

const ERROR_SAMPLES: ErrorEntry[] = [
  { id: 'e1', kind: 'api_error',       severity: 'high',   message: 'Cloudbeds PMS — 504 Gateway Timeout (3 retries)',  ts: '2026-04-29T11:42:00Z', guestName: 'Klaus Bauer' },
  { id: 'e2', kind: 'delivery_failed', severity: 'medium', message: 'WhatsApp message failed — recipient phone unreachable', ts: '2026-04-29T11:18:00Z', guestName: 'Magdalena Wójcik' },
  { id: 'e3', kind: 'low_confidence',  severity: 'low',    message: 'Confidence 38% on intent: refund_dispute — escalated', ts: '2026-04-29T10:51:00Z', guestName: 'Aiko Yamamoto' },
  { id: 'e4', kind: 'guardrail',       severity: 'medium', message: 'Guardrail triggered: discount above 15% — held for approval', ts: '2026-04-29T09:32:00Z', guestName: 'Tomás Vidal' },
  { id: 'e5', kind: 'api_error',       severity: 'low',    message: 'MCP — Spa & Dining: 429 rate limit (auto-retry succeeded)', ts: '2026-04-29T08:14:00Z' },
  { id: 'e6', kind: 'low_confidence',  severity: 'low',    message: 'Confidence 42% on intent: housekeeping — fallback message', ts: '2026-04-28T22:09:00Z', guestName: 'Sofia Nguyen' },
];

function makeSyntheticEvent(engineName: string): ActivityItem {
  const guest = mockGuests[Math.floor(Math.random() * mockGuests.length)];
  const actions = [
    { action: 'Sent confirmation message',        result: 'Delivered',                      urgency: 'normal' as const },
    { action: 'Updated reservation',               result: 'Cloudbeds PMS — write OK',       urgency: 'normal' as const },
    { action: 'Pitched room upgrade',              result: 'Awaiting reply',                 urgency: 'normal' as const },
    { action: 'Booked spa session',                result: 'MCP — Spa & Dining ack',         urgency: 'normal' as const },
    { action: 'Escalated to Front Office',         result: 'GM notified',                    urgency: 'high'   as const },
    { action: 'Resolved guest question',           result: 'Q&A #34',                         urgency: 'low'    as const },
    { action: 'Failed to fetch availability',      result: 'PMS timeout (retried 3×)',       urgency: 'high'   as const },
  ];
  const a = actions[Math.floor(Math.random() * actions.length)];
  const channels = ['whatsapp','email','sms','messenger','instagram','telegram'] as const;
  const ch = channels[Math.floor(Math.random() * channels.length)];

  return {
    id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    engineName: engineName as ActivityItem['engineName'],
    channel: ch as ActivityItem['channel'],
    guestName: guest.name,
    action: a.action,
    result: a.result,
    urgency: a.urgency,
    guestId: guest.id,
  };
}

export function EngineMonitorPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [paused,    setPaused]    = useState(false);
  const [severity,  setSeverity]  = useState<SeverityFilter>('all');
  const [events,    setEvents]    = useState<ActivityItem[]>([]);
  const [errorKindFilter, setErrorKindFilter] = useState<ErrorKind | 'all'>('all');
  const [errors] = useState<ErrorEntry[]>(ERROR_SAMPLES);

  /* Alerts state */
  const [resolutionAlert, setResolutionAlert] = useState({ enabled: true,  threshold: '70' });
  const [errorRateAlert,  setErrorRateAlert]  = useState({ enabled: true,  threshold: '5'  });
  const [connectsAlert,   setConnectsAlert]   = useState({ enabled: false, threshold: '20' });
  const [channels, setChannels] = useState({ inApp: true, email: true, webhook: false });
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.internal/avox-alerts');

  /* Seed with this engine's recent activity. */
  useEffect(() => {
    if (!engine) return;
    setEvents(mockActivity.filter(a => a.engineName === engine.name).slice(0, 12));
  }, [engine]);

  useEffect(() => {
    if (!engine || paused) return;
    const id = setInterval(() => {
      setEvents(prev => [makeSyntheticEvent(engine.name), ...prev].slice(0, 60));
    }, 3500);
    return () => clearInterval(id);
  }, [engine, paused]);

  const filtered = useMemo(() => {
    if (severity === 'all') return events;
    return events.filter(e => e.urgency === 'high');
  }, [events, severity]);

  const filteredErrors = useMemo(() => {
    if (errorKindFilter === 'all') return errors;
    return errors.filter(e => e.kind === errorKindFilter);
  }, [errors, errorKindFilter]);

  if (!engine) return null;

  const last5min   = events.filter(e => Date.now() - new Date(e.timestamp).getTime() < 5 * 60_000).length;
  const errorCount = events.filter(e => e.urgency === 'high').length;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-5 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-blue-50 border border-brand-blue-light flex items-center justify-center flex-shrink-0">
            <Activity className={cn('w-4 h-4 text-brand-blue', !paused && 'animate-pulse')} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-0.5">Monitor your agent</p>
            <h2 className="text-[15px] font-semibold text-strong">Live action stream</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value as SeverityFilter)}
              className="h-9 pl-8 pr-9 rounded-xl border border-brand-border bg-white text-[12px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
            >
              <option value="all">All events</option>
              <option value="errors">Errors only</option>
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
          </div>

          <button
            onClick={() => addToast({ type: 'info', title: 'Engine paused' })}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white text-[12px] font-semibold text-strong hover:bg-surface-3 transition-colors"
            title="Pause this engine"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause engine
          </button>

          <button
            onClick={() => setPaused(p => !p)}
            className={cn(
              'h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border text-[12px] font-semibold transition-colors',
              paused
                ? 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-hover'
                : 'bg-white border-brand-border text-strong hover:bg-surface-3',
            )}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {paused ? 'Resume feed' : 'Pause feed'}
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Live state',     value: paused ? 'Paused' : 'Streaming', accent: paused ? 'text-subtle' : 'text-brand-blue' },
          { label: 'Last 5 min',     value: String(last5min) + ' events',    accent: 'text-strong' },
          { label: 'Errors visible', value: String(errorCount),               accent: errorCount > 0 ? 'text-brand-black' : 'text-strong' },
          { label: 'Resolution rate',value: `${(engine.resolutionRate * 100).toFixed(0)}%`, accent: 'text-brand-blue' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-border p-3.5">
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">{s.label}</p>
            <p
              className={cn('text-[18px] font-semibold tabular-nums leading-none mt-1.5', s.accent)}
              style={{ fontFamily: "'Azeret Mono', monospace" }}
            >{s.value}</p>
          </div>
        ))}
      </div>

      {/* Live stream */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-brand-border flex items-center justify-between">
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">Live feed</p>
          <div className="flex items-center gap-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', paused ? 'bg-brand-gray' : 'bg-brand-blue animate-pulse')} />
            <span className="text-[10px] text-subtle">
              {paused ? 'Paused — click Resume to continue' : 'Live · auto-refresh every 3.5s'}
            </span>
          </div>
        </div>

        <div className="divide-y divide-border-soft max-h-[420px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[12px] text-subtle">
                {severity === 'errors' ? 'No errors recorded.' : 'No events yet — waiting for activity…'}
              </p>
            </div>
          ) : filtered.map(item => {
            const isError = item.urgency === 'high';
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 px-5 py-3 hover:bg-surface-2 transition-colors group',
                  isError && 'bg-surface-2',
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <ChannelIcon channel={item.channel} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[12px] font-semibold text-strong truncate">{item.guestName}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-blue bg-brand-blue-50 border border-brand-blue-light px-1.5 py-0.5 rounded-md">
                      {item.engineName}
                    </span>
                    {isError && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-black bg-surface-3 border border-brand-border px-1.5 py-0.5 rounded-md">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Error
                      </span>
                    )}
                    {!isError && item.urgency === 'normal' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-blue bg-brand-blue-50 border border-brand-blue-light px-1.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        OK
                      </span>
                    )}
                    <span className="text-[10px] text-subtle ml-auto flex-shrink-0 tabular-nums">
                      {formatDateTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-[12px] text-strong">{item.action}</p>
                  <p className="text-[11px] text-subtle mt-0.5 inline-flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    {item.result}
                  </p>
                </div>
                {/* Quick actions per row */}
                <div className="flex flex-shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate('/inbox')}
                    className="h-7 px-2 inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white text-[10px] font-medium text-muted hover:bg-surface-3 hover:text-strong transition-colors"
                    title="Open conversation in Inbox"
                  >
                    <MessageSquare className="w-3 h-3" />
                    View
                  </button>
                  <button
                    onClick={() => addToast({ type: 'success', title: 'Conversation taken over', message: `${item.guestName} — manual mode` })}
                    className="h-7 px-2 inline-flex items-center gap-1 rounded-lg bg-brand-blue text-white text-[10px] font-semibold hover:bg-brand-blue-hover transition-colors"
                    title="Take over manually"
                  >
                    <UserCheck className="w-3 h-3" />
                    Takeover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error log */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-3 border-b border-brand-border flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">Error log</p>
            <p className="text-[12px] text-muted mt-0.5">API errors, delivery failures, low confidence, guardrails</p>
          </div>
          <div className="relative">
            <select
              value={errorKindFilter}
              onChange={e => setErrorKindFilter(e.target.value as ErrorKind | 'all')}
              className="h-8 pl-3 pr-9 rounded-lg border border-brand-border bg-white text-[11px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
            >
              <option value="all">All errors</option>
              {(Object.keys(ERROR_KIND_LABEL) as ErrorKind[]).map(k => (
                <option key={k} value={k}>{ERROR_KIND_LABEL[k]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-subtle pointer-events-none" />
          </div>
        </div>
        <div className="divide-y divide-border-soft max-h-[280px] overflow-y-auto">
          {filteredErrors.length === 0 ? (
            <p className="text-[12px] text-subtle text-center py-8">No errors match the filter.</p>
          ) : filteredErrors.map(e => (
            <div key={e.id} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-2 transition-colors">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5',
                  e.severity === 'high'   ? 'bg-brand-black' :
                  e.severity === 'medium' ? 'bg-strong'      :
                                             'bg-faint',
                )}
                title={`Severity: ${e.severity}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle bg-surface-3 border border-brand-border px-1.5 py-0.5 rounded-md">
                    {ERROR_KIND_LABEL[e.kind]}
                  </span>
                  {e.guestName && (
                    <span className="text-[11px] text-muted">· {e.guestName}</span>
                  )}
                  <span className="text-[10px] text-subtle ml-auto flex-shrink-0 tabular-nums">
                    {formatDateTime(e.ts)}
                  </span>
                </div>
                <p className="text-[12px] text-strong">{e.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts settings */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-3 border-b border-brand-border">
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">Alerts</p>
          <p className="text-[12px] text-muted mt-0.5">Notify the team when key metrics drift</p>
        </div>
        <div className="divide-y divide-border-soft">
          {/* Resolution alert */}
          <div className="flex items-center gap-4 px-5 py-3.5">
            <Switch
              checked={resolutionAlert.enabled}
              onChange={v => setResolutionAlert({ ...resolutionAlert, enabled: v })}
            />
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[13px] text-strong">Alert when resolution rate drops below</span>
              <input
                type="number"
                value={resolutionAlert.threshold}
                onChange={e => setResolutionAlert({ ...resolutionAlert, threshold: e.target.value })}
                className="w-14 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <span className="text-[13px] text-subtle">%</span>
            </div>
          </div>
          {/* Error rate */}
          <div className="flex items-center gap-4 px-5 py-3.5">
            <Switch
              checked={errorRateAlert.enabled}
              onChange={v => setErrorRateAlert({ ...errorRateAlert, enabled: v })}
            />
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[13px] text-strong">Alert when error rate exceeds</span>
              <input
                type="number"
                value={errorRateAlert.threshold}
                onChange={e => setErrorRateAlert({ ...errorRateAlert, threshold: e.target.value })}
                className="w-14 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <span className="text-[13px] text-subtle">% of last 100 events</span>
            </div>
          </div>
          {/* CONNECTS spend */}
          <div className="flex items-center gap-4 px-5 py-3.5">
            <Switch
              checked={connectsAlert.enabled}
              onChange={v => setConnectsAlert({ ...connectsAlert, enabled: v })}
            />
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[13px] text-strong">Alert when CONNECTS spend exceeds forecast by</span>
              <input
                type="number"
                value={connectsAlert.threshold}
                onChange={e => setConnectsAlert({ ...connectsAlert, threshold: e.target.value })}
                className="w-14 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <span className="text-[13px] text-subtle">%</span>
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="px-5 py-4 border-t border-brand-border bg-surface-2 space-y-2.5">
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">Notification channels</p>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch size="sm" checked={channels.inApp} onChange={v => setChannels({ ...channels, inApp: v })} />
              <span className="text-[12px] text-strong inline-flex items-center gap-1">
                <Bell className="w-3 h-3 text-subtle" />
                In-app
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch size="sm" checked={channels.email} onChange={v => setChannels({ ...channels, email: v })} />
              <span className="text-[12px] text-strong inline-flex items-center gap-1">
                <Mail className="w-3 h-3 text-subtle" />
                Email
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch size="sm" checked={channels.webhook} onChange={v => setChannels({ ...channels, webhook: v })} />
              <span className="text-[12px] text-strong inline-flex items-center gap-1">
                <Webhook className="w-3 h-3 text-subtle" />
                Webhook
              </span>
            </label>
            {channels.webhook && (
              <input
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.example.com/avox"
                className="flex-1 min-w-[240px] h-8 px-3 rounded-lg border border-brand-border bg-white text-[11px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
