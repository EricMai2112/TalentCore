'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Screen boundary clamping to prevent horizontal scrollbars
  const TOOLTIP_WIDTH = 288; // w-72
  const margin = 16;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

  let safeLeft = x;
  if (safeLeft - TOOLTIP_WIDTH / 2 < margin) {
    safeLeft = TOOLTIP_WIDTH / 2 + margin;
  } else if (safeLeft + TOOLTIP_WIDTH / 2 > screenWidth - margin) {
    safeLeft = screenWidth - margin - TOOLTIP_WIDTH / 2;
  }

  let safeTop = y;
  let translateY = '-100%';
  if (safeTop - 220 < margin) {
    safeTop = y + 24;
    translateY = '0%';
  }

  const tooltipContent = (
    <div
      style={{
        position: 'fixed',
        left: `${safeLeft}px`,
        top: `${safeTop}px`,
        transform: `translate(-50%, ${translateY})`,
      }}
      className="z-[9999] w-72 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/15 border border-white/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
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
        <div className="p-2.5 bg-white/60 border border-white/80 rounded-xl text-[11px] italic text-slate-700 backdrop-blur-sm">
          &ldquo;{item.feedback}&rdquo;
        </div>
      )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(tooltipContent, document.body);
}
