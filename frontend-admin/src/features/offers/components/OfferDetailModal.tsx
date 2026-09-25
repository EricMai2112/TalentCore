'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
} from 'lucide-react';
import { CustomButton, ConfirmModal, Toast, useToast } from '@/src/components/common';
import { OfferItem, OfferStatus } from '../types/offer.types';
import { offersApi } from '../services/offers.api';

interface OfferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: OfferItem | null;
  onOfferUpdated: () => void;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  isOpen,
  onClose,
  offer,
  onOfferUpdated,
}) => {
  const [mounted, setMounted] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !offer || !mounted) return null;

  const candidate = offer.candidateId;
  const candidateUser = candidate?.userId;
  const candidateName = candidateUser?.name || candidate?.profileName || 'Ứng viên';
  const job = offer.jobDescriptionId;
  const department = offer.departmentId;

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case OfferStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Clock className="w-3.5 h-3.5" />
            Bản nháp
          </span>
        );
      case OfferStatus.SENT:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Send className="w-3.5 h-3.5" />
            Đang chờ phản hồi
          </span>
        );
      case OfferStatus.ACCEPTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã đồng ý nhận việc
          </span>
        );
      case OfferStatus.DECLINED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Đã từ chối offer
          </span>
        );
      case OfferStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
            <Ban className="w-3.5 h-3.5" />
            Đã thu hồi
          </span>
        );
      case OfferStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">
            <Clock className="w-3.5 h-3.5" />
            Đã hết hạn
          </span>
        );
      default:
        return null;
    }
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      await offersApi.sendOffer(offer._id);
      showToast('Đã gửi đề nghị nhận việc đến ứng viên!', 'success');
      onOfferUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi gửi đề nghị nhận việc', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      await offersApi.withdrawOffer(offer._id);
      showToast('Đã thu hồi đề nghị nhận việc thành công', 'success');
      setShowWithdrawConfirm(false);
      onOfferUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi thu hồi đề nghị', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formattedSalary = Number(offer.salary || 0).toLocaleString('vi-VN');
  const formattedProbationSalary = Math.round(
    (Number(offer.salary || 0) * (offer.probationSalaryPercentage || 85)) / 100,
  ).toLocaleString('vi-VN');

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-800">
                    Chi Tiết Lời Mời Nhận Việc
                  </h2>
                  {getStatusBadge(offer.status)}
                </div>
                <p className="text-xs text-slate-500">
                  Mã đề nghị: {offer._id} • Tạo ngày{' '}
                  {new Date(offer.createdAt).toLocaleDateString('vi-VN')}
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
            {/* Candidate & Position Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {candidateName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{candidateName}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
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

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-100">
                <span className="text-xs text-slate-500 font-medium">Vị trí đề nghị</span>
                <p className="text-sm font-bold text-slate-800">{offer.positionTitle}</p>
                <p className="text-xs text-slate-500">{department?.name || 'Phòng ban'}</p>
              </div>
            </div>

            {/* Declined Alert */}
            {offer.status === OfferStatus.DECLINED && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900">Ứng viên đã từ chối nhận việc</h4>
                  <p className="mt-1">
                    Lý do: <span className="font-semibold">{offer.declineReason || 'Không có lý do cụ thể'}</span>
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
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900">Ứng viên đã chấp nhận Offer!</h4>
                  <p className="mt-1">
                    Hồ sơ ứng viên đã được tự động chuyển sang trạng thái <strong>Nhận việc (HIRED)</strong>.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                  Mức lương chính thức
                </span>
                <p className="text-base font-bold text-emerald-600 mt-1">
                  {formattedSalary} {offer.currency}
                </p>
                <p className="text-2xs text-slate-500 mt-0.5">Lương Gross hàng tháng</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                  Lương thử việc
                </span>
                <p className="text-base font-bold text-slate-800 mt-1">
                  {formattedProbationSalary} {offer.currency}
                </p>
                <p className="text-2xs text-slate-500 mt-0.5">
                  {offer.probationSalaryPercentage}% trong {offer.probationDurationMonths} tháng
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ngày bắt đầu
                </span>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  {new Date(offer.startDate).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Địa điểm: {offer.workLocation}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hạn chót phản hồi
                </span>
                <p className="text-sm font-bold text-amber-600 mt-1">
                  {new Date(offer.expirationDate).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-2xs text-slate-500 mt-0.5">
                  {offer.sentAt
                    ? `Đã gửi lúc ${new Date(offer.sentAt).toLocaleDateString('vi-VN')}`
                    : 'Chưa gửi'}
                </p>
              </div>
            </div>

            {/* Benefits */}
            {offer.benefits && offer.benefits.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quyền lợi và Đãi ngộ
                </h4>
                <div className="flex flex-wrap gap-2">
                  {offer.benefits.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Letter Preview */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nội dung Thư mời (Offer Letter)
              </h4>
              <div
                className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs max-h-[400px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: offer.offerLetterHtml }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
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
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
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
  );
};
