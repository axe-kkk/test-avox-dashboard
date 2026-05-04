import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Plus, Settings2, RefreshCw, ExternalLink, AlertTriangle, CheckCircle, XCircle, BarChart2, X, Check, Send, Building2, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatusDot } from '../../components/ui/StatusDot';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { Select } from '../../components/ui/Select';
import { mockChannels } from '../../data/mock/channels';
import { channelLabels, channelColors, formatCurrency, cn } from '../../utils';
import type { Channel, ChannelType } from '../../types';
import { useApp } from '../../app/AppContext';

interface InstallField {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  helpText?: string;
  helpHref?: string;
}

interface InstallSpec {
  sectionTitle: string;
  /** Optional secondary header line right-aligned inside the form card. */
  sectionSubtitle?: string;
  /** Brand/provider shown in helper copy (e.g. "Vonage" for SMS). Falls back to the integration label. */
  brandName?: string;
  fields: InstallField[];
  /** When set, the modal hides the top-right "Apply" button and renders a
   *  full-width primary connect button at the bottom of the form card. */
  connectButton?: string;
  /** Optional yellow info card rendered below the form (e.g. "How does it work?"). */
  infoTitle?: string;
  infoBody?: string;
}

const INSTALL_SPEC: Record<string, InstallSpec> = {
  whatsapp: {
    sectionTitle: 'Connect a phone number',
    fields: [
      { name: 'phone', label: 'Phone number', placeholder: '+33 1 42 86 00 00', required: true },
      { name: 'token', label: 'Bot API token', placeholder: 'EAAG…', type: 'password', required: true, helpText: 'Where to find the API token?', helpHref: '#' },
    ],
  },
  telegram: {
    sectionTitle: 'Connect a Telegram bot',
    fields: [
      { name: 'token', label: 'Bot API token', placeholder: '123456:ABCDef…', type: 'password', required: true, helpText: 'Where to find the API token?', helpHref: '#' },
    ],
  },
  viber: {
    sectionTitle: 'Connect a Viber bot',
    fields: [
      { name: 'sender', label: 'Sender name', placeholder: 'Grand Meridian', required: true },
      { name: 'token', label: 'Bot API token', placeholder: '4d1b3…', type: 'password', required: true, helpText: 'Where to find the API token?', helpHref: '#' },
    ],
  },
  messenger: {
    sectionTitle: 'Connect a Facebook Page',
    fields: [
      { name: 'page_id', label: 'Page ID', placeholder: '101234567890123', required: true },
      { name: 'token', label: 'Page access token', placeholder: 'EAAG…', type: 'password', required: true, helpText: 'Where to find the API token?', helpHref: '#' },
    ],
  },
  instagram: {
    sectionTitle: 'Connect an Instagram Business account',
    fields: [
      { name: 'account_id', label: 'IG business account ID', placeholder: '17841…', required: true },
      { name: 'token', label: 'Access token', placeholder: 'EAAG…', type: 'password', required: true, helpText: 'Where to find the API token?', helpHref: '#' },
    ],
  },
  web_widget: {
    sectionTitle: 'Add a website domain',
    fields: [
      { name: 'name', label: 'Widget name', placeholder: 'Main site', required: true },
      { name: 'domain', label: 'Domain', placeholder: 'grandmeridian.com', required: true },
    ],
  },
  sms: {
    sectionTitle: 'Connect Your Website to Vonage',
    sectionSubtitle: 'Connect AVOX to Vonage to get started',
    brandName: 'Vonage',
    fields: [
      { name: 'api_key', label: 'Vonage Account API Key', placeholder: 'Your Vonage Account API Key', required: true },
      { name: 'api_secret', label: 'Vonage Account API Secret', placeholder: 'Your Vonage Account API Secret', type: 'password', required: true },
    ],
    connectButton: 'Save & Connect to Vonage',
    infoTitle: 'How does the Vonage integration work?',
    infoBody:
      'The Vonage plugin lets you receive and reply to SMS sent to your Vonage phone number directly from the AVOX dashboard. Incoming SMS appear as regular conversations and can be replied to from the inbox.',
  },
  // `email` uses a custom modal (`EmailInstallModal`) — this entry only
  // marks the type as supported so the Add button shows the install flow.
  email: {
    sectionTitle: '',
    fields: [],
  },
  rcs: {
    sectionTitle: 'Connect Your Website to Vonage',
    sectionSubtitle: 'Connect AVOX to Vonage to get started',
    brandName: 'Vonage',
    fields: [
      { name: 'api_key', label: 'Vonage Account API Key', placeholder: 'Your Vonage Account API Key', required: true },
      { name: 'api_secret', label: 'Vonage Account API Secret', placeholder: 'Your Vonage Account API Secret', type: 'password', required: true },
    ],
    connectButton: 'Save & Connect to Vonage',
    infoTitle: 'How does the Vonage integration work?',
    infoBody:
      'The Vonage RCS plugin lets you send rich, two-way RCS messages to your guests directly from the AVOX dashboard. Incoming RCS messages appear as regular conversations and can be replied to from the inbox.',
  },
  // `pms` uses a custom assisted-setup modal (`RequestIntegrationModal`) — this entry
  // only marks the type as supported so the Add button shows the request flow.
  pms: {
    sectionTitle: '',
    fields: [],
  },
  mcp: {
    sectionTitle: 'Connect an MCP server',
    fields: [
      { name: 'name', label: 'Server name', placeholder: 'Internal-tools', required: true },
      { name: 'url', label: 'Server URL', placeholder: 'https://mcp.example.com', required: true },
      { name: 'token', label: 'Auth token', type: 'password' },
    ],
  },
  api_keys: {
    sectionTitle: 'Generate an API key',
    fields: [
      { name: 'name', label: 'Key name', placeholder: 'mobile-app', required: true },
      { name: 'scope', label: 'Scope', type: 'select', required: true, options: [
        { value: 'read', label: 'Read only' }, { value: 'write', label: 'Read & write' }, { value: 'admin', label: 'Admin' },
      ] },
    ],
  },
  ota_email: {
    sectionTitle: 'Connect an OTA mailbox',
    fields: [
      { name: 'platform', label: 'OTA platform', type: 'select', required: true, options: [
        { value: 'booking', label: 'Booking.com' }, { value: 'expedia', label: 'Expedia' }, { value: 'agoda', label: 'Agoda' },
      ] },
      { name: 'forward_to', label: 'Forward inbox', placeholder: 'reservations@hotel.com', required: true },
    ],
  },
};

