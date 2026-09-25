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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
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
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Key Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-2xs font-bold text-emerald-700 uppercase tracking-wider">
                Mức lương chính thức
              </span>
              <p className="text-base font-extrabold text-emerald-800 mt-0.5">
                {formattedSalary} {offer.currency}
              </p>
              <p className="text-2xs text-emerald-600 mt-0.5">Lương Gross hàng tháng</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                Lương thử việc ({offer.probationSalaryPercentage}%)
              </span>
              <p className="text-base font-bold text-slate-800 mt-0.5">
                {formattedProbationSalary} {offer.currency}
              </p>
              <p className="text-2xs text-slate-500 mt-0.5">
                Thời gian: {offer.probationDurationMonths} tháng
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                Ngày bắt đầu làm việc
              </span>
              <p className="text-sm font-bold text-blue-600 mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(offer.startDate).toLocaleDateString('vi-VN')}
              </p>
              <p className="text-2xs text-slate-500 mt-0.5 truncate">
                {offer.workLocation}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-2xs font-bold text-amber-700 uppercase tracking-wider">
                Hạn chót phản hồi
              </span>
              <p className="text-sm font-bold text-amber-800 mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {new Date(offer.expirationDate).toLocaleDateString('vi-VN')}
              </p>
              <p className="text-2xs text-amber-600 mt-0.5">Vui lòng phản hồi đúng hạn</p>
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

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive Accept Confirmation Prompt */}
          {confirmAcceptMode && (
            <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 animate-in fade-in duration-200 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Xác nhận đồng ý nhận việc tại TalentCore
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Bằng việc bấm xác nhận, bạn chính thức đồng ý với các điều khoản nêu trong Thư mời nhận việc này (Vị trí <strong>{offer.positionTitle}</strong>, mức lương <strong>{formattedSalary} {offer.currency}</strong>, ngày bắt đầu <strong>{new Date(offer.startDate).toLocaleDateString('vi-VN')}</strong>).
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleRespond('ACCEPT')}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Tôi đồng ý nhận việc
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAcceptMode(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors"
                >
                  Suy nghĩ thêm
                </button>
              </div>
            </div>
          )}

          {/* Interactive Decline Prompt */}
          {declineMode && (
            <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 animate-in fade-in duration-200 space-y-3">
              <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Xác nhận từ chối lời mời nhận việc
              </div>
              <p className="text-xs text-rose-800">
                Bạn có thể chia sẻ lý do từ chối để giúp TalentCore hoàn thiện hơn chính sách đãi ngộ trong tương lai (không bắt buộc):
              </p>
              <textarea
                rows={2}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Ví dụ: Đã nhận được offer khác phù hợp hơn, kế hoạch cá nhân thay đổi..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800"
              />
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleRespond('DECLINE')}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Xác nhận từ chối
                </button>
                <button
                  type="button"
                  onClick={() => setDeclineMode(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Đóng
          </button>

          {offer.status === CandidateOfferStatus.SENT && !confirmAcceptMode && !declineMode && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeclineMode(true)}
                className="px-4 py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
              >
                Từ chối nhận việc
              </button>
              <button
                type="button"
                onClick={() => setConfirmAcceptMode(true)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Đồng ý nhận việc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
