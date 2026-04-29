import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, AlertCircle, Zap, Pause, X } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';

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
    (engine?.status as 'active' | 'paused' | 'inactive') ?? 'inactive',
  );
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  if (!engine) return null;

  const checklist: ChecklistItem[] = [
    { id: 'settings',   label: 'General Settings configured',      description: 'Engine name, tone and behavior limits are set.',        done: true,  required: true  },
    { id: 'prompt',     label: 'Instructions / System Prompt set', description: 'The system prompt has been filled in for this engine.', done: true,  required: true  },
    { id: 'routing',    label: 'Routing rule exists',              description: 'At least one routing rule is configured.',              done: false, required: true  },
    { id: 'playground', label: 'Tested in Playground',             description: 'Run at least one test conversation in the Playground.', done: false, required: false },
    { id: 'connects',   label: 'Sufficient CONNECTS',              description: 'Your workspace has at least 100 CONNECTS available.',   done: true,  required: true  },
  ];

  const requiredDone  = checklist.filter(c => c.required && c.done).length;
  const requiredTotal = checklist.filter(c => c.required).length;
  const canActivate   = requiredDone === requiredTotal;

  /* Inbox-style monochrome status — single accent + neutrals. */
  const statusConfig = {
    active: {
      label: 'Active',
      dot: 'bg-brand-blue',
      bg: 'bg-brand-blue-50',
      border: 'border-brand-blue-light',
      text: 'text-brand-blue',
      desc: 'This engine is live and processing conversations.',
    },
    paused: {
      label: 'Paused',
      dot: 'bg-brand-gray',
      bg: 'bg-surface-2',
      border: 'border-brand-border',
      text: 'text-strong',
      desc: 'Engine is paused. No new conversations will be processed.',
    },
    inactive: {
      label: 'Inactive',
      dot: 'bg-faint',
      bg: 'bg-surface-2',
      border: 'border-brand-border',
      text: 'text-subtle',
      desc: 'Engine is off. Complete the checklist to activate.',
    },
  } as const;
  const sc = statusConfig[status];

  return (
    <div className="max-w-[760px] mx-auto px-6 py-6 space-y-5">

      {/* ── Status indicator ── */}
      <div className={cn('rounded-xl border px-4 py-3 flex items-center justify-between gap-4', sc.bg, sc.border)}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', sc.dot)} />
          <span
            className={cn('text-[13px] font-semibold flex-shrink-0', sc.text)}
          >{sc.label}</span>
          <span className="text-[11px] text-subtle truncate">— {sc.desc}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {status !== 'active' && (
            <button
              disabled={!canActivate}
              onClick={() => setStatus('active')}
              className={cn(
                'flex items-center gap-1.5 px-3 h-7 rounded-lg text-[12px] font-semibold transition-colors',
                canActivate
                  ? 'bg-brand-blue text-white hover:bg-brand-blue-hover'
                  : 'bg-surface-3 text-faint cursor-not-allowed border border-brand-border',
              )}
            >
              <Zap className="w-3 h-3" />
              Activate
            </button>
          )}
          {status === 'active' && (
            <button
              onClick={() => setStatus('paused')}
              className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[12px] font-semibold bg-white border border-brand-border text-strong hover:bg-surface-3 transition-colors"
            >
              <Pause className="w-3 h-3" />
              Pause
            </button>
          )}
          {status !== 'inactive' && (
            <button
              onClick={() => setShowDeactivateModal(true)}
              className="px-3 h-7 rounded-lg text-[12px] font-medium text-subtle hover:text-strong hover:bg-white transition-colors"
            >
              Deactivate
            </button>
          )}
        </div>
      </div>

      {/* ── Readiness Checklist ── */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <p className="text-[13px] font-semibold text-strong">Readiness Checklist</p>
          <span className="text-[11px] text-subtle">
            <span className="font-semibold text-brand-blue tabular-nums">{requiredDone}</span> / {requiredTotal} required
          </span>
        </div>
        <div className="divide-y divide-border-soft">
          {checklist.map(item => (
            <div key={item.id} className="flex items-start gap-4 px-6 py-3.5">
              <div className="mt-0.5 flex-shrink-0">
                {item.done
                  ? <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                  : <Circle        className="w-4 h-4 text-faint" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={cn('text-[13px] font-medium', item.done ? 'text-strong' : 'text-subtle')}>
                    {item.label}
                  </p>
                  {item.required && !item.done && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-black bg-surface-3 border border-brand-border px-1.5 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                  {!item.required && (
                    <span className="text-[9px] uppercase tracking-wider text-subtle bg-surface-3 px-1.5 py-0.5 rounded-full">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-subtle">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        {!canActivate && (
          <div className="px-6 py-3 bg-surface-2 border-t border-brand-border flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-subtle flex-shrink-0" />
            <p className="text-[12px] text-muted">
              Complete all required items before activating this engine.
            </p>
          </div>
        )}
      </div>

      {/* ── Quick stats ── */}
      <div className="bg-white rounded-2xl border border-brand-border p-5">
        <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-4">Usage Stats</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Actions today',     value: String(engine.actionsToday)                                },
            { label: 'Actions (7 days)',  value: String(engine.actionsToday * 7)                            },
            { label: 'CONNECTS today',    value: String(Math.round(engine.actionsToday * 1.4))              },
            { label: 'CONNECTS (7 days)', value: String(Math.round(engine.actionsToday * 1.4 * 7))          },
          ].map(stat => (
            <div key={stat.label} className="bg-surface-2 rounded-xl p-3.5 border border-brand-border">
              <p className="text-[10px] text-subtle uppercase tracking-wider mb-1.5">{stat.label}</p>
              <p
                className="text-[22px] font-semibold text-brand-blue tabular-nums leading-none"
              >{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Deactivate modal ── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setShowDeactivateModal(false)} aria-label="Close" />
          <div className="relative bg-white rounded-2xl border border-brand-border shadow-panel p-6 w-[420px]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-3 border border-brand-border flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-brand-black" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-strong">Deactivate Engine</p>
                  <p className="text-[11px] text-subtle">{engine.name} Engine</p>
                </div>
              </div>
              <button onClick={() => setShowDeactivateModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] text-muted mb-6 leading-relaxed">
              Deactivating this engine will stop all processing immediately. Active conversations will not receive
              responses. This action can be reversed at any time.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={() => { setStatus('inactive'); setShowDeactivateModal(false); }}
                className="h-9 px-5 rounded-xl bg-brand-black text-white text-[13px] font-semibold hover:bg-brand-black/90 transition-colors"
              >Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
