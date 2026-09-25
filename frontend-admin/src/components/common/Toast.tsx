'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastState, ToastType } from '@/src/hooks/useToast';

export interface ToastProps {
  toast: ToastState | null;
  onClose?: () => void;
  position?: 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export default function Toast({ toast, onClose, position = 'top-right' }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!toast || !mounted) return null;

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={18} className="text-rose-500 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
    info: <Info size={18} className="text-blue-500 shrink-0" />,
  };

  const styles: Record<ToastType, string> = {
    success: 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-500/10',
    error: 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-500/10',
    warning: 'bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-500/10',
    info: 'bg-blue-50/95 border-blue-200 text-blue-900 shadow-blue-500/10',
  };

  const positions: Record<string, string> = {
    'top-right': 'top-5 right-5 animate-in slide-in-from-top-4',
    'bottom-right': 'bottom-6 right-6 animate-in slide-in-from-bottom-4',
    'top-center': 'top-5 left-1/2 -translate-x-1/2 animate-in slide-in-from-top-4',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom-4',
  };

  return createPortal(
    <div
      key={toast.id}
      className={`fixed z-[99999] flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 max-w-md ${styles[toast.type]} ${positions[position]}`}
      role="alert"
    >
      {icons[toast.type]}
      <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>,
    document.body
  );
}
