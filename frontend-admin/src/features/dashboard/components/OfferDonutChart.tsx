'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText } from 'lucide-react'
import { OfferBreakdown } from '../types/dashboard.types'
import { EmptyState } from './DashboardSkeletons'

function formatSalary(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white/95 backdrop-blur-md border border-white/80 rounded-xl shadow-lg px-2.5 py-1.5 text-[11px]">
      <span className="font-bold text-slate-800">{d.name}: </span>
      <span className="font-bold text-blue-600">{d.count}</span>
    </div>
  )
}

interface Props {
  offers: OfferBreakdown
}

export default function OfferDonutChart({ offers }: Props) {
  return (
    <div
      className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                    shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-amber-100/90 text-amber-600 border-amber-200/60">
            <FileText size={14} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight text-slate-800">
              Phân tích Offer & Lương
            </h3>
            <p className="text-[10px] text-slate-400">{offers.totalOffers} offer tổng cộng</p>
          </div>
        </div>
        {!offers.isEmpty && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            {offers.acceptanceRate}% chốt
          </span>
        )}
      </div>

      {offers.isEmpty ? (
        <EmptyState message="Chưa có dữ liệu offer" icon={<FileText size={24} />} />
      ) : (
        <div className="grid items-center flex-1 min-h-0 grid-cols-12 gap-3">
          {/* Left: Donut Chart (5/12 cols) */}
          <div className="col-span-5 h-full relative flex items-center justify-center min-h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={offers.chartData.filter((d) => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={46}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {offers.chartData
                    .filter((d) => d.count > 0)
                    .map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-black leading-none text-slate-800">
                {offers.statusCounts?.ACCEPTED || 0}
              </span>
              <span className="text-[8px] text-slate-400 font-semibold uppercase leading-tight">
                Nhận
              </span>
            </div>
          </div>

          {/* Right: Legend + Salary metrics (7/12 cols) */}
          <div className="col-span-7 flex flex-col justify-between h-full py-0.5 min-h-0 space-y-2">
            {/* Mini Legend */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {offers.chartData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="truncate text-slate-600">{item.name}</span>
                  <span className="ml-auto font-bold text-slate-800">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Salary Metric Strip */}
            {offers.salaryMetrics && (
              <div className="flex items-center justify-between p-2 border bg-slate-50/90 rounded-xl border-slate-100">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">
                    Lương TB
                  </span>
                  <span className="text-[11px] font-black text-slate-800 leading-none">
                    {formatSalary(offers.salaryMetrics.avgSalary)}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">
                    Thấp / Cao
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 leading-none">
                    {formatSalary(offers.salaryMetrics.minSalary)} -{' '}
                    {formatSalary(offers.salaryMetrics.maxSalary)}
                  </span>
                </div>
              </div>
            )}

            {/* Decline reason (Top 1) */}
            {offers.declineReasons.length > 0 && (
              <div className="text-[9.5px] text-slate-500 truncate">
                <span className="font-semibold text-slate-400">Từ chối: </span>
                <span className="font-semibold text-rose-600">
                  "{offers.declineReasons[0].reason}" ({offers.declineReasons[0].count})
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
