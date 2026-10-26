"use client";

import { ConfirmModal } from "@/src/components/common";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentName: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
  isDeleting,
}: DeleteConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isDeleting}
      title="Xóa phòng ban?"
      description={
        <span>
          Bạn có chắc muốn xóa phòng ban{" "}
          <strong className="text-slate-800 font-bold">"{departmentName}"</strong>?
          Hành động này không thể hoàn tác.
        </span>
      }
      confirmText="Xóa phòng ban"
      cancelText="Hủy"
      variant="danger"
    />
  );
}
