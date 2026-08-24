"use client";

import { useEffect, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { profileApi } from "../services/user.api";
import { useActiveProfile } from "../context/ActiveProfileContext";
import RichTextEditor, { isHtmlEmpty } from "@/src/components/common/RichTextEditor";

interface EditCareerObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSuccess: (updatedValue: string) => void;
}

export default function EditCareerObjectiveModal({
  isOpen,
  onClose,
  initialValue,
  onSuccess,
}: EditCareerObjectiveModalProps) {
  const { saveProfile } = useActiveProfile();
  const [value, setValue] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue || "");
      setErrorMsg(null);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHtmlEmpty(value)) {
      setErrorMsg("Vui lòng nhập nội dung mục tiêu nghề nghiệp");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const finalValue = value.trim();
      await saveProfile({ careerObjective: finalValue });
      onSuccess(finalValue);
      onClose();
    } catch (error: any) {
      console.error("Cập nhật thất bại:", error);
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
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Chỉnh sửa Mục tiêu nghề nghiệp</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Nội dung mục tiêu nghề nghiệp <span className="text-rose-500">*</span>
            </label>
            <RichTextEditor
              value={value}
              onChange={(val) => setValue(val)}
              placeholder="Nêu rõ mục tiêu ngắn hạn và dài hạn trong sự nghiệp..."
              height={220}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              disabled={isSubmitting || isHtmlEmpty(value)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 transition-all"
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