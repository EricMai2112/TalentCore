import { useState, useEffect } from "react";
import { X, Check, Loader2, AlertTriangle, UserPlus } from "lucide-react";
import { CreateEmployeeDto, Department, UserRole, USER_ROLE_LABEL } from "../types/user.types";

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
  const [form, setForm] = useState<CreateEmployeeDto>({
    name: "",
    email: "",
    phone: "",
    role: UserRole.EMPLOYEE,
    departmentId: isDeptManager ? userDeptId : "",
  });
  const [error, setError] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Họ tên không được để trống");
    if (!form.email.trim()) return setError("Email không được để trống");
    if (!form.phone.trim()) return setError("Số điện thoại không được để trống");

    const payload: CreateEmployeeDto = {
      name: form.name.trim(),
      email: form.email.trim(),
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

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <UserPlus size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Thêm người dùng mới</h3>
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
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@talentcore.vn"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0901234567"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Vai trò & Phòng ban — 2 cột trên md */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vai trò */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={isDeptManager ? UserRole.EMPLOYEE : form.role}
                onChange={handleChange}
                disabled={isDeptManager}
                className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 ${
                  isDeptManager ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
                }`}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {USER_ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            </div>

            {/* Phòng ban */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Phòng ban
              </label>
              <select
                name="departmentId"
                value={isDeptManager ? userDeptId : (form.departmentId ?? "")}
                onChange={handleChange}
                disabled={isDeptManager}
                className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 ${
                  isDeptManager ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
                }`}
              >
                <option value="">— Chưa phân công —</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ghi chú mật khẩu mặc định */}
          <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
            Mật khẩu mặc định sẽ là{" "}
            <span className="font-bold text-gray-600 font-mono">111111</span>.
            Người dùng nên đổi mật khẩu sau khi đăng nhập lần đầu.
          </p>
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
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
