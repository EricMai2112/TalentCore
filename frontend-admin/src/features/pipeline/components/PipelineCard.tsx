import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { PipelineTemplate } from "../types/pipeline.types";
import { getStageColorStyle } from "@/src/lib/utils";

interface PipelineCardProps {
  template: PipelineTemplate;
  onEdit: () => void;
  onDelete: () => void;
  isDefault: boolean;
}

export default function PipelineCard({
  template,
  onEdit,
  onDelete,
  isDefault,
}: PipelineCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-3 flex-grow min-w-0">
        {/* Title & Badge */}
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 text-base truncate">
            {template.name}
          </h3>
          {isDefault && (
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Mặc định
            </span>
          )}
        </div>

        {/* Stages list */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          {template.stages
            .sort((a, b) => a.order - b.order)
            .map((stage, idx) => (
              <div key={stage._id || idx} className="flex items-center gap-1.5 shrink-0">
                {idx > 0 && <ChevronRight size={14} className="text-gray-300" />}
                <span
                  style={getStageColorStyle(stage.color)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border shadow-3xs"
                >
                  {stage.name}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-gray-50 pt-3 md:border-t-0 md:pt-0 shrink-0 self-end md:self-center">
        <button
          onClick={onEdit}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
          title="Chỉnh sửa template"
        >
          <Pencil size={17} />
        </button>
        {!isDefault && (
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            title="Xóa template"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
    </div>
  );
}
