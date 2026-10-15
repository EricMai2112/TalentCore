'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'
import {
  CriteriaScoreItem,
  InterviewEvaluationData,
  RecommendationType,
  DEFAULT_EVALUATION_CRITERIA
} from '../types/evaluation.types'
import { evaluationsApi } from '../services/evaluations.api'
import { interviewsApi } from '@/src/features/interviews/services/interviews.api'
import { InterviewItem } from '@/src/features/interviews/types/interview.types'
import CustomButton from '@/src/components/common/CustomButton'
import EvaluationHeader from './EvaluationHeader'
import CandidateOverviewBanner from './CandidateOverviewBanner'
import CriteriaEvaluationList from './CriteriaEvaluationList'
import RecommendationSection from './RecommendationSection'
import UnsavedChangesModal from './UnsavedChangesModal'

interface CandidateEvaluationViewProps {
  interview?: InterviewItem | null
  initialEvaluation?: InterviewEvaluationData | null
  interviewId?: string
}

export default function CandidateEvaluationView({
  interview: initialInterviewProp,
  initialEvaluation: initialEvalProp,
  interviewId
}: CandidateEvaluationViewProps) {
  const router = useRouter()

  // Internal data loading state if interviewId is provided
  const [interview, setInterview] = useState<InterviewItem | null>(initialInterviewProp || null)
  const [initialEval, setInitialEval] = useState<InterviewEvaluationData | null>(
    initialEvalProp || null
  )
  const [isLoadingData, setIsLoadingData] = useState<boolean>(
    !initialInterviewProp && !!interviewId
  )
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Toast Notification State
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type })
  }

  // Evaluation Form State
  const [criteriaScores, setCriteriaScores] = useState<CriteriaScoreItem[]>(
    DEFAULT_EVALUATION_CRITERIA.map((c, i) => ({
      ...c,
      id: c.id || `crit_${i + 1}`
    }))
  )
  const [recommendation, setRecommendation] = useState<RecommendationType | undefined>('CONSIDER')
  const [generalFeedback, setGeneralFeedback] = useState<string>('')

  // Collapsible note textareas map per criteria item
  const [expandedNoteIds, setExpandedNoteIds] = useState<Record<string, boolean>>({})

  const toggleNoteExpand = (id: string) => {
    setExpandedNoteIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingTargetUrl, setPendingTargetUrl] = useState<string | null>(null)

  // Sync state from initial evaluation
  const syncFormState = (evalData?: InterviewEvaluationData | null) => {
    if (evalData) {
      if (evalData.criteriaScores && evalData.criteriaScores.length > 0) {
        const normalizedScores = evalData.criteriaScores.map((c, i) => ({
          ...c,
          id: c.id || (c as any)._id || `crit_${i + 1}`
        }))
        setCriteriaScores(normalizedScores)

        // Expand notes if comment exists
        const initialExpanded: Record<string, boolean> = {}
        normalizedScores.forEach((c) => {
          if (c.comment && c.comment.trim() !== '') {
            initialExpanded[c.id] = true
          }
        })
        setExpandedNoteIds(initialExpanded)
      }
      if (evalData.recommendation) setRecommendation(evalData.recommendation)
      if (evalData.generalFeedback) setGeneralFeedback(evalData.generalFeedback)
    }
  }

  // Fetch interview and evaluation data if only interviewId was passed
  useEffect(() => {
    if (initialInterviewProp) {
      setInterview(initialInterviewProp)
      if (initialEvalProp) {
        setInitialEval(initialEvalProp)
        syncFormState(initialEvalProp)
      }
      return
    }

    if (!interviewId) return

    const loadAllData = async () => {
      setIsLoadingData(true)
      setFetchError(null)
      try {
        const [interviewData, evaluationData] = await Promise.all([
          interviewsApi.getInterviewById(interviewId),
          evaluationsApi.getEvaluationByInterviewId(interviewId)
        ])

        if (!interviewData) {
          setFetchError('Không tìm thấy thông tin lịch phỏng vấn.')
        } else {
          setInterview(interviewData)
          setInitialEval(evaluationData)
          syncFormState(evaluationData)
        }
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu phỏng vấn:', err)
        setFetchError(err?.message || 'Có lỗi xảy ra khi tải dữ liệu phỏng vấn.')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadAllData()
  }, [interviewId, initialInterviewProp, initialEvalProp])

  // Calculate Weighted Overall Score (out of 5.0)
  const overallScore = useMemo(() => {
    let totalWeight = 0
    let weightedSum = 0
    for (const item of criteriaScores) {
      if (item.score > 0) {
        const w = item.weight || 1
        weightedSum += item.score * w
        totalWeight += w
      }
    }
    if (totalWeight === 0) return 0
    return parseFloat((weightedSum / totalWeight).toFixed(1))
  }, [criteriaScores])

  // Mark form as dirty when fields change
  const handleCriteriaScoreChange = (id: string, score: number) => {
    setCriteriaScores((prev) =>
      prev.map((item, idx) => {
        const itemId = item.id || (item as any)._id || `crit_${idx + 1}`
        return itemId === id ? { ...item, score } : item
      })
    )
    setIsDirty(true)
  }

  const handleCriteriaCommentChange = (id: string, comment: string) => {
    setCriteriaScores((prev) =>
      prev.map((item, idx) => {
        const itemId = item.id || (item as any)._id || `crit_${idx + 1}`
        return itemId === id ? { ...item, comment } : item
      })
    )
    setIsDirty(true)
  }

  const handleRecommendationChange = (val: RecommendationType) => {
    setRecommendation(val)
    setIsDirty(true)
  }

  const handleGeneralFeedbackChange = (val: string) => {
    setGeneralFeedback(val)
    setIsDirty(true)
  }

  // Unsaved Changes Warning Interception (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  // Intercept inner links click if form is dirty
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!isDirty) return
      const target = (e.target as HTMLElement).closest('a')
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const url = target.getAttribute('href')
        if (url && url !== window.location.pathname) {
          e.preventDefault()
          setPendingTargetUrl(url)
          setShowUnsavedModal(true)
        }
      }
    }
    document.addEventListener('click', handleAnchorClick, true)
    return () => {
      document.removeEventListener('click', handleAnchorClick, true)
    }
  }, [isDirty])

  const handleNavigateBack = () => {
    if (isDirty) {
      setPendingTargetUrl('/interviews')
      setShowUnsavedModal(true)
    } else {
      router.push('/interviews')
    }
  }

  const handleConfirmLeave = () => {
    setShowUnsavedModal(false)
    setIsDirty(false)
    if (pendingTargetUrl) {
      router.push(pendingTargetUrl)
    } else {
      router.push('/interviews')
    }
  }

  // Save Draft Handler
  const handleSaveDraft = async () => {
    if (!interview?._id) return
    setIsSaving(true)
    try {
      await evaluationsApi.saveEvaluation(interview._id, {
        isDraft: true,
        criteriaScores,
        overallScore,
        recommendation,
        generalFeedback
      })
      setIsDirty(false)
      showToast('Đã lưu nháp đánh giá thành công!', 'success')
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || err?.message || 'Lỗi khi lưu bản nháp đánh giá',
        'error'
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Final Submit Handler
  const handleSubmitEvaluation = async () => {
    if (!interview?._id) return

    const unrated = criteriaScores.filter((c) => c.score === 0)
    if (unrated.length > 0) {
      if (
        !window.confirm(
          `Vẫn còn ${unrated.length} tiêu chí chưa chấm điểm. Bạn có muốn tiếp tục nộp đánh giá?`
        )
      ) {
        return
      }
    }

    if (!recommendation) {
      showToast('Vui lòng chọn đề xuất kết quả phỏng vấn (Recommendation).', 'warning')
      return
    }

    setIsSubmitting(true)
    try {
      await evaluationsApi.saveEvaluation(interview._id, {
        isDraft: false,
        criteriaScores,
        overallScore,
        recommendation,
        generalFeedback
      })
      setIsDirty(false)
      showToast('Đã gửi đánh giá phỏng vấn chính thức thành công!', 'success')
      setTimeout(() => {
        router.push('/interviews')
      }, 1200)
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || err?.message || 'Lỗi khi nộp đánh giá phỏng vấn',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="py-24 space-y-4 text-center">
        <Loader2 size={36} className="animate-spin text-[#3B82F6] mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Đang tải trang đánh giá phỏng vấn...</p>
      </div>
    )
  }

  if (fetchError || !interview) {
    return (
      <div className="max-w-md p-8 py-16 mx-auto space-y-4 text-center border shadow-xl bg-white/40 border-white/60 rounded-3xl">
        <div className="p-3 mx-auto text-xs font-bold bg-rose-100 text-rose-600 rounded-2xl w-fit">
          {fetchError || 'Lịch phỏng vấn không tồn tại'}
        </div>
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => router.push('/interviews')}
          className="text-white bg-slate-900 hover:bg-slate-800"
        >
          Quay lại danh sách
        </CustomButton>
      </div>
    )
  }

  return (
    <div className="relative w-full pb-8 space-y-4 animate-fade-in">
      {/* Toast Notification Floating Banner */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-4 backdrop-blur-xl ${
            toast.type === 'success'
              ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-600/30'
              : toast.type === 'warning'
                ? 'bg-amber-600/95 text-white border-amber-400 shadow-amber-600/30'
                : 'bg-rose-600/95 text-white border-rose-400 shadow-rose-600/30'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} className="text-white shrink-0" />}
          {toast.type === 'warning' && <AlertCircle size={18} className="text-white shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={18} className="text-white shrink-0" />}
          <span className="leading-tight">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 ml-2 transition-colors rounded-lg cursor-pointer hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sticky Header Group: Header Glass Card + Candidate Overview Banner */}
      <EvaluationHeader
        isDraft={initialEval?.isDraft}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        onNavigateBack={handleNavigateBack}
        onSaveDraft={handleSaveDraft}
        onSubmitEvaluation={handleSubmitEvaluation}
      />

      <CandidateOverviewBanner interview={interview} overallScore={overallScore} />

      {/* Main Form Content: 2-Column Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column (8 cols): Criteria Scores List */}
        <div className="lg:col-span-8">
          <CriteriaEvaluationList
            criteriaScores={criteriaScores}
            expandedNoteIds={expandedNoteIds}
            onScoreChange={handleCriteriaScoreChange}
            onCommentChange={handleCriteriaCommentChange}
            onToggleExpand={toggleNoteExpand}
          />
        </div>

        {/* Right Column (4 cols): Recommendation Selector & General Feedback */}
        <RecommendationSection
          recommendation={recommendation}
          generalFeedback={generalFeedback}
          onRecommendationChange={handleRecommendationChange}
          onGeneralFeedbackChange={handleGeneralFeedbackChange}
        />
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onConfirmLeave={handleConfirmLeave}
        onCancel={() => {
          setShowUnsavedModal(false)
          setPendingTargetUrl(null)
        }}
      />
    </div>
  )
}
