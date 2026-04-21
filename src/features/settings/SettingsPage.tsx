import { useState } from 'react';
import { Building2, Database, Users, Bell, CreditCard, Check, ChevronRight, Plus, Trash2, Mail, Shield } from 'lucide-react';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { mockUsers } from '../../data/mock/users';
import { mockProperties } from '../../data/mock/properties';
import { useApp, usePermission } from '../../app/AppContext';
import { formatDate, cn } from '../../utils';
import type { Role } from '../../types';

const settingsTabs = [
  { id: 'property', label: 'Property' },
  { id: 'pms', label: 'PMS Integration' },
  { id: 'team', label: 'Team' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Billing' },
];

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  agent: 'Agent',
  viewer: 'View-only',
};

const roleBadge: Record<Role, 'purple' | 'info' | 'success' | 'default'> = {
  admin: 'purple',
  manager: 'info',
  agent: 'success',
  viewer: 'default',
};

const pmsProviders = [
  { value: 'opera', label: 'Oracle OPERA' },
  { value: 'mews', label: 'Mews PMS' },
  { value: 'protel', label: 'Protel Air' },
  { value: 'cloudbeds', label: 'Cloudbeds' },
  { value: 'apaleo', label: 'Apaleo' },
  { value: 'stayntouch', label: 'StayNTouch' },
];

const invoices = [
  { date: '2026-04-01', amount: 1290, status: 'Paid', ref: 'INV-2026-004' },
  { date: '2026-03-01', amount: 1290, status: 'Paid', ref: 'INV-2026-003' },
  { date: '2026-02-01', amount: 980, status: 'Paid', ref: 'INV-2026-002' },
  { date: '2026-01-01', amount: 980, status: 'Paid', ref: 'INV-2026-001' },
];

