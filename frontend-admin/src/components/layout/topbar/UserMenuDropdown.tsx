'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User as UserIcon, LogOut, Settings, Shield } from 'lucide-react'
import { useAuth } from '@/src/providers/AuthProvider'
import { USER_ROLE_LABEL } from '@/src/features/users/types/user.types'
import { BRAND_COLORS } from '@/src/constants/theme'

export default function UserMenuDropdown() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const roleName = user?.role ? USER_ROLE_LABEL[user.role] : 'Quản trị viên'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Circle Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: BRAND_COLORS.primary.DEFAULT }}
        className="w-9 h-9 rounded-full hover:opacity-90 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a64d8]/40"
        title="Tài khoản người dùng"
      >
        <UserIcon size={20} className="stroke-[2.2]" />
      </button>

      {/* Redesigned Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-3 py-2.5 bg-slate-50/80 rounded-xl mb-1 flex items-center gap-3">
            <div
              style={{ backgroundColor: BRAND_COLORS.primary.DEFAULT }}
              className="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 shadow-2xs"
            >
              <UserIcon size={18} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'admin@talentcore.com'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span
                  style={{
                    color: BRAND_COLORS.primary.DEFAULT,
                    backgroundColor: `rgba(${BRAND_COLORS.primary.rgb}, 0.1)`
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  <Shield size={10} />
                  {roleName}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <button
            onClick={() => {
              setIsOpen(false)
              logout()
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={15} className="text-red-500" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  )
}
