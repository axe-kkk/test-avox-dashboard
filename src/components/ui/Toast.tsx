import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import type { Toast } from '../../app/AppContext';
import { cn } from '../../utils';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
};

const iconColors = {
  success: 'text-emerald-600',
  error: 'text-rose-600',
  info: 'text-blue-600',
  warning: 'text-amber-600',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useApp();
  const Icon = icons[toast.type];
  return (
    <div className={cn(
      'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-panel min-w-[280px] max-w-[360px]',
      colors[toast.type],
    )}>
      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', iconColors[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && <p className="text-xs opacity-80 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => removeToast(toast.id)} className="text-current opacity-50 hover:opacity-100 flex-shrink-0">
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
