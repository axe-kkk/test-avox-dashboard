import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, Users, Cpu, GitBranch,
  Radio, BarChart3, Settings, ChevronRight,
} from 'lucide-react';
import { useApp } from '../app/AppContext';
import { cn } from '../utils';
import { mockConversations } from '../data/mock/conversations';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/inbox', icon: Inbox,            label: 'Inbox', badge: mockConversations.filter(c => c.unreadCount > 0).length },
      { path: '/guests', icon: Users,           label: 'Guests' },
      { path: '/analytics', icon: BarChart3,    label: 'Analytics' },
    ],
  },
  {
    label: 'Automation',
    items: [
      { path: '/engines',   icon: Cpu,       label: 'AI Engines' },
      { path: '/sequences', icon: GitBranch, label: 'Sequences' },
      { path: '/channels',  icon: Radio,     label: 'Channels' },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const allItems = navGroups.flatMap(g => g.items);

function AvoxMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 4 L10 12 L4 20"  stroke="#2355A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 4 L14 12 L20 20" stroke="#2355A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 12 L14 12" stroke="#0E1013" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35"/>
    </svg>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside
      className={cn(
        'flex flex-col transition-all duration-200 flex-shrink-0 select-none',
        sidebarCollapsed ? 'w-[56px]' : 'w-[210px]',
      )}
      style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #EDEEF1' }}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-[56px] flex-shrink-0',
        sidebarCollapsed ? 'justify-center' : 'px-4 gap-3',
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#EEF2FC] flex items-center justify-center border border-[#BED4F6]">
          <AvoxMark size={18} />
        </div>
        {!sidebarCollapsed && (
          <span
            className="text-[15px] font-semibold tracking-[0.08em] text-[#0E1013]"
            style={{ fontFamily: "'Azeret Mono', monospace" }}
          >
            AVOX
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto px-2 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            {/* Group label */}
            {!sidebarCollapsed && (
              <p className="px-2.5 mb-1.5 text-[9px] font-semibold text-[#8B9299] uppercase tracking-[0.16em]">
                {group.label}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'relative flex items-center h-9 rounded-lg transition-all duration-150 group',
                      sidebarCollapsed ? 'justify-center' : 'gap-2.5 px-2.5',
                      active
                        ? 'bg-[#EEF2FC] text-[#0E1013]'
                        : 'text-[#5C6370] hover:text-[#0E1013] hover:bg-[#F6F7F9]',
                    )}
                  >
                    {/* Active indicator */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#BED4F6] rounded-r-full" />
                    )}

                    <Icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0',
                        sidebarCollapsed ? '' : 'ml-0.5',
                        active ? 'text-[#2355A7]' : 'text-[#8B9299] group-hover:text-[#5C6370]',
                      )}
                    />

                    {!sidebarCollapsed && (
                      <span className={cn('text-[13px]', active ? 'font-semibold' : 'font-normal')}>
                        {item.label}
                      </span>
                    )}

                    {'badge' in item && item.badge != null && item.badge > 0 && (
                      <span className={cn(
                        'flex items-center justify-center font-bold bg-[#0E1013] text-white rounded-full leading-none',
                        sidebarCollapsed
                          ? 'absolute top-0.5 right-0.5 w-[14px] h-[14px] text-[8px]'
                          : 'ml-auto min-w-[18px] h-[18px] text-[10px] px-1',
                      )}>
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip */}
                    {sidebarCollapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-[#0E1013]/90 text-white text-[12px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg backdrop-blur-sm">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[#EDEEF1]">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full flex items-center h-8 rounded-lg text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9] transition-colors',
            sidebarCollapsed ? 'justify-center' : 'px-2.5 gap-2',
          )}
        >
          <ChevronRight className={cn('w-3.5 h-3.5 transition-transform duration-200', !sidebarCollapsed && 'rotate-180')} />
          {!sidebarCollapsed && <span className="text-[11px]">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
