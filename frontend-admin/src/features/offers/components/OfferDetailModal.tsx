'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  FileText,
  Send,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Mail,
  User,
  Phone,
  Percent
} from 'lucide-react'
import { CustomButton, ConfirmModal, Toast, useToast } from '@/src/components/common'
import { OfferItem, OfferStatus } from '../types/offer.types'
import { offersApi } from '../services/offers.api'

interface OfferDetailModalProps {
  isOpen: boolean
  onClose: () => void
  offer: OfferItem | null
  onOfferUpdated: () => void
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  isOpen,
  onClose,
  offer,
  onOfferUpdated
}) => {
  const [mounted, setMounted] = useState(false)
  const { toast, showToast, hideToast } = useToast()
  const [isSending, setIsSending] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !offer || !mounted) return null

  const candidate = offer.candidateId
  const candidateUser = candidate?.userId
  const candidateName = candidateUser?.name || candidate?.profileName || 'Ứng viên'
  const job = offer.jobDescriptionId
  const department = offer.departmentId

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case OfferStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Bản nháp
          </span>
        )
      case OfferStatus.SENT:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Send className="w-3.5 h-3.5" />
            Đang chờ phản hồi
          </span>
        )
      case OfferStatus.ACCEPTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã đồng ý nhận việc
          </span>
        )
      case OfferStatus.DECLINED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Đã từ chối offer
          </span>
        )
      case OfferStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
            <Ban className="w-3.5 h-3.5" />
            Đã thu hồi
          </span>
        )
      case OfferStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">
            <Clock className="w-3.5 h-3.5" />
            Đã hết hạn
          </span>
        )
      default:
        return null
    }
  }

  const handleSend = async () => {
    try {
      setIsSending(true)
      await offersApi.sendOffer(offer._id)
      showToast('Đã gửi đề nghị nhận việc đến ứng viên!', 'success')
      onOfferUpdated()
      onClose()
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi gửi đề nghị nhận việc', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true)
      await offersApi.withdrawOffer(offer._id)
      showToast('Đã thu hồi đề nghị nhận việc thành công', 'success')
      setShowWithdrawConfirm(false)
      onOfferUpdated()
      onClose()
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi thu hồi đề nghị', 'error')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const formattedSalary = Number(offer.salary || 0).toLocaleString('vi-VN')
  const formattedProbationSalary = Math.round(
    (Number(offer.salary || 0) * (offer.probationSalaryPercentage || 85)) / 100
  ).toLocaleString('vi-VN')

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="w-full max-w-4xl my-8 overflow-hidden duration-200 bg-white shadow-2xl rounded-3xl animate-in fade-in zoom-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-800">Chi Tiết Lời Mời Nhận Việc</h2>
                  {getStatusBadge(offer.status)}
                </div>
                <p className="text-xs text-slate-500">
                  Ngày tạo {new Date(offer.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            {/* Candidate & Position Banner */}
            <div className="flex flex-col justify-between gap-4 p-4 border border-blue-100 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white bg-blue-600 shadow-xs rounded-2xl">
                  {candidateName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{candidateName}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {candidateUser?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {candidateUser.email}
                      </span>
                    )}
                    {candidateUser?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {candidateUser.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-left border-t border-blue-100 sm:text-right sm:border-t-0 sm:pt-0">
                <span className="text-xs font-medium text-slate-500">Vị trí đề nghị</span>
                <p className="text-sm font-bold text-slate-800">{offer.positionTitle}</p>
                <p className="text-xs text-slate-500">{department?.name || 'Phòng ban'}</p>
              </div>
            </div>

            {/* Declined Alert */}
            {offer.status === OfferStatus.DECLINED && (
              <div className="flex items-start gap-3 p-4 text-xs border rounded-2xl bg-rose-50 border-rose-200 text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900">Ứng viên đã từ chối nhận việc</h4>
                  <p className="mt-1">
                    Lý do:{' '}
                    <span className="font-semibold">
                      {offer.declineReason || 'Không có lý do cụ thể'}
                    </span>
                  </p>
                  {offer.respondedAt && (
                    <p className="text-2xs text-rose-600 mt-0.5">
                      Thời điểm phản hồi: {new Date(offer.respondedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Accepted Alert */}
            {offer.status === OfferStatus.ACCEPTED && (
              <div className="flex items-start gap-3 p-4 text-xs border rounded-2xl bg-emerald-50 border-emerald-200 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900">Ứng viên đã chấp nhận Offer!</h4>
                  <p className="mt-1">
                    Hồ sơ ứng viên đã được tự động chuyển sang trạng thái{' '}
                    <strong>Nhận việc (HIRED)</strong>.
                  </p>
                  {offer.respondedAt && (
                    <p className="text-2xs text-emerald-600 mt-0.5">
                      Thời điểm xác nhận: {new Date(offer.respondedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Offer Terms Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Official Salary */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center justify-center w-6 h-6 border rounded-lg bg-emerald-50 text-emerald-600 border-emerald-100 shrink-0">
                      <DollarSign className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Mức lương chính thức
                    </span>
                  </div>
                  <p className="text-sm font-extrabold leading-snug tracking-tight sm:text-base text-emerald-600">
                    {formattedSalary} {offer.currency}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
                  Lương Gross hàng tháng
                </p>
              </div>

              {/* Card 2: Probation Salary */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center justify-center w-6 h-6 text-indigo-600 border border-indigo-100 rounded-lg bg-indigo-50 shrink-0">
                      <Percent className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Lương thử việc
                    </span>
                  </div>
                  <p className="text-sm font-extrabold leading-snug tracking-tight sm:text-base text-slate-800">
                    {formattedProbationSalary} {offer.currency}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
                  {offer.probationSalaryPercentage}% trong {offer.probationDurationMonths} tháng
                </p>
              </div>

              {/* Card 3: Start Date */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center justify-center w-6 h-6 text-blue-600 border border-blue-100 rounded-lg bg-blue-50 shrink-0">
                      <Calendar className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Ngày bắt đầu
                    </span>
                  </div>
                  <p className="text-sm font-extrabold leading-snug tracking-tight text-blue-600 sm:text-base">
                    {new Date(offer.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <p
                  className="text-[11px] text-slate-400 mt-1 font-medium truncate"
                  title={offer.workLocation}
                >
                  Địa điểm: {offer.workLocation}
                </p>
              </div>

              {/* Card 4: Response Deadline */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center justify-center w-6 h-6 border rounded-lg bg-amber-50 text-amber-600 border-amber-100 shrink-0">
                      <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      Hạn chót phản hồi
                    </span>
                  </div>
                  <p className="text-sm font-extrabold leading-snug tracking-tight sm:text-base text-amber-600">
                    {new Date(offer.expirationDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
                  {offer.sentAt
                    ? `Đã gửi lúc ${new Date(offer.sentAt).toLocaleDateString('vi-VN')}`
                    : 'Chưa gửi'}
                </p>
              </div>
            </div>

            {/* Benefits */}
            {offer.benefits && offer.benefits.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quyền lợi và Đãi ngộ
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {offer.benefits.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-700 text-xs font-medium border border-slate-200/60"
                    >
                      ✓ {b.replace(/^[-•*✓]\s*/, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Letter Preview */}
            <div>
              <h4 className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-700">
                Nội dung Thư mời (Offer Letter)
              </h4>
              <div
                className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs max-h-[400px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: offer.offerLetterHtml }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <div>
              {(offer.status === OfferStatus.DRAFT || offer.status === OfferStatus.SENT) && (
                <button
                  type="button"
                  onClick={() => setShowWithdrawConfirm(true)}
                  disabled={isWithdrawing}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Thu hồi đề nghị
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium transition-colors text-slate-600 hover:text-slate-800"
              >
                Đóng
              </button>

              {offer.status === OfferStatus.DRAFT && (
                <CustomButton
                  variant="primary"
                  onClick={handleSend}
                  disabled={isSending}
                  icon={Send}
                >
                  Gửi đề nghị ngay cho ứng viên
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showWithdrawConfirm}
        onClose={() => setShowWithdrawConfirm(false)}
        onConfirm={handleWithdraw}
        title="Xác nhận thu hồi đề nghị"
        description={`Bạn có chắc chắn muốn thu hồi đề nghị nhận việc này của ứng viên "${candidateName}" không? Sau khi thu hồi, ứng viên sẽ không thể phản hồi offer này nữa.`}
        confirmText="Thu hồi offer"
        cancelText="Quay lại"
        variant="danger"
      />

      <Toast toast={toast} onClose={hideToast} />
    </>,
    document.body
  )
}
