"use client";

import React from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, CalendarCheck, Radio, Calendar } from "lucide-react";
import { InterviewStatus } from "../types/interview.types";

interface InterviewWorkflowStatusBadgeProps {
  status: InterviewStatus;
  confirmationStatus?: string;
}

export function InterviewWorkflowStatusBadge({
  status,
  confirmationStatus = "CONFIRMED",
}: InterviewWorkflowStatusBadgeProps) {
  if (status === InterviewStatus.IN_PROGRESS) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-800 border border-emerald-300/80 inline-flex items-center gap-1.5 shrink-0 shadow-2xs">
        <Radio size={13} className="text-emerald-600 animate-pulse" />
        <span>Đang diễn ra</span>
      </span>
    );
  }

  if (status === InterviewStatus.UPCOMING) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-800 border border-blue-300/80 inline-flex items-center gap-1.5 shrink-0">
        <CalendarCheck size={13} className="text-blue-600" />
        <span>Sắp diễn ra</span>
      </span>
    );
  }

  if (status === InterviewStatus.COMPLETED) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1.5 shrink-0">
        <CheckCircle2 size={13} className="text-slate-600" />
        <span>Đã kết thúc</span>
      </span>
    );
  }

  if (status === InterviewStatus.CANCELLED) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5 shrink-0">
        <XCircle size={13} className="text-rose-600" />
        <span>Đã hủy</span>
      </span>
    );
  }

  switch (confirmationStatus) {
    case "WAITING_DEPT_SCHEDULE":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5 shrink-0 animate-pulse">
          <Clock size={13} className="text-amber-600" />
          <span>Chờ Trưởng phòng xếp lịch</span>
        </span>
      );

    case "WAITING_HR_APPROVAL":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1.5 shrink-0 animate-pulse">
          <Clock size={13} className="text-sky-600" />
          <span>Chờ HR duyệt</span>
        </span>
      );

    case "REJECTED":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1.5 shrink-0">
          <XCircle size={13} className="text-rose-600" />
          <span>Trưởng phòng từ chối CV</span>
        </span>
      );

    case "CONFIRMED":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-800 border border-blue-300/80 inline-flex items-center gap-1.5 shrink-0">
          <CalendarCheck size={13} className="text-blue-600" />
          <span>Sắp diễn ra</span>
        </span>
      );

    case "CANCEL_REQUESTED":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5 shrink-0">
          <AlertCircle size={13} className="text-rose-600" />
          <span>Ứng viên yêu cầu hủy</span>
        </span>
      );

    case "SCHEDULED":
    default:
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5 shrink-0">
          <Calendar size={13} className="text-indigo-600 animate-pulse" />
          <span>Chờ ứng viên xác nhận</span>
        </span>
      );
  }
}
