"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2 } from "lucide-react";
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "../types/department.types";
import { User } from "@/src/features/users/types/user.types";
import { departmentApi } from "../services/department.api";
import DepartmentCard from "./DepartmentCard";
import DepartmentModal from "./DepartmentModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { CustomButton, Toast, useToast } from "@/src/components/common";

interface DepartmentManagerProps {
  initialDepartments: Department[];
  employees: User[]; // để chọn trưởng phòng trong modal
}

export default function DepartmentManager({
  initialDepartments,
  employees,
}: DepartmentManagerProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    setDepartments(initialDepartments);
  }, [initialDepartments]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách phòng ban:", err);
    }
  };

  // Đếm số thành viên theo departmentId
  const getMemberCount = (deptId: string) =>
    employees.filter((e) => e.departmentId === deptId).length;

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingDept(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (dept: Department) => {
    setDeptToDelete(dept);
    setIsDeleteOpen(true);
  };

  const handleModalSubmit = async (
    data: CreateDepartmentDto | UpdateDepartmentDto
  ) => {
    setIsSubmitting(true);
    try {
      if (editingDept) {
        await departmentApi.update(editingDept._id, data as UpdateDepartmentDto);
        showToast("Cập nhật phòng ban thành công!", "success");
      } else {
        await departmentApi.create(data as CreateDepartmentDto);
        showToast("Tạo phòng ban thành công!", "success");
      }
      setIsModalOpen(false);
      await fetchDepartments();
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    setIsSubmitting(true);
    try {
      await departmentApi.remove(deptToDelete._id);
      showToast("Xóa phòng ban thành công!", "success");
      setIsDeleteOpen(false);
      setDeptToDelete(null);
      await fetchDepartments();
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể xóa phòng ban";
      showToast(message, "error");
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
              <Building2 size={20} />
            </span>
            Quản lý phòng ban
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Phân công người phỏng vấn và quản lý cấu trúc từng phòng ban
          </p>
        </div>
        <CustomButton
          onClick={handleOpenCreate}
          variant="primary"
          icon={<Plus size={16} />}
          className="self-start sm:self-auto shrink-0"
        >
          Thêm phòng ban
        </CustomButton>
      </div>

      {/* List */}
      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/50 border border-white/70 rounded-3xl backdrop-blur-md shadow-xl shadow-blue-500/5">
          <div className="p-4 rounded-2xl bg-slate-100/80 text-slate-400 mb-4 shadow-2xs">
            <Building2 size={36} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Chưa có phòng ban nào
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Tạo phòng ban đầu tiên để bắt đầu phân công nhân sự.
          </p>
          <CustomButton
            onClick={handleOpenCreate}
            variant="secondary"
            icon={<Plus size={16} />}
            className="mt-5"
          >
            Tạo phòng ban đầu tiên
          </CustomButton>
        </div>
      ) : (
        <div className="space-y-3.5">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept._id}
              department={dept}
              memberCount={getMemberCount(dept._id)}
              onEdit={() => handleOpenEdit(dept)}
              onDelete={() => handleOpenDelete(dept)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialDepartment={editingDept}
        managers={employees}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeptToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        departmentName={deptToDelete?.name ?? ""}
        isDeleting={isSubmitting}
      />

      {/* Standard Toast Notification */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
