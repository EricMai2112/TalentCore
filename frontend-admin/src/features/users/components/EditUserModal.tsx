import { useState, useEffect } from "react";
import { X, Check, Loader2, AlertTriangle, UserCog } from "lucide-react";
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

const ROLE_OPTIONS = [
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
  const [form, setForm] = useState({ name: "", phone: "", role: UserRole.EMPLOYEE, departmentId: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    const deptIdStr = typeof user.departmentId === "object" ? user.departmentId?._id : (user.departmentId ?? "");
    setForm({
      name: user.name,
      phone: user.phone,
      role: user.role,
      departmentId: deptIdStr,
    });
    setError(null);
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Họ tên không được để trống");
    if (!form.phone.trim()) return setError("Số điện thoại không được để trống");

    const payload: UpdateEmployeeDto = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      role: form.role,
      ...(form.departmentId ? { departmentId: form.departmentId } : {}),
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

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
              <UserCog size={16} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Chỉnh sửa người dùng</h3>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
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
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
