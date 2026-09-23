'use client'

import React from 'react'
import { Briefcase, Building2, Calendar, Clock, User as UserIcon, Award, Star } from 'lucide-react'
import { InterviewItem } from '@/src/features/interviews/types/interview.types'

export interface CandidateOverviewBannerProps {
  interview: InterviewItem
  overallScore: number
}

export default function CandidateOverviewBanner({
  interview,
  overallScore
}: CandidateOverviewBannerProps) {
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

  return (
    <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-500/5 rounded-2xl md:rounded-3xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Candidate Profile Avatar & Name */}
        <div className="md:col-span-5 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl font-black bg-gradient-to-br from-[#3B82F6] to-indigo-600 text-white border-2 border-white shadow-md flex items-center justify-center shrink-0 text-base">
            {getInitials(candName || '')}
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 truncate">{candName}</h2>
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
          <div className="flex items-center gap-2 text-slate-800 font-bold">
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
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-lg group-hover:scale-125 transition-all pointer-events-none" />
          <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-blue-100/90 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20">
            <Award size={12} className="text-amber-300" />
            <span>Điểm Tổng Thể</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-3xl font-black text-white tracking-tight drop-shadow-xs">
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
  )
}
