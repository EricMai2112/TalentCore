"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Check, AlertTriangle, Search } from "lucide-react";
import { User, Department, CreateEmployeeDto, UpdateEmployeeDto, UserStatus } from "../types/user.types";
import { userApi } from "../services/user.api";
import UserRow from "./UserRow";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";

interface UserManagerProps {
  initialUsers: User[];
  initialDepartments: Department[];
}

export default function UserManager({ initialUsers, initialDepartments }: UserManagerProps) {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [departments] = useState<Department[]>(initialDepartments);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setUsers(initialUsers); }, [initialUsers]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Loading & toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const fetchUsers = async () => {
    try {
      const data = await userApi.getEmployees();
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    }
  };

  // ── Handlers ──────────────────────────────────────────────

  const handleCreateSubmit = async (data: CreateEmployeeDto) => {
    setIsSubmitting(true);
    try {
      await userApi.createEmployee(data);
      showToast("Tạo tài khoản nhân viên thành công!", "success");
      setIsCreateOpen(false);
      await fetchUsers();
      router.refresh();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (data: UpdateEmployeeDto) => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await userApi.updateEmployee(editingUser._id, data);
      showToast("Cập nhật thông tin thành công!", "success");
      setIsEditOpen(false);
      setEditingUser(null);
      await fetchUsers();
      router.refresh();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    // Optimistic update ngay lập tức
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.LOCKED : UserStatus.ACTIVE;
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
    );

    try {
      await userApi.toggleStatus(user._id, newStatus);
      showToast(
        newStatus === UserStatus.LOCKED
          ? `Đã khóa tài khoản ${user.name}`
          : `Đã mở khóa tài khoản ${user.name}`,
        "success"
      );
      router.refresh();
    } catch (err: unknown) {
      // Rollback nếu lỗi
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: user.status } : u))
      );
      showToast(err instanceof Error ? err.message : "Không thể thay đổi trạng thái", "error");
    }
  };

  // Map departmentId → tên phòng ban
  const deptMap = new Map(departments.map((d) => [d._id, d.name]));

  // Lọc theo search
  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (deptMap.get(u.departmentId ?? "")?.toLowerCase().includes(q) ?? false)
    );
  });

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
          {toast.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-indigo-600 shrink-0" size={22} />
          Quản lý người dùng
        </h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-100 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Thêm người dùng
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 w-full sm:max-w-xs">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên, email, phòng ban..."
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xs">
          <Users className="mx-auto text-gray-300 mb-3" size={40} />
          {searchQuery ? (
            <>
              <h3 className="text-base font-semibold text-gray-800">Không tìm thấy kết quả</h3>
              <p className="text-sm text-gray-400 mt-1">Thử tìm với từ khoá khác.</p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-gray-800">Chưa có người dùng nào</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                Tạo tài khoản nhân viên đầu tiên để bắt đầu quản lý quy trình tuyển dụng.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-sm rounded-xl transition-colors border border-indigo-100 cursor-pointer"
              >
                <Plus size={16} />
                Tạo người dùng đầu tiên
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] bg-white">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {["Người dùng", "Email", "Vai trò", "Phòng ban", "Trạng thái", "Thao tác"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    departmentName={deptMap.get(user.departmentId ?? "")}
                    onEdit={() => handleOpenEdit(user)}
                    onToggleStatus={() => handleToggleStatus(user)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-4 py-2.5 bg-gray-50/60 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              Hiển thị{" "}
              <span className="text-gray-600 font-bold">{filtered.length}</span>{" "}
              / {users.length} người dùng
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        departments={departments}
        isSubmitting={isSubmitting}
      />

      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingUser(null); }}
        onSubmit={handleEditSubmit}
        user={editingUser}
        departments={departments}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
