'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  LayoutGrid,
  UserRound,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  ChevronLeft
} from 'lucide-react'
import logo from '@/public/logo-talentcore.png'
import logomini from '@/public/favicon-talentcore.png'
import Image from 'next/image'
import { UserRole } from '@/src/features/users/types/user.types'
import { useAuth } from '@/src/providers/AuthProvider'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, roles: [UserRole.HR_ADMIN] },
  {
    label: 'Tin tuyển dụng',
    href: '/job-description',
    icon: Briefcase,
    roles: [UserRole.DEPARTMENT_MANAGER, UserRole.HR_ADMIN]
  },
  { label: 'Kanban Tuyển dụng', href: '/kanban', icon: LayoutGrid, roles: [UserRole.HR_ADMIN] },
  {
    label: 'Ứng viên',
    href: '/candidates',
    icon: UserRound,
    roles: [UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE]
  },
  {
    label: 'Phỏng vấn',
    href: '/interviews',
    icon: MessageSquare,
    roles: [UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE]
  },
  { label: 'Offer', href: '/offers', icon: FileText, roles: [UserRole.HR_ADMIN] },
  { label: 'Thông báo', href: '/notifications', icon: Bell, roles: [UserRole.HR_ADMIN] }
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true
    if (!user?.role) return false
    return item.roles.includes(user.role)
  })

  return (
    <aside className="p-2 shrink-0 h-screen sticky top-0 flex flex-col z-20">
      <div
        className={`flex flex-col h-full bg-white/70 backdrop-blur-xl border border-white/90 rounded-3xl shadow-lg shadow-[#1261A6]/10 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-14' : 'w-52'
        }`}
      >
        {/* Logo */}
        <div
          className={`flex items-center px-3 py-3.5 border-b border-slate-200/60 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <Image
            src={isCollapsed ? logomini : logo}
            alt="TalentCore"
            width={isCollapsed ? 32 : 135}
            className="h-auto object-contain transition-all"
          />
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden">
          <ul className="flex flex-col gap-1.5">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <div className="relative group">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-200 ${
                        isCollapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'text-white font-bold shadow-md shadow-blue-500/25'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                      }`}
                      style={
                        isActive
                          ? {
                              background:
                                'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)'
                            }
                          : undefined
                      }
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${isActive ? 'text-white' : 'text-[#3B82F6]'}`}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="text-xs truncate flex-1">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none bg-rose-500 text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>

                    {/* Tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-slate-900 shadow-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                        {item.badge !== undefined && (
                          <span className="ml-1.5 text-[10px] font-bold rounded-full px-1 py-0.5 bg-rose-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom: Settings + Collapse */}
        <div className="p-2 border-t border-slate-200/60 flex flex-col gap-1">
          {(user?.role === UserRole.HR_ADMIN || user?.role === UserRole.DEPARTMENT_MANAGER) && (
            <div className="relative group">
              <Link
                href="/settings"
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-200 ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  pathname.startsWith('/settings')
                    ? 'text-white font-bold shadow-md shadow-[#1261A6]/20'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                }`}
                style={
                  pathname.startsWith('/settings')
                    ? {
                        background: 'linear-gradient(135deg, #1261A6 0%, #126DA6 50%, #2A95BF 100%)'
                      }
                    : undefined
                }
              >
                <Settings
                  size={16}
                  className={`shrink-0 ${pathname.startsWith('/settings') ? 'text-white' : 'text-[#1261A6]'}`}
                />
                {!isCollapsed && <span className="text-xs truncate">Cấu hình</span>}
              </Link>
              {isCollapsed && (
                <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-slate-900 shadow-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  Cấu hình
                </div>
              )}
            </div>
          )}

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ChevronLeft
              size={16}
              className={`shrink-0 text-[#1261A6] transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
            {!isCollapsed && <span className="text-xs font-medium">Thu gọn</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
