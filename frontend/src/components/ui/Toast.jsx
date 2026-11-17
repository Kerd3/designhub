import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/format.js';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2, accent: 'text-success', label: 'Success' },
  error: { icon: AlertCircle, accent: 'text-danger', label: 'Error' },
  info: { icon: Info, accent: 'text-info', label: 'Notice' },
};

/**
 * Toast notifications. Success/info announce politely; errors use role="alert".
 * Toasts pause while hovered or focused and can always be dismissed.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const schedule = useCallback((id, ms) => {
    clearTimeout(timers.current.get(id));
    timers.current.set(id, setTimeout(() => dismiss(id), ms));
  }, [dismiss]);

  const push = useCallback((type, title, description) => {
    const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
    setToasts((list) => [...list.slice(-3), { id, type, title, description }]);
    schedule(id, type === 'error' ? 8000 : 5000);
    return id;
  }, [schedule]);

  const api = useMemo(() => ({
    success: (title, description) => push('success', title, description),
    error: (title, description) => push('error', title, description),
    info: (title, description) => push('info', title, description),
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        {toasts.map((toast) => {
          const style = STYLES[toast.type];
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              onPointerEnter={() => clearTimeout(timers.current.get(toast.id))}
              onPointerLeave={() => schedule(toast.id, 3000)}
              onFocus={() => clearTimeout(timers.current.get(toast.id))}
              onBlur={() => schedule(toast.id, 3000)}
              className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-lg bg-surface p-4 shadow-lg ring-1 ring-border"
            >
              <style.icon aria-hidden="true" className={cn('icon-align-5 size-5 shrink-0', style.accent)} />
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold text-ink"><span className="visually-hidden">{style.label}: </span>{toast.title}</p>
                {toast.description && <p className="mt-1 text-small text-muted">{toast.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="-m-1 grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink">
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
