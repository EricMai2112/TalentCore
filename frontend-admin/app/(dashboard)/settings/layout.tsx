'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Users, Building2, GitBranch, Zap, Mail } from 'lucide-react'
import { useAuth } from '@/src/providers/AuthProvider'
import { UserRole } from '@/src/features/users/types/user.types'

const allTabs = [
  {
    label: 'Người dùng',
    href: '/settings/users',
    icon: Users,
    roles: [UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER]
  },
  {
    label: 'Phòng ban',
    href: '/settings/departments',
    icon: Building2,
    roles: [UserRole.HR_ADMIN]
  },
  { label: 'Pipeline', href: '/settings/pipeline', icon: GitBranch, roles: [UserRole.HR_ADMIN] },
  {
    label: 'Kỹ năng',
    href: '/settings/skills',
    icon: Zap,
    roles: [UserRole.HR_ADMIN, UserRole.DEPARTMENT_MANAGER]
  },
  { label: 'Email & AI', href: '/settings/email-ai', icon: Mail, roles: [UserRole.HR_ADMIN] }
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER

  // Filter tabs visible to current user's role
  const visibleTabs = allTabs.filter((tab) => !user || tab.roles.includes(user.role))

  // Redirect DEPARTMENT_MANAGER away from hidden settings tabs if accessed directly via URL
  useEffect(() => {
    if (isDeptManager) {
      const isAllowed = visibleTabs.some(
        (tab) => pathname === tab.href || pathname.startsWith(tab.href + '/')
      )
      if (!isAllowed) {
        router.replace('/settings/users')
      }
    }
  }, [isDeptManager, pathname, visibleTabs, router])

  return (
    <div className="space-y-3">
      {/* Settings Navigation Tabs - Sleek Segmented Pill Bar */}
      <div className="flex items-center overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav
          className="inline-flex items-center gap-1.5 p-1.5 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xs"
          aria-label="Settings tabs"
        >
          {visibleTabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                  transition-all duration-200 whitespace-nowrap cursor-pointer select-none
                  ${
                    isActive
                      ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-500/25 border border-white/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tab Content directly on page */}
      <div>{children}</div>
    </div>
  )
}
