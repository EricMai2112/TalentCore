'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  Award,
  Briefcase,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Banknote,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import {
  CandidateInvitationItem,
  InvitationStatus,
} from '../../types/candidate-invitation.types'
import { candidateInvitationApi } from '../../services/candidate-invitation.api'

interface InvitationHeroBannerProps {
  onApplicationCreated?: () => void
}

export function InvitationHeroBanner({ onApplicationCreated }: InvitationHeroBannerProps) {
  const [mounted, setMounted] = useState(false)
  const [invitations, setInvitations] = useState<CandidateInvitationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeModal, setActiveModal] = useState<'ACCEPT' | 'DECLINE' | null>(null)
  const [selectedInv, setSelectedInv] = useState<CandidateInvitationItem | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when confirmation modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [activeModal])

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal && !isSubmitting) {
        setActiveModal(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModal, isSubmitting])

  const fetchInvitations = async () => {
    try {
      const data = await candidateInvitationApi.getMyInvitations()
      // Lấy các lời mời PENDING và chưa hết hạn
      const now = Date.now()
      const active = (data || []).filter((inv) => {
        if (inv.status !== InvitationStatus.PENDING) return false
        const expTime = new Date(inv.expiresAt).getTime()
        if (expTime <= now) return false
        // Kiểm tra xem đã bị ứng viên ẩn tạm thời trong phiên chưa
        if (typeof window !== 'undefined') {
          const dismissed = sessionStorage.getItem(`dismiss_inv_${inv._id}`)
          if (dismissed === 'true') return false
        }
        return true
      })
      setInvitations(active)
    } catch (err) {
      console.error('Lỗi khi tải lời mời ứng tuyển:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  if (isLoading || invitations.length === 0) {
    return null
  }

  const currentInv = invitations[0]
  const job = currentInv.jobDescriptionId || {}
  const deptName = job.departmentId?.name || 'Phòng ban'
  const salaryText =
    job.minimumSalary && job.maximumSalary
      ? `${job.minimumSalary.toLocaleString('vi-VN')} - ${job.maximumSalary.toLocaleString('vi-VN')} VNĐ`
      : 'Thỏa thuận'

  const daysRemaining = Math.max(
    1,
    Math.ceil((new Date(currentInv.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`dismiss_inv_${currentInv._id}`, 'true')
    }
    setInvitations((prev) => prev.filter((i) => i._id !== currentInv._id))
  }

  const openAcceptModal = () => {
    setSelectedInv(currentInv)
    setErrorMsg(null)
    setActiveModal('ACCEPT')
  }

  const openDeclineModal = () => {
    setSelectedInv(currentInv)
    setErrorMsg(null)
    setDeclineReason('')
    setActiveModal('DECLINE')
  }

  const handleConfirmAction = async () => {
    if (!selectedInv || !activeModal) return
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      await candidateInvitationApi.respondInvitation(
        selectedInv._id,
        activeModal,
        activeModal === 'DECLINE' ? declineReason.trim() : undefined
      )

      if (activeModal === 'ACCEPT') {
        setSuccessMsg(`Bạn đã xác nhận tham gia ứng tuyển vị trí "${job.title}" thành công!`)
        setTimeout(() => {
          setSuccessMsg(null)
          setActiveModal(null)
          fetchInvitations()
          if (onApplicationCreated) onApplicationCreated()
        }, 1500)
      } else {
        setActiveModal(null)
        fetchInvitations()
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero Banner with Deep Royal Navy / Indigo Palette */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-7 text-white shadow-xl shadow-blue-950/20 border border-blue-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          {/* Top meta row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 backdrop-blur-xs">
                <Award size={13} className="text-blue-300" />
                Thư mời cơ hội việc làm mới
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                <Clock size={12} />
                Còn {daysRemaining} ngày để phản hồi
              </span>
            </div>

            <button
              onClick={handleDismiss}
              title="Ẩn thông báo này trong phiên làm việc"
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Job Title & Information */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-blue-200/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 size={15} className="text-blue-300 shrink-0" />
                {deptName}
              </span>
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-blue-300 shrink-0" />
                  {job.location}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Banknote size={15} className="shrink-0" />
                {salaryText}
              </span>
            </div>
          </div>

          {/* HR Note Quote (if provided) */}
          {currentInv.note && (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-xs sm:text-sm text-blue-50 italic leading-relaxed">
              &ldquo;{currentInv.note}&rdquo;
              <span className="not-italic block mt-1 text-[11px] font-semibold text-blue-200/80">
                — {currentInv.invitedById?.name || 'Ban Tuyển dụng TalentCore'}
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-blue-200/70">
              <span>Được chọn lọc dựa trên kết quả ấn tượng từ đợt tuyển trước</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href={`/jobs/${job._id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-200 hover:text-white hover:bg-white/10 transition-all"
              >
                <span>Xem mô tả công việc</span>
                <ExternalLink size={13} />
              </Link>

              <button
                onClick={openDeclineModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Từ chối
              </button>

              <button
                onClick={openAcceptModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Chấp nhận lời mời
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Rendered through React Portal to document.body */}
      {activeModal && selectedInv && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={isSubmitting ? undefined : () => setActiveModal(null)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4 text-slate-900 z-10 animate-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                    activeModal === 'ACCEPT' ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  {activeModal === 'ACCEPT' ? <Briefcase size={18} /> : <AlertCircle size={18} />}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeModal === 'ACCEPT' ? 'Xác nhận tham gia ứng tuyển' : 'Từ chối lời mời'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                disabled={isSubmitting}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                title="Đóng modal"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {activeModal === 'ACCEPT' ? (
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  Bạn đang chuẩn bị tham gia đợt tuyển dụng cho vị trí{' '}
                  <strong className="text-slate-900 font-bold">{job.title}</strong>.
                </p>
                <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-blue-800">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    Ứng tuyển nhanh chóng:
                  </p>
                  <p className="leading-relaxed">
                    Hệ thống sẽ tự động sử dụng thông tin hồ sơ và các chứng chỉ, kỹ năng hiện tại
                    của bạn để nộp vào đợt tuyển dụng mới mà bạn không cần phải khai báo lại từ đầu.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-600">
                  Bạn có chắc chắn muốn từ chối lời mời cho vị trí{' '}
                  <strong className="text-slate-900">{job.title}</strong>? Bạn có thể để lại lý do
                  để Ban tuyển dụng lưu ý:
                </p>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="VD: Hiện tại tôi đã nhận công việc mới, hoặc mức đãi ngộ chưa phù hợp..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isSubmitting || !!successMsg}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                  activeModal === 'ACCEPT'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : activeModal === 'ACCEPT' ? (
                  'Xác nhận tham gia'
                ) : (
                  'Xác nhận từ chối'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
