'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  UserCheck,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Loader2,
  Award,
  Star
} from 'lucide-react'
import { RecommendedCandidate, InvitationStatus } from '../types/candidate-rediscovery.types'
import { candidateRediscoveryApi } from '../services/candidate-rediscovery.api'
import { candidateApi } from '@/src/features/candidates/services/candidate.api'
import { CandidateApplication } from '@/src/features/candidates/types/candidate.types'
import { CandidateDetailModal } from '@/src/components/common'
import { useToast } from '@/src/providers/ToastProvider'
import InviteCandidateModal from './InviteCandidateModal'

interface CandidateRediscoverySectionProps {
  jobId: string
  jobTitle: string
  departmentName?: string
}

export default function CandidateRediscoverySection({
  jobId,
  jobTitle,
  departmentName
}: CandidateRediscoverySectionProps) {
  const { showToast } = useToast()
  const [candidates, setCandidates] = useState<RecommendedCandidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<RecommendedCandidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Candidate Detail View state
  const [viewingApp, setViewingApp] = useState<CandidateApplication | null>(null)
  const [loadingAppId, setLoadingAppId] = useState<string | null>(null)

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const data = await candidateRediscoveryApi.getRecommendations(jobId)
      setCandidates(data)
    } catch (err) {
      console.error('Lỗi tải ứng viên tiềm năng:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (jobId) {
      fetchRecommendations()
    }
  }, [jobId])

  const handleOpenInvite = (candidate: RecommendedCandidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  const handleInviteSuccess = (candidateId: string, invitation: any) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.candidateId === candidateId
          ? {
              ...c,
              invitation: {
                _id: invitation._id,
                status: invitation.status,
                expiresAt: invitation.expiresAt,
                createdAt: invitation.createdAt,
                note: invitation.note
              }
            }
          : c
      )
    )
  }

  // Xem chi tiết hồ sơ ứng viên
  const handleViewCandidate = async (cand: RecommendedCandidate) => {
    setLoadingAppId(cand.candidateId)
    try {
      if (cand.previousApplicationId) {
        const app = await candidateApi.getApplicationById(cand.previousApplicationId)
        if (app) {
          setViewingApp(app)
          return
        }
      }

      // Fallback xây dựng đối tượng hồ sơ nếu ứng viên chưa có hoặc không lấy được application
      const fallbackApp: any = {
        _id: cand.previousApplicationId || cand.candidateId,
        candidateId: {
          _id: cand.candidateId,
          fullName: cand.name,
          headline: cand.headline,
          email: cand.email,
          phone: cand.phone,
          skills: cand.skills,
          userId: {
            name: cand.name,
            email: cand.email,
            phone: cand.phone,
            avatar: cand.avatar
          }
        },
        jobDescriptionId: {
          _id: cand.previousJobId,
          title: cand.previousJobTitle,
          departmentId: { name: departmentName || 'Phòng ban' }
        },
        aiFitScore: cand.previousAiFitScore,
        evidenceStrengthScore: cand.evidenceStrengthScore,
        appliedAt: cand.appliedAt,
        status: 'POTENTIAL_MEDALIST',
        aiEvaluation: {
          aiFitScore: cand.previousAiFitScore,
          evidenceStrengthScore: cand.evidenceStrengthScore,
          keyStrengths: cand.keyStrengths,
          summary: `Ứng viên Tiềm Năng ${cand.name} từng tham gia ứng tuyển vị trí "${cand.previousJobTitle}". Thành tích: ${cand.stageBadgeTitle || 'Đạt chuẩn Tiềm Năng'}${cand.interviewScore ? ` (Điểm PV: ${cand.interviewScore}/5.0 ${cand.interviewRecommendationLabel ? `- ${cand.interviewRecommendationLabel}` : ''})` : ''}, AI Match: ${cand.previousAiFitScore}%.`
        }
      }
      setViewingApp(fallbackApp)
    } catch (err: any) {
      console.error('Lỗi khi tải chi tiết hồ sơ ứng viên:', err)
      showToast('Không thể tải chi tiết hồ sơ ứng viên. Đang mở hồ sơ tóm tắt.', 'info')

      // Dùng fallback tóm tắt để người dùng vẫn xem được thông tin
      const fallbackApp: any = {
        _id: cand.previousApplicationId || cand.candidateId,
        candidateId: {
          _id: cand.candidateId,
          fullName: cand.name,
          headline: cand.headline,
          email: cand.email,
          phone: cand.phone,
          skills: cand.skills,
          userId: {
            name: cand.name,
            email: cand.email,
            phone: cand.phone,
            avatar: cand.avatar
          }
        },
        jobDescriptionId: {
          _id: cand.previousJobId,
          title: cand.previousJobTitle,
          departmentId: { name: departmentName || 'Phòng ban' }
        },
        aiFitScore: cand.previousAiFitScore,
        evidenceStrengthScore: cand.evidenceStrengthScore,
        appliedAt: cand.appliedAt,
        aiEvaluation: {
          aiFitScore: cand.previousAiFitScore,
          keyStrengths: cand.keyStrengths,
          summary: `Ứng viên Tiềm Năng ${cand.name} từng ứng tuyển vị trí ${cand.previousJobTitle}. Thành tích: ${cand.stageBadgeTitle || 'Đạt chuẩn Tiềm Năng'}${cand.interviewScore ? ` (Điểm PV: ${cand.interviewScore}/5.0)` : ''}, AI Match: ${cand.previousAiFitScore}%.`
        }
      }
      setViewingApp(fallbackApp)
    } finally {
      setLoadingAppId(null)
    }
  }

  const getDaysRemaining = (expiresAtStr?: string) => {
    if (!expiresAtStr) return 0
    const diffMs = new Date(expiresAtStr).getTime() - Date.now()
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Gợi ý ứng viên tiềm năng
              </h3>
              {!isLoading && candidates.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/90 shadow-2xs">
                  {candidates.length} ứng viên
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chỉ gợi ý ứng viên Tiềm Năng từng vào vòng Phỏng vấn (đánh giá ≥ 3.5★ hoặc Đề xuất
              nhận việc) hoặc đã nhận Offer cho vị trí{' '}
              <strong className="font-semibold text-slate-700">{jobTitle}</strong>
              {departmentName ? ` (${departmentName})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRecommendations}
            disabled={isLoading}
            title="Làm mới danh sách gợi ý"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-blue-600' : ''} />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">
                Đang quét kho dữ liệu nhân tài của phòng ban...
              </span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-6 px-4 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
              <UserCheck size={28} className="mx-auto text-slate-300 mb-1.5" />
              <p className="text-xs font-bold text-slate-600">
                Chưa có dữ liệu ứng viên tiềm năng từ đợt tuyển trước
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-md mx-auto leading-relaxed">
                Hệ thống chỉ gợi ý ứng viên từng nộp vào vị trí{' '}
                <strong className="text-slate-600">{jobTitle}</strong>
                {departmentName ? ` thuộc ${departmentName}` : ''}. Hiện tại chưa có đợt tuyển nào
                khác của vị trí này hoặc chưa có ứng viên đạt tiêu chí.
              </p>
            </div>
          ) : (
            /* 4 columns layout on xl screen, responsive grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
              {candidates.map((cand) => {
                const inv = cand.invitation
                const isPending = inv?.status === InvitationStatus.PENDING
                const isAccepted = inv?.status === InvitationStatus.ACCEPTED
                const isDeclined = inv?.status === InvitationStatus.DECLINED
                const isExpired = inv?.status === InvitationStatus.EXPIRED
                const daysRemaining = isPending ? getDaysRemaining(inv?.expiresAt) : 0
                const isViewingThis = loadingAppId === cand.candidateId
                const isOfferTier = cand.tier === 'OFFER'

                return (
                  <div
                    key={cand.candidateId}
                    className="bg-white border border-slate-200/80 hover:border-blue-300/80 hover:shadow-md rounded-2xl p-3.5 shadow-2xs transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      {/* Top Tier Medalist Badge & Interview Score */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        {isOfferTier ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                            <Award size={12} className="text-emerald-600" />
                            {cand.stageBadgeTitle || 'Từng nhận Offer'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                            <Award size={12} className="text-indigo-600" />
                            {cand.stageBadgeTitle || 'Phỏng vấn tốt'}
                          </span>
                        )}

                        {cand.interviewScore && (
                          <span
                            className="text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 bg-amber-50/80 px-1.5 py-0.5 rounded-md border border-amber-200/60"
                            title={
                              cand.interviewRecommendationLabel
                                ? `Đề xuất: ${cand.interviewRecommendationLabel}`
                                : undefined
                            }
                          >
                            <Star size={11} className="text-amber-500 fill-amber-400" />
                            {cand.interviewScore}/5.0
                            {cand.interviewRecommendationLabel && (
                              <span className="text-[9px] font-semibold text-amber-700 hidden sm:inline">
                                ({cand.interviewRecommendationLabel})
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Candidate Avatar, Name and AI Match Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
                            {cand.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {cand.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {cand.headline || cand.email}
                            </p>
                          </div>
                        </div>

                        {/* AI Match Badge */}
                        <div className="shrink-0 text-right">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs"
                            title="Điểm phù hợp hồ sơ AI"
                          >
                            <Sparkles size={11} className="text-sky-600" />
                            {cand.previousAiFitScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Previous Application Info */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Briefcase size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">
                            Đợt:{' '}
                            <strong className="font-semibold text-slate-700">
                              {cand.previousJobTitle}
                            </strong>
                          </span>
                        </div>
                        {cand.appliedAt && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400 shrink-0" />
                            <span>{new Date(cand.appliedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                      </div>

                      {/* Key Strengths (1-2 items compact) */}
                      {cand.keyStrengths && cand.keyStrengths.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          {cand.keyStrengths.slice(0, 2).map((st, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-100 truncate block"
                              title={st}
                            >
                              ✓ {st}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action & Status Row */}
                    <div className="pt-2 border-t border-slate-100/80 space-y-2">
                      {/* Status indicator */}
                      <div>
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} />
                            Đã tham gia đợt này
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={11} />
                            Chờ phản hồi ({daysRemaining} ngày)
                          </span>
                        )}
                        {isDeclined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            <XCircle size={11} />
                            Đã từ chối
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <AlertCircle size={11} />
                            Đã hết hạn
                          </span>
                        )}
                        {!inv && (
                          <span className="text-[10px] text-slate-400 italic">
                            Chưa gửi lời mời
                          </span>
                        )}
                      </div>

                      {/* Action buttons: "Xem" and "Mời tái ứng tuyển" */}
                      <div className="flex items-center gap-1.5 w-full">
                        {/* Nút Xem chi tiết hồ sơ */}
                        <button
                          type="button"
                          onClick={() => handleViewCandidate(cand)}
                          disabled={isViewingThis}
                          className={`py-1.5 px-2.5 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 ${
                            !inv || isExpired ? 'flex-1' : 'w-full'
                          }`}
                          title="Xem thông tin chi tiết ứng viên"
                        >
                          {isViewingThis ? (
                            <Loader2 size={12} className="animate-spin text-blue-600" />
                          ) : (
                            <Eye size={12} className="text-slate-500" />
                          )}
                          <span>Xem</span>
                        </button>

                        {/* Nút Mời tái ứng tuyển (nếu chưa mời hoặc đã hết hạn) */}
                        {(!inv || isExpired) && (
                          <button
                            type="button"
                            onClick={() => handleOpenInvite(cand)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-1 transition-all cursor-pointer"
                            title="Gửi thư mời tham gia đợt tuyển dụng này"
                          >
                            <Send size={11} />
                            <span className="truncate">
                              {isExpired ? 'Mời lại' : 'Mời ứng tuyển'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Invite Candidate Modal */}
      <InviteCandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidate={selectedCandidate}
        jobId={jobId}
        jobTitle={jobTitle}
        onSuccess={handleInviteSuccess}
      />

      {/* Candidate Detail Modal (Read-only drawer) */}
      {viewingApp && (
        <CandidateDetailModal
          application={viewingApp}
          readOnly={true}
          onClose={() => setViewingApp(null)}
        />
      )}
    </div>
  )
}
