'use client'

import React from 'react'
import { Users, Briefcase, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { OverviewKpis } from '../types/dashboard.types'

interface KpiCardProps {
  icon: React.ReactNode
  iconBg: string
  blobGradient: string
  label: string
  value: string | number
  unit: string
  tooltip?: string
}

function KpiCard({ icon, iconBg, blobGradient, label, value, unit, tooltip }: KpiCardProps) {
  return (
    <div
      title={tooltip}
      className={`relative bg-white/60 backdrop-blur-md border rounded-2xl p-2.5 px-3.5 
                 shadow-sm shadow-blue-500/5 hover:bg-white/80 hover:border-white/95 hover:shadow-md 
                 transition-all duration-200 overflow-hidden flex items-center gap-3 h-[70px] group border-white/70`}
    >
      {/* Ambient Gradient Glow */}
      <div
        className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full 
                    bg-gradient-to-br ${blobGradient} blur-xl pointer-events-none 
                    opacity-50 group-hover:opacity-80 transition-opacity`}
      />

      {/* Icon Badge */}
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${iconBg}`}
      >
        {icon}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col justify-center flex-1 min-w-0">
        {/* Label */}
        <span className="text-[10px] inline-block pt-1 font-bold tracking-wider text-slate-400 uppercase truncate leading-none mb-1">
          {label}
        </span>

        {/* Value + Unit */}
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="text-xl font-black leading-none tracking-tight truncate lg:text-2xl text-slate-800">
            {value}
          </span>
          <span className="text-[11px] font-bold text-slate-500 leading-none truncate">{unit}</span>
        </div>
      </div>
    </div>
  )
}

interface Props {
  kpis: OverviewKpis
}

export default function KpiStatsRow({ kpis }: Props) {
  const { candidates, jobs, interviews, offers, timeToHire } = kpis

  const cards: KpiCardProps[] = [
    {
      icon: <Users size={17} className="stroke-[2.2]" />,
      iconBg: 'bg-blue-100/90 text-blue-600 border-blue-200/70',
      blobGradient: 'from-blue-500/50 via-sky-400/30 to-transparent',
      label: 'Tổng ứng viên',
      value: candidates.total.toLocaleString(),
      unit: 'hồ sơ',
      tooltip: `${candidates.newLast30Days} hồ sơ mới trong 30 ngày qua`
    },
    {
      icon: <Briefcase size={17} className="stroke-[2.2]" />,
      iconBg: 'bg-violet-100/90 text-violet-600 border-violet-200/70',
      blobGradient: 'from-violet-500/50 via-purple-400/30 to-transparent',
      label: 'JD đang mở',
      value: jobs.active,
      unit: 'vị trí',
      tooltip: `${jobs.total} tổng tin tuyển dụng trong hệ thống`
    },
    {
      icon: <Calendar size={17} className="stroke-[2.2]" />,
      iconBg: 'bg-indigo-100/90 text-indigo-600 border-indigo-200/70',
      blobGradient: 'from-indigo-500/50 via-blue-400/30 to-transparent',
      label: 'PV hôm nay',
      value: interviews.today,
      unit: 'cuộc hẹn',
      tooltip: `${interviews.pendingResults} phỏng vấn đã hoàn tất đang chờ nhập kết quả`
    },
    {
      icon: <CheckCircle2 size={17} className="stroke-[2.2]" />,
      iconBg: 'bg-emerald-100/90 text-emerald-600 border-emerald-200/70',
      blobGradient: 'from-emerald-500/50 via-teal-400/30 to-transparent',
      label: 'Tỷ lệ nhận offer',
      value: `${offers.acceptanceRate}%`,
      unit: 'chấp thuận',
      tooltip: `${offers.sent} offer đang chờ phản hồi (${offers.overdueCount} quá hạn phản hồi)`
    },
    {
      icon: <Clock size={17} className="stroke-[2.2]" />,
      iconBg: 'bg-teal-100/90 text-teal-600 border-teal-200/70',
      blobGradient: 'from-teal-500/50 via-cyan-400/30 to-transparent',
      label: 'Time-to-Hire TB',
      value: timeToHire.isEmpty || timeToHire.avgDays === null ? '—' : timeToHire.avgDays,
      unit: timeToHire.isEmpty ? '' : 'ngày',
      tooltip: timeToHire.isEmpty
        ? 'Chưa có đủ dữ liệu tính thời gian tuyển dụng'
        : `Thời gian trung bình từ lúc nộp hồ sơ đến khi chấp nhận offer`
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 shrink-0">
      {cards.map((card, i) => (
        <KpiCard key={i} {...card} />
      ))}
    </div>
  )
}
