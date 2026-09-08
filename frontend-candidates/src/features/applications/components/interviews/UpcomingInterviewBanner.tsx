'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  ExternalLink,
  CheckCircle2,
  CalendarClock,
  Sparkles,
  Building2,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { CandidateInterviewItem } from '../../types/application.types'
import { candidateInterviewsApi } from '../../services/candidate-interviews.api'
import { RescheduleModal } from './RescheduleModal'
import { CancelInterviewModal } from './CancelInterviewModal'

interface UpcomingInterviewBannerProps {
  interview: CandidateInterviewItem
  onStatusUpdated?: () => void
}

export function UpcomingInterviewBanner({
  interview,
  onStatusUpdated
}: UpcomingInterviewBannerProps) {
  const [confirmationStatus, setConfirmationStatus] = useState<string>(
    interview.confirmationStatus || 'CONFIRMED'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReasonText, setCancelReasonText] = useState<string>(
    interview.cancelReason || ''
  )

  const job = interview.jobDescriptionId
  const deptName =
    typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'Phòng CNTT'
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
    const ok = await candidateInterviewsApi.confirmInterview(interview._id)
    if (ok) {
      setConfirmationStatus('CONFIRMED')
      if (onStatusUpdated) onStatusUpdated()
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-700/30">
        {/* Background Accent Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          {/* Left Column Info */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles size={13} className="text-indigo-300" />
              <span>Phỏng vấn sắp tới</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {jobTitle}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-indigo-200/80 mt-1 flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-400" />
                <span>{deptName}</span>
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-xs">
                <Calendar className="text-indigo-400 shrink-0" size={17} />
                <div>
                  <span className="text-[11px] text-indigo-300 block font-medium">Thời gian</span>
                  <span className="font-bold text-white">
                    {interview.startTime} - {interview.endTime}, {formatDate(interview.date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-xs">
                {interview.locationType === 'ONLINE' ? (
                  <Video className="text-cyan-400 shrink-0" size={17} />
                ) : (
                  <MapPin className="text-amber-400 shrink-0" size={17} />
                )}
                <div>
                  <span className="text-[11px] text-indigo-300 block font-medium">Hình thức</span>
                  <span className="font-bold text-white">
                    {interview.locationType === 'ONLINE'
                      ? 'Phỏng vấn Online (Jitsi Meet)'
                      : interview.offsiteLocation || 'Trực tiếp tại văn phòng'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-xs sm:col-span-2">
                <User className="text-purple-400 shrink-0" size={17} />
                <div>
                  <span className="text-[11px] text-indigo-300 block font-medium">Người phỏng vấn</span>
                  <span className="font-bold text-white">{interviewerName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end shrink-0 pt-2 lg:pt-0">
            {/* Action 1: Join Meeting */}
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <Video size={16} />
                <span>Vào phòng phỏng vấn</span>
                <ExternalLink size={14} className="opacity-70" />
              </a>
            )}

            {/* Action 2: Confirm Attendance & Statuses */}
            {confirmationStatus === 'CONFIRMED' ? (
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                <CheckCircle2 size={15} />
                <span>Đã xác nhận tham gia</span>
              </div>
            ) : confirmationStatus === 'CANCEL_REQUESTED' ? (
              <div className="inline-flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 font-bold text-xs text-center max-w-xs">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <AlertTriangle size={15} />
                  <span>Đã gửi yêu cầu hủy lịch</span>
                </div>
                <span className="text-[11px] font-normal text-rose-200/90 italic">
                  Chờ HR xác nhận
                </span>
                {cancelReasonText && (
                  <span className="text-[10px] text-rose-300/80 truncate max-w-[200px]">
                    Lý do: &ldquo;{cancelReasonText}&rdquo;
                  </span>
                )}
              </div>
            ) : confirmationStatus === 'ADMIN_PROPOSED' ? (
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer animate-bounce"
              >
                <CalendarClock size={16} />
                <span>HR đã đề xuất lịch mới — Chọn 1 khung giờ</span>
              </button>
            ) : confirmationStatus === 'RESCHEDULE_REQUESTED' ? (
              <div className="inline-flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs text-center">
                <div className="flex items-center gap-1.5">
                  <CalendarClock size={15} />
                  <span>Đã đề nghị đổi lịch — Chờ nhà tuyển dụng duyệt</span>
                </div>
                {interview.proposedCustomDate && (
                  <span className="text-[11px] font-normal text-amber-200/90">
                    Giờ đề xuất: {formatDate(interview.proposedCustomDate)} ({interview.proposedCustomStartTime} - {interview.proposedCustomEndTime})
                  </span>
                )}
              </div>
            ) : confirmationStatus === 'RESCHEDULE_REJECTED' ? (
              <div className="inline-flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 font-bold text-xs text-center max-w-xs">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <XCircle size={15} />
                  <span>Đã từ chối yêu cầu đổi lịch</span>
                </div>
                {interview.rescheduleRejectReason && (
                  <span className="text-[11px] font-normal text-rose-200/90 italic">
                    Lý do: &ldquo;{interview.rescheduleRejectReason}&rdquo;
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} className="text-white" />
                <span>Xác nhận tham gia</span>
              </button>
            )}

            {/* Action 3: Request Reschedule or Cancel Interview */}
            {confirmationStatus === 'CONFIRMED' ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsCancelModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-semibold text-xs transition-all cursor-pointer"
              >
                <AlertTriangle size={14} className="text-rose-400" />
                <span>Yêu cầu hủy lịch phỏng vấn</span>
              </button>
            ) : confirmationStatus !== 'RESCHEDULE_REQUESTED' && confirmationStatus !== 'CANCEL_REQUESTED' && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsRescheduleOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 hover:text-white font-semibold text-xs transition-all cursor-pointer"
              >
                <Clock size={14} />
                <span>Đề nghị đổi lịch</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        interview={interview}
        onSuccess={() => {
          setConfirmationStatus('RESCHEDULE_REQUESTED')
          if (onStatusUpdated) onStatusUpdated()
        }}
      />

      <CancelInterviewModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        interview={interview}
        onSuccess={(reasonText) => {
          setConfirmationStatus('CANCEL_REQUESTED')
          setCancelReasonText(reasonText)
          if (onStatusUpdated) onStatusUpdated()
        }}
      />
    </>
  )
}
