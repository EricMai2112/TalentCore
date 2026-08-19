"use client";

import { useState, useEffect } from "react";
import { X, Check, Trash2 } from "lucide-react";
import { EducationItem } from "../types/profile.types";
import { profileApi } from "../services/user.api";
import { useActiveProfile } from "../context/ActiveProfileContext";

interface EditEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: EducationItem | null;
  currentIndex?: number | null;
  allEducations: EducationItem[];
  onSuccess: (updatedEducations: EducationItem[]) => void;
}

export default function EditEducationModal({
  isOpen,
  onClose,
  initialData,
  currentIndex,
  allEducations,
  onSuccess,
}: EditEducationModalProps) {
  const { saveProfile } = useActiveProfile();
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [major, setMajor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gpa, setGpa] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = currentIndex !== null && currentIndex !== undefined;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setInstitution(initialData.institution || "");
        setDegree(initialData.degree || "");
        setMajor(initialData.major || "");
        setStartDate(initialData.startDate || "");
        setEndDate(initialData.endDate || "");
        setGpa(initialData.gpa !== undefined ? String(initialData.gpa) : "");
      } else {
        setInstitution("");
        setDegree("");
        setMajor("");
        setStartDate("");
        setEndDate("");
        setGpa("");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newEdu: EducationItem = {
      institution: institution.trim(),
      degree: degree.trim() || undefined,
      major: major.trim() || undefined,
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
      gpa: gpa ? Number(gpa) : undefined,
    };

    let updatedList: EducationItem[] = [];
    if (isEditMode) {
      updatedList = allEducations.map((item, idx) => (idx === currentIndex ? newEdu : item));
    } else {
      updatedList = [newEdu, ...allEducations];
    }

    try {
      await saveProfile({ educations: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error) {
      console.error("Cập nhật học vấn thất bại:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !confirm("Bạn có chắc chắn muốn xóa mục học vấn này?")) return;
    setIsSubmitting(true);
    const updatedList = allEducations.filter((_, idx) => idx !== currentIndex);
    try {
      await saveProfile({ educations: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error) {
      console.error("Xóa học vấn thất bại:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <h3 className="text-xl font-bold text-slate-900">
            {isEditMode ? "Chỉnh sửa Học vấn" : "Thêm mới Học vấn"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Tên trường học */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Trường / Cơ sở đào tạo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="VD: Trường Đại học Công nghiệp TP.HCM"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Chuyên ngành & Bằng cấp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chuyên ngành <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="VD: Kỹ thuật phần mềm"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bằng cấp / Trình độ
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="VD: Cử nhân / Kỹ sư"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Thời gian & GPA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bắt đầu
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="VD: 2021"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kết thúc
              </label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="VD: 2025 (hoặc Hiện tại)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Điểm GPA
              </label>
              <input
                type="number"
                step="0.01"
                max="10"
                min="0"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="VD: 3.5"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
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
                <span>Xóa học vấn này</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Check size={14} />
                <span>{isSubmitting ? "Đang lưu..." : "Lưu"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}