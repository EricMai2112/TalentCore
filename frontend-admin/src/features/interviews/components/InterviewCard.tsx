'use client'

import React from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Building2,
  Video,
  ExternalLink,
  MoreVertical,
  MessageSquare,
  Edit3,
  AlertTriangle,
  Check,
  Bell
} from 'lucide-react'
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
  LocationType
} from '../types/interview.types'
import { InterviewWorkflowStatusBadge } from './InterviewWorkflowStatusBadge'
import { useAuth } from '@/src/providers/AuthProvider'
import { UserRole } from '@/src/features/users/types/user.types'

interface InterviewCardProps {
  item: InterviewItem
  onOpenStatusModal: (interview: InterviewItem) => void
  onOpenEditModal: (interview: InterviewItem) => void
  onOpenRescheduleModal?: (interview: InterviewItem) => void
  onOpenRescheduleRequestModal?: (interview: InterviewItem) => void
  onApproveReschedule?: (interview: InterviewItem) => void
  onRejectReschedule?: (interview: InterviewItem) => void
  onApproveCandidateCancellation?: (interview: InterviewItem) => void
  onOpenDeptScheduleModal?: (interview: InterviewItem) => void
  onApproveHrSchedule?: (interview: InterviewItem) => void
  activeMenuId: string | null
  setActiveMenuId: (id: string | null) => void
  formatDate: (dateStr?: string) => string
  getStatusBadge: (status: InterviewStatus, confirmationStatus?: string) => React.ReactNode
  getResultBadge: (result: InterviewResult) => React.ReactNode
}

