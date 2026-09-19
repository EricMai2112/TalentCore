'use client'

import { Info } from 'lucide-react'
import { Position } from '../types/job-description.types'

interface CriteriaBenchmarkHintProps {
  position?: Position | null
  positionTitle?: string
  totalCriteriaCount: number
}

export default function CriteriaBenchmarkHint({
  position,
  positionTitle,
  totalCriteriaCount
}: CriteriaBenchmarkHintProps) {
  if (totalCriteriaCount === 0) return null

  const titleToShow = position
    ? typeof position === 'object'
      ? position.name
      : position
    : positionTitle || 'Vị trí này'

  return (
    <div className="p-3.5 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-2xl flex items-start gap-3 text-xs text-slate-800 shadow-2xs">
      <div className="p-1.5 bg-[#3B82F6]/15 text-[#3B82F6] rounded-xl shrink-0 mt-0.5">
        <Info size={16} />
      </div>
      <div className="space-y-0.5">
        <span className="font-extrabold uppercase tracking-wider block text-[#3B82F6] text-[11px]">
          Gợi ý chuẩn Tham chiếu
        </span>
        <p className="text-slate-600 text-xs leading-relaxed font-medium">
          Đối với vị trí <strong className="text-slate-900 font-bold">{titleToShow}</strong>:
          Thường dành <strong className="text-rose-600 font-bold">50% - 70% tổng trọng số</strong>{' '}
          cho nhóm tiêu chí <span className="text-rose-600 font-bold">🔴 Bắt buộc</span>,{' '}
          <strong className="text-[#3B82F6] font-bold">20% - 35%</strong> cho nhóm{' '}
          <span className="text-[#3B82F6] font-bold">🔵 Ưu tiên</span> và phần còn lại cho tiêu chí.
        </p>
      </div>
    </div>
  )
}
