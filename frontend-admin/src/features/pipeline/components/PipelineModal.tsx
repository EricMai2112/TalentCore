"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
  GitBranch,
} from "lucide-react";
import { Stage, PipelineTemplate } from "../types/pipeline.types";
import { CustomInput, CustomButton } from "@/src/components/common";

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, stages: Omit<Stage, "_id">[]) => Promise<void>;
  initialTemplate: PipelineTemplate | null;
  isSubmitting: boolean;
}

const PREDEFINED_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#64748b", // Slate
];

export default function PipelineModal({
  isOpen,
  onClose,
  onSubmit,
  initialTemplate,
  isSubmitting,
}: PipelineModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [stages, setStages] = useState<Omit<Stage, "_id">[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState(PREDEFINED_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state with initialTemplate
  useEffect(() => {
    if (initialTemplate) {
      setTemplateName(initialTemplate.name);
      setStages(initialTemplate.stages.map(({ name, order, color }) => ({ name, order, color })));
    } else {
      setTemplateName("");
      setStages([
        { name: "Mới ứng tuyển", order: 1, color: "#3b82f6" },
        { name: "Sàng lọc CV", order: 2, color: "#6366f1" },
        { name: "Phỏng vấn", order: 3, color: "#f59e0b" },
        { name: "Đề nghị tuyển dụng", order: 4, color: "#10b981" },
        { name: "Từ chối", order: 5, color: "#f43f5e" },
      ]);
    }
    setNewStageName("");
    setNewStageColor(PREDEFINED_COLORS[0]);
    setError(null);
  }, [initialTemplate, isOpen]);

  if (!isOpen || !isMounted) return null;

  // Add new stage
  const handleAddStage = () => {
    if (!newStageName.trim()) {
      setError("Vui lòng nhập tên giai đoạn");
      return;
    }

    const newStage: Omit<Stage, "_id"> = {
      name: newStageName.trim(),
      order: stages.length + 1,
      color: newStageColor,
    };

    setStages((prev) => [...prev, newStage]);
    setNewStageName("");
    setNewStageColor(PREDEFINED_COLORS[0]);
    setError(null);
  };

  // Remove stage
  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) {
      setError("Quy trình phải có ít nhất một giai đoạn");
      return;
    }

    const updated = stages.filter((_, idx) => idx !== index);
    // Reorder
    const reordered = updated.map((st, idx) => ({ ...st, order: idx + 1 }));
    setStages(reordered);
    setError(null);
  };

  // Move stage up or down
  const handleMoveStage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    // Recalculate order values
    const reordered = newStages.map((st, idx) => ({ ...st, order: idx + 1 }));
    setStages(reordered);
  };

  // Update inline stage name
  const handleUpdateStageName = (index: number, name: string) => {
    setStages((prev) =>
      prev.map((stage, idx) => (idx === index ? { ...stage, name } : stage))
    );
  };

  // Update inline stage color
  const handleUpdateStageColor = (index: number, color: string) => {
    setStages((prev) =>
      prev.map((stage, idx) => (idx === index ? { ...stage, color } : stage))
    );
  };

  // Validate and submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!templateName.trim()) {
      setError("Tên template không được để trống");
      return;
    }

    if (stages.length === 0) {
      setError("Quy trình cần ít nhất một giai đoạn");
      return;
    }

    const emptyStage = stages.find((st) => !st.name.trim());
    if (emptyStage) {
      setError("Tất cả giai đoạn đều phải có tên");
      return;
    }

    try {
      await onSubmit(templateName.trim(), stages);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-xl shadow-2xl shadow-blue-500/10 border border-white/90 overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <GitBranch size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialTemplate ? "Cập nhật Pipeline Template" : "Tạo Pipeline Template mới"}
              </h3>
              <p className="text-xs text-slate-500">Quy trình các giai đoạn tuyển dụng ứng viên</p>
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

        {/* Modal Scrollable Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:thin]">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Template Name Input */}
          <CustomInput
            label="Tên template"
            required
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="VD: Standard Tech Hiring"
          />

          {/* Stages List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Các giai đoạn (kéo mũi tên để sắp xếp thứ tự)
            </label>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {stages.map((stage, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50/80 border border-slate-100 rounded-2xl p-3 shadow-3xs"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleUpdateStageName(idx, e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none rounded px-2 py-1 text-slate-800 font-semibold text-sm flex-grow min-w-0 transition-colors"
                      placeholder="Tên giai đoạn"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Inline color picker */}
                    <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 shadow-3xs">
                      {PREDEFINED_COLORS.slice(0, 6).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleUpdateStageColor(idx, color)}
                          className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                            stage.color === color ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Reorder and Delete buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStage(idx, "up")}
                        className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-slate-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={() => handleMoveStage(idx, "down")}
                        className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-slate-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={stages.length <= 1}
                        onClick={() => handleRemoveStage(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-20 disabled:hover:text-slate-400 rounded-lg transition-colors ml-1 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Stage Section */}
          <div className="bg-white/60 border border-white/80 rounded-2xl p-4 space-y-3 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Nhập tên giai đoạn mới..."
                className="flex-grow px-3.5 py-2.5 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 bg-white placeholder-slate-400 font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStage();
                  }
                }}
              />
              <CustomButton
                type="button"
                onClick={handleAddStage}
                variant="primary"
                size="sm"
                icon={<Plus size={15} />}
                className="shrink-0"
              >
                Thêm
              </CustomButton>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider shrink-0">
                Màu sắc:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewStageColor(color)}
                    className={`w-4 h-4 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                      newStageColor === color ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-end gap-2.5 sticky bottom-0 z-10 shrink-0">
          <CustomButton
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </CustomButton>
          <CustomButton
            type="button"
            variant="primary"
            onClick={handleFormSubmit}
            isLoading={isSubmitting}
            icon={<Check size={16} />}
          >
            {initialTemplate ? "Lưu thay đổi" : "Tạo template"}
          </CustomButton>
        </div>
      </div>
    </div>,
    document.body
  );
}
