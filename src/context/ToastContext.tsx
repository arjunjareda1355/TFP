import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, type, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration || 5000),
    [showToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0 select-none no-print"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xs border shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
                isSuccess
                  ? 'bg-[#111110] text-[#FFFFFF] border-[#16A34A]'
                  : isError
                  ? 'bg-[#111110] text-[#FFFFFF] border-[#DC2626]'
                  : isWarning
                  ? 'bg-[#111110] text-[#FFFFFF] border-[#F59E0B]'
                  : 'bg-[#111110] text-[#FFFFFF] border-[#3E3A33]'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />}
                {isError && <AlertCircle className="w-4 h-4 text-[#EF4444]" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-[#38BDF8]" />}
              </div>

              <div className="flex-1 text-xs font-sans-editorial leading-relaxed text-[#E8E5DF]">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-[#8E8A81] hover:text-white transition-colors p-0.5"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      toasts: [],
      showToast: (msg) => console.log('[Toast Notice]:', msg),
      removeToast: () => {},
      success: (msg) => console.log('[Toast Success]:', msg),
      error: (msg) => console.error('[Toast Error]:', msg),
      info: (msg) => console.info('[Toast Info]:', msg),
      warning: (msg) => console.warn('[Toast Warning]:', msg),
    };
  }
  return context;
};
