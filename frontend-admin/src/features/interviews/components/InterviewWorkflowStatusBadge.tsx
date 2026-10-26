"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarCheck,
  Radio,
  Calendar,
} from "lucide-react";
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
      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-800 border border-emerald-300/80 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
        <Radio size={13} className="text-emerald-600 animate-pulse" />
        <span>Đang diễn ra</span>
      </span>
    );
  }

  if (status === InterviewStatus.UPCOMING) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-800 border border-blue-300/80 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
        <CalendarCheck size={13} className="text-blue-600" />
        <span>Sắp diễn ra</span>
      </span>
    );
  }

  if (status === InterviewStatus.COMPLETED) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/70 text-slate-700 border border-slate-200/80 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
        <CheckCircle2 size={13} className="text-slate-600" />
        <span>Đã kết thúc</span>
      </span>
    );
  }

  if (status === InterviewStatus.CANCELLED) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 border border-rose-300/60 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
        <XCircle size={13} className="text-rose-600" />
        <span>Đã hủy</span>
      </span>
    );
  }

  switch (confirmationStatus) {
    case "WAITING_DEPT_SCHEDULE":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 border border-amber-300/60 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
          <Clock size={13} className="text-amber-600 animate-pulse" />
          <span>Chờ Trưởng phòng xếp lịch</span>
        </span>
      );

    case "WAITING_HR_APPROVAL":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-800 border border-blue-300/60 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
          <Clock size={13} className="text-blue-600 animate-pulse" />
          <span>Chờ HR duyệt</span>
        </span>
      );

    case "REJECTED":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-800 border border-rose-300/60 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
          <XCircle size={13} className="text-rose-600" />
          <span>Trưởng phòng từ chối CV</span>
        </span>
      );

    case "CONFIRMED":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-800 border border-blue-300/80 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
          <CalendarCheck size={13} className="text-blue-600" />
          <span>Sắp diễn ra</span>
        </span>
      );

    case "CANCEL_REQUESTED":
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-800 border border-rose-300/80 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs animate-pulse">
          <AlertCircle size={13} className="text-rose-600" />
          <span>Ứng viên yêu cầu hủy</span>
        </span>
      );

    case "SCHEDULED":
    default:
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-800 border border-purple-300/60 inline-flex items-center gap-1.5 shrink-0 shadow-2xs backdrop-blur-xs">
          <Calendar size={13} className="text-purple-600 animate-pulse" />
          <span>Chờ ứng viên xác nhận</span>
        </span>
      );
  }
}

export default InterviewWorkflowStatusBadge;
