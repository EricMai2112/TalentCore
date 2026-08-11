import { useState, useEffect } from "react";
import { X, Check, Loader2, AlertTriangle, Building2 } from "lucide-react";
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from "../types/department.types";
import { User } from "@/src/features/users/types/user.types";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentDto | UpdateDepartmentDto) => Promise<void>;
  initialDepartment: Department | null;
  managers: User[]; // danh sách employees để chọn trưởng phòng
  isSubmitting: boolean;
}

interface FormState {
  name: string;
  code: string;
  managerId: string;
}

const emptyForm = (): FormState => ({ name: "", code: "", managerId: "" });

export default function DepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialDepartment,
  managers,
  isSubmitting,
}: DepartmentModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialDepartment) {
      const mgr = initialDepartment.managerId;
      const managerId = mgr
        ? typeof mgr === "string"
          ? mgr
          : mgr._id
        : "";
      setForm({
        name: initialDepartment.name,
        code: initialDepartment.code,
        managerId,
      });
    } else {
      setForm(emptyForm());
    }
    setError(null);
  }, [isOpen, initialDepartment]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Auto-uppercase code field
    setForm((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Tên phòng ban không được để trống");
    if (!form.code.trim()) return setError("Mã phòng ban không được để trống");

    const payload: CreateDepartmentDto | UpdateDepartmentDto = {
      name: form.name.trim(),
      code: form.code.trim(),
      ...(form.managerId ? { managerId: form.managerId } : {}),
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setError(message);
    }
  };

  const isEdit = !!initialDepartment;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Tên & Mã — 2 cột */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tên phòng ban <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Engineering"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Mã phòng ban <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="ENG"
                maxLength={10}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400 uppercase"
              />
            </div>
          </div>

          {/* Trưởng phòng */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Trưởng phòng
            </label>
            <select
              name="managerId"
              value={form.managerId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800"
            >
              <option value="">— Chưa phân công —</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-100 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {isEdit ? "Lưu thay đổi" : "Tạo phòng ban"}
          </button>
        </div>
      </div>
    </div>
  );
}
