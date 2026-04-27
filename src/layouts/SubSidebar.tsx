import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../utils';
import { mockEngines } from '../data/mock/engines';
import type { AIEngine } from '../types';

/* ── Engine status colours ── */
const statusDot: Record<string, string> = {
  active:   'bg-[#16A34A]',
  paused:   'bg-[#F59E0B]',
  error:    'bg-[#EF4444]',
  inactive: 'bg-[#C4C8CF]',
};

/* ── Engine sub-nav items ── */
const ENGINE_SUB_NAV = [
  { id: 'activation',   label: 'Activation'         },
  { id: 'settings',     label: 'General Settings', badge: '1 suggestion' },
  { id: 'offers',       label: 'Offers / Actions'   },
  { id: 'knowledge',    label: 'Knowledge Base'      },
  { id: 'routing',      label: 'Routing'             },
  { id: 'integrations', label: 'Integrations & MCP' },
  { id: 'playground',   label: 'Playground'          },
  { id: 'analytics',    label: 'Analytics'           },
  { id: 'monitor',      label: 'Monitor Agent'       },
];

/* ── Generic sub-item types ── */
type SubItem =
  | { type?: 'link'; label: string; path: string; description?: string }
  | { type: 'divider'; label?: string };

function Section({ title, items }: { title: string; items: SubItem[] }) {
  const location = useLocation();
  const activePath = `${location.pathname}${location.search}`;
  return (
    <div className="px-3 py-3">
      <p className="px-2 mb-2 text-[9px] font-semibold text-[#8B9299] uppercase tracking-[0.16em]">{title}</p>
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
              <div className="text-[13px] font-medium">{it.label}</div>
              {it.description && (
                <div className="text-[11px] text-[#8B9299] mt-0.5 leading-relaxed line-clamp-2">{it.description}</div>
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

  return (
    <div className="px-3 py-3">
      <div className="space-y-0.5">
        {mockEngines.map((engine: AIEngine) => {
          const slug = engine.name.toLowerCase();
          const isSelected = slug === activeSlug;

          return (
            <div key={engine.id}>
              {/* Engine row */}
              <button
                onClick={() => navigate(`/engines/${slug}`)}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors text-left group',
                  isSelected
                    ? 'bg-[#EEF2FC]'
                    : 'hover:bg-[#F6F7F9]',
                )}
              >
                {/* Status dot */}
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  statusDot[engine.status] ?? statusDot.inactive,
                )} />
                {/* Name */}
                <span className={cn(
                  'flex-1 text-[13px] font-medium truncate',
                  isSelected ? 'text-[#2355A7]' : 'text-[#5C6370] group-hover:text-[#3D4550]',
                )}>
                  {engine.name}
                </span>
                {/* Actions today badge */}
                {engine.actionsToday > 0 && (
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 tabular-nums',
                    isSelected
                      ? 'bg-[#BED4F6]/40 text-[#2355A7]'
                      : 'bg-[#F0F1F3] text-[#8B9299] group-hover:bg-[#E8E9EC]',
                  )}>
                    {engine.actionsToday}
                  </span>
                )}
              </button>

              {/* Sub-nav — slides in when this engine is selected */}
              {isSelected && (
                <div className="mt-0.5 ml-4 pl-3 border-l-2 border-[#BED4F6] space-y-0.5 pb-1">
                  {ENGINE_SUB_NAV.map(item => {
                    const isSubActive = activeSub === item.id;
                    return (
                      <NavLink
                        key={item.id}
                        to={`/engines/${slug}/${item.id}`}
                        end
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition-colors',
                          isSubActive
                            ? 'bg-[#EEF2FC] text-[#2355A7]'
                            : 'text-[#5C6370] hover:text-[#3D4550] hover:bg-[#F6F7F9]',
                        )}
                      >
                        <span className="text-[12px] font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] whitespace-nowrap flex-shrink-0">
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
          <div className="text-[13px] font-semibold text-[#0E1013]" style={{ fontFamily: "'Azeret Mono', monospace" }}>Inbox</div>
        </div>
        <Section title="Inbox" items={inboxItems} />
      </aside>
    );
  }

  /* Engines — custom renderer */
  if (location.pathname.startsWith('/engines')) {
    return (
      <aside className="w-[260px] flex-shrink-0 bg-white overflow-y-auto" style={{ borderRight: '1px solid #EDEEF1' }}>
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
        <div className="text-[13px] font-semibold text-[#0E1013]" style={{ fontFamily: "'Azeret Mono', monospace" }}>{title}</div>
      </div>
      <Section title={title} items={items} />
    </aside>
  );
}
