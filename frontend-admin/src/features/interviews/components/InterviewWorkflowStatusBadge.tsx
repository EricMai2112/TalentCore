"use client";

import React from "react";
import { InterviewStatus } from "../types/interview.types";

interface InterviewWorkflowStatusBadgeProps {
  status: InterviewStatus;
  confirmationStatus?: string;
}

/**
 * Component hiển thị nhãn trạng thái phỏng vấn chuẩn hóa gồm đúng 6 trạng thái:
 * 1. Chờ Trưởng phòng lên lịch
 * 2. Chờ HR duyệt
 * 3. Chờ ứng viên xác nhận
 * 4. Đã lên lịch
 * 5. Đã kết thúc
 * 6. Đã hủy / Từ chối
 */
export function InterviewWorkflowStatusBadge({
  status,
  confirmationStatus = "CONFIRMED",
}: InterviewWorkflowStatusBadgeProps) {
  // 5. Đã kết thúc
  if (status === InterviewStatus.COMPLETED) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-white border border-slate-900 inline-flex items-center justify-center shrink-0 shadow-xs backdrop-blur-xs">
        <span>Đã kết thúc</span>
      </span>
    );
  }

  // 6. Đã hủy / Từ chối
  if (
    status === InterviewStatus.CANCELLED ||
    confirmationStatus === "CANCELLED" ||
    confirmationStatus === "REJECTED" ||
    confirmationStatus === "CANCEL_REQUESTED"
  ) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 border border-rose-300/60 inline-flex items-center justify-center shrink-0 shadow-2xs backdrop-blur-xs">
        <span>Đã hủy / Từ chối</span>
      </span>
    );
  }

  // 1. Chờ Trưởng phòng lên lịch
  if (confirmationStatus === "WAITING_DEPT_SCHEDULE") {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 border border-amber-300/60 inline-flex items-center justify-center shrink-0 shadow-2xs backdrop-blur-xs">
        <span>Chờ Trưởng phòng lên lịch</span>
      </span>
    );
  }

  // 2. Chờ HR duyệt
  if (confirmationStatus === "WAITING_HR_APPROVAL") {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-800 border border-blue-300/60 inline-flex items-center justify-center shrink-0 shadow-2xs backdrop-blur-xs">
        <span>Chờ HR duyệt</span>
      </span>
    );
  }

  // 4. Đã lên lịch (Ứng viên đã xác nhận tham gia)
  if (
    confirmationStatus === "CONFIRMED" ||
    status === InterviewStatus.UPCOMING ||
    status === InterviewStatus.IN_PROGRESS
  ) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300/80 inline-flex items-center justify-center shrink-0 shadow-2xs backdrop-blur-xs">
        <span>Đã lên lịch</span>
      </span>
    );
  }

  // 3. Chờ ứng viên xác nhận (Mặc định khi đang chờ phản hồi từ ứng viên)
  return (
    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-800 border border-purple-300/60 inline-flex items-center justify-center shrink-0 shadow-2xs backdrop-blur-xs">
      <span>Chờ ứng viên xác nhận</span>
    </span>
  );
}

export default InterviewWorkflowStatusBadge;
