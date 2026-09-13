'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  LayoutGrid,
  UserRound,
  Calendar,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft
} from 'lucide-react'
import logo from '@/public/logo-talentcore.png'
import logomini from '@/public/favicon-talentcore.png'
import Image from 'next/image'
import { UserRole } from '@/src/features/users/types/user.types'
import { useAuth } from '@/src/providers/AuthProvider'
import { BRAND_COLORS } from '@/src/constants/theme'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Tổng quan', href: '/dashboard', icon: LayoutGrid, roles: [UserRole.HR_ADMIN] },
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
    icon: Calendar,
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
    <aside
      style={{ background: 'linear-gradient(180deg, #07214e 0%, #092e6b 100%)' }}
      className={`relative flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shrink-0 select-none overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-[210px]'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center px-4 py-5 z-10 ${isCollapsed ? 'justify-center' : ''}`}>
        <Image
          src={isCollapsed ? logomini : logo}
          alt="TalentCore Logo"
          width={isCollapsed ? 36 : 135}
          priority
        />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto overflow-x-hidden relative z-10">
        <ul className="flex flex-col gap-1.5">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <div className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-150 ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'text-white font-medium shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    style={isActive ? { backgroundColor: BRAND_COLORS.primary.DEFAULT } : undefined}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        ;(e.currentTarget as HTMLElement).style.backgroundColor =
                          'rgba(255,255,255,0.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        ;(e.currentTarget as HTMLElement).style.backgroundColor = ''
                      }
                    }}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="text-[13px] flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className="text-[11px] font-semibold rounded-full px-2 py-0.5 leading-none flex items-center justify-center"
                            style={{
                              backgroundColor: BRAND_COLORS.primary.DEFAULT,
                              color: 'white',
                              minWidth: 20,
                              height: 20
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
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-xs text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md"
                      style={{ backgroundColor: '#07214e' }}
                    >
                      {item.label}
                      {item.badge !== undefined && (
                        <span
                          className="ml-1.5 text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                          style={{ backgroundColor: BRAND_COLORS.primary.DEFAULT }}
                        >
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

      {/* Bottom: Settings + Help + Collapse */}
      <div className="px-3 py-3 border-t border-white/10 flex flex-col gap-1 relative z-10">
        {(user?.role === UserRole.HR_ADMIN || user?.role === UserRole.DEPARTMENT_MANAGER) && (
          <div className="relative group">
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 text-slate-300 hover:text-white ${
                isCollapsed ? 'justify-center' : ''
              } ${pathname === '/settings' ? 'text-white font-medium' : ''}`}
              style={pathname === '/settings' ? { backgroundColor: BRAND_COLORS.primary.DEFAULT } : undefined}
              onMouseEnter={(e) => {
                if (pathname !== '/settings') {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)'
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/settings') {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = ''
                }
              }}
            >
              <Settings size={18} className="shrink-0" />
              {!isCollapsed && <span className="text-[13px]">Cấu hình</span>}
            </Link>
            {isCollapsed && (
              <div
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-xs text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md"
                style={{ backgroundColor: '#07214e' }}
              >
                Cấu hình
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-150 text-slate-300 hover:text-white w-full ${
            isCollapsed ? 'justify-center' : ''
          }`}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor = ''
          }}
        >
          <ChevronLeft
            size={18}
            className={`shrink-0 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
          {!isCollapsed && <span className="text-[13px]">Thu gọn</span>}
        </button>
      </div>

      {/* Decorative background waves */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-56 opacity-50 z-0">
        <svg
          viewBox="0 0 215 180"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M-10 45C40 15 100 70 155 30C195 5 210 40 230 25V180H-10V45Z"
            fill="url(#wave-grad-1)"
          />
          <path
            d="M-10 95C50 65 110 120 170 80C205 55 215 90 230 75V180H-10V95Z"
            fill="url(#wave-grad-2)"
          />
          <defs>
            <linearGradient
              id="wave-grad-1"
              x1="0"
              y1="0"
              x2="215"
              y2="180"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={BRAND_COLORS.primary.DEFAULT} stopOpacity="0.6" />
              <stop offset="1" stopColor="#092e6b" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient
              id="wave-grad-2"
              x1="0"
              y1="0"
              x2="215"
              y2="180"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2563eb" stopOpacity="0.4" />
              <stop offset="1" stopColor="#1d4ed8" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </aside>
  )
}
