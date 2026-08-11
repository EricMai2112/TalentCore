import { Trash2, Loader2 } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  templateName: string
  isDeleting: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  templateName,
  isDeleting
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md p-6 duration-200 bg-white border border-gray-100 shadow-2xl rounded-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 text-red-500 border border-red-100 rounded-full bg-red-50 shrink-0">
            <Trash2 size={20} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-gray-900">Xóa Email Template?</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Bạn có chắc chắn muốn xóa email template{' '}
              <strong className="text-gray-800">“{templateName}”</strong> không?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 rounded-xl disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}
