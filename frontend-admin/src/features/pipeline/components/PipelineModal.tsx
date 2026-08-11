import { useState, useEffect } from "react";
import { X, Plus, ChevronUp, ChevronDown, Trash2, Check, Loader2, AlertTriangle } from "lucide-react";
import { Stage, PipelineTemplate } from "../types/pipeline.types";

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
  const [templateName, setTemplateName] = useState("");
  const [stages, setStages] = useState<Omit<Stage, "_id">[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState(PREDEFINED_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

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
      ]);
    }
    setNewStageName("");
    setNewStageColor(PREDEFINED_COLORS[0]);
    setError(null);
  }, [initialTemplate, isOpen]);

  if (!isOpen) return null;

  const handleAddStage = () => {
    if (!newStageName.trim()) {
      setError("Tên giai đoạn mới không được để trống");
      return;
    }

    if (stages.some(s => s.name.toLowerCase() === newStageName.trim().toLowerCase())) {
      setError("Giai đoạn này đã tồn tại trong danh sách");
      return;
    }

    const newStage = {
      name: newStageName.trim(),
      order: stages.length + 1,
      color: newStageColor,
    };

    setStages([...stages, newStage]);
    setNewStageName("");
    setError(null);
  };

  const handleUpdateStageColor = (index: number, color: string) => {
    const updated = [...stages];
    updated[index].color = color;
    setStages(updated);
  };

  const handleUpdateStageName = (index: number, name: string) => {
    const updated = [...stages];
    updated[index].name = name;
    setStages(updated);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) {
      setError("Pipeline template phải có ít nhất 1 giai đoạn");
      return;
    }
    const updated = stages.filter((_, idx) => idx !== index).map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));
    setStages(updated);
    setError(null);
  };

  const handleMoveStage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === stages.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...stages];

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const sequential = updated.map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));

    setStages(sequential);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!templateName.trim()) {
      setError("Tên template không được để trống");
      return;
    }

    if (stages.length === 0) {
      setError("Phải có ít nhất 1 giai đoạn trong template");
      return;
    }

    try {
      await onSubmit(templateName.trim(), stages);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-900">
            {initialTemplate ? "Cập nhật Pipeline Template" : "Tạo Pipeline Template mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Template Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Tên template
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="VD: Standard Tech Hiring"
              required
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Stages List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Các giai đoạn (kéo để sắp xếp)
            </label>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {stages.map((stage, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50/75 border border-gray-100 rounded-xl p-3 shadow-3xs"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleUpdateStageName(idx, e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none rounded px-1.5 py-0.5 text-gray-800 font-semibold text-sm flex-grow min-w-0"
                      placeholder="Tên giai đoạn"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Inline color picker */}
                    <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1 shadow-3xs">
                      {PREDEFINED_COLORS.slice(0, 6).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleUpdateStageColor(idx, color)}
                          className={`w-3 h-3 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                            stage.color === color ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Reorder and Delete buttons */}
                    <div className="flex items-center">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStage(idx, "up")}
                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-20 disabled:hover:text-gray-400 rounded-md transition-colors cursor-pointer"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={() => handleMoveStage(idx, "down")}
                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-20 disabled:hover:text-gray-400 rounded-md transition-colors cursor-pointer"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={stages.length <= 1}
                        onClick={() => handleRemoveStage(idx)}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-20 disabled:hover:text-gray-400 rounded-md transition-colors ml-1 cursor-pointer"
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
          <div className="bg-indigo-50/30 border border-indigo-100/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="demo"
                className="flex-grow px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStage();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddStage}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm shadow-indigo-100 cursor-pointer shrink-0"
              >
                <Plus size={15} />
                Thêm
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider shrink-0">
                Màu sắc:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewStageColor(color)}
                    className={`w-4 h-4 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                      newStageColor === color ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-100 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {initialTemplate ? "Lưu thay đổi" : "Tạo template"}
          </button>
        </div>
      </div>
    </div>
  );
}
