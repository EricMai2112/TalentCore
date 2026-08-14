// components/layout/Topbar.tsx
"use client";

import { useState } from "react";
import { Bell, Moon, ChevronDown, Search, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/src/providers/AuthProvider";
import { USER_ROLE_LABEL } from "@/src/features/users/types/user.types";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Lấy chữ cái đầu làm Avatar
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "A";
  const roleName = user?.role ? USER_ROLE_LABEL[user.role] : "Người dùng";

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0"
      style={{ minHeight: 60 }}
    >
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Moon size={18} />
        </button>

        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#4f46e5" }} />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ backgroundColor: "#4f46e5" }}
            >
              {initial}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-none">{user?.name || "Administrator"}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{roleName}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {/* Menu Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-800">{user?.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}