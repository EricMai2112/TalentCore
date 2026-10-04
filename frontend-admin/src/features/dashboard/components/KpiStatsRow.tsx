'use client'

import React from 'react'
import { Users, Briefcase, Calendar, CheckCircle2, Clock, Building2 } from 'lucide-react'
import { OverviewKpis } from '../types/dashboard.types'
import CustomSelect, { CustomSelectOption } from '@/src/components/common/CustomSelect'
import { useDepartmentsQuery } from '@/src/features/departments/hooks/useDepartmentsQuery'
import { Department } from '@/src/features/departments/types/department.types'

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
      className="relative bg-white/60 backdrop-blur-md border rounded-2xl p-2 px-2.5 
                 shadow-sm shadow-blue-500/5 hover:bg-white/80 hover:border-white/95 hover:shadow-md 
                 transition-all duration-200 overflow-hidden flex items-center gap-2.5 h-[66px] group border-white/70"
    >
      {/* Ambient Gradient Glow */}
      <div
        className={`absolute -bottom-6 -right-6 w-16 h-16 rounded-full 
                    bg-gradient-to-br ${blobGradient} blur-xl pointer-events-none 
                    opacity-40 group-hover:opacity-75 transition-opacity`}
      />

      {/* Icon Badge */}
      <div
        className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${iconBg}`}
      >
        {icon}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col justify-center flex-1 min-w-0">
        {/* Label */}
        <span className="text-[9.5px] inline-block font-bold tracking-wider text-slate-400 uppercase truncate leading-none mb-1">
          {label}
        </span>

        {/* Value + Unit */}
        <div className="flex items-baseline gap-1 leading-none">
          <span className="text-lg font-black leading-none tracking-tight truncate lg:text-xl text-slate-800">
            {value}
          </span>
          <span className="text-[10px] font-bold text-slate-500 leading-none truncate">{unit}</span>
        </div>
      </div>
    </div>
  )
}

interface Props {
  kpis: OverviewKpis
  selectedDepartment?: string
  onDepartmentChange?: (deptId: string) => void
}

export default function KpiStatsRow({
  kpis,
  selectedDepartment = '',
  onDepartmentChange
}: Props) {
  const { candidates, jobs, interviews, offers, timeToHire } = kpis
  const { data: departments = [] } = useDepartmentsQuery()

  const departmentOptions: CustomSelectOption[] = [
    { value: '', label: 'Tất cả phòng ban' },
    ...departments.map((d: Department) => ({
      value: d._id,
      label: d.name,
      subLabel: d.code
    }))
  ]

  const cards: KpiCardProps[] = [
    {
      icon: <Users size={15} className="stroke-[2.2]" />,
      iconBg: 'bg-blue-100/90 text-blue-600 border-blue-200/70',
      blobGradient: 'from-blue-500/50 via-sky-400/30 to-transparent',
      label: 'Tổng ứng viên',
      value: candidates.total.toLocaleString(),
      unit: 'hồ sơ',
      tooltip: `${candidates.newLast30Days} hồ sơ mới trong 30 ngày qua`
    },
    {
      icon: <Briefcase size={15} className="stroke-[2.2]" />,
      iconBg: 'bg-violet-100/90 text-violet-600 border-violet-200/70',
      blobGradient: 'from-violet-500/50 via-purple-400/30 to-transparent',
      label: 'JD đang mở',
      value: jobs.active,
      unit: 'vị trí',
      tooltip: `${jobs.total} tổng tin tuyển dụng trong hệ thống`
    },
    {
      icon: <Calendar size={15} className="stroke-[2.2]" />,
      iconBg: 'bg-indigo-100/90 text-indigo-600 border-indigo-200/70',
      blobGradient: 'from-indigo-500/50 via-blue-400/30 to-transparent',
      label: 'PV hôm nay',
      value: interviews.today,
      unit: 'cuộc hẹn',
      tooltip: `${interviews.pendingResults} phỏng vấn đã hoàn tất đang chờ nhập kết quả`
    },
    {
      icon: <CheckCircle2 size={15} className="stroke-[2.2]" />,
      iconBg: 'bg-emerald-100/90 text-emerald-600 border-emerald-200/70',
      blobGradient: 'from-emerald-500/50 via-teal-400/30 to-transparent',
      label: 'Tỷ lệ nhận offer',
      value: `${offers.acceptanceRate}%`,
      unit: 'chấp thuận',
      tooltip: `${offers.sent} offer đang chờ phản hồi (${offers.overdueCount} quá hạn phản hồi)`
    },
    {
      icon: <Clock size={15} className="stroke-[2.2]" />,
      iconBg: 'bg-teal-100/90 text-teal-600 border-teal-200/70',
      blobGradient: 'from-teal-500/50 via-cyan-400/30 to-transparent',
      label: 'Thời gian tuyển TB',
      value: timeToHire.isEmpty || timeToHire.avgDays === null ? '—' : timeToHire.avgDays,
      unit: timeToHire.isEmpty ? '' : 'ngày',
      tooltip: timeToHire.isEmpty
        ? 'Chưa có đủ dữ liệu tính thời gian tuyển dụng'
        : 'Thời gian trung bình từ lúc nộp hồ sơ đến khi chấp nhận offer'
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,0.85fr)] gap-2.5 shrink-0 items-stretch">
      {cards.map((card, i) => (
        <KpiCard key={i} {...card} />
      ))}

      {/* 6th Column: Compact Department Filter */}
      <div
        className="relative bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-2 px-2.5 
                   shadow-sm shadow-blue-500/5 hover:bg-white/80 hover:border-white/95 transition-all duration-200 
                   flex flex-col justify-center h-[66px] col-span-2 sm:col-span-1 lg:col-span-1 group"
      >
        <div className="flex items-center gap-1.5 mb-1 px-0.5">
          <Building2 size={11} className="text-blue-600 shrink-0 stroke-[2.2]" />
          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase truncate">
            Phòng ban
          </span>
        </div>
        <CustomSelect
          size="sm"
          align="right"
          value={selectedDepartment}
          onChange={(val) => onDepartmentChange?.(val)}
          options={departmentOptions}
          placeholder="Tất cả phòng ban"
          className="w-full"
        />
      </div>
    </div>
  )
}
