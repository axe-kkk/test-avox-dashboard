import { useState } from 'react';
import { Plus, Trash2, GripVertical, Star } from 'lucide-react';
import { cn } from '../../../utils';
import { Switch } from '../../../components/ui/Switch';
import { useApp } from '../../../app/AppContext';

interface Platform {
  id: string;
  name: string;
  connected: boolean;
  enabled: boolean;
  reviewUrl: string;
}

const INITIAL_PLATFORMS: Platform[] = [
  { id: 'google',  name: 'Google Reviews', connected: true,  enabled: true,  reviewUrl: 'https://g.page/grandpalace/review' },
  { id: 'booking', name: 'Booking.com',     connected: true,  enabled: true,  reviewUrl: 'https://booking.com/hotel/grandpalace/review' },
  { id: 'tripadv', name: 'TripAdvisor',     connected: false, enabled: false, reviewUrl: '' },
  { id: 'expedia', name: 'Expedia',         connected: false, enabled: false, reviewUrl: '' },
];

interface Question {
  id: string;
  text: string;
  type: 'scale' | 'text' | 'choice' | 'yesno';
  required: boolean;
}

const INITIAL_QUESTIONS: Question[] = [
  { id: 'q1', text: 'How likely are you to recommend us to a friend?', type: 'scale',  required: true  },
  { id: 'q2', text: 'What was the highlight of your stay?',             type: 'text',   required: false },
  { id: 'q3', text: 'Did everything in the room work as expected?',     type: 'yesno',  required: true  },
];

type Tab = 'platforms' | 'survey' | 'negative';

