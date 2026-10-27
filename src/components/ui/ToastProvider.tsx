import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-5 start-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-[#2a9d8f] text-white border-[#248277]'
                : toast.type === 'error'
                ? 'bg-[#e76f51] text-white border-[#c9593f]'
                : toast.type === 'warning'
                ? 'bg-[#e9c46a] text-[#1d2d35] border-[#d8b050]'
                : 'bg-[#264653] text-white border-[#1d353f]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
