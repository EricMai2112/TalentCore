'use client'

import Link from 'next/link'
import { Briefcase, Building2, MapPin, DollarSign, Check, ArrowRight } from 'lucide-react'
import { CandidateApplicationItem } from '../../types/application.types'

const DEFAULT_PIPELINE_STAGES = [
  { name: 'Mới ứng tuyển' },
  { name: 'Sàng lọc CV' },
  { name: 'Phỏng vấn sơ loại' },
  { name: 'Phỏng vấn chuyên môn' },
  { name: 'Phỏng vấn Culture Fit' },
  { name: 'Offer' }
]

interface ApplicationCardItemProps {
  app: CandidateApplicationItem
}

export function ApplicationCardItem({ app }: ApplicationCardItemProps) {
  const job = app.jobDescriptionId
  const deptName =
    typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'Engineering'
  const location = job?.location || 'Hồ Chí Minh'
  const salary = job?.salaryRange || '$2500-$4000'

  const stagesList =
    app.stages && app.stages.length >= 2 ? app.stages : DEFAULT_PIPELINE_STAGES

  const activeIdx =
    app.currentStageIndex !== undefined && app.currentStageIndex >= 0
      ? app.currentStageIndex
      : 0

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
    <div className="p-6 space-y-6 transition-all bg-white border shadow-xs border-slate-200/90 rounded-3xl hover:border-indigo-200">
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
          <div className="relative z-10 flex items-start justify-between">
            {stagesList.map((stg, idx) => {
              const isPassed = idx < activeIdx
              const isActive = idx === activeIdx

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center flex-1 max-w-[120px]"
                >
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

          {/* Connecting Line */}
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
}
