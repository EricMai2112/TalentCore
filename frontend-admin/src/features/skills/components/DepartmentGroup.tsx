"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { DepartmentSkillGroup, PositionWithSkills, Skill } from "../types/skill.types";
import PositionRow from "./PositionRow";

// Màu icon theo tên dept — hash đơn giản
const DEPT_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-orange-100", text: "text-orange-500" },
  { bg: "bg-green-100", text: "text-green-600" },
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-pink-100", text: "text-pink-500" },
  { bg: "bg-teal-100", text: "text-teal-600" },
];

function getDeptColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return DEPT_COLORS[Math.abs(h) % DEPT_COLORS.length];
}

function getDeptInitial(name: string) {
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

interface DepartmentGroupProps {
  group: DepartmentSkillGroup;
  allSkills: Skill[];
  onAddSkill: (positionId: string, skillId: string) => Promise<void>;
  onRemoveSkill: (positionId: string, skillId: string) => Promise<void>;
  onEditPosition: (position: PositionWithSkills) => void;
  onDeletePosition: (position: PositionWithSkills) => void;
  onAddPosition: (deptId: string) => void;
  defaultOpen?: boolean;
}

export default function DepartmentGroup({
  group,
  allSkills,
  onAddSkill,
  onRemoveSkill,
  onEditPosition,
  onDeletePosition,
  onAddPosition,
  defaultOpen = false,
}: DepartmentGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const color = getDeptColor(group.deptName);
  const initial = getDeptInitial(group.deptName);

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:bg-white/85 transition-all">
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsOpen((p) => !p)}
      >
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs ${color.bg} ${color.text}`}
        >
          {initial}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm">{group.deptName}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {group.totalPositions} vị trí · {group.totalSkills} kỹ năng
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expanded body */}
      {isOpen && (
        <div className="border-t border-slate-100/80 px-5 py-4 space-y-0.5 bg-slate-50/30">
          {group.positions.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Chưa có vị trí nào trong phòng ban này.
            </p>
          ) : (
            group.positions.map((pos) => (
              <PositionRow
                key={pos._id}
                position={pos}
                allSkills={allSkills}
                onAddSkill={onAddSkill}
                onRemoveSkill={onRemoveSkill}
                onEditPosition={onEditPosition}
                onDeletePosition={onDeletePosition}
              />
            ))
          )}

          {/* Add position button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddPosition(group.deptId);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/60 border border-dashed border-blue-200 rounded-xl transition-colors cursor-pointer"
            >
              <Plus size={12} />
              Thêm vị trí
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
