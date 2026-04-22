import { useState } from 'react';
import { Plus, Play, Pause, ChevronRight, Clock, Users, CheckCircle, ArrowRight, Mail, MessageSquare, GitBranch, Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockSequences } from '../../data/mock/sequences';
import { engineColors, channelLabels, formatRelativeTime, cn } from '../../utils';
import type { Sequence, SequenceStep } from '../../types';
import { useApp } from '../../app/AppContext';

const stepTypeIcons = {
  message: Mail,
  wait: Clock,
  condition: GitBranch,
  action: Zap,
};

const stepTypeColors = {
  message: 'bg-white border-[#EDEEF1] text-[#0E1013]',
  wait: 'bg-white border-[#EDEEF1] text-[#0E1013]',
  condition: 'bg-white border-[#EDEEF1] text-[#0E1013]',
  action: 'bg-white border-[#EDEEF1] text-[#0E1013]',
};

function SequenceStepCard({ step, index }: { step: SequenceStep; index: number }) {
  const Icon = stepTypeIcons[step.type];
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'flex-shrink-0 w-36 border rounded-xl px-3 py-2.5 text-left',
        stepTypeColors[step.type],
      )}>
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="w-3 h-3" />
          <span className="text-[10px] font-semibold uppercase tracking-wider capitalize">{step.type}</span>
        </div>
        {step.type === 'message' && (
          <div>
            <p className="text-xs font-medium truncate">{step.template?.replace(/_/g, ' ')}</p>
            {step.channel && <p className="text-[10px] opacity-70 mt-0.5">{channelLabels[step.channel]}</p>}
          </div>
        )}
        {step.type === 'wait' && (
          <p className="text-xs font-medium">{step.waitDuration}</p>
        )}
        {step.type === 'condition' && (
          <p className="text-[10px] font-medium truncate">{step.condition}</p>
        )}
        {step.type === 'action' && (
          <p className="text-xs font-medium">{step.actionType?.replace(/_/g, ' ')}</p>
        )}
      </div>
      {index < 100 && (
        <ArrowRight className="w-4 h-4 text-[#D1CFCF] flex-shrink-0" />
      )}
    </div>
  );
}

