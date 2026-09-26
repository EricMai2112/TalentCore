"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, GitBranch } from "lucide-react";
import { PipelineTemplate, Stage } from "../types/pipeline.types";
import { pipelineApi } from "../services/pipeline.api";
import PipelineCard from "./PipelineCard";
import PipelineModal from "./PipelineModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { CustomButton, Toast, useToast } from "@/src/components/common";

interface PipelineManagerProps {
  initialTemplates: PipelineTemplate[];
}

export default function PipelineManager({ initialTemplates }: PipelineManagerProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<PipelineTemplate[]>(initialTemplates);
  const { toast, showToast, hideToast } = useToast();
  
  // Sync state with server-side fetched data
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PipelineTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PipelineTemplate | null>(null);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTemplates = async () => {
    try {
      const data = await pipelineApi.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách templates:", err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (template: PipelineTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (template: PipelineTemplate) => {
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
  };

  const handleModalSubmit = async (name: string, stages: Omit<Stage, "_id">[]) => {
    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        await pipelineApi.updateTemplate(editingTemplate._id, { name, stages });
        showToast("Cập nhật pipeline template thành công!", "success");
      } else {
        await pipelineApi.createTemplate({ name, stages });
        showToast("Tạo pipeline template thành công!", "success");
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
      await pipelineApi.deleteTemplate(templateToDelete._id);
      showToast("Xóa pipeline template thành công!", "success");
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      await fetchTemplates();
      router.refresh();
    } catch (err: any) {
      showToast(err.message || "Không thể xóa pipeline template", "error");
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
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60 shadow-2xs">
              <GitBranch size={20} />
            </span>
            Pipeline Templates
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Thiết kế và quản lý các mẫu quy trình tuyển dụng ứng viên
          </p>
        </div>
        <CustomButton
          onClick={handleOpenCreateModal}
          variant="primary"
          icon={<Plus size={16} />}
          className="self-start sm:self-auto shrink-0"
        >
          Tạo template
        </CustomButton>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/50 border border-white/70 rounded-3xl backdrop-blur-md shadow-xl shadow-blue-500/5">
            <div className="p-4 rounded-2xl bg-slate-100/80 text-slate-400 mb-4 shadow-2xs">
              <GitBranch size={36} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không có pipeline template nào</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy tạo một pipeline template mới để bắt đầu quy trình theo dõi ứng viên của bạn.
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
          templates.map((template, index) => {
            const isDefault = index === 0 || template.name.toLowerCase().includes("standard");
            return (
              <PipelineCard
                key={template._id}
                template={template}
                isDefault={isDefault}
                onEdit={() => handleOpenEditModal(template)}
                onDelete={() => handleOpenDeleteModal(template)}
              />
            );
          })
        )}
      </div>

      {/* Create / Edit Form Modal */}
      <PipelineModal
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
