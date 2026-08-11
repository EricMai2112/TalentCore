import { Pencil, Trash2 } from "lucide-react";
import { User, UserRole, UserStatus, USER_ROLE_LABEL, USER_ROLE_COLOR } from "../types/user.types";

interface UserRowProps {
  user: User;
  departmentName?: string;
  onDelete: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-400",
  "bg-pink-500",
  "bg-teal-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UserRow({ user, departmentName, onDelete }: UserRowProps) {
  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);
  const roleLabel = USER_ROLE_LABEL[user.role] ?? user.role;
  const roleColor = USER_ROLE_COLOR[user.role] ?? "text-gray-600";
  const isActive = user.status === UserStatus.ACTIVE;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
      {/* Người dùng */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor}`}
          >
            {initials}
          </div>
          <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
            {user.name}
          </span>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-gray-500">{user.email}</span>
      </td>

      {/* Vai trò */}
      <td className="px-4 py-3.5">
        <span className={`text-sm font-semibold ${roleColor}`}>{roleLabel}</span>
      </td>

      {/* Phòng ban */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-gray-600">
          {departmentName ?? (
            <span className="text-gray-300 italic text-xs">—</span>
          )}
        </span>
      </td>

      {/* Trạng thái */}
      <td className="px-4 py-3.5">
        <span
          className={`text-sm font-semibold ${
            isActive ? "text-emerald-600" : "text-red-400"
          }`}
        >
          {isActive ? "Hoạt động" : "Vô hiệu"}
        </span>
      </td>

      {/* Thao tác */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
            title="Chỉnh sửa"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
