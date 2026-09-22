"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, Loader2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentName: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
  isDeleting,
}: DeleteConfirmModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md shadow-2xl shadow-rose-500/10 border border-white/90 p-6 z-10 text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
            <Trash2 size={20} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-base font-bold text-slate-900">Xóa phòng ban?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có chắc muốn xóa phòng ban{" "}
              <strong className="text-slate-800 font-bold">"{departmentName}"</strong>?
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-3xs"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            <span>Xóa phòng ban</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
