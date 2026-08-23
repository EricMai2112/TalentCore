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
    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3 text-xs text-indigo-900 shadow-2xs">
      <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-xl shrink-0 mt-0.5">
        <Info size={16} />
      </div>
      <div className="space-y-1">
        <span className="font-extrabold uppercase tracking-wider block text-indigo-800">
          Gợi ý chuẩn Tham chiếu (Benchmark Reference)
        </span>
        <p className="text-slate-600 leading-relaxed">
          Đối với vị trí <strong className="text-indigo-950 font-bold">{titleToShow}</strong>:
          Thường dành <strong className="text-rose-700 font-bold">50% - 70% tổng trọng số</strong>{' '}
          cho nhóm tiêu chí <span className="text-rose-700 font-bold">🔴 Bắt buộc</span>,{' '}
          <strong className="text-blue-700 font-bold">20% - 35%</strong> cho nhóm{' '}
          <span className="text-blue-700 font-bold">🔵 Ưu tiên</span> và phần còn lại cho tiêu chí.
        </p>
      </div>
    </div>
  )
}
