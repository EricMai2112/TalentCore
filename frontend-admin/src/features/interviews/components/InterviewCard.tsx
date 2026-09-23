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
  Bell,
  Eye
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
import { CustomActionMenu } from '@/src/components/common'

interface InterviewCardProps {
  item: InterviewItem
  index?: number
  onOpenStatusModal?: (interview: InterviewItem) => void
  onOpenCandidateDetailModal?: (interview: InterviewItem) => void
  onApproveCandidateCancellation?: (interview: InterviewItem) => void
  onOpenDeptScheduleModal?: (interview: InterviewItem) => void
  onRejectDeptCv?: (interview: InterviewItem) => void
  onApproveHrSchedule?: (interview: InterviewItem) => void
  activeMenuId: string | null
  setActiveMenuId: (id: string | null) => void
  formatDate: (dateStr?: string) => string
  getStatusBadge: (status: InterviewStatus, confirmationStatus?: string) => React.ReactNode
  getResultBadge: (result: InterviewResult) => React.ReactNode
}

export default function InterviewCard({
  item,
  index = 0,
  onOpenStatusModal,
  onOpenCandidateDetailModal,
  onApproveCandidateCancellation,
  onOpenDeptScheduleModal,
  onRejectDeptCv,
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

  const candEmail = typeof cand === 'object' ? cand?.email || 'N/A' : 'N/A'
  const deptObj =
    typeof item.jobDescriptionId === 'object' ? item.jobDescriptionId?.departmentId : null
  const deptName = typeof deptObj === 'object' ? deptObj?.name : 'Phòng ban'

  const isCandidateRejected =
    item.confirmationStatus === 'REJECTED' ||
    item.confirmationStatus === 'CANCELLED' ||
    item.status === InterviewStatus.CANCELLED ||
    (typeof item.applicationId === 'object' &&
      ((item.applicationId as any)?.status === 'REJECTED' ||
       (item.applicationId as any)?.reviewStatus === 'Rejected'))

  return (
    <tr
      className={`transition-colors group hover:bg-white/50 border-b border-slate-200/40 last:border-b-0 ${
        index % 2 === 0 ? '' : 'bg-white/15'
      } ${item.isEscalated ? 'bg-rose-500/5' : ''}`}
    >
      {/* 1. Candidate Name & Email */}
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full font-black bg-blue-500/10 text-[#3B82F6] border border-blue-200/60 flex items-center justify-center shrink-0 text-xs shadow-2xs">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-900 group-hover:text-[#3B82F6] transition-colors truncate">
              {candName}
            </p>
            <p className="text-slate-400 font-medium text-[11px] truncate">{candEmail}</p>
          </div>
        </div>
      </td>

      {/* 2. Position Title */}
      <td className="px-4 py-4 align-middle">
        <p className="text-[13px] font-bold text-slate-900 truncate">{jobTitle}</p>
      </td>

      {/* 3. Department Name */}
      <td className="px-4 py-4 align-middle font-medium text-slate-700 text-[13px]">
        <span className="truncate block max-w-[130px] font-semibold text-slate-800">
          {deptName}
        </span>
      </td>

      {/* 4. Date, Time & Location */}
      <td className="px-4 py-4 align-middle">
        {item.confirmationStatus === 'WAITING_DEPT_SCHEDULE' || !item.date || !item.startTime ? (
          <div className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-[11.5px] shadow-2xs">
            <Clock size={13} className="text-amber-500 shrink-0" />
            <span>Chưa xếp lịch</span>
          </div>
        ) : item.confirmationStatus === 'WAITING_HR_APPROVAL' ? (
          <div className="space-y-1 text-slate-600 text-[11px] font-medium">
            <div className="flex items-center gap-1.5 font-bold text-sky-800 text-[13px]">
              <Clock size={12} className="text-sky-500" />
              <span>{item.startTime} - {item.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <CalendarIcon size={12} className="text-slate-400" />
              <span>{formatDate(item.date)}</span>
            </div>
            <span className="inline-block text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Dự kiến (Chờ HR duyệt)
            </span>
          </div>
        ) : (
          <div className="space-y-1 text-slate-600 text-[11px] font-medium">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[13px]">
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
        )}
      </td>

      {/* 5. Interviewer Name */}
      <td className="px-4 py-4 align-middle font-semibold text-slate-800 text-[13px]">
        <span className="truncate block max-w-[150px]">{interviewerName}</span>
      </td>

      {/* 6. Status & Badges & Alerts (Left aligned) */}
      <td className="px-4 py-4 align-middle text-left">
        <div className="flex flex-col items-start justify-start gap-1.5">
          <div className="inline-flex items-center gap-1.5 flex-wrap justify-start">
            <InterviewWorkflowStatusBadge
              status={item.status}
              confirmationStatus={item.confirmationStatus}
            />
            {item.result && item.result !== InterviewResult.PENDING && getResultBadge(item.result)}
          </div>

          {/* Escalated Status Indicator */}
          {item.isEscalated && !isCancelRequested && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-800 border border-purple-300/60">
              Cần HR xử lý
            </span>
          )}
        </div>
      </td>

      {/* 7. Actions */}
      <td className="px-5 py-4 align-middle text-center">
        <div className="flex items-center justify-center">
          <CustomActionMenu
            menuWidthClass="min-w-[210px]"
            items={[
              {
                id: 'candidate_detail',
                label: 'Xem chi tiết',
                icon: <Eye size={14} />,
                variant: 'primary',
                hidden: !onOpenCandidateDetailModal,
                onClick: () => onOpenCandidateDetailModal?.(item)
              },
              {
                id: 'dept_schedule',
                label:
                  item.confirmationStatus === 'WAITING_HR_APPROVAL'
                    ? 'Cập nhật lịch phỏng vấn'
                    : 'Xếp lịch phỏng vấn',
                icon:
                  item.confirmationStatus === 'WAITING_HR_APPROVAL' ? (
                    <Edit3 size={14} />
                  ) : (
                    <CalendarIcon size={14} />
                  ),
                variant: item.confirmationStatus === 'WAITING_HR_APPROVAL' ? 'indigo' : 'warning',
                hidden:
                  !isDeptManager ||
                  isCandidateRejected ||
                  (item.confirmationStatus !== 'WAITING_DEPT_SCHEDULE' &&
                    item.confirmationStatus !== 'WAITING_HR_APPROVAL') ||
                  !onOpenDeptScheduleModal,
                onClick: () => onOpenDeptScheduleModal?.(item)
              },
              {
                id: 'dept_reject',
                label: 'Từ chối ứng viên',
                icon: <AlertTriangle size={14} />,
                variant: 'danger',
                hidden:
                  !isDeptManager ||
                  isCandidateRejected ||
                  item.confirmationStatus !== 'WAITING_DEPT_SCHEDULE' ||
                  !onRejectDeptCv,
                onClick: () => onRejectDeptCv?.(item)
              },
              {
                id: 'hr_approve',
                label: 'Duyệt lịch phỏng vấn',
                icon: <Check size={14} />,
                variant: 'success',
                hidden:
                  !isHrAdmin ||
                  item.confirmationStatus !== 'WAITING_HR_APPROVAL' ||
                  !onApproveHrSchedule,
                onClick: () => onApproveHrSchedule?.(item)
              },
              {
                id: 'google_meet',
                label: 'Vào Google Meet',
                icon: <Video size={14} />,
                variant: 'primary',
                href: item.meetingLink,
                target: '_blank',
                hidden: !isApproved || item.locationType !== LocationType.ONLINE || !item.meetingLink
              },
              {
                id: 'cancel_approve',
                label: 'Duyệt hủy lịch phỏng vấn',
                icon: <AlertTriangle size={14} />,
                variant: 'danger',
                hidden: !isHrAdmin || !isCancelRequested || !onApproveCandidateCancellation,
                onClick: () => onApproveCandidateCancellation?.(item)
              },
              {
                id: 'evaluate',
                label: 'Đánh giá phỏng vấn',
                icon: <MessageSquare size={14} />,
                variant: 'primary',
                href: `/interviews/${item._id}/evaluate`
              }
            ]}
          />
        </div>
      </td>
    </tr>
  )
}
