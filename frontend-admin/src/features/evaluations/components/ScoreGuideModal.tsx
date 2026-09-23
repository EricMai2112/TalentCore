'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle, X, Check, Award } from 'lucide-react'
import CustomButton from '@/src/components/common/CustomButton'

export interface ScoreGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SCORE_LEVELS = [
  {
    score: 1,
    label: '1/5 - Kém / Chưa đạt',
    badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-200/80',
    numberClass: 'bg-rose-600 text-white',
    description:
      'Ứng viên chưa đáp ứng yêu cầu tối thiểu, thiếu hụt kiến thức/kỹ năng nghiêm trọng, cần sự hướng dẫn và giám sát trực tiếp liên tục.'
  },
  {
    score: 2,
    label: '2/5 - Dưới trung bình / Cần cải thiện',
    badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-200/80',
    numberClass: 'bg-amber-500 text-white',
    description:
      'Đáp ứng được một phần yêu cầu công việc nhưng chưa thực sự ổn định, còn một số lỗ hổng kiến thức chuyên môn cần đào tạo thêm.'
  },
  {
    score: 3,
    label: '3/5 - Đạt yêu cầu / Khá',
    badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-200/80',
    numberClass: 'bg-[#3B82F6] text-white',
    description:
      'Đáp ứng đầy đủ các tiêu chí tiêu chuẩn cho vị trí tuyển dụng, có khả năng xử lý các công việc độc lập đúng tiến độ và chất lượng.'
  },
  {
    score: 4,
    label: '4/5 - Tốt / Vượt kỳ vọng',
    badgeClass: 'bg-indigo-500/10 text-indigo-700 border-indigo-200/80',
    numberClass: 'bg-indigo-600 text-white',
    description:
      'Vượt kỳ vọng cơ bản, giải quyết tốt các bài toán/tình huống phức tạp, có tư duy chủ động cao và sẵn sàng hỗ trợ thành viên khác.'
  },
  {
    score: 5,
    label: '5/5 - Rất xuất sắc / Chuyên gia',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80',
    numberClass: 'bg-emerald-600 text-white',
    description:
      'Năng lực xuất sắc cấp độ chuyên gia, am hiểu sâu sắc, có khả năng định hướng chiến lược và đóng vai trò dẫn dắt đội ngũ.'
  }
]

export default function ScoreGuideModal({ isOpen, onClose }: ScoreGuideModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg p-5 space-y-4 overflow-hidden duration-200 border shadow-2xl bg-white/95 backdrop-blur-3xl rounded-3xl border-white/80 sm:p-6 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-[#3B82F6] shadow-xs shrink-0">
              <HelpCircle size={22} className="text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Ý nghĩa Thang điểm Đánh giá</span>
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Tiêu chuẩn chấm điểm từ 1 đến 5 theo khung năng lực
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* 5 Score Level Explanations */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 [scrollbar-width:thin]">
          {SCORE_LEVELS.map((lvl) => (
            <div
              key={lvl.score}
              className="p-3 space-y-1 transition-all border bg-white/70 backdrop-blur-md border-slate-200/70 rounded-2xl hover:bg-white shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${lvl.badgeClass}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${lvl.numberClass}`}
                  >
                    {lvl.score}
                  </span>
                  <span>{lvl.label}</span>
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 leading-relaxed pt-0.5 pl-1">
                {lvl.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <CustomButton
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            icon={Check}
            className="px-5 text-xs font-extrabold"
          >
            Đã hiểu
          </CustomButton>
        </div>
      </div>
    </div>,
    document.body
  )
}
