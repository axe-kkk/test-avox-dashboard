import { cn } from '../../utils';

interface Tab { id: string; label: string; badge?: number }

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1', className)} style={{ borderBottom: '1px solid #EDEEF1' }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-[12px] transition-colors relative flex items-center gap-2 whitespace-nowrap -mb-px',
            activeTab === tab.id
              ? 'font-semibold text-[#2355A7] border-b-2 border-[#2355A7]'
              : 'font-normal text-[#8B9299] hover:text-[#0E1013]',
          )}
        >
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="text-[10px] bg-[#0E1013] text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