export function ReputationConfigPage() {
  const { addToast } = useApp();
  const [tab, setTab] = useState<Tab>('platforms');

  const [platforms, setPlatforms] = useState<Platform[]>(INITIAL_PLATFORMS);

  const [timing, setTiming] = useState({ amount: '6', unit: 'hours' as 'hours' | 'days' });
  const [surveyType, setSurveyType] = useState<'nps' | 'csat' | 'custom'>('nps');
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [reviewThreshold, setReviewThreshold] = useState('4');

  const [responseMode, setResponseMode] = useState<'auto' | 'draft' | 'notify'>('draft');
  const [negThreshold, setNegThreshold] = useState(3);
  const [responseTemplate, setResponseTemplate] = useState(
    'Tone: warm, professional, sincere apology. Always mention: that we hear them, the specific issue raised, the action we are taking. Never mention: monetary compensation in public, names of staff members.',
  );

  const onDragStart = (id: string) => setDraggingId(id);
  const onDrop = (id: string) => {
    if (!draggingId || draggingId === id) { setDraggingId(null); return; }
    setQuestions(prev => {
      const from = prev.findIndex(q => q.id === draggingId);
      const to   = prev.findIndex(q => q.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggingId(null);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'platforms', label: 'Review platforms' },
    { id: 'survey',    label: 'Post-stay survey'  },
    { id: 'negative',  label: 'Negative reviews'   },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-6 space-y-5">

      <div className="flex border-b border-brand-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2.5 text-[12px] font-semibold border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-subtle hover:text-strong',
            )}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Review platforms ── */}
      {tab === 'platforms' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {platforms.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-strong">{p.name}</p>
                    <p className={cn('text-[11px] mt-0.5', p.connected ? 'text-brand-blue' : 'text-subtle')}>
                      {p.connected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  {p.connected ? (
                    <Switch
                      checked={p.enabled}
                      onChange={v => setPlatforms(prev => prev.map(x => x.id === p.id ? { ...x, enabled: v } : x))}
                    />
                  ) : (
                    <button
                      onClick={() => setPlatforms(prev => prev.map(x => x.id === p.id ? { ...x, connected: true, enabled: true } : x))}
                      className="h-8 px-3 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
                    >Connect</button>
                  )}
                </div>
                {p.connected && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Review URL</p>
                    <input
                      value={p.reviewUrl}
                      onChange={e => setPlatforms(prev => prev.map(x => x.id === p.id ? { ...x, reviewUrl: e.target.value } : x))}
                      placeholder="https://platform.com/your-review-link"
                      className="w-full h-8 px-3 rounded-lg border border-brand-border bg-surface-2 text-[11px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Survey config ── */}
      {tab === 'survey' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Send timing</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-strong">Send</span>
              <input
                type="number"
                value={timing.amount}
                onChange={e => setTiming({ ...timing, amount: e.target.value })}
                className="w-16 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <div className="relative">
                <select
                  value={timing.unit}
                  onChange={e => setTiming({ ...timing, unit: e.target.value as 'hours' | 'days' })}
                  className="h-8 pl-3 pr-8 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                >
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
              </div>
              <span className="text-[12px] text-subtle">after check-out</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Survey type</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'nps',    label: 'NPS (0–10)'                  },
                { id: 'csat',   label: 'CSAT (1–5)'                   },
                { id: 'custom', label: 'Custom — build your own'      },
              ] as const).map(o => (
                <button
                  key={o.id}
                  onClick={() => setSurveyType(o.id)}
                  className={cn(
                    'h-9 rounded-xl border text-[12px] font-semibold transition-colors',
                    surveyType === o.id
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                  )}
                >{o.label}</button>
              ))}
            </div>
          </div>

          {surveyType === 'custom' && (
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-strong">Question builder</p>
                  <p className="text-[11px] text-subtle mt-0.5">Drag to reorder</p>
                </div>
                <button
                  onClick={() => setQuestions(prev => [...prev, { id: `q${Date.now()}`, text: '', type: 'text', required: false }])}
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add question
                </button>
              </div>
              <div className="divide-y divide-border-soft">
                {questions.map(q => (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={() => onDragStart(q.id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(q.id)}
                    className={cn(
                      'grid grid-cols-[16px_1fr_140px_120px_28px] gap-3 items-center px-5 py-3 transition-colors',
                      draggingId === q.id ? 'opacity-40' : 'hover:bg-surface-2',
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-faint cursor-grab active:cursor-grabbing" />
                    <input
                      value={q.text}
                      onChange={e => setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, text: e.target.value } : x))}
                      placeholder="Question text…"
                      className="h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                    />
                    <select
                      value={q.type}
                      onChange={e => setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, type: e.target.value as Question['type'] } : x))}
                      className="h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                    >
                      <option value="scale">Scale</option>
                      <option value="text">Free text</option>
                      <option value="choice">Multiple choice</option>
                      <option value="yesno">Yes / No</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch
                        size="sm"
                        checked={q.required}
                        onChange={v => setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, required: v } : x))}
                      />
                      <span className="text-[11px] text-strong">Required</span>
                    </label>
                    <button
                      onClick={() => setQuestions(prev => prev.filter(x => x.id !== q.id))}
                      className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-brand-border p-5">
            <p className="text-[13px] font-semibold text-strong mb-3">Review-prompt trigger</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-strong">If CSAT ≥</span>
              <input
                type="number"
                min={1}
                max={5}
                value={reviewThreshold}
                onChange={e => setReviewThreshold(e.target.value)}
                className="w-12 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <span className="text-[12px] text-subtle">→ ask the guest to leave a public review</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Negative reviews ── */}
      {tab === 'negative' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Response mode</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'auto',   label: 'AI auto-response'            },
                { id: 'draft',  label: 'AI draft → manager approval' },
                { id: 'notify', label: 'Notify manager only'         },
              ] as const).map(o => (
                <button
                  key={o.id}
                  onClick={() => setResponseMode(o.id)}
                  className={cn(
                    'h-9 rounded-xl border text-[12px] font-semibold transition-colors',
                    responseMode === o.id
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                  )}
                >{o.label}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Negative threshold</p>
            <p className="text-[11px] text-subtle">Reviews at or below this rating are treated as negative.</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={negThreshold}
                onChange={e => setNegThreshold(Number(e.target.value))}
                className="flex-1 accent-[#2355A7]"
              />
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    className={cn(
                      'w-4 h-4',
                      s <= negThreshold ? 'fill-brand-blue text-brand-blue' : 'fill-transparent text-faint',
                    )}
                  />
                ))}
                <span
                  className="ml-2 text-[12px] font-semibold text-brand-blue tabular-nums"
                  style={{ fontFamily: "'Azeret Mono', monospace" }}
                >≤ {negThreshold}/5</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">AI response template</p>
            <p className="text-[11px] text-subtle">Instruction for the AI: tone, what to mention, what to avoid.</p>
            <textarea
              value={responseTemplate}
              onChange={e => setResponseTemplate(e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pb-2">
        <button
          onClick={() => addToast({ type: 'success', title: 'Reputation configuration saved' })}
          className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
        >Save changes</button>
      </div>
    </div>
  );
}
