"use client";

import { ConfirmModal } from "@/src/components/common";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  isDeleting,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isDeleting}
      title="Xóa yêu cầu tuyển dụng?"
      description={
        <span>
          Bạn có chắc chắn muốn xóa yêu cầu vị trí{" "}
          <strong className="font-bold text-slate-900">“{jobTitle}”</strong> không? Hành động này sẽ xóa vĩnh viễn tin tuyển dụng này và không thể hoàn tác.
        </span>
      }
      confirmText="Xóa"
      cancelText="Hủy"
      variant="danger"
    />
  );
}
