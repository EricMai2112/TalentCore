'use client'

import React from 'react'
import Link from 'next/link'
import { Briefcase, Building2, MapPin, Banknote, Check, Clock, X, ArrowRight } from 'lucide-react'
import { CandidateApplicationItem, PipelineStageInfo } from '../../types/application.types'

interface ApplicationCardItemProps {
  app: CandidateApplicationItem
}

export const getLocalizedStageName = (name: string): string => {
  const n = (name || '').trim().toLowerCase()
  if (n === 'applied' || n === 'ứng tuyển' || n === 'nộp hồ sơ' || n === 'nộp đơn') return 'Ứng tuyển'
  if (n === 'screening' || n === 'sơ loại') return 'Sơ loại'
  if (n === 'department review' || n.includes('chuyên môn') || n.includes('phòng ban')) return 'Đánh giá chuyên môn'
  if (n === 'interview' || n === 'phỏng vấn') return 'Phỏng vấn'
  if (n === 'offer' || n === 'đề nghị') return 'Đề nghị nhận việc'
  if (n === 'hired' || n === 'trúng tuyển' || n === 'nhận việc') return 'Trúng tuyển'
  return name
}

const DEFAULT_PIPELINE_STAGES: PipelineStageInfo[] = [
  { _id: 'default-applied', name: 'Ứng tuyển', order: 1, color: '#3b82f6' },
  { _id: 'default-screening', name: 'Sơ loại', order: 2, color: '#f59e0b' },
  { _id: 'default-dept', name: 'Đánh giá chuyên môn', order: 3, color: '#6366f1' },
  { _id: 'default-interview', name: 'Phỏng vấn', order: 4, color: '#ec4899' },
  { _id: 'default-offer', name: 'Đề nghị nhận việc', order: 5, color: '#10b981' },
  { _id: 'default-hired', name: 'Trúng tuyển', order: 6, color: '#8b5cf6' },
]

