import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { eventBus } from '../../utils/eventBus';

// Small non-blocking notices for the admin panel, replacing window.alert —
// which froze the page and could not be styled or stacked.

const STYLES = {
  success: { icon: CheckCircle2, box: 'bg-white border-green-200', icon_: 'text-green-600' },
  error: { icon: AlertCircle, box: 'bg-white border-red-200', icon_: 'text-red-600' },
  info: { icon: Info, box: 'bg-white border-blue-200', icon_: 'text-milquu-blue' }
};

/** Mount once (in the admin layout). */
export const ToastHost = () => {
  const [items, setItems] = useState([]);

  useEffect(() => eventBus.on('TOAST', (item) => {
    setItems((list) => [...list.slice(-4), item]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== item.id)), item.duration || 4000);
  }), []);

  const dismiss = (id) => setItems((list) => list.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[3000] flex flex-col items-stretch sm:items-end gap-2 pointer-events-none" aria-live="polite">
      {items.map((t) => {
        const style = STYLES[t.type] || STYLES.info;
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto sm:max-w-sm w-full flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 text-sm text-gray-800 ${style.box}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${style.icon_}`} />
            <p className="flex-1 whitespace-pre-line">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-700" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

