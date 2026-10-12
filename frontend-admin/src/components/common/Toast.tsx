'use client';

import { ToastState } from '@/src/hooks/useToast';

export interface ToastProps {
  toast?: ToastState | null;
  onClose?: () => void;
  position?: 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center';
}

/**
 * Toast component tương thích ngược:
 * Các thông báo Toast hiện tại được ToastProvider render tự động tại cấp độ Layout toàn trang
 * với hiệu ứng trượt từ phải sang trái và từ trái sang phải.
 */
export default function Toast(_props: ToastProps) {
  return null;
}
