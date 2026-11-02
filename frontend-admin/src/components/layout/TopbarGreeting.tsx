'use client'

import { useState, useEffect } from 'react'
import { Sun, CloudSun, Moon, Smile, Hand } from 'lucide-react'
import { useAuth } from '@/src/providers/AuthProvider'
import { USER_ROLE_LABEL } from '@/src/features/users/types/user.types'

export default function TopbarGreeting() {
  const { user } = useAuth()
  const [timeGreeting, setTimeGreeting] = useState<{ text: string; icon: React.ReactNode }>({
    text: 'buổi sáng',
    icon: <Sun size={16} className="text-amber-500 shrink-0" />
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setTimeGreeting({
        text: 'buổi sáng',
        icon: <Sun size={16} className="text-amber-500 shrink-0" />
      })
    } else if (hour >= 12 && hour < 18) {
      setTimeGreeting({
        text: 'buổi chiều',
        icon: <CloudSun size={16} className="text-amber-500 shrink-0" />
      })
    } else {
      setTimeGreeting({
        text: 'buổi tối',
        icon: <Moon size={16} className="text-indigo-500 shrink-0" />
      })
    }
  }, [])

  const roleName = user?.role ? USER_ROLE_LABEL[user.role] : 'Người dùng'

  return (
    <div className="hidden sm:flex flex-col justify-center px-3.5 py-2 bg-white/55 backdrop-blur-md border border-white/65 rounded-2xl shadow-2xs transition-all">
      <div className="flex items-center gap-1.5">
        {timeGreeting.icon}
        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
          Chào {timeGreeting.text},{' '}
          <span className="font-extrabold bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
            {roleName}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <Smile size={12} className="text-[#06B6D4] shrink-0" />
        <p className="text-[11px] font-medium text-slate-600">Chúc bạn một ngày làm việc hiệu quả!</p>
      </div>
    </div>
  )
}