const INTEGRATION_LABELS: Record<string, string> = {
  web_widget: 'Web Widget',
  whatsapp:   'WhatsApp',
  sms:        'SMS',
  telegram:   'Telegram',
  viber:      'Viber',
  messenger:  'Messenger',
  instagram:  'Instagram',
  email:      'Email',
  rcs:        'RCS',
  pms:        'PMS',
  mcp:        'MCP',
  api_keys:   'API keys',
  ota_email:  'OTA Email',
};

const channelDescriptions: Record<string, string> = {
  whatsapp: 'Two-way WhatsApp Business messaging. Ideal for pre-arrival, in-stay concierge, and upsell.',
  email: 'Primary email channel for booking confirmations, pre-arrival sequences, and post-stay follow-ups.',
  messenger: 'Facebook Messenger integration for social-first guests. Supports rich media and quick replies.',
  instagram: 'Instagram Direct Messages. Great for millennial and Gen-Z travellers.',
  telegram: 'Telegram bot for tech-savvy guests. High open rates and rich media support.',
  sms: 'Outbound SMS for critical notifications: check-in links, emergency alerts, OTP.',
  web_widget: 'Embedded chat widget on your hotel website. Highest conversion intent.',
  ota_email: 'Monitor and respond to OTA messages (Booking.com, Expedia) from a single inbox.',
};

