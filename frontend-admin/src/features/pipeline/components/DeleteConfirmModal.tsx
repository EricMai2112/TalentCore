"use client";

import { ConfirmModal } from "@/src/components/common";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  templateName: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  templateName,
  isDeleting,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isDeleting}
      title="Xóa Pipeline Template?"
      description={
        <span>
          Bạn có chắc chắn muốn xóa pipeline template{" "}
          <strong className="text-slate-800 font-bold">“{templateName}”</strong> không? Hành động này sẽ xóa vĩnh viễn template và không thể hoàn tác.
        </span>
      }
      confirmText="Xóa template"
      cancelText="Hủy"
      variant="danger"
    />
  );
}
