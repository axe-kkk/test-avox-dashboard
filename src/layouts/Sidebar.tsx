import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, Users, Cpu, GitBranch,
  Radio, BarChart3, Settings, ChevronLeft, ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../app/AppContext';
import { cn } from '../utils';
import { mockConversations } from '../data/mock/conversations';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/inbox', icon: Inbox, label: 'Inbox', badge: mockConversations.filter(c => c.unreadCount > 0).length },
  { path: '/guests', icon: Users, label: 'Guests' },
  { path: '/engines', icon: Cpu, label: 'AI Engines' },
  { path: '/sequences', icon: GitBranch, label: 'Sequences' },
  { path: '/channels', icon: Radio, label: 'Channels' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const location = useLocation();

  return (
    <aside className={cn(
      'flex flex-col bg-slate-950 text-white transition-all duration-200 flex-shrink-0',
      sidebarCollapsed ? 'w-[60px]' : 'w-[220px]',
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-white/[0.06] flex-shrink-0',
        sidebarCollapsed ? 'justify-center h-14 px-3' : 'gap-2.5 h-14 px-5',
      )}>
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm tracking-tight text-white">AVOX</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center rounded-lg transition-colors group relative',
                sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80',
              )}
            >
              <Icon className={cn('flex-shrink-0', sidebarCollapsed ? 'w-4.5 h-4.5' : 'w-4 h-4')} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {item.badge != null && item.badge > 0 && (
                <span className={cn(
                  'text-xs font-semibold bg-rose-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1',
                  sidebarCollapsed ? 'absolute top-1 right-1 min-w-[14px] h-[14px] text-[9px]' : 'ml-auto',
                )}>
                  {item.badge}
                </span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.06] p-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'w-full flex items-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors py-2',
            sidebarCollapsed ? 'justify-center px-2' : 'gap-2 px-3',
          )}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span className="text-xs">Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}
