'use client'

import React, { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { CriteriaScoreItem } from '../types/evaluation.types'
import CriteriaItemCard from './CriteriaItemCard'
import ScoreGuideModal from './ScoreGuideModal'

export interface CriteriaEvaluationListProps {
  criteriaScores: CriteriaScoreItem[]
  expandedNoteIds: Record<string, boolean>
  onScoreChange: (id: string, score: number) => void
  onCommentChange: (id: string, comment: string) => void
  onToggleExpand: (id: string) => void
}

export default function CriteriaEvaluationList({
  criteriaScores,
  expandedNoteIds,
  onScoreChange,
  onCommentChange,
  onToggleExpand
}: CriteriaEvaluationListProps) {
  const [showScoreGuideModal, setShowScoreGuideModal] = useState(false)

  const ratedCount = criteriaScores.filter((c) => c.score > 0).length

  return (
    <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-500/5 rounded-2xl md:rounded-3xl space-y-4">
      {/* Header with Help Question Icon */}
      <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            {/* Help Question Icon Button with gentle pulse animation */}
            <button
              type="button"
              onClick={() => setShowScoreGuideModal(true)}
              className="relative p-1 rounded-xl bg-blue-50 text-[#3B82F6] hover:bg-blue-100 hover:text-blue-700 transition-all cursor-pointer border border-blue-200/80 shadow-2xs flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 group"
              title="Xem giải thích ý nghĩa thang điểm (Behavioral Anchors)"
            >
              <span className="absolute inset-0 rounded-xl bg-blue-400/25 animate-pulse pointer-events-none" />
              <HelpCircle size={17} className="animate-pulse relative z-10" />
            </button>
            <span>Bộ tiêu chí đánh giá năng lực</span>
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Chấm điểm từ 1 đến 5 theo từng hạng mục chuyên môn & kỹ năng (nhấn icon{' '}
            <span
              onClick={() => setShowScoreGuideModal(true)}
              className="text-[#3B82F6] underline cursor-pointer font-bold"
            >
              [?]
            </span>{' '}
            để xem hướng dẫn)
          </p>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
          {ratedCount} / {criteriaScores.length} đã chấm
        </span>
      </div>

      {/* Criteria Items List */}
      <div className="space-y-3">
        {criteriaScores.map((item, idx) => {
          const itemId = item.id || (item as any)._id || `crit_${idx + 1}`
          return (
            <CriteriaItemCard
              key={itemId}
              item={item}
              index={idx}
              isExpanded={!!expandedNoteIds[itemId]}
              onScoreChange={onScoreChange}
              onCommentChange={onCommentChange}
              onToggleExpand={onToggleExpand}
            />
          )
        })}
      </div>

      {/* Behavioral Anchors Score Guide Modal */}
      <ScoreGuideModal
        isOpen={showScoreGuideModal}
        onClose={() => setShowScoreGuideModal(false)}
      />
    </div>
  )
}
