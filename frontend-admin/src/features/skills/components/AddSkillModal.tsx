import { useState, useEffect } from "react";
import { X, Check, Loader2, AlertTriangle, Zap, Plus } from "lucide-react";
import { Skill, DeptOption, PositionWithSkills, CreateSkillDto } from "../types/skill.types";

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
}

export default function AddSkillModal({
  isOpen,
  mode,
  onClose,
  onCreateSkill,
  onCreatePosition,
  onAddSkillToPosition,
  departments,
  positions,
  allSkills,
  preselectedDeptId,
  isSubmitting,
}: AddSkillModalProps) {
  const [tab, setTab] = useState<ModalMode>(mode);

  // ── Add skill form ──────────────────────────────────────────────────────
  const [skillName, setSkillName] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);

  // ── Add position form ───────────────────────────────────────────────────
  const [posName, setPosName] = useState("");
  const [posDeptId, setPosDeptId] = useState(preselectedDeptId ?? "");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTab(mode);
    setSkillName("");
    setAliasInput("");
    setAliases([]);
    setPosName("");
    setPosDeptId(preselectedDeptId ?? "");
    setError(null);
  }, [isOpen, mode, preselectedDeptId]);

  if (!isOpen) return null;

  // ── Alias helpers ───────────────────────────────────────────────────────
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
        if (!posDeptId) return setError("Vui lòng chọn phòng ban");
        await onCreatePosition(posName.trim(), posDeptId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

  const isAddSkill = tab === "add-skill";

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Zap size={15} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {isAddSkill ? "Thêm kỹ năng mới" : "Thêm vị trí mới"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 flex gap-1 bg-white border-b border-gray-100 pb-0">
          {(["add-skill", "add-position"] as ModalMode[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === t
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {t === "add-skill" ? "Kỹ năng" : "Vị trí"}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {isAddSkill ? (
            <>
              {/* Skill name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tên kỹ năng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="React, TypeScript, Docker..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Aliases */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tên khác (aliases)
                  <span className="text-gray-400 font-normal ml-1 normal-case">(tuỳ chọn)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    placeholder="ReactJS, React.js..."
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAlias(); } }}
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={addAlias}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                {aliases.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aliases.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs rounded-lg"
                      >
                        {a}
                        <button
                          type="button"
                          onClick={() => removeAlias(a)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X size={10} />
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tên vị trí <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={posName}
                  onChange={(e) => setPosName(e.target.value)}
                  placeholder="Frontend Developer, Data Engineer..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Phòng ban <span className="text-red-500">*</span>
                </label>
                <select
                  value={posDeptId}
                  onChange={(e) => setPosDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
                >
                  <option value="">— Chọn phòng ban —</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-100 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isAddSkill ? "Tạo kỹ năng" : "Tạo vị trí"}
          </button>
        </div>
      </div>
    </div>
  );
}
