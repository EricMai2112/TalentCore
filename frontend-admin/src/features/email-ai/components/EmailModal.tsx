"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Check, Loader2, AlertTriangle, Mail } from "lucide-react";
import { EmailTemplate, EmailTemplateType } from "../types/email-ai.types";
import { CustomInput, CustomSelect, CustomTextarea } from "@/src/components/common";

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
  const [isMounted, setIsMounted] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState<EmailTemplateType>(EmailTemplateType.INTERVIEW_INVITATION);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Refs for tracking focus and selections
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activeFieldRef = useRef<"subject" | "body" | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isOpen || !isMounted) return null;

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-3xl shadow-2xl shadow-blue-500/10 border border-white/90 overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialTemplate ? "Chỉnh sửa Email Template" : "Tạo Email Template mới"}
              </h3>
              <p className="text-xs text-slate-500">
                Tự động hóa thông điệp gửi tới ứng viên qua các giai đoạn
              </p>
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
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [scrollbar-width:thin]">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form row 1: Template Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              label="Tên template"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Email gửi Offer"
            />

            <CustomSelect
              label="Loại"
              value={templateType}
              onChange={(val) => setTemplateType(val as EmailTemplateType)}
              options={[
                { value: EmailTemplateType.INTERVIEW_INVITATION, label: "Mời phỏng vấn" },
                { value: EmailTemplateType.OFFER_LETTER, label: "Offer Letter" },
                { value: EmailTemplateType.REJECTION, label: "Từ chối" },
                { value: EmailTemplateType.CUSTOM, label: "Custom / AI Prompt" },
              ]}
            />
          </div>

          {/* Form row 2: Subject */}
          <CustomInput
            ref={subjectInputRef}
            label="Tiêu đề email"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onFocus={() => handleFocus("subject")}
            placeholder="[TalentCore] Offer Letter - {{jobTitle}}"
          />

          {/* Form row 3: Body / Content */}
          <CustomTextarea
            ref={bodyTextareaRef}
            label="Nội dung"
            required
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => handleFocus("body")}
            placeholder="Nhập nội dung email..."
          />

          {/* Form row 4: Placeholders pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Biến có sẵn (placeholders)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl">
              {PLACEHOLDERS_LIST.map((placeholder) => (
                <button
                  key={placeholder}
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent button click from stealing input focus
                    e.preventDefault();
                    handleInsertPlaceholder(placeholder);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 rounded-lg shadow-3xs cursor-pointer transition-all hover:scale-102"
                >
                  {"{{" + placeholder + "}}"}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-3xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            <span>{initialTemplate ? "Lưu thay đổi" : "Tạo template"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
