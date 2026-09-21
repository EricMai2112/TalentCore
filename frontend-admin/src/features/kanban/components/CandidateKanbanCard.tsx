"use client";

import { useMemo } from "react";

import { Calendar, AlertTriangle, Briefcase, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanApplication } from "../types/kanban.types";
import { PipelineStage } from "@/src/features/job-description/types/job-description.types";
import { CustomSelect } from "@/src/components/common";

interface CandidateKanbanCardProps {
  application: KanbanApplication;
  stages?: PipelineStage[];
  stageColor?: string;
  onSelect?: (app: KanbanApplication) => void;
  onMoveStage?: (appId: string, targetStageId: string) => void;
  isOverlay?: boolean;
}

export default function CandidateKanbanCard({
  application,
  stages = [],
  stageColor,
  onSelect,
  onMoveStage,
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

  // Card accent color matching Kanban Stage Color
  const cardColor = useMemo(() => {
    if (stageColor) return stageColor;
    const found = stages.find((s) => s._id === application.currentStageId);
    return found?.color || "#6366f1";
  }, [stageColor, stages, application.currentStageId]);

  // Current, previous, and next stage calculation for Left/Right mover buttons
  const currentStageIndex = useMemo(() => {
    if (!stages || stages.length === 0) return -1;
    return stages.findIndex((s) => s._id === application.currentStageId);
  }, [stages, application.currentStageId]);

  const prevStage = useMemo(() => {
    if (!stages || currentStageIndex <= 0) return null;
    return stages[currentStageIndex - 1];
  }, [stages, currentStageIndex]);

  const nextStage = useMemo(() => {
    if (!stages || currentStageIndex === -1 || currentStageIndex >= stages.length - 1) return null;
    return stages[currentStageIndex + 1];
  }, [stages, currentStageIndex]);

  // Format applied date
  const formattedDate = useMemo(() => {
    if (!application.appliedAt) return "Mới";
    try {
      const d = new Date(application.appliedAt);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch {
      return "Mới";
    }
  }, [application.appliedAt]);

  // Evaluated criteria calculation
  const evaluatedCriteria = useMemo(() => {
    return application.aiEvaluation?.evaluatedCriteria || [];
  }, [application.aiEvaluation]);

  const totalCriteria = evaluatedCriteria.length;
  const passedCriteria = useMemo(() => {
    return evaluatedCriteria.filter((c) => c.isPassed).length;
  }, [evaluatedCriteria]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect && onSelect(application)}
      className={`bg-white/75 hover:bg-white/95 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between group select-none relative min-h-[168px] ${
        isOverlay
          ? "border-indigo-400/80 bg-white/95 backdrop-blur-md shadow-2xl ring-2 ring-indigo-500/30 scale-[1.02] rotate-1"
          : "border-slate-200/60 hover:border-slate-300 shadow-2xs hover:shadow-md"
      }`}
    >
      {/* Top Accent Strip matching Kanban Stage Color */}
      <div
        className="h-2 w-full shrink-0 transition-colors"
        style={{ backgroundColor: cardColor }}
      />

      {/* Card Content Body */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        {/* Top Row: Avatar (Left) + Candidate Name & Job Title (Center) + Score (Top Right - Compact) */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${avatarBg} shadow-2xs mt-0.5`}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4
                className="text-[14px] font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors leading-snug"
                title={name}
              >
                {name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-0.5 min-w-0">
                <Briefcase size={12} className="text-indigo-500 shrink-0" />
                <span
                  className="truncate font-semibold text-slate-600 text-[11.5px]"
                  title={job?.title || "Vị trí tuyển dụng"}
                >
                  {job?.title || "Vị trí tuyển dụng"}
                </span>
              </div>
            </div>
          </div>

          {/* Score Circle placed at Top Right (Compact w-9 h-9 to maximize room for candidate name) */}
          {hasScore ? (
            <div
              className="relative w-9 h-9 shrink-0 flex items-center justify-center"
              title={`Điểm AI Matching: ${aiScore}`}
            >
              <svg className="w-9 h-9 -rotate-90 transform" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className={
                    aiScore >= 70
                      ? "text-emerald-100"
                      : aiScore >= 50
                      ? "text-amber-100"
                      : "text-rose-100"
                  }
                  stroke="currentColor"
                  strokeWidth="3.2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className={
                    aiScore >= 70
                      ? "text-emerald-500"
                      : aiScore >= 50
                      ? "text-amber-500"
                      : "text-rose-500"
                  }
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeDasharray={88}
                  strokeDashoffset={88 - (Math.min(100, Math.max(0, aiScore)) / 100) * 88}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`absolute text-[12px] font-black tracking-tight ${
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
              --
            </span>
          )}
        </div>

                {/* Middle Row: Applied Date & Total Criteria Passed on the SAME ROW */}
        <div className="flex items-center justify-between gap-1.5 text-[11.5px] font-medium pt-0.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-500 shrink-0">
            <Calendar size={12} className="text-gray-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {totalCriteria > 0 && (
              <div
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs transition-colors shrink-0"
                title={`${passedCriteria}/${totalCriteria} tiêu chí đạt yêu cầu`}
              >
                <CheckCircle2
                  size={12}
                  className="text-emerald-600 shrink-0"
                  strokeWidth={2.2}
                />
                <span>{passedCriteria}/{totalCriteria} tiêu chí đạt</span>
              </div>
            )}

            {application.isMissingMandatory && (
              <div
                className="p-1 bg-rose-50 border border-rose-200/90 rounded-lg text-rose-600 flex items-center justify-center shadow-2xs shrink-0"
                title="Thiếu tiêu chí Bắt buộc"
              >
                <AlertTriangle size={12} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Footer: Left button (<) + Stage Dropdown in Center + Right button (>) */}
        <div
          className="pt-2.5 border-t border-slate-100 flex items-center gap-2 justify-between w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút lùi về stage trước (Qua trái) */}
          <button
            type="button"
            disabled={!prevStage}
            onClick={(e) => {
              e.stopPropagation();
              if (prevStage) onMoveStage && onMoveStage(application._id, prevStage._id!);
            }}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 shrink-0 ${
              !prevStage
                ? "bg-slate-50 text-slate-300 border-slate-200/60 cursor-not-allowed opacity-35"
                : "bg-indigo-50/80 hover:bg-indigo-600 text-indigo-600 hover:text-white border-indigo-200/70 hover:border-indigo-600 shadow-2xs hover:shadow-xs active:scale-90 cursor-pointer"
            }`}
            title={prevStage ? `Lùi về: ${prevStage.name}` : "Đang ở giai đoạn đầu tiên"}
          >
            <ChevronLeft size={16} strokeWidth={2.4} />
          </button>

          {/* Dropdown chọn giai đoạn cao cấp & tinh tế */}
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <CustomSelect
              size="sm"
              value={application.currentStageId || ""}
              onChange={(val) => {
                if (val && val !== application.currentStageId) {
                  onMoveStage && onMoveStage(application._id, val);
                }
              }}
              options={
                stages && stages.length > 0
                  ? stages.map((stg) => ({
                      value: stg._id || stg.name,
                      label: stg.name,
                    }))
                  : [{ value: application.currentStageId || "", label: "Đổi giai đoạn" }]
              }
              placeholder="Đổi giai đoạn"
              className="w-full text-center"
            />
          </div>

          {/* Nút tiến lên stage sau (Qua phải) */}
          <button
            type="button"
            disabled={!nextStage}
            onClick={(e) => {
              e.stopPropagation();
              if (nextStage) onMoveStage && onMoveStage(application._id, nextStage._id!);
            }}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 shrink-0 ${
              !nextStage
                ? "bg-slate-50 text-slate-300 border-slate-200/60 cursor-not-allowed opacity-35"
                : "bg-indigo-50/80 hover:bg-indigo-600 text-indigo-600 hover:text-white border-indigo-200/70 hover:border-indigo-600 shadow-2xs hover:shadow-xs active:scale-90 cursor-pointer"
            }`}
            title={nextStage ? `Chuyển tiếp: ${nextStage.name}` : "Đang ở giai đoạn cuối cùng"}
          >
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}