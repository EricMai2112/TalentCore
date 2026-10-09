'use client'

import React from 'react'
import { Gauge, Clock, Award, TrendingUp, Zap } from 'lucide-react'
import { HiringVelocityMetrics } from '../types/dashboard.types'
import { EmptyState } from './DashboardSkeletons'

interface Props {
  velocity?: HiringVelocityMetrics
}

interface SlaBulletItem {
  id: string
  name: string
  icon: React.ReactNode
  iconBg: string
  actualStr: string
  targetStr: string
  badgeText: string
  badgeType: 'success' | 'warning' | 'purple'
  percentFill: number
  percentTarget: number
  barGradient: string
  tooltip: string
}

export default function HiringVelocityPanel({ velocity }: Props) {
  if (!velocity) {
    return (
      <div className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100/90 text-blue-600 border border-blue-200/60 flex items-center justify-center">
            <Gauge size={14} className="stroke-[2.2]" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Hiệu suất Tuyển dụng & SLA</h3>
        </div>
        <EmptyState message="Đang cập nhật chỉ số SLA..." icon={<Gauge size={24} />} />
      </div>
    )
  }

  const { timeToHire, interviewPassRate, offerAcceptanceRate, screeningSpeed } = velocity

  // 1. Time-to-Hire (ngày)
  const avgTth = timeToHire.avgDays || 18
  const targetTth = timeToHire.targetDays || 25
  const isTthMet = avgTth <= targetTth
  const tthDiff = Math.abs(targetTth - avgTth)
  const maxTthScale = 35 // thang đo 35 ngày
  const tthFill = Math.min(100, Math.round((avgTth / maxTthScale) * 100))
  const tthTarget = Math.round((targetTth / maxTthScale) * 100)

  // 2. Sàng lọc CV (ngày)
  const avgScreening = screeningSpeed.avgDays
  const targetScreening = screeningSpeed.targetDays
  const isScreeningMet = avgScreening <= targetScreening
  const screeningDiff = Math.round(Math.abs(avgScreening - targetScreening) * 10) / 10
  const maxScreeningScale = 12 // thang đo 12 ngày
  const screeningFill = Math.min(100, Math.round((avgScreening / maxScreeningScale) * 100))
  const screeningTarget = Math.round((targetScreening / maxScreeningScale) * 100)

  // 3. Chấp nhận Offer (%)
  const offerRate = offerAcceptanceRate.rate
  const targetOffer = offerAcceptanceRate.targetRate || 80
  const isOfferMet = offerRate >= targetOffer

  // 4. Đậu Phỏng vấn (%)
  const passRate = interviewPassRate.rate
  const targetPass = 60 // Benchmark chuẩn thị trường
  const isPassMet = passRate >= targetPass

  // Đếm số chỉ số đạt chuẩn
  const metCount = [isTthMet, isScreeningMet, isOfferMet, isPassMet].filter(Boolean).length
  const isOverallGood = metCount >= 3

  const items: SlaBulletItem[] = [
    {
      id: 'tth',
      name: 'Thời gian tuyển',
      icon: <Clock size={12} />,
      iconBg: 'bg-blue-100/90 text-blue-600 border border-blue-200/60',
      actualStr: `${avgTth} ngày`,
      targetStr: `Mục tiêu ≤${targetTth}d`,
      badgeText: isTthMet ? `-${tthDiff}d (Đạt SLA)` : `+${tthDiff}d (Chậm)`,
      badgeType: isTthMet ? 'success' : 'warning',
      percentFill: tthFill,
      percentTarget: tthTarget,
      barGradient: isTthMet
        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
        : 'bg-gradient-to-r from-rose-500 to-red-600',
      tooltip: `Thực tế: ${avgTth} ngày (Chuẩn SLA: ≤ ${targetTth} ngày)`
    },
    {
      id: 'screening',
      name: 'Tốc độ sàng lọc CV',
      icon: <Zap size={12} />,
      iconBg: isScreeningMet
        ? 'bg-indigo-100/90 text-indigo-600 border border-indigo-200/60'
        : 'bg-amber-100/90 text-amber-600 border border-amber-200/60',
      actualStr: `${avgScreening} ngày`,
      targetStr: `Mục tiêu ≤${targetScreening}d`,
      badgeText: isScreeningMet ? 'Đạt chuẩn' : `+${screeningDiff}d (Vượt SLA)`,
      badgeType: isScreeningMet ? 'success' : 'warning',
      percentFill: screeningFill,
      percentTarget: screeningTarget,
      barGradient: isScreeningMet
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
        : 'bg-gradient-to-r from-amber-400 to-orange-500',
      tooltip: `Thực tế: ${avgScreening} ngày (Chuẩn SLA: ≤ ${targetScreening} ngày)`
    },
    {
      id: 'offer',
      name: 'Tỷ lệ chấp nhận Offer',
      icon: <TrendingUp size={12} />,
      iconBg: 'bg-emerald-100/90 text-emerald-600 border border-emerald-200/60',
      actualStr: `${offerRate}%`,
      targetStr: `Mục tiêu ≥${targetOffer}%`,
      badgeText: isOfferMet ? 'Đạt SLA' : `Thiếu ${targetOffer - offerRate}%`,
      badgeType: isOfferMet ? 'success' : 'warning',
      percentFill: Math.min(100, offerRate),
      percentTarget: targetOffer,
      barGradient: isOfferMet
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
        : 'bg-gradient-to-r from-amber-400 to-orange-500',
      tooltip: `Thực tế: ${offerRate}% (Mục tiêu SLA: ≥ ${targetOffer}%)`
    },
    {
      id: 'pass',
      name: 'Tỷ lệ đậu Phỏng vấn',
      icon: <Award size={12} />,
      iconBg: 'bg-purple-100/90 text-purple-600 border border-purple-200/60',
      actualStr: `${passRate}%`,
      targetStr: `${interviewPassRate.passedCount}/${interviewPassRate.totalDecided} đạt vòng`,
      badgeText: passRate >= 80 ? 'Rất tốt' : 'Bình thường',
      badgeType: 'purple',
      percentFill: Math.min(100, passRate),
      percentTarget: targetPass,
      barGradient: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      tooltip: `Đậu ${interviewPassRate.passedCount}/${interviewPassRate.totalDecided} lượt phỏng vấn (${passRate}%)`
    }
  ]

  return (
    <div className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0 justify-between">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100/90 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
            <Gauge size={14} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-800 leading-tight tracking-tight truncate">
              Hiệu suất Tuyển dụng & SLA
            </h3>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              Tiến độ thực tế so với mục tiêu cam kết
            </p>
          </div>
        </div>

        {/* Tổng kết trạng thái SLA */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs border shrink-0 ${
            isOverallGood
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : 'bg-amber-50 text-amber-700 border-amber-200/80'
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOverallGood ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                isOverallGood ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span>Đạt SLA {metCount}/4</span>
        </span>
      </div>

      {/* ─── 4 Horizontal SLA Bullet Bars ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-around py-0.5 min-h-0 gap-1.5">
        {items.map((item) => {
          const badgeCls =
            item.badgeType === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : item.badgeType === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                : 'bg-purple-50 text-purple-700 border-purple-200/80'

          return (
            <div
              key={item.id}
              className="p-1 px-1.5 rounded-xl hover:bg-white/70 transition-colors group"
              title={item.tooltip}
            >
              {/* Row 1: Label & Values */}
              <div className="flex items-center justify-between text-[11px] mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 ${item.iconBg}`}
                  >
                    {item.icon}
                  </div>
                  <span className="font-semibold text-slate-700 text-[11px] truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[11px] font-bold text-slate-800">
                    {item.actualStr}{' '}
                    <span className="text-[10px] font-medium text-slate-400">
                      ({item.targetStr})
                    </span>
                  </span>
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md border shrink-0 ${badgeCls}`}
                  >
                    {item.badgeText}
                  </span>
                </div>
              </div>

              {/* Row 2: Bullet Progress Bar with Target SLA Marker */}
              <div className="relative w-full h-2 bg-slate-100/90 rounded-full overflow-hidden">
                {/* Thanh tiến độ thực tế */}
                <div
                  className={`h-full rounded-full transition-all duration-700 ${item.barGradient}`}
                  style={{ width: `${item.percentFill}%` }}
                />

                {/* Vạch mốc chuẩn SLA Target */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-slate-600/90 z-10 shadow-2xs"
                  style={{ left: `${item.percentTarget}%` }}
                  title={`Mốc SLA: ${item.targetStr}`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Bottom Legend ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/90 shrink-0 mt-0.5 text-[9.5px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span>Thực tế đạt được</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <span className="w-0.5 h-2.5 bg-slate-600 rounded-full shrink-0" />
            <span>Mốc SLA chuẩn</span>
          </div>
        </div>

        <span className="text-slate-400 font-medium hidden sm:inline">
          {isOverallGood ? 'Chỉ số vận hành ổn định' : 'Cần tối ưu thời gian lọc CV'}
        </span>
      </div>
    </div>
  )
}
