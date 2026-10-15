"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Loader2, AlertTriangle, Zap, Plus, Briefcase } from "lucide-react";
import { Skill, DeptOption, PositionWithSkills, CreateSkillDto } from "../types/skill.types";
import { CustomInput, CustomSelect } from "@/src/components/common";

type ModalMode = "add-skill" | "add-position";

interface AddSkillModalProps {
  isOpen: boolean;
  mode: ModalMode;
  onClose: () => void;
  // Add skill
  onCreateSkill: (data: CreateSkillDto) => Promise<void>;
  // Add position
  onCreatePosition: (name: string, departmentId: string) => Promise<void>;
  // Add skill → position
  onAddSkillToPosition: (positionId: string, skillId: string) => Promise<void>;
  // Data
  departments: DeptOption[];
  positions: PositionWithSkills[];
  allSkills: Skill[];
  // Pre-selected dept (khi bấm "Thêm vị trí" từ DepartmentGroup)
  preselectedDeptId?: string;
  isSubmitting: boolean;
  isDeptManager?: boolean;
  userDeptId?: string;
}

export default function AddSkillModal({
  isOpen,
  mode,
  onClose,
  onCreateSkill,
  onCreatePosition,
  departments,
  preselectedDeptId,
  isSubmitting,
  isDeptManager = false,
  userDeptId = "",
}: AddSkillModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState<ModalMode>(mode);

  // ── Add skill form ──────────────────────────────────────────────────────
  const [skillName, setSkillName] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);

  // ── Add position form ───────────────────────────────────────────────────
  const [posName, setPosName] = useState("");
  const [posDeptId, setPosDeptId] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync tab khi mode prop đổi hoặc modal mở lại
  useEffect(() => {
    if (isOpen) {
      setTab(mode);
      setSkillName("");
      setAliasInput("");
      setAliases([]);
      setPosName("");
      setPosDeptId(
        isDeptManager && userDeptId
          ? userDeptId
          : preselectedDeptId ?? departments[0]?._id ?? ""
      );
      setError(null);
    }
  }, [isOpen, mode, preselectedDeptId, departments, isDeptManager, userDeptId]);

  if (!isOpen || !isMounted) return null;

  // ── Aliases tags ────────────────────────────────────────────────────────
  const addAlias = () => {
    const v = aliasInput.trim();
    if (!v || aliases.includes(v)) return;
    setAliases((p) => [...p, v]);
    setAliasInput("");
  };

  const removeAlias = (a: string) => setAliases((p) => p.filter((x) => x !== a));

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (tab === "add-skill") {
        if (!skillName.trim()) return setError("Tên kỹ năng không được để trống");
        await onCreateSkill({ name: skillName.trim(), aliases });
      } else {
        if (!posName.trim()) return setError("Tên vị trí không được để trống");
        const finalDeptId = isDeptManager ? userDeptId : posDeptId;
        if (!finalDeptId) return setError("Vui lòng chọn phòng ban");
        await onCreatePosition(posName.trim(), finalDeptId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

  const isAddSkill = tab === "add-skill";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md shadow-2xl shadow-blue-500/10 border border-white/90 overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              {isAddSkill ? <Zap size={18} /> : <Briefcase size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isAddSkill ? "Thêm kỹ năng mới" : "Thêm vị trí mới"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAddSkill ? "Tạo danh mục kỹ năng để khớp nối hồ sơ AI" : "Thiết lập vị trí công việc theo phòng ban"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 flex gap-2 bg-slate-50/50 border-b border-slate-100 shrink-0">
          {(["add-skill", "add-position"] as ModalMode[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {t === "add-skill" ? "Kỹ năng" : "Vị trí tuyển dụng"}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [scrollbar-width:thin]">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {isAddSkill ? (
            <>
              {/* Skill name */}
              <CustomInput
                label="Tên kỹ năng"
                required
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="React, TypeScript, Docker..."
                autoFocus
              />

              {/* Aliases */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Tên khác (aliases)
                  <span className="text-slate-400 font-normal ml-1 normal-case">(tuỳ chọn)</span>
                </label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <CustomInput
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      placeholder="ReactJS, React.js..."
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAlias(); } }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addAlias}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors cursor-pointer shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {aliases.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aliases.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-lg"
                      >
                        {a}
                        <button
                          type="button"
                          onClick={() => removeAlias(a)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Position name */}
              <CustomInput
                label="Tên vị trí"
                required
                value={posName}
                onChange={(e) => setPosName(e.target.value)}
                placeholder="Frontend Developer, Data Engineer..."
                autoFocus
              />

              {/* Department */}
              <CustomSelect
                label="Phòng ban"
                required
                value={isDeptManager && userDeptId ? userDeptId : posDeptId}
                onChange={(val) => setPosDeptId(val)}
                isLocked={isDeptManager}
                disabled={isDeptManager}
                placeholder="— Chọn phòng ban —"
                options={[
                  { value: "", label: "— Chọn phòng ban —" },
                  ...departments.map((d) => ({
                    value: d._id,
                    label: d.name,
                  })),
                ]}
              />
            </>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-3xs cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span>{isAddSkill ? "Tạo kỹ năng" : "Tạo vị trí"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
