import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, AlertCircle, Zap, Pause, X } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';

const ENGINE_COLORS: Record<string, string> = {
  Conversion: '#2355A7', Reservation: '#2355A7', Upsell: '#2355A7',
  Arrival: '#2355A7', Concierge: '#2355A7', Recovery: '#2355A7', Reputation: '#2355A7',
};

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  required: boolean;
}

export function ActivationPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);
  const [status, setStatus] = useState<'active' | 'paused' | 'inactive'>(
    (engine?.status as 'active' | 'paused' | 'inactive') ?? 'inactive'
  );
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  if (!engine) return null;

  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';

  const checklist: ChecklistItem[] = [
    { id: 'settings',   label: 'General Settings configured',      description: 'Engine name, tone and behavior limits are set.',             done: true,  required: true  },
    { id: 'prompt',     label: 'Instructions / System Prompt set', description: 'The system prompt has been filled in for this engine.',      done: true,  required: true  },
    { id: 'routing',    label: 'Routing rule exists',              description: 'At least one routing rule is configured.',                   done: false, required: true  },
    { id: 'playground', label: 'Tested in Playground',             description: 'Run at least one test conversation in the Playground.',      done: false, required: false },
    { id: 'connects',   label: 'Sufficient CONNECTS',              description: 'Your workspace has at least 100 CONNECTS available.',        done: true,  required: true  },
  ];

  const requiredDone = checklist.filter(c => c.required && c.done).length;
  const requiredTotal = checklist.filter(c => c.required).length;
  const canActivate = requiredDone === requiredTotal;

  const statusConfig = {
    active:   { label: 'Active',   dot: 'bg-[#16A34A]', bg: 'bg-[#F0FDF4]', border: 'border-[#86EFAC]', text: 'text-[#16A34A]', desc: 'This engine is live and processing conversations.' },
    paused:   { label: 'Paused',   dot: 'bg-[#F59E0B]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#D97706]', desc: 'Engine is paused. No new conversations will be processed.' },
    inactive: { label: 'Inactive', dot: 'bg-[#94A3B8]', bg: 'bg-[#F8FAFC]', border: 'border-[#E2E8F0]', text: 'text-[#64748B]', desc: 'Engine is off. Complete the checklist to activate.' },
  };
  const sc = statusConfig[status];

  return (
    <div className="max-w-[760px] mx-auto px-6 py-6 space-y-6">

      {/* ── Status indicator ── */}
      <div className={cn('rounded-2xl border-2 p-6', sc.bg, sc.border)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', sc.bg)}>
              <span className={cn('w-5 h-5 rounded-full', sc.dot)} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider mb-1">Current Status</p>
              <p className={cn('text-[28px] font-bold leading-none', sc.text)} style={{ fontFamily: "'Azeret Mono', monospace" }}>
                {sc.label}
              </p>
              <p className="text-[12px] text-[#5C6370] mt-1.5">{sc.desc}</p>
            </div>
          </div>

          {/* Toggle controls */}
          <div className="flex flex-col gap-2">
            {status !== 'active' && (
              <button
                disabled={!canActivate}
                onClick={() => setStatus('active')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all',
                  canActivate
                    ? 'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm'
                    : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed',
                )}
              >
                <Zap className="w-4 h-4" />
                Activate
              </button>
            )}
            {status === 'active' && (
              <button
                onClick={() => setStatus('paused')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-[#FEF9C3] text-[#D97706] hover:bg-[#FEF3C7] transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
            {status !== 'inactive' && (
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#94A3B8] hover:bg-white hover:text-[#EF4444] transition-colors"
              >
                Deactivate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Readiness Checklist ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EDEEF1] flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#3D4550]">Readiness Checklist</p>
          <span className="text-[12px] font-medium text-[#5C6370]">
            <span className="font-bold text-[#2355A7]">{requiredDone}</span> / {requiredTotal} required
          </span>
        </div>
        <div className="divide-y divide-[#F2F3F5]">
          {checklist.map(item => (
            <div key={item.id} className="flex items-start gap-4 px-6 py-4">
              <div className="mt-0.5 flex-shrink-0">
                {item.done
                  ? <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                  : <Circle className="w-5 h-5 text-[#D1D5DB]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={cn('text-[13px] font-medium', item.done ? 'text-[#3D4550]' : 'text-[#94A3B8]')}>
                    {item.label}
                  </p>
                  {item.required && !item.done && (
                    <span className="text-[9px] font-bold text-[#EF4444] bg-[#FEE2E2] px-1.5 py-0.5 rounded-full">Required</span>
                  )}
                  {!item.required && (
                    <span className="text-[9px] text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded-full">Optional</span>
                  )}
                </div>
                <p className="text-[12px] text-[#8B9299]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        {!canActivate && (
          <div className="px-6 py-3 bg-[#FFFBEB] border-t border-[#FDE68A] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D97706] flex-shrink-0" />
            <p className="text-[12px] text-[#D97706]">Complete all required items before activating this engine.</p>
          </div>
        )}
      </div>

      {/* ── Quick stats ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] p-5">
        <p className="text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider mb-4">Usage Stats</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Actions today',      value: String(engine.actionsToday) },
            { label: 'Actions (7 days)',   value: String(engine.actionsToday * 7) },
            { label: 'CONNECTS (today)',   value: String(Math.round(engine.actionsToday * 1.4)) },
          ].map(stat => (
            <div key={stat.label} className="text-center bg-[#F9F9F9] rounded-xl p-4 border border-[#EDEEF1]">
              <p className="text-[10px] text-[#8B9299] uppercase tracking-wider mb-1.5">{stat.label}</p>
              <p
                className="text-[26px] font-bold tabular-nums"
                style={{ fontFamily: "'Azeret Mono', monospace", color }}
              >{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Deactivate modal ── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowDeactivateModal(false)} />
          <div className="relative bg-white rounded-2xl border border-[#EDEEF1] shadow-[0_24px_60px_rgba(0,0,0,0.12)] p-6 w-[400px]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#3D4550]">Deactivate Engine</p>
                  <p className="text-[12px] text-[#8B9299]">{engine.name} Engine</p>
                </div>
              </div>
              <button onClick={() => setShowDeactivateModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8B9299] hover:bg-[#F6F7F9]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[13px] text-[#5C6370] mb-6 leading-relaxed">
              Deactivating this engine will stop all processing immediately. Active conversations will not receive responses.
              This action can be reversed at any time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EDEEF1] text-[13px] font-medium text-[#5C6370] hover:bg-[#F6F7F9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setStatus('inactive'); setShowDeactivateModal(false); }}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-[13px] font-semibold hover:bg-[#DC2626] transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
