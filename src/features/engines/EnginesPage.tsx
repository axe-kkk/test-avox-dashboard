import { RefreshCw, Clock, CheckCircle2, Cpu, Plus } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { mockActivity } from '../../data/mock/activity';
import { formatDateTime, cn } from '../../utils';
import { ChannelIcon } from '../../components/ui/ChannelIcon';

/* ── Guest journey stages ── */
const STAGES: { label: string; engines: string[] }[] = [
  { label: 'Pre-Booking', engines: ['Conversion'] },
  { label: 'Confirmed',   engines: ['Reservation'] },
  { label: 'Pre-Arrival', engines: ['Arrival', 'Upsell'] },
  { label: 'Check-In',    engines: ['Arrival'] },
  { label: 'In-Stay',     engines: ['Concierge'] },
  { label: 'Check-Out',   engines: ['Recovery'] },
  { label: 'Post-Stay',   engines: ['Reputation'] },
];

export function EnginesPage() {
  const activeCount = mockEngines.filter(e => e.status === 'active').length;
  const totalToday  = mockEngines.reduce((s, e) => s + e.actionsToday, 0);

  /* Per-stage totals from mock engines */
  const stageActions = STAGES.map(stage => {
    const total = stage.engines.reduce((sum, name) => {
      const eng = mockEngines.find(e => e.name === name);
      return sum + (eng?.actionsToday ?? 0);
    }, 0);
    return { ...stage, total };
  });

  /* ── Empty state — shown when the workspace has no engines configured ── */
  if (mockEngines.length === 0) {
    return (
      <div className="h-full overflow-auto bg-surface-2 flex items-center justify-center px-6">
        <div className="max-w-[420px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue-50 border border-brand-blue-light flex items-center justify-center mx-auto mb-5">
            <Cpu className="w-7 h-7 text-brand-blue" />
          </div>
          <h2 className="text-[16px] font-semibold text-strong mb-2">
            Set up your first AI Engine
          </h2>
          <p className="text-[12px] text-muted leading-relaxed mb-5">
            Engines automate guest conversations across the journey — booking, arrival,
            in-stay concierge, recovery, and more. Start with one and add the rest as you go.
          </p>
          <button className="h-9 px-4 inline-flex items-center gap-2 rounded-xl bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Configure first engine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-surface-2">
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-[14px] font-semibold text-strong"
            >
              AI Engines
            </h1>
            <p className="text-[10px] text-subtle mt-0.5">
              {activeCount} active · {totalToday} actions today
            </p>
          </div>
          <button className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium text-brand-blue bg-brand-blue-50 border border-brand-blue-light hover:bg-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync PMS
          </button>
        </div>

        {/* ── Guest Journey Timeline ── */}
        <div className="bg-white rounded-2xl border border-brand-border p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em]">
              Guest Journey Timeline
            </p>
            <span className="text-[10px] text-subtle">Actions today per stage</span>
          </div>

          {/* Timeline rail */}
          <div className="relative">
            {/* Connector line behind circles */}
            <div className="absolute top-[36px] left-[8%] right-[8%] h-px bg-brand-border z-0" />

            <div className="relative z-10 grid grid-cols-7 gap-1">
              {stageActions.map(stage => {
                const isActive = stage.total > 0;
                return (
                  <div key={stage.label} className="flex flex-col items-center gap-2">
                    {/* Stage circle */}
                    <div
                      className={cn(
                        'w-[72px] h-[72px] rounded-full border flex flex-col items-center justify-center flex-shrink-0 transition-all bg-white',
                        isActive ? 'border-brand-border' : 'border-brand-border opacity-60',
                      )}
                    >
                      <span
                        className={cn(
                          'text-[20px] font-semibold tabular-nums leading-none',
                          isActive ? 'text-brand-blue' : 'text-faint',
                        )}
                      >
                        {stage.total}
                      </span>
                      <span className="text-[9px] text-subtle mt-1 leading-none">actions</span>
                    </div>

                    {/* Stage label */}
                    <p className="text-[12px] font-medium text-strong text-center leading-tight">
                      {stage.label}
                    </p>

                    {/* Engine name(s) — subtle subtitle */}
                    <p className="text-[10px] text-subtle text-center leading-tight">
                      {stage.engines.join(' · ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom row: PMS Sync + Action Log ── */}
        <div className="grid grid-cols-[320px_1fr] gap-5">

          {/* PMS Sync Status */}
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4 self-start">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              <p className="text-[12px] font-semibold text-strong">PMS Sync Status</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Last sync',           value: '2 minutes ago', icon: Clock        },
                { label: 'Active reservations', value: '142',           icon: CheckCircle2 },
                { label: 'Check-ins today',     value: '38 guests',     icon: CheckCircle2 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5 flex-shrink-0 text-subtle" />
                    <span className="text-[12px] text-muted">{item.label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-strong tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border-soft">
              <p className="text-[10px] text-subtle leading-relaxed">
                Connected to Cloudbeds PMS · Grand Palace Hotel
              </p>
            </div>
          </div>

          {/* Action Log */}
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
              <p className="text-[12px] font-semibold text-strong">Action Log</p>
              <span className="text-[10px] text-subtle">All engines · today</span>
            </div>
            <div className="divide-y divide-border-soft max-h-[420px] overflow-y-auto">
              {mockActivity.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <ChannelIcon channel={item.channel} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-brand-blue-50 text-brand-blue border border-brand-blue-light">
                        {item.engineName}
                      </span>
                      <span className="text-[12px] font-medium text-strong truncate">
                        {item.guestName}
                      </span>
                      <span className="text-[10px] text-subtle ml-auto flex-shrink-0">
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted">{item.action}</p>
                    <p className="text-[10px] text-subtle mt-0.5">{item.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
