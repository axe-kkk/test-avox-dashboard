import { Fragment, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2, Users, CreditCard, Bell, UserCircle, Plus, Trash2, Search,
  Check, X, Image as ImageIcon, Filter, Download, ChevronDown, ChevronRight,
  Volume2, Sparkles, ArrowUp, AlertTriangle, Pencil, Lock, Mail, Phone,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { Tabs } from '../../components/ui/Tabs';
import { mockUsers } from '../../data/mock/users';
import { mockProperties } from '../../data/mock/properties';
import { useApp, usePermission } from '../../app/AppContext';
import { formatDate, cn } from '../../utils';
import type { Role } from '../../types';

/* ─────────────────── Section model ─────────────────── */

type SectionId = 'company' | 'profile' | 'team' | 'billing' | 'notifications';

interface SectionDef {
  id: SectionId;
  label: string;
  description: string;
  icon: typeof Building2;
  subTabs: { id: string; label: string }[];
}

const SECTIONS: SectionDef[] = [
  {
    id: 'company',
    label: 'Company Information',
    description: 'Legal entity, properties, and operational defaults that flow through every guest touchpoint.',
    icon: Building2,
    subTabs: [
      { id: 'basic',      label: 'Basic Info' },
      { id: 'contact',    label: 'Contact' },
      { id: 'properties', label: 'Properties' },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'Your personal account, interface language, and availability for guest conversations.',
    icon: UserCircle,
    subTabs: [
      { id: 'personal',     label: 'Personal Data' },
      { id: 'language',     label: 'Interface Language' },
      { id: 'availability', label: 'Availability' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    description: 'Members, departments, and the role-permission matrix that gates every feature.',
    icon: Users,
    subTabs: [
      { id: 'members',     label: 'Members' },
      { id: 'departments', label: 'Departments' },
      { id: 'roles',       label: 'Roles & Permissions' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Subscription, CONNECTS balance, payment method, and invoice history.',
    icon: CreditCard,
    subTabs: [
      { id: 'plan',     label: 'Current Plan' },
      { id: 'connects', label: 'CONNECTS Balance' },
      { id: 'payment',  label: 'Payment Method' },
      { id: 'invoices', label: 'Invoice History' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'How and when AVOX alerts you — channels, quiet hours, and sound.',
    icon: Bell,
    subTabs: [
      { id: 'channels', label: 'Channels' },
      { id: 'quiet',    label: 'Quiet Hours' },
      { id: 'sound',    label: 'Sound' },
    ],
  },
];

const DEFAULT_SUBTAB: Record<SectionId, string> = {
  company: 'basic',
  profile: 'personal',
  team: 'members',
  billing: 'plan',
  notifications: 'channels',
};

/* ─────────────────── Static reference data ─────────────────── */

const BUSINESS_TYPES = [
  { value: 'single',     label: 'Single hotel' },
  { value: 'chain',      label: 'Hotel chain' },
  { value: 'hostel',     label: 'Hostel' },
  { value: 'apartments', label: 'Apartments / Aparthotel' },
  { value: 'resort',     label: 'Resort' },
];

const COUNTRIES = [
  { value: 'FR', label: 'France' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'US', label: 'United States' },
  { value: 'UA', label: 'Ukraine' },
];

const TIMEZONES = [
  { value: 'Europe/Paris',     label: 'Europe/Paris (CET)' },
  { value: 'Europe/London',    label: 'Europe/London (GMT)' },
  { value: 'Europe/Berlin',    label: 'Europe/Berlin (CET)' },
  { value: 'Europe/Kyiv',      label: 'Europe/Kyiv (EET)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'es', label: 'Spanish' },
  { value: 'uk', label: 'Ukrainian' },
];

const CURRENCIES = [
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'UAH', label: 'UAH — Ukrainian Hryvnia' },
];

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin', manager: 'Manager', agent: 'Agent', viewer: 'View-only',
};

const ROLE_BADGE: Record<Role, 'dark' | 'blue' | 'default'> = {
  admin: 'dark', manager: 'blue', agent: 'default', viewer: 'default',
};

const DEPARTMENTS = [
  { id: 'mgmt',     name: 'Management',      description: 'Executive leadership and ownership decisions.', members: 2, openConv: 4 },
  { id: 'revenue',  name: 'Revenue',         description: 'Pricing, distribution, and revenue strategy.',  members: 2, openConv: 7 },
  { id: 'gr',       name: 'Guest Relations', description: 'VIP guest care and on-property hospitality.',   members: 2, openConv: 12 },
  { id: 'rec',      name: 'Reception',       description: 'Front desk operations and check-in/out flow.',  members: 2, openConv: 9 },
  { id: 'mkt',      name: 'Marketing',       description: 'Brand, campaigns, and content production.',     members: 2, openConv: 1 },
];

const PERMISSIONS = [
  { label: 'View all conversations (not only own department)', access: [true, true, false] },
  { label: 'Assign conversations to other operators',          access: [true, true, false] },
  { label: 'Create and edit AI Engines',                       access: [true, false, false] },
  { label: 'View Analytics',                                   access: [true, true, false] },
  { label: 'View CONNECTS & Billing',                          access: [true, false, false] },
  { label: 'Team management (invitations, roles)',             access: [true, false, false] },
  { label: 'Channel & integration settings',                   access: [true, false, false] },
  { label: 'Takeover an AI conversation',                      access: [true, true, true]  },
  { label: 'Export data',                                      access: [true, true, false] },
];

const NOTIFICATION_TYPES: {
  id: string;
  label: string;
  inApp: boolean;
  email: boolean;
  inAppOnly?: boolean;
  emailOnly?: boolean;
  numericLabel?: string;
  numericValue?: number;
  numericSuffix?: string;
}[] = [
  { id: 'assigned',   label: 'New conversation assigned to me',           inApp: true,  email: true  },
  { id: 'escalation', label: 'Escalation from an AI Engine',              inApp: true,  email: true  },
  { id: 'mention',    label: '@mention from a colleague in a note',       inApp: true,  email: true  },
  { id: 'wait',       label: 'Guest waiting for reply longer than',       inApp: true,  email: false, numericLabel: 'min', numericValue: 5,  numericSuffix: 'minutes' },
  { id: 'low20',      label: 'CONNECTS balance below 20%',                inApp: true,  email: true  },
  { id: 'low5',       label: 'CONNECTS balance below 5%',                 inApp: true,  email: true  },
  { id: 'engineErr',  label: 'AI Engine error (Error Log)',               inApp: true,  email: true  },
  { id: 'resRate',    label: 'AI Engine Resolution Rate dropped below',   inApp: false, email: true,  numericLabel: '%', numericValue: 70, numericSuffix: '%' },
  { id: 'negFb',      label: 'Negative review received',                  inApp: true,  email: true  },
  { id: 'invite',     label: 'New employee accepted invitation',          inApp: false, email: true,  emailOnly: true  },
  { id: 'report',     label: 'Scheduled report sent',                     inApp: false, email: true,  emailOnly: true  },
];

const SOUND_OPTIONS = [
  { value: 'chime',   label: 'Chime — soft bell'   },
  { value: 'pop',     label: 'Pop — single tap'    },
  { value: 'pulse',   label: 'Pulse — low tone'    },
  { value: 'classic', label: 'Classic — telephone' },
];

const STATUS_OPTIONS = [
  { value: 'online',  label: 'Online'  },
  { value: 'away',    label: 'Away'    },
  { value: 'offline', label: 'Offline' },
];

const INVOICES = [
  { id: 'INV-2026-005', date: '2026-04-21', desc: 'CONNECTS package — 10 000',          amount: 90,   status: 'paid'    },
  { id: 'INV-2026-004', date: '2026-04-01', desc: 'Membership — Monthly',               amount: 290,  status: 'paid'    },
  { id: 'INV-2026-003', date: '2026-03-12', desc: 'CONNECTS package — 50 000',          amount: 380,  status: 'paid'    },
  { id: 'INV-2026-002', date: '2026-03-01', desc: 'Membership — Monthly',               amount: 290,  status: 'paid'    },
  { id: 'INV-2026-001', date: '2026-02-01', desc: 'Membership — Monthly',               amount: 290,  status: 'paid'    },
  { id: 'INV-2026-000', date: '2026-01-18', desc: 'CONNECTS package — 5 000',           amount: 49,   status: 'pending' },
];

const CONNECT_PACKAGES = [
  { value: '1000',  label: '1 000 CONNECTS — €12'   },
  { value: '5000',  label: '5 000 CONNECTS — €49'   },
  { value: '10000', label: '10 000 CONNECTS — €90'  },
  { value: '50000', label: '50 000 CONNECTS — €380' },
];

/* ─────────────────── Helpers ─────────────────── */

function statusBadge(status: 'paid' | 'pending' | 'failed') {
  if (status === 'paid')    return <Badge variant="blue">Paid</Badge>;
  if (status === 'pending') return <Badge variant="default">Pending</Badge>;
  return <Badge variant="dark">Failed</Badge>;
}

function CheckMark({ on }: { on: boolean }) {
  return on
    ? <Check className="w-3.5 h-3.5 text-brand-blue mx-auto" />
    : <X className="w-3 h-3 text-faint mx-auto" />;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">{children}</label>;
}

function SubFormGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const cls = cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return <div className={cn('grid gap-4', cls)}>{children}</div>;
}

/* ─────────────────── Page ─────────────────── */

export function SettingsPage() {
  const { addToast, currentUser } = useApp();
  const canSettings = usePermission('manage_settings');
  const canTeam     = usePermission('manage_team');
  const canBilling  = usePermission('manage_billing');

  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get('section') as SectionId | null;
  const section: SectionId = sectionParam && SECTIONS.some(s => s.id === sectionParam) ? sectionParam : 'company';
  const [subTabState, setSubTabState] = useState<Record<SectionId, string>>(DEFAULT_SUBTAB);
  const subTab = subTabState[section];

  const sectionDef = SECTIONS.find(s => s.id === section)!;

  // Mirror the default section into the URL so the SubSidebar's NavLink highlights correctly.
  useEffect(() => {
    if (!sectionParam) {
      setSearchParams({ section: 'company' }, { replace: true });
    }
  }, [sectionParam, setSearchParams]);

  function setSubTab(id: string) {
    setSubTabState(prev => ({ ...prev, [section]: id }));
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--color-brand-bg)' }}>
      {/* Page header + sub-tabs */}
      <div className="bg-white border-b border-brand-border px-8 pt-7">
        <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.22em] mb-2">Settings</p>
        <h1 className="text-[22px] font-semibold text-strong leading-tight tracking-tight">{sectionDef.label}</h1>
        <p className="text-[12px] text-muted mt-1.5 max-w-2xl leading-relaxed">{sectionDef.description}</p>
        <div className="mt-5">
          <Tabs tabs={sectionDef.subTabs} activeTab={subTab} onChange={setSubTab} />
        </div>
      </div>

        {/* Section panes */}
        <div className="px-8 py-6 max-w-[1400px]">
          {section === 'company' && subTab === 'basic'      && <CompanyBasic        canEdit={canSettings} onSave={() => addToast({ type: 'success', title: 'Company info saved' })} />}
          {section === 'company' && subTab === 'contact'    && <CompanyContact      canEdit={canSettings} onSave={() => addToast({ type: 'success', title: 'Contact details saved' })} />}
          {section === 'company' && subTab === 'properties' && <CompanyProperties   canEdit={canSettings} onAdd={() => addToast({ type: 'info', title: 'Add property — Multi-property coming soon' })} />}

          {section === 'profile' && subTab === 'personal'     && <ProfilePersonal     user={currentUser} onSave={() => addToast({ type: 'success', title: 'Profile saved' })} />}
          {section === 'profile' && subTab === 'language'     && <ProfileLanguage     onSave={() => addToast({ type: 'success', title: 'Interface language updated' })} />}
          {section === 'profile' && subTab === 'availability' && <ProfileAvailability onSave={() => addToast({ type: 'success', title: 'Availability defaults saved' })} />}

          {section === 'team' && subTab === 'members'     && <TeamMembers     canEdit={canTeam} onToast={addToast} />}
          {section === 'team' && subTab === 'departments' && <TeamDepartments canEdit={canTeam} onToast={addToast} />}
          {section === 'team' && subTab === 'roles'       && <TeamRoles />}

          {section === 'billing' && !canBilling && <RestrictedNotice />}
          {section === 'billing' && canBilling && subTab === 'plan'     && <BillingPlan     onToast={addToast} />}
          {section === 'billing' && canBilling && subTab === 'connects' && <BillingConnects onToast={addToast} />}
          {section === 'billing' && canBilling && subTab === 'payment'  && <BillingPayment  onToast={addToast} />}
          {section === 'billing' && canBilling && subTab === 'invoices' && <BillingInvoices onToast={addToast} />}

      {section === 'notifications' && subTab === 'channels' && <NotificationChannels onToast={addToast} />}
      {section === 'notifications' && subTab === 'quiet'    && <NotificationQuiet    onToast={addToast} />}
      {section === 'notifications' && subTab === 'sound'    && <NotificationSound    onToast={addToast} />}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   COMPANY INFORMATION
   ─────────────────────────────────────────────────────────────── */

function CompanyBasic({ canEdit, onSave }: { canEdit: boolean; onSave: () => void }) {
  const [businessType, setBusinessType] = useState('single');
  const [country, setCountry] = useState('FR');

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card>
        <CardHeader title="Legal entity" subtitle="Used in invoices, tax filings, and PMS sync." />
        <div className="space-y-4">
          <SubFormGrid>
            <Input label="Company Name"  defaultValue="Grand Meridian Group" disabled={!canEdit} />
            <Input label="Legal Name"    defaultValue="Grand Meridian Hospitality SAS" disabled={!canEdit} />
          </SubFormGrid>
          <SubFormGrid>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Business Type</FieldLabel>
              <Select value={businessType} onChange={setBusinessType} options={BUSINESS_TYPES} disabled={!canEdit} className="block" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Country of Registration</FieldLabel>
              <Select value={country} onChange={setCountry} options={COUNTRIES} disabled={!canEdit} className="block" />
            </div>
          </SubFormGrid>
          <SubFormGrid>
            <Input label="Tax Number (VAT / EDRPOU)" defaultValue="FR 78 549 821 477" disabled={!canEdit} />
            <Input label="Website"                    type="url" defaultValue="https://grandmeridian.com" disabled={!canEdit} />
          </SubFormGrid>
          <Input label="Legal Address" defaultValue="14 Rue de Rivoli, 75001 Paris, France" disabled={!canEdit} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Company logo" subtitle="Shown in the chat widget, email templates, and exported reports." />
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-surface-3 border border-brand-border flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-7 h-7 text-subtle" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-strong">Upload a logo</p>
            <p className="text-[11px] text-subtle mt-0.5 leading-relaxed">PNG or SVG, transparent background. Min 256×256, max 2MB.</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" disabled={!canEdit}>Upload image</Button>
              <Button size="sm" variant="ghost" disabled={!canEdit}>Remove</Button>
            </div>
          </div>
        </div>
      </Card>

      {canEdit && (
        <SaveBar onSave={onSave} />
      )}
    </div>
  );
}

function CompanyContact({ canEdit, onSave }: { canEdit: boolean; onSave: () => void }) {
  const [tz, setTz] = useState('Europe/Paris');
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('EUR');

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card>
        <CardHeader title="Contact" subtitle="Primary inbox and phone for AVOX system messages." />
        <SubFormGrid>
          <Input label="Company Email" type="email" defaultValue="hello@grandmeridian.com" leading={<Mail className="w-3.5 h-3.5" />} disabled={!canEdit} />
          <Input label="Phone"          type="tel"   defaultValue="+33 1 42 60 30 30"      leading={<Phone className="w-3.5 h-3.5" />} disabled={!canEdit} />
        </SubFormGrid>
      </Card>

      <Card>
        <CardHeader title="Defaults" subtitle="Used across reports, billing, and guest-facing translations." />
        <SubFormGrid cols={3}>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Timezone</FieldLabel>
            <Select value={tz} onChange={setTz} options={TIMEZONES} disabled={!canEdit} className="block" />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Default Language</FieldLabel>
            <Select value={lang} onChange={setLang} options={LANGUAGES} disabled={!canEdit} className="block" />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Primary Currency</FieldLabel>
            <Select value={currency} onChange={setCurrency} options={CURRENCIES} disabled={!canEdit} className="block" />
          </div>
        </SubFormGrid>
      </Card>

      {canEdit && <SaveBar onSave={onSave} />}
    </div>
  );
}

function CompanyProperties({ canEdit, onAdd }: { canEdit: boolean; onAdd: () => void }) {
  const [expanded, setExpanded] = useState<string | null>('prop_001');

  const rows = mockProperties.map((p, i) => ({
    ...p,
    pms: i === 0 ? 'connected' as const : 'disconnected' as const,
    connectedAt: i === 0 ? '2025-09-12' : null,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <div>
            <h3 className="text-[13px] font-semibold text-strong leading-tight">Properties</h3>
            <p className="text-[11px] text-subtle mt-1 leading-relaxed">{rows.length} properties · Multi-property is rolling out next quarter.</p>
          </div>
          <Button size="sm" variant="primary" onClick={onAdd} disabled={!canEdit}>
            <Plus className="w-3.5 h-3.5" /> Add property
          </Button>
        </div>
        <table className="w-full text-[12px]">
          <thead className="bg-surface-2">
            <tr className="text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">
              <th className="text-left px-5 py-3">Property</th>
              <th className="text-left px-3 py-3">Address</th>
              <th className="text-right px-3 py-3">Rooms</th>
              <th className="text-left px-3 py-3">PMS Status</th>
              <th className="text-left px-3 py-3">Connected since</th>
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {rows.map((p, i) => {
              const isFirst = i === 0;
              const isOpen = expanded === p.id;
              return (
                <Fragment key={p.id}>
                  <tr
                    className={cn(
                      'transition-colors',
                      isFirst ? 'cursor-pointer hover:bg-surface-3' : 'opacity-60',
                    )}
                    onClick={() => isFirst && setExpanded(isOpen ? null : p.id)}
                  >
                    <td className="px-5 py-3">
                      <div className="font-semibold text-strong">{p.name}</div>
                      <div className="text-[10px] text-subtle mt-0.5">{Array.from({ length: p.starRating }).map(() => '★').join('')}</div>
                    </td>
                    <td className="px-3 py-3 text-muted">{p.address}, {p.city}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-strong font-semibold">{p.roomCount}</td>
                    <td className="px-3 py-3">
                      {p.pms === 'connected'
                        ? <Badge variant="blue">Connected</Badge>
                        : <Badge variant="default">Disconnected</Badge>}
                    </td>
                    <td className="px-3 py-3 text-muted">{p.connectedAt ? formatDate(p.connectedAt) : '—'}</td>
                    <td className="px-3 py-3 text-subtle">
                      {isFirst && (isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
                    </td>
                  </tr>

                  {isFirst && isOpen && (
                    <tr className="bg-surface-2">
                      <td colSpan={6} className="px-5 py-5">
                        <div className="grid grid-cols-3 gap-4 max-w-3xl">
                          <Input label="Property name"     defaultValue={p.name}                       disabled={!canEdit} />
                          <Input label="Reception phone"   defaultValue="+33 1 42 60 30 30"            disabled={!canEdit} />
                          <Input label="Reception email"   defaultValue="reception@grandmeridian.com"  disabled={!canEdit} />
                          <Input label="Address"           defaultValue={`${p.address}, ${p.city}`}    disabled={!canEdit} className="col-span-2" />
                          <Input label="Rooms"             defaultValue={String(p.roomCount)}          disabled={!canEdit} />
                          <Input label="Stars"             defaultValue={String(p.starRating)}         disabled={!canEdit} />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                          PMS connection healthy — last sync 4 min ago
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div className="rounded-2xl bg-brand-blue-50 border border-brand-blue-light p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-brand-blue">Multi-property — coming soon</p>
          <p className="text-[11px] text-brand-blue/80 mt-1 leading-relaxed">
            MVP runs on a single object. Chain-level reporting, room mapping, and cross-property routing are scheduled for the next release.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   PROFILE
   ─────────────────────────────────────────────────────────────── */

function ProfilePersonal({ user, onSave }: { user: { name: string; email: string }; onSave: () => void }) {
  const [first, last] = user.name.split(' ');
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card>
        <CardHeader title="Personal data" subtitle="Shown in Inbox replies, the web widget, and audit logs." />
        <div className="flex items-start gap-5 mb-5">
          <Avatar name={user.name} size="lg" />
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-strong">Avatar</p>
            <p className="text-[11px] text-subtle mt-0.5 leading-relaxed">Visible to guests in the web widget and to colleagues in Inbox.</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">Upload image</Button>
              <Button size="sm" variant="ghost">Remove</Button>
            </div>
          </div>
        </div>
        <SubFormGrid>
          <Input label="First name" defaultValue={first ?? ''} />
          <Input label="Last name"  defaultValue={last  ?? ''} />
          <Input label="Email"      defaultValue={user.email} disabled trailing={<Lock className="w-3 h-3" />} />
          <Input label="Phone"      defaultValue="+33 6 14 22 87 09" />
        </SubFormGrid>
      </Card>

      <Card>
        <CardHeader title="Change password" subtitle="Use a strong, unique password — minimum 12 characters." />
        <SubFormGrid cols={3}>
          <Input label="Current password" type="password" placeholder="••••••••" />
          <Input label="New password"     type="password" placeholder="At least 12 characters" />
          <Input label="Confirm new"      type="password" placeholder="Repeat new password" />
        </SubFormGrid>
      </Card>

      <SaveBar onSave={onSave} />
    </div>
  );
}

function ProfileLanguage({ onSave }: { onSave: () => void }) {
  const [lang, setLang] = useState('en');
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card>
        <CardHeader title="Interface language" subtitle="Affects the AVOX UI only — guest replies still respect the guest's language." />
        <SubFormGrid>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Language</FieldLabel>
            <Select value={lang} onChange={setLang} options={LANGUAGES} className="block" />
          </div>
        </SubFormGrid>
      </Card>
      <SaveBar onSave={onSave} />
    </div>
  );
}

function ProfileAvailability({ onSave }: { onSave: () => void }) {
  const [defaultStatus, setDefaultStatus] = useState('online');
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card>
        <CardHeader title="Availability defaults" subtitle="How the system represents you when you log in or fall idle." />
        <SubFormGrid>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Status on login</FieldLabel>
            <Select value={defaultStatus} onChange={setDefaultStatus} options={STATUS_OPTIONS} className="block" />
          </div>
          <Input label="Auto-Away after (minutes of inactivity)" type="number" min={1} max={120} defaultValue={15} />
        </SubFormGrid>
      </Card>
      <SaveBar onSave={onSave} />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   TEAM
   ─────────────────────────────────────────────────────────────── */

function TeamMembers({
  canEdit,
  onToast,
}: {
  canEdit: boolean;
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allDepts = useMemo(() => Array.from(new Set(mockUsers.map(u => u.department))), []);

  const filtered = mockUsers.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (deptFilter !== 'all' && u.department !== deptFilter) return false;
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    return true;
  });

  const selected = selectedId ? mockUsers.find(u => u.id === selectedId) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search by name or email"
          leading={<Search className="w-3.5 h-3.5" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-[280px]"
        />
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-subtle" />
          <Select
            value={roleFilter}
            onChange={(v) => setRoleFilter(v as 'all' | Role)}
            options={[{ value: 'all', label: 'All roles' }, ...Object.keys(ROLE_LABEL).map(r => ({ value: r, label: ROLE_LABEL[r as Role] }))]}
            className="min-w-[140px]"
          />
          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            options={[{ value: 'all', label: 'All departments' }, ...allDepts.map(d => ({ value: d, label: d }))]}
            className="min-w-[180px]"
          />
        </div>
        <div className="ml-auto">
          <Button size="sm" variant="primary" onClick={() => setInviteOpen(true)} disabled={!canEdit}>
            <Plus className="w-3.5 h-3.5" /> Invite Member
          </Button>
        </div>
      </div>

      {/* Members table */}
      <Card padding="none">
        <table className="w-full text-[12px]">
          <thead className="bg-surface-2">
            <tr className="text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">
              <th className="text-left px-5 py-3">Member</th>
              <th className="text-left px-3 py-3">Role</th>
              <th className="text-left px-3 py-3">Department</th>
              <th className="text-left px-3 py-3">Status</th>
              <th className="text-left px-3 py-3">Joined</th>
              <th className="text-left px-3 py-3">Last active</th>
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.map(u => (
              <tr
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                className="cursor-pointer hover:bg-surface-3 transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <div className="font-semibold text-strong">{u.name}</div>
                      <div className="text-[10px] text-subtle">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3"><Badge variant={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</Badge></td>
                <td className="px-3 py-3 text-muted">{u.department}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                    Active
                  </span>
                </td>
                <td className="px-3 py-3 text-muted">{formatDate(u.joinedAt)}</td>
                <td className="px-3 py-3 text-subtle">{formatDate(u.lastActiveAt)}</td>
                <td className="px-3 py-3 text-subtle"><ChevronRight className="w-3.5 h-3.5" /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-[12px] text-subtle">No members match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Member detail modal */}
      {selected && (
        <Modal onClose={() => setSelectedId(null)} title={selected.name} subtitle={selected.email} icon={<Avatar name={selected.name} size="md" />}>
          <MemberDetail
            user={selected}
            canEdit={canEdit}
            onClose={() => setSelectedId(null)}
            onToast={onToast}
          />
        </Modal>
      )}

      {/* Invite modal */}
      {inviteOpen && (
        <Modal
          onClose={() => setInviteOpen(false)}
          title="Invite a team member"
          subtitle="They will receive an email with a link to set their password."
        >
          <InviteForm
            onCancel={() => setInviteOpen(false)}
            onSubmit={() => {
              setInviteOpen(false);
              onToast({ type: 'success', title: 'Invitation sent' });
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function InviteForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: () => void }) {
  const [role, setRole] = useState<Role>('agent');
  const [dept, setDept] = useState('Reception');
  const [sendEmail, setSendEmail] = useState(true);

  return (
    <div className="space-y-4">
      <Input label="Email" type="email" placeholder="colleague@hotel.com" leading={<Mail className="w-3.5 h-3.5" />} />
      <SubFormGrid>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Role</FieldLabel>
          <Select value={role} onChange={(v) => setRole(v as Role)} options={(Object.keys(ROLE_LABEL) as Role[]).map(r => ({ value: r, label: ROLE_LABEL[r] }))} className="block" />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Department</FieldLabel>
          <Select value={dept} onChange={setDept} options={DEPARTMENTS.map(d => ({ value: d.name, label: d.name }))} className="block" />
        </div>
      </SubFormGrid>
      <label className="flex items-center gap-2 text-[12px] text-muted cursor-pointer">
        <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="w-4 h-4 rounded border-brand-border accent-brand-blue" />
        Send invitation email immediately
      </label>
      <div className="flex justify-end gap-2 pt-2 border-t border-brand-border -mx-6 px-6 -mb-2 pb-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button size="sm" variant="primary" onClick={onSubmit}>Send invitation</Button>
      </div>
    </div>
  );
}

function MemberDetail({
  user,
  canEdit,
  onClose,
  onToast,
}: {
  user: typeof mockUsers[number];
  canEdit: boolean;
  onClose: () => void;
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const [role, setRole] = useState<Role>(user.role);
  const [dept, setDept] = useState(user.department);
  const [active, setActive] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-border bg-surface-2 p-3 text-[11px] text-muted leading-relaxed">
        Joined <span className="text-strong font-semibold">{formatDate(user.joinedAt)}</span> · Last active <span className="text-strong font-semibold">{formatDate(user.lastActiveAt)}</span>
      </div>

      <SubFormGrid>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Role</FieldLabel>
          <Select
            value={role}
            onChange={(v) => setRole(v as Role)}
            disabled={!canEdit}
            options={(Object.keys(ROLE_LABEL) as Role[]).map(r => ({ value: r, label: ROLE_LABEL[r] }))}
            className="block"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Department</FieldLabel>
          <Select
            value={dept}
            onChange={setDept}
            disabled={!canEdit}
            options={DEPARTMENTS.map(d => ({ value: d.name, label: d.name }))}
            className="block"
          />
        </div>
      </SubFormGrid>

      <div className="flex items-center justify-between p-3 rounded-2xl border border-brand-border">
        <div>
          <p className="text-[12px] font-semibold text-strong">{active ? 'Active' : 'Suspended'}</p>
          <p className="text-[11px] text-subtle leading-relaxed">Suspended members keep their data but can no longer log in.</p>
        </div>
        <Switch checked={active} onChange={setActive} disabled={!canEdit} />
      </div>

      {confirmRemove ? (
        <div className="p-3 rounded-2xl border border-note-border bg-note-bg">
          <p className="text-[12px] font-semibold text-strong mb-1">Remove {user.name} from team?</p>
          <p className="text-[11px] text-muted">Their assigned conversations will be unassigned. This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-3">
            <Button size="sm" variant="ghost" onClick={() => setConfirmRemove(false)}>Cancel</Button>
            <Button size="sm" variant="danger" onClick={() => { onToast({ type: 'warning', title: 'Member removed', message: user.name }); onClose(); }}>Remove</Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between gap-2 pt-2 border-t border-brand-border -mx-6 px-6 -mb-2 pb-2">
          <Button size="sm" variant="ghost" onClick={() => setConfirmRemove(true)} disabled={!canEdit}>
            <Trash2 className="w-3.5 h-3.5" /> Remove from team
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
            <Button size="sm" variant="primary" onClick={() => { onToast({ type: 'success', title: 'Member updated' }); onClose(); }} disabled={!canEdit}>Save changes</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamDepartments({
  canEdit,
  onToast,
}: {
  canEdit: boolean;
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="primary" onClick={() => setCreateOpen(true)} disabled={!canEdit}>
          <Plus className="w-3.5 h-3.5" /> Create department
        </Button>
      </div>

      <Card padding="none">
        <table className="w-full text-[12px]">
          <thead className="bg-surface-2">
            <tr className="text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">
              <th className="text-left px-5 py-3">Department</th>
              <th className="text-right px-3 py-3">Members</th>
              <th className="text-right px-3 py-3">Open conversations</th>
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {DEPARTMENTS.map(d => (
              <tr
                key={d.id}
                onClick={() => setOpenId(d.id)}
                className="cursor-pointer hover:bg-surface-3 transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="font-semibold text-strong">{d.name}</div>
                  <div className="text-[10px] text-subtle mt-0.5 line-clamp-1">{d.description}</div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-strong font-semibold">{d.members}</td>
                <td className="px-3 py-3 text-right tabular-nums text-strong font-semibold">{d.openConv}</td>
                <td className="px-3 py-3 text-subtle"><ChevronRight className="w-3.5 h-3.5" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {openId && (
        <Modal
          title={DEPARTMENTS.find(d => d.id === openId)!.name}
          subtitle="Edit department details and members."
          onClose={() => setOpenId(null)}
        >
          <DepartmentForm
            dept={DEPARTMENTS.find(d => d.id === openId)!}
            canEdit={canEdit}
            onClose={() => setOpenId(null)}
            onToast={onToast}
          />
        </Modal>
      )}

      {createOpen && (
        <Modal title="Create department" onClose={() => setCreateOpen(false)}>
          <div className="space-y-4">
            <Input label="Department name" placeholder="e.g. Spa & Wellness" />
            <Input label="Description" placeholder="What this team handles (max 200 chars)" maxLength={200} />
            <div className="flex justify-end gap-2 pt-2 border-t border-brand-border -mx-6 px-6 -mb-2 pb-2">
              <Button size="sm" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => { setCreateOpen(false); onToast({ type: 'success', title: 'Department created' }); }}
              >
                Create department
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DepartmentForm({
  dept,
  canEdit,
  onClose,
  onToast,
}: {
  dept: typeof DEPARTMENTS[number];
  canEdit: boolean;
  onClose: () => void;
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const members = mockUsers.filter(u => u.department === dept.name);
  return (
    <div className="space-y-4">
      <Input label="Department name" defaultValue={dept.name} disabled={!canEdit} />
      <Input label="Description"      defaultValue={dept.description} maxLength={200} disabled={!canEdit} />

      <div className="rounded-2xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-brand-border">
          <span className="text-[11px] font-semibold text-strong">{members.length} members</span>
          <Button size="xs" variant="ghost" disabled={!canEdit}><Plus className="w-3 h-3" /> Add member</Button>
        </div>
        <div className="divide-y divide-brand-border max-h-64 overflow-y-auto bg-white">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar name={m.name} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-strong truncate">{m.name}</p>
                <p className="text-[10px] text-subtle truncate">{m.email}</p>
              </div>
              <Badge variant={ROLE_BADGE[m.role]}>{ROLE_LABEL[m.role]}</Badge>
              <button
                onClick={() => onToast({ type: 'info', title: `${m.name} removed from ${dept.name}` })}
                disabled={!canEdit}
                className="text-subtle hover:text-strong transition-colors disabled:opacity-40"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-brand-border -mx-6 px-6 -mb-2 pb-2">
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        <Button
          size="sm"
          variant="primary"
          disabled={!canEdit}
          onClick={() => { onClose(); onToast({ type: 'success', title: 'Department saved' }); }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

function TeamRoles() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Card>
        <CardHeader
          title="Roles & permissions"
          subtitle="What each role can do across the platform. Roles are global; departments scope visibility."
        />
        <div className="overflow-hidden rounded-xl border border-brand-border">
          <table className="w-full text-[12px]">
            <thead className="bg-surface-2">
              <tr>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">Permission</th>
                <th className="text-center py-3 px-3 text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">Admin</th>
                <th className="text-center py-3 px-3 text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">Manager</th>
                <th className="text-center py-3 px-3 text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border bg-white">
              {PERMISSIONS.map(row => (
                <tr key={row.label} className="hover:bg-surface-3 transition-colors">
                  <td className="py-3 px-4 text-muted">{row.label}</td>
                  {row.access.map((on, i) => (
                    <td key={i} className="text-center py-3 px-3"><CheckMark on={on} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="rounded-2xl bg-surface-3 border border-brand-border p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white border border-brand-border text-subtle flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          Permissions are tied to the role and applied across every property. Custom roles are on the roadmap — open a request from the Help Center if you need finer-grained control.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   BILLING
   ─────────────────────────────────────────────────────────────── */

function RestrictedNotice() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-3 border border-brand-border text-subtle mx-auto mb-3 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-[13px] font-semibold text-strong mb-1">Access restricted</h3>
          <p className="text-[12px] text-muted leading-relaxed">Billing is only accessible to Admin users. Contact your workspace administrator.</p>
        </div>
      </Card>
    </div>
  );
}

function BillingPlan({
  onToast,
}: {
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const [plan, setPlan] = useState<'free' | 'membership'>('membership');
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1.5">Current plan</p>
            <div className="flex items-center gap-2">
              <p className="text-[20px] font-semibold text-strong leading-none">{plan === 'membership' ? 'Membership' : 'Free'}</p>
              <Badge variant="blue">Active</Badge>
            </div>
            <p className="text-[12px] text-muted mt-2 leading-relaxed">
              {plan === 'membership'
                ? 'Billed monthly — full access to AI Engines, helpdesk, and analytics.'
                : 'Helpdesk only — AI Engines paused.'}
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mt-4 text-[12px]">
              <div className="flex justify-between"><span className="text-subtle">Started</span><span className="text-strong font-semibold">{formatDate('2025-09-01')}</span></div>
              {plan === 'membership' && (
                <div className="flex justify-between"><span className="text-subtle">Next billing</span><span className="text-strong font-semibold">{formatDate('2026-05-21')}</span></div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[28px] font-semibold text-strong tabular-nums leading-none">{plan === 'membership' ? '€290' : '€0'}</p>
            <p className="text-[11px] text-subtle mt-1.5">per month</p>
          </div>
        </div>
        <div className="flex gap-2 mt-5 pt-4 border-t border-brand-border">
          {plan === 'free' ? (
            <Button size="sm" variant="primary" onClick={() => { setPlan('membership'); onToast({ type: 'success', title: 'Upgraded to Membership' }); }}>
              <ArrowUp className="w-3.5 h-3.5" /> Upgrade to Membership
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(true)}>Cancel subscription</Button>
          )}
        </div>
      </Card>

      {confirmCancel && (
        <Modal title="Cancel Membership?" onClose={() => setConfirmCancel(false)}>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-note-bg border border-note-border">
              <AlertTriangle className="w-4 h-4 text-note-text flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-strong leading-relaxed">
                AI Engines will stop generating replies the moment your billing period ends. Helpdesk and the team Inbox will keep working.
              </p>
            </div>
            <p className="text-[12px] text-muted leading-relaxed">
              You will keep Membership benefits until {formatDate('2026-05-21')}. After that you can re-subscribe at any time without losing your workspace data.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-brand-border -mx-6 px-6 -mb-2 pb-2">
              <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>Keep Membership</Button>
              <Button size="sm" variant="danger" onClick={() => { setPlan('free'); setConfirmCancel(false); onToast({ type: 'warning', title: 'Membership cancelled', message: 'Active until 2026-05-21' }); }}>
                Cancel anyway
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function BillingConnects({
  onToast,
}: {
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const balance = 24_840;
  const dailyAvg = 1_120;
  const daysLeft = Math.floor(balance / dailyAvg);
  const [buyOpen, setBuyOpen] = useState(false);
  const [pkg, setPkg] = useState('10000');
  const [autoRefill, setAutoRefill] = useState(true);
  const [autoThreshold, setAutoThreshold] = useState(5000);
  const [autoPkg, setAutoPkg] = useState('10000');

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card>
        <CardHeader title="CONNECTS balance" subtitle="Used by AI Engines for replies, follow-ups, and outbound campaigns." />
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[40px] font-semibold text-strong tabular-nums leading-none tracking-tight">{balance.toLocaleString()}</p>
            <p className="text-[11px] text-subtle mt-2">CONNECTS remaining</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-subtle">Daily avg (last 7 days)</p>
            <p className="text-[14px] font-semibold text-strong tabular-nums">{dailyAvg.toLocaleString()} / day</p>
            <p className="text-[11px] text-subtle mt-2">Forecast: <span className="text-strong font-semibold">~{daysLeft} days</span> left</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-muted">Used this month</span>
            <span className="font-semibold text-strong tabular-nums">{(50_000 - balance).toLocaleString()} / 50,000</span>
          </div>
          <div className="bg-surface-3 rounded-full h-2 overflow-hidden">
            <div className="bg-brand-blue h-2 rounded-full transition-all" style={{ width: `${((50_000 - balance) / 50_000) * 100}%` }} />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button size="sm" variant="primary" onClick={() => setBuyOpen(true)}>Buy CONNECTS</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Auto-refill" subtitle="Top up automatically when balance drops below the threshold — never run out mid-conversation." />
        <div className="flex items-center gap-3 flex-wrap">
          <Switch checked={autoRefill} onChange={setAutoRefill} />
          <span className="text-[12px] text-muted">Refill</span>
          <div className="w-44">
            <Select
              value={autoPkg}
              onChange={setAutoPkg}
              disabled={!autoRefill}
              options={CONNECT_PACKAGES}
              className="block"
            />
          </div>
          <span className="text-[12px] text-muted">when balance &lt;</span>
          <Input
            type="number"
            min={500}
            step={500}
            value={autoThreshold}
            onChange={e => setAutoThreshold(Number(e.target.value))}
            disabled={!autoRefill}
            className="w-24"
          />
          <span className="text-[12px] text-muted">CONNECTS</span>
        </div>
      </Card>

      {buyOpen && (
        <Modal title="Buy CONNECTS" subtitle="Packages never expire and stack on top of your monthly allowance." onClose={() => setBuyOpen(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {CONNECT_PACKAGES.map(p => {
                const isSelected = pkg === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPkg(p.value)}
                    className={cn(
                      'text-left p-4 rounded-2xl border transition-all',
                      isSelected
                        ? 'border-brand-blue bg-brand-blue-50 shadow-card'
                        : 'border-brand-border bg-white hover:border-brand-blue-light',
                    )}
                  >
                    <p className="text-[16px] font-semibold text-strong tabular-nums leading-none">{Number(p.value).toLocaleString()}</p>
                    <p className="text-[10px] text-subtle uppercase tracking-[0.12em] mt-1">CONNECTS</p>
                    <p className="text-[13px] font-semibold text-brand-blue mt-2">{p.label.split('—')[1]?.trim()}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-brand-border -mx-6 px-6 -mb-2 pb-2">
              <Button size="sm" variant="ghost" onClick={() => setBuyOpen(false)}>Cancel</Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => { setBuyOpen(false); onToast({ type: 'success', title: 'CONNECTS purchased', message: `${Number(pkg).toLocaleString()} added to your balance` }); }}
              >
                Confirm purchase
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function BillingPayment({
  onToast,
}: {
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card>
        <CardHeader title="Payment method" subtitle="Used for Membership renewals and CONNECTS purchases." />
        <div className="flex items-center gap-3 p-3 bg-surface-2 border border-brand-border rounded-2xl">
          <div className="w-12 h-8 bg-white border border-brand-border rounded-lg flex items-center justify-center text-[10px] font-bold text-brand-blue">VISA</div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-strong">Visa •••• 4291</p>
            <p className="text-[11px] text-subtle">Expires 09/2028 · Sophie Blanchard</p>
          </div>
          <Button size="xs" variant="ghost" onClick={() => onToast({ type: 'info', title: 'Update payment method' })}>
            <Pencil className="w-3 h-3" /> Change
          </Button>
        </div>
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={() => onToast({ type: 'info', title: 'Add payment method' })}>
            <Plus className="w-3.5 h-3.5" /> Add payment method
          </Button>
        </div>
      </Card>
    </div>
  );
}

function BillingInvoices({
  onToast,
}: {
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Card padding="none">
        <table className="w-full text-[12px]">
          <thead className="bg-surface-2">
            <tr className="text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-left px-3 py-3">Description</th>
              <th className="text-right px-3 py-3">Amount</th>
              <th className="text-left px-3 py-3">Status</th>
              <th className="text-right px-5 py-3">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {INVOICES.map(inv => (
              <tr key={inv.id} className="hover:bg-surface-3 transition-colors">
                <td className="px-5 py-3 text-muted">{formatDate(inv.date)}</td>
                <td className="px-3 py-3">
                  <div className="text-strong font-semibold">{inv.desc}</div>
                  <div className="text-[10px] text-subtle">{inv.id}</div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-semibold text-strong">€{inv.amount}</td>
                <td className="px-3 py-3">{statusBadge(inv.status as 'paid' | 'pending' | 'failed')}</td>
                <td className="px-5 py-3 text-right">
                  <Button size="xs" variant="ghost" onClick={() => onToast({ type: 'info', title: `Downloading ${inv.id}` })}>
                    <Download className="w-3 h-3" /> PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-brand-border bg-surface-2/50">
          <span className="text-[11px] text-subtle">Showing 1–{Math.min(pageSize, INVOICES.length)} of {INVOICES.length}</span>
          <div className="flex items-center gap-2">
            <Button size="xs" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span className="text-[11px] text-muted tabular-nums">Page {page}</span>
            <Button size="xs" variant="ghost" onClick={() => setPage(p => p + 1)} disabled={INVOICES.length <= pageSize}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   NOTIFICATIONS
   ─────────────────────────────────────────────────────────────── */

function NotificationChannels({
  onToast,
}: {
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const [rows, setRows] = useState(NOTIFICATION_TYPES);

  function update(id: string, patch: Partial<typeof NOTIFICATION_TYPES[number]>) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Card padding="none">
        <table className="w-full text-[12px]">
          <thead className="bg-surface-2">
            <tr className="text-[10px] font-semibold text-subtle uppercase tracking-[0.12em]">
              <th className="text-left px-5 py-3">Notification</th>
              <th className="text-center px-3 py-3 w-28">In-app</th>
              <th className="text-center px-3 py-3 w-28">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-surface-3 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-strong">{r.label}</span>
                    {r.numericLabel != null && (
                      <span className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={r.numericValue}
                          onChange={e => update(r.id, { numericValue: Number(e.target.value) })}
                          className="w-14 border border-brand-border rounded-lg bg-white text-[12px] text-strong px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light transition-all"
                        />
                        <span className="text-[11px] text-subtle">{r.numericSuffix}</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-center px-3 py-3">
                  {r.emailOnly
                    ? <span className="text-[10px] text-faint">—</span>
                    : <Switch
                        checked={r.inApp}
                        onChange={(v) => { update(r.id, { inApp: v }); onToast({ type: 'info', title: v ? 'In-app notification on' : 'In-app notification off' }); }}
                        size="sm"
                      />}
                </td>
                <td className="text-center px-3 py-3">
                  {r.inAppOnly
                    ? <span className="text-[10px] text-faint">—</span>
                    : <Switch
                        checked={r.email}
                        onChange={(v) => { update(r.id, { email: v }); onToast({ type: 'info', title: v ? 'Email notification on' : 'Email notification off' }); }}
                        size="sm"
                      />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function NotificationQuiet({
  onToast,
}: {
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const [from, setFrom] = useState('22:00');
  const [to, setTo] = useState('08:00');
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card>
        <CardHeader
          title="Quiet hours"
          subtitle="Pause non-critical alerts during this window. Critical alerts (CONNECTS = 0, Engine error) always come through."
          action={<Switch checked={enabled} onChange={setEnabled} />}
        />
        <SubFormGrid>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>From</FieldLabel>
            <input
              type="time"
              value={from}
              onChange={e => setFrom(e.target.value)}
              disabled={!enabled}
              className={cn(
                'w-full border border-brand-border rounded-lg bg-white text-[12px] text-strong px-3 py-2',
                'focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light transition-all',
                !enabled && 'opacity-60 bg-surface-2',
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>To</FieldLabel>
            <input
              type="time"
              value={to}
              onChange={e => setTo(e.target.value)}
              disabled={!enabled}
              className={cn(
                'w-full border border-brand-border rounded-lg bg-white text-[12px] text-strong px-3 py-2',
                'focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light transition-all',
                !enabled && 'opacity-60 bg-surface-2',
              )}
            />
          </div>
        </SubFormGrid>
      </Card>
      <SaveBar onSave={() => onToast({ type: 'success', title: 'Quiet hours saved' })} />
    </div>
  );
}

function NotificationSound({
  onToast,
}: {
  onToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const [sound, setSound] = useState('chime');
  const [volume, setVolume] = useState(60);
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Card>
        <CardHeader
          title="Sound"
          subtitle="Plays when a new in-app notification arrives in this browser tab."
          action={<Switch checked={enabled} onChange={setEnabled} />}
        />
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Sound</FieldLabel>
            <Select
              value={sound}
              onChange={setSound}
              options={SOUND_OPTIONS}
              disabled={!enabled}
              className="block"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Volume</FieldLabel>
            <div className="flex items-center gap-3">
              <Volume2 className={cn('w-4 h-4', enabled ? 'text-muted' : 'text-faint')} />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                disabled={!enabled}
                className="flex-1 accent-brand-blue"
              />
              <span className="text-[11px] text-muted tabular-nums w-10 text-right">{volume}%</span>
              <Button size="xs" variant="ghost" disabled={!enabled} onClick={() => onToast({ type: 'info', title: 'Preview played' })}>Preview</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   SaveBar — sticky save bar shared across edit forms
   ─────────────────────────────────────────────────────────────── */

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button size="sm" variant="ghost">Discard</Button>
      <Button size="sm" variant="primary" onClick={onSave}>Save Changes</Button>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   Modal — local helper
   ─────────────────────────────────────────────────────────────── */

function Modal({
  title,
  subtitle,
  icon,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0" style={{ background: 'rgba(14, 16, 19, 0.30)' }} onClick={onClose} aria-label="Close" />
      <div
        className="relative w-[560px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl overflow-hidden flex flex-col max-h-[88vh]"
        style={{ boxShadow: 'var(--shadow-panel)' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-brand-border">
          <div className="flex items-start gap-3 min-w-0">
            {icon ?? (
              <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-[16px] font-semibold text-strong leading-tight">{title}</h3>
              {subtitle && <p className="text-[12px] text-subtle mt-0.5 leading-relaxed">{subtitle}</p>}
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
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
