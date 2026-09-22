"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Loader2, AlertTriangle, UserPlus } from "lucide-react";
import { CreateEmployeeDto, Department, UserRole, USER_ROLE_LABEL } from "../types/user.types";
import { CustomInput, CustomSelect } from "@/src/components/common";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeDto) => Promise<void>;
  departments: Department[];
  isSubmitting: boolean;
  isDeptManager?: boolean;
  userDeptId?: string;
}

const ROLE_OPTIONS = [
  UserRole.HR_ADMIN,
  UserRole.DEPARTMENT_MANAGER,
  UserRole.EMPLOYEE,
];

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
  isSubmitting,
  isDeptManager = false,
  userDeptId = "",
}: CreateUserModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState<CreateEmployeeDto>({
    name: "",
    email: "",
    phone: "",
    role: UserRole.EMPLOYEE,
    departmentId: isDeptManager ? userDeptId : "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset form mỗi lần mở modal
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        email: "",
        phone: "",
        role: UserRole.EMPLOYEE,
        departmentId: isDeptManager ? userDeptId : "",
      });
      setError(null);
    }
  }, [isOpen, isDeptManager, userDeptId]);

  if (!isOpen || !isMounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: CreateEmployeeDto) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!form.name.trim()) return setError("Vui lòng nhập họ và tên");
    if (!form.email.trim()) return setError("Vui lòng nhập email");
    if (!form.phone.trim()) return setError("Vui lòng nhập số điện thoại");

    const payload: CreateEmployeeDto = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: isDeptManager ? UserRole.EMPLOYEE : form.role,
    };

    const finalDeptId = isDeptManager ? userDeptId : form.departmentId;
    if (finalDeptId) payload.departmentId = finalDeptId;

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setError(message);
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
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-lg shadow-2xl shadow-blue-500/10 border border-white/90 overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thêm người dùng mới</h3>
              <p className="text-xs text-slate-500">Tạo tài khoản nhân viên hoặc người dùng nội bộ</p>
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
            placeholder="Nguyễn Văn A"
          />

          {/* Email */}
          <CustomInput
            label="Email"
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@talentcore.vn"
          />

          {/* Số điện thoại */}
          <CustomInput
            label="Số điện thoại"
            required
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="0901234567"
          />

          {/* Vai trò & Phòng ban — 2 cột trên md */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vai trò */}
            <CustomSelect
              label="Vai trò"
              required
              value={isDeptManager ? UserRole.EMPLOYEE : form.role}
              onChange={(val) => setForm((prev: CreateEmployeeDto) => ({ ...prev, role: val as UserRole }))}
              isLocked={isDeptManager}
              disabled={isDeptManager}
              options={ROLE_OPTIONS.map((role: UserRole) => ({
                value: role,
                label: USER_ROLE_LABEL[role],
              }))}
            />

            {/* Phòng ban */}
            <CustomSelect
              label="Phòng ban"
              value={isDeptManager ? userDeptId || "" : form.departmentId ?? ""}
              onChange={(val) => setForm((prev: CreateEmployeeDto) => ({ ...prev, departmentId: val }))}
              isLocked={isDeptManager}
              disabled={isDeptManager}
              placeholder="— Chưa phân công —"
              options={[
                { value: "", label: "— Chưa phân công —" },
                ...departments.map((dept) => ({
                  value: dept._id,
                  label: dept.name,
                })),
              ]}
            />
          </div>

          {/* Ghi chú mật khẩu mặc định */}
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
            Mật khẩu mặc định sẽ là{" "}
            <span className="font-bold text-slate-700 font-mono">111111</span>.
            Người dùng nên đổi mật khẩu sau khi đăng nhập lần đầu.
          </p>
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
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            <span>Tạo tài khoản</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
