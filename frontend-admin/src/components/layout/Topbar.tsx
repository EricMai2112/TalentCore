// components/layout/Topbar.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Moon, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/src/providers/AuthProvider";
import { USER_ROLE_LABEL } from "@/src/features/users/types/user.types";

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/job-description") return "Yêu cầu tuyển dụng";
  if (pathname === "/job-description/create") return "Tạo yêu cầu tuyển dụng";
  if (pathname.startsWith("/job-description/") && pathname.endsWith("/edit")) return "Chỉnh sửa yêu cầu tuyển dụng";
  if (pathname.startsWith("/job-description/")) return "Chi tiết yêu cầu tuyển dụng";

  if (pathname === "/kanban") return "Kanban Tuyển dụng";
  if (pathname === "/candidates") return "Quản lý ứng viên";

  if (pathname === "/interviews") return "Quản lý phỏng vấn";
  if (pathname.startsWith("/interviews/edit/")) return "Chỉnh sửa lịch phỏng vấn";

  if (pathname === "/offers") return "Quản lý Offer";
  if (pathname === "/notifications") return "Thông báo hệ thống";

  if (pathname.startsWith("/settings")) return "Cấu hình hệ thống";

  return "TalentCore Admin";
}

export default function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Lấy chữ cái đầu làm Avatar
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "A";
  const roleName = user?.role ? USER_ROLE_LABEL[user.role] : "Người dùng";
  const title = getPageTitle(pathname);

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0"
      style={{ minHeight: 60 }}
    >
      {/* Page Title Replacement for Search Bar */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
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