"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserCog, Check, Loader2, AlertTriangle } from "lucide-react";
import {
  User,
  Department,
  UpdateEmployeeDto,
  UserRole,
  USER_ROLE_LABEL,
} from "../types/user.types";
import { CustomInput, CustomSelect } from "@/src/components/common";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateEmployeeDto) => Promise<void>;
  user: User | null;
  departments: Department[];
  isSubmitting: boolean;
}

const ROLE_OPTIONS: UserRole[] = [
  UserRole.HR_ADMIN,
  UserRole.DEPARTMENT_MANAGER,
  UserRole.EMPLOYEE,
];

export default function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  departments,
  isSubmitting,
}: EditUserModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    role: UserRole;
    departmentId: string;
  }>({
    name: "",
    phone: "",
    role: UserRole.EMPLOYEE,
    departmentId: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync form khi user prop thay đổi hoặc mở modal
  useEffect(() => {
    if (isOpen && user) {
      const deptIdStr =
        typeof user.departmentId === "object" && user.departmentId
          ? user.departmentId._id
          : typeof user.departmentId === "string"
          ? user.departmentId
          : "";
      setForm({
        name: user.name,
        phone: user.phone,
        role: user.role,
        departmentId: deptIdStr,
      });
      setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user || !isMounted) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Vui lòng nhập họ và tên");
    if (!form.phone.trim()) return setError("Vui lòng nhập số điện thoại");

    const payload: UpdateEmployeeDto = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      role: form.role,
      departmentId: form.departmentId || undefined,
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
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
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md shadow-2xl shadow-blue-500/10 border border-white/90 overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <UserCog size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Chỉnh sửa người dùng</h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{user.email}</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [scrollbar-width:thin]">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Họ tên */}
          <CustomInput
            label="Họ và tên"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          {/* Email — readonly */}
          <CustomInput
            label="Email"
            type="email"
            value={user.email}
            disabled
          />

          {/* Số điện thoại */}
          <CustomInput
            label="Số điện thoại"
            required
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          {/* Vai trò & Phòng ban */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label="Vai trò"
              required
              value={form.role}
              onChange={(val) => setForm((prev) => ({ ...prev, role: val as UserRole }))}
              options={ROLE_OPTIONS.map((r) => ({
                value: r,
                label: USER_ROLE_LABEL[r],
              }))}
            />

            <CustomSelect
              label="Phòng ban"
              value={form.departmentId}
              onChange={(val) => setForm((prev) => ({ ...prev, departmentId: val }))}
              placeholder="— Chưa phân công —"
              options={[
                { value: "", label: "— Chưa phân công —" },
                ...departments.map((d) => ({
                  value: d._id,
                  label: d.name,
                })),
              ]}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-3xs cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
