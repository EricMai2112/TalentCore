'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Users, Building2, GitBranch, Zap, Mail } from 'lucide-react'
import { useAuth } from '@/src/providers/AuthProvider'
import { UserRole } from '@/src/features/users/types/user.types'

const allTabs = [
  { label: 'Người dùng', href: '/settings/users', icon: Users, roles: [UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER] },
  { label: 'Phòng ban', href: '/settings/departments', icon: Building2, roles: [UserRole.HR_ADMIN] },
  { label: 'Pipeline', href: '/settings/pipeline', icon: GitBranch, roles: [UserRole.HR_ADMIN] },
  { label: 'Kỹ năng', href: '/settings/skills', icon: Zap, roles: [UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER] },
  { label: 'Email & AI', href: '/settings/email-ai', icon: Mail, roles: [UserRole.HR_ADMIN] }
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER

  // Filter tabs visible to current user's role
  const visibleTabs = allTabs.filter(tab => !user || tab.roles.includes(user.role))

  // Redirect DEPARTMENT_MANAGER away from hidden settings tabs if accessed directly via URL
  useEffect(() => {
    if (isDeptManager) {
      const isAllowed = visibleTabs.some(tab => pathname === tab.href || pathname.startsWith(tab.href + '/'))
      if (!isAllowed) {
        router.replace('/settings/users')
      }
    }
  }, [isDeptManager, pathname, visibleTabs, router])

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isDeptManager
            ? 'Quản lý danh sách nhân viên và danh mục kỹ năng thuộc phòng ban'
            : 'Quản lý nhân viên, phòng ban, quy trình, Kỹ năng và mẫu email'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-100 px-4 overflow-x-auto">
          <nav className="flex gap-1 min-w-max sm:min-w-0" aria-label="Settings tabs">
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
              const Icon = tab.icon

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-4 py-3.5 text-sm font-medium
                    border-b-2 transition-colors duration-150 whitespace-nowrap
                    ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={15} className="shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
