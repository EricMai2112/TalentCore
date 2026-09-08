"use client";

import { useMemo } from "react";
import { User as UserIcon, Calendar, Clock, Star, AlertTriangle, Briefcase } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanApplication } from "../types/kanban.types";

interface CandidateKanbanCardProps {
  application: KanbanApplication;
  onSelect?: (app: KanbanApplication) => void;
  isOverlay?: boolean;
}

export default function CandidateKanbanCard({
  application,
  onSelect,
  isOverlay = false,
}: CandidateKanbanCardProps) {
  const candidate = application.candidateId;
  const job = application.jobDescriptionId;
  const user = candidate?.userId;

  // dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  // Extract display name & initials
  const name = user?.name || candidate?.fullName || candidate?.profileName || "Ứng viên";
  const initials = useMemo(() => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  // Deterministic pastel color palette for avatars
  const avatarBg = useMemo(() => {
    const colors = [
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-teal-100 text-teal-700 border-teal-200",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  }, [name]);

  const hasScore = application.aiFitScore !== null && application.aiFitScore !== undefined;
  const aiScore = application.aiFitScore ?? 0;

  // Primary interviewer name
  const interviewerName = useMemo(() => {
    if (job?.interviewerIds && job.interviewerIds.length > 0) {
      const first = job.interviewerIds[0];
      return typeof first === "object" ? first.name : "Nhà tuyển dụng";
    }
    if (job?.interviewerId) {
      return typeof job.interviewerId === "object" ? job.interviewerId.name : "Nhà tuyển dụng";
    }
    return null;
  }, [job]);

  // Format applied date
  const formattedDate = useMemo(() => {
    if (!application.appliedAt) return "2026-07-20";
    try {
      return new Date(application.appliedAt).toISOString().split("T")[0];
    } catch {
      return "2026-07-20";
    }
  }, [application.appliedAt]);


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect && onSelect(application)}
      className={`bg-white border rounded-2xl p-3.5 transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between h-[158px] group select-none relative ${
        isOverlay
          ? "border-indigo-400 shadow-2xl ring-2 ring-indigo-500/30 scale-105"
          : "border-gray-100 hover:border-indigo-200 shadow-2xs hover:shadow-md"
      }`}
    >
      {/* Upper section */}
      <div className="space-y-2">
        {/* Row 1: Avatar, Name & AI Scores */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border ${avatarBg}`}
            >
              {initials}
            </div>

            <h4
              className="text-sm font-extrabold text-gray-900 truncate group-hover:text-indigo-600 transition-colors"
              title={name}
            >
              {name}
            </h4>
          </div>

          {hasScore ? (
            <div
              className="relative w-10 h-10 shrink-0 flex items-center justify-center"
              title={`Điểm AI Match: ${aiScore}%`}
            >
              <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 40 40">
                {/* Background Ring Track (Màu nhạt đồng điệu, không để màu trắng) */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  className={
                    aiScore >= 70
                      ? "text-emerald-100"
                      : aiScore >= 50
                      ? "text-amber-100"
                      : "text-rose-100"
                  }
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                {/* Quantitative Progress Ring */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  className={
                    aiScore >= 70
                      ? "text-emerald-500"
                      : aiScore >= 50
                      ? "text-amber-500"
                      : "text-rose-500"
                  }
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray={100.5}
                  strokeDashoffset={100.5 - (Math.min(100, Math.max(0, aiScore)) / 100) * 100.5}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`absolute text-xs font-black tracking-tight ${
                  aiScore >= 70
                    ? "text-emerald-700"
                    : aiScore >= 50
                    ? "text-amber-700"
                    : "text-rose-600"
                }`}
              >
                {aiScore}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 font-bold italic bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg shrink-0">
              Chờ chấm...
            </span>
          )}
        </div>

        {/* Row 2: Vị trí tuyển dụng nằm dưới Avatar, trải dài toàn thẻ */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 w-full pt-0.5">
          <Briefcase size={12} className="text-indigo-500 shrink-0" />
          <span
            className="truncate flex-1 font-semibold text-slate-700 text-xs"
            title={job?.title || "Vị trí tuyển dụng"}
          >
            {job?.title || "Vị trí tuyển dụng"}
          </span>
        </div>
      </div>

      {/* Middle status section (reserved height for equal card heights) */}
      <div className="h-6 flex items-center">
        {application.isMissingMandatory ? (
          <div className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 text-rose-700 text-[10.5px] font-bold shadow-2xs w-full">
            <AlertTriangle size={12} className="shrink-0 text-rose-600" />
            <span className="truncate">Thiếu tiêu chí Bắt buộc</span>
          </div>
        ) : application.ratingScore ? (
          <div className="px-2 py-0.5 bg-amber-50/70 border border-amber-100 rounded-lg flex items-center justify-between text-[10.5px] w-full">
            <div className="flex items-center gap-1 text-amber-800 font-semibold">
              <Clock size={11} className="text-amber-600" />
              <span>Chờ duyệt</span>
            </div>
            <div className="flex items-center gap-1 font-extrabold text-amber-900">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{application.ratingScore}</span>
            </div>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* Footer Info: Interviewer & Applied Date */}
      <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-gray-400 font-medium">
        <div className="flex items-center gap-1 truncate max-w-[130px]" title={interviewerName || "Tuyển dụng"}>
          <UserIcon size={12} className="shrink-0 text-gray-400" />
          <span className="truncate">{interviewerName || "Tuyển dụng"}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Calendar size={12} className="text-gray-400" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}