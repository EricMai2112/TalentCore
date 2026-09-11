"use client";

import React from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, CalendarCheck } from "lucide-react";
import { InterviewStatus } from "../types/interview.types";

interface InterviewWorkflowStatusBadgeProps {
  status: InterviewStatus;
  confirmationStatus?: string;
}

export function InterviewWorkflowStatusBadge({
  status,
  confirmationStatus = "CONFIRMED",
}: InterviewWorkflowStatusBadgeProps) {
  if (status === InterviewStatus.COMPLETED) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shrink-0">
        <CheckCircle2 size={13} className="text-emerald-600" />
        <span>Hoàn thành</span>
      </span>
    );
  }

  if (status === InterviewStatus.CANCELLED) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5 shrink-0">
        <XCircle size={13} className="text-rose-600" />
        <span>Đã hủy</span>
      </span>
    );
  }

  switch (confirmationStatus) {
    case "WAITING_DEPT_SCHEDULE":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5 shrink-0 animate-pulse">
          <Clock size={13} className="text-amber-600" />
          <span>Chờ lên lịch</span>
        </span>
      );

    case "WAITING_HR_APPROVAL":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1.5 shrink-0 animate-pulse">
          <Clock size={13} className="text-sky-600" />
          <span>Chờ duyệt</span>
        </span>
      );

    case "CONFIRMED":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shrink-0">
          <CalendarCheck size={13} className="text-emerald-600" />
          <span>Xác nhận phỏng vấn</span>
        </span>
      );

    case "CANCEL_REQUESTED":
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5 shrink-0">
          <AlertCircle size={13} className="text-rose-600" />
          <span>Ứng viên yêu cầu hủy</span>
        </span>
      );

    case "SCHEDULED":
    default:
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
          <span>Đã lên lịch</span>
        </span>
      );
  }
}
