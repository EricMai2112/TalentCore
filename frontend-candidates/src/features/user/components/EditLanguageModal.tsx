"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Loader2, Languages } from "lucide-react";
import { LanguageItem } from "../types/profile.types";
import { profileApi } from "../services/user.api";

interface EditLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguages: LanguageItem[];
  onSuccess: (updatedLanguages: LanguageItem[]) => void;
}

const LANGUAGE_SUGGESTIONS = [
  "Tiếng Việt",
  "Tiếng Anh",
  "Tiếng Nhật",
  "Tiếng Hàn",
  "Tiếng Trung (Mandarin)",
  "Tiếng Pháp",
  "Tiếng Đức",
];

const PROFICIENCY_LEVELS = [
  "Cơ bản (Elementary)",
  "Giao tiếp thông thường (Intermediate)",
  "Thành thạo công việc (Professional)",
  "Bản ngữ / Thành thạo như người bản xứ (Native / Bilingual)",
];

export default function EditLanguageModal({
  isOpen,
  onClose,
  initialLanguages,
  onSuccess,
}: EditLanguageModalProps) {
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLanguages(
        initialLanguages ? JSON.parse(JSON.stringify(initialLanguages)) : []
      );
      setErrorMsg(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialLanguages]);

  if (!isOpen) return null;

  const handleAddLanguage = () => {
    setLanguages((prev) => [
      ...prev,
      { language: "", proficiency: "Thành thạo công việc (Professional)" },
    ]);
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (
    index: number,
    field: keyof LanguageItem,
    value: string
  ) => {
    setLanguages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const validLanguages = languages
      .map((item) => ({
        language: item.language.trim(),
        proficiency: item.proficiency?.trim() || undefined,
      }))
      .filter((item) => item.language.length > 0);

    try {
      await profileApi.updateProfile({ languages: validLanguages });
      onSuccess(validLanguages);
      onClose();
    } catch (error: any) {
      console.error("Cập nhật ngoại ngữ thất bại:", error);
      setErrorMsg(
        error?.response?.data?.message ||
          "Không thể lưu thông tin ngoại ngữ. Vui lòng thử lại!"
      );
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
      {/* Click backdrop outside */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Languages size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Ngoại ngữ & Trình độ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khai báo các ngôn ngữ bạn có thể sử dụng trong công việc
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
        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto pr-1 flex-1"
        >
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách ngoại ngữ ({languages.length})
            </span>
            <button
              type="button"
              onClick={handleAddLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm ngoại ngữ</span>
            </button>
          </div>

          {languages.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-xs text-slate-500">Chưa có ngoại ngữ nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {languages.map((lang, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  {/* Tên ngôn ngữ */}
                  <div className="flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      list="language-suggestions"
                      required
                      value={lang.language}
                      onChange={(e) =>
                        handleLanguageChange(index, "language", e.target.value)
                      }
                      placeholder="VD: Tiếng Anh, Tiếng Nhật..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Mức độ thành thạo */}
                  <div className="w-full sm:w-56 shrink-0">
                    <select
                      value={
                        lang.proficiency ||
                        "Thành thạo công việc (Professional)"
                      }
                      onChange={(e) =>
                        handleLanguageChange(
                          index,
                          "proficiency",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      {PROFICIENCY_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nút xóa */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(index)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                    title="Xóa ngoại ngữ này"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Datalist gợi ý nhanh ngôn ngữ */}
          <datalist id="language-suggestions">
            {LANGUAGE_SUGGESTIONS.map((sug) => (
              <option key={sug} value={sug} />
            ))}
          </datalist>

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