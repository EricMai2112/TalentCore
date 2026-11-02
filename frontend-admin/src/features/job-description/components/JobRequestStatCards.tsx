'use client'

import React from 'react'
import { FileText, Clock, CheckCircle2, XCircle, Briefcase, BookCheck } from 'lucide-react'
import { JobDescription, JobStatus } from '../types/job-description.types'

interface JobRequestStatCardsProps {
  jobs: JobDescription[]
  selectedStatus?: string
  onSelectStatus?: (status: string) => void
  className?: string
}

export function JobRequestStatCards({ jobs, className = '' }: JobRequestStatCardsProps) {
  // Metrics calculation based on input jobs
  const totalCount = jobs.length
  const pendingCount = jobs.filter((j) => j.status === JobStatus.PENDING).length
  const approvedCount = jobs.filter((j) => j.status === JobStatus.APPROVED).length
  const rejectedCount = jobs.filter((j) => j.status === JobStatus.REJECTED).length
  const jdCreatedCount = jobs.filter((j) => j.status === JobStatus.JD_CREATED).length
  const completedCount = jobs.filter((j) => j.status === JobStatus.COMPLETED).length

  const statCardsConfig = [
    {
      id: 'all',
      label: 'TỔNG YÊU CẦU',
      count: totalCount,
      icon: FileText,
      iconBg: 'bg-blue-100/90 text-[#3B82F6] border-blue-200/60',
      blobGradient: 'from-blue-500/15 via-sky-400/10 to-transparent',
      ratioColor: 'bg-blue-50 text-[#3B82F6] border-blue-100'
    },
    {
      id: JobStatus.PENDING,
      label: 'CHỜ DUYỆT',
      count: pendingCount,
      icon: Clock,
      iconBg: 'bg-amber-100/90 text-amber-600 border-amber-200/60',
      blobGradient: 'from-amber-500/15 via-orange-400/10 to-transparent',
      ratioColor: 'bg-amber-50 text-amber-700 border-amber-100'
    },
    {
      id: JobStatus.APPROVED,
      label: 'ĐÃ DUYỆT',
      count: approvedCount,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100/90 text-emerald-600 border-emerald-200/60',
      blobGradient: 'from-emerald-500/15 via-teal-400/10 to-transparent',
      ratioColor: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    {
      id: JobStatus.REJECTED,
      label: 'TỪ CHỐI',
      count: rejectedCount,
      icon: XCircle,
      iconBg: 'bg-rose-100/90 text-rose-600 border-rose-200/60',
      blobGradient: 'from-rose-500/15 via-pink-400/10 to-transparent',
      ratioColor: 'bg-rose-50 text-rose-700 border-rose-100'
    },
    {
      id: JobStatus.JD_CREATED,
      label: 'ĐÃ TẠO JD',
      count: jdCreatedCount,
      icon: Briefcase,
      iconBg: 'bg-indigo-100/90 text-indigo-600 border-indigo-200/60',
      blobGradient: 'from-indigo-500/15 via-purple-400/10 to-transparent',
      ratioColor: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    {
      id: JobStatus.COMPLETED,
      label: 'HOÀN THÀNH',
      count: completedCount,
      icon: BookCheck,
      iconBg: 'bg-sky-100/90 text-sky-600 border-sky-200/60',
      blobGradient: 'from-sky-500/15 via-cyan-400/10 to-transparent',
      ratioColor: 'bg-sky-50 text-sky-700 border-sky-100'
    }
  ]

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${className}`}>
      {statCardsConfig.map((card) => {
        const IconComponent = card.icon
        const percentRatio = totalCount > 0 ? Math.round((card.count / totalCount) * 100) : 0

        return (
          <div
            key={card.id}
            className="relative bg-white/25 border border-white/60 rounded-2xl p-3 px-3.5 shadow-md shadow-blue-500/5 hover:bg-white/35 transition-all duration-200 overflow-hidden flex items-center gap-3"
          >
            {/* Ambient Accent background */}
            <div
              className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.blobGradient} blur-lg pointer-events-none`}
            />

            {/* Left: Icon Badge */}
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${card.iconBg}`}
            >
              <IconComponent size={16} className="stroke-[2.2]" />
            </div>

            {/* Right: Label + Count & Dynamic Percentage Ratio */}
            <div className="relative z-10 flex-1 min-w-0">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block truncate leading-tight">
                {card.label}
              </span>
              <div className="flex items-baseline justify-between gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                  {card.count}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 leading-none ${card.ratioColor}`}
                >
                  {percentRatio}%
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default JobRequestStatCards