export function SettingsPage() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('property');
  const canManage = usePermission('manage_settings');
  const canTeam = usePermission('manage_team');
  const canBilling = usePermission('manage_billing');
  const property = mockProperties[0];

  const [pmsProvider, setPmsProvider] = useState('opera');
  const [pmsConnected, setPmsConnected] = useState(true);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar nav */}
      <div className="w-52 flex-shrink-0 border-r border-slate-100 bg-white py-5">
        <p className="px-5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Settings</p>
        {[
          { id: 'property', icon: Building2, label: 'Property' },
          { id: 'pms', icon: Database, label: 'PMS Integration' },
          { id: 'team', icon: Users, label: 'Team' },
          { id: 'notifications', icon: Bell, label: 'Notifications' },
          { id: 'billing', icon: CreditCard, label: 'Billing' },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">

        {/* PROPERTY */}
        {activeTab === 'property' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Property Settings</h2>
              <p className="text-sm text-slate-500 mt-0.5">Configure your property details and operational defaults.</p>
            </div>
            <Card>
              <CardHeader title="Property Details" />
              <div className="space-y-4">
                <Input label="Property Name" defaultValue={property.name} disabled={!canManage} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" defaultValue={property.city} disabled={!canManage} />
                  <Input label="Country" defaultValue={property.country} disabled={!canManage} />
                </div>
                <Input label="Address" defaultValue={property.address} disabled={!canManage} />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Timezone"
                    value={property.timezone}
                    options={[
                      { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
                      { value: 'Europe/London', label: 'Europe/London (GMT)' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                    ]}
                    disabled={!canManage}
                  />
                  <Select
                    label="Currency"
                    value={property.currency}
                    options={[
                      { value: 'EUR', label: 'EUR — Euro' },
                      { value: 'GBP', label: 'GBP — British Pound' },
                      { value: 'USD', label: 'USD — US Dollar' },
                    ]}
                    disabled={!canManage}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Default Language"
                    value={property.defaultLanguage}
                    options={[
                      { value: 'fr', label: 'French' },
                      { value: 'en', label: 'English' },
                      { value: 'de', label: 'German' },
                    ]}
                    disabled={!canManage}
                  />
                  <Select
                    label="Communication Tone"
                    value="formal"
                    options={[
                      { value: 'formal', label: 'Formal — Luxury brand voice' },
                      { value: 'warm', label: 'Warm & conversational' },
                      { value: 'concise', label: 'Concise & professional' },
                    ]}
                    disabled={!canManage}
                  />
                </div>
              </div>
              {canManage && (
                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                  <Button size="sm" variant="primary" onClick={() => addToast({ type: 'success', title: 'Settings saved' })}>
                    Save Changes
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* PMS */}
        {activeTab === 'pms' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">PMS Integration</h2>
              <p className="text-sm text-slate-500 mt-0.5">Connect AVOX to your Property Management System for real-time data sync.</p>
            </div>
            <Card>
              <CardHeader
                title="Connection Status"
                action={
                  <Badge variant={pmsConnected ? 'success' : 'danger'}>
                    {pmsConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                }
              />
              <div className="space-y-4">
                <Select
                  label="PMS Provider"
                  value={pmsProvider}
                  onChange={e => setPmsProvider(e.target.value)}
                  options={pmsProviders}
                  disabled={!canManage}
                />
                <Input label="API Endpoint" defaultValue="https://api.opera.oracle.com/v1/grand-meridian" disabled={!canManage} />
                <Input label="API Key" type="password" defaultValue="••••••••••••••••••••••••••••" disabled={!canManage} />
                <Input label="Property Code" defaultValue="GMPA-001" disabled={!canManage} />
              </div>
              {canManage && (
                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => { setPmsConnected(true); addToast({ type: 'success', title: 'PMS connected', message: 'Sync active — data flowing in real time' }); }}
                  >
                    Test & Save Connection
                  </Button>
                  {pmsConnected && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addToast({ type: 'info', title: 'Sync initiated', message: 'Full data sync started — this may take a few minutes' })}
                    >
                      Force Full Sync
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {pmsConnected && (
              <Card>
                <CardHeader title="Sync Logs" subtitle="Last 5 sync events" />
                <div className="space-y-2">
                  {[
                    { time: '09:42:11', event: 'Reservation sync completed', count: '43 records updated' },
                    { time: '09:00:00', event: 'Scheduled sync triggered', count: '12 records updated' },
                    { time: '08:15:32', event: 'PMS webhook received — new booking', count: 'Booking GM-2026-048291' },
                    { time: '07:30:00', event: 'Scheduled sync triggered', count: '0 changes' },
                    { time: '06:45:18', event: 'Rate update received', count: '186 room rates refreshed' },
                  ].map(log => (
                    <div key={log.time} className="flex items-center gap-3 text-xs py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-400 font-mono w-16 flex-shrink-0">{log.time}</span>
                      <span className="text-slate-700 flex-1">{log.event}</span>
                      <span className="text-slate-400">{log.count}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TEAM */}
        {activeTab === 'team' && (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
                <p className="text-sm text-slate-500 mt-0.5">{mockUsers.length} members · 2 roles</p>
              </div>
              {canTeam && (
                <Button size="sm" variant="primary" onClick={() => addToast({ type: 'info', title: 'Invite sent', message: 'An invitation email has been dispatched' })}>
                  <Plus className="w-3.5 h-3.5" /> Invite Member
                </Button>
              )}
            </div>
            <Card padding="none">
              <div className="divide-y divide-slate-50">
                {mockUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <Avatar name={user.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="text-xs text-slate-500">{user.department}</div>
                    <Badge variant={roleBadge[user.role]}>{roleLabels[user.role]}</Badge>
                    <div className="text-xs text-slate-400">Joined {formatDate(user.joinedAt)}</div>
                    {canTeam && (
                      <div className="flex gap-1.5">
                        <Button size="xs" variant="ghost" onClick={() => addToast({ type: 'info', title: 'Edit member', message: `Editing ${user.name}` })}>
                          Edit
                        </Button>
                        <Button size="xs" variant="ghost" onClick={() => addToast({ type: 'warning', title: 'Removed', message: `${user.name} removed from property` })}>
                          <Trash2 className="w-3 h-3 text-slate-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Role Permissions" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 text-slate-400 font-medium pr-4">Permission</th>
                      {(['admin', 'manager', 'agent', 'viewer'] as Role[]).map(r => (
                        <th key={r} className="text-center py-2 px-3 text-slate-600 font-semibold">{roleLabels[r]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { label: 'View all conversations', access: [true, true, true, true] },
                      { label: 'Reply to guests', access: [true, true, true, false] },
                      { label: 'Manage AI Engines', access: [true, true, false, false] },
                      { label: 'Configure Channels', access: [true, true, false, false] },
                      { label: 'View Analytics', access: [true, true, true, false] },
                      { label: 'Manage Team', access: [true, false, false, false] },
                      { label: 'Billing Access', access: [true, false, false, false] },
                      { label: 'Settings', access: [true, false, false, false] },
                    ].map(row => (
                      <tr key={row.label} className="hover:bg-slate-50">
                        <td className="py-2.5 pr-4 text-slate-600">{row.label}</td>
                        {row.access.map((has, i) => (
                          <td key={i} className="text-center py-2.5 px-3">
                            {has
                              ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                              : <span className="text-slate-200">—</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-500 mt-0.5">Configure alert rules, delivery channels, and escalation chains.</p>
            </div>
            <Card>
              <CardHeader title="Alert Rules" />
              <div className="space-y-3">
                {[
                  { label: 'VIP guest escalation', desc: 'Notify GM and manager immediately', channel: 'SMS + Email', enabled: true },
                  { label: 'Engine error detected', desc: 'Alert engineering team', channel: 'Email', enabled: true },
                  { label: 'Satisfaction score < 3', desc: 'Trigger Recovery engine + notify manager', channel: 'SMS', enabled: true },
                  { label: 'Revenue milestone reached', desc: 'Daily summary at 18:00', channel: 'Email', enabled: false },
                  { label: 'Unassigned conversation > 15min', desc: 'Alert duty manager', channel: 'SMS', enabled: true },
                ].map(rule => (
                  <div key={rule.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{rule.label}</p>
                      <p className="text-xs text-slate-500">{rule.desc}</p>
                    </div>
                    <Badge variant="default">{rule.channel}</Badge>
                    <div
                      className={cn(
                        'w-9 h-5 rounded-full relative cursor-pointer transition-colors flex-shrink-0',
                        rule.enabled ? 'bg-emerald-500' : 'bg-slate-200',
                      )}
                      onClick={() => addToast({ type: 'info', title: rule.enabled ? 'Alert disabled' : 'Alert enabled' })}
                    >
                      <div className={cn(
                        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                        rule.enabled ? 'translate-x-4' : 'translate-x-0.5',
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Escalation Chain" subtitle="On-call sequence for urgent alerts" />
              <div className="space-y-2">
                {[
                  { step: 1, name: 'Sophie Blanchard', role: 'GM / Admin', method: 'SMS + Phone' },
                  { step: 2, name: 'Marc Dupont', role: 'Revenue Manager', method: 'SMS' },
                  { step: 3, name: 'Elena Kowalski', role: 'Duty Agent', method: 'SMS' },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                    <Badge variant="default">{item.method}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* BILLING */}
        {activeTab === 'billing' && canBilling && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Billing & Subscription</h2>
              <p className="text-sm text-slate-500 mt-0.5">Manage your plan, usage, and payment details.</p>
            </div>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
                  <p className="text-xl font-bold text-slate-900">Professional</p>
                  <p className="text-sm text-slate-500 mt-0.5">7 AI Engines · Up to 500 conversations/day · 3 properties</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">€1,290</p>
                  <p className="text-xs text-slate-500">per month</p>
                  <Badge variant="success" className="mt-1">Active</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Monthly Conversations</span>
                  <span className="font-semibold text-slate-800">1,547 / 15,000</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '10.3%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">10.3% of monthly limit used</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => addToast({ type: 'info', title: 'Plan comparison opened' })}>
                  Upgrade Plan
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader title="Usage Breakdown" />
              <div className="space-y-2">
                {[
                  { item: 'Base Platform', amount: 490 },
                  { item: 'AI Engine Pack (7 engines)', amount: 490 },
                  { item: 'WhatsApp Business API', amount: 120 },
                  { item: 'Premium Support SLA', amount: 190 },
                ].map(row => (
                  <div key={row.item} className="flex justify-between text-xs py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600">{row.item}</span>
                    <span className="font-semibold text-slate-800">€{row.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2">
                  <span className="text-slate-900">Total Monthly</span>
                  <span className="text-slate-900">€1,290</span>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Payment Method" />
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-7 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-600">VISA</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">•••• •••• •••• 4291</p>
                  <p className="text-xs text-slate-500">Expires 09/2028</p>
                </div>
                <Button size="xs" variant="ghost" className="ml-auto" onClick={() => addToast({ type: 'info', title: 'Payment method update' })}>
                  Update
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader title="Invoice History" />
              <div className="space-y-2">
                {invoices.map(inv => (
                  <div key={inv.ref} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-800">{inv.ref}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(inv.date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">€{inv.amount}</span>
                    <Badge variant="success">{inv.status}</Badge>
                    <Button size="xs" variant="ghost" onClick={() => addToast({ type: 'info', title: 'Invoice downloaded' })}>
                      PDF
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'billing' && !canBilling && (
          <div className="max-w-md">
            <div className="bg-slate-100 rounded-xl p-8 text-center">
              <Shield className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Access Restricted</h3>
              <p className="text-xs text-slate-500">Billing is only accessible to Admin users. Contact Sophie Blanchard for billing changes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
