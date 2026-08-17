"use client";

import { useState, useEffect } from "react";
import { X, Check, Trash2, Loader2, FolderGit2 } from "lucide-react";
import { profileApi } from "../services/user.api";
import { ProjectItem } from "../types/profile.types";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProjectItem | null;
  currentIndex?: number | null; // null nếu là thêm mới, có số nếu là chỉnh sửa
  allProjects: ProjectItem[];
  onSuccess: (updatedProjects: ProjectItem[]) => void;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  initialData,
  currentIndex,
  allProjects,
  onSuccess,
}: EditProjectModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditMode = currentIndex !== null && currentIndex !== undefined;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setRole(initialData.role || "");
        setProjectUrl(initialData.projectUrl || "");
        setStartDate(initialData.startDate || "");
        setEndDate(initialData.endDate || "");
        setIsOngoing(initialData.endDate === "Hiện tại" || !initialData.endDate);
        setDescription(initialData.description || "");
        setTechnologies(initialData.technologies ? [...initialData.technologies] : []);
      } else {
        setName("");
        setRole("");
        setProjectUrl("");
        setStartDate("");
        setEndDate("");
        setIsOngoing(false);
        setDescription("");
        setTechnologies([]);
      }
      setTechInput("");
      setErrorMsg(null);
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
    setErrorMsg(null);

    const newProject: ProjectItem = {
      name: name.trim(),
      role: role.trim() || undefined,
      projectUrl: projectUrl.trim() || undefined,
      startDate: startDate.trim() || undefined,
      endDate: isOngoing ? "Hiện tại" : endDate.trim() || undefined,
      description: description.trim() || undefined,
      technologies: technologies.length > 0 ? technologies : undefined,
    };

    let updatedList: ProjectItem[] = [];
    if (isEditMode) {
      updatedList = allProjects.map((item, idx) =>
        idx === currentIndex ? newProject : item
      );
    } else {
      updatedList = [newProject, ...allProjects];
    }

    try {
      await profileApi.updateProfile({ projects: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error: any) {
      console.error("Cập nhật dự án thất bại:", error);
      setErrorMsg(error?.response?.data?.message || "Không thể lưu dự án. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
    setIsSubmitting(true);
    const updatedList = allProjects.filter((_, idx) => idx !== currentIndex);
    try {
      await profileApi.updateProfile({ projects: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error) {
      console.error("Xóa dự án thất bại:", error);
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
      {/* Click backdrop outside để đóng */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FolderGit2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {isEditMode ? "Chỉnh sửa Dự án thực tế" : "Thêm mới Dự án thực tế"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dự án cá nhân, đồ án tốt nghiệp hoặc dự án thực tế đã hoàn thành
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

          {/* Tên dự án & Vai trò */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tên dự án <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: TalentCore ATS"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vai trò / Trách nhiệm
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="VD: Full-Stack / Team Leader"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Đường dẫn URL dự án / Github */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Liên kết Demo / GitHub Repository
            </label>
            <input
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="VD: https://github.com/username/project"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Thời gian thực hiện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bắt đầu (Tháng/Năm)
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="VD: 01/2026"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kết thúc (Tháng/Năm)
              </label>
              <input
                type="text"
                disabled={isOngoing}
                value={isOngoing ? "Hiện tại" : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="VD: 05/2026"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium disabled:opacity-50 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Checkbox Dự án đang thực hiện */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="isOngoingProject"
              checked={isOngoing}
              onChange={(e) => {
                setIsOngoing(e.target.checked);
                if (e.target.checked) setEndDate("Hiện tại");
                else setEndDate("");
              }}
              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isOngoingProject" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              Dự án đang trong quá trình phát triển
            </label>
          </div>

          {/* Mô tả chi tiết dự án */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mô tả dự án & Kết quả đạt được
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả bài toán, giải pháp kỹ thuật, tính năng nổi bật hoặc số lượng người dùng..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all leading-relaxed resize-none"
            />
          </div>

          {/* Công nghệ sử dụng */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Công nghệ / Thư viện sử dụng
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
                placeholder="VD: Next.js, NestJS, MongoDB, Tailwind (Nhấn Enter hoặc nút Thêm)"
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
                <span>Xóa dự án này</span>
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