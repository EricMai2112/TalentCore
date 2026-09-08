'use client'

import { useState, useEffect } from 'react'
import { Loader2, Inbox, CheckCircle2, Clock, XCircle, Search } from 'lucide-react'
import { CandidateInterviewItem } from '../../types/application.types'
import { candidateInterviewsApi } from '../../services/candidate-interviews.api'
import { UpcomingInterviewBanner } from './UpcomingInterviewBanner'
import { CandidateInterviewCardItem } from './CandidateInterviewCardItem'

export function CandidateInterviewsView() {
  const [interviews, setInterviews] = useState<CandidateInterviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchInterviews = async () => {
    setIsLoading(true)
    try {
      const data = await candidateInterviewsApi.getMyInterviews()
      setInterviews(data || [])
    } catch (err) {
      console.error('Lỗi khi lấy lịch phỏng vấn:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  // Find the next upcoming scheduled interview
  const upcomingInterview = interviews.find(
    (item) => item.status === 'SCHEDULED'
  )

  // Filter interviews by status and search query
  const filteredInterviews = interviews.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const jobTitle = item.jobDescriptionId?.title?.toLowerCase() || ''
      const deptName =
        typeof item.jobDescriptionId?.departmentId === 'object'
          ? item.jobDescriptionId?.departmentId?.name?.toLowerCase() || ''
          : ''
      return jobTitle.includes(query) || deptName.includes(query)
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
          Lịch phỏng vấn của tôi
        </h1>
        <p className="mt-1 text-xs font-medium sm:text-sm text-slate-500">
          Theo dõi và tham gia các buổi phỏng vấn tuyển dụng đã được lên lịch
        </p>
      </div>

      {/* Featured Top Card: Upcoming Interview Banner */}
      {!isLoading && upcomingInterview && (
        <UpcomingInterviewBanner
          interview={upcomingInterview}
          onStatusUpdated={fetchInterviews}
        />
      )}

      {/* Section Header & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Tất cả lịch phỏng vấn</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              {filteredInterviews.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm vị trí..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SCHEDULED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              statusFilter === 'SCHEDULED'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock size={13} />
            <span>Đã lên lịch</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Hoàn thành</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              statusFilter === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <XCircle size={13} />
            <span>Đã hủy</span>
          </button>
        </div>
      </div>

      {/* Main Interviews List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border shadow-xs text-slate-400 rounded-3xl border-slate-200/80">
          <Loader2 size={32} className="mb-3 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold">Đang tải lịch phỏng vấn...</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 py-16 space-y-3 text-center bg-white border shadow-xs rounded-3xl border-slate-200/80">
          <div className="flex items-center justify-center mb-1 w-14 h-14 rounded-3xl bg-slate-100 text-slate-400">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy lịch phỏng vấn nào</h3>
          <p className="max-w-sm text-xs text-slate-500">
            {statusFilter !== 'ALL'
              ? 'Không có lịch phỏng vấn ở trạng thái này.'
              : 'Bạn chưa có lịch phỏng vấn nào được xếp trong hệ thống.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((item) => (
            <CandidateInterviewCardItem
              key={item._id}
              interview={item}
              onStatusUpdated={fetchInterviews}
            />
          ))}
        </div>
      )}
    </div>
  )
}
