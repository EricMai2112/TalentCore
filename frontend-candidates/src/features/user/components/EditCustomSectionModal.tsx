"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Loader2, FileText, Layers } from "lucide-react";
import { CustomSection, CustomSectionItem } from "../types/profile.types";
import { profileApi } from "../services/user.api";

interface EditCustomSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CustomSection | null;
  sectionIndex?: number | null; // null nếu là thêm nhóm mới, number nếu chỉnh sửa nhóm đã có
  allCustomSections: CustomSection[];
  onSuccess: (updatedSections: CustomSection[]) => void;
}

const SECTION_TITLE_SUGGESTIONS = [
  "Giải thưởng & Thành tích",
  "Hoạt động ngoại khóa",
  "Dự án tình nguyện",
  "Ấn phẩm & Nghiên cứu khoa học",
  "Khóa học & Hội thảo",
  "Sở thích & Thế mạnh cá nhân",
];

export default function EditCustomSectionModal({
  isOpen,
  onClose,
  initialData,
  sectionIndex,
  allCustomSections,
  onSuccess,
}: EditCustomSectionModalProps) {
  const [sectionTitle, setSectionTitle] = useState("");
  const [items, setItems] = useState<CustomSectionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditMode = sectionIndex !== null && sectionIndex !== undefined;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSectionTitle(initialData.sectionTitle || "");
        setItems(
          initialData.items ? JSON.parse(JSON.stringify(initialData.items)) : []
        );
      } else {
        setSectionTitle("");
        setItems([
          { title: "", subtitle: "", date: "", description: "" },
        ]);
      }
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

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { title: "", subtitle: "", date: "", description: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof CustomSectionItem,
    value: string
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // Lọc các item có nhập tiêu đề
    const cleanItems = items
      .map((it) => ({
        title: it.title.trim(),
        subtitle: it.subtitle?.trim() || undefined,
        date: it.date?.trim() || undefined,
        description: it.description?.trim() || undefined,
      }))
      .filter((it) => it.title.length > 0);

    if (cleanItems.length === 0) {
      setErrorMsg("Vui lòng thêm ít nhất một nội dung con có Tiêu đề!");
      setIsSubmitting(false);
      return;
    }

    const newSection: CustomSection = {
      sectionTitle: sectionTitle.trim(),
      items: cleanItems,
    };

    let updatedList: CustomSection[] = [];
    if (isEditMode) {
      updatedList = allCustomSections.map((sec, idx) =>
        idx === sectionIndex ? newSection : sec
      );
    } else {
      updatedList = [...allCustomSections, newSection];
    }

    try {
      await profileApi.updateProfile({ customSections: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error: any) {
      console.error("Cập nhật mục tùy chỉnh thất bại:", error);
      setErrorMsg(
        error?.response?.data?.message ||
          "Không thể lưu mục tùy chỉnh. Vui lòng thử lại!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!isEditMode || !confirm("Bạn có chắc chắn muốn xóa toàn bộ mục này?")) return;
    setIsSubmitting(true);
    const updatedList = allCustomSections.filter((_, idx) => idx !== sectionIndex);
    try {
      await profileApi.updateProfile({ customSections: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error) {
      console.error("Xóa mục tùy chỉnh thất bại:", error);
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
        className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {isEditMode ? "Chỉnh sửa Mục tùy chỉnh" : "Thêm mới Mục tùy chỉnh"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Giải thưởng, thành tích, hoạt động ngoại khóa hoặc thông tin nổi bật khác
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

          {/* Tên danh mục */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tên tiêu đề mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="custom-section-suggestions"
              required
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="VD: Giải thưởng & Thành tích / Hoạt động ngoại khóa"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            />
            <datalist id="custom-section-suggestions">
              {SECTION_TITLE_SUGGESTIONS.map((sug) => (
                <option key={sug} value={sug} />
              ))}
            </datalist>
          </div>

          {/* Danh sách các item con */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nội dung chi tiết ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                <Plus size={14} /> Thêm dòng nội dung
              </button>
            </div>

            <div className="space-y-3.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Mục #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa mục này"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Tiêu đề & Thời gian */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2 space-y-1">
                      <input
                        type="text"
                        required
                        value={item.title}
                        onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                        placeholder="Tiêu đề (VD: Giải Nhì Hackathon TechFest 2025)*"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={item.date || ""}
                        onChange={(e) => handleItemChange(idx, "date", e.target.value)}
                        placeholder="Thời gian (VD: 11/2025)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Phụ đề (Tổ chức / Đơn vị trao giải) */}
                  <div>
                    <input
                      type="text"
                      value={item.subtitle || ""}
                      onChange={(e) => handleItemChange(idx, "subtitle", e.target.value)}
                      placeholder="Phụ đề / Đơn vị tổ chức (VD: Bộ Khoa học & Công nghệ)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  {/* Mô tả chi tiết */}
                  <div>
                    <textarea
                      rows={2}
                      value={item.description || ""}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      placeholder="Mô tả tóm tắt kết quả, vai trò hoặc đóng góp..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDeleteSection}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Xóa toàn bộ mục này</span>
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
                    <span>Lưu thay đổi</span>
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