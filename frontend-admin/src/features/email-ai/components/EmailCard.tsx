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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-grow min-w-0">
        {/* Icon representation */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-3xs ${iconBoxStyle}`}>
          <Icon size={22} />
        </div>

        {/* Text information */}
        <div className="space-y-2 flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base truncate">
              {template.name}
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle}`}>
              {label}
            </span>
            {formattedDate && (
              <span className="text-xs text-gray-400">
                Cập nhật {formattedDate}
              </span>
            )}
          </div>

          {/* Placeholders list */}
          {template.placeholders && template.placeholders.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
              {placeholdersToDisplay.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-600 rounded-md font-mono text-[11px]"
                >
                  {"{{" + p.replace(/[{}]/g, "") + "}}"}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="text-xs text-gray-400 font-semibold pl-1">
                  +{remainingCount}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">
              Không sử dụng placeholders
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
          title="Chỉnh sửa template"
        >
          <Pencil size={17} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          title="Xóa template"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}
