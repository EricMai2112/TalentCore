'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Send,
  Star,
  User as UserIcon,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  FileText,
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
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
import CustomTextarea from '@/src/components/common/CustomTextarea'
import { UnsavedChangesModal } from './UnsavedChangesModal'

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

  // Candidate info formatting
  const cand = interview?.candidateId
  const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên'
  const candEmail = typeof cand === 'object' ? cand?.email || 'N/A' : 'N/A'
  const candPhone = typeof cand === 'object' ? cand?.phone || 'N/A' : 'N/A'
  const jobTitle =
    typeof interview?.jobDescriptionId === 'object'
      ? interview.jobDescriptionId?.title
      : 'Vị trí tuyển dụng'
  const deptObj =
    typeof interview?.jobDescriptionId === 'object'
      ? interview.jobDescriptionId?.departmentId
      : null
  const deptName = typeof deptObj === 'object' ? deptObj?.name : 'Phòng ban'
  const interviewerName =
    typeof interview?.interviewerId === 'object'
      ? interview.interviewerId?.name || interview.interviewerId?.email
      : 'Chưa chỉ định'

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'U'
    const parts = nameStr.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

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

  const recommendationOptions: {
    type: RecommendationType
    label: string
    description: string
    activeClass: string
  }[] = [
    {
      type: 'STRONG_HIRE',
      label: 'Đề xuất nhận ngay',
      description: 'Ứng viên xuất sắc, đáp ứng vượt trội mọi tiêu chí chuyên môn & văn hóa.',
      activeClass:
        'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-950 font-bold'
    },
    {
      type: 'HIRE',
      label: 'Đồng ý nhận',
      description: 'Ứng viên tốt, đạt tiêu chí yêu cầu cho vị trí.',
      activeClass: 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/40 text-blue-950 font-bold'
    },
    {
      type: 'CONSIDER',
      label: 'Cân nhắc thêm',
      description: 'Đạt một số tiêu chí nhưng có một vài điểm lưu ý, cần xem xét thêm.',
      activeClass:
        'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40 text-amber-950 font-bold'
    },
    {
      type: 'NO_HIRE',
      label: 'Từ chối',
      description: 'Ứng viên không phù hợp với yêu cầu tuyển dụng của vị trí.',
      activeClass: 'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/40 text-rose-950 font-bold'
    }
  ]

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

      {/* Header Glass Card matching JobRequestFormWizard Header */}
      <div className="bg-white/30 backdrop-blur-md border border-white/60 px-4 py-3.5 md:px-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={handleNavigateBack}
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
              {initialEval?.isDraft && (
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
            onClick={handleSaveDraft}
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
            onClick={handleSubmitEvaluation}
            isLoading={isSubmitting}
            disabled={isSaving || isSubmitting}
            icon={Send}
            className="text-xs font-extrabold"
          >
            Hoàn tất & Gửi đánh giá
          </CustomButton>
        </div>
      </div>

      {/* Candidate Overview Banner Card */}
      <div className="p-4 border shadow-xl sm:p-5 bg-white/40 backdrop-blur-xl border-white/60 shadow-blue-500/5 rounded-2xl md:rounded-3xl">
        <div className="grid items-center grid-cols-1 gap-4 md:grid-cols-12">
          {/* Candidate Profile Avatar & Name */}
          <div className="md:col-span-5 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl font-black bg-gradient-to-br from-[#3B82F6] to-indigo-600 text-white border-2 border-white shadow-md flex items-center justify-center shrink-0 text-base">
              {getInitials(candName || '')}
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="text-base font-extrabold truncate text-slate-900">{candName}</h2>
              <p className="text-xs font-medium text-slate-500 truncate flex items-center gap-1.5">
                <span>{candEmail}</span>
                <span>•</span>
                <span>{candPhone}</span>
              </p>
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1 shadow-2xs">
                  <Briefcase size={11} />
                  {jobTitle}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shadow-2xs">
                  <Building2 size={11} />
                  {deptName}
                </span>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-200/60 md:pl-4 space-y-1.5 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Calendar size={13} className="text-[#3B82F6]" />
              <span>
                Ngày:{' '}
                {interview.date ? new Date(interview.date).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400" />
              <span>
                Thời gian: {interview.startTime || 'N/A'} - {interview.endTime || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon size={13} className="text-slate-400" />
              <span>
                Interviewer: <strong className="text-slate-900">{interviewerName}</strong>
              </span>
            </div>
          </div>

          {/* Overall Score Redesigned Solid Gradient Glass Card */}
          <div className="md:col-span-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-3.5 text-center shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center relative overflow-hidden group border border-white/20">
            <div className="absolute w-20 h-20 transition-all rounded-full pointer-events-none -right-6 -bottom-6 bg-white/10 blur-lg group-hover:scale-125" />
            <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-blue-100/90 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20">
              <Award size={12} className="text-amber-300" />
              <span>Điểm Tổng Thể</span>
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

      {/* Main Form Content: 2-Column Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column (8 cols): Criteria Scores & Detailed Comments */}
        <div className="space-y-4 lg:col-span-8">
          <div className="p-4 space-y-4 border shadow-xl sm:p-5 bg-white/40 backdrop-blur-xl border-white/60 shadow-blue-500/5 rounded-2xl md:rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div>
                <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <Award size={16} className="text-[#3B82F6]" />
                  <span>Bộ tiêu chí đánh giá năng lực</span>
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Chấm điểm từ 1 đến 5 theo từng hạng mục chuyên môn & kỹ năng
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {criteriaScores.filter((c) => c.score > 0).length} / {criteriaScores.length} đã chấm
              </span>
            </div>

            {/* Criteria Items List */}
            <div className="space-y-3">
              {criteriaScores.map((item, idx) => {
                const itemId = item.id || (item as any)._id || `crit_${idx + 1}`
                const isExpanded = !!expandedNoteIds[itemId]
                const hasComment = !!item.comment && item.comment.trim() !== ''

                return (
                  <div
                    key={itemId}
                    className="p-3.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl sm:rounded-2xl space-y-2.5 transition-all hover:bg-white/80 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Inline Title & Category Badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-[#3B82F6] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900">{item.name}</h4>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${getCategoryBadgeStyle(item.category)}`}
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
                              onClick={() => handleCriteriaScoreChange(itemId, num)}
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
                          onClick={() => toggleNoteExpand(itemId)}
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
                          <span>
                            {isExpanded ? 'Thu gọn' : hasComment ? 'Ghi chú' : '+ Ghi chú'}
                          </span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Double-Height Textarea */}
                    {isExpanded && (
                      <div className="pt-1 space-y-1 duration-200 pl-7 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <span>Ghi chú chi tiết cho tiêu chí này:</span>
                          </label>
                        </div>
                        <CustomTextarea
                          placeholder="Nhập ghi chú chi tiết, bằng chứng hoặc lý do cho mức điểm của tiêu chí này..."
                          rows={4}
                          value={item.comment || ''}
                          onChange={(e) => handleCriteriaCommentChange(itemId, e.target.value)}
                          className="text-xs bg-white/80 !py-2 !px-3 !rounded-xl border-slate-200 focus:border-blue-400 min-h-[96px]"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Recommendation Selector & General Feedback */}
        <div className="self-start space-y-4 lg:col-span-4 lg:sticky lg:top-1">
          {/* Recommendation Selection Glass Card */}
          <div className="p-4 space-y-3 border shadow-lg sm:p-5 bg-white/40 backdrop-blur-xl border-white/60 shadow-blue-500/5 rounded-2xl md:rounded-3xl">
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Đề xuất kết quả</span>
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Lựa chọn quyết định tuyển dụng của người phỏng vấn
              </p>
            </div>

            <div className="space-y-2 pt-0.5">
              {recommendationOptions.map((opt) => {
                const isSelected = recommendation === opt.type
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleRecommendationChange(opt.type)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden space-y-0.5 ${
                      isSelected
                        ? opt.activeClass
                        : 'bg-white/60 border-slate-200/70 hover:bg-white/90 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="block text-xs font-extrabold">{opt.label}</span>
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
          <div className="p-4 space-y-3 border shadow-lg sm:p-5 bg-white/40 backdrop-blur-xl border-white/60 shadow-blue-500/5 rounded-2xl md:rounded-3xl">
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <FileText size={16} className="text-[#3B82F6]" />
                <span>Nhận xét chung</span>
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Ghi chú hoặc thông điệp gửi tới bộ phận Tuyển dụng / HR
              </p>
            </div>

            <CustomTextarea
              placeholder="Nhập nhận xét tổng quan về buổi phỏng vấn, đề xuất mức lương hoặc ghi chú thêm cho HR..."
              rows={4}
              value={generalFeedback}
              onChange={(e) => handleGeneralFeedbackChange(e.target.value)}
              className="text-xs bg-white/70 !rounded-xl min-h-[96px]"
            />
          </div>
        </div>
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
