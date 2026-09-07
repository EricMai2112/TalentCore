"use client";

import { AlertTriangle, X } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onConfirm,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 p-6 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100/60 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-gray-900">
            Dữ liệu chưa được lưu!
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Bạn đang có các thay đổi chưa được lưu trên trang này. Nếu rời khỏi trang lúc này, toàn bộ thông tin bạn đã nhập sẽ bị mất.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
          >
            Ở lại chỉnh sửa
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Rời khỏi trang
          </button>
        </div>
      </div>
    </div>
  );
}
