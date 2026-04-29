import { useState } from 'react';
import { Plus, Trash2, ChevronDown, KeyRound } from 'lucide-react';
import { cn } from '../../../utils';
import { Switch } from '../../../components/ui/Switch';
import { useApp } from '../../../app/AppContext';

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'choice' | 'date' | 'number';
  required: boolean;
}

const DEFAULT_PREFS = [
  { id: 'pillow',    label: 'Pillow type'             },
  { id: 'allergy',   label: 'Allergies'                },
  { id: 'floor',     label: 'Floor preference'         },
  { id: 'eta',       label: 'Estimated arrival time'   },
  { id: 'transfer',  label: 'Airport transfer'         },
  { id: 'notes',     label: 'Special requests (free text)' },
];

type Tab = 'checkin' | 'prefs' | 'key';

export function ArrivalConfigPage() {
  const { addToast } = useApp();
  const [tab, setTab] = useState<Tab>('checkin');

  /* Check-in instructions */
  const [instructions, setInstructions] = useState(
    `Address: 14 Rue de la Paix, 75002 Paris

Driving: enter via Rue de la Paix; valet at the main entrance (€35/day).
Public transport: Metro Opera (line 3, 7, 8) — 4 min walk.

Standard check-in starts at 3:00 PM. Reception is staffed 24/7.`,
  );
  const [checkinUrl, setCheckinUrl]     = useState('https://grandpalace.com/checkin/{{reservation_id}}');
  const [includeUrl, setIncludeUrl]     = useState(true);
  const [roomReady, setRoomReady]       = useState(true);
  const [roomReadyMsg, setRoomReadyMsg] = useState(
    'Hi {{guest_name}}, your {{room_type}} (#{{room_number}}) is ready ✨ Use the digital key in this thread when you arrive.',
  );

  /* Preferences collection */
  const [enabledPrefs, setEnabledPrefs] = useState<Record<string, boolean>>({
    pillow: true, allergy: true, floor: false, eta: true, transfer: true, notes: true,
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: 'cf1', label: 'Champagne on arrival', type: 'choice', required: false },
  ]);
  const [saveToPms, setSaveToPms]       = useState(true);

  /* Digital key */
  const [keyMode, setKeyMode] = useState<'auto_after' | 'auto_at' | 'manual' | 'off'>('auto_after');
  const [keyTime, setKeyTime] = useState('15:00');
  const [keyType, setKeyType] = useState<'mobile_url' | 'pin' | 'qr'>('mobile_url');
  const [keyUrlTemplate, setKeyUrlTemplate] = useState('https://door.grandpalace.com/k/{{digital_key_link}}');
  const [keyChannels, setKeyChannels] = useState({ whatsapp: true, sms: true, email: false });
  const [primaryKeyChannel, setPrimaryKeyChannel] = useState('whatsapp');
  const [duplicateAfter, setDuplicateAfter]       = useState({ enabled: true, minutes: '15' });
  const [keyMsg, setKeyMsg] = useState(
    `Hi {{guest_name}} — your digital key for room {{room_number}} is ready.
Tap: {{digital_key_link}}
Stay: {{check_in_time}} → {{check_out_time}}.`,
  );
  const [keyInstructions, setKeyInstructions] = useState(
    'Hold your phone within 5 cm of the lock; the door unlocks within 2 seconds.',
  );
  const [videoUrl, setVideoUrl]       = useState('');
  const [includeVideo, setIncludeVideo] = useState(false);
  const [require2fa, setRequire2fa]   = useState(true);
  const [autoDeactivate, setAutoDeactivate] = useState(true);
  const [validHours, setValidHours]   = useState('0');
  const [allowReissue, setAllowReissue] = useState(true);
  const [reissueLimit, setReissueLimit] = useState('3');
  const [reissueOverflow, setReissueOverflow] = useState<'escalate' | 'refuse'>('escalate');
  const [pmsReadRoom, setPmsReadRoom]   = useState(true);
  const [pmsUpdateCheckin, setPmsUpdateCheckin] = useState(true);
  const [pmsLogIssue, setPmsLogIssue]   = useState(true);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'checkin', label: 'Check-in instructions'   },
    { id: 'prefs',   label: 'Guest preferences'        },
    { id: 'key',     label: 'Digital key'              },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6 space-y-5">

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

      {/* ── Check-in instructions ── */}
      {tab === 'checkin' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Arrival instructions</p>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            />
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Online check-in link</p>
            <input
              value={checkinUrl}
              onChange={e => setCheckinUrl(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={includeUrl} onChange={setIncludeUrl} />
              <span className="text-[12px] text-strong">Include the check-in link in the pre-arrival message</span>
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Room-ready notification</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={roomReady} onChange={setRoomReady} />
              <span className="text-[12px] text-strong">Notify the guest when their room is ready</span>
            </label>
            <textarea
              value={roomReadyMsg}
              onChange={e => setRoomReadyMsg(e.target.value)}
              rows={3}
              disabled={!roomReady}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white disabled:opacity-40"
            />
          </div>
        </div>
      )}

      {/* ── Preferences ── */}
      {tab === 'prefs' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border">
              <p className="text-[13px] font-semibold text-strong">Preferences to collect</p>
              <p className="text-[11px] text-subtle mt-0.5">The agent asks for these during pre-arrival</p>
            </div>
            <div className="divide-y divide-border-soft">
              {DEFAULT_PREFS.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <Switch
                    size="sm"
                    checked={enabledPrefs[p.id]}
                    onChange={v => setEnabledPrefs({ ...enabledPrefs, [p.id]: v })}
                  />
                  <span className="text-[12px] text-strong">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
              <p className="text-[13px] font-semibold text-strong">Custom fields</p>
              <button
                onClick={() => setCustomFields(prev => [...prev, { id: `cf${Date.now()}`, label: 'New field', type: 'text', required: false }])}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add field
              </button>
            </div>
            <div className="divide-y divide-border-soft">
              {customFields.map(f => (
                <div key={f.id} className="grid grid-cols-[1fr_140px_120px_28px] gap-3 px-5 py-3 items-center">
                  <input
                    value={f.label}
                    onChange={e => setCustomFields(prev => prev.map(x => x.id === f.id ? { ...x, label: e.target.value } : x))}
                    className="h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                  <div className="relative">
                    <select
                      value={f.type}
                      onChange={e => setCustomFields(prev => prev.map(x => x.id === f.id ? { ...x, type: e.target.value as CustomField['type'] } : x))}
                      className="w-full h-9 pl-3 pr-9 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                    >
                      <option value="text">Text</option>
                      <option value="choice">Choice</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      size="sm"
                      checked={f.required}
                      onChange={v => setCustomFields(prev => prev.map(x => x.id === f.id ? { ...x, required: v } : x))}
                    />
                    <span className="text-[11px] text-strong">Required</span>
                  </label>
                  <button
                    onClick={() => setCustomFields(prev => prev.filter(x => x.id !== f.id))}
                    className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={saveToPms} onChange={setSaveToPms} />
              <div>
                <p className="text-[12px] font-semibold text-strong">Save preferences to PMS reservation notes</p>
                <p className="text-[10px] text-subtle mt-0.5">Cloudbeds — note attached to the booking record.</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── Digital key ── */}
      {tab === 'key' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-blue" />
              <p className="text-[13px] font-semibold text-strong">Issuing mode</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'auto_after', label: 'Auto after online check-in' },
                { id: 'auto_at',    label: 'Auto on check-in day at' },
                { id: 'manual',     label: 'After operator approval' },
                { id: 'off',        label: 'Disabled' },
              ] as const).map(o => (
                <button
                  key={o.id}
                  onClick={() => setKeyMode(o.id)}
                  className={cn(
                    'h-9 rounded-xl border text-[12px] font-semibold transition-colors',
                    keyMode === o.id
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                  )}
                >{o.label}</button>
              ))}
            </div>
            {keyMode === 'auto_at' && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-strong">Issue at</span>
                <input
                  type="time"
                  value={keyTime}
                  onChange={e => setKeyTime(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
                <span className="text-[12px] text-subtle">on the day of check-in</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Key type</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'mobile_url', label: 'Mobile key URL' },
                { id: 'pin',        label: 'PIN code'        },
                { id: 'qr',         label: 'QR code'          },
              ] as const).map(o => (
                <button
                  key={o.id}
                  onClick={() => setKeyType(o.id)}
                  className={cn(
                    'h-9 rounded-xl border text-[12px] font-semibold transition-colors',
                    keyType === o.id
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                  )}
                >{o.label}</button>
              ))}
            </div>
            {keyType === 'mobile_url' && (
              <input
                value={keyUrlTemplate}
                onChange={e => setKeyUrlTemplate(e.target.value)}
                placeholder="https://door.example.com/k/{{digital_key_link}}"
                className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Delivery channels</p>
            <div className="flex items-center gap-4 flex-wrap">
              {(['whatsapp', 'sms', 'email'] as const).map(c => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    size="sm"
                    checked={keyChannels[c]}
                    onChange={v => setKeyChannels({ ...keyChannels, [c]: v })}
                  />
                  <span className="text-[12px] text-strong capitalize">{c}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Primary channel</p>
                <div className="relative">
                  <select
                    value={primaryKeyChannel}
                    onChange={e => setPrimaryKeyChannel(e.target.value)}
                    className="w-full h-9 pl-3 pr-9 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                  >
                    {(['whatsapp', 'sms', 'email'] as const).filter(c => keyChannels[c]).map(c => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Fallback after</p>
                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    checked={duplicateAfter.enabled}
                    onChange={v => setDuplicateAfter({ ...duplicateAfter, enabled: v })}
                  />
                  <input
                    type="number"
                    value={duplicateAfter.minutes}
                    onChange={e => setDuplicateAfter({ ...duplicateAfter, minutes: e.target.value })}
                    disabled={!duplicateAfter.enabled}
                    className="w-14 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-strong text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white disabled:opacity-40"
                  />
                  <span className="text-[11px] text-subtle">min unread</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Key delivery message</p>
            <div className="grid grid-cols-[1fr_280px] gap-4">
              <textarea
                value={keyMsg}
                onChange={e => setKeyMsg(e.target.value)}
                rows={6}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <div className="rounded-2xl bg-[#E5DDD5] p-3 self-start">
                <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm shadow-sm p-3">
                  <p className="text-[11px] text-brand-black whitespace-pre-line leading-relaxed">{keyMsg}</p>
                  <p className="text-[9px] text-strong/50 text-right mt-1.5 tabular-nums">14:32 ✓✓</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-subtle">
              Variables: <code className="font-mono text-brand-blue">{'{{guest_name}}'}</code>,
              {' '}<code className="font-mono text-brand-blue">{'{{room_number}}'}</code>,
              {' '}<code className="font-mono text-brand-blue">{'{{digital_key_link}}'}</code>,
              {' '}<code className="font-mono text-brand-blue">{'{{pin_code}}'}</code>,
              {' '}<code className="font-mono text-brand-blue">{'{{check_in_time}}'}</code>,
              {' '}<code className="font-mono text-brand-blue">{'{{check_out_time}}'}</code>.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Usage instructions</p>
            <textarea
              value={keyInstructions}
              onChange={e => setKeyInstructions(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={includeVideo} onChange={setIncludeVideo} />
              <span className="text-[12px] text-strong">Include video instruction</span>
            </label>
            {includeVideo && (
              <input
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://video.example.com/key-howto.mp4"
                className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Security</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={require2fa} onChange={setRequire2fa} />
              <span className="text-[12px] text-strong">Require 2FA via Vonage Verify before issuing the key</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={autoDeactivate} onChange={setAutoDeactivate} />
              <span className="text-[12px] text-strong">Auto-deactivate the key on check-out</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-strong">Key valid for</span>
              <input
                type="number"
                value={validHours}
                onChange={e => setValidHours(e.target.value)}
                className="w-14 h-8 px-2 rounded-lg border border-brand-border bg-surface-2 text-[12px] text-center text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
              />
              <span className="text-[12px] text-subtle">hours after issue (0 = until check-out)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">Re-issuing</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={allowReissue} onChange={setAllowReissue} />
              <span className="text-[12px] text-strong">Let the guest request a new key via chat</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Max re-issues</p>
                <input
                  type="number"
                  value={reissueLimit}
                  onChange={e => setReissueLimit(e.target.value)}
                  disabled={!allowReissue}
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white disabled:opacity-40"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">When exceeded</p>
                <div className="relative">
                  <select
                    value={reissueOverflow}
                    onChange={e => setReissueOverflow(e.target.value as 'escalate' | 'refuse')}
                    disabled={!allowReissue}
                    className="w-full h-9 pl-3 pr-9 rounded-xl border border-brand-border bg-surface-2 text-[12px] text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light disabled:opacity-40"
                  >
                    <option value="escalate">Escalate to reception</option>
                    <option value="refuse">Refuse with explanation</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3">
            <p className="text-[13px] font-semibold text-strong">PMS sync</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={pmsReadRoom} onChange={setPmsReadRoom} />
              <span className="text-[12px] text-strong">Read room number from PMS automatically</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={pmsUpdateCheckin} onChange={setPmsUpdateCheckin} />
              <span className="text-[12px] text-strong">Update PMS check-in status when key issued</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={pmsLogIssue} onChange={setPmsLogIssue} />
              <span className="text-[12px] text-strong">Log key issuance in reservation notes</span>
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-end pb-2">
        <button
          onClick={() => addToast({ type: 'success', title: 'Arrival configuration saved' })}
          className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
        >Save changes</button>
      </div>
    </div>
  );
}
