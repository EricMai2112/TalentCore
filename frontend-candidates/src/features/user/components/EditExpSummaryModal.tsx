"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { profileApi } from "../services/user.api";

interface EditExpSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentYears?: number;
  currentLevel?: string;
  onSuccess: (data: { yearsOfExperience: number; currentLevel: string }) => void;
}

const LEVEL_OPTIONS = [
  "Intern / Thực tập sinh",
  "Fresher (Dưới 1 năm)",
  "Junior Developer (1 - 2 năm)",
  "Middle Developer (2 - 4 năm)",
  "Senior Developer (4 - 7 năm)",
  "Lead / Principal / Tech Lead",
  "Manager / Engineering Director",
];

export default function EditExpSummaryModal({
  isOpen,
  onClose,
  currentYears = 0,
  currentLevel = "",
  onSuccess,
}: EditExpSummaryModalProps) {
  const [years, setYears] = useState<number | string>(currentYears);
  const [level, setLevel] = useState(currentLevel || LEVEL_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setYears(currentYears || 0);
      setLevel(currentLevel || LEVEL_OPTIONS[0]);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentYears, currentLevel]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      yearsOfExperience: Number(years),
      currentLevel: level.trim(),
    };
    try {
      await profileApi.updateProfile(payload);
      onSuccess(payload);
      onClose();
    } catch (error) {
      console.error("Cập nhật thông tin thất bại:", error);
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
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-900 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <h3 className="text-lg font-bold text-slate-900">
            Số năm kinh nghiệm & Cấp bậc
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Số năm kinh nghiệm tích lũy
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                required
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
              />
              <span className="text-xs font-bold text-slate-500">năm</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cấp bậc hiện tại
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check size={13} />
                  <span>Lưu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}