const TYPE_INTRO: Record<string, string> = {
  web_widget:
    'If you operate multiple websites or domains, you can install a separate web widget on each — its appearance and language can be configured per site.',
  whatsapp:
    'Connect a WhatsApp Business number to handle pre-arrival, in-stay concierge, and post-stay messaging from one inbox.',
  sms:
    'Outbound SMS for critical notifications: check-in links, emergency alerts, OTP confirmations.',
  telegram:
    'Connect a Telegram bot to reach tech-savvy guests and benefit from high open rates and rich media support.',
  viber:
    'Connect a Viber business account for guest messaging on networks where Viber is dominant.',
  messenger:
    'Connect a Facebook Page to receive Messenger conversations directly into the inbox.',
  instagram:
    'Connect Instagram Direct Messages for social-first guests; replies route into the same inbox.',
  email:
    'Primary email channel for booking confirmations, pre-arrival sequences, and post-stay follow-ups.',
  rcs:
    'Rich Communication Services — modern carrier messaging with rich media and read receipts.',
  pms:
    'Connect your Property Management System to read reservations, room status, and guest profiles.',
  mcp:
    'Model Context Protocol servers expose tools and data to AI engines through a secure interface.',
  api_keys:
    'Manage API keys used by your engines and external integrations. Rotate or revoke at any time.',
  ota_email:
    'Monitor and reply to OTA messages (Booking.com, Expedia) from a single inbox.',
};

