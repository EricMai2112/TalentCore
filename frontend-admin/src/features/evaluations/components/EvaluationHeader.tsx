'use client'

import React from 'react'
import { ArrowLeft, Save, Send } from 'lucide-react'
import CustomButton from '@/src/components/common/CustomButton'

export interface EvaluationHeaderProps {
  isDraft?: boolean
  isSaving: boolean
  isSubmitting: boolean
  onNavigateBack: () => void
  onSaveDraft: () => void
  onSubmitEvaluation: () => void
}

export default function EvaluationHeader({
  isDraft = false,
  isSaving,
  isSubmitting,
  onNavigateBack,
  onSaveDraft,
  onSubmitEvaluation
}: EvaluationHeaderProps) {
  return (
    <div className="bg-white/30 backdrop-blur-md border border-white/60 px-4 py-3.5 md:px-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl shadow-2xs">
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onNavigateBack}
          className="p-2 transition-all border cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-white/80 rounded-xl border-white/80 shadow-2xs bg-white/40 backdrop-blur-md"
          title="Quay lại danh sách"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Đánh giá phỏng vấn ứng viên
            </span>
            {isDraft && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                Bản nháp
              </span>
            )}
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-0.5 leading-tight">
            Chấm điểm & Quyết định tuyển dụng
          </h1>
        </div>
      </div>

      {/* Right Action Area: Header Buttons in Glass Container */}
      <div className="flex items-center gap-2 bg-white/20 p-1.5 rounded-2xl border border-white/50 backdrop-blur-sm">
        <CustomButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={onSaveDraft}
          isLoading={isSaving}
          disabled={isSaving || isSubmitting}
          icon={Save}
          className="text-xs font-bold"
        >
          Lưu nháp
        </CustomButton>

        <CustomButton
          type="button"
          variant="primary"
          size="sm"
          onClick={onSubmitEvaluation}
          isLoading={isSubmitting}
          disabled={isSaving || isSubmitting}
          icon={Send}
          className="text-xs font-extrabold"
        >
          Hoàn tất & Gửi đánh giá
        </CustomButton>
      </div>
    </div>
  )
}
