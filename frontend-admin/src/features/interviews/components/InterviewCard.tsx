'use client';

import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Building2,
  Video,
  ExternalLink,
  MoreVertical,
  MessageSquare,
} from 'lucide-react';
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
  LocationType,
} from '../types/interview.types';

interface InterviewCardProps {
  item: InterviewItem;
  onOpenStatusModal: (interview: InterviewItem) => void;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  formatDate: (dateStr?: string) => string;
  getStatusBadge: (status: InterviewStatus) => React.ReactNode;
  getResultBadge: (result: InterviewResult) => React.ReactNode;
}

export default function InterviewCard({
  item,
  onOpenStatusModal,
  activeMenuId,
  setActiveMenuId,
  formatDate,
  getStatusBadge,
  getResultBadge,
}: InterviewCardProps) {
  const cand = item.candidateId;
  const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên';
  const jobTitle =
    typeof item.jobDescriptionId === 'object'
      ? item.jobDescriptionId?.title
      : 'Vị trí tuyển dụng';
  const interviewerName =
    typeof item.interviewerId === 'object'
      ? item.interviewerId?.name || item.interviewerId?.email
      : 'Interviewer';

  return (
    <div className="relative bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        {/* Left Calendar Icon Box */}
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <CalendarIcon size={22} />
        </div>

        {/* Info Column */}
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {candName}
            </h3>
            {getStatusBadge(item.status)}
            {item.result && item.result !== InterviewResult.PENDING && getResultBadge(item.result)}
          </div>

          <p className="text-xs font-semibold text-slate-500">{jobTitle}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <CalendarIcon size={14} className="text-slate-400" />
              <span>{formatDate(item.date)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              <span>
                {item.startTime} - {item.endTime}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <UserIcon size={14} className="text-slate-400" />
              <span>{interviewerName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {item.locationType === LocationType.OFFSITE ? (
                <>
                  <Building2 size={14} className="text-slate-400" />
                  <span>Offsite</span>
                </>
              ) : (
                <>
                  <Video size={14} className="text-indigo-600" />
                  <span className="text-indigo-600 font-semibold">Online</span>
                </>
              )}
            </div>
          </div>

          {/* Feedback quote if available */}
          {item.feedback && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium italic text-slate-600 max-w-2xl">
              &ldquo;{item.feedback}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        {item.locationType === LocationType.ONLINE && item.meetingLink && (
          <a
            href={item.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors cursor-pointer"
          >
            <ExternalLink size={14} />
            <span>Vào phòng</span>
          </a>
        )}

        {/* 3 dots action menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveMenuId(activeMenuId === item._id ? null : item._id)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <MoreVertical size={18} />
          </button>

          {activeMenuId === item._id && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => onOpenStatusModal(item)}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <MessageSquare size={14} className="text-indigo-600" />
                <span>Cập nhật & Đánh giá</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
