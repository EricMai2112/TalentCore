'use client'

import React from 'react'
import { Building2 } from 'lucide-react'
import { DepartmentFulfillment } from '../types/dashboard.types'
import { EmptyState } from './DashboardSkeletons'

function getPercentColor(pct: number) {
  if (pct >= 80)
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
      bar: 'from-emerald-500 to-teal-400'
    }
  if (pct >= 50)
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
      bar: 'from-amber-500 to-orange-400'
    }
  return {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200/80',
    bar: 'from-rose-500 to-pink-400'
  }
}

interface Props {
  departments: DepartmentFulfillment[]
}

export default function DepartmentProgressList({ departments }: Props) {
  return (
    <div
      className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                    shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-violet-100/90 text-violet-600 border-violet-200/60">
            <Building2 size={14} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight text-slate-800">Tiến độ Phòng ban</h3>
            <p className="text-[10px] text-slate-400">Chỉ tiêu nhân sự tuyển dụng</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{departments.length} phòng ban</span>
      </div>

      {departments.length === 0 ? (
        <EmptyState message="Chưa có dữ liệu phòng ban" icon={<Building2 size={24} />} />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1.5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.3)_transparent] hover:[scrollbar-color:rgba(148,163,184,0.6)_transparent]">
          {departments.map((dept) => {
            const colors = getPercentColor(dept.percentage)
            return (
              <div key={dept.id} className="group">
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-semibold text-slate-700 truncate">
                      {dept.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dept.hiredCount}/{dept.targetHeadcount}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md border ${colors.text} ${colors.bg} ${colors.border}`}
                    >
                      {dept.percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-100/90 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-500`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