function StatusBadge({ status }: { status: Channel['status'] }) {
  const variant: 'blueSoft' | 'blue' | 'default' =
    status === 'connected' ? 'blue' : status === 'pending' ? 'blueSoft' : 'default';
  return (
    <Badge variant={variant} className="capitalize">
      {status === 'connected' ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
      {status}
    </Badge>
  );
}

const statusVariants: Record<string, 'blue' | 'dark' | 'default'> = {
  connected: 'blue',
  disconnected: 'dark',
  warning: 'default',
  pending: 'default',
};

function ChannelCard({ channel }: { channel: Channel }) {
  const [expanded, setExpanded] = useState(false);
  const { addToast } = useApp();

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            'bg-[#F6F7F9]',
          )}>
            <ChannelIcon channel={channel.type} size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-[#0E1013]">{channel.name}</h3>
              <StatusDot status={channel.status as Parameters<typeof StatusDot>[0]['status']} />
            </div>
            <p className="text-xs text-[#5C6370]">
              {channel.accountName ?? channel.phoneNumber ?? channel.email ?? '—'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Badge variant={statusVariants[channel.status]}>
              {channel.status}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-lg px-3 py-2">
            <p className="text-[10px] text-[#8B9299] uppercase tracking-wider">Messages (30d)</p>
            <p className="text-[14px] font-semibold text-[#0E1013] tabular-nums leading-tight">{channel.messagesLast30d.toLocaleString()}</p>
          </div>
          <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-lg px-3 py-2">
            <p className="text-[10px] text-[#8B9299] uppercase tracking-wider">Avg Response</p>
            <p className="text-[14px] font-semibold text-[#0E1013] leading-tight">{channel.avgResponseTime}</p>
          </div>
          <div className="bg-[#F9F9F9] border border-[#EDEEF1] rounded-lg px-3 py-2">
            <p className="text-[10px] text-[#8B9299] uppercase tracking-wider">Conversion</p>
            <p className="text-[14px] font-semibold text-[#0E1013] leading-tight">{(channel.conversionRate * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#EDEEF1]">
          {channel.status === 'connected' ? (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => addToast({ type: 'warning', title: `${channelLabels[channel.type]} disconnected` })}
            >
              <XCircle className="w-3 h-3" /> Disconnect
            </Button>
          ) : (
            <Button
              size="xs"
              variant="primary"
              onClick={() => addToast({ type: 'success', title: `${channelLabels[channel.type]} connected` })}
            >
              <CheckCircle className="w-3 h-3" /> Connect
            </Button>
          )}
          <Button size="xs" variant="ghost" onClick={() => addToast({ type: 'info', title: 'Syncing...', message: 'Channel sync initiated' })}>
            <RefreshCw className="w-3 h-3" /> Sync
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setExpanded(!expanded)}>
            <Settings2 className="w-3 h-3" /> {expanded ? 'Hide Settings' : 'Settings'}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#EDEEF1] bg-[#F9F9F9] px-5 py-4 space-y-4">
          <p className="text-xs text-[#5C6370] leading-relaxed">{channelDescriptions[channel.type]}</p>

          {channel.status === 'warning' && (
            <div className="flex items-start gap-2 bg-white border border-[#EDEEF1] rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-[#0E1013] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#0E1013]">Attention Required</p>
                <p className="text-[10px] text-[#5C6370] mt-0.5">
                  {channel.type === 'instagram'
                    ? 'Instagram API token expired. Re-authenticate to restore messaging.'
                    : 'Channel configuration issue detected. Please review settings.'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#5C6370]">Account / Identifier</span>
              <span className="font-medium text-[#0E1013]">{channel.accountName ?? channel.phoneNumber ?? channel.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#5C6370]">Engines assigned</span>
              <span className="font-medium text-[#0E1013]">Concierge, Arrival, Upsell</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#5C6370]">Webhook status</span>
              <span className="text-[#2355A7] font-medium">Active</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="xs" variant="outline" onClick={() => {}}>
              <ExternalLink className="w-3 h-3" /> Open Platform
            </Button>
            <Button size="xs" variant="outline" onClick={() => {}}>
              <BarChart2 className="w-3 h-3" /> View Analytics
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function IntegrationTile({ channel, onClick }: { channel: Channel; onClick: () => void }) {
  const identifier = channel.accountName ?? channel.phoneNumber ?? channel.email ?? '—';
  const hasMetrics = channel.status === 'connected' || channel.messagesLast30d > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-brand-border p-5 text-left hover:border-brand-blue-light hover:shadow-card hover:-translate-y-0.5 transition-all duration-150"
    >
      {/* Hover affordance */}
      <span className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-brand-blue-50 text-brand-blue flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-3.5 h-3.5" />
      </span>

      {/* Header: icon + status pill */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-brand-blue-50 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
          <ChannelIcon channel={channel.type} size="lg" className="!text-current" />
        </div>
        <span className="group-hover:opacity-0 transition-opacity">
          <StatusBadge status={channel.status} />
        </span>
      </div>

      {/* Title + identifier */}
      <p className="text-[14px] font-semibold text-strong leading-tight truncate">{channel.name}</p>
      <p className="text-[11px] text-subtle truncate mt-0.5 mb-4">{identifier}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3.5 border-t border-border-soft">
        <div>
          <p className="text-[9px] text-subtle uppercase tracking-wider mb-0.5">Msgs 30d</p>
          <p className="text-[12px] font-semibold text-strong tabular-nums leading-tight">
            {hasMetrics ? channel.messagesLast30d.toLocaleString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-subtle uppercase tracking-wider mb-0.5">Response</p>
          <p className="text-[12px] font-semibold text-strong leading-tight truncate">
            {hasMetrics ? channel.avgResponseTime : '—'}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-subtle uppercase tracking-wider mb-0.5">Conv.</p>
          <p className="text-[12px] font-semibold text-strong tabular-nums leading-tight">
            {hasMetrics && channel.conversionRate > 0 ? `${(channel.conversionRate * 100).toFixed(0)}%` : '—'}
          </p>
        </div>
      </div>
    </button>
  );
}

function AddTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-white rounded-2xl border border-dashed border-brand-border p-5 flex flex-col items-center justify-center gap-2 text-subtle hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue-50/50 hover:-translate-y-0.5 transition-all duration-150 min-h-[200px]"
    >
      <span className="w-11 h-11 rounded-xl bg-surface-3 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
        <Plus className="w-5 h-5" />
      </span>
      <p className="text-[12px] font-semibold uppercase tracking-wider mt-1">{label}</p>
    </button>
  );
}

function InstallModal({
  type,
  label,
  onClose,
  onApply,
}: {
  type: string;
  label: string;
  onClose: () => void;
  onApply: (values: Record<string, string>) => void;
}) {
  const spec = INSTALL_SPEC[type];
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!spec) return null;

  const inputCls =
    'w-full h-10 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors';

  function update(name: string, v: string) {
    setValues(prev => ({ ...prev, [name]: v }));
  }

  function submit() {
    onApply(values);
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-brand-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative w-[720px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
        {/* Top bar with tab + actions */}
        <div className="px-6 pt-5 pb-0 border-b border-brand-border flex items-end justify-between gap-4">
          <div className="flex items-center gap-1 -mb-px">
            <div className="px-1 pb-3 text-[12px] font-semibold uppercase tracking-wider text-brand-blue border-b-2 border-brand-blue">
              Installation
            </div>
          </div>
          <div className="flex items-center gap-2 pb-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl border border-brand-border text-[12px] font-semibold uppercase tracking-wider text-strong hover:bg-surface-3 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            {!spec.connectButton && (
              <button
                type="button"
                onClick={submit}
                className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-blue text-white text-[12px] font-semibold uppercase tracking-wider hover:bg-brand-blue-hover transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Apply
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-5">
          <div className="rounded-2xl border border-brand-border bg-white">
            {(spec.sectionTitle || spec.sectionSubtitle) && (
              <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between gap-4">
                <p className="text-[14px] font-semibold text-strong">{spec.sectionTitle}</p>
                {spec.sectionSubtitle && (
                  <p className="text-[12px] text-subtle">{spec.sectionSubtitle}</p>
                )}
              </div>
            )}
            <div className={cn('px-6 py-6', spec.connectButton ? 'space-y-5' : 'space-y-4')}>
              {spec.connectButton && (
                <div className="text-center space-y-1 mb-2">
                  <p className="text-[14px] font-semibold text-strong">
                    We need your {spec.brandName ?? label} credentials to link it to your AVOX.
                  </p>
                  <p className="text-[12px] text-subtle">
                    Submit your credentials and save. AVOX will then be connected to your {spec.brandName ?? label} account.
                  </p>
                </div>
              )}

              {spec.fields.map((f) => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-semibold text-strong">
                      {f.label}
                      {f.required && <span className="text-brand-blue ml-0.5">*</span>}
                    </label>
                    {f.helpText && (
                      <a href={f.helpHref ?? '#'} className="text-[11px] text-brand-blue hover:underline">
                        {f.helpText}
                      </a>
                    )}
                  </div>
                  {f.type === 'select' ? (
                    <Select
                      className="w-full"
                      triggerClassName="!h-10 !text-[13px]"
                      placeholder={`Select ${f.label.toLowerCase()}…`}
                      value={values[f.name] ?? ''}
                      onChange={(v) => update(f.name, v)}
                      options={f.options ?? []}
                    />
                  ) : (
                    <input
                      type={f.type === 'password' ? 'password' : 'text'}
                      value={values[f.name] ?? ''}
                      onChange={(e) => update(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                  )}
                </div>
              ))}

              {spec.connectButton && (
                <button
                  type="button"
                  onClick={submit}
                  className="w-full h-12 rounded-xl bg-brand-blue text-white text-[14px] font-semibold hover:bg-brand-blue-hover transition-colors"
                >
                  {spec.connectButton}
                </button>
              )}
            </div>
          </div>

          {spec.infoTitle && (
            <div className="rounded-2xl border border-note-border bg-note-bg px-5 py-4 space-y-2">
              <p className="text-[13px] font-semibold text-note-text text-center">
                {spec.infoTitle}
              </p>
              <p className="text-[12px] text-note-text/90 leading-relaxed">{spec.infoBody}</p>
            </div>
          )}

          {!spec.connectButton && (
            <p className="text-[11px] text-subtle">
              Once applied, {label} will appear in the integrations list and can be assigned to engines.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailInstallModal({ onClose, onApply }: { onClose: () => void; onApply: (info: { provider: string; method: string }) => void }) {
  const [tab, setTab] = useState<'oauth' | 'imap'>('oauth');
  const [provider, setProvider] = useState<'gmail' | 'outlook' | 'yahoo'>('gmail');
  const [accepted, setAccepted] = useState(false);
  const [imap, setImap] = useState({ host: '', port: '993', user: '', pass: '', from: '' });

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const inputCls =
    'w-full h-10 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors';

  const PROVIDERS: { id: 'gmail' | 'outlook' | 'yahoo'; label: string; color: string; initial: string }[] = [
    { id: 'gmail',   label: 'Gmail',   color: '#EA4335', initial: 'G' },
    { id: 'outlook', label: 'Outlook', color: '#0078D4', initial: 'O' },
    { id: 'yahoo',   label: 'Yahoo',   color: '#6001D2', initial: 'Y' },
  ];
  const sel = PROVIDERS.find(p => p.id === provider)!;
  const imapValid = imap.host && imap.user && imap.pass && imap.from;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-brand-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative w-[560px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
          <h3 className="text-[16px] font-semibold text-strong">Connecting a mailbox</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 -mr-1 -mt-1 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-strong transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex items-center gap-2">
          {([
            { id: 'oauth', label: 'Mail client' },
            { id: 'imap',  label: 'IMAP' },
          ] as const).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors',
                tab === t.id
                  ? 'bg-brand-blue-50 text-brand-blue'
                  : 'text-muted hover:text-strong hover:bg-surface-3',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1">
          {tab === 'oauth' ? (
            <>
              {/* Provider chooser */}
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      'h-12 rounded-xl border flex items-center justify-center gap-2 text-[13px] font-semibold transition-colors',
                      provider === p.id
                        ? 'border-brand-blue bg-brand-blue-50 text-brand-blue'
                        : 'border-brand-border bg-white text-strong hover:border-brand-blue-light',
                    )}
                  >
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                      style={{ background: p.color }}
                    >
                      {p.initial}
                    </span>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Selected provider */}
              <div className="flex items-center gap-3 pt-2">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
                  style={{ background: sel.color }}
                >
                  {sel.initial}
                </span>
                <p className="text-[15px] font-semibold text-strong">{sel.label}</p>
              </div>

              <p className="text-[12px] text-muted leading-relaxed">
                AVOX will get access to your email address and the ability to read, create, send and delete your messages. The use of AVOX {sel.label} integration and the transfer of information received from the {sel.label} API to any other application complies with the{' '}
                <a href="#" className="text-brand-blue hover:underline">{sel.label} API Services User Data Policy</a>, including the Limited Use requirements.
              </p>

              <label className="flex items-start gap-2 cursor-pointer text-[12px] text-strong leading-relaxed">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-brand-border accent-brand-blue flex-shrink-0"
                />
                <span>
                  I have read the <a href="#" className="text-brand-blue hover:underline">Privacy Policy</a> and{' '}
                  <a href="#" className="text-brand-blue hover:underline">Terms of Use</a>, and I understand the rules of using Google User Data from clause 5.6.
                </span>
              </label>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-[12px] text-muted">
                Connect any IMAP/SMTP mailbox. AVOX will read incoming messages and send replies through SMTP.
              </p>
              {[
                { name: 'host', label: 'IMAP host', placeholder: 'imap.example.com', required: true },
                { name: 'port', label: 'Port', placeholder: '993', required: true },
                { name: 'user', label: 'Username', placeholder: 'hello@hotel.com', required: true },
                { name: 'pass', label: 'Password', placeholder: '••••••••', required: true, type: 'password' as const },
                { name: 'from', label: 'From address', placeholder: 'hello@hotel.com', required: true },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-[12px] font-semibold text-strong mb-1.5">
                    {f.label}{f.required && <span className="text-brand-blue ml-0.5">*</span>}
                  </label>
                  <input
                    type={f.type === 'password' ? 'password' : 'text'}
                    value={imap[f.name as keyof typeof imap]}
                    onChange={(e) => setImap(prev => ({ ...prev, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-semibold text-strong hover:bg-surface-3 transition-colors"
          >
            Cancel
          </button>
          {tab === 'oauth' ? (
            <button
              type="button"
              disabled={!accepted}
              onClick={() => onApply({ provider: sel.label, method: 'OAuth' })}
              className={cn(
                'h-9 px-5 rounded-xl text-[13px] font-semibold text-white transition-colors',
                accepted ? 'bg-brand-blue hover:bg-brand-blue-hover' : 'bg-faint cursor-not-allowed',
              )}
            >
              Authorize
            </button>
          ) : (
            <button
              type="button"
              disabled={!imapValid}
              onClick={() => onApply({ provider: 'IMAP', method: 'IMAP' })}
              className={cn(
                'h-9 px-5 rounded-xl text-[13px] font-semibold text-white transition-colors',
                imapValid ? 'bg-brand-blue hover:bg-brand-blue-hover' : 'bg-faint cursor-not-allowed',
              )}
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PmsSystem {
  id: string;
  name: string;
  description: string;
}

const PMS_SYSTEMS: PmsSystem[] = [
  { id: 'opera',     name: 'Oracle Opera',  description: 'Enterprise PMS by Oracle Hospitality' },
  { id: 'mews',      name: 'Mews',          description: 'Cloud-based property management for hotels and hostels' },
  { id: 'cloudbeds', name: 'Cloudbeds',     description: 'All-in-one platform for independent hotels' },
  { id: 'protel',    name: 'protel',        description: 'European PMS popular in city and resort hotels' },
  { id: 'apaleo',    name: 'apaleo',        description: 'API-first PMS for tech-forward properties' },
  { id: 'guestline', name: 'Guestline',     description: 'PMS used widely across UK and EMEA hospitality' },
];

function RequestIntegrationModal({
  systemName,
  onClose,
  onSubmit,
}: {
  systemName: string;
  onClose: () => void;
  onSubmit: (notes: string) => void;
}) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-brand-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative w-[560px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-semibold text-strong leading-tight">
                Request {systemName} Integration
              </h3>
              <p className="text-[12px] text-subtle mt-0.5">Our team will help you set up this integration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 -mr-1 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-strong transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-2 overflow-y-auto space-y-4 flex-1">
          <div className="rounded-2xl border border-brand-blue-light bg-brand-blue-50/60 p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-strong mb-1">Assisted Setup</p>
              <p className="text-[12px] text-muted leading-relaxed">
                The {systemName} integration requires coordination with your property's IT team or the vendor. Our team will guide you through the setup process.
              </p>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-strong mb-2">What happens next?</p>
            <ul className="space-y-1.5 text-[12px] text-muted">
              {[
                "We'll reach out to discuss your setup requirements",
                'Our team will coordinate credentials and configuration',
                "We'll test the connection and notify you when it's ready",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-faint mt-1.5 flex-shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional information (optional)"
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] font-semibold text-muted hover:text-strong px-2 py-1 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(notes)}
            className="h-10 px-5 inline-flex items-center gap-2 rounded-xl bg-brand-black text-white text-[13px] font-semibold hover:bg-strong transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

function PmsSystemTile({ system, onClick }: { system: PmsSystem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-brand-border p-5 flex flex-col items-start text-left gap-3 hover:border-brand-blue-light hover:shadow-card hover:-translate-y-0.5 transition-all duration-150"
    >
      <span className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-brand-blue-50 text-brand-blue flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-3.5 h-3.5" />
      </span>
      <div className="w-11 h-11 rounded-xl bg-brand-blue-50 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
        <Building2 className="w-5 h-5" />
      </div>
      <div className="space-y-1 min-w-0 w-full">
        <p className="text-[14px] font-semibold text-strong leading-tight truncate">{system.name}</p>
        <p className="text-[11px] text-subtle leading-snug line-clamp-2">{system.description}</p>
      </div>
      <span className="mt-auto pt-2 text-[11px] font-semibold uppercase tracking-wider text-brand-blue">
        Request integration
      </span>
    </button>
  );
}

function IntegrationTypeView({ type }: { type: string }) {
  const { addToast } = useApp();
  const [installOpen, setInstallOpen] = useState(false);
  const [pmsRequest, setPmsRequest] = useState<PmsSystem | null>(null);
  const label = INTEGRATION_LABELS[type] ?? type;
  const intro = TYPE_INTRO[type];
  const channels = mockChannels.filter((c) => c.type === type);
  const supported = (['whatsapp', 'messenger', 'instagram', 'email', 'sms', 'telegram', 'web_widget', 'ota_email', 'viber'] as ChannelType[]).includes(type as ChannelType);
  const hasSpec = type in INSTALL_SPEC;
  const isPms = type === 'pms';

  const addLabel = `Add ${label.toLowerCase()}`;
  const addAction = () => {
    if (isPms) {
      setPmsRequest(PMS_SYSTEMS[0]);
      return;
    }
    if (hasSpec) setInstallOpen(true);
    else addToast({ type: 'info', title: addLabel, message: 'Integration wizard opened' });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-subtle uppercase tracking-[0.22em] mb-2">
            Integrations · {label}
          </p>
          <h1 className="text-[28px] font-semibold text-strong leading-none tracking-tight">
            {label}
          </h1>
        </div>
        <Button size="md" variant="primary" onClick={addAction}>
          <Plus className="w-4 h-4" /> {isPms ? 'Request integration' : addLabel}
        </Button>
      </div>

      {intro && (
        <div className="flex items-start gap-3 bg-brand-blue-50 border border-brand-blue-light rounded-2xl px-4 py-3">
          <div className="w-5 h-5 rounded-full bg-brand-blue text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-px">i</div>
          <p className="text-[12px] text-strong leading-relaxed">{intro}</p>
        </div>
      )}

      {isPms ? (
        <div className="grid grid-cols-3 gap-4">
          {PMS_SYSTEMS.map((s) => (
            <PmsSystemTile key={s.id} system={s} onClick={() => setPmsRequest(s)} />
          ))}
        </div>
      ) : supported ? (
        <div className="grid grid-cols-4 gap-4">
          {channels.map((c) => (
            <IntegrationTile key={c.id} channel={c} onClick={() => addToast({ type: 'info', title: c.name, message: 'Settings opened' })} />
          ))}
          <AddTile label={addLabel} onClick={addAction} />
        </div>
      ) : hasSpec ? (
        <div className="grid grid-cols-4 gap-4">
          <AddTile label={addLabel} onClick={addAction} />
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-[14px] text-strong font-medium">
            {label} integration coming soon
          </p>
          <p className="text-[12px] text-subtle mt-1">
            We'll let you know when this connector is available.
          </p>
        </Card>
      )}

      {pmsRequest && (
        <RequestIntegrationModal
          systemName={pmsRequest.name}
          onClose={() => setPmsRequest(null)}
          onSubmit={() => {
            const name = pmsRequest.name;
            setPmsRequest(null);
            addToast({
              type: 'success',
              title: `Request submitted for ${name}`,
              message: 'Our team will reach out shortly.',
            });
          }}
        />
      )}

      {installOpen && type === 'email' ? (
        <EmailInstallModal
          onClose={() => setInstallOpen(false)}
          onApply={({ provider, method }) => {
            setInstallOpen(false);
            addToast({
              type: 'success',
              title: `${provider} mailbox connected`,
              message: `Connected via ${method}`,
            });
          }}
        />
      ) : installOpen ? (
        <InstallModal
          type={type}
          label={label}
          onClose={() => setInstallOpen(false)}
          onApply={(values) => {
            setInstallOpen(false);
            addToast({
              type: 'success',
              title: `${label} connected`,
              message: Object.keys(values).length > 0 ? `${Object.keys(values).length} field(s) submitted` : undefined,
            });
          }}
        />
      ) : null}
    </div>
  );
}

export function ChannelsPage() {
  const [params] = useSearchParams();
  const typeFilter = params.get('type');

  if (!typeFilter) return <Navigate to="/channels?type=web_widget" replace />;

  return <IntegrationTypeView type={typeFilter} />;
}
