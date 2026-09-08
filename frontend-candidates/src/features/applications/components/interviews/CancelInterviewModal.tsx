'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertTriangle, Send, Loader2 } from 'lucide-react'
import { CandidateInterviewItem } from '../../types/application.types'
import { candidateInterviewsApi } from '../../services/candidate-interviews.api'

interface CancelInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  interview: CandidateInterviewItem
  onSuccess: (reason: string) => void
}

export function CancelInterviewModal({
  isOpen,
  onClose,
  interview,
  onSuccess
}: CancelInterviewModalProps) {
  const [mounted, setMounted] = useState(false)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do hủy lịch phỏng vấn.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    const ok = await candidateInterviewsApi.requestCancellation(interview._id, reason.trim())
    if (ok) {
      onSuccess(reason.trim())
      onClose()
    } else {
      setErrorMsg('Đã có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.')
    }
    setIsSubmitting(false)
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Yêu cầu hủy lịch phỏng vấn
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Nhà tuyển dụng sẽ nhận được thông báo và xem xét lý do của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed font-medium">
            <p className="font-bold mb-1 text-amber-950 flex items-center gap-1.5">
              <span>⚠️ Lưu ý quan trọng</span>
            </p>
            Bạn đã xác nhận tham gia buổi phỏng vấn này. Việc yêu cầu hủy lịch có thể ảnh hưởng đến kết quả đánh giá tuyển dụng. Vui lòng cung cấp lý do cụ thể và chính xác.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Lý do bạn không thể tham gia phỏng vấn <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (errorMsg) setErrorMsg(null)
              }}
              placeholder="Ví dụ: Tôi gặp sự cố cá nhân đột xuất / Tôi đã nhận được lời mời làm việc khác..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
            />
            {errorMsg && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Gửi yêu cầu hủy lịch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
