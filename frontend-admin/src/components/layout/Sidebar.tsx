"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  LayoutGrid,
  UserRound,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
} from "lucide-react";
import logo from "@/public/logo-talentcore.png";
import logomini from "@/public/favicon-talentcore.png";
import Image from "next/image";
import { UserRole } from "@/src/features/users/types/user.types";
import { useAuth } from "@/src/providers/AuthProvider";


interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tin tuyển dụng", href: "/job-description", icon: Briefcase, roles: [UserRole.DEPARTMENT_MANAGER, UserRole.HR_ADMIN] },
  { label: "Kanban Tuyển dụng", href: "/kanban", icon: LayoutGrid, roles: [UserRole.HR_ADMIN] },
  { label: "Ứng viên", href: "/candidates", icon: UserRound, roles: [UserRole.HR_ADMIN] },
  { label: "Phỏng vấn", href: "/interviews", icon: MessageSquare, roles: [UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE] },
  { label: "Offer", href: "/offers", icon: FileText, roles: [UserRole.HR_ADMIN] },
  { label: "Thông báo", href: "/notifications", icon: Bell, roles: [UserRole.HR_ADMIN] },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    
    if (!user?.role) return false;

    return item.roles.includes(user.role);
  });

  return (
    <aside
      style={{ backgroundColor: "#1e1b4b" }}
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shrink-0 ${
        isCollapsed ? "w-16" : "w-[250px]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center px-3 py-4 ${isCollapsed ? "justify-center" : ""}`}
      >
        <Image
          src={isCollapsed ? logomini : logo}
          alt="logo"
          width={isCollapsed ? 40 : 180}
        />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col gap-3">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <div className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-150 ${
                      isCollapsed ? "justify-center" : ""
                    } ${
                      isActive ? "text-white" : "text-gray-300 hover:text-white"
                    }`}
                    style={
                      isActive ? { backgroundColor: "#4f46e5" } : undefined
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "rgba(255,255,255,0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "";
                      }
                    }}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="text-sm font-semibold flex-1 truncate">
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className="text-xs font-semibold rounded-full px-1.5 py-0.5 leading-none"
                            style={{
                              backgroundColor: "#4f46e5",
                              color: "white",
                              minWidth: 20,
                              textAlign: "center",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>

                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <div
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                      style={{ backgroundColor: "#312e81" }}
                    >
                      {item.label}
                      {item.badge !== undefined && (
                        <span
                          className="ml-1.5 text-xs font-semibold rounded-full px-1 py-0.5"
                          style={{ backgroundColor: "#4f46e5" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: Settings + Collapse */}
      <div className="px-2 py-3 border-t border-white/10 flex flex-col gap-1">
        {user?.role === UserRole.HR_ADMIN && (
          <div className="relative group">
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 text-gray-300 hover:text-white ${
                isCollapsed ? "justify-center" : ""
              } ${pathname === "/settings" ? "text-white" : ""}`}
              style={
                pathname === "/settings"
                  ? { backgroundColor: "#4f46e5" }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (pathname !== "/settings") {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/settings") {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                }
              }}
            >
              <Settings size={18} className="shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-semibold">Cấu hình</span>
              )}
            </Link>
            {isCollapsed && (
              <div
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ backgroundColor: "#312e81" }}
              >
                Cấu hình
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 text-gray-300 hover:text-white w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "";
          }}
        >
          <ChevronLeft
            size={18}
            className={`shrink-0 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
          {!isCollapsed && (
            <span className="text-sm font-semibold">Thu gọn</span>
          )}
        </button>
      </div>
    </aside>
  );
}
