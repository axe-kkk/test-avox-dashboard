import { useState } from 'react';
import { Plus, Mail, X, Pause, Play } from 'lucide-react';
import { useApp } from '../../../app/AppContext';
import { Button } from '../../../components/ui/Button';
import { AnalyticsShell } from '../components/AnalyticsShell';
import { SectionCard } from '../components/SectionCard';
import { type Period, scheduledReports } from '../lib/mockData';
import { cn } from '../../../utils';

const SECTIONS = [
  'Overview dashboard', 'Connects', 'Conversion engine', 'Reservation engine',
  'Upsell engine', 'Arrival engine', 'Concierge engine', 'Recovery engine',
  'Reputation engine', 'Channels', 'Team', 'Guests',
];

export function ScheduledReportsPage() {
  const { addToast } = useApp();
  const [period, setPeriod] = useState<Period>('30d');
  const [openModal, setOpenModal] = useState(false);
  const [reports, setReports] = useState(scheduledReports);

  // form state
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('Weekly');
  const [recipients, setRecipients] = useState<string>('');
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set(['Overview dashboard', 'Connects']));
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [time, setTime] = useState('08:00');

  const toggleSection = (s: string) => {
    setSelectedSections(prev => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s); else n.add(s);
      return n;
    });
  };

  const create = () => {
    if (!name.trim() || !recipients.trim()) {
      addToast({ type: 'warning', title: 'Name and recipients are required' });
      return;
    }
    setReports(rep => [{
      id: `r-${rep.length + 1}`,
      name,
      frequency,
      recipients: recipients.split(',').map(r => r.trim()).filter(Boolean),
      lastRun: '—',
      status: 'active' as const,
    }, ...rep]);
    addToast({ type: 'success', title: 'Report scheduled', message: `${name} will run ${frequency.toLowerCase()}.` });
    setOpenModal(false);
    setName('');
    setRecipients('');
  };

  const togglePause = (id: string) => {
    setReports(rep => rep.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' as const : 'active' as const } : r));
  };

  return (
    <AnalyticsShell
      eyebrow="Settings"
      title="Scheduled reports"
      subtitle="Send analytics digests on a schedule, to whichever stakeholders need them."
      period={period}
      onPeriodChange={setPeriod}
      rightSlot={
        <Button size="sm" className="h-10" onClick={() => setOpenModal(true)}>
          <Plus className="w-3.5 h-3.5" /> Create report
        </Button>
      }
    >
      <SectionCard title="Reports" subtitle={`${reports.length} configured`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border">
              {['Name', 'Frequency', 'Recipients', 'Last sent', 'Status', ''].map(h => (
                <th key={h} className="py-2.5 text-left text-[10px] font-semibold text-subtle uppercase tracking-[0.14em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {reports.map(r => (
              <tr key={r.id} className="hover:bg-surface-2 transition-colors">
                <td className="py-3.5 text-[13px] text-strong font-medium">{r.name}</td>
                <td className="py-3.5 text-[12px] text-muted">{r.frequency}</td>
                <td className="py-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {r.recipients.map(rec => (
                      <span key={rec} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-surface-3 text-[11px] text-muted border border-brand-border">
                        <Mail className="w-3 h-3" />
                        {rec}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 text-[12px] text-muted tabular-nums">{r.lastRun}</td>
                <td className="py-3.5">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-semibold border',
                    r.status === 'active'
                      ? 'bg-brand-blue-50 text-brand-blue border-brand-blue-light'
                      : 'bg-surface-3 text-subtle border-brand-border',
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', r.status === 'active' ? 'bg-brand-blue' : 'bg-faint')} />
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => togglePause(r.id)}
                    className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-brand-border text-[12px] font-medium text-muted hover:bg-surface-3 hover:text-strong transition-colors"
                  >
                    {r.status === 'active' ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Resume</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Create modal */}
      {openModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-[#0E1013]/30" onClick={() => setOpenModal(false)} aria-label="Close" />
          <div className="relative w-[560px] max-w-[calc(100vw-32px)] max-h-[90vh] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-center justify-between flex-shrink-0">
              <h3 className="text-[14px] font-semibold text-strong">Create scheduled report</h3>
              <button onClick={() => setOpenModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1.5">Name</p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Weekly executive digest"
                  className="w-full h-9 px-3 rounded-lg border border-brand-border bg-white text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1.5">Frequency</p>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-brand-border bg-white text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1.5">Time</p>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-brand-border bg-white text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1.5">Recipients</p>
                <input
                  value={recipients}
                  onChange={e => setRecipients(e.target.value)}
                  placeholder="ceo@hotel.com, gm@hotel.com"
                  className="w-full h-9 px-3 rounded-lg border border-brand-border bg-white text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                />
                <p className="text-[10px] text-subtle mt-1.5">Comma-separated email addresses</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-2">Sections to include</p>
                <div className="grid grid-cols-2 gap-2">
                  {SECTIONS.map(s => (
                    <label
                      key={s}
                      className={cn(
                        'flex items-center gap-2 h-9 px-3 rounded-lg border text-[12px] cursor-pointer transition-colors',
                        selectedSections.has(s)
                          ? 'bg-brand-blue-50 border-brand-blue-light text-brand-blue font-semibold'
                          : 'bg-white border-brand-border text-muted hover:border-faint',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSections.has(s)}
                        onChange={() => toggleSection(s)}
                        className="rounded border-brand-border accent-brand-blue"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.14em] mb-1.5">Format</p>
                <div className="inline-flex bg-surface-3 rounded-lg p-1 border border-brand-border">
                  {(['PDF', 'CSV'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={cn(
                        'h-7 px-3 rounded-md text-[11px] font-semibold transition-colors',
                        format === f ? 'bg-white text-brand-blue shadow-soft' : 'text-muted hover:text-strong',
                      )}
                    >{f}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setOpenModal(false)}
                className="h-9 px-4 rounded-lg border border-brand-border text-[12px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={create}
                className="h-9 px-5 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-[#1f4b93] transition-colors"
              >Schedule report</button>
            </div>
          </div>
        </div>
      )}
    </AnalyticsShell>
  );
}
