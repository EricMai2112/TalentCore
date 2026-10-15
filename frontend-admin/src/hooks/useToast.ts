'use client';

import { useToast as useGlobalToast, ToastType, ToastItem } from '@/src/providers/ToastProvider';

export type { ToastType };

export interface ToastState {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const globalToast = useGlobalToast();

  return {
    toast: globalToast.toasts[0] || null,
    showToast: globalToast.showToast,
    hideToast: (id?: string) => {
      if (id) {
        globalToast.hideToast(id);
      } else if (globalToast.toasts[0]) {
        globalToast.hideToast(globalToast.toasts[0].id);
      }
    },
    success: globalToast.success,
    error: globalToast.error,
    info: globalToast.info,
    warning: globalToast.warning,
  };
}
