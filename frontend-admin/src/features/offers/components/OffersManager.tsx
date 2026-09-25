'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FileText,
  Send,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Briefcase,
  Calendar,
} from 'lucide-react';
import {
  CustomTableContainer,
  CustomInput,
  CustomSelect,
  CustomButton,
  CustomActionMenu,
  CustomActionMenuItem,
  Toast,
  useToast,
} from '@/src/components/common';
import { OfferStatCards } from './OfferStatCards';
import { OfferDetailModal } from './OfferDetailModal';
import { OfferItem, OfferStatus } from '../types/offer.types';
import { offersApi } from '../services/offers.api';
import { Department } from '@/src/features/departments/types/department.types';

interface OffersManagerProps {
  initialOffers?: OfferItem[];
  initialTotal?: number;
  initialDepartments?: Department[];
  initialApplications?: any[];
}

export const OffersManager: React.FC<OffersManagerProps> = ({
  initialOffers = [],
  initialTotal = 0,
  initialDepartments = [],
  initialApplications = [],
}) => {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [offers, setOffers] = useState<OfferItem[]>(initialOffers);
  const [total, setTotal] = useState<number>(initialTotal);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Active action menu id
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal states
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<OfferItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch offers
  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await offersApi.getOffers({
        page: currentPage,
        limit: pageSize,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        departmentId: selectedDepartment === 'ALL' ? undefined : selectedDepartment,
        search: search ? search.trim() : undefined,
      });

      setOffers(res.items);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Failed to load offers:', err);
      showToast(err.message || 'Không thể tải danh sách đề nghị nhận việc', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, selectedDepartment, search]);

  // Refetch when filters or page changes (skip initial load if initialOffers provided)
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialOffers.length === 0) {
        fetchOffers();
      }
      return;
    }
    fetchOffers();
  }, [fetchOffers]);

  const handleOpenDetail = (offer: OfferItem) => {
    setSelectedOfferForDetail(offer);
    setIsDetailModalOpen(true);
  };

  const handleSendOffer = async (offer: OfferItem) => {
    try {
      await offersApi.sendOffer(offer._id);
      showToast('Đã gửi đề nghị nhận việc đến ứng viên!', 'success');
      fetchOffers();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi gửi đề nghị nhận việc', 'error');
    }
  };

  const handleWithdrawOffer = async (offer: OfferItem) => {
    try {
      await offersApi.withdrawOffer(offer._id);
      showToast('Đã thu hồi đề nghị nhận việc thành công', 'success');
      fetchOffers();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi thu hồi đề nghị', 'error');
    }
  };

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case OfferStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3" />
            Bản nháp
          </span>
        );
      case OfferStatus.SENT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Send className="w-3 h-3" />
            Chờ phản hồi
          </span>
        );
      case OfferStatus.ACCEPTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Đã đồng ý
          </span>
        );
      case OfferStatus.DECLINED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Đã từ chối
          </span>
        );
      case OfferStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-gray-100 text-gray-500">
            <Ban className="w-3 h-3" />
            Đã thu hồi
          </span>
        );
      case OfferStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-orange-50 text-orange-600">
            <Clock className="w-3 h-3" />
            Đã quá hạn
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản Lý Đề Nghị Nhận Việc (Offers)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi, tạo mới và quản lý các thư mời tuyển dụng gửi đến ứng viên
          </p>
        </div>

        <CustomButton
          variant="primary"
          icon={Plus}
          onClick={() => router.push('/offers/create')}
        >
          Tạo Đề Nghị Mới
        </CustomButton>
      </div>

      {/* Metrics Stat Cards */}
      <OfferStatCards offers={offers} />

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="w-full sm:w-64">
            <CustomInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm vị trí tuyển dụng..."
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-48">
            <CustomSelect
              options={[
                { value: 'ALL', label: 'Tất cả phòng ban' },
                ...initialDepartments.map((d) => ({
                  value: d._id,
                  label: d.name,
                })),
              ]}
              value={selectedDepartment}
              onChange={(val) => {
                setSelectedDepartment(val);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <CustomSelect
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: OfferStatus.DRAFT, label: 'Bản nháp' },
                { value: OfferStatus.SENT, label: 'Chờ phản hồi' },
                { value: OfferStatus.ACCEPTED, label: 'Đã chấp nhận' },
                { value: OfferStatus.DECLINED, label: 'Đã từ chối' },
                { value: OfferStatus.CANCELLED, label: 'Đã thu hồi' },
              ]}
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium self-end md:self-auto">
          Hiển thị <strong>{offers.length}</strong> / <strong>{total}</strong> đề nghị
        </div>
      </div>

      {/* Table Container */}
      <CustomTableContainer
        pagination={{
          currentPage,
          totalPages: Math.ceil(total / pageSize) || 1,
          totalItems: total,
          pageSize,
          onPageChange: (p) => setCurrentPage(p),
        }}
        isEmpty={offers.length === 0}
        emptyTitle="Chưa có đề nghị nhận việc nào"
        emptyDescription="Hiện chưa có đề nghị nhận việc nào phù hợp với bộ lọc. Hãy tạo đề nghị đầu tiên để gửi đến ứng viên."
        emptyIcon={<FileText className="w-8 h-8 stroke-[1.5]" />}
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-2xs">
            <tr className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="px-4 py-3.5">Ứng viên</th>
              <th className="px-4 py-3.5">Vị trí & Phòng ban</th>
              <th className="px-4 py-3.5">Lương đề nghị</th>
              <th className="px-4 py-3.5">Ngày bắt đầu / Hạn chót</th>
              <th className="px-4 py-3.5 text-left">Trạng thái</th>
              <th className="px-5 py-3.5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/40">
            {offers.map((offer) => {
              const candidate = offer.candidateId;
              const candidateUser = candidate?.userId;
              const name = candidateUser?.name || candidate?.profileName || 'Ứng viên';
              const email = candidateUser?.email || '';

              const menuItems: CustomActionMenuItem[] = [
                {
                  id: 'view',
                  label: 'Xem chi tiết',
                  icon: <Eye className="w-4 h-4" />,
                  onClick: () => handleOpenDetail(offer),
                },
              ];

              if (offer.status === OfferStatus.DRAFT) {
                menuItems.push({
                  id: 'send',
                  label: 'Gửi cho ứng viên',
                  icon: <Send className="w-4 h-4" />,
                  onClick: () => handleSendOffer(offer),
                  variant: 'primary',
                });
              }

              if (offer.status === OfferStatus.DRAFT || offer.status === OfferStatus.SENT) {
                menuItems.push({
                  id: 'withdraw',
                  label: 'Thu hồi đề nghị',
                  icon: <Ban className="w-4 h-4" />,
                  onClick: () => handleWithdrawOffer(offer),
                  variant: 'danger',
                });
              }

              return (
                <tr
                  key={offer._id}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  onClick={() => handleOpenDetail(offer)}
                >
                  {/* Candidate Cell */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{name}</p>
                        <p className="text-2xs text-slate-400 mt-0.5">{email || 'Chưa có email'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Position & Department */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {offer.positionTitle}
                    </div>
                    <div className="text-2xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {offer.departmentId?.name || 'Phòng ban'}
                    </div>
                  </td>

                  {/* Salary */}
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-emerald-600 text-xs">
                      {Number(offer.salary || 0).toLocaleString('vi-VN')} {offer.currency}
                    </div>
                    <div className="text-2xs text-slate-400 mt-0.5">
                      Thử việc {offer.probationDurationMonths} tháng ({offer.probationSalaryPercentage}%)
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="px-4 py-3.5">
                    <div className="text-xs text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Bắt đầu: {new Date(offer.startDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-2xs text-amber-600 mt-0.5">
                      Hạn chót: {new Date(offer.expirationDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">{getStatusBadge(offer.status)}</td>

                  {/* Actions */}
                  <td
                    className="px-5 py-3.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CustomActionMenu items={menuItems} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CustomTableContainer>

      {/* Modals */}
      <OfferDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOfferForDetail(null);
        }}
        offer={selectedOfferForDetail}
        onOfferUpdated={fetchOffers}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};
