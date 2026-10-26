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
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl transition-all cursor-pointer border shadow-2xs ${
          isDropdownOpen
            ? 'bg-white/95 text-slate-900 border-[#3B82F6] ring-4 ring-[#3B82F6]/15 shadow-sm'
            : 'bg-white/55 hover:bg-white/80 backdrop-blur-md border-white/65 text-slate-800'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-2xs">
          <User size={16} />
        </div>
        <div className="hidden md:flex flex-col text-left min-w-0 pr-0.5">
          <span className="text-xs font-bold text-slate-800 truncate leading-tight max-w-[120px]">
            {user?.name || 'Administrator'}
          </span>
          <span className="text-[10px] font-semibold text-[#8B5CF6] truncate leading-tight">
            {roleName}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-500 shrink-0 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Redesigned User Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-xl shadow-blue-500/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Profile Card Header */}
          <div className="px-3 py-2.5 bg-white/60 rounded-xl mb-1 border border-white/70 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <User size={14} />
              </div>
              <p className="text-xs font-bold text-[#0F172A] truncate">
                {user?.name || 'Administrator'}
              </p>
            </div>
            <p className="text-[10px] font-medium text-[#64748B] truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] font-extrabold rounded-full border border-[#8B5CF6]/25">
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
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors cursor-pointer"
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
