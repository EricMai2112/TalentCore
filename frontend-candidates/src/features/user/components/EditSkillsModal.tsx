"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Loader2, Cpu } from "lucide-react";
import { SkillItem } from "../types/profile.types";
import { profileApi } from "../services/user.api";
import { useActiveProfile } from "../context/ActiveProfileContext";

interface EditSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSkills: SkillItem[];
  onSuccess: (updatedSkills: SkillItem[]) => void;
}

const PROFICIENCY_OPTIONS = [
  { label: "Mới bắt đầu (Beginner)", value: "BEGINNER" },
  { label: "Trung bình (Intermediate)", value: "INTERMEDIATE" },
  { label: "Thành thạo (Advanced)", value: "ADVANCED" },
  { label: "Chuyên gia (Expert)", value: "EXPERT" },
];

export default function EditSkillsModal({
  isOpen,
  onClose,
  initialSkills,
  onSuccess,
}: EditSkillsModalProps) {
  const { saveProfile } = useActiveProfile();
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSkills(initialSkills ? JSON.parse(JSON.stringify(initialSkills)) : []);
      setErrorMsg(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialSkills]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    setSkills((prev) => [
      ...prev,
      { name: "", proficiency: "INTERMEDIATE", yearsOfExperience: 1 },
    ]);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSkillChange = (
    index: number,
    field: keyof SkillItem,
    value: any
  ) => {
    setSkills((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const validSkills = skills
      .map((s) => ({
        ...s,
        name: s.name.trim(),
        yearsOfExperience: s.yearsOfExperience ? Number(s.yearsOfExperience) : undefined,
      }))
      .filter((s) => s.name.length > 0);

    try {
      await saveProfile({ skills: validSkills });
      onSuccess(validSkills);
      onClose();
    } catch (error: any) {
      console.error("Cập nhật kỹ năng thất bại:", error);
      setErrorMsg(error?.response?.data?.message || "Không thể cập nhật. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      {/* Click outside backdrop để đóng modal */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Kỹ năng chuyên môn
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khai báo các kỹ năng, công cụ kỹ thuật và số năm kinh nghiệm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách kỹ năng ({skills.length})
            </span>
            <button
              type="button"
              onClick={handleAddSkill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm kỹ năng</span>
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-xs text-slate-500">Chưa có kỹ năng nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  {/* Tên kỹ năng */}
                  <div className="flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      required
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                      placeholder="Tên kỹ năng"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Trình độ */}
                  <div className="w-full sm:w-44 shrink-0">
                    <select
                      value={skill.proficiency || "INTERMEDIATE"}
                      onChange={(e) => handleSkillChange(index, "proficiency", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      {PROFICIENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Số năm kinh nghiệm */}
                  <div className="w-24 shrink-0 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="40"
                      value={skill.yearsOfExperience !== undefined ? skill.yearsOfExperience : ""}
                      onChange={(e) => handleSkillChange(index, "yearsOfExperience", e.target.value)}
                      placeholder="Năm"
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 text-center"
                    />
                    <span className="text-[11px] text-slate-400">năm</span>
                  </div>

                  {/* Nút xóa */}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                    title="Xóa kỹ năng này"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}