import { useState } from 'react';
import { Plus, Settings2, RefreshCw, ExternalLink, AlertTriangle, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatusDot } from '../../components/ui/StatusDot';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { mockChannels } from '../../data/mock/channels';
import { channelLabels, channelColors, formatCurrency, cn } from '../../utils';
import type { Channel } from '../../types';
import { useApp } from '../../app/AppContext';

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

const statusVariants: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  connected: 'success',
  disconnected: 'danger',
  warning: 'warning',
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
            channelColors[channel.type].split(' ')[0],
          )}>
            <ChannelIcon channel={channel.type} size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-slate-900">{channel.name}</h3>
              <StatusDot status={channel.status as Parameters<typeof StatusDot>[0]['status']} />
            </div>
            <p className="text-xs text-slate-500">
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
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400">Messages (30d)</p>
            <p className="text-sm font-bold text-slate-900 tabular-nums">{channel.messagesLast30d.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400">Avg Response</p>
            <p className="text-sm font-bold text-slate-900">{channel.avgResponseTime}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400">Conversion</p>
            <p className="text-sm font-bold text-slate-900">{(channel.conversionRate * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
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
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">{channelDescriptions[channel.type]}</p>

          {channel.status === 'warning' && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Attention Required</p>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  {channel.type === 'instagram'
                    ? 'Instagram API token expired. Re-authenticate to restore messaging.'
                    : 'Channel configuration issue detected. Please review settings.'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Account / Identifier</span>
              <span className="font-medium text-slate-800">{channel.accountName ?? channel.phoneNumber ?? channel.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Engines assigned</span>
              <span className="font-medium text-slate-800">Concierge, Arrival, Upsell</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Webhook status</span>
              <span className="text-emerald-600 font-medium">Active</span>
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

export function ChannelsPage() {
  const { addToast } = useApp();
  const connected = mockChannels.filter(c => c.status === 'connected').length;
  const warning = mockChannels.filter(c => c.status === 'warning').length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Channels</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {connected} connected · {warning > 0 ? `${warning} warning${warning > 1 ? 's' : ''}` : 'All channels healthy'}
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          onClick={() => addToast({ type: 'info', title: 'Connect new channel', message: 'Channel wizard opened' })}
        >
          <Plus className="w-4 h-4" /> Add Channel
        </Button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Connected', value: connected, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Warnings', value: warning, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Messages (30d)', value: mockChannels.reduce((s, c) => s + c.messagesLast30d, 0).toLocaleString(), color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Avg Conversion', value: `${(mockChannels.reduce((s, c) => s + c.conversionRate, 0) / mockChannels.length * 100).toFixed(0)}%`, color: 'text-slate-900', bg: 'bg-slate-50' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl p-4', s.bg)}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {mockChannels.map(channel => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  );
}
