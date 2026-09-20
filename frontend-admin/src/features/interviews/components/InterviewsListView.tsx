'use client'

import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import InterviewCard from './InterviewCard'
import { InterviewItem, InterviewStatus, InterviewResult } from '../types/interview.types'

import CustomPagination from '@/src/components/common/CustomPagination'

interface InterviewsListViewProps {
  interviews: InterviewItem[]
  activeMenuId: string | null
  setActiveMenuId: (id: string | null) => void
  onOpenStatusModal: (interview: InterviewItem) => void
  onOpenEditModal: (interview: InterviewItem) => void
  onOpenRescheduleModal?: (interview: InterviewItem) => void
  onOpenRescheduleRequestModal?: (interview: InterviewItem) => void
  onApproveReschedule?: (interview: InterviewItem) => void
  onRejectReschedule?: (interview: InterviewItem) => void
  onApproveCandidateCancellation?: (interview: InterviewItem) => void
  onOpenDeptScheduleModal?: (interview: InterviewItem) => void
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
  onOpenEditModal,
  onOpenRescheduleModal,
  onOpenRescheduleRequestModal,
  onApproveReschedule,
  onRejectReschedule,
  onApproveCandidateCancellation,
  onOpenDeptScheduleModal,
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
    <div className="space-y-4">
      {/* Quick Time Filter Tabs Bar (Image Style) */}
      {setTimeTabFilter && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setTimeTabFilter('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              timeTabFilter === 'ALL'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                : 'bg-white/40 hover:bg-white/70 text-slate-700 border border-white/60'
            }`}
          >
            Tất cả ({tabCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setTimeTabFilter('TODAY')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              timeTabFilter === 'TODAY'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                : 'bg-white/40 hover:bg-white/70 text-slate-700 border border-white/60'
            }`}
          >
            Hôm nay ({tabCounts.today})
          </button>
          <button
            type="button"
            onClick={() => setTimeTabFilter('THIS_WEEK')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              timeTabFilter === 'THIS_WEEK'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                : 'bg-white/40 hover:bg-white/70 text-slate-700 border border-white/60'
            }`}
          >
            Tuần này ({tabCounts.thisWeek})
          </button>
          <button
            type="button"
            onClick={() => setTimeTabFilter('NEXT_WEEK')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              timeTabFilter === 'NEXT_WEEK'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                : 'bg-white/40 hover:bg-white/70 text-slate-700 border border-white/60'
            }`}
          >
            Tuần sau ({tabCounts.nextWeek})
          </button>
        </div>
      )}

      {/* Empty State vs Table Container */}
      {interviews.length === 0 ? (
        <div className="bg-white/20 border-2 border-slate-300/80 shadow-xl rounded-3xl p-12 text-center backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Chưa có lịch phỏng vấn nào phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Không tìm thấy buổi phỏng vấn nào matching với bộ lọc hiện tại. Thử thay đổi thời gian hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white/20 border-2 border-slate-300/80 shadow-xl shadow-blue-500/5 rounded-3xl transition-all duration-300 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300/80 bg-white/40 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  <th className="px-4 py-3.5">Ứng viên</th>
                  <th className="px-4 py-3.5">Vị trí ứng tuyển</th>
                  <th className="px-4 py-3.5">Phòng ban</th>
                  <th className="px-4 py-3.5">Thời gian</th>
                  <th className="px-4 py-3.5">Người phỏng vấn</th>
                  <th className="px-4 py-3.5 text-left">Trạng thái</th>
                  <th className="px-5 py-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300/80">
                {paginatedInterviews.map((item) => (
                  <InterviewCard
                    key={item._id}
                    item={item}
                    onOpenStatusModal={onOpenStatusModal}
                    onOpenEditModal={onOpenEditModal}
                    onOpenRescheduleModal={onOpenRescheduleModal}
                    onOpenRescheduleRequestModal={onOpenRescheduleRequestModal}
                    onApproveReschedule={onApproveReschedule}
                    onRejectReschedule={onRejectReschedule}
                    onApproveCandidateCancellation={onApproveCandidateCancellation}
                    onOpenDeptScheduleModal={onOpenDeptScheduleModal}
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
          </div>

          {onPageChange && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(interviews.length / pageSize)}
              totalItems={interviews.length}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </div>
  )
}
