import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, TrendingUp, CalendarCheck, Sparkles, Plane,
  BellRing, Heart, Star, Cpu, ChevronRight, LayoutDashboard,
  Coins, Radio, Users, Briefcase, UserCog, Activity, FileBarChart,
  Building2, KeyRound, MessageCircle, AtSign,
  UserCircle, CreditCard, Bell,
} from 'lucide-react';
import { cn } from '../utils';
import { mockEngines } from '../data/mock/engines';
import type { AIEngine, ChannelType } from '../types';
import { getEngineSpec } from '../features/engines/lib/engineSpec';
import { ChannelIcon } from '../components/ui/ChannelIcon';

/* ── Engine status colours (inbox-style monochrome) ── */
const statusDot: Record<string, string> = {
  active:   'bg-brand-blue',
  paused:   'bg-brand-gray',
  error:    'bg-brand-black',
  inactive: 'bg-faint',
};

/* ── Engine identity icons — semantic per stage of guest journey ── */
const ENGINE_ICONS: Record<string, typeof TrendingUp> = {
  Conversion:  TrendingUp,
  Reservation: CalendarCheck,
  Upsell:      Sparkles,
  Arrival:     Plane,
  Concierge:   BellRing,
  Recovery:    Heart,
  Reputation:  Star,
};

const statusLabel: Record<string, string> = {
  active:   'Active',
  paused:   'Paused',
  error:    'Error',
  inactive: 'Inactive',
};

function getEngineSubNav(engineName: string): { id: string; label: string; badge?: string }[] {
  const spec = getEngineSpec(engineName);
  return [
    { id: 'activation',   label: 'Activation' },
    { id: 'settings',     label: 'General Settings', badge: '1 suggestion' },
    { id: 'config',       label: spec.configLabel },
    { id: 'offers',       label: 'Offers / Actions' },
    { id: 'knowledge',    label: 'Knowledge Base' },
    { id: 'routing',      label: 'Routing' },
    { id: 'integrations', label: 'Integrations & MCP' },
    { id: 'playground',   label: 'Playground' },
    { id: 'analytics',    label: 'Analytics' },
    { id: 'monitor',      label: 'Monitor Agent' },
  ];
}

/* ── Generic sub-item types ── */
type SubItem =
  | { type?: 'link'; label: string; path: string; description?: string; icon?: React.ReactNode }
  | { type: 'divider'; label?: string };

