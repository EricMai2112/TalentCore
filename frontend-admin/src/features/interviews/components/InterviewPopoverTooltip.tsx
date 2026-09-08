'use client';

import React from 'react';
import { Clock, User as UserIcon, Building2, Video } from 'lucide-react';
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
  LocationType,
} from '../types/interview.types';

interface InterviewPopoverTooltipProps {
  hoveredInterview: {
    item: InterviewItem;
    x: number;
    y: number;
  };
  formatDate: (dateStr?: string) => string;
  getStatusBadge: (status: InterviewStatus, confirmationStatus?: string) => React.ReactNode;
  getResultBadge: (result: InterviewResult) => React.ReactNode;
}

export default function InterviewPopoverTooltip({
  hoveredInterview,
  formatDate,
  getStatusBadge,
  getResultBadge,
}: InterviewPopoverTooltipProps) {
  const { item, x, y } = hoveredInterview;

  const candidateName =
    typeof item.candidateId === 'object'
      ? item.candidateId?.fullName || item.candidateId?.name
      : 'Ứng viên';

  const jobTitle =
    typeof item.jobDescriptionId === 'object'
      ? item.jobDescriptionId?.title
      : 'Vị trí tuyển dụng';

  const interviewerName =
    typeof item.interviewerId === 'object'
      ? item.interviewerId?.name || item.interviewerId?.email
      : 'Interviewer';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      className="z-[9999] w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
    >
      {/* Top Colored Accent Bar */}
      <div
        className={`h-1.5 w-full ${
          item.status === InterviewStatus.COMPLETED
            ? 'bg-emerald-500'
            : item.status === InterviewStatus.CANCELLED
            ? 'bg-rose-500'
            : 'bg-indigo-600'
        }`}
      />

      <div className="p-4 space-y-3">
        {/* Status Header */}
      <div className="flex items-center justify-between">
        {getStatusBadge(item.status, item.confirmationStatus)}
        {item.result &&
          item.result !== InterviewResult.PENDING &&
          getResultBadge(item.result)}
      </div>

      {/* Candidate Info */}
      <div>
        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
          {candidateName}
        </h4>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{jobTitle}</p>
      </div>

      {/* Details List */}
      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-indigo-600 shrink-0" />
          <span>
            {formatDate(item.date)} ({item.startTime} - {item.endTime})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <UserIcon size={13} className="text-slate-400 shrink-0" />
          <span>
            Interviewer:{' '}
            <strong className="text-slate-800">{interviewerName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.locationType === LocationType.OFFSITE ? (
            <>
              <Building2 size={13} className="text-slate-400 shrink-0" />
              <span>Hình thức: Offsite</span>
            </>
          ) : (
            <>
              <Video size={13} className="text-indigo-600 shrink-0" />
              <span className="text-indigo-600 font-bold">
                Hình thức: Online (Jitsi Meet)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quote feedback if available */}
      {item.feedback && (
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] italic text-slate-600">
          &ldquo;{item.feedback}&rdquo;
        </div>
      )}
      </div>
    </div>
  );
}
