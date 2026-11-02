'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  X,
  Clock,
  User as UserIcon,
  Building2,
  Video,
  MapPin,
  ExternalLink,
  Layers,
  ChevronRight,
  Calendar
} from 'lucide-react'
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
  LocationType
} from '../types/interview.types'

export interface ClusterData {
  startTime: string
  endTime: string
  items: InterviewItem[]
}

interface InterviewGroupPopoverModalProps {
  isOpen: boolean
  onClose: () => void
  dateStr: string
  cluster: ClusterData | null
  formatDate: (dateStr?: string) => string
  getStatusBadge: (status: InterviewStatus, confirmationStatus?: string) => React.ReactNode
  getResultBadge: (result: InterviewResult) => React.ReactNode
}

export function InterviewGroupPopoverModal({
  isOpen,
  onClose,
  dateStr,
  cluster,
  formatDate,
  getStatusBadge,
  getResultBadge
}: InterviewGroupPopoverModalProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !cluster || !mounted) return null

  // Format date heading e.g. "Thứ Năm, 24/09/2026"
  const formattedDateHeading = (() => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  })()

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white/90 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200/60 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-500/15 text-[#3B82F6] rounded-xl border border-blue-400/30 shrink-0">
              <Layers size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold leading-snug text-slate-900">
                  Lịch phỏng vấn cùng khung giờ
                </h3>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[11px] font-black rounded-full shadow-2xs shrink-0">
                  {cluster.items.length} buổi
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                <Calendar size={12} className="text-blue-500 shrink-0" />
                <span className="capitalize">{formattedDateHeading}</span>
                <span>•</span>
                <Clock size={12} className="text-slate-400 shrink-0" />
                <span>
                  {cluster.startTime} - {cluster.endTime}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 transition-all cursor-pointer rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 shrink-0"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: List of overlapping interviews */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 [scrollbar-width:thin]">
          {cluster.items.map((item, idx) => {
            const cand = item.candidateId
            const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên'
            const job = item.jobDescriptionId
            const jobTitle = typeof job === 'object' ? job?.title : 'Vị trí tuyển dụng'
            const deptName =
              typeof job === 'object' && typeof job?.departmentId === 'object'
                ? job?.departmentId?.name
                : null
            const interviewerName =
              typeof item.interviewerId === 'object'
                ? item.interviewerId?.name || item.interviewerId?.email
                : 'Người phỏng vấn'
            const meetingUrl =
              item.meetingLink ||
              (item.locationType === LocationType.ONLINE
                ? `https://meet.jit.si/TalentCore-${item._id}`
                : undefined)

            return (
              <div
                key={item._id || idx}
                className="bg-white/80 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all space-y-2.5 group"
              >
                {/* Row 1: Time, Status, Result */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Clock size={13} className="text-[#3B82F6] shrink-0" />
                    <span>
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(item.status, item.confirmationStatus)}
                    {item.result &&
                      item.result !== InterviewResult.PENDING &&
                      getResultBadge(item.result)}
                  </div>
                </div>

                {/* Row 2: Candidate & Job Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-sm font-extrabold truncate transition-colors text-slate-900 group-hover:text-blue-600">
                      {candName}
                    </h4>
                    <p className="text-xs font-semibold truncate text-slate-600">
                      {jobTitle}
                      {deptName && (
                        <span className="font-normal text-slate-400"> · {deptName}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        router.push(`/interviews/${item._id}/evaluate`)
                      }}
                      className="px-3 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Vào đánh giá</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Row 3: Interviewer & Location Details */}
                <div className="flex flex-wrap items-center pt-1 text-xs font-medium gap-x-4 gap-y-1 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <UserIcon size={12} className="text-slate-400 shrink-0" />
                    <span>
                      Phỏng vấn viên: <strong className="text-slate-700">{interviewerName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.locationType === LocationType.ONLINE ? (
                      meetingUrl ? (
                        <a
                          href={meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                          title="Mở link phỏng vấn online"
                        >
                          <span>Online</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                      ) : (
                        <>
                          <span className="font-semibold text-cyan-700">Online</span>
                        </>
                      )
                    ) : (
                      <>
                        <MapPin size={12} className="text-amber-600 shrink-0" />
                        <span className="font-semibold text-amber-700">Trực tiếp (Offsite)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 text-xs border-t border-slate-200/60 bg-slate-50/50">
          <span className="font-medium text-slate-400">
            Mẹo: Bấm &ldquo;Vào đánh giá&rdquo; để xem hồ sơ và gửi kết quả phỏng vấn.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all cursor-pointer shadow-2xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default InterviewGroupPopoverModal
