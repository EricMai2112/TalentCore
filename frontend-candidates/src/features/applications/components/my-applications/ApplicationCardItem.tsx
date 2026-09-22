'use client'

import Link from 'next/link'
import { Briefcase, Building2, MapPin, DollarSign, Check, Clock, X, ArrowRight } from 'lucide-react'
import { CandidateApplicationItem } from '../../types/application.types'

interface ApplicationCardItemProps {
  app: CandidateApplicationItem
}

export function ApplicationCardItem({ app }: ApplicationCardItemProps) {
  const job = app.jobDescriptionId
  const deptName =
    typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'Engineering'
  const location = job?.location || 'Hồ Chí Minh'
  const salary = job?.salaryRange || '$2500-$4000'

  const activeIdx =
    app.currentStageIndex !== undefined && app.currentStageIndex >= 0
      ? app.currentStageIndex
      : 0

  const statusLower = ((app as any).status || '').toLowerCase()
  const reviewStatusLower = ((app as any).reviewStatus || '').toLowerCase()
  const stageNameLower = (app.stageName || '').toLowerCase()
  const isRejected =
    statusLower === 'rejected' ||
    reviewStatusLower === 'rejected' ||
    stageNameLower.includes('từ chối') ||
    stageNameLower.includes('reject')

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
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  const step1Date = formatDate(app.appliedAt)
  const rejectedDate = formatDate((app as any).rejectedAt || (app as any).updatedAt || app.appliedAt)

  // Step 2 ("NTD đã xem"): reached if activeIdx >= 1 or if moved past initial stage
  const isStep2Active =
    activeIdx >= 1 ||
    (stageNameLower !== 'applied' && stageNameLower !== 'mới' && stageNameLower !== 'mới ứng tuyển')

  // Step 3 ("Phỏng vấn" / "Đã xác nhận"): reached if activeIdx >= 3 or interview/offer stage
  const isStep3Confirmed =
    !isRejected &&
    (activeIdx >= 3 ||
      stageNameLower.includes('interview') ||
      stageNameLower.includes('phỏng vấn') ||
      stageNameLower.includes('offer'))

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

      {/* 3-Step CV Stepper Progress Bar */}
      <div className="py-4 px-4 sm:px-8 bg-slate-50/50 border border-slate-100 rounded-2xl">
        <div className="flex items-start justify-between relative">
          {/* Step 1: Đã ứng tuyển */}
          <div className="flex flex-col items-center text-center z-10 min-w-[90px]">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs mb-2">
              <Check size={16} className="stroke-[3]" />
            </div>
            <span className="text-xs font-bold text-slate-800">Đã ứng tuyển</span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">{step1Date}</span>
          </div>

          {/* Line 1 -> 2 */}
          <div className="flex-1 mx-2 relative top-4">
            <div className={`h-0.5 ${isStep2Active ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>

          {/* Step 2: NTD đã xem */}
          <div className="flex flex-col items-center text-center z-10 min-w-[90px]">
            {isStep2Active ? (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs mb-2">
                <Check size={16} className="stroke-[3]" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mb-2">
                <Clock size={15} />
              </div>
            )}
            <span className={`text-xs font-bold ${isStep2Active ? 'text-slate-800' : 'text-slate-400'}`}>
              NTD đã xem
            </span>
          </div>

          {/* Line 2 -> 3 */}
          <div className="flex-1 mx-2 relative top-4">
            {isRejected ? (
              <div className="w-full border-b-2 border-dashed border-rose-300 h-0" />
            ) : (
              <div className={`h-0.5 ${isStep3Confirmed ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>

          {/* Step 3: Chờ phản hồi / Đã xác nhận / Đã từ chối */}
          <div className="flex flex-col items-center text-center z-10 min-w-[90px]">
            {isRejected ? (
              <>
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 border border-rose-200 flex items-center justify-center mb-2">
                  <X size={16} className="stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-rose-500">Đã từ chối</span>
                <span className="text-[11px] font-medium text-rose-400 mt-1">{rejectedDate}</span>
              </>
            ) : isStep3Confirmed ? (
              <>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs mb-2">
                  <Check size={16} className="stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-slate-800">Đã xác nhận</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">{rejectedDate}</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mb-2">
                  <Clock size={15} />
                </div>
                <span className="text-xs font-bold text-slate-400">Chờ phản hồi</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">Đang chờ</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs border-t border-slate-100">
        <div className="flex items-center gap-4 font-medium text-slate-500">
          <span>
            Ngày ứng tuyển:{' '}
            <strong className="text-slate-700">{step1Date}</strong>
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
