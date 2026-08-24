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
      className={`bg-gray-50/70 border rounded-3xl p-4 min-w-[290px] max-w-[340px] flex-1 flex flex-col transition-all duration-200 ${
        isOver
          ? "border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/20"
          : "border-gray-100"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 mb-4 px-1">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xs"
            style={{
              backgroundColor: `${stageColorHex}15`,
              color: stageColorHex,
              border: `1px solid ${stageColorHex}30`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: stageColorHex }}
            />
            {stage.name.slice(0, 10)}
          </span>

          <h3 className="text-sm font-extrabold text-gray-900 truncate max-w-[130px]">
            {stage.name}
          </h3>
        </div>

        <span className="px-2.5 py-0.5 bg-gray-200/70 text-gray-700 font-bold text-xs rounded-full">
          {applications.length}
        </span>
      </div>

      {/* Column Body with SortableContext */}
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3.5 min-h-[420px]">
          {applications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-gray-300 space-y-2 select-none">
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
                onSelect={onSelectCandidate}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
