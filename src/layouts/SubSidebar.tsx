import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, TrendingUp, CalendarCheck, Sparkles, Plane,
  BellRing, Heart, Star, Cpu, ChevronRight,
} from 'lucide-react';
import { cn } from '../utils';
import { mockEngines } from '../data/mock/engines';
import type { AIEngine } from '../types';
import { getEngineSpec } from '../features/engines/lib/engineSpec';

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

/* ── Engine sub-nav items.
   `config` is engine-specific — its label changes per engine
   (e.g. "Upgrade Rules" for Upsell, "Complaint Handling" for Recovery). */
function getEngineSubNav(engineName: string): { id: string; label: string; badge?: string }[] {
  const spec = getEngineSpec(engineName);
  return [
    { id: 'activation',   label: 'Activation'         },
    { id: 'settings',     label: 'General Settings',  badge: '1 suggestion' },
    { id: 'config',       label: spec.configLabel    },
    { id: 'offers',       label: 'Offers / Actions'   },
    { id: 'knowledge',    label: 'Knowledge Base'      },
    { id: 'routing',      label: 'Routing'             },
    { id: 'integrations', label: 'Integrations & MCP' },
    { id: 'playground',   label: 'Playground'          },
    { id: 'analytics',    label: 'Analytics'           },
    { id: 'monitor',      label: 'Monitor Agent'       },
  ];
}

/* ── Generic sub-item types ── */
type SubItem =
  | { type?: 'link'; label: string; path: string; description?: string }
  | { type: 'divider'; label?: string };

