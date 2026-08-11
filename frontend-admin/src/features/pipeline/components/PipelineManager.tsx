"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, GitBranch, Check, AlertTriangle } from "lucide-react";
import { PipelineTemplate, Stage } from "../types/pipeline.types";
import { pipelineApi } from "../services/pipeline.api";
import PipelineCard from "./PipelineCard";
import PipelineModal from "./PipelineModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface PipelineManagerProps {
  initialTemplates: PipelineTemplate[];
}

export default function PipelineManager({ initialTemplates }: PipelineManagerProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<PipelineTemplate[]>(initialTemplates);
  
  // Sync state with server-side fetched data
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PipelineTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PipelineTemplate | null>(null);

  // Loading & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

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
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 animate-in slide-in-from-top-5 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-red-50 border-red-100 text-red-800"
          }`}
        >
          {toast.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="text-indigo-600" size={22} />
            Pipeline Templates
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Thiết kế và quản lý các mẫu pipeline tuyển dụng
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-sm shadow-indigo-100 cursor-pointer"
        >
          <Plus size={16} />
          Tạo template
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-2xs">
            <GitBranch className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="text-base font-semibold text-gray-800">Không có pipeline template nào</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              Hãy tạo một pipeline template mới để bắt đầu quy trình theo dõi ứng viên của bạn.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-sm rounded-xl transition-colors border border-indigo-100 cursor-pointer"
            >
              <Plus size={16} />
              Tạo mẫu đầu tiên
            </button>
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
    </div>
  );
}
