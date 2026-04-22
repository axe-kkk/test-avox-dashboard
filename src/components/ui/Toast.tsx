import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import type { Toast } from '../../app/AppContext';
import { cn } from '../../utils';

const config = {
  success: { icon: CheckCircle, cls: 'border-[#EDEEF1] bg-white',  iconCls: 'text-[#2355A7]', textCls: 'text-[#0E1013]', subCls: 'text-[#5C6370]' },
  error:   { icon: AlertCircle, cls: 'border-[#0E1013] bg-white',  iconCls: 'text-[#0E1013]', textCls: 'text-[#0E1013]', subCls: 'text-[#5C6370]' },
  info:    { icon: Info,         cls: 'border-[#BED4F6] bg-white',  iconCls: 'text-[#2355A7]', textCls: 'text-[#0E1013]', subCls: 'text-[#5C6370]' },
  warning: { icon: AlertTriangle,cls: 'border-[#D1CFCF] bg-white',  iconCls: 'text-[#0E1013]', textCls: 'text-[#0E1013]', subCls: 'text-[#5C6370]' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useApp();
  const { icon: Icon, cls, iconCls, textCls, subCls } = config[toast.type];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg min-w-[280px] max-w-[360px]', cls)}>
      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', iconCls)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-[13px] font-semibold', textCls)}>{toast.title}</p>
        {toast.message && <p className={cn('text-[12px] mt-0.5', subCls)}>{toast.message}</p>}
      </div>
      <button onClick={() => removeToast(toast.id)} className="text-[#D1CFCF] hover:text-[#5C6370] flex-shrink-0 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
