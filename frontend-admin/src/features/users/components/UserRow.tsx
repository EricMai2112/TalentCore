import { Pencil, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { User, UserRole, UserStatus, USER_ROLE_LABEL, USER_ROLE_COLOR } from "../types/user.types";
import { CustomAvatar } from "@/src/components/common";

interface UserRowProps {
  user: User;
  departmentName?: string;
  onEdit: () => void;
  onToggleStatus: () => void;
}

export default function UserRow({ user, departmentName, onEdit, onToggleStatus }: UserRowProps) {
  const roleLabel = USER_ROLE_LABEL[user.role] ?? user.role;
  const roleColor = USER_ROLE_COLOR[user.role] ?? "text-gray-600";
  const isActive = user.status === UserStatus.ACTIVE;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      {/* Người dùng */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <CustomAvatar
            name={user.name}
            src={user.avatar}
            className={!isActive ? "opacity-50" : ""}
          />
          <span className={`text-sm font-semibold whitespace-nowrap ${isActive ? "text-gray-800" : "text-gray-400"}`}>
            {user.name}
          </span>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3.5">
        <span className={`text-sm ${isActive ? "text-gray-500" : "text-gray-400"}`}>
          {user.email}
        </span>
      </td>

      {/* Vai trò */}
      <td className="px-4 py-3.5">
        <span className={`text-sm font-semibold ${isActive ? roleColor : "text-gray-400"}`}>
          {roleLabel}
        </span>
      </td>

      {/* Phòng ban */}
      <td className="px-4 py-3.5">
        <span className={`text-sm ${isActive ? "text-gray-600" : "text-gray-400"}`}>
          {departmentName ?? <span className="text-gray-300 italic text-xs">—</span>}
        </span>
      </td>

      {/* Trạng thái */}
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-500 border border-red-100"
          }`}
        >
          {isActive ? "Hoạt động" : "Đã khóa"}
        </span>
      </td>

      {/* Thao tác — luôn hiển thị */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          {/* Chỉnh sửa */}
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
            title="Chỉnh sửa"
          >
            <Pencil size={15} />
          </button>

          {/* Khóa / Mở khóa */}
          <button
            onClick={onToggleStatus}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isActive
                ? "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                : "text-amber-400 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
            title={isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          >
            {isActive ? <LockKeyhole size={15} /> : <LockKeyholeOpen size={15} />}
          </button>
        </div>
      </td>
    </tr>
  );
}
