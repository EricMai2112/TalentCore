'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X, ArrowLeft, LogOut } from 'lucide-react'

interface UnsavedChangesModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onConfirm
}: UnsavedChangesModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white/95 backdrop-blur-3xl rounded-3xl w-full max-w-md shadow-2xl shadow-rose-950/20 overflow-hidden border border-white/80 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Close */}
        <div className="flex items-start justify-between pt-1">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-500 shadow-xs shrink-0">
            <AlertTriangle size={26} className="text-amber-500 stroke-[2.25]" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200/60"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Dữ liệu chưa được lưu!
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
            Bạn đang có các thay đổi chưa được lưu trên trang này. Nếu rời khỏi trang lúc này, toàn
            bộ thông tin bạn vừa nhập sẽ bị mất.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 border-t border-slate-100 pt-4.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={16} className="text-slate-400" />
            <span>Ở lại chỉnh sửa</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut size={16} />
            <span>Rời khỏi trang</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
