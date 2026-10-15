'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  isExiting?: boolean;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const DEFAULT_DURATION = 4000;

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Kích hoạt animation trượt từ phải sang trái ngay sau khi mount
    const frame = requestAnimationFrame(() => {
      setIsRendered(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />,
    info: <Info size={16} className="text-emerald-600 shrink-0" />,
    error: <AlertCircle size={16} className="text-rose-500 shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
  };

  const styles: Record<ToastType, { card: string; close: string; bar: string }> = {
    success: {
      card: 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-500/10',
      close: 'text-emerald-500 hover:text-emerald-800 hover:bg-emerald-100/80',
      bar: 'bg-emerald-500',
    },
    info: {
      card: 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-500/10',
      close: 'text-emerald-500 hover:text-emerald-800 hover:bg-emerald-100/80',
      bar: 'bg-emerald-500',
    },
    error: {
      card: 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-500/10',
      close: 'text-rose-400 hover:text-rose-700 hover:bg-rose-100/80',
      bar: 'bg-rose-500',
    },
    warning: {
      card: 'bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-500/10',
      close: 'text-amber-500 hover:text-amber-800 hover:bg-amber-100/80',
      bar: 'bg-amber-500',
    },
  };

  const currentStyle = styles[item.type] || styles.info;
  const isLeaving = item.isExiting || !isRendered;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden flex items-center justify-between gap-3 px-4 py-3 text-xs font-semibold rounded-2xl border shadow-xl backdrop-blur-xl max-w-md w-full transition-all duration-300 transform ${currentStyle.card} ${
        isLeaving
          ? 'translate-x-[120%] opacity-0'
          : 'translate-x-0 opacity-100'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-1">
        {icons[item.type]}
        <span className="leading-snug break-words">{item.message}</span>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-1 ${currentStyle.close}`}
        title="Đóng thông báo"
      >
        <X size={14} />
      </button>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 overflow-hidden">
        <div
          className={`h-full ${currentStyle.bar}`}
          style={{
            animation: `toastProgressBar ${item.duration}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes toastProgressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const hideToast = useCallback((id: string) => {
    // Đánh dấu isExiting để kích hoạt animation trượt từ trái qua phải ra ngoài
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // Xóa timer nếu còn
    const timer = timeoutsRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timeoutsRef.current.delete(id);
    }

    // Sau khi animation trượt kết thúc (320ms), xóa hoàn toàn khỏi DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration = DEFAULT_DURATION
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newItem: ToastItem = {
        id,
        message,
        type,
        duration,
        isExiting: false,
      };

      setToasts((prev) => [...prev, newItem]);

      // Tự động đóng sau duration
      const timer = setTimeout(() => {
        hideToast(id);
      }, duration);

      timeoutsRef.current.set(id, timer);
    },
    [hideToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
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

  // Clear tất cả timeout khi unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        hideToast,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}

      {/* Global Toast Viewport - Cố định trên layout toàn trang */}
      <div
        aria-live="polite"
        className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none max-w-md w-full px-4 sm:px-0 sm:w-auto"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={hideToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
}
