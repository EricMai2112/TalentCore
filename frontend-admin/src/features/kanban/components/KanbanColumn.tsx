"use client";

import { useMemo } from "react";
import { Inbox } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PipelineStage } from "@/src/features/job-description/types/job-description.types";
import { KanbanApplication } from "../types/kanban.types";
import CandidateKanbanCard from "./CandidateKanbanCard";

interface KanbanColumnProps {
  stage: PipelineStage;
  stages?: PipelineStage[];
  applications: KanbanApplication[];
  onSelectCandidate: (app: KanbanApplication) => void;
  onMoveStage?: (appId: string, targetStageId: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function KanbanColumn({
  stage,
  stages = [],
  applications,
  onSelectCandidate,
  onMoveStage,
  style,
  className = "w-[335px]",
}: KanbanColumnProps) {
  const stageId = stage._id || stage.name;
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
  });

  const itemIds = useMemo(
    () => applications.map((app) => app._id),
    [applications]
  );

  const stageColorHex = stage.color || "#6366f1";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/40 backdrop-blur-md border rounded-3xl overflow-hidden shrink-0 self-stretch flex flex-col transition-all duration-200 ${
        isOver
          ? "border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-md"
          : "border-white/60 shadow-xs hover:border-slate-300/80"
      } ${className}`}
    >
      {/* Full-width Stage Header spanning across the entire column top */}
      <div
        className="w-full py-2.5 px-4 flex items-center justify-between shadow-xs transition-colors shrink-0"
        style={{
          backgroundColor: stageColorHex,
        }}
      >
        <span
          className="text-white text-xs font-black tracking-wider uppercase truncate flex-1"
          title={stage.name}
        >
          {stage.name}
        </span>

        <span className="bg-white/25 backdrop-blur-md text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-white/40 ml-2 shrink-0 shadow-2xs">
          {applications.length}
        </span>
      </div>

      {/* Column Body with SortableContext */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="flex-1 space-y-3.5 min-h-[420px] flex flex-col">
            {applications.length === 0 ? (
              <div className="h-full flex-1 flex flex-col items-center justify-center py-16 text-gray-300 space-y-2 select-none">
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200/60 flex items-center justify-center text-gray-400">
                  <Inbox size={22} />
                </div>
                <span className="text-xs font-semibold text-gray-400">Trống</span>
              </div>
            ) : (
              applications.map((app) => (
                <CandidateKanbanCard
                  key={app._id}
                  application={app}
                  stages={stages}
                  stageColor={stageColorHex}
                  onSelect={onSelectCandidate}
                  onMoveStage={onMoveStage}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
