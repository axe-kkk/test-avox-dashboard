import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Building2, Check } from 'lucide-react';
import { useApp } from '../app/AppContext';
import { Avatar } from '../components/ui/Avatar';
import { cn } from '../utils';
import type { Role } from '../types';
import { mockProperties } from '../data/mock/properties';

const roleLabels: Record<Role, string> = {
  admin:   'Admin',
  manager: 'Manager',
  agent:   'Agent',
  viewer:  'Viewer',
};

function Dropdown({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute right-0 mt-2 bg-white border border-[#EDEEF1] rounded-xl shadow-panel z-50 py-1.5 min-w-[180px]">
      {children}
    </div>
  );
}

export function Topbar() {
  const { currentUser, role, setRole } = useApp();
  const [showRole, setShowRole]         = useState(false);
  const [showProperty, setShowProperty] = useState(false);
  const [property, setProperty]         = useState(mockProperties[0]);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowRole(false);
        setShowProperty(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className="h-[56px] bg-white flex items-center px-6 gap-4 flex-shrink-0"
      style={{ borderBottom: '1px solid #EDEEF1' }}
      ref={ref}
    >
      <div className="absolute left-0 right-0 bottom-0 accent-hairline" />
      {/* Search */}
      <div className="relative flex-1 max-w-[320px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B9299] pointer-events-none" />
        <input
          type="text"
          placeholder="Search guests, conversations…"
          className="w-full pl-10 pr-4 py-2 text-[13px] bg-[#F6F7F9] rounded-xl text-[#0E1013] placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white transition-all border border-transparent focus:border-[#BED4F6]"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">

        {/* Property selector */}
        <div className="relative">
          <button
            onClick={() => { setShowProperty(!showProperty); setShowRole(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-[#5C6370] hover:bg-[#F6F7F9] transition-colors group"
          >
            <Building2 className="w-3.5 h-3.5 text-[#8B9299]" />
            <span className="font-medium text-[#0E1013] max-w-[140px] truncate">{property.name}</span>
            <ChevronDown className="w-3 h-3 text-[#8B9299] group-hover:text-[#5C6370] transition-colors" />
          </button>
          <Dropdown open={showProperty}>
            <div className="px-3 py-1.5 mb-1">
              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Properties</p>
            </div>
            {mockProperties.map(p => (
              <button
                key={p.id}
                onClick={() => { setProperty(p); setShowProperty(false); }}
                className="w-full text-left px-3 py-2 hover:bg-[#F6F7F9] transition-colors flex items-center justify-between gap-3 mx-0"
              >
                <div>
                  <div className="text-[13px] font-medium text-[#0E1013]">{p.name}</div>
                  <div className="text-[11px] text-[#8B9299] mt-0.5">{p.city}, {p.country}</div>
                </div>
                {p.id === property.id && <Check className="w-3.5 h-3.5 text-[#2355A7] flex-shrink-0" />}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#EDEEF1] mx-1" />

        {/* Role switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowRole(!showRole); setShowProperty(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors bg-[#EEF2FC] text-[#2355A7] hover:bg-[#E3EBFA]"
          >
            {roleLabels[role]}
            <ChevronDown className="w-3 h-3" />
          </button>
          <Dropdown open={showRole}>
            <div className="px-3 py-1.5 mb-1">
              <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">Switch Role</p>
            </div>
            {(Object.keys(roleLabels) as Role[]).map(r => (
              <button
                key={r}
                onClick={() => { setRole(r); setShowRole(false); }}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#F6F7F9] transition-colors flex items-center justify-between"
              >
                <span className={r === role ? 'font-semibold text-[#2355A7]' : 'text-[#5C6370]'}>
                  {roleLabels[r]}
                </span>
                {r === role && <Check className="w-3.5 h-3.5 text-[#2355A7]" />}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#8B9299] hover:text-[#5C6370] hover:bg-[#F6F7F9] transition-colors ml-1">
          <Bell className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#EDEEF1] mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5 pl-1">
          <Avatar name={currentUser.name} size="sm" />
          <div className="hidden sm:block leading-tight">
            <p className="text-[13px] font-semibold text-[#0E1013]">{currentUser.name.split(' ')[0]}</p>
            <p className="text-[11px] text-[#8B9299]">{currentUser.department}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
