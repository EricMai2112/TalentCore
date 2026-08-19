"use client";

import { useState, useEffect } from "react";
import { X, Check, Trash2, Loader2, Plus } from "lucide-react";
import { profileApi } from "../services/user.api";
import { useActiveProfile } from "../context/ActiveProfileContext";
import { ExperienceItem } from "../types/profile.types";

interface EditExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ExperienceItem | null;
  currentIndex?: number | null; // null nếu là thêm mới, có số nếu là chỉnh sửa
  allExperiences: ExperienceItem[];
  onSuccess: (updatedExperiences: ExperienceItem[]) => void;
}

export default function EditExperienceModal({
  isOpen,
  onClose,
  initialData,
  currentIndex,
  allExperiences,
  onSuccess,
}: EditExperienceModalProps) {
  const { saveProfile } = useActiveProfile();
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = currentIndex !== null && currentIndex !== undefined;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPosition(initialData.position || "");
        setCompany(initialData.company || "");
        setStartDate(initialData.startDate || "");
        setEndDate(initialData.endDate || "");
        setIsCurrentJob(initialData.endDate === "Hiện tại" || !initialData.endDate);
        setDescription(initialData.description || "");
        setTechnologies(initialData.technologies ? [...initialData.technologies] : []);
      } else {
        setPosition("");
        setCompany("");
        setStartDate("");
        setEndDate("");
        setIsCurrentJob(false);
        setDescription("");
        setTechnologies([]);
      }
      setTechInput("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies((prev) => [...prev, trimmed]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies((prev) => prev.filter((t) => t !== techToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newExp: ExperienceItem = {
      position: position.trim(),
      company: company.trim(),
      startDate: startDate.trim() || undefined,
      endDate: isCurrentJob ? "Hiện tại" : endDate.trim() || undefined,
      description: description.trim() || undefined,
      technologies: technologies.length > 0 ? technologies : undefined,
    };

    let updatedList: ExperienceItem[] = [];
    if (isEditMode) {
      updatedList = allExperiences.map((item, idx) =>
        idx === currentIndex ? newExp : item
      );
    } else {
      updatedList = [newExp, ...allExperiences];
    }

    try {
      await saveProfile({ experiences: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error) {
      console.error("Cập nhật kinh nghiệm thất bại:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !confirm("Bạn có chắc chắn muốn xóa mục kinh nghiệm này?")) return;
    setIsSubmitting(true);
    const updatedList = allExperiences.filter((_, idx) => idx !== currentIndex);
    try {
      await saveProfile({ experiences: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error) {
      console.error("Xóa kinh nghiệm thất bại:", error);
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
      {/* Backdrop click outside */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <h3 className="text-xl font-bold text-slate-900">
            {isEditMode ? "Chỉnh sửa Kinh nghiệm làm việc" : "Thêm Kinh nghiệm làm việc"}
          </h3>
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
          {/* Vị trí / Chức danh */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Vị trí / Chức danh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="VD: Full-Stack Developer / Frontend Intern"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Công ty / Tổ chức */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Công ty / Doanh nghiệp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="VD: FPT Software / TechPulse Solutions"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bắt đầu (Tháng/Năm)
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="VD: 06/2025"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kết thúc (Tháng/Năm)
              </label>
              <input
                type="text"
                disabled={isCurrentJob}
                value={isCurrentJob ? "Hiện tại" : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="VD: 02/2026"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium disabled:opacity-50 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Checkbox Đang làm việc tại đây */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="isCurrentJobExp"
              checked={isCurrentJob}
              onChange={(e) => {
                setIsCurrentJob(e.target.checked);
                if (e.target.checked) setEndDate("Hiện tại");
                else setEndDate("");
              }}
              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isCurrentJobExp" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              Tôi đang làm việc tại đây
            </label>
          </div>

          {/* Mô tả công việc */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mô tả chi tiết công việc & Đóng góp
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nêu trách nhiệm chính, các tính năng đã phát triển và kết quả đạt được..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all leading-relaxed resize-none"
            />
          </div>

          {/* Công nghệ sử dụng */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Công nghệ / Kỹ năng sử dụng
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                placeholder="VD: React, TypeScript, Docker (Nhấn Enter hoặc nút Thêm)"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Thêm
              </button>
            </div>

            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Xóa kinh nghiệm này</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
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
                    <span>Lưu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}