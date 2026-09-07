'use client'

import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Building2,
  ExternalLink,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { CandidateInterviewItem } from '../../types/application.types'

interface CandidateInterviewCardItemProps {
  interview: CandidateInterviewItem
}

export function CandidateInterviewCardItem({ interview }: CandidateInterviewCardItemProps) {
  const job = interview.jobDescriptionId
  const deptName =
    typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'Phòng ban'
  const jobTitle = job?.title || 'Vị trí tuyển dụng'

  const interviewerName =
    interview.interviewerId?.name ||
    interview.interviewerIds?.[0]?.name ||
    'Hội đồng phỏng vấn'

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getStatusBadge = () => {
    switch (interview.status) {
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shrink-0">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Hoàn thành</span>
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5 shrink-0">
            <XCircle size={13} className="text-rose-600" />
            <span>Đã hủy</span>
          </span>
        )
      case 'SCHEDULED':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>Đã lên lịch</span>
          </span>
        )
    }
  }

  const getConfirmationBadge = () => {
    if (interview.status !== 'SCHEDULED') return null

    switch (interview.confirmationStatus) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            ✓ Đã xác nhận
          </span>
        )
      case 'RESCHEDULE_REQUESTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            🕒 Đề nghị đổi lịch
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
            Chờ xác nhận
          </span>
        )
    }
  }

  return (
    <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all space-y-4">
      {/* Card Top Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {jobTitle}
            </h3>
            {getConfirmationBadge()}
          </div>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Building2 size={13} className="text-slate-400" />
            <span>{deptName}</span>
          </p>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <Calendar className="text-indigo-600 shrink-0" size={16} />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Thời gian</span>
            <span className="font-bold text-slate-800">
              {interview.startTime} - {interview.endTime}, {formatDate(interview.date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3">
          {interview.locationType === 'ONLINE' ? (
            <Video className="text-cyan-600 shrink-0" size={16} />
          ) : (
            <MapPin className="text-amber-600 shrink-0" size={16} />
          )}
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Hình thức</span>
            <span className="font-bold text-slate-800">
              {interview.locationType === 'ONLINE'
                ? 'Online (Jitsi Meet)'
                : interview.offsiteLocation || 'Trực tiếp tại văn phòng'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3">
          <User className="text-purple-600 shrink-0" size={16} />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Người phỏng vấn</span>
            <span className="font-bold text-slate-800">{interviewerName}</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      {interview.status === 'SCHEDULED' && interview.meetingLink && (
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Video size={14} />
            <span>Vào phòng phỏng vấn</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  )
}
