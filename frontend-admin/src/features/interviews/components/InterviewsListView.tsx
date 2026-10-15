'use client'

import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import InterviewCard from './InterviewCard'
import { InterviewItem, InterviewStatus, InterviewResult } from '../types/interview.types'

import CustomPagination from '@/src/components/common/CustomPagination'
import CustomTableContainer from '@/src/components/common/CustomTableContainer'

interface InterviewsListViewProps {
  interviews: InterviewItem[]
  activeMenuId: string | null
  setActiveMenuId: (id: string | null) => void
  onOpenStatusModal?: (interview: InterviewItem) => void
  onOpenCandidateDetailModal?: (interview: InterviewItem) => void
  onApproveCandidateCancellation?: (interview: InterviewItem) => void
  onOpenDeptScheduleModal?: (interview: InterviewItem) => void
  onRejectDeptCv?: (interview: InterviewItem) => void
  onApproveHrSchedule?: (interview: InterviewItem) => void
  formatDate: (dateStr?: string) => string
  getStatusBadge: (status: InterviewStatus, confirmationStatus?: string) => React.ReactNode
  getResultBadge: (result: InterviewResult) => React.ReactNode
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  timeTabFilter?: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'NEXT_WEEK'
  setTimeTabFilter?: (tab: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'NEXT_WEEK') => void
  tabCounts?: { all: number; today: number; thisWeek: number; nextWeek: number }
}

export default function InterviewsListView({
  interviews,
  activeMenuId,
  setActiveMenuId,
  onOpenStatusModal,
  onOpenCandidateDetailModal,
  onApproveCandidateCancellation,
  onOpenDeptScheduleModal,
  onRejectDeptCv,
  onApproveHrSchedule,
  formatDate,
  getStatusBadge,
  getResultBadge,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  timeTabFilter = 'ALL',
  setTimeTabFilter,
  tabCounts = { all: 0, today: 0, thisWeek: 0, nextWeek: 0 }
}: InterviewsListViewProps) {
  const paginatedInterviews = interviews.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      {/* Glassmorphic Table Container */}
      <CustomTableContainer
        pagination={
          onPageChange
            ? {
                currentPage,
                totalPages: Math.ceil(interviews.length / pageSize),
                totalItems: interviews.length,
                pageSize,
                onPageChange
              }
            : undefined
        }
        isEmpty={interviews.length === 0}
        emptyTitle="Chưa có lịch phỏng vấn nào phù hợp"
        emptyDescription="Không tìm thấy buổi phỏng vấn nào matching với bộ lọc hiện tại. Thử thay đổi thời gian hoặc từ khóa tìm kiếm."
        emptyIcon={<CalendarIcon className="w-8 h-8 stroke-[1.5]" />}
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
            <tr className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="px-4 py-3.5">Ứng viên</th>
              <th className="px-4 py-3.5">Vị trí ứng tuyển</th>
              <th className="px-4 py-3.5">Phòng ban</th>
              <th className="px-4 py-3.5">Thời gian</th>
              <th className="px-4 py-3.5">Người phỏng vấn</th>
              <th className="px-4 py-3.5 text-left">Trạng thái</th>
              <th className="px-5 py-3.5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/40">
            {paginatedInterviews.map((item, idx) => (
              <InterviewCard
                key={item._id}
                item={item}
                index={idx}
                onOpenStatusModal={onOpenStatusModal}
                onOpenCandidateDetailModal={onOpenCandidateDetailModal}
                onApproveCandidateCancellation={onApproveCandidateCancellation}
                onOpenDeptScheduleModal={onOpenDeptScheduleModal}
                onRejectDeptCv={onRejectDeptCv}
                onApproveHrSchedule={onApproveHrSchedule}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                getResultBadge={getResultBadge}
              />
            ))}
          </tbody>
        </table>
      </CustomTableContainer>
    </div>
  )
}
