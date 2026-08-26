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
  applications: KanbanApplication[];
  onSelectCandidate: (app: KanbanApplication) => void;
}

export default function KanbanColumn({
  stage,
  applications,
  onSelectCandidate,
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
      className={`bg-gray-50/80 border rounded-2xl p-2.5 min-w-[270px] max-w-[300px] flex-1 flex flex-col transition-all duration-200 ${
        isOver
          ? "border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/20"
          : "border-gray-200/70"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 px-0.5">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-2xs truncate max-w-[190px]"
          style={{
            backgroundColor: `${stageColorHex}18`,
            color: stageColorHex,
            border: `1px solid ${stageColorHex}35`,
          }}
          title={stage.name}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: stageColorHex }}
          />
          <span className="truncate">{stage.name}</span>
        </span>

        <span className="px-2 py-0.5 bg-gray-200/80 text-gray-700 font-extrabold text-[11px] rounded-full shrink-0">
          {applications.length}
        </span>
      </div>

      {/* Column Body with SortableContext */}
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 min-h-[380px]">
          {applications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-gray-300 space-y-1.5 select-none">
              <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200/60 flex items-center justify-center text-gray-400">
                <Inbox size={18} />
              </div>
              <span className="text-[11px] font-semibold text-gray-400">Trống</span>
            </div>
          ) : (
            applications.map((app) => (
              <CandidateKanbanCard
                key={app._id}
                application={app}
                onSelect={onSelectCandidate}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
