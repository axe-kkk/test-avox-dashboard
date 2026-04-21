import { useState } from 'react';
import { Search, Bell, ChevronDown, Building2 } from 'lucide-react';
import { useApp } from '../app/AppContext';
import { Avatar } from '../components/ui/Avatar';
import { cn } from '../utils';
import type { Role } from '../types';
import { mockProperties } from '../data/mock/properties';

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  agent: 'Agent',
  viewer: 'View-only',
};

const roleBg: Record<Role, string> = {
  admin: 'bg-violet-100 text-violet-700',
  manager: 'bg-blue-100 text-blue-700',
  agent: 'bg-emerald-100 text-emerald-700',
  viewer: 'bg-slate-100 text-slate-600',
};

export function Topbar() {
  const { currentUser, role, setRole } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]);

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-5 gap-4 flex-shrink-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search guests, conversations..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-100 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Property selector */}
        <div className="relative">
          <button
            onClick={() => setShowPropertyMenu(!showPropertyMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors border border-slate-100"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium max-w-[120px] truncate">{selectedProperty.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showPropertyMenu && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-panel z-50">
              {mockProperties.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProperty(p); setShowPropertyMenu(false); }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl transition-colors',
                    p.id === selectedProperty.id ? 'font-medium text-slate-900' : 'text-slate-700',
                  )}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.city}, {p.country}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Role switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors', roleBg[role])}
          >
            {roleLabels[role]}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showRoleMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-panel z-50">
              {(Object.keys(roleLabels) as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setShowRoleMenu(false); }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-xs hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl transition-colors',
                    r === role ? 'font-semibold text-slate-900' : 'text-slate-600',
                  )}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <Avatar name={currentUser.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.name.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-500">{currentUser.department}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
