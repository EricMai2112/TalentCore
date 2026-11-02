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
    <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:bg-white/85 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-3 flex-grow min-w-0">
        {/* Title & Badge */}
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-slate-900 text-base truncate">
            {template.name}
          </h3>
          {isDefault && (
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
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
                {idx > 0 && <ChevronRight size={14} className="text-slate-300" />}
                <span
                  style={getStageColorStyle(stage.color)}
                  className="px-3 py-1 text-xs font-semibold rounded-xl border shadow-3xs"
                >
                  {stage.name}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 shrink-0 self-end md:self-center">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer shadow-2xs"
          title="Chỉnh sửa template"
        >
          <Pencil size={16} />
        </button>
        {!isDefault && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Xóa template"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