export default function InterviewCard({
  item,
  onOpenStatusModal,
  onOpenEditModal,
  onOpenRescheduleModal,
  onOpenRescheduleRequestModal,
  onApproveReschedule,
  onRejectReschedule,
  onApproveCandidateCancellation,
  onOpenDeptScheduleModal,
  onApproveHrSchedule,
  activeMenuId,
  setActiveMenuId,
  formatDate,
  getStatusBadge,
  getResultBadge
}: InterviewCardProps) {
  const { user: currentUser } = useAuth()
  const roleStr = currentUser?.role as string | undefined
  const isHrAdmin = roleStr === UserRole.HR_ADMIN || roleStr === 'HR_ADMIN' || roleStr === 'ADMIN'
  const isDeptManager = roleStr === UserRole.DEPARTMENT_MANAGER || roleStr === 'DEPARTMENT_MANAGER'
  const isApproved =
    item.confirmationStatus === 'SCHEDULED' || item.confirmationStatus === 'CONFIRMED'

  const cand = item.candidateId
  const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên'
  const jobTitle =
    typeof item.jobDescriptionId === 'object' ? item.jobDescriptionId?.title : 'Vị trí tuyển dụng'
  const interviewerName =
    typeof item.interviewerId === 'object'
      ? item.interviewerId?.name || item.interviewerId?.email
      : 'Chưa chỉ định'

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'U'
    const parts = nameStr.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const initials = getInitials(candName || '')
  const isCancelRequested = item.confirmationStatus === 'CANCEL_REQUESTED'
  const isRescheduleRequested = item.confirmationStatus === 'RESCHEDULE_REQUESTED'

  const candEmail = typeof cand === 'object' ? cand?.email || 'N/A' : 'N/A'
  const deptObj =
    typeof item.jobDescriptionId === 'object' ? item.jobDescriptionId?.departmentId : null
  const deptName = typeof deptObj === 'object' ? deptObj?.name : 'Phòng ban'

  const interviewerObj = typeof item.interviewerId === 'object' ? item.interviewerId : null
  const interviewerEmail = interviewerObj?.email || ''
  const interviewerInitials = getInitials(interviewerName || '')

  return (
    <tr
      className={`hover:bg-white/60 transition-colors group border-b border-slate-300/80 last:border-b-0 ${
        isRescheduleRequested
          ? 'bg-amber-500/10'
          : item.isEscalated
            ? 'bg-rose-500/5'
            : ''
      }`}
    >
      {/* 1. Candidate Name & Email */}
      <td className="px-4 py-3.5 align-middle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full font-black bg-blue-500/10 text-[#3B82F6] border border-blue-200/60 flex items-center justify-center shrink-0 text-xs shadow-2xs">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-[#3B82F6] transition-colors truncate">
              {candName}
            </p>
            <p className="text-slate-400 font-medium text-[11px] truncate">{candEmail}</p>
          </div>
        </div>
      </td>

      {/* 2. Position Title */}
      <td className="px-4 py-3.5 align-middle">
        <p className="text-xs font-bold text-slate-900 truncate">{jobTitle}</p>
      </td>

      {/* 3. Department Name */}
      <td className="px-4 py-3.5 align-middle font-medium text-slate-700 text-xs">
        <span className="truncate block max-w-[130px] font-semibold text-slate-800">
          {deptName}
        </span>
      </td>

      {/* 4. Date, Time & Location */}
      <td className="px-4 py-3.5 align-middle">
        <div className="space-y-1 text-slate-600 text-[11px] font-medium">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            <Clock size={12} className="text-[#3B82F6]" />
            <span>
              {item.startTime} - {item.endTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <CalendarIcon size={12} className="text-slate-400" />
            <span>{formatDate(item.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            {item.locationType === LocationType.OFFSITE ? (
              <>
                <Building2 size={12} className="text-amber-500 shrink-0" />
                <span className="truncate max-w-[130px]">{item.offsiteLocation || 'Offsite'}</span>
              </>
            ) : (
              <>
                <Video size={12} className="text-indigo-500 shrink-0" />
                <span>Online</span>
              </>
            )}
          </div>
        </div>
      </td>

      {/* 5. Interviewer Name (Cleaned without avatar & subtext) */}
      <td className="px-4 py-3.5 align-middle font-semibold text-slate-800 text-xs">
        <span className="truncate block max-w-[150px]">{interviewerName}</span>
      </td>

      {/* 6. Status & Badges & Alerts (Left aligned) */}
      <td className="px-4 py-3.5 align-middle text-left">
        <div className="flex flex-col items-start justify-start gap-1.5">
          <div className="inline-flex items-center gap-1.5 flex-wrap justify-start">
            <InterviewWorkflowStatusBadge
              status={item.status}
              confirmationStatus={item.confirmationStatus}
            />
            {item.result && item.result !== InterviewResult.PENDING && getResultBadge(item.result)}
          </div>

          {/* Reschedule Requested Status Indicator */}
          {isRescheduleRequested && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-300/60 inline-flex items-center gap-1">
              <Bell size={11} className="text-amber-600 animate-bounce" />
              <span>Ứng viên xin đổi lịch</span>
            </span>
          )}

          {/* Escalated Status Indicator */}
          {item.isEscalated && !isCancelRequested && !isRescheduleRequested && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-800 border border-purple-300/60">
              Cần HR xử lý
            </span>
          )}
        </div>
      </td>

      {/* 6. Actions */}
      <td className="px-5 py-3.5 align-middle text-center">
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setActiveMenuId(activeMenuId === item._id ? null : item._id)}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
              activeMenuId === item._id
                ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-white/80 hover:border-slate-300/80'
            }`}
            title="Thao tác"
          >
            <MoreVertical size={16} />
          </button>

          {activeMenuId === item._id && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100 text-left">
              {/* Quick Actions at Top */}
              {isDeptManager &&
                item.confirmationStatus === 'WAITING_DEPT_SCHEDULE' &&
                onOpenDeptScheduleModal && (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuId(null)
                        onOpenDeptScheduleModal(item)
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <CalendarIcon size={14} className="text-amber-500 shrink-0" />
                      <span>Xếp lịch phỏng vấn</span>
                    </button>
                  </div>
                )}

              {isHrAdmin &&
                item.confirmationStatus === 'WAITING_HR_APPROVAL' &&
                onApproveHrSchedule && (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuId(null)
                        onApproveHrSchedule(item)
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span>Duyệt lịch phỏng vấn</span>
                    </button>
                  </div>
                )}

              {isApproved && item.locationType === LocationType.ONLINE && item.meetingLink && (
                <div className="py-1">
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setActiveMenuId(null)}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Video size={14} className="text-[#3B82F6] shrink-0" />
                    <span className="flex-1">Vào Google Meet</span>
                    <ExternalLink size={12} className="text-blue-400" />
                  </a>
                </div>
              )}

              {isRescheduleRequested && onOpenRescheduleRequestModal && (
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenuId(null)
                      onOpenRescheduleRequestModal(item)
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Bell size={14} className="text-amber-500 shrink-0" />
                    <span>Xem yêu cầu đổi lịch</span>
                  </button>
                </div>
              )}

              {isCancelRequested && onApproveCandidateCancellation && (
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenuId(null)
                      onApproveCandidateCancellation(item)
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                    <span>Duyệt hủy lịch phỏng vấn</span>
                  </button>
                </div>
              )}

              {/* Standard Actions */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenuId(null)
                    onOpenStatusModal(item)
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <MessageSquare size={14} className="text-[#3B82F6] shrink-0" />
                  <span>Cập nhật & Đánh giá</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMenuId(null)
                    onOpenEditModal(item)
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} className="text-indigo-600 shrink-0" />
                  <span>Chỉnh sửa lịch phỏng vấn</span>
                </button>

                {onOpenRescheduleModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenuId(null)
                      onOpenRescheduleModal(item)
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Clock size={14} className="text-purple-600 shrink-0" />
                    <span>Đề xuất khung giờ khác</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
