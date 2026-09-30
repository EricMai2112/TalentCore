'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  Building2,
  MapPin,
  AlertTriangle,
  Send,
  Loader2,
} from 'lucide-react';
import { CandidateOfferItem, CandidateOfferStatus } from '../../types/application.types';
import { candidateOffersApi } from '../../services/candidate-offers.api';

interface OfferLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: CandidateOfferItem | null;
  onOfferResponded: () => void;
}

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({
  isOpen,
  onClose,
  offer,
  onOfferResponded,
}) => {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmAcceptMode, setConfirmAcceptMode] = useState(false);
  const [declineMode, setDeclineMode] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open and unlock upon closing or unmounting
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmAcceptMode) {
          setConfirmAcceptMode(false);
        } else if (declineMode) {
          setDeclineMode(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, confirmAcceptMode, declineMode]);

  if (!isOpen || !offer || !mounted) return null;

  const job = offer.jobDescriptionId;
  const dept = offer.departmentId;
  const formattedSalary = Number(offer.salary || 0).toLocaleString('vi-VN');
  const formattedProbationSalary = Math.round(
    (Number(offer.salary || 0) * (offer.probationSalaryPercentage || 85)) / 100,
  ).toLocaleString('vi-VN');

  const handleRespond = async (action: 'ACCEPT' | 'DECLINE') => {
    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await candidateOffersApi.respondOffer(
        offer._id,
        action,
        action === 'DECLINE' ? declineReason : undefined,
      );

      if (res.success) {
        onOfferResponded();
        setConfirmAcceptMode(false);
        setDeclineMode(false);
        onClose();
      } else {
        setErrorMessage(res.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      {/* Main Job Offer Modal Backdrop */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && !confirmAcceptMode && !declineMode) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-hidden"
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header (Pinned) */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Thư Mời Nhận Việc (Job Offer)
                </h2>
                <p className="text-xs text-slate-500">
                  Vị trí: <strong className="text-slate-700">{offer.positionTitle}</strong> • {dept?.name || 'TalentCore'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body (Scrollable Only) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Key Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Mức lương chính thức
                </span>
                <p className="text-[13px] sm:text-sm font-bold text-emerald-800 mt-1">
                  {formattedSalary} {offer.currency}
                </p>
                <p className="text-[10px] sm:text-[11px] text-emerald-600/90 mt-0.5">
                  Lương Gross hàng tháng
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Lương thử việc ({offer.probationSalaryPercentage}%)
                </span>
                <p className="text-[13px] sm:text-sm font-bold text-slate-800 mt-1">
                  {formattedProbationSalary} {offer.currency}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  Thời gian: {offer.probationDurationMonths} tháng
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ngày bắt đầu làm việc
                </span>
                <p className="text-xs sm:text-[13px] font-bold text-blue-600 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                  <span>{new Date(offer.startDate).toLocaleDateString('vi-VN')}</span>
                </p>
                <p
                  className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate"
                  title={offer.workLocation}
                >
                  {offer.workLocation}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  Hạn chót phản hồi
                </span>
                <p className="text-xs sm:text-[13px] font-bold text-amber-800 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>{new Date(offer.expirationDate).toLocaleDateString('vi-VN')}</span>
                </p>
                <p className="text-[10px] sm:text-[11px] text-amber-600 mt-0.5">
                  Vui lòng phản hồi đúng hạn
                </p>
              </div>
            </div>

            {/* Status Banners */}
            {offer.status === CandidateOfferStatus.ACCEPTED && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">
                    Chúc mừng bạn đã đồng ý tiếp nhận Lời mời nhận việc!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Đội ngũ Nhân sự TalentCore đã nhận được xác nhận từ bạn và sẽ sớm liên hệ qua điện thoại/email để hướng dẫn các thủ tục tiếp nhận công việc.
                  </p>
                </div>
              </div>
            )}

            {offer.status === CandidateOfferStatus.DECLINED && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">
                    Bạn đã từ chối lời mời nhận việc này
                  </h4>
                  <p className="text-xs text-rose-700 mt-1">
                    Cảm ơn bạn đã dành thời gian trao đổi cùng TalentCore. Chúc bạn luôn thành công trên con đường sự nghiệp!
                  </p>
                </div>
              </div>
            )}

            {/* Letter Content Container */}
            <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 bg-white shadow-xs">
              <div
                className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: offer.offerLetterHtml }}
              />
            </div>
          </div>

          {/* Modal Footer (Pinned) */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {offer.status === CandidateOfferStatus.SENT && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setDeclineMode(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Từ chối nhận việc
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setConfirmAcceptMode(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Đồng ý nhận việc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Accept Offer (Stacked on top) */}
      {confirmAcceptMode && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setConfirmAcceptMode(false);
            }
          }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 border border-emerald-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác nhận Đồng ý nhận việc
                </h3>
                <p className="text-xs text-slate-500">
                  Vị trí: <strong className="text-slate-700">{offer.positionTitle}</strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-emerald-700 font-medium shrink-0">Mức lương chính thức:</span>
                <span className="font-bold text-emerald-900 text-right">{formattedSalary} {offer.currency}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-emerald-700 font-medium shrink-0">Lương thử việc ({offer.probationSalaryPercentage}%):</span>
                <span className="font-bold text-emerald-900 text-right">{formattedProbationSalary} {offer.currency}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-emerald-700 font-medium shrink-0">Ngày bắt đầu làm việc:</span>
                <span className="font-bold text-emerald-900 text-right">{new Date(offer.startDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-emerald-700 font-medium shrink-0">Địa điểm làm việc:</span>
                <span className="font-bold text-emerald-900 text-right break-words leading-relaxed">
                  {offer.workLocation}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bằng việc bấm xác nhận, bạn chính thức đồng ý tiếp nhận công việc tại TalentCore và các điều khoản nêu trong Thư mời nhận việc này.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAcceptMode(false)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Suy nghĩ thêm
              </button>
              <button
                type="button"
                onClick={() => handleRespond('ACCEPT')}
                disabled={submitting}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Tôi đồng ý nhận việc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Decline Offer (Stacked on top) */}
      {declineMode && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setDeclineMode(false);
            }
          }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 border border-rose-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác nhận Từ chối nhận việc
                </h3>
                <p className="text-xs text-slate-500">
                  Vị trí: <strong className="text-slate-700">{offer.positionTitle}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn từ chối lời mời nhận việc này? Thao tác này sẽ cập nhật trạng thái hồ sơ của bạn và không thể hoàn tác.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Lý do từ chối (không bắt buộc):
              </label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Ví dụ: Đã nhận được offer khác phù hợp hơn, kế hoạch cá nhân thay đổi..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 text-slate-800 transition-all resize-none"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeclineMode(false)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => handleRespond('DECLINE')}
                disabled={submitting}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
