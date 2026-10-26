'use client'

import { Send, Clock, Calendar, FileText } from 'lucide-react'
import { ApplicationStats } from '../../types/application.types'

interface ApplicationStatsCardsProps {
  stats: ApplicationStats
}

export function ApplicationStatsCards({ stats }: ApplicationStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 sm:gap-5">
      {/* Card 1: Total Applied */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600" />
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-bold text-slate-700">Đã ứng tuyển</span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50/90 text-blue-600 flex items-center justify-center ring-4 ring-blue-50/50 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
            <Send size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.totalApplied}</span>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-100/80">
            Tổng hồ sơ
          </span>
        </div>
      </div>

      {/* Card 2: Processing */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-bold text-slate-700">Đang xử lý</span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50/90 text-amber-600 flex items-center justify-center ring-4 ring-amber-50/50 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200">
            <Clock size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.processingCount}</span>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-100/80">
            Đang xét duyệt
          </span>
        </div>
      </div>

      {/* Card 3: Interviews */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-bold text-slate-700">Phỏng vấn</span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50/90 text-purple-600 flex items-center justify-center ring-4 ring-purple-50/50 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200">
            <Calendar size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.interviewCount}</span>
          <span className="text-[11px] font-bold text-purple-600 bg-purple-50/80 px-2.5 py-0.5 rounded-full border border-purple-100/80">
            Lịch hẹn
          </span>
        </div>
      </div>

      {/* Card 4: Offer */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-[13px] font-bold text-slate-700">Offer</span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50/90 text-emerald-600 flex items-center justify-center ring-4 ring-emerald-50/50 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
            <FileText size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.offerCount}</span>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-100/80">
            Thư mời nhận việc
          </span>
        </div>
      </div>
    </div>
  )
}
