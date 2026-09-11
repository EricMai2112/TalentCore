'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, Video, MapPin, User, Building2, CheckCircle2, Loader2, Clock } from 'lucide-react'
import { CandidateInterviewItem } from '../../types/application.types'
import { candidateInterviewsApi } from '../../services/candidate-interviews.api'
import { HrContactNoteCallout } from './HrContactNoteCallout'

interface ConfirmInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  interview: CandidateInterviewItem
  onSuccess: () => void
}

export function ConfirmInterviewModal({
  isOpen,
  onClose,
  interview,
  onSuccess
}: ConfirmInterviewModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const job = interview.jobDescriptionId
  const deptName =
    typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'Phòng ban'
  const jobTitle = job?.title || 'Vị trí tuyển dụng'
  const interviewerName =
    interview.interviewerId?.name ||
    interview.interviewerIds?.[0]?.name ||
    'Hội đồng phỏng vấn'

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)
    const ok = await candidateInterviewsApi.confirmInterview(interview._id)
    if (ok) {
      onSuccess()
      onClose()
    } else {
      setErrorMsg('Đã có lỗi xảy ra khi xác nhận lịch phỏng vấn. Vui lòng thử lại sau.')
    }
    setIsSubmitting(false)
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-emerald-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận Lịch phỏng vấn
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Xem chi tiết thông tin và xác nhận tham gia buổi phỏng vấn
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

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div>
              <span className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider">Vị trí ứng tuyển</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{jobTitle}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-semibold mt-1">
                <Building2 size={13} className="text-slate-400" />
                <span>{deptName}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/70 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <Calendar size={16} className="text-indigo-600 shrink-0" />
                <span>
                  <strong className="text-slate-900">Ngày phỏng vấn:</strong> {formatDate(interview.date)}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-indigo-600 shrink-0" />
                <span>
                  <strong className="text-slate-900">Khung giờ:</strong> {interview.startTime} - {interview.endTime}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {interview.locationType === 'ONLINE' ? (
                  <Video size={16} className="text-cyan-600 shrink-0" />
                ) : (
                  <MapPin size={16} className="text-amber-600 shrink-0" />
                )}
                <span>
                  <strong className="text-slate-900">Hình thức:</strong>{' '}
                  {interview.locationType === 'ONLINE'
                    ? 'Phỏng vấn Online (Jitsi Meet)'
                    : interview.offsiteLocation || 'Trực tiếp tại văn phòng'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <User size={16} className="text-purple-600 shrink-0" />
                <span>
                  <strong className="text-slate-900">Hội đồng / Người phỏng vấn:</strong> {interviewerName}
                </span>
              </div>
            </div>
          </div>

          {/* HR Contact Support Note */}
          <HrContactNoteCallout phone="0987654321" zaloPhone="0987654321" />

          {errorMsg && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy / Đóng
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Xác nhận tham gia phỏng vấn</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
