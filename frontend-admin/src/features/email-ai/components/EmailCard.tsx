import { Calendar, FileText, XCircle, Sparkles, Pencil, Trash2 } from "lucide-react";
import { EmailTemplate, EmailTemplateType } from "../types/email-ai.types";

interface EmailCardProps {
  template: EmailTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EmailCard({ template, onEdit, onDelete }: EmailCardProps) {
  // Format Date to YYYY-MM-DD
  const formattedDate = template.updatedAt
    ? new Date(template.updatedAt).toISOString().split("T")[0]
    : "";

  // Helper to render type badge and icon
  const getTypeConfig = (type: EmailTemplateType) => {
    switch (type) {
      case EmailTemplateType.INTERVIEW_INVITATION:
        return {
          label: "Mới phỏng vấn",
          badgeStyle: "bg-blue-50 text-blue-700 border border-blue-100",
          iconBoxStyle: "bg-blue-50 text-blue-600",
          Icon: Calendar,
        };
      case EmailTemplateType.OFFER_LETTER:
        return {
          label: "Offer Letter",
          badgeStyle: "bg-emerald-50 text-emerald-700 border border-emerald-100",
          iconBoxStyle: "bg-emerald-50 text-emerald-600",
          Icon: FileText,
        };
      case EmailTemplateType.REJECTION:
        return {
          label: "Từ chối",
          badgeStyle: "bg-rose-50 text-rose-700 border border-rose-100",
          iconBoxStyle: "bg-rose-50 text-rose-600",
          Icon: XCircle,
        };
      case EmailTemplateType.CUSTOM:
      default:
        return {
          label: "Custom",
          badgeStyle: "bg-purple-50 text-purple-700 border border-purple-100",
          iconBoxStyle: "bg-purple-50 text-purple-600",
          Icon: Sparkles,
        };
    }
  };

  const { label, badgeStyle, iconBoxStyle, Icon } = getTypeConfig(template.type);

  // Take first 4 placeholders to display, count the rest
  const displayLimit = 4;
  const placeholdersToDisplay = template.placeholders.slice(0, displayLimit);
  const remainingCount = template.placeholders.length - displayLimit;

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:bg-white/85 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-grow min-w-0">
        {/* Icon representation */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${iconBoxStyle}`}>
          <Icon size={22} />
        </div>

        {/* Text information */}
        <div className="space-y-2 flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base truncate">
              {template.name}
            </h3>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle}`}>
              {label}
            </span>
            {formattedDate && (
              <span className="text-xs text-slate-400">
                Cập nhật {formattedDate}
              </span>
            )}
          </div>

          {/* Placeholders list */}
          {template.placeholders && template.placeholders.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              {placeholdersToDisplay.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white/80 border border-slate-200/80 text-slate-700 rounded-lg font-mono text-[11px] shadow-3xs"
                >
                  {"{{" + p.replace(/[{}]/g, "") + "}}"}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="text-xs text-slate-400 font-semibold pl-1">
                  +{remainingCount}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Không sử dụng placeholders
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer shadow-2xs"
          title="Chỉnh sửa template"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shadow-2xs"
          title="Xóa template"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
