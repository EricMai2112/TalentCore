"use client";

import { Bell, Moon, ChevronDown, Search } from "lucide-react";

export default function Topbar() {
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
        {/* Dark mode toggle */}
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Moon size={18} />
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: "#4f46e5" }}
          />
        </button>

        {/* User dropdown */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
            style={{ backgroundColor: "#4f46e5" }}
          >
            A
          </div>
          <span className="text-sm font-medium text-gray-700">Administrator</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
