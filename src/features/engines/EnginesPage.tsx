import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight, Zap, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { mockActivity } from '../../data/mock/activity';
import { formatDateTime, cn } from '../../utils';
import { ChannelIcon } from '../../components/ui/ChannelIcon';

/* ── Journey stages ── */
const STAGES: { label: string; short: string; engines: string[] }[] = [
  { label: 'Pre-Booking',       short: 'Pre-Booking',   engines: ['Conversion'] },
  { label: 'Booking Confirmed', short: 'Confirmed',     engines: ['Reservation'] },
  { label: 'Pre-Arrival',       short: 'Pre-Arrival',   engines: ['Arrival', 'Upsell'] },
  { label: 'Check-In',          short: 'Check-In',      engines: ['Arrival'] },
  { label: 'In-Stay',           short: 'In-Stay',       engines: ['Concierge', 'Recovery', 'Upsell'] },
  { label: 'Check-Out',         short: 'Check-Out',     engines: ['Recovery'] },
  { label: 'Post-Stay',         short: 'Post-Stay',     engines: ['Reputation'] },
];

const ENGINE_COLORS: Record<string, string> = {
  Conversion:  '#2355A7',
  Reservation: '#0EA5E9',
  Upsell:      '#8B5CF6',
  Arrival:     '#10B981',
  Concierge:   '#F59E0B',
  Recovery:    '#EF4444',
  Reputation:  '#EC4899',
};

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  active:   { dot: 'bg-[#16A34A]', bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', label: 'Active'   },
  paused:   { dot: 'bg-[#F59E0B]', bg: 'bg-[#FEF9C3]', text: 'text-[#D97706]', label: 'Paused'   },
  error:    { dot: 'bg-[#EF4444]', bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', label: 'Error'    },
  inactive: { dot: 'bg-[#C4C8CF]', bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', label: 'Inactive' },
};

export function EnginesPage() {
  const navigate = useNavigate();
  const activeCount = mockEngines.filter(e => e.status === 'active').length;
  const totalToday  = mockEngines.reduce((s, e) => s + e.actionsToday, 0);

  /* Stage action counts */
  const stageActions = STAGES.map(stage => {
    const total = stage.engines.reduce((sum, name) => {
      const eng = mockEngines.find(e => e.name === name);
      return sum + (eng?.actionsToday ?? 0);
    }, 0);
    return { ...stage, total };
  });
  const maxActions = Math.max(...stageActions.map(s => s.total));

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-brand-bg, #F7F8FA)' }}>
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#3D4550]" style={{ fontFamily: "'Azeret Mono', monospace" }}>
              AI Engines
            </h1>
            <p className="text-[13px] text-[#8B9299] mt-0.5">
              {activeCount} active · {totalToday} actions today
            </p>
          </div>
          <button className="h-8 px-3 flex items-center gap-1.5 rounded-lg text-[12px] font-medium text-[#5C6370] bg-white border border-[#EDEEF1] hover:bg-[#F6F7F9] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync PMS
          </button>
        </div>

        {/* ── Guest Journey Timeline ── */}
        <div className="bg-white rounded-2xl border border-[#EDEEF1] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider">Guest Journey Timeline</p>
            <span className="text-[11px] text-[#8B9299]">Actions today per stage</span>
          </div>

          {/* Timeline rail */}
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-[22px] left-0 right-0 h-px bg-[#EDEEF1] z-0" />

            <div className="relative z-10 grid grid-cols-7 gap-1">
              {stageActions.map((stage, idx) => {
                const heightPct = maxActions > 0 ? (stage.total / maxActions) : 0;
                const barH = Math.max(4, Math.round(heightPct * 48));
                return (
                  <div key={stage.label} className="flex flex-col items-center gap-2">
                    {/* Stage dot */}
                    <div className={cn(
                      'w-11 h-11 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      stage.total > 0
                        ? 'bg-[#EEF2FC] border-[#2355A7]'
                        : 'bg-white border-[#E4E6EA]',
                    )}>
                      <span
                        className={cn(
                          'text-[13px] font-bold tabular-nums',
                          stage.total > 0 ? 'text-[#2355A7]' : 'text-[#C4C8CF]',
                        )}
                        style={{ fontFamily: "'Azeret Mono', monospace" }}
                      >
                        {stage.total}
                      </span>
                    </div>

                    {/* Arrow connector (not last) */}
                    {idx < STAGES.length - 1 && (
                      <div className="absolute top-[14px] translate-x-[calc(50%+22px)] z-20 pointer-events-none" style={{ left: `${(100 / 7) * (idx + 1)}%`, transform: 'translateX(-50%)' }}>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D1CFCF]" />
                      </div>
                    )}

                    {/* Bar */}
                    <div className="w-full flex justify-center">
                      <div
                        className="w-6 rounded-t-sm transition-all"
                        style={{
                          height: `${barH}px`,
                          background: stage.total > 0 ? `${ENGINE_COLORS[stage.engines[0]]}22` : '#F3F4F6',
                          borderBottom: `2px solid ${stage.total > 0 ? ENGINE_COLORS[stage.engines[0]] : '#E4E6EA'}`,
                        }}
                      />
                    </div>

                    {/* Stage label */}
                    <p className="text-[10px] font-medium text-[#8B9299] text-center leading-tight">{stage.short}</p>

                    {/* Engine tags */}
                    <div className="flex flex-col items-center gap-0.5">
                      {stage.engines.map(name => (
                        <span
                          key={name}
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: `${ENGINE_COLORS[name]}18`,
                            color: ENGINE_COLORS[name],
                          }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Engine status cards (compact) ── */}
        <div className="grid grid-cols-7 gap-3">
          {mockEngines.map(engine => {
            const sc = STATUS_COLORS[engine.status] ?? STATUS_COLORS.inactive;
            return (
              <button
                key={engine.id}
                onClick={() => navigate(`/engines/${engine.name.toLowerCase()}`)}
                className="bg-white rounded-xl border border-[#EDEEF1] p-3.5 text-left hover:border-[#2355A7] hover:shadow-[0_0_0_2px_#BED4F6/30] transition-all group"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', sc.dot)} />
                  <span className="text-[11px] font-semibold text-[#3D4550] truncate group-hover:text-[#2355A7] transition-colors">{engine.name}</span>
                </div>
                <p
                  className="text-[20px] font-bold tabular-nums leading-none"
                  style={{ fontFamily: "'Azeret Mono', monospace", color: ENGINE_COLORS[engine.name] }}
                >
                  {engine.actionsToday}
                </p>
                <p className="text-[9px] text-[#A0A6B0] mt-1 leading-tight">actions today</p>
                {engine.lastError && (
                  <div className="mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#EF4444] flex-shrink-0" />
                    <span className="text-[9px] text-[#EF4444] truncate">Error</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Bottom row: PMS Sync + Action Log ── */}
        <div className="grid grid-cols-[320px_1fr] gap-5">

          {/* PMS Sync Status */}
          <div className="bg-white rounded-2xl border border-[#EDEEF1] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <p className="text-[13px] font-semibold text-[#3D4550]">PMS Sync Status</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Last sync',           value: '2 minutes ago',    icon: Clock,         ok: true  },
                { label: 'Active reservations', value: '142',              icon: CheckCircle2,  ok: true  },
                { label: 'Check-ins today',     value: '38 guests',        icon: CheckCircle2,  ok: true  },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <item.icon className={cn('w-3.5 h-3.5 flex-shrink-0', item.ok ? 'text-[#16A34A]' : 'text-[#EF4444]')} />
                    <span className="text-[12px] text-[#5C6370]">{item.label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#3D4550] tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-[#F2F3F5]">
              <p className="text-[10px] text-[#8B9299]">Connected to Cloudbeds PMS · Property: Grand Palace Hotel</p>
            </div>
          </div>

          {/* Action Log */}
          <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EDEEF1] flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#3D4550]">Action Log</p>
              <span className="text-[11px] text-[#8B9299]">All engines · today</span>
            </div>
            <div className="divide-y divide-[#F2F3F5] max-h-[360px] overflow-y-auto">
              {mockActivity.map(item => (
                <div key={item.id} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    <ChannelIcon channel={item.channel} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{
                          background: `${ENGINE_COLORS[item.engineName] ?? '#8B9299'}18`,
                          color: ENGINE_COLORS[item.engineName] ?? '#8B9299',
                        }}
                      >
                        {item.engineName}
                      </span>
                      <span className="text-[12px] font-medium text-[#3D4550] truncate">{item.guestName}</span>
                      {item.urgency === 'high' && (
                        <span className="text-[9px] font-bold text-[#EF4444] bg-[#FEE2E2] px-1.5 py-0.5 rounded-full">URGENT</span>
                      )}
                      <span className="text-[10px] text-[#A0A6B0] ml-auto flex-shrink-0">{formatDateTime(item.timestamp)}</span>
                    </div>
                    <p className="text-[12px] text-[#5C6370]">{item.action}</p>
                    <p className="text-[11px] text-[#A0A6B0] mt-0.5">{item.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Empty state (shown when no engines configured) ── */}
        {mockEngines.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-[#D1D5DB] flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF2FC] flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#2355A7]" />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-semibold text-[#3D4550] mb-1">Налаштуйте свій перший AI Engine</p>
              <p className="text-[13px] text-[#8B9299]">Виберіть Engine із панелі зліва, щоб почати налаштування</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
