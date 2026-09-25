'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Building2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CandidateOfferItem, CandidateOfferStatus } from '../../types/application.types';
import { candidateOffersApi } from '../../services/candidate-offers.api';
import { OfferLetterModal } from './OfferLetterModal';

export function CandidateOffersView() {
  const [offers, setOffers] = useState<CandidateOfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<CandidateOfferItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await candidateOffersApi.getMyOffers();
      setOffers(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách offer:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleOpenOffer = (offer: CandidateOfferItem) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: CandidateOfferStatus, expirationDate: string) => {
    const isExpired = new Date() > new Date(expirationDate) && status === CandidateOfferStatus.SENT;

    if (isExpired || status === CandidateOfferStatus.EXPIRED) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <Clock className="w-3.5 h-3.5" />
          Đã quá hạn
        </span>
      );
    }

    switch (status) {
      case CandidateOfferStatus.SENT:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Chờ bạn phản hồi
          </span>
        );
      case CandidateOfferStatus.ACCEPTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã đồng ý nhận việc
          </span>
        );
      case CandidateOfferStatus.DECLINED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Đã từ chối offer
          </span>
        );
      default:
        return null;
    }
  };

  const getDaysLeft = (expirationDate: string) => {
    const diff = new Date(expirationDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Đã hết hạn';
    if (days === 0) return 'Hết hạn hôm nay';
    return `Còn ${days} ngày để phản hồi`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải danh sách lời mời nhận việc...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
          Offer của tôi
        </h1>
        <p className="mt-1 text-xs font-medium sm:text-sm text-slate-500">
          Xem chi tiết và tiếp nhận các thư mời nhận việc từ nhà tuyển dụng
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 py-20 space-y-3 text-center bg-white border shadow-xs rounded-3xl border-slate-200/80">
          <div className="flex items-center justify-center mb-1 w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600">
            <FileText size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có Thư mời nhận việc (Offer)</h3>
          <p className="max-w-sm text-xs text-slate-500">
            Các thư mời nhận việc chính thức sẽ được gửi tới bạn khi kết thúc vòng phỏng vấn thành công.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((offer) => {
            const formattedSalary = Number(offer.salary || 0).toLocaleString('vi-VN');
            const job = offer.jobDescriptionId;
            const dept = offer.departmentId;

            return (
              <div
                key={offer._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-2xs font-bold text-blue-600 uppercase tracking-wider">
                        {dept?.name || 'TalentCore Technology'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5 group-hover:text-blue-600 transition-colors">
                        {offer.positionTitle}
                      </h3>
                    </div>
                    {getStatusBadge(offer.status, offer.expirationDate)}
                  </div>

                  {/* Salary & Probation highlight */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-blue-50/40 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xs text-slate-500 font-semibold uppercase">Mức lương đề nghị</span>
                      <p className="text-lg font-extrabold text-emerald-700">
                        {formattedSalary} {offer.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xs text-slate-500 font-semibold uppercase">Thử việc</span>
                      <p className="text-xs font-bold text-slate-700">
                        {offer.probationDurationMonths} tháng ({offer.probationSalaryPercentage}%)
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngày bắt đầu: <strong>{new Date(offer.startDate).toLocaleDateString('vi-VN')}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Hạn chót: <strong>{new Date(offer.expirationDate).toLocaleDateString('vi-VN')}</strong> (
                        <span className="text-amber-600 font-semibold">{getDaysLeft(offer.expirationDate)}</span>)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-2xs text-slate-400">
                    Gửi ngày {offer.sentAt ? new Date(offer.sentAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenOffer(offer)}
                    className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Xem Thư mời & Phản hồi</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <OfferLetterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
        onOfferResponded={fetchOffers}
      />
    </div>
  );
}
