"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Briefcase, Check, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { PositionWithSkills, Skill } from "../types/skill.types";
import SkillTag from "./SkillTag";

interface PositionRowProps {
  position: PositionWithSkills;
  allSkills: Skill[];                          // global skill pool để suggest
  onAddSkill: (positionId: string, skillId: string) => Promise<void>;
  onRemoveSkill: (positionId: string, skillId: string) => Promise<void>;
  onEditPosition: (position: PositionWithSkills) => void;
  onDeletePosition: (position: PositionWithSkills) => void;
}

export default function PositionRow({
  position,
  allSkills,
  onAddSkill,
  onRemoveSkill,
  onEditPosition,
  onDeletePosition,
}: PositionRowProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [loadingSkillId, setLoadingSkillId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input khi mở
  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  // Skills chưa có trong position
  const existingIds = new Set(position.skillIds.map((s) => s._id));
  const suggestions = allSkills.filter(
    (s) =>
      !existingIds.has(s._id) &&
      s.name.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const handleSelectSkill = async (skill: Skill) => {
    setLoadingSkillId(skill._id);
    try {
      await onAddSkill(position._id, skill._id);
    } finally {
      setLoadingSkillId(null);
      setQuery("");
      setIsAdding(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    setLoadingSkillId(skillId);
    try {
      await onRemoveSkill(position._id, skillId);
    } finally {
      setLoadingSkillId(null);
    }
  };

  return (
    <div className="flex items-start gap-3 py-2.5 group/pos">
      {/* Position label */}
      <div className="flex items-center gap-1.5 shrink-0 w-40 sm:w-48">
        <Briefcase size={13} className="text-gray-300 shrink-0" />
        <span className="text-xs font-semibold text-gray-500 truncate">
          {position.name}
        </span>
        {/* Edit / Delete — hiện khi hover row */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover/pos:opacity-100 transition-opacity ml-auto">
          <button
            onClick={() => onEditPosition(position)}
            className="p-0.5 text-gray-300 hover:text-indigo-500 transition-colors cursor-pointer"
            title="Sửa vị trí"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={() => onDeletePosition(position)}
            className="p-0.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
            title="Xóa vị trí"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Skills + inline add */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
        {position.skillIds.map((skill) =>
          loadingSkillId === skill._id ? (
            <span
              key={skill._id}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-400 text-xs rounded-lg"
            >
              <Loader2 size={10} className="animate-spin" />
              {skill.name}
            </span>
          ) : (
            <SkillTag
              key={skill._id}
              skill={skill}
              onRemove={handleRemoveSkill}
            />
          ),
        )}

        {/* Inline add skill */}
        {isAdding ? (
          <div className="relative">
            <div className="flex items-center gap-1 px-2 py-1 border border-indigo-300 rounded-lg bg-white shadow-sm">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kỹ năng..."
                className="text-xs outline-none w-28 text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={() => { setIsAdding(false); setQuery(""); }}
                className="text-gray-300 hover:text-gray-500 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            {/* Dropdown suggestions */}
            {query.trim().length > 0 && (
              <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[160px] max-h-44 overflow-y-auto">
                {suggestions.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">
                    Không tìm thấy kỹ năng
                  </p>
                ) : (
                  suggestions.slice(0, 10).map((s) => (
                    <button
                      key={s._id}
                      onClick={() => handleSelectSkill(s)}
                      disabled={loadingSkillId === s._id}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {loadingSkillId === s._id ? (
                        <Loader2 size={10} className="animate-spin shrink-0" />
                      ) : (
                        <Check size={10} className="opacity-0" />
                      )}
                      {s.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-0.5 px-2 py-1 border border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 text-xs rounded-lg transition-colors cursor-pointer"
            title="Thêm kỹ năng vào vị trí này"
          >
            <Plus size={11} />
          </button>
        )}
      </div>
    </div>
  );
}
