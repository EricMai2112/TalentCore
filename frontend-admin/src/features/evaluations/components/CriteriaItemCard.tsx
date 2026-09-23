'use client'

import React from 'react'
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { CriteriaScoreItem } from '../types/evaluation.types'
import CustomTextarea from '@/src/components/common/CustomTextarea'

export interface CriteriaItemCardProps {
  item: CriteriaScoreItem
  index: number
  isExpanded: boolean
  onScoreChange: (id: string, score: number) => void
  onCommentChange: (id: string, comment: string) => void
  onToggleExpand: (id: string) => void
}

export default function CriteriaItemCard({
  item,
  index,
  isExpanded,
  onScoreChange,
  onCommentChange,
  onToggleExpand
}: CriteriaItemCardProps) {
  const itemId = item.id || (item as any)._id || `crit_${index + 1}`
  const hasComment = !!item.comment && item.comment.trim() !== ''

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'TECHNICAL':
        return 'Chuyên môn'
      case 'SOFT_SKILLS':
        return 'Kỹ năng mềm'
      case 'CULTURE_FIT':
        return 'Văn hóa & Thái độ'
      default:
        return 'Khác'
    }
  }

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'TECHNICAL':
        return 'bg-blue-500/10 text-blue-700 border-blue-200/80 shadow-2xs'
      case 'SOFT_SKILLS':
        return 'bg-purple-500/10 text-purple-700 border-purple-200/80 shadow-2xs'
      case 'CULTURE_FIT':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80 shadow-2xs'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
    }
  }

  return (
    <div className="p-3.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl sm:rounded-2xl space-y-2.5 transition-all hover:bg-white/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Inline Title & Category Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-[#3B82F6] font-bold text-[10px] flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <h4 className="text-xs font-extrabold text-slate-900">{item.name}</h4>
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${getCategoryBadgeStyle(
              item.category
            )}`}
          >
            {getCategoryLabel(item.category)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pl-7 sm:pl-0 sm:justify-end">
          {/* Interactive 1-5 Rating Number Boxes */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onScoreChange(itemId, num)}
                className={`w-8 h-8 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                  num <= item.score
                    ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-white/80 border-slate-200/90 text-slate-500 hover:bg-blue-50 hover:text-[#3B82F6] hover:border-blue-300'
                }`}
              >
                {num}
              </button>
            ))}
            <span className="ml-1 text-xs font-extrabold text-[#3B82F6] min-w-[32px] text-right">
              {item.score > 0 ? `${item.score}/5` : '--/5'}
            </span>
          </div>

          {/* Collapsible Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleExpand(itemId)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              isExpanded
                ? 'bg-blue-50 text-[#3B82F6] border-blue-200'
                : hasComment
                  ? 'bg-blue-500/10 text-blue-700 border-blue-300'
                  : 'bg-slate-100/70 text-slate-500 border-slate-200 hover:bg-slate-200/60'
            }`}
            title={isExpanded ? 'Thu gọn ghi chú' : 'Mở ghi chú'}
          >
            <MessageSquare size={12} />
            <span>{isExpanded ? 'Thu gọn' : hasComment ? 'Ghi chú' : '+ Ghi chú'}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Collapsible Double-Height Textarea */}
      {isExpanded && (
        <div className="space-y-1 duration-200 animate-in fade-in slide-in-from-top-2">
          <CustomTextarea
            placeholder="Nhập ghi chú chi tiết, bằng chứng hoặc lý do cho mức điểm của tiêu chí này..."
            rows={4}
            value={item.comment || ''}
            onChange={(e) => onCommentChange(itemId, e.target.value)}
            className="text-xs bg-white/80 !py-2 !px-3 !rounded-xl border-slate-200 focus:border-blue-400 min-h-[96px]"
          />
        </div>
      )}
    </div>
  )
}