function Section({ title, items }: { title: string; items: SubItem[] }) {
  const location = useLocation();
  const activePath = `${location.pathname}${location.search}`;
  return (
    <div className="px-3 py-3">
      <p className="px-2 mb-2 text-[10px] font-semibold text-[#8B9299] uppercase tracking-[0.16em]">{title}</p>
      <div className="space-y-0.5">
        {items.map((it, idx) => {
          if (it.type === 'divider') {
            return (
              <div key={`div-${idx}`} className="py-2">
                <div className="h-px bg-[#EDEEF1]" />
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
                'block rounded-lg px-3 py-2 transition-colors',
                active ? 'bg-[#EEF2FC] text-[#0E1013]' : 'text-[#5C6370] hover:text-[#0E1013] hover:bg-[#F6F7F9]',
              )}
            >
              <div className="text-[12px] font-medium">{it.label}</div>
              {it.description && (
                <div className="text-[10px] text-[#8B9299] mt-0.5 leading-relaxed line-clamp-2">{it.description}</div>
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
  const parts = location.pathname.split('/');         // ['', 'engines', slug?, sub?]
  const activeSlug = parts[2] ?? '';
  const activeSub  = parts[3] ?? '';
  const isOverview = location.pathname === '/engines' || location.pathname === '/engines/';

  const totalToday = mockEngines.reduce((s, e) => s + e.actionsToday, 0);
  const activeCount = mockEngines.filter(e => e.status === 'active').length;

  return (
    <div className="flex flex-col h-full">
      {/* ── Section header (mirrors Inbox SubSidebar) ─────────────── */}
      <div className="h-[56px] flex items-center justify-between px-4 border-b border-brand-border flex-shrink-0">
        <div
          className="text-[12px] font-semibold text-brand-black"
        >
          AI Engines
        </div>
        <span className="text-[10px] text-subtle tabular-nums">
          {activeCount}/{mockEngines.length} active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* ── Main "All Engines" CTA — primary entry to /engines ───── */}
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
              <p
                className={cn(
                  'text-[12px] font-semibold leading-tight transition-colors',
                  isOverview ? 'text-white' : 'text-brand-blue group-hover:text-white',
                )}
              >
                All AI Engines
              </p>
              <p
                className={cn(
                  'text-[10px] leading-tight mt-0.5 tabular-nums transition-colors',
                  isOverview ? 'text-white/70' : 'text-brand-blue/70 group-hover:text-white/80',
                )}
              >
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

        {/* ── Section label ─────────────────────────────────────── */}
        <div className="px-2 pt-1">
          <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em]">Engines</p>
        </div>

        {/* ── Engine list ───────────────────────────────────────── */}
        <div className="space-y-0.5">
          {mockEngines.map((engine: AIEngine) => {
            const slug = engine.name.toLowerCase();
            const isSelected = slug === activeSlug;
            const Icon = ENGINE_ICONS[engine.name] ?? Cpu;

            return (
              <div key={engine.id}>
                {/* Engine row */}
                <button
                  onClick={() => navigate(`/engines/${slug}`)}
                  className={cn(
                    'relative w-full flex items-center gap-2.5 rounded-lg pl-3 pr-2 py-2 transition-colors text-left group',
                    isSelected
                      ? 'bg-brand-blue-50'
                      : 'hover:bg-surface-3',
                  )}
                  title={engine.description}
                >
                  {/* Active left-accent bar (matches inbox row pattern) */}
                  {isSelected && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-brand-blue rounded-r-full" />
                  )}

                  {/* Engine identity icon */}
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5 flex-shrink-0 transition-colors',
                      isSelected ? 'text-brand-blue' : 'text-subtle group-hover:text-muted',
                    )}
                  />

                  {/* Name + (when selected) inline status hint */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-[12px] truncate',
                        isSelected ? 'font-semibold text-brand-blue' : 'font-medium text-muted group-hover:text-strong',
                      )}
                    >
                      {engine.name}
                    </span>
                    {/* Show status text only when not active (i.e. needs attention) */}
                    {engine.status !== 'active' && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-subtle whitespace-nowrap">
                        · {statusLabel[engine.status] ?? engine.status}
                      </span>
                    )}
                  </div>

                  {/* Status dot (monochrome) */}
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full flex-shrink-0',
                      statusDot[engine.status] ?? statusDot.inactive,
                    )}
                    aria-label={statusLabel[engine.status]}
                  />

                  {/* Action count pill */}
                  {engine.actionsToday > 0 && (
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 tabular-nums min-w-[22px] text-center transition-colors',
                        isSelected
                          ? 'bg-white text-brand-blue border border-brand-blue-light'
                          : 'bg-surface-3 text-subtle border border-brand-border group-hover:bg-white',
                      )}
                    >
                      {engine.actionsToday}
                    </span>
                  )}
                </button>

                {/* Sub-nav — slides in when this engine is selected */}
                {isSelected && (
                  <div className="mt-0.5 ml-4 pl-3 border-l-2 border-brand-blue-light space-y-0.5 pb-2">
                    {getEngineSubNav(engine.name).map(item => {
                      const isSubActive = activeSub === item.id;
                      return (
                        <NavLink
                          key={item.id}
                          to={`/engines/${slug}/${item.id}`}
                          end
                          className={cn(
                            'flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition-colors',
                            isSubActive
                              ? 'bg-brand-blue-50 text-brand-blue'
                              : 'text-muted hover:text-strong hover:bg-surface-3',
                          )}
                        >
                          <span className="text-[12px] font-medium">{item.label}</span>
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

/* ── Generic section resolver ── */
function getSection(pathname: string): { title: string; items: SubItem[] } | null {
  if (pathname.startsWith('/analytics')) {
    return {
      title: 'Analytics',
      items: [
        { label: 'Overview', path: '/analytics/overview', description: 'Operational snapshot.' },
        { label: 'Reports',  path: '/analytics',          description: 'Performance & trends.'  },
      ],
    };
  }
  if (pathname.startsWith('/sequences')) {
    return { title: 'Sequences', items: [{ label: 'Sequences', path: '/sequences' }] };
  }
  if (pathname.startsWith('/channels')) {
    return { title: 'Channels', items: [{ label: 'Channels', path: '/channels' }] };
  }
  if (pathname.startsWith('/settings')) {
    return { title: 'Settings', items: [{ label: 'Workspace', path: '/settings' }] };
  }
  return null;
}

export function SubSidebar() {
  const location = useLocation();
  const activePath = `${location.pathname}${location.search}`;

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
          <div className="text-[12px] font-semibold text-[#0E1013]">Inbox</div>
        </div>
        <Section title="Inbox" items={inboxItems} />
      </aside>
    );
  }

  /* Engines — custom renderer */
  if (location.pathname.startsWith('/engines')) {
    return (
      <aside className="w-[260px] flex-shrink-0 bg-white flex flex-col overflow-hidden" style={{ borderRight: '1px solid #EDEEF1' }}>
        <EnginesSection />
      </aside>
    );
  }

  /* Other sections */
  const section = getSection(location.pathname);
  const title = section?.title ?? 'Workspace';
  const items = section?.items ?? [{ label: 'Inbox', path: '/inbox' }];

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white" style={{ borderRight: '1px solid #EDEEF1' }}>
      <div className="h-[56px] flex items-center px-4" style={{ borderBottom: '1px solid #EDEEF1' }}>
        <div className="text-[12px] font-semibold text-[#0E1013]">{title}</div>
      </div>
      <Section title={title} items={items} />
    </aside>
  );
}
