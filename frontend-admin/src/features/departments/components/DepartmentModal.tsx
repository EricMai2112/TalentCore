"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Building2, Check, Loader2, AlertTriangle } from "lucide-react";
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "../types/department.types";
import { User } from "@/src/features/users/types/user.types";
import { CustomInput, CustomSelect } from "@/src/components/common";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateDepartmentDto | UpdateDepartmentDto) => Promise<void>;
  initialDepartment: Department | null;
  managers: User[];
  isSubmitting: boolean;
}

const INITIAL_FORM = {
  name: "",
  code: "",
  managerId: "",
};

export default function DepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialDepartment,
  managers,
  isSubmitting,
}: DepartmentModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync form khi mở modal hoặc thay đổi initialDepartment
  useEffect(() => {
    if (isOpen) {
      if (initialDepartment) {
        const mgrId =
          typeof initialDepartment.managerId === "object" && initialDepartment.managerId
            ? initialDepartment.managerId._id
            : typeof initialDepartment.managerId === "string"
            ? initialDepartment.managerId
            : "";
        setForm({
          name: initialDepartment.name,
          code: initialDepartment.code,
          managerId: mgrId,
        });
      } else {
        setForm(INITIAL_FORM);
      }
      setError(null);
    }
  }, [isOpen, initialDepartment]);

  if (!isOpen || !isMounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      // Mã phòng ban tự động viết hoa, không khoảng trắng
      [name]: name === "code" ? value.toUpperCase().replace(/\s/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!form.name.trim()) return setError("Vui lòng nhập tên phòng ban");
    if (!form.code.trim()) return setError("Vui lòng nhập mã phòng ban");

    const payload: CreateDepartmentDto | UpdateDepartmentDto = {
      name: form.name.trim(),
      code: form.code.trim(),
      managerId: form.managerId ? form.managerId : undefined,
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setError(message);
    }
  };

  const isEdit = !!initialDepartment;

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
              </h3>
              <p className="text-xs text-slate-500">Thiết lập cơ cấu phòng ban và trưởng bộ phận</p>
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

          {/* Tên & Mã — 2 cột */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomInput
              label="Tên phòng ban"
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Engineering"
            />

            <CustomInput
              label="Mã phòng ban"
              required
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="ENG"
              maxLength={10}
            />
          </div>

          {/* Trưởng phòng */}
          <CustomSelect
            label="Trưởng phòng"
            value={form.managerId}
            onChange={(val) => setForm((prev) => ({ ...prev, managerId: val }))}
            placeholder="— Chưa phân công —"
            options={[
              { value: "", label: "— Chưa phân công —" },
              ...managers.map((m) => ({
                value: m._id,
                label: m.name,
              })),
            ]}
          />
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
            <span>{isEdit ? "Lưu thay đổi" : "Tạo phòng ban"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
