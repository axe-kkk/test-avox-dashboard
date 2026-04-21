import { cn } from '../../utils';

interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-slate-100', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors relative flex items-center gap-2',
            activeTab === tab.id
              ? 'text-slate-900 border-b-2 border-slate-900 -mb-px'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="text-xs bg-rose-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
