"use client";

import { useMemo } from "react";
import { User as UserIcon, Calendar, Clock, Star, AlertTriangle } from "lucide-react";
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

  // Skills array
  const skillsList = useMemo(() => {
    if (job?.requiredSkills && job.requiredSkills.length > 0) {
      return job.requiredSkills.map((s) => (typeof s === "object" ? s.name : s));
    }
    if (candidate?.skills && candidate.skills.length > 0) {
      return candidate.skills.map((s) => (typeof s === "object" ? s.name : s));
    }
    return ["React", "TypeScript", "Next.js"];
  }, [job, candidate]);

  const visibleSkills = skillsList.slice(0, 3);
  const remainingSkillsCount = skillsList.length - visibleSkills.length;

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

  // Score color ring (3 màu: Xanh >= 70, Vàng >= 50, Đỏ < 50)
  const scoreRingColor =
    aiScore >= 70
      ? "border-emerald-500 text-emerald-700 bg-emerald-50/70"
      : aiScore >= 50
      ? "border-amber-500 text-amber-700 bg-amber-50/70"
      : "border-rose-400 text-rose-600 bg-rose-50";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect && onSelect(application)}
      className={`bg-white border rounded-2xl p-4 transition-all cursor-grab active:cursor-grabbing space-y-3.5 group select-none relative ${
        isOverlay
          ? "border-indigo-400 shadow-2xl ring-2 ring-indigo-500/30 scale-105"
          : "border-gray-100 hover:border-indigo-200 shadow-2xs hover:shadow-md"
      }`}
    >
      {/* Header Row: Avatar, Name, Job Title & AI Fit Score Circle Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border ${avatarBg}`}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {name}
            </h4>
            <p className="text-xs font-medium text-gray-500 truncate">
              {job?.title || "Vị trí tuyển dụng"}
            </p>
          </div>
        </div>

        {hasScore ? (
          <div
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs ${scoreRingColor}`}
            title={`Điểm AI Match: ${aiScore}%`}
          >
            {aiScore}
          </div>
        ) : (
          <span className="text-[10px] text-gray-400 font-bold italic bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg shrink-0">
            AI đang chấm...
          </span>
        )}
      </div>

      {/* Cảnh báo Bắt buộc hiển thị nổi bật trên thẻ */}
      {application.isMissingMandatory && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5 text-rose-700 text-[11px] font-bold shadow-2xs">
          <AlertTriangle size={13} className="shrink-0 text-rose-600" />
          <span className="truncate">Thiếu tiêu chí Bắt buộc</span>
        </div>
      )}

      {/* Skills Badges Pill Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {visibleSkills.map((skill, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 bg-purple-50/80 border border-purple-100 text-purple-700 text-[11px] font-semibold rounded-lg"
          >
            {skill}
          </span>
        ))}
        {remainingSkillsCount > 0 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-lg">
            +{remainingSkillsCount}
          </span>
        )}
      </div>

      {/* Review Status / Rating Score Bar */}
      {application.ratingScore && (
        <div className="p-2 bg-amber-50/70 border border-amber-100 rounded-xl flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
            <Clock size={12} className="text-amber-600" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-amber-900">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{application.ratingScore}</span>
          </div>
        </div>
      )}

      {/* Footer Info: Interviewer & Applied Date */}
      <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-gray-400 font-medium">
        <div className="flex items-center gap-1 truncate max-w-[140px]">
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