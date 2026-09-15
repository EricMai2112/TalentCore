'use client'

import { useState } from 'react'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '@/src/providers/AuthProvider'
import { USER_ROLE_LABEL } from '@/src/features/users/types/user.types'

export default function UserDropdown() {
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const roleName = user?.role ? USER_ROLE_LABEL[user.role] : 'Người dùng'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#1261A6]/30 transition-all cursor-pointer"
      >
        <div className="w-9 h-9 rounded-full bg-[#1261A6] text-white flex items-center justify-center shadow-sm">
          <User size={18} />
        </div>
        <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
      </button>

      {/* Redesigned User Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Profile Card Header */}
          <div className="px-3 py-2.5 bg-slate-50 rounded-xl mb-1 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-[#1261A6] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <User size={14} />
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || 'Administrator'}
              </p>
            </div>
            <p className="text-[10px] font-medium text-slate-400 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-[#2A95BF]/10 text-[#2A95BF] text-[10px] font-extrabold rounded-full border border-[#2A95BF]/20">
              {roleName}
            </span>
          </div>

          {/* Menu Actions */}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false)
                logout()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
