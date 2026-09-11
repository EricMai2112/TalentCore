'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  GraduationCap,
  FolderGit2,
  Award,
  Globe,
  MapPin,
  Target,
  ExternalLink,
  FileText,
  User,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  ClipboardCheck
} from 'lucide-react'
import { CandidateApplication } from '../types/candidate.types'
import { useAuth } from '@/src/providers/AuthProvider'
import { CandidateDetailFooterActions } from './CandidateDetailFooterActions'

interface CandidateDetailModalProps {
  application: CandidateApplication | any
  onClose: () => void
}

export default function CandidateDetailModal({ application, onClose }: CandidateDetailModalProps) {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'evaluation' | 'profile'>('overview')
  const [renderApp, setRenderApp] = useState<CandidateApplication | null>(application)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (application) {
      setRenderApp(application)
      document.body.style.overflow = 'hidden'
      // Use requestAnimationFrame to trigger slide-in animation on next paint
      const timer = requestAnimationFrame(() => {
        setIsOpen(true)
      })
      return () => cancelAnimationFrame(timer)
    } else {
      setIsOpen(false)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [application])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      onClose()
      setRenderApp(null)
    }, 300)
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && renderApp && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [renderApp, isOpen])

  if (!renderApp) return null

  const candidate = renderApp.candidateId
  const job = renderApp.jobDescriptionId
  const user = candidate?.userId
  const aiEval = renderApp.aiEvaluation

  const name = user?.name || candidate?.fullName || candidate?.profileName || 'Ứng viên'
  const email = user?.email || candidate?.email || 'Chưa cập nhật'
  const phone = user?.phone || candidate?.phone || 'Chưa cập nhật'
  const headline = candidate?.headline || 'Chưa cập nhật chức danh'
  const address = candidate?.address
  const deptName = typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'Công nghệ'

  const aiScore = renderApp.aiFitScore ?? aiEval?.aiFitScore ?? 0
  const isMissingMandatory = Boolean(renderApp.isMissingMandatory || aiEval?.isMissingMandatory)

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-700 bg-emerald-50 border-emerald-300'
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-300'
    return 'text-rose-700 bg-rose-50 border-rose-300'
  }

  const initial = (name.trim().charAt(0) || 'U').toUpperCase()

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop with Fade In / Fade Out animation */}
      <div
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Slide-over Right Drawer with Slide-In (Right to Left) and Slide-Out (Left to Right) Animation */}
      <div
        className={`relative w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl h-full bg-white shadow-2xl flex flex-col z-10 text-slate-900 border-l border-slate-200 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              {initial}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {deptName}
                </span>
                {candidate?.currentLevel && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                    {candidate.currentLevel}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-indigo-600">{headline}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                <Briefcase size={13} className="text-slate-400" />
                <span>
                  Ứng tuyển: <strong className="text-slate-700">{job?.title}</strong>
                </span>
                <span>•</span>
                <Calendar size={13} className="text-slate-400" />
                <span>
                  {renderApp.appliedAt
                    ? new Date(renderApp.appliedAt).toLocaleDateString('vi-VN')
                    : 'Hôm nay'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Đóng bảng chi tiết"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard size={15} />
            <span>Tổng quan</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getScoreColor(
                aiScore
              )}`}
            >
              {aiScore}%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluation')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'evaluation'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardCheck size={15} />
            <span>Đánh giá</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {aiEval?.evaluatedCriteria?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={15} />
            <span>Hồ sơ ứng viên</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 bg-slate-50/50">
          {/* TAB 1: OVERVIEW (TỔNG QUAN) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 1. Score Hero Card */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-indigo-100">
                      <Sparkles size={13} className="text-indigo-600" />
                      AI Match Score
                    </span>
                    {isMissingMandatory ? (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 inline-flex items-center gap-1">
                        <XCircle size={13} className="text-rose-500" /> Thiếu tiêu chí bắt buộc
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle size={13} className="text-emerald-500" /> Đạt tiêu chí bắt buộc
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                    <span>Mức độ phù hợp với tiêu chí tuyển dụng</span>
                    {aiEval?.evaluatedAt && (
                      <>
                        <span>•</span>
                        <span>
                          Đánh giá: {new Date(aiEval.evaluatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Quantitative Circular Gauge Ring */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 56 56">
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      className={
                        aiScore >= 70
                          ? 'text-emerald-100'
                          : aiScore >= 50
                            ? 'text-amber-100'
                            : 'text-rose-100'
                      }
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      className={
                        aiScore >= 70
                          ? 'text-emerald-500'
                          : aiScore >= 50
                            ? 'text-amber-500'
                            : 'text-rose-500'
                      }
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={145}
                      strokeDashoffset={145 - (Math.min(100, Math.max(0, aiScore)) / 100) * 145}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-lg font-black leading-none ${
                        aiScore >= 70
                          ? 'text-emerald-700'
                          : aiScore >= 50
                            ? 'text-amber-700'
                            : 'text-rose-600'
                      }`}
                    >
                      {aiScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. AI Summary */}
              {aiEval?.summary && (
                <div className="p-4.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-600" />
                    Nhận định tổng quan từ AI
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {aiEval.summary}
                  </p>
                </div>
              )}

              {/* 3. Key Strengths & Potential Gaps 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Strengths */}
                <div className="p-4.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2.5 shadow-2xs">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Điểm mạnh nổi bật ({aiEval?.keyStrengths?.length || 0})
                  </span>
                  {aiEval?.keyStrengths && aiEval.keyStrengths.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-emerald-900 font-medium">
                      {aiEval.keyStrengths.map((str: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-600 font-bold text-sm">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-600/70 italic">
                      Chưa ghi nhận điểm mạnh đặc biệt.
                    </p>
                  )}
                </div>

                {/* Potential Gaps */}
                <div className="p-4.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 shadow-2xs">
                  <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={16} className="text-rose-600" />
                    Điểm hạn chế / Cần lưu ý ({aiEval?.potentialGaps?.length || 0})
                  </span>
                  {aiEval?.potentialGaps && aiEval.potentialGaps.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-rose-900 font-medium">
                      {aiEval.potentialGaps.map((gap: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-rose-600 font-bold text-sm">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-rose-600/70 italic">
                      Không có điểm hạn chế nghiêm trọng.
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Warnings */}
              {(isMissingMandatory || (aiEval?.warnings && aiEval.warnings.length > 0)) && (
                <div className="p-4.5 bg-amber-50/90 border border-amber-300/80 rounded-2xl space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-950 font-bold uppercase tracking-wider">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <span>Cảnh báo & Rủi ro đánh giá ({aiEval?.warnings?.length || 1})</span>
                  </div>
                  <ul className="space-y-1 text-amber-900 list-disc list-inside">
                    {aiEval?.warnings?.map((warn: string, idx: number) => (
                      <li key={idx} className="font-medium leading-relaxed">
                        {warn}
                      </li>
                    )) || (
                      <li className="font-medium">
                        Ứng viên chưa vượt qua ngưỡng điểm của tiêu chí Bắt buộc (MANDATORY).
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* 5. Suggested Interview Questions */}
              {aiEval?.suggestedQuestions && aiEval.suggestedQuestions.length > 0 && (
                <div className="p-4.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle size={15} className="text-purple-600" />
                      Gợi ý câu hỏi phỏng vấn cho Hội đồng tuyển dụng (
                      {aiEval.suggestedQuestions.length})
                    </span>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                      Tự động tạo bởi AI
                    </span>
                  </div>
                  <div className="space-y-2">
                    {aiEval.suggestedQuestions.map((q: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-purple-100 rounded-xl text-xs text-slate-800 flex items-start gap-2.5 shadow-2xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVALUATION & CRITERIA BREAKDOWN (ĐÁNH GIÁ) */}
          {activeTab === 'evaluation' && (
            <div className="space-y-5">
              {/* Overview Banner for Criteria */}
              <div className="p-4.5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-blue-50/40 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-indigo-600" />
                    Bảng đánh giá tiêu chí tuyển dụng & Bằng chứng thực tế
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Đối soát từng tiêu chí theo thang điểm 6 mức (0, 20, 40, 60, 80, 100) và kiểm
                    định bằng chứng từ CV.
                  </p>
                </div>

                {/* Quick Summary Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Tiêu chí Đạt
                    </span>
                    <span className="text-xs font-black text-emerald-600">
                      {aiEval?.evaluatedCriteria?.filter((c: any) => c.isPassed).length || 0} /{' '}
                      {aiEval?.evaluatedCriteria?.length || 0}
                    </span>
                  </div>
                  <div className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Tiêu chí Bắt buộc
                    </span>
                    <span
                      className={`text-xs font-black ${isMissingMandatory ? 'text-rose-600' : 'text-emerald-600'}`}
                    >
                      {isMissingMandatory ? 'Thiếu tiêu chí' : 'Đáp ứng đầy đủ'}
                    </span>
                  </div>
                  <div className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Điểm tổng AI
                    </span>
                    <span className="text-xs font-black text-indigo-600">{aiScore}%</span>
                  </div>
                </div>
              </div>

              {/* Criteria List */}
              {aiEval?.evaluatedCriteria && aiEval.evaluatedCriteria.length > 0 ? (
                <div className="space-y-3.5">
                  {aiEval.evaluatedCriteria.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4.5 bg-white border border-slate-200/90 rounded-2xl space-y-3.5 text-xs shadow-2xs hover:border-indigo-200 transition-colors"
                    >
                      {/* Criteria Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">{c.name}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              c.requirementType === 'MANDATORY'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {c.requirementType === 'MANDATORY' ? 'Bắt buộc' : 'Ưu tiên'}
                          </span>
                          {c.isPassed ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Đạt ({c.score}/100)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                              <XCircle size={11} /> Chưa đạt ({c.score}/100)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                          <span className="text-slate-500 font-medium text-xs">
                            Trọng số: <strong className="text-slate-700">{c.weight}%</strong>
                          </span>
                          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs shadow-2xs">
                            +{c.scoreContribution}% tổng điểm
                          </span>
                          {typeof c.evidenceStrengthScore === 'number' && (
                            <span
                              title="Điểm độ mạnh bằng chứng (tính theo độ khớp văn bản CV, số liệu định lượng & độ dài)"
                              className="px-2.5 py-1 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 font-extrabold text-xs flex items-center gap-1 shadow-2xs"
                            >
                              <Sparkles size={11} className="text-violet-500" />
                              <span>Evidence: {c.evidenceStrengthScore}/100</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Evidence Quote */}
                      <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <FileText size={11} className="text-slate-400" /> Trích dẫn bằng chứng
                            từ CV (Evidence):
                          </span>
                          {c.isEvidenceVerified ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 size={11} /> Đã kiểm chứng trong văn bản CV
                            </span>
                          ) : c.evidence ? (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <AlertTriangle size={11} /> Cần kiểm tra lại độ khớp
                            </span>
                          ) : null}
                        </div>

                        {c.evidence ? (
                          <p className="text-slate-800 leading-relaxed italic text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                            &ldquo;{c.evidence}&rdquo;
                          </p>
                        ) : (
                          <p className="text-slate-400 italic text-xs py-1">
                            Không tìm thấy đoạn văn bản nào tương ứng trong CV.
                          </p>
                        )}
                      </div>

                      {/* Reasoning if available */}
                      {c.reasoning && (
                        <div className="text-[11px] text-slate-600 bg-indigo-50/40 border border-indigo-100 rounded-xl p-2.5">
                          <span className="font-bold text-indigo-900">Phân tích đánh giá: </span>
                          <span>{c.reasoning}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs shadow-2xs">
                  Chưa có dữ liệu bảng điểm chi tiết từng tiêu chí cho ứng viên này.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CANDIDATE RESUME / CV SHEET (SINGLE COLUMN FULL-WIDTH MODERN RESUME) */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden text-slate-800">
              {/* 1. Header: Tên và vị trí ở đầu tiên, Thông tin & Mạng xã hội ở dưới */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-52 h-52 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Tên và vị trí */}
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {name}
                    </h3>
                    <p className="text-indigo-200 font-semibold text-sm sm:text-base flex items-center gap-2">
                      <Briefcase size={16} className="text-indigo-300 shrink-0" />
                      <span>{job?.title || headline || 'Ứng viên chuyên nghiệp'}</span>
                    </p>
                  </div>

                  {/* Thông tin liên hệ & Mạng xã hội ở dưới */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-white/15 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-indigo-300 shrink-0" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-indigo-300 shrink-0" />
                      <span>{phone}</span>
                    </div>
                    {address && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-indigo-300 shrink-0" />
                        <span>{address}</span>
                      </div>
                    )}
                  </div>

                  {/* Mạng xã hội */}
                  {candidate?.socialLinks && candidate.socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {candidate.socialLinks.map((s: any, idx: number) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium transition-colors"
                        >
                          <Globe size={11} className="text-indigo-300 shrink-0" />
                          <span className="font-semibold">{s.platform}:</span>
                          <span className="max-w-[160px] truncate opacity-85">{s.url}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Body: Single Column Flow (Mục tiêu -> Học vấn -> Kỹ năng -> Dự án -> Kinh nghiệm -> Chứng chỉ & Ngôn ngữ -> Các mục khác) */}
              <div className="p-6 sm:p-8 space-y-7 text-xs">
                {/* 1. Mục tiêu (Career Objective / Summary) */}
                {(candidate?.careerObjective || candidate?.summary) && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                      <Target size={14} className="text-indigo-600" />
                      <span>Mục tiêu nghề nghiệp & Giới thiệu</span>
                    </h4>
                    {candidate?.careerObjective && (
                      <div
                        className="text-slate-700 leading-relaxed rich-text-content"
                        dangerouslySetInnerHTML={{ __html: candidate.careerObjective }}
                      />
                    )}
                    {candidate?.summary && (
                      <div
                        className="text-slate-600 leading-relaxed rich-text-content pt-1"
                        dangerouslySetInnerHTML={{ __html: candidate.summary }}
                      />
                    )}
                  </div>
                )}

                {/* 2. Học vấn & Đào tạo (Education) */}
                {candidate?.educations && candidate.educations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                      <GraduationCap size={14} className="text-indigo-600" />
                      <span>Học vấn & Đào tạo</span>
                    </h4>
                    <div className="space-y-3">
                      {candidate.educations.map((edu: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <h5 className="font-bold text-slate-900 text-sm">{edu.institution}</h5>
                            <p className="text-slate-700 font-medium">
                              {edu.major} {edu.degree && `• ${edu.degree}`}
                            </p>
                            {edu.gpa && (
                              <p className="text-[11px] text-indigo-600 font-bold">
                                GPA: {edu.gpa}
                              </p>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium self-start sm:self-center shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            {edu.startDate} - {edu.endDate || 'Hiện tại'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Kỹ năng chuyên môn (Skills - Chỉ hiển thị tên skill) */}
                {candidate?.skills && candidate.skills.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                      <Sparkles size={14} className="text-indigo-600" />
                      <span>Kỹ năng chuyên môn ({candidate.skills.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((s: any, idx: number) => {
                        const sName = typeof s === 'object' ? s.name : s
                        return (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors shadow-2xs"
                          >
                            {sName}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Dự án thực tế tiêu biểu (Projects) */}
                {candidate?.projects && candidate.projects.length > 0 && (
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                      <FolderGit2 size={14} className="text-indigo-600" />
                      <span>Dự án thực tế tiêu biểu</span>
                    </h4>
                    <div className="space-y-3.5">
                      {candidate.projects.map((proj: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-slate-900 text-sm">{proj.name}</h5>
                              {proj.role && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded">
                                  {proj.role}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {proj.startDate || 'N/A'} - {proj.endDate || 'Hiện tại'}
                            </span>
                          </div>

                          {proj.projectUrl && (
                            <a
                              href={proj.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink size={11} /> {proj.projectUrl}
                            </a>
                          )}

                          {proj.description && (
                            <div
                              className="text-slate-600 leading-relaxed rich-text-content"
                              dangerouslySetInnerHTML={{ __html: proj.description }}
                            />
                          )}

                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.technologies.map((t: string, tIdx: number) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-medium text-slate-700 rounded"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Kinh nghiệm làm việc (Work Experience) */}
                {candidate?.experiences && candidate.experiences.length > 0 && (
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                      <Briefcase size={14} className="text-indigo-600" />
                      <span>Kinh nghiệm làm việc</span>
                    </h4>
                    <div className="relative pl-4 border-l-2 border-indigo-200 space-y-5">
                      {candidate.experiences.map((exp: any, idx: number) => (
                        <div key={idx} className="relative space-y-1.5">
                          <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm">{exp.position}</h5>
                              <p className="font-semibold text-slate-600 flex items-center gap-1 text-xs">
                                <Building2 size={13} className="text-slate-400" /> {exp.company}
                              </p>
                            </div>
                            <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 self-start sm:self-auto shrink-0">
                              {exp.startDate || 'N/A'} - {exp.endDate || 'Hiện tại'}
                            </span>
                          </div>

                          {exp.description && (
                            <div
                              className="text-slate-600 leading-relaxed pt-1 rich-text-content"
                              dangerouslySetInnerHTML={{ __html: exp.description }}
                            />
                          )}

                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {exp.technologies.map((t: string, tIdx: number) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-700 rounded"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Chứng chỉ & Ngoại ngữ (Certifications & Languages) */}
                {((candidate?.certifications && candidate.certifications.length > 0) ||
                  (candidate?.languages && candidate.languages.length > 0)) && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                      <Award size={14} className="text-indigo-600" />
                      <span>Chứng chỉ & Ngoại ngữ</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Certifications */}
                      {candidate?.certifications && candidate.certifications.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Chứng chỉ ({candidate.certifications.length})
                          </span>
                          <div className="space-y-2">
                            {candidate.certifications.map((cert: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900">{cert.name}</span>
                                  {cert.scoreOrLevel && (
                                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-[10px] rounded-md">
                                      {cert.scoreOrLevel}
                                    </span>
                                  )}
                                </div>
                                {cert.organization && (
                                  <p className="text-[11px] text-slate-500">
                                    Cấp bởi:{' '}
                                    <span className="font-semibold text-slate-700">
                                      {cert.organization}
                                    </span>
                                  </p>
                                )}
                                {cert.issueDate && (
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {cert.issueDate}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {candidate?.languages && candidate.languages.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Ngoại ngữ ({candidate.languages.length})
                          </span>
                          <div className="space-y-2">
                            {candidate.languages.map((lang: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2"
                              >
                                <span className="font-bold text-slate-800">{lang.language}</span>
                                {lang.proficiency && (
                                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-md border border-indigo-200">
                                    {lang.proficiency}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. Các mục khác (Custom Sections) */}
                {candidate?.customSections && candidate.customSections.length > 0 && (
                  <div className="space-y-4">
                    {candidate.customSections.map((sec: any, secIdx: number) => (
                      <div key={secIdx} className="space-y-3">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
                          <FileText size={14} className="text-indigo-600" />
                          <span>{sec.sectionTitle}</span>
                        </h4>
                        <div className="space-y-2.5">
                          {sec.items?.map((item: any, itemIdx: number) => (
                            <div
                              key={itemIdx}
                              className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-1"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <h5 className="font-bold text-slate-900">{item.title}</h5>
                                {item.date && (
                                  <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                    {item.date}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-slate-600 font-medium text-xs">
                                  {item.subtitle}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-slate-600 leading-relaxed text-xs pt-0.5">
                                  {item.description}
                                </p>
                              )}
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold pt-1"
                                >
                                  <ExternalLink size={11} /> {item.url}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <CandidateDetailFooterActions
          applicationId={renderApp._id}
          candidateName={name}
          userRole={currentUser?.role}
          onClose={handleClose}
        />
      </div>
    </div>
  )
}
