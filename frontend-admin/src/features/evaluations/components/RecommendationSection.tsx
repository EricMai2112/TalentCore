'use client'

import React from 'react'
import { CheckCircle2, FileText } from 'lucide-react'
import { RecommendationType } from '../types/evaluation.types'
import CustomTextarea from '@/src/components/common/CustomTextarea'

export interface RecommendationSectionProps {
  recommendation?: RecommendationType
  generalFeedback: string
  onRecommendationChange: (val: RecommendationType) => void
  onGeneralFeedbackChange: (val: string) => void
}

export const RECOMMENDATION_OPTIONS: {
  type: RecommendationType
  label: string
  description: string
  activeClass: string
}[] = [
  {
    type: 'STRONG_HIRE',
    label: 'Đề xuất nhận ngay (Strong Hire)',
    description: 'Ứng viên xuất sắc, đáp ứng vượt trội mọi tiêu chí chuyên môn & văn hóa.',
    activeClass:
      'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-950 font-bold'
  },
  {
    type: 'HIRE',
    label: 'Đồng ý nhận (Hire)',
    description: 'Ứng viên tốt, đạt tiêu chí yêu cầu cho vị trí.',
    activeClass:
      'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/40 text-blue-950 font-bold'
  },
  {
    type: 'CONSIDER',
    label: 'Cân nhắc thêm (Consider)',
    description: 'Đạt một số tiêu chí nhưng có một vài điểm lưu ý, cần xem xét thêm.',
    activeClass:
      'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40 text-amber-950 font-bold'
  },
  {
    type: 'NO_HIRE',
    label: 'Từ chối (No Hire)',
    description: 'Ứng viên không phù hợp với yêu cầu tuyển dụng của vị trí.',
    activeClass:
      'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/40 text-rose-950 font-bold'
  }
]

export default function RecommendationSection({
  recommendation,
  generalFeedback,
  onRecommendationChange,
  onGeneralFeedbackChange
}: RecommendationSectionProps) {
  return (
    <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-20 self-start">
      {/* Recommendation Selection Glass Card */}
      <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg shadow-blue-500/5 rounded-2xl md:rounded-3xl space-y-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Đề xuất kết quả (Recommendation)</span>
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            Lựa chọn quyết định tuyển dụng của người phỏng vấn
          </p>
        </div>

        <div className="space-y-2 pt-0.5">
          {RECOMMENDATION_OPTIONS.map((opt) => {
            const isSelected = recommendation === opt.type
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => onRecommendationChange(opt.type)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden space-y-0.5 ${
                  isSelected
                    ? opt.activeClass
                    : 'bg-white/60 border-slate-200/70 hover:bg-white/90 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold block">{opt.label}</span>
                  {isSelected && <CheckCircle2 size={14} className="text-current shrink-0" />}
                </div>
                <p className="text-[11px] font-medium opacity-85 leading-tight">
                  {opt.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* General Feedback & Summary Notes */}
      <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg shadow-blue-500/5 rounded-2xl md:rounded-3xl space-y-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-[#3B82F6]" />
            <span>Nhận xét chung (General Feedback)</span>
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            Ghi chú hoặc thông điệp gửi tới bộ phận Tuyển dụng / HR
          </p>
        </div>

        <CustomTextarea
          placeholder="Nhập nhận xét tổng quan về buổi phỏng vấn, đề xuất mức lương hoặc ghi chú thêm cho HR..."
          rows={4}
          value={generalFeedback}
          onChange={(e) => onGeneralFeedbackChange(e.target.value)}
          className="text-xs bg-white/70 !rounded-xl min-h-[96px]"
        />
      </div>
    </div>
  )
}
