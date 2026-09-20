'use client'

import { useMemo } from 'react'
import { User as UserIcon, Calendar, Clock, Star, AlertTriangle, Briefcase } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { KanbanApplication } from '../types/kanban.types'

interface CandidateKanbanCardProps {
  application: KanbanApplication
  onSelect?: (app: KanbanApplication) => void
  isOverlay?: boolean
}

export default function CandidateKanbanCard({
  application,
  onSelect,
  isOverlay = false
}: CandidateKanbanCardProps) {
  const candidate = application.candidateId
  const job = application.jobDescriptionId
  const user = candidate?.userId

  // dnd-kit sortable hook (disabled when in DragOverlay to avoid double transform and node rect recalculation shifts)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application._id,
    disabled: isOverlay
  })

  // Apply sortable transform ONLY to original card in column, NOT in DragOverlay
  const style = isOverlay
    ? undefined
    : {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1
      }

  // Extract display name & initials
  const name = user?.name || candidate?.fullName || candidate?.profileName || 'Ứng viên'
  const initials = useMemo(() => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }, [name])

  // Deterministic pastel color palette for avatars
  const avatarBg = useMemo(() => {
    const colors = [
      'bg-purple-500/10 text-purple-700 border-purple-200/60',
      'bg-indigo-500/10 text-indigo-700 border-indigo-200/60',
      'bg-blue-500/10 text-[#3B82F6] border-blue-200/60',
      'bg-pink-500/10 text-pink-700 border-pink-200/60',
      'bg-teal-500/10 text-teal-700 border-teal-200/60'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
    return colors[hash % colors.length]
  }, [name])

  const hasScore = application.aiFitScore !== null && application.aiFitScore !== undefined
  const aiScore = application.aiFitScore ?? 0

  // Primary interviewer name
  const interviewerName = useMemo(() => {
    if (job?.interviewerIds && job.interviewerIds.length > 0) {
      const first = job.interviewerIds[0]
      return typeof first === 'object' ? first.name : 'Nhà tuyển dụng'
    }
    if (job?.interviewerId) {
      return typeof job.interviewerId === 'object' ? job.interviewerId.name : 'Nhà tuyển dụng'
    }
    return null
  }, [job])

  // Format applied date
  const formattedDate = useMemo(() => {
    if (!application.appliedAt) return 'N/A'
    try {
      const d = new Date(application.appliedAt)
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
    } catch {
      return 'N/A'
    }
  }, [application.appliedAt])

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={() => !isOverlay && onSelect && onSelect(application)}
      className={`backdrop-blur-md rounded-2xl p-3.5 transition-all flex flex-col justify-between h-[162px] group select-none relative border ${
        isOverlay
          ? 'border-[#3B82F6] bg-white/95 shadow-2xl ring-4 ring-[#3B82F6]/30 cursor-grabbing pointer-events-none w-[320px] z-50'
          : 'bg-white/60 border-white/80 hover:bg-white/80 hover:border-[#3B82F6]/60 shadow-md shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing w-full'
      }`}
    >
      {/* Upper Section */}
      <div className="space-y-2">
        {/* Row 1: Avatar, Candidate Name & AI Match Score Gauge */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 border shadow-2xs ${avatarBg}`}
            >
              {initials}
            </div>

            <h4
              className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#3B82F6] transition-colors"
              title={name}
            >
              {name}
            </h4>
          </div>

          {hasScore ? (
            <div
              className="relative w-10 h-10 shrink-0 flex items-center justify-center"
              title={`Điểm AI Match: ${aiScore}%`}
            >
              <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  className={
                    aiScore >= 70
                      ? 'text-emerald-100'
                      : aiScore >= 50
                        ? 'text-amber-100'
                        : 'text-rose-100'
                  }
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  className={
                    aiScore >= 70
                      ? 'text-emerald-500'
                      : aiScore >= 50
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  }
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray={100.5}
                  strokeDashoffset={100.5 - (Math.min(100, Math.max(0, aiScore)) / 100) * 100.5}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`absolute text-[11px] font-black tracking-tight ${
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
          ) : (
            <span className="text-[10px] text-slate-400 font-bold italic bg-white/50 border border-white/80 px-2 py-0.5 rounded-lg shrink-0">
              Chờ chấm...
            </span>
          )}
        </div>

        {/* Row 2: Job Position Title */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 w-full pt-0.5">
          <Briefcase size={13} className="text-[#3B82F6] shrink-0" />
          <span
            className="truncate flex-1 font-bold text-slate-800 text-xs"
            title={job?.title || 'Vị trí tuyển dụng'}
          >
            {job?.title || 'Vị trí tuyển dụng'}
          </span>
        </div>
      </div>

      {/* Middle status section */}
      <div className="h-6 flex items-center">
        {application.isMissingMandatory ? (
          <div className="px-2 py-0.5 bg-rose-500/10 border border-rose-300/60 rounded-xl flex items-center gap-1 text-rose-700 text-[10.5px] font-bold shadow-2xs w-full">
            <AlertTriangle size={12} className="shrink-0 text-rose-600" />
            <span className="truncate">Thiếu tiêu chí Bắt buộc</span>
          </div>
        ) : application.ratingScore ? (
          <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-300/60 rounded-xl flex items-center justify-between text-[10.5px] w-full">
            <div className="flex items-center gap-1 text-amber-800 font-semibold">
              <Clock size={11} className="text-amber-600" />
              <span>Chờ duyệt</span>
            </div>
            <div className="flex items-center gap-1 font-extrabold text-amber-900">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{application.ratingScore}</span>
            </div>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* Footer Info: Interviewer & Applied Date */}
      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div
          className="flex items-center gap-1 truncate max-w-[130px]"
          title={interviewerName || 'Tuyển dụng'}
        >
          <UserIcon size={12} className="shrink-0 text-slate-400" />
          <span className="truncate font-semibold text-slate-600">{interviewerName || 'Tuyển dụng'}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0 font-semibold text-slate-500">
          <Calendar size={12} className="text-slate-400" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}
