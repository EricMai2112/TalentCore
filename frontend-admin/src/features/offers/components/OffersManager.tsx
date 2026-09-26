'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  RotateCcw
} from 'lucide-react'
import {
  CustomTableContainer,
  CustomInput,
  CustomSelect,
  CustomButton,
  CustomActionMenu,
  CustomActionMenuItem,
  Toast,
  useToast
} from '@/src/components/common'
import { OfferStatCards } from './OfferStatCards'
import { OfferDetailModal } from './OfferDetailModal'
import { OfferItem, OfferStatus } from '../types/offer.types'
import { offersApi } from '../services/offers.api'
import { Department } from '@/src/features/departments/types/department.types'

interface OffersManagerProps {
  initialOffers?: OfferItem[]
  initialTotal?: number
  initialDepartments?: Department[]
  initialApplications?: any[]
}

export const OffersManager: React.FC<OffersManagerProps> = ({
  initialOffers = [],
  initialTotal = 0,
  initialDepartments = [],
  initialApplications = []
}) => {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()

  const [offers, setOffers] = useState<OfferItem[]>(initialOffers)
  const [total, setTotal] = useState<number>(initialTotal)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Active action menu id
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  // Modal states
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<OfferItem | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch offers
  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await offersApi.getOffers({
        page: currentPage,
        limit: pageSize,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        departmentId: selectedDepartment === 'ALL' ? undefined : selectedDepartment,
        search: search ? search.trim() : undefined
      })

      setOffers(res.items)
      setTotal(res.total)
    } catch (err: any) {
      console.error('Failed to load offers:', err)
      showToast(err.message || 'Không thể tải danh sách đề nghị nhận việc', 'error')
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedStatus, selectedDepartment, search])

  // Refetch when filters or page changes (skip initial load if initialOffers provided)
  const isFirstRender = React.useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (initialOffers.length === 0) {
        fetchOffers()
      }
      return
    }
    fetchOffers()
  }, [fetchOffers])

  const handleResetFilters = () => {
    setSearch('')
    setSelectedDepartment('ALL')
    setSelectedStatus('ALL')
    setCurrentPage(1)
  }

  const handleOpenDetail = (offer: OfferItem) => {
    setSelectedOfferForDetail(offer)
    setIsDetailModalOpen(true)
  }

  const handleSendOffer = async (offer: OfferItem) => {
    try {
      await offersApi.sendOffer(offer._id)
      showToast('Đã gửi đề nghị nhận việc đến ứng viên!', 'success')
      fetchOffers()
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi gửi đề nghị nhận việc', 'error')
    }
  }

  const handleWithdrawOffer = async (offer: OfferItem) => {
    try {
      await offersApi.withdrawOffer(offer._id)
      showToast('Đã thu hồi đề nghị nhận việc thành công', 'success')
      fetchOffers()
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi thu hồi đề nghị', 'error')
    }
  }

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case OfferStatus.DRAFT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3" />
            Bản nháp
          </span>
        )
      case OfferStatus.SENT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Send className="w-3 h-3" />
            Chờ phản hồi
          </span>
        )
      case OfferStatus.ACCEPTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Đã đồng ý
          </span>
        )
      case OfferStatus.DECLINED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Đã từ chối
          </span>
        )
      case OfferStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-gray-100 text-gray-500">
            <Ban className="w-3 h-3" />
            Đã thu hồi
          </span>
        )
      case OfferStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-orange-50 text-orange-600">
            <Clock className="w-3 h-3" />
            Đã quá hạn
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={hideToast} position="bottom-right" />

      {/* Metrics Stat Cards */}
      <OfferStatCards offers={offers} />

      {/* Filters Toolbar with Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input for Candidate / Position */}
          <div className="w-full sm:w-64 lg:w-72">
            <CustomInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo ứng viên, vị trí..."
              icon={<Search size={15} />}
              className="!py-1.5 !rounded-xl text-xs"
            />
          </div>

          {/* Department Filter */}
          <CustomSelect
            value={selectedDepartment}
            onChange={(val) => {
              setSelectedDepartment(val)
              setCurrentPage(1)
            }}
            size="sm"
            className="w-full sm:w-auto"
            placeholder="Tất cả phòng ban"
            options={[
              { value: 'ALL', label: 'Tất cả phòng ban' },
              ...initialDepartments.map((d) => ({
                value: d._id,
                label: d.name
              }))
            ]}
            icon={<Building2 size={14} />}
          />

          {/* Status Filter */}
          <CustomSelect
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val)
              setCurrentPage(1)
            }}
            size="sm"
            className="w-full sm:w-auto"
            placeholder="Tất cả trạng thái"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: OfferStatus.DRAFT, label: 'Bản nháp' },
              { value: OfferStatus.SENT, label: 'Chờ phản hồi' },
              { value: OfferStatus.ACCEPTED, label: 'Đã chấp nhận' },
              { value: OfferStatus.DECLINED, label: 'Đã từ chối' },
              { value: OfferStatus.CANCELLED, label: 'Đã thu hồi' }
            ]}
            icon={<Clock size={14} />}
          />

          {/* Reset Filters Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 rounded-xl border border-white/80 bg-white/60 hover:bg-white text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
            title="Đặt lại tất cả bộ lọc"
          >
            <RotateCcw size={14} />
            <span>Đặt lại</span>
          </button>
        </div>

        {/* Action Button: Tạo đề nghị mới */}
        <CustomButton
          onClick={() => router.push('/offers/create')}
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          className="ml-auto font-bold sm:ml-0 shrink-0"
        >
          Tạo đề nghị mới
        </CustomButton>
      </div>

      {/* Table Container */}
      <CustomTableContainer
        pagination={{
          currentPage,
          totalPages: Math.ceil(total / pageSize) || 1,
          totalItems: total,
          pageSize,
          onPageChange: (p) => setCurrentPage(p)
        }}
        isEmpty={offers.length === 0}
        emptyTitle="Chưa có đề nghị nhận việc nào"
        emptyDescription="Hiện chưa có đề nghị nhận việc nào phù hợp với bộ lọc. Hãy tạo đề nghị đầu tiên để gửi đến ứng viên."
        emptyIcon={<FileText className="w-8 h-8 stroke-[1.5]" />}
      >
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-lg border-slate-200/60 shadow-2xs">
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
              const candidate = offer.candidateId
              const candidateUser = candidate?.userId
              const name = candidateUser?.name || candidate?.profileName || 'Ứng viên'
              const email = candidateUser?.email || ''

              const menuItems: CustomActionMenuItem[] = [
                {
                  id: 'view',
                  label: 'Xem chi tiết',
                  icon: <Eye className="w-4 h-4" />,
                  onClick: () => handleOpenDetail(offer)
                }
              ]

              if (offer.status === OfferStatus.DRAFT) {
                menuItems.push({
                  id: 'send',
                  label: 'Gửi cho ứng viên',
                  icon: <Send className="w-4 h-4" />,
                  onClick: () => handleSendOffer(offer),
                  variant: 'primary'
                })
              }

              if (offer.status === OfferStatus.DRAFT || offer.status === OfferStatus.SENT) {
                menuItems.push({
                  id: 'withdraw',
                  label: 'Thu hồi đề nghị',
                  icon: <Ban className="w-4 h-4" />,
                  onClick: () => handleWithdrawOffer(offer),
                  variant: 'danger'
                })
              }

              return (
                <tr
                  key={offer._id}
                  className="transition-colors cursor-pointer hover:bg-blue-50/30 group"
                  onClick={() => handleOpenDetail(offer)}
                >
                  {/* Candidate Cell */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center text-xs font-bold text-white w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-2xs">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{name}</p>
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
                    <div className="text-xs font-bold text-emerald-600">
                      {Number(offer.salary || 0).toLocaleString('vi-VN')} {offer.currency}
                    </div>
                    <div className="text-2xs text-slate-400 mt-0.5">
                      Thử việc {offer.probationDurationMonths} tháng (
                      {offer.probationSalaryPercentage}%)
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-slate-700">
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
                  <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <CustomActionMenu items={menuItems} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CustomTableContainer>

      {/* Modals */}
      <OfferDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedOfferForDetail(null)
        }}
        offer={selectedOfferForDetail}
        onOfferUpdated={fetchOffers}
      />
    </div>
  )
}
