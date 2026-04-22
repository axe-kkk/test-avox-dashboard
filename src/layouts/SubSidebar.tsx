import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../utils';

type SubItem =
  | { type?: 'link'; label: string; path: string; description?: string }
  | { type: 'divider'; label?: string };

function Section({
  title,
  items,
}: {
  title: string;
  items: SubItem[];
}) {
  const location = useLocation();
  const activePath = `${location.pathname}${location.search}`;

  return (
    <div className="px-3 py-3">
      <p className="px-2 mb-2 text-[9px] font-semibold text-[#8B9299] uppercase tracking-[0.16em]">
        {title}
      </p>
      <div className="space-y-1">
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
                <div className="text-[11px] text-[#8B9299] mt-0.5 leading-relaxed line-clamp-2">
                  {it.description}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function getSection(pathname: string): { title: string; items: SubItem[] } {
  if (pathname.startsWith('/inbox') || pathname === '/') {
    return {
      title: 'Inbox',
      items: [
        { label: 'Unread', path: '/inbox?view=unread' },
        { label: 'New', path: '/inbox?view=new' },
        { label: 'Pending', path: '/inbox?view=pending' },
        { label: 'Paused', path: '/inbox?view=paused' },
        { label: 'Urgent', path: '/inbox?view=urgent' },
        { label: 'Closed', path: '/inbox?view=closed' },
        { type: 'divider' },
        { label: 'Assigned to me', path: '/inbox?view=my_all' },
        { label: 'My new', path: '/inbox?view=my_new' },
        { label: 'My pending', path: '/inbox?view=my_pending' },
        { label: 'My paused', path: '/inbox?view=my_paused' },
        { label: 'My urgent', path: '/inbox?view=my_urgent' },
        { label: 'My closed', path: '/inbox?view=my_closed' },
      ],
    };
  }

  if (pathname.startsWith('/analytics')) {
    return {
      title: 'Analytics',
      items: [
        { label: 'Overview', path: '/analytics/overview', description: 'Operational snapshot.' },
        { label: 'Reports', path: '/analytics', description: 'Performance & trends.' },
      ],
    };
  }

  if (pathname.startsWith('/guests')) {
    return { title: 'Guests', items: [{ label: 'Directory', path: '/guests' }] };
  }

  if (pathname.startsWith('/engines')) {
    return { title: 'AI Engines', items: [{ label: 'Engines', path: '/engines' }] };
  }

  if (pathname.startsWith('/sequences')) {
    return { title: 'Sequences', items: [{ label: 'Sequences', path: '/sequences' }] };
  }

  if (pathname.startsWith('/channels')) {
    return { title: 'Channels', items: [{ label: 'Channels', path: '/channels' }] };
  }

  if (pathname.startsWith('/settings')) {
    return {
      title: 'Settings',
      items: [
        { label: 'Workspace', path: '/settings' },
      ],
    };
  }

  return { title: 'Workspace', items: [{ label: 'Inbox', path: '/inbox' }] };
}

export function SubSidebar() {
  const location = useLocation();
  const section = getSection(location.pathname);

  return (
    <aside
      className="w-[260px] flex-shrink-0 bg-white"
      style={{ borderRight: '1px solid #EDEEF1' }}
    >
      <div className="h-[56px] flex items-center px-4" style={{ borderBottom: '1px solid #EDEEF1' }}>
        <div className="text-[13px] font-semibold text-[#0E1013]" style={{ fontFamily: "'Azeret Mono', monospace" }}>
          {section.title}
        </div>
      </div>
      <Section title={section.title} items={section.items} />
    </aside>
  );
}