export function ApplicationCardItem({ app }: ApplicationCardItemProps) {
  const job = app.jobDescriptionId
  const deptName = typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'Engineering'
  const location = job?.location || 'Hồ Chí Minh'
  const formatSalary = (min?: number, max?: number, fallback?: string): string => {
    if (!min && !max) return fallback || 'Thương lượng'
    if (min && max) {
      if (min >= 1000000) {
        return `${(min / 1000000).toLocaleString('vi-VN')} - ${(max / 1000000).toLocaleString('vi-VN')} triệu VNĐ`
      }
      return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} VNĐ`
    }
    if (min) {
      if (min >= 1000000) return `Từ ${(min / 1000000).toLocaleString('vi-VN')} triệu VNĐ`
      return `Từ ${min.toLocaleString('vi-VN')} VNĐ`
    }
    return fallback || 'Thương lượng'
  }

  const salary = formatSalary(job?.minimumSalary, job?.maximumSalary, job?.salaryRange)

  const pipelineStages =
    app.stages && app.stages.length > 0 ? app.stages : DEFAULT_PIPELINE_STAGES
  const sortedStages = [...pipelineStages].sort((a, b) => a.order - b.order)

  const activeIdx =
    app.currentStageIndex !== undefined && app.currentStageIndex >= 0 ? app.currentStageIndex : 0

  const statusLower = (app.status || '').toLowerCase()
  const reviewStatusLower = (app.reviewStatus || '').toLowerCase()
  const stageNameLower = (app.stageName || '').toLowerCase()
  const isRejected =
    statusLower === 'rejected' ||
    reviewStatusLower === 'rejected' ||
    stageNameLower.includes('từ chối') ||
    stageNameLower.includes('reject')
  const isHired = statusLower === 'hired'

  const currentStageName = getLocalizedStageName(
    sortedStages[activeIdx]?.name || app.stageName || 'Ứng tuyển'
  )

  const getStageBadge = (stageName?: string, stageColor?: string) => {
    const s = stageName ? getLocalizedStageName(stageName) : 'Mới ứng tuyển'
    let style = 'bg-indigo-50 text-indigo-700 border-indigo-200'
    let dotColor = 'bg-indigo-500'

    const sLower = s.toLowerCase()
    if (sLower.includes('tech') || sLower.includes('chuyên môn')) {
      style = 'bg-blue-50 text-blue-600 border-blue-200'
      dotColor = 'bg-blue-500'
    } else if (sLower.includes('phone') || sLower.includes('sơ loại')) {
      style = 'bg-purple-50 text-purple-600 border-purple-200'
      dotColor = 'bg-purple-500'
    } else if (sLower.includes('phỏng vấn')) {
      style = 'bg-pink-50 text-pink-600 border-pink-200'
      dotColor = 'bg-pink-500'
    } else if (sLower.includes('offer') || sLower.includes('đề nghị') || sLower.includes('trúng tuyển')) {
      style = 'bg-emerald-50 text-emerald-600 border-emerald-200'
      dotColor = 'bg-emerald-500'
    } else if (sLower.includes('từ chối') || sLower.includes('reject')) {
      style = 'bg-rose-50 text-rose-600 border-rose-200'
      dotColor = 'bg-rose-500'
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
  const rejectedDate = formatDate(app.rejectedAt || app.updatedAt || app.appliedAt)

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
                <Banknote size={13} className="text-slate-400" />
                {salary}
              </span>
            </div>
          </div>
        </div>

        {/* Stage Badge on Top Right */}
        <div className="shrink-0 self-start sm:self-auto">
          {getStageBadge(
            isRejected ? 'Đã từ chối' : isHired ? 'Đã trúng tuyển' : currentStageName,
            isRejected ? '#e11d48' : isHired ? '#059669' : app.stageColor
          )}
        </div>
      </div>

      {/* Dynamic Pipeline Stepper Progress Bar */}
      <div className="py-4 px-4 sm:px-6 bg-slate-50/70 border border-slate-100 rounded-2xl">
        {/* Stepper Header Status Banner */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200/60 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Tiến trình tuyển dụng
          </span>
          <span
            className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${
              isRejected
                ? 'bg-rose-100 text-rose-700 font-bold border border-rose-200'
                : isHired
                ? 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-200'
                : 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
            }`}
          >
            {isRejected
              ? `Dừng tại vòng ${activeIdx + 1}/${sortedStages.length}: ${currentStageName}`
              : isHired
              ? `Trúng tuyển (${sortedStages.length}/${sortedStages.length})`
              : `Vòng ${activeIdx + 1}/${sortedStages.length}: ${currentStageName}`}
          </span>
        </div>

        {/* Stepper Nodes */}
        <div className="overflow-x-auto pb-1">
          <div className="flex items-start min-w-[560px] w-full">
            {sortedStages.map((stage, idx) => {
              const isLast = idx === sortedStages.length - 1
              let stageState: 'completed' | 'current' | 'rejected' | 'upcoming' = 'upcoming'

              if (isHired) {
                stageState = 'completed'
              } else if (idx < activeIdx) {
                stageState = 'completed'
              } else if (idx === activeIdx) {
                stageState = isRejected ? 'rejected' : 'current'
              } else {
                stageState = 'upcoming'
              }

              // Connection line state to next stage
              const nextLineActive = !isRejected && (idx < activeIdx || isHired)
              const nextLineRejected = isRejected && idx === activeIdx - 1
              const localizedName = getLocalizedStageName(stage.name)

              return (
                <React.Fragment key={stage._id || idx}>
                  {/* Stage Node */}
                  <div className="flex flex-col items-center text-center z-10 shrink-0 w-24">
                    {stageState === 'completed' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs mb-2">
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    )}
                    {stageState === 'current' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white ring-4 ring-blue-100 flex items-center justify-center shadow-xs mb-2">
                        <Clock size={15} className="stroke-[2.5]" />
                      </div>
                    )}
                    {stageState === 'rejected' && (
                      <div className="w-8 h-8 rounded-full bg-rose-600 text-white ring-4 ring-rose-100 flex items-center justify-center shadow-xs mb-2">
                        <X size={16} className="stroke-[3]" />
                      </div>
                    )}
                    {stageState === 'upcoming' && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mb-2">
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                    )}

                    <span
                      className={`text-xs truncate max-w-[95px] px-1 ${
                        stageState === 'completed'
                          ? 'font-bold text-slate-800'
                          : stageState === 'current'
                          ? 'font-extrabold text-blue-700'
                          : stageState === 'rejected'
                          ? 'font-extrabold text-rose-600'
                          : 'font-medium text-slate-400'
                      }`}
                      title={localizedName}
                    >
                      {localizedName}
                    </span>

                    {/* Subtitle / Date */}
                    {stageState === 'completed' && (
                      <span className="text-[11px] font-medium text-slate-400 mt-1">
                        {step1Date}
                      </span>
                    )}
                    {stageState === 'rejected' && (
                      <span className="text-[11px] font-medium text-rose-500 mt-1">
                        {rejectedDate || 'Đã từ chối'}
                      </span>
                    )}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="flex-1 relative top-4 min-w-[20px]">
                      {nextLineRejected ? (
                        <div className="w-full border-b-2 border-dashed border-rose-400 h-0" />
                      ) : (
                        <div
                          className={`h-0.5 ${
                            nextLineActive ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs border-t border-slate-100">
        <div className="flex items-center gap-4 font-medium text-slate-500">
          <span>
            Ngày ứng tuyển: <strong className="text-slate-700">{step1Date}</strong>
          </span>
          {isRejected && (
            <span className="text-rose-500 font-semibold">
              Ngày từ chối: <strong>{rejectedDate}</strong>
            </span>
          )}
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