function Section({ title, items }: { title: string; items: SubItem[] }) {
  const location = useLocation();
  const activePath = `${location.pathname}${location.search}`;
  return (
    <div className="px-3 py-3">
      <p className="px-2 mb-2 text-[11px] font-semibold text-subtle">{title}</p>
      <div className="space-y-0.5">
        {items.map((it, idx) => {
          if (it.type === 'divider') {
            return (
              <div key={`div-${idx}`} className="py-2">
                <div className="h-px bg-brand-border" />
              </div>
            );
          }
          const isQueryItem = it.path.includes('?');
          const active = isQueryItem
            ? activePath === it.path
            : (location.pathname === it.path || (it.path !== '/' && location.pathname.startsWith(it.path)));
          return (
            <NavLink
              key={it.path}
              to={it.path}
              className={cn(
                'group block rounded-lg px-3 py-2 transition-colors',
                active ? 'bg-brand-blue-50 text-brand-blue' : 'text-muted hover:text-strong hover:bg-surface-3',
              )}
            >
              <div className="flex items-center gap-2.5">
                {it.icon && (
                  <span className={cn(
                    'flex items-center justify-center w-6 h-6 flex-shrink-0',
                    active ? 'text-brand-blue' : 'text-subtle group-hover:text-muted',
                  )}>
                    {it.icon}
                  </span>
                )}
                <span className={cn('text-[12px] truncate', active ? 'font-semibold' : 'font-normal')}>
                  {it.label}
                </span>
              </div>
              {it.description && (
                <div className="text-[11px] text-subtle mt-0.5 leading-relaxed line-clamp-2 ml-[34px]">{it.description}</div>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

/* ── Engines section ── */
function EnginesSection() {
  const location = useLocation();
  const navigate = useNavigate();
  const parts = location.pathname.split('/');
  const activeSlug = parts[2] ?? '';
  const activeSub  = parts[3] ?? '';
  const isOverview = location.pathname === '/engines' || location.pathname === '/engines/';

  const totalToday = mockEngines.reduce((s, e) => s + e.actionsToday, 0);
  const activeCount = mockEngines.filter(e => e.status === 'active').length;

  return (
    <div className="flex flex-col h-full">
      <div className="h-[56px] flex items-center justify-between px-4 border-b border-brand-border flex-shrink-0">
        <span className="text-[10px] font-semibold text-subtle uppercase tracking-[0.22em]">AI Engines</span>
        <span className="text-[10px] text-subtle tabular-nums">
          {activeCount}/{mockEngines.length} active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <NavLink
          to="/engines"
          end
          className={cn(
            'group block rounded-xl p-3 transition-all',
            isOverview
              ? 'bg-brand-blue text-white shadow-card'
              : 'bg-brand-blue-50 border border-brand-blue-light hover:bg-brand-blue hover:text-white hover:border-brand-blue',
          )}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                isOverview
                  ? 'bg-white/15'
                  : 'bg-white border border-brand-blue-light group-hover:bg-white/15 group-hover:border-transparent',
              )}
            >
              <LayoutGrid
                className={cn(
                  'w-4 h-4 transition-colors',
                  isOverview ? 'text-white' : 'text-brand-blue group-hover:text-white',
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn(
                'text-[12px] font-semibold leading-tight transition-colors',
                isOverview ? 'text-white' : 'text-brand-blue group-hover:text-white',
              )}>
                All AI Engines
              </p>
              <p className={cn(
                'text-[10px] leading-tight mt-0.5 tabular-nums transition-colors',
                isOverview ? 'text-white/70' : 'text-brand-blue/70 group-hover:text-white/80',
              )}>
                Overview · {totalToday} actions today
              </p>
            </div>
            <ChevronRight
              className={cn(
                'w-3.5 h-3.5 flex-shrink-0 transition-colors',
                isOverview ? 'text-white/70' : 'text-brand-blue/60 group-hover:text-white',
              )}
            />
          </div>
        </NavLink>

        <div className="px-2 pt-1">
          <p className="text-[11px] font-semibold text-subtle">Engines</p>
        </div>

        <div className="space-y-0.5">
          {mockEngines.map((engine: AIEngine) => {
            const slug = engine.name.toLowerCase();
            const isSelected = slug === activeSlug;
            const Icon = ENGINE_ICONS[engine.name] ?? Cpu;

            return (
              <div key={engine.id}>
                <button
                  onClick={() => navigate(`/engines/${slug}`)}
                  className={cn(
                    'group w-full flex items-center gap-2.5 h-10 px-2.5 rounded-lg transition-all duration-150 text-left',
                    isSelected
                      ? 'bg-brand-blue-50 text-brand-blue'
                      : 'text-muted hover:text-strong hover:bg-surface-3',
                  )}
                  title={engine.description}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 ml-0.5 flex-shrink-0',
                      isSelected ? 'text-brand-blue' : 'text-subtle group-hover:text-muted',
                    )}
                  />

                  <span
                    className={cn(
                      'text-[12px] flex-1 truncate',
                      isSelected ? 'font-semibold' : 'font-normal',
                    )}
                  >
                    {engine.name}
                    {engine.status !== 'active' && (
                      <span className="ml-1 text-[10px] font-semibold text-subtle">
                        · {statusLabel[engine.status] ?? engine.status}
                      </span>
                    )}
                  </span>

                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full flex-shrink-0',
                      statusDot[engine.status] ?? statusDot.inactive,
                    )}
                    aria-label={statusLabel[engine.status]}
                  />
                </button>

                {isSelected && (
                  <div className="mt-0.5 mb-2 ml-4 pl-3 border-l-2 border-brand-blue-light space-y-0.5">
                    {getEngineSubNav(engine.name).map(item => {
                      const isSubActive = activeSub === item.id;
                      return (
                        <NavLink
                          key={item.id}
                          to={`/engines/${slug}/${item.id}`}
                          end
                          className={cn(
                            'group flex items-center justify-between gap-2 h-9 px-2.5 rounded-lg transition-colors',
                            isSubActive
                              ? 'bg-brand-blue-50 text-brand-blue'
                              : 'text-muted hover:text-strong hover:bg-surface-3',
                          )}
                        >
                          <span className={cn('text-[12px]', isSubActive ? 'font-semibold' : 'font-normal')}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-blue-50 text-brand-blue border border-brand-blue-light whitespace-nowrap flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Analytics section (TZ §7.1) ── */
const ANALYTICS_GROUPS: {
  label: string;
  items: { path: string; label: string; icon: typeof TrendingUp; exact?: boolean }[];
}[] = [
  {
    label: 'Overview',
    items: [
      { path: '/analytics',          label: 'General dashboard', icon: LayoutDashboard, exact: true },
      { path: '/analytics/connects', label: 'Connects',          icon: Coins },
    ],
  },
  {
    label: 'AI Engines',
    items: [
      { path: '/analytics/engines/conversion',  label: 'Conversion',  icon: TrendingUp },
      { path: '/analytics/engines/reservation', label: 'Reservation', icon: CalendarCheck },
      { path: '/analytics/engines/upsell',      label: 'Upsell',      icon: Sparkles },
      { path: '/analytics/engines/arrival',     label: 'Arrival',     icon: Plane },
      { path: '/analytics/engines/concierge',   label: 'Concierge',   icon: BellRing },
      { path: '/analytics/engines/recovery',    label: 'Recovery',    icon: Heart },
      { path: '/analytics/engines/reputation',  label: 'Reputation',  icon: Star },
    ],
  },
  {
    label: 'Channels',
    items: [
      { path: '/analytics/channels', label: 'Channel analytics', icon: Radio },
    ],
  },
  {
    label: 'Team',
    items: [
      { path: '/analytics/operators',   label: 'Operator productivity', icon: UserCog },
      { path: '/analytics/departments', label: 'Departments',           icon: Briefcase },
      { path: '/analytics/load',        label: 'Load',                  icon: Activity },
    ],
  },
  {
    label: 'Guests',
    items: [
      { path: '/analytics/guests', label: 'Guest insights', icon: Users },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/analytics/reports', label: 'Scheduled reports', icon: FileBarChart },
    ],
  },
];

function AnalyticsSection() {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex flex-col h-full">
      <div className="h-[56px] flex items-center px-4 border-b border-brand-border flex-shrink-0">
        <span className="text-[10px] font-semibold text-subtle uppercase tracking-[0.22em]">Analytics</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {ANALYTICS_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-2.5 mb-1.5 text-[11px] font-semibold text-subtle">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.path, item.exact);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={cn(
                      'flex items-center gap-2.5 h-10 px-2.5 rounded-lg transition-all duration-150 group',
                      active
                        ? 'bg-brand-blue-50 text-brand-blue'
                        : 'text-muted hover:text-strong hover:bg-surface-3',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0 ml-0.5',
                        active ? 'text-brand-blue' : 'text-subtle group-hover:text-muted',
                      )}
                    />
                    <span className={cn('text-[12px]', active ? 'font-semibold' : 'font-normal')}>
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

function ch(channel: ChannelType) {
  return <ChannelIcon channel={channel} size="lg" className="!text-current" />;
}

const INTEGRATION_ITEMS: SubItem[] = [
  { label: 'Web Widget', path: '/channels?type=web_widget', icon: ch('web_widget') },
  { label: 'WhatsApp',   path: '/channels?type=whatsapp',   icon: ch('whatsapp')   },
  { label: 'SMS',        path: '/channels?type=sms',        icon: ch('sms')        },
  { label: 'Telegram',   path: '/channels?type=telegram',   icon: ch('telegram')   },
  { label: 'Viber',      path: '/channels?type=viber',      icon: ch('viber')      },
  { label: 'Messenger',  path: '/channels?type=messenger',  icon: ch('messenger')  },
  { label: 'Instagram',  path: '/channels?type=instagram',  icon: ch('instagram')  },
  { label: 'Email',      path: '/channels?type=email',      icon: ch('email')      },
  { label: 'RCS',        path: '/channels?type=rcs',        icon: <MessageCircle className="w-6 h-6" strokeWidth={1.7} /> },
  { type: 'divider' },
  { label: 'PMS',        path: '/channels?type=pms',        icon: <Building2 className="w-6 h-6" strokeWidth={1.7} />     },
  { label: 'MCP',        path: '/channels?type=mcp',        icon: <Cpu className="w-6 h-6" strokeWidth={1.7} />           },
  { label: 'API keys',   path: '/channels?type=api_keys',   icon: <KeyRound className="w-6 h-6" strokeWidth={1.7} />      },
  { label: 'OTA Email',  path: '/channels?type=ota_email',  icon: <AtSign className="w-6 h-6" strokeWidth={1.7} />        },
];

const SETTINGS_ITEMS: SubItem[] = [
  { label: 'Company Information', path: '/settings?section=company',       icon: <Building2   className="w-4 h-4" strokeWidth={1.7} /> },
  { label: 'Profile',              path: '/settings?section=profile',       icon: <UserCircle  className="w-4 h-4" strokeWidth={1.7} /> },
  { label: 'Team',                 path: '/settings?section=team',          icon: <Users       className="w-4 h-4" strokeWidth={1.7} /> },
  { label: 'Billing',              path: '/settings?section=billing',       icon: <CreditCard  className="w-4 h-4" strokeWidth={1.7} /> },
  { label: 'Notifications',        path: '/settings?section=notifications', icon: <Bell        className="w-4 h-4" strokeWidth={1.7} /> },
];

/* ── Generic section resolver ── */
function getSection(pathname: string): { title: string; items: SubItem[] } | null {
  if (pathname.startsWith('/channels')) {
    return { title: 'Integrations', items: INTEGRATION_ITEMS };
  }
  if (pathname.startsWith('/settings')) {
    return { title: 'Settings', items: SETTINGS_ITEMS };
  }
  return null;
}

export function SubSidebar() {
  const location = useLocation();

  /* Inbox sub-nav */
  if (location.pathname.startsWith('/inbox') || location.pathname === '/') {
    const inboxItems: SubItem[] = [
      { label: 'Unread',         path: '/inbox?view=unread'   },
      { label: 'New',            path: '/inbox?view=new'      },
      { label: 'Pending',        path: '/inbox?view=pending'  },
      { label: 'Paused',         path: '/inbox?view=paused'   },
      { label: 'Urgent',         path: '/inbox?view=urgent'   },
      { label: 'Closed',         path: '/inbox?view=closed'   },
      { type: 'divider' },
      { label: 'Assigned to me', path: '/inbox?view=my_all'   },
      { label: 'My new',         path: '/inbox?view=my_new'   },
      { label: 'My pending',     path: '/inbox?view=my_pending'},
      { label: 'My paused',      path: '/inbox?view=my_paused'},
      { label: 'My urgent',      path: '/inbox?view=my_urgent'},
      { label: 'My closed',      path: '/inbox?view=my_closed'},
    ];
    return (
      <aside className="w-[260px] flex-shrink-0 bg-white" style={{ borderRight: '1px solid #EDEEF1' }}>
        <div className="h-[56px] flex items-center px-4" style={{ borderBottom: '1px solid #EDEEF1' }}>
          <div className="text-[12px] font-semibold text-strong">Inbox</div>
        </div>
        <Section title="Inbox" items={inboxItems} />
      </aside>
    );
  }

  if (location.pathname.startsWith('/engines')) {
    return (
      <aside className="w-[260px] flex-shrink-0 bg-white flex flex-col overflow-hidden" style={{ borderRight: '1px solid #EDEEF1' }}>
        <EnginesSection />
      </aside>
    );
  }

  if (location.pathname.startsWith('/analytics')) {
    return (
      <aside className="w-[260px] flex-shrink-0 bg-white flex flex-col overflow-hidden" style={{ borderRight: '1px solid #EDEEF1' }}>
        <AnalyticsSection />
      </aside>
    );
  }

  const section = getSection(location.pathname);
  const title = section?.title ?? 'Workspace';
  const items = section?.items ?? [{ label: 'Inbox', path: '/inbox' }];

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white" style={{ borderRight: '1px solid #EDEEF1' }}>
      <div className="h-[56px] flex items-center px-4" style={{ borderBottom: '1px solid #EDEEF1' }}>
        <span className="text-[10px] font-semibold text-subtle uppercase tracking-[0.22em]">{title}</span>
      </div>
      <Section title={title} items={items} />
    </aside>
  );
}
