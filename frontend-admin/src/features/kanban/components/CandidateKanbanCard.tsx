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

function CircularScoreProgress({ score }: { score: number }) {
  const radius = 11.5;
  const strokeWidth = 2.6;
  const circumference = 2 * Math.PI * radius; // ~72.25
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#10b981"; // emerald-500
  let trackColor = "#d1fae5"; // emerald-100

  if (score < 50) {
    strokeColor = "#f43f5e"; // rose-500
    trackColor = "#ffe4e6"; // rose-100
  } else if (score < 80) {
    strokeColor = "#f59e0b"; // amber-500
    trackColor = "#dbeafe"; // blue-100 track matching reference image
  }

  return (
    <div
      className="relative w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer"
      title={`Điểm AI Match: ${score}%`}
    >
      <svg height="32" width="32" className="transform -rotate-90">
        {/* Background Track Circle */}
        <circle
          stroke={trackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx="16"
          cy="16"
        />
        {/* Foreground Progress Arc */}
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
          strokeLinecap="round"
          r={radius}
          cx="16"
          cy="16"
        />
      </svg>
      <span className="absolute text-[10px] font-extrabold text-gray-900 tracking-tight">
        {score}
      </span>
    </div>
  );
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
  const avatarStyle = useMemo(() => {
    const styles = [
      "bg-blue-100/80 text-blue-700 border-blue-200/60",
      "bg-purple-100/80 text-purple-700 border-purple-200/60",
      "bg-indigo-100/80 text-indigo-700 border-indigo-200/60",
      "bg-teal-100/80 text-teal-700 border-teal-200/60",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return styles[hash % styles.length];
  }, [name]);

  const hasScore = application.aiFitScore !== null && application.aiFitScore !== undefined;
  const aiScore = application.aiFitScore ?? 0;

  // Skills array
  const skillsList = useMemo(() => {
    if (candidate?.skills && candidate.skills.length > 0) {
      return candidate.skills.map((s) => (typeof s === "object" ? s.name : s));
    }
    if (job?.requiredSkills && job.requiredSkills.length > 0) {
      return job.requiredSkills.map((s) => (typeof s === "object" ? s.name : s));
    }
    return ["React", "TypeScript", "Next.js"];
  }, [job, candidate]);

  const visibleSkills = skillsList.slice(0, 3);
  const remainingSkillsCount = skillsList.length - visibleSkills.length;

  // Primary interviewer name
  const interviewerName = useMemo(() => {
    if (job?.interviewerIds && job.interviewerIds.length > 0) {
      const first = job.interviewerIds[0];
      return typeof first === "object" ? first.name : "Eric Mai";
    }
    if (job?.interviewerId) {
      return typeof job.interviewerId === "object" ? job.interviewerId.name : "Eric Mai";
    }
    return "Eric Mai";
  }, [job]);

  // Format applied date (YYYY-MM-DD)
  const formattedDate = useMemo(() => {
    if (!application.appliedAt) return "2026-08-25";
    try {
      return new Date(application.appliedAt).toISOString().split("T")[0];
    } catch {
      return "2026-08-25";
    }
  }, [application.appliedAt]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect && onSelect(application)}
      className={`bg-white border rounded-2xl p-2.5 transition-all cursor-grab active:cursor-grabbing space-y-2 group select-none relative ${
        isOverlay
          ? "border-indigo-400 shadow-2xl ring-2 ring-indigo-500/30 scale-105"
          : "border-gray-100 hover:border-indigo-200/80 shadow-2xs hover:shadow-md"
      }`}
    >
      {/* Top Header Row: Avatar, Name, Position & AI Score Arc */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border ${avatarStyle}`}
          >
            {initials}
          </div>

          <div className="min-w-0 space-y-0.5">
            <h4 className="text-xs font-extrabold text-gray-900 truncate group-hover:text-indigo-600 transition-colors tracking-tight">
              {name}
            </h4>
            <p className="text-[11px] font-medium text-gray-500 truncate leading-tight">
              {job?.title || "Frontend Developer"}
            </p>
          </div>
        </div>

        {hasScore ? (
          <CircularScoreProgress score={aiScore} />
        ) : (
          <span className="text-[9px] text-gray-400 font-semibold italic bg-gray-50/80 border border-gray-100 px-1.5 py-0.5 rounded-md shrink-0">
            AI đang chấm...
          </span>
        )}
      </div>

      {/* Mandatory Criterion Missing Warning Alert */}
      {application.isMissingMandatory && (
        <div className="p-1.5 bg-rose-50 border border-rose-200/80 rounded-lg flex items-center gap-1 text-rose-700 text-[10px] font-bold shadow-2xs">
          <AlertTriangle size={12} className="shrink-0 text-rose-600" />
          <span className="truncate">Thiếu tiêu chí Bắt buộc</span>
        </div>
      )}

      {/* Skills Badges Row */}
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        {visibleSkills.map((skill, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-purple-50/80 border border-purple-100/70 text-purple-700 text-[10px] font-semibold rounded-md"
          >
            {skill}
          </span>
        ))}
        {remainingSkillsCount > 0 && (
          <span className="text-[10px] font-medium text-gray-400 pl-0.5">
            +{remainingSkillsCount}
          </span>
        )}
      </div>

      {/* Review Rating Bar if present */}
      {application.ratingScore && (
        <div className="p-1.5 bg-amber-50/70 border border-amber-100 rounded-lg flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 text-amber-800 font-semibold">
            <Clock size={11} className="text-amber-600" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-amber-900">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>{application.ratingScore}</span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 pt-1.5" />

      {/* Footer Info: Interviewer & Applied Date */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
        <div className="flex items-center gap-1 truncate max-w-[120px]">
          <UserIcon size={11} className="shrink-0 text-gray-400" />
          <span className="truncate">{interviewerName}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Calendar size={11} className="text-gray-400" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}