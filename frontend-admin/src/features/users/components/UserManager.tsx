"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Check, AlertTriangle, Search } from "lucide-react";
import { User, Department, CreateEmployeeDto } from "../types/user.types";
import { userApi } from "../services/user.api";
import UserRow from "./UserRow";
import CreateUserModal from "./CreateUserModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface UserManagerProps {
  initialUsers: User[];
  initialDepartments: Department[];
}

export default function UserManager({
  initialUsers,
  initialDepartments,
}: UserManagerProps) {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [departments] = useState<Department[]>(initialDepartments);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync với server-side data
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Loading & toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Auto-dismiss toast sau 3 giây
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const fetchUsers = async () => {
    try {
      const data = await userApi.getEmployees();
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    }
  };

  // Tạo nhân viên mới
  const handleCreateSubmit = async (data: CreateEmployeeDto) => {
    setIsSubmitting(true);
    try {
      await userApi.createEmployee(data);
      showToast("Tạo tài khoản nhân viên thành công!", "success");
      setIsCreateOpen(false);
      await fetchUsers();
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa người dùng (placeholder — backend chưa có endpoint DELETE)
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      // TODO: gọi userApi.deleteEmployee(userToDelete._id) khi backend sẵn sàng
      showToast("Chức năng xóa đang được phát triển", "error");
      setIsDeleteOpen(false);
      setUserToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
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
          {toast.type === "success" ? (
            <Check size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
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
              <h3 className="text-base font-semibold text-gray-800">
                Không tìm thấy kết quả
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Thử tìm với từ khoá khác.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-gray-800">
                Chưa có người dùng nào
              </h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                Tạo tài khoản nhân viên đầu tiên để bắt đầu quản lý quy trình
                tuyển dụng.
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
          {/* Responsive scroll wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] bg-white">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Phòng ban
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    departmentName={deptMap.get(user.departmentId ?? "")}
                    onDelete={() => handleOpenDelete(user)}
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

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        userName={userToDelete?.name ?? ""}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
