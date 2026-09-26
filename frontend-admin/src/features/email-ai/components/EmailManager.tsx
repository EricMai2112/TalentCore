"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Mail } from "lucide-react";
import { EmailTemplate, EmailTemplateType } from "../types/email-ai.types";
import { emailAiApi } from "../services/email-ai.api";
import EmailCard from "./EmailCard";
import EmailModal from "./EmailModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { CustomButton, Toast, useToast } from "@/src/components/common";

interface EmailManagerProps {
  initialTemplates: EmailTemplate[];
}

export default function EmailManager({ initialTemplates }: EmailManagerProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const { toast, showToast, hideToast } = useToast();

  // Sync state with server-side fetched data
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTemplates = async () => {
    try {
      const data = await emailAiApi.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách email templates:", err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
  };

  const handleModalSubmit = async (payload: {
    name: string;
    type: EmailTemplateType;
    subject: string;
    body: string;
    placeholders: string[];
  }) => {
    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        await emailAiApi.updateTemplate(editingTemplate._id, payload);
        showToast("Cập nhật email template thành công!", "success");
      } else {
        await emailAiApi.createTemplate(payload);
        showToast("Tạo email template thành công!", "success");
      }
      setIsModalOpen(false);
      await fetchTemplates();
      router.refresh();
    } catch (err: any) {
      throw new Error(err.message || "Đã xảy ra lỗi khi gửi yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    setIsSubmitting(true);
    try {
      await emailAiApi.deleteTemplate(templateToDelete._id);
      showToast("Xóa email template thành công!", "success");
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      await fetchTemplates();
      router.refresh();
    } catch (err: any) {
      showToast(err.message || "Không thể xóa email template", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60 shadow-2xs shrink-0">
              <Mail size={20} />
            </span>
            Email &amp; AI Templates
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý mẫu email tự động và AI prompt tuyển dụng
          </p>
        </div>
        <CustomButton
          onClick={handleOpenCreateModal}
          variant="primary"
          icon={<Plus size={16} />}
          className="self-start sm:self-auto shrink-0"
        >
          Thêm template
        </CustomButton>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/50 border border-white/70 rounded-3xl backdrop-blur-md shadow-xl shadow-blue-500/5">
            <div className="p-4 rounded-2xl bg-slate-100/80 text-slate-400 mb-4 shadow-2xs">
              <Mail size={36} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không có email template nào</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy tạo một email template hoặc AI prompt mới để bắt đầu quy trình tự động hóa tuyển dụng.
            </p>
            <CustomButton
              onClick={handleOpenCreateModal}
              variant="secondary"
              icon={<Plus size={16} />}
              className="mt-5"
            >
              Tạo mẫu đầu tiên
            </CustomButton>
          </div>
        ) : (
          templates.map((template) => (
            <EmailCard
              key={template._id}
              template={template}
              onEdit={() => handleOpenEditModal(template)}
              onDelete={() => handleOpenDeleteModal(template)}
            />
          ))
        )}
      </div>

      {/* Create / Edit Form Modal */}
      <EmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialTemplate={editingTemplate}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        templateName={templateToDelete?.name || ""}
        isDeleting={isSubmitting}
      />

      {/* Standard Toast Notification */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
