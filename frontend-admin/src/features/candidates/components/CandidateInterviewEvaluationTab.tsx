'use client'

import React, { useState, useEffect } from 'react'
import {
  Loader2,
  Award,
  Star,
  CheckCircle2,
  FileText,
  User as UserIcon,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import {
  InterviewEvaluationData,
  RecommendationType,
  CriteriaScoreItem
} from '@/src/features/evaluations/types/evaluation.types'
import { evaluationsApi } from '@/src/features/evaluations/services/evaluations.api'
import { interviewsApi } from '@/src/features/interviews/services/interviews.api'
import { InterviewItem } from '@/src/features/interviews/types/interview.types'

interface CandidateInterviewEvaluationTabProps {
  applicationId?: string
  interview?: InterviewItem | null
}

const RECOMMENDATION_LABELS: Record<
  RecommendationType,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  STRONG_HIRE: {
    label: 'Đề xuất nhận ngay (Strong Hire)',
    bgClass: 'bg-emerald-500/15',
    textClass: 'text-emerald-800 font-extrabold',
    borderClass: 'border-emerald-500/40'
  },
  HIRE: {
    label: 'Đồng ý nhận (Hire)',
    bgClass: 'bg-blue-500/15',
    textClass: 'text-blue-800 font-extrabold',
    borderClass: 'border-blue-500/40'
  },
  CONSIDER: {
    label: 'Cân nhắc thêm (Consider)',
    bgClass: 'bg-amber-500/15',
    textClass: 'text-amber-800 font-extrabold',
    borderClass: 'border-amber-500/40'
  },
  NO_HIRE: {
    label: 'Từ chối (No Hire)',
    bgClass: 'bg-rose-500/15',
    textClass: 'text-rose-800 font-extrabold',
    borderClass: 'border-rose-500/40'
  }
}

export function CandidateInterviewEvaluationTab({
  applicationId,
  interview: initialInterview
}: CandidateInterviewEvaluationTabProps) {
  const [evaluation, setEvaluation] = useState<InterviewEvaluationData | null>(null)
  const [interview, setInterview] = useState<InterviewItem | null>(initialInterview || null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const loadEvaluationData = async () => {
      setIsLoading(true)
      try {
        let currentInterview = initialInterview || null

        // If interview prop is not passed, fetch interview by applicationId
        if (!currentInterview && applicationId) {
          currentInterview = await interviewsApi.getInterviewByApplicationId(applicationId)
          if (isMounted) setInterview(currentInterview)
        }

        if (currentInterview?._id) {
          const evalData = await evaluationsApi.getEvaluationByInterviewId(currentInterview._id)
          if (isMounted) setEvaluation(evalData)
        }
      } catch (err) {
        console.error('Lỗi khi tải kết quả đánh giá phỏng vấn:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadEvaluationData()

    return () => {
      isMounted = false
    }
  }, [applicationId, initialInterview])

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl">
        <Loader2 size={32} className="animate-spin text-[#3B82F6] mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Đang tải đánh giá phỏng vấn...</p>
      </div>
    )
  }

  // Empty state if no evaluation found or if it is an unsubmitted draft
  if (!evaluation || !evaluation.criteriaScores || evaluation.criteriaScores.length === 0) {
    return (
      <div className="p-8 py-12 text-center bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-500/5 rounded-2xl md:rounded-3xl space-y-3.5">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-[#3B82F6] border border-blue-200/80 flex items-center justify-center mx-auto shadow-2xs">
          <ClipboardCheck size={28} />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h4 className="text-sm font-extrabold text-slate-900">Chưa có đánh giá phỏng vấn</h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Người phỏng vấn chưa hoàn tất phiếu đánh giá năng lực cho ứng viên này. Kết quả sẽ tự động hiển thị tại đây khi phiếu đánh giá được hoàn tất.
          </p>
        </div>
      </div>
    )
  }

  const interviewerObj = evaluation.interviewerId
  const interviewerName =
    typeof interviewerObj === 'object'
      ? interviewerObj?.name || interviewerObj?.email
      : typeof interview?.interviewerId === 'object'
      ? interview.interviewerId?.name
      : 'Người phỏng vấn'

  const overallScore = evaluation.overallScore || 0
  const recConfig = evaluation.recommendation ? RECOMMENDATION_LABELS[evaluation.recommendation] : null

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
        return 'bg-blue-500/10 text-blue-700 border-blue-200/80'
      case 'SOFT_SKILLS':
        return 'bg-purple-500/10 text-purple-700 border-purple-200/80'
      case 'CULTURE_FIT':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Overall Score & Recommendation Glass Banner */}
      <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-500/5 rounded-2xl md:rounded-3xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left Summary Info */}
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 inline-flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 size={13} className="text-[#3B82F6]" />
                Đánh giá chính thức
              </span>
              {evaluation.updatedAt && (
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {new Date(evaluation.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <UserIcon size={14} className="text-slate-400 shrink-0" />
              <span>
                Người phỏng vấn: <strong className="text-slate-900 font-bold">{interviewerName}</strong>
              </span>
            </div>

            {/* Recommendation Result Highlight */}
            {recConfig && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${recConfig.bgClass} ${recConfig.borderClass}`}
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Đề xuất tuyển dụng
                  </span>
                  <span className={`text-xs ${recConfig.textClass}`}>{recConfig.label}</span>
                </div>
                <CheckCircle2 size={18} className="text-current shrink-0" />
              </div>
            )}
          </div>

          {/* Right Solid Gradient Overall Score Card */}
          <div className="md:col-span-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-4 text-center shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center relative overflow-hidden border border-white/20">
            <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-blue-100/90 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20">
              <Award size={12} className="text-amber-300" />
              <span>Điểm Phỏng vấn</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-3xl font-black tracking-tight text-white drop-shadow-xs">
                {overallScore > 0 ? overallScore : '--'}
              </span>
              <span className="text-xs font-extrabold text-blue-200">/ 5.0</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={`${
                    star <= Math.round(overallScore)
                      ? 'fill-amber-300 text-amber-300'
                      : 'text-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Criteria Evaluation Breakdown List (Read-Only) */}
      <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-500/5 rounded-2xl md:rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-[#3B82F6]" />
            <span>Kết quả đánh giá tiêu chí năng lực</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            {evaluation.criteriaScores.filter((c) => c.score > 0).length} / {evaluation.criteriaScores.length} tiêu chí
          </span>
        </div>

        <div className="space-y-3">
          {evaluation.criteriaScores.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl space-y-2.5 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#3B82F6] font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
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

                {/* Read-Only 1-5 Score Display */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span
                      key={num}
                      className={`w-7 h-7 rounded-xl border text-[11px] font-extrabold flex items-center justify-center ${
                        num <= item.score
                          ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-2xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-400 opacity-60'
                      }`}
                    >
                      {num}
                    </span>
                  ))}
                  <span className="ml-1 text-xs font-extrabold text-[#3B82F6] min-w-[28px] text-right">
                    {item.score}/5
                  </span>
                </div>
              </div>

              {/* Comment / Note text */}
              {item.comment && item.comment.trim() !== '' && (
                <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                  <MessageSquare size={13} className="text-[#3B82F6] shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{item.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. General Feedback Read-Only Card */}
      {evaluation.generalFeedback && evaluation.generalFeedback.trim() !== '' && (
        <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-500/5 rounded-2xl md:rounded-3xl space-y-2.5">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-[#3B82F6]" />
            <span>Nhận xét chung từ Người phỏng vấn</span>
          </h3>
          <div className="p-3.5 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium">
            {evaluation.generalFeedback}
          </div>
        </div>
      )}
    </div>
  )
}
