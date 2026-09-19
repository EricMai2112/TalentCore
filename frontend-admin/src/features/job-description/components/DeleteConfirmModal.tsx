"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  isDeleting,
}: DeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white/85 backdrop-blur-2xl rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 border border-white/80 animate-in zoom-in-95 duration-200 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-300/40 flex items-center justify-center shrink-0 text-rose-600 shadow-2xs">
            <Trash2 size={22} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Xóa yêu cầu tuyển dụng?</h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa yêu cầu vị trí <strong className="font-bold text-slate-900">“{jobTitle}”</strong> không? Hành động này sẽ xóa vĩnh viễn tin tuyển dụng này và không thể hoàn tác.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/60 pt-4.5">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4.5 py-2.5 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs rounded-xl border border-white/90 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Xóa
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
