import { useState, useEffect, useRef } from "react";
import { X, Check, Loader2, AlertTriangle } from "lucide-react";
import { EmailTemplate, EmailTemplateType } from "../types/email-ai.types";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    type: EmailTemplateType;
    subject: string;
    body: string;
    placeholders: string[];
  }) => Promise<void>;
  initialTemplate: EmailTemplate | null;
  isSubmitting: boolean;
}

const PLACEHOLDERS_LIST = [
  "candidateName",
  "jobTitle",
  "companyName",
  "interviewDate",
  "interviewTime",
  "interviewType",
  "meetLink",
  "interviewerName",
  "salary",
  "startDate",
  "managerName",
  "offerDeadline",
  "confirmDeadline",
  "cvContent",
  "jobRequirements",
];

export default function EmailModal({
  isOpen,
  onClose,
  onSubmit,
  initialTemplate,
  isSubmitting,
}: EmailModalProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState<EmailTemplateType>(EmailTemplateType.INTERVIEW_INVITATION);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Refs for tracking focus and selections
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activeFieldRef = useRef<"subject" | "body" | null>(null);

  // Sync state when editing or creating
  useEffect(() => {
    if (initialTemplate) {
      setTemplateName(initialTemplate.name);
      setTemplateType(initialTemplate.type);
      setSubject(initialTemplate.subject);
      setBody(initialTemplate.body);
    } else {
      setTemplateName("");
      setTemplateType(EmailTemplateType.INTERVIEW_INVITATION);
      setSubject("");
      setBody("");
    }
    activeFieldRef.current = null;
    setError(null);
  }, [initialTemplate, isOpen]);

  if (!isOpen) return null;

  // Track which input has the cursor focus
  const handleFocus = (field: "subject" | "body") => {
    activeFieldRef.current = field;
  };

  // Helper to insert placeholder at cursor location
  const handleInsertPlaceholder = (placeholder: string) => {
    const activeField = activeFieldRef.current;
    if (!activeField) {
      // Default to body if no field was focused yet
      activeFieldRef.current = "body";
      handleInsertPlaceholder(placeholder);
      return;
    }

    const tag = `{{${placeholder}}}`;

    if (activeField === "subject") {
      const input = subjectInputRef.current;
      if (!input) return;

      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const newValue = subject.substring(0, start) + tag + subject.substring(end);
      setSubject(newValue);

      const newCursorPos = start + tag.length;
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      const textarea = bodyTextareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const newValue = body.substring(0, start) + tag + body.substring(end);
      setBody(newValue);

      const newCursorPos = start + tag.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  // Extract all double curly bracket variables from text
  const extractPlaceholders = (subjectText: string, bodyText: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const placeholders = new Set<string>();
    let match;

    while ((match = regex.exec(subjectText)) !== null) {
      placeholders.add(match[1].trim());
    }
    while ((match = regex.exec(bodyText)) !== null) {
      placeholders.add(match[1].trim());
    }

    return Array.from(placeholders);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!templateName.trim()) {
      setError("Tên template không được để trống");
      return;
    }
    if (!subject.trim()) {
      setError("Tiêu đề email không được để trống");
      return;
    }
    if (!body.trim()) {
      setError("Nội dung email không được để trống");
      return;
    }

    // Auto extract placeholders based on subject and body content
    const placeholders = extractPlaceholders(subject, body);

    try {
      await onSubmit({
        name: templateName.trim(),
        type: templateType,
        subject: subject.trim(),
        body: body.trim(),
        placeholders,
      });
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-900">
            {initialTemplate ? "Chỉnh sửa template" : "Tạo template mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form row 1: Template Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tên template
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Email gửi Offer"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium text-gray-800"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Loại
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as EmailTemplateType)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium text-gray-800"
              >
                <option value={EmailTemplateType.INTERVIEW_INVITATION}>Mới phỏng vấn</option>
                <option value={EmailTemplateType.OFFER_LETTER}>Offer Letter</option>
                <option value={EmailTemplateType.REJECTION}>Từ chối</option>
                <option value={EmailTemplateType.CUSTOM}>Custom / AI Prompt</option>
              </select>
            </div>
          </div>

          {/* Form row 2: Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Tiêu đề email
            </label>
            <input
              type="text"
              ref={subjectInputRef}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onFocus={() => handleFocus("subject")}
              placeholder="[TalentCore] Offer Letter - {{jobTitle}}"
              required
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium text-gray-800"
            />
          </div>

          {/* Form row 3: Body / Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Nội dung
            </label>
            <textarea
              ref={bodyTextareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => handleFocus("body")}
              placeholder="Nhập nội dung email..."
              required
              rows={8}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium text-gray-800 font-sans"
            />
          </div>

          {/* Form row 4: Placeholders pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Biến có sẵn (placeholders)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl">
              {PLACEHOLDERS_LIST.map((placeholder) => (
                <button
                  key={placeholder}
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent button click from steeling input focus
                    e.preventDefault();
                    handleInsertPlaceholder(placeholder);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 rounded-lg shadow-3xs cursor-pointer transition-all hover:scale-102"
                >
                  {"{{" + placeholder + "}}"}
                </button>
              ))}
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
            {initialTemplate ? "Lưu template" : "Tạo template"}
          </button>
        </div>
      </div>
    </div>
  );
}
