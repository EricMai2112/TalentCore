'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Send,
  Clock,
  Calendar,
  FileText,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Check,
  ArrowRight,
  Loader2,
  Inbox
} from 'lucide-react'
import { CandidateApplicationItem, ApplicationStats } from '../types/application.types'
import { candidateApplicationsApi } from '../services/candidate-applications.api'

// Fallback standard stages if job has no custom pipeline defined
const DEFAULT_PIPELINE_STAGES = [
  { name: 'Mới ứng tuyển' },
  { name: 'Sàng lọc CV' },
  { name: 'Phỏng vấn sơ loại' },
  { name: 'Phỏng vấn chuyên môn' },
  { name: 'Phỏng vấn Culture Fit' },
  { name: 'Offer' }
]

export default function MyApplicationsView() {
  const [activeTab, setActiveTab] = useState<'my_applications' | 'interviews' | 'offers'>(
    'my_applications'
  )
  const [applications, setApplications] = useState<CandidateApplicationItem[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    totalApplied: 0,
    processingCount: 0,
    interviewCount: 0,
    offerCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true)
      try {
        const data = await candidateApplicationsApi.getMyApplications()
        setApplications(data.applications || [])
        setStats(
          data.stats || {
            totalApplied: 0,
            processingCount: 0,
            interviewCount: 0,
            offerCount: 0
          }
        )
      } catch (err) {
        console.error('Lỗi khi lấy đơn ứng tuyển của tôi:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const getScoreColor = (score?: number | null) => {
    if (score === null || score === undefined) return 'text-slate-500 font-bold'
    if (score >= 70) return 'text-emerald-600 font-extrabold'
    if (score >= 50) return 'text-amber-600 font-extrabold'
    return 'text-rose-600 font-extrabold'
  }

  const getStageBadge = (stageName?: string, stageColor?: string) => {
    const s = stageName || 'Mới ứng tuyển'
    let style = 'bg-indigo-50 text-indigo-700 border-indigo-200'
    let dotColor = 'bg-indigo-500'

    const sLower = s.toLowerCase()
    if (sLower.includes('tech')) {
      style = 'bg-blue-50 text-blue-600 border-blue-200'
      dotColor = 'bg-blue-500'
    } else if (sLower.includes('phone') || sLower.includes('sơ loại')) {
      style = 'bg-purple-50 text-purple-600 border-purple-200'
      dotColor = 'bg-purple-500'
    } else if (sLower.includes('culture') || sLower.includes('văn hóa')) {
      style = 'bg-cyan-50 text-cyan-600 border-cyan-200'
      dotColor = 'bg-cyan-500'
    } else if (sLower.includes('offer')) {
      style = 'bg-emerald-50 text-emerald-600 border-emerald-200'
      dotColor = 'bg-emerald-500'
    } else if (sLower.includes('từ chối') || sLower.includes('reject')) {
      style = 'bg-rose-50 text-rose-600 border-rose-200'
      dotColor = 'bg-rose-500'
    } else if (sLower.includes('sàng lọc') || sLower.includes('filter')) {
      style = 'bg-amber-50 text-amber-600 border-amber-200'
      dotColor = 'bg-amber-500'
    } else if (stageColor) {
      return (
        <span
          style={{
            backgroundColor: `${stageColor}15`,
            borderColor: `${stageColor}40`,
            color: stageColor
          }}
          className="px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shrink-0"
        >
          <span style={{ backgroundColor: stageColor }} className="w-1.5 h-1.5 rounded-full" />
          <span>{s}</span>
        </span>
      )
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shrink-0 ${style}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span>{s}</span>
      </span>
    )
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '2026-07-05'
    const d = new Date(dateStr)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-50/60 text-slate-900">
      {/* Top Header Navigation Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-center w-full gap-2 py-3 mx-auto sm:px-6 sm:gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('my_applications')}
            className={`px-4.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'my_applications'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Ứng tuyển của tôi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interviews')}
            className={`px-4.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'interviews'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Lịch phỏng vấn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`px-4.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Offer
          </button>
        </div>
      </div>

      <main className="max-w-6xl px-4 pt-8 mx-auto space-y-8 sm:px-6">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
            Ứng tuyển của tôi
          </h1>
          <p className="mt-1 text-xs font-medium sm:text-sm text-slate-500">
            Theo dõi tiến trình ứng tuyển của bạn qua từng giai đoạn
          </p>
        </div>

        {/* 4 Metric Summary Cards Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 sm:gap-5">
          {/* Card 1: Total Applied */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600" />
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-[13px] font-bold text-slate-700">Đã ứng tuyển</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50/90 text-blue-600 flex items-center justify-center ring-4 ring-blue-50/50 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                <Send size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.totalApplied}</span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-100/80">
                Tổng hồ sơ
              </span>
            </div>
          </div>

          {/* Card 2: Processing */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-[13px] font-bold text-slate-700">Đang xử lý</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50/90 text-amber-600 flex items-center justify-center ring-4 ring-amber-50/50 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.processingCount}</span>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-100/80">
                Đang xét duyệt
              </span>
            </div>
          </div>

          {/* Card 3: Interviews */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-[13px] font-bold text-slate-700">Phỏng vấn</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50/90 text-purple-600 flex items-center justify-center ring-4 ring-purple-50/50 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200">
                <Calendar size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.interviewCount}</span>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50/80 px-2.5 py-0.5 rounded-full border border-purple-100/80">
                Lịch hẹn
              </span>
            </div>
          </div>

          {/* Card 4: Offer */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/60 border border-slate-200/80 rounded-2xl p-4.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-[13px] font-bold text-slate-700">Offer</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50/90 text-emerald-600 flex items-center justify-center ring-4 ring-emerald-50/50 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                <FileText size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.offerCount}</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-100/80">
                Thư mời nhận việc
              </span>
            </div>
          </div>
        </div>

        {/* Application Cards List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border shadow-xs text-slate-400 rounded-3xl border-slate-200/80">
            <Loader2 size={32} className="mb-3 text-indigo-600 animate-spin" />
            <p className="text-xs font-semibold">Đang tải danh sách ứng tuyển...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 py-20 space-y-3 text-center bg-white border shadow-xs rounded-3xl border-slate-200/80">
            <div className="flex items-center justify-center mb-1 w-14 h-14 rounded-3xl bg-slate-100 text-slate-400">
              <Inbox size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Bạn chưa ứng tuyển vị trí nào</h3>
            <p className="max-w-sm text-xs text-slate-500">
              Khám phá các cơ hội việc làm hấp dẫn và gửi hồ sơ ứng tuyển ngay hôm nay.
            </p>
            <Link
              href="/jobs"
              className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-500/20 transition-all"
            >
              <span>Xem danh sách việc làm</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const job = app.jobDescriptionId
              const deptName =
                typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'Engineering'
              const location = job?.location || 'Hồ Chí Minh'
              const salary = job?.salaryRange || '$2500-$4000'

              // Determine pipeline steps
              const stagesList =
                app.stages && app.stages.length >= 2 ? app.stages : DEFAULT_PIPELINE_STAGES

              const activeIdx =
                app.currentStageIndex !== undefined && app.currentStageIndex >= 0
                  ? app.currentStageIndex
                  : 0

              return (
                <div
                  key={app._id}
                  className="p-6 space-y-6 transition-all bg-white border shadow-xs border-slate-200/90 rounded-3xl hover:border-indigo-200"
                >
                  {/* Card Header */}
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3.5">
                      <div className="flex items-center justify-center w-12 h-12 text-indigo-600 rounded-2xl bg-indigo-50 shrink-0">
                        <Briefcase size={22} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold leading-tight sm:text-lg text-slate-900">
                          {job?.title || 'Senior Frontend Developer'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 size={13} className="text-slate-400" />
                            {deptName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            {location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <DollarSign size={13} className="text-slate-400" />
                            {salary}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top Right Stage Pill */}
                    <div>{getStageBadge(app.stageName, app.stageColor)}</div>
                  </div>

                  {/* Horizontal Pipeline Stepper Progress Bar */}
                  <div className="pt-2 pb-1 overflow-x-auto">
                    <div className="min-w-[550px] relative px-4">
                      {/* Stepper items container */}
                      <div className="relative z-10 flex items-start justify-between">
                        {stagesList.map((stg, idx) => {
                          const isPassed = idx < activeIdx
                          const isActive = idx === activeIdx
                          const isUpcoming = idx > activeIdx

                          return (
                            <div
                              key={idx}
                              className="flex flex-col items-center text-center flex-1 max-w-[120px]"
                            >
                              {/* Step Badge Node */}
                              <div className="relative mb-2">
                                {isPassed ? (
                                  <div className="flex items-center justify-center w-6 h-6 text-white rounded-full shadow-xs bg-emerald-500">
                                    <Check size={14} className="stroke-[3]" />
                                  </div>
                                ) : isActive ? (
                                  <div className="w-6.5 h-6.5 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30 ring-4 ring-indigo-100">
                                    {idx + 1}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-slate-100 text-slate-400">
                                    {idx + 1}
                                  </div>
                                )}
                              </div>

                              {/* Step Label */}
                              <span
                                className={`text-[11px] leading-tight font-bold ${
                                  isPassed
                                    ? 'text-emerald-600'
                                    : isActive
                                      ? 'text-indigo-700 font-extrabold'
                                      : 'text-slate-400 font-medium'
                                }`}
                              >
                                {stg.name}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Connecting Progress Line (rendered behind step nodes) */}
                      <div className="absolute h-1 overflow-hidden rounded-full top-3 left-10 right-10 bg-slate-100 -z-0">
                        <div
                          className="h-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-emerald-500 to-indigo-600"
                          style={{
                            width: `${
                              stagesList.length > 1
                                ? (activeIdx / (stagesList.length - 1)) * 100
                                : 0
                            }%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs border-t border-slate-100">
                    <div className="flex items-center gap-4 font-medium text-slate-500">
                      <span>
                        AI Score:{' '}
                        <strong className={getScoreColor(app.aiFitScore)}>
                          {app.aiFitScore !== null && app.aiFitScore !== undefined
                            ? `${app.aiFitScore}/100`
                            : 'N/A'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Ngày ứng tuyển:{' '}
                        <strong className="text-slate-700">{formatDate(app.appliedAt)}</strong>
                      </span>
                    </div>

                    <Link
                      href={job?._id ? `/jobs/${job._id}` : '/jobs'}
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 transition-colors cursor-pointer hover:text-indigo-700 hover:underline"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
