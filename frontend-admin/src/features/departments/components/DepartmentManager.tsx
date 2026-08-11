"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, Check, AlertTriangle } from "lucide-react";
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

  useEffect(() => {
    setDepartments(initialDepartments);
  }, [initialDepartments]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  // Loading & toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

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
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 animate-in slide-in-from-top-5 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-red-50 border-red-100 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <Check size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-indigo-600 shrink-0" size={22} />
            Quản lý phòng ban
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Phân công người phỏng vấn cho từng phòng ban
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-100 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          Thêm phòng ban
        </button>
      </div>

      {/* List */}
      {departments.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xs">
          <Building2 className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="text-base font-semibold text-gray-800">
            Chưa có phòng ban nào
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Tạo phòng ban đầu tiên để bắt đầu phân công nhân sự.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-sm rounded-xl transition-colors border border-indigo-100 cursor-pointer"
          >
            <Plus size={16} />
            Tạo phòng ban đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
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
    </div>
  );
}