function SequenceRow({ seq, isSelected, onClick }: { seq: Sequence; isSelected: boolean; onClick: () => void }) {
  const { addToast } = useApp();
  return (
    <tr
      className={cn('hover:bg-[#F9F9F9] cursor-pointer transition-colors', isSelected && 'bg-[#EEF2FC]')}
      onClick={onClick}
    >
      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-[#0E1013]">{seq.name}</p>
          <p className="text-xs text-[#5C6370] mt-0.5">{seq.trigger}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', engineColors[seq.engineName])}>
          {seq.engineName}
        </span>
      </td>
      <td className="px-4 py-4">
        <Badge variant={seq.status === 'active' ? 'blue' : seq.status === 'paused' ? 'default' : 'default'}>
          {seq.status}
        </Badge>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="w-3.5 h-3.5 text-[#8B9299]" />
          <span className="font-semibold text-[#0E1013]">{seq.enrolledGuests}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#F6F7F9] rounded-full h-1.5 w-20">
            <div
              className="bg-[#2355A7] h-1.5 rounded-full"
              style={{ width: `${seq.completionRate * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[#0E1013]">{(seq.completionRate * 100).toFixed(0)}%</span>
        </div>
      </td>
      <td className="px-4 py-4 text-xs text-[#5C6370] whitespace-nowrap">
        {formatRelativeTime(seq.lastLaunch)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => addToast({ type: 'success', title: seq.status === 'active' ? `${seq.name} paused` : `${seq.name} activated` })}
          >
            {seq.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          <ChevronRight className="w-3.5 h-3.5 text-[#D1CFCF]" />
        </div>
      </td>
    </tr>
  );
}

export function SequencesPage() {
  const { addToast } = useApp();
  const [selectedSeq, setSelectedSeq] = useState<Sequence | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3.5 flex items-center gap-3 flex-shrink-0 bg-white" style={{ borderBottom: '1px solid #EDEEF1' }}>
          <h1
            className="text-[18px] font-semibold text-[#0E1013] flex-1 tracking-tight"
            style={{ fontFamily: "'Azeret Mono', monospace" }}
          >Sequences</h1>
          <Button
            size="sm"
            variant="primary"
            onClick={() => addToast({ type: 'info', title: 'Builder opened', message: 'New sequence draft created' })}
          >
            <Plus className="w-3.5 h-3.5" /> New Sequence
          </Button>
        </div>

        {/* Stats row */}
        <div className="px-6 py-3 bg-white flex items-center gap-6" style={{ borderBottom: '1px solid #EDEEF1' }}>
          {[
            { label: 'Total Sequences', value: mockSequences.length },
            { label: 'Active', value: mockSequences.filter(s => s.status === 'active').length },
            { label: 'Total Enrolled', value: mockSequences.reduce((sum, s) => sum + s.enrolledGuests, 0) },
            { label: 'Avg Completion', value: `${Math.round(mockSequences.reduce((sum, s) => sum + s.completionRate, 0) / mockSequences.length * 100)}%` },
          ].map(s => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span
                className="text-[15px] font-semibold text-[#0E1013] tabular-nums"
                style={{ fontFamily: "'Azeret Mono', monospace" }}
              >{s.value}</span>
              <span className="text-[11px] text-[#8B9299]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-[#EDEEF1] sticky top-0 bg-white z-10">
              <tr>
                {['Sequence', 'Engine', 'Status', 'Enrolled', 'Completion', 'Last Run', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#8B9299] uppercase tracking-wider first:px-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEF1]">
              {mockSequences.map(seq => (
                <SequenceRow
                  key={seq.id}
                  seq={seq}
                  isSelected={selectedSeq?.id === seq.id}
                  onClick={() => setSelectedSeq(seq === selectedSeq ? null : seq)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sequence Detail / Builder */}
      {selectedSeq && (
        <div className="w-[520px] flex-shrink-0 border-l border-[#EDEEF1] bg-white flex flex-col overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-[#EDEEF1] flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold text-[#0E1013]">{selectedSeq.name}</h2>
                <p className="text-xs text-[#5C6370] mt-0.5">Trigger: {selectedSeq.trigger}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedSeq.status === 'active' ? 'blue' : 'default'}>
                  {selectedSeq.status}
                </Badge>
                <button onClick={() => setSelectedSeq(null)} className="text-[#8B9299] hover:text-[#5C6370] text-lg">×</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3">
                <p className="text-[10px] text-[#8B9299] uppercase tracking-wider mb-0.5">Enrolled</p>
                <p className="text-[18px] font-semibold text-[#0E1013] tabular-nums leading-tight" style={{ fontFamily: "'Azeret Mono', monospace" }}>{selectedSeq.enrolledGuests}</p>
              </div>
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3">
                <p className="text-[10px] text-[#8B9299] uppercase tracking-wider mb-0.5">Completion</p>
                <p className="text-[18px] font-semibold text-[#0E1013] leading-tight" style={{ fontFamily: "'Azeret Mono', monospace" }}>{(selectedSeq.completionRate * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-3">
                <p className="text-[10px] text-[#8B9299] uppercase tracking-wider mb-0.5">Steps</p>
                <p className="text-[18px] font-semibold text-[#0E1013] leading-tight" style={{ fontFamily: "'Azeret Mono', monospace" }}>{selectedSeq.steps.length}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-xs font-semibold text-[#8B9299] uppercase tracking-wider mb-4">Sequence Flow</h3>
            <div className="flex flex-col gap-0">
              {selectedSeq.steps.map((step, i) => (
                <div key={step.id} className="flex flex-col items-start">
                  <SequenceStepCard step={step} index={i} />
                  {i < selectedSeq.steps.length - 1 && (
                    <div className="w-0.5 h-4 bg-[#EDEEF1] ml-[68px] flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#EDEEF1]">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => addToast({ type: 'info', title: 'Sequence editor opened', message: 'Visual builder loaded in new pane' })}
              >
                <Plus className="w-3.5 h-3.5" /> Add Step
              </Button>
            </div>

            <div className="mt-5 pt-5 border-t border-[#EDEEF1]">
              <h3 className="text-xs font-semibold text-[#8B9299] uppercase tracking-wider mb-3">Enrollment</h3>
              <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5C6370]">Enrollment Type</span>
                  <span className="font-medium text-[#0E1013]">Automatic — Trigger-based</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5C6370]">Trigger</span>
                  <span className="font-medium text-[#0E1013]">{selectedSeq.trigger}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5C6370]">Engine</span>
                  <span className={cn('font-medium px-2 py-0.5 rounded-full text-xs', engineColors[selectedSeq.engineName])}>
                    {selectedSeq.engineName}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-[#EDEEF1]">
              <h3 className="text-xs font-semibold text-[#8B9299] uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedSeq.tags.map(tag => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                size="sm"
                variant={selectedSeq.status === 'active' ? 'secondary' : 'primary'}
                className="flex-1"
                onClick={() => addToast({ type: 'success', title: selectedSeq.status === 'active' ? 'Paused' : 'Activated' })}
              >
                {selectedSeq.status === 'active' ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Activate</>}
              </Button>
              <Button size="sm" variant="outline" onClick={() => addToast({ type: 'info', title: 'Edit mode', message: 'Sequence opened for editing' })}>
                Edit Sequence
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
