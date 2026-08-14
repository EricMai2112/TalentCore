'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Building2, GitBranch, Zap, Mail } from 'lucide-react'

const tabs = [
  { label: 'Người dùng', href: '/settings/users', icon: Users },
  { label: 'Phòng ban', href: '/settings/departments', icon: Building2 },
  { label: 'Pipeline', href: '/settings/pipeline', icon: GitBranch },
  { label: 'Kỹ năng', href: '/settings/skills', icon: Zap },
  { label: 'Email & AI', href: '/settings/email-ai', icon: Mail }
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý nhân viên, phòng ban, quy trình, Kỹ năng và mẫu email
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-100 px-4 overflow-x-auto">
          <nav className="flex gap-1 min-w-max sm:min-w-0" aria-label="Settings tabs">
            {tabs.map((tab) => {
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
