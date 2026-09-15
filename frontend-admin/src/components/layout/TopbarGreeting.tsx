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
    <div className="hidden sm:flex flex-col justify-center">
      <div className="flex items-center gap-1.5">
        {timeGreeting.icon}
        <p className="text-sm font-bold text-slate-800 leading-snug">
          Chào {timeGreeting.text},{' '}
          <span className="font-extrabold text-[#1261A6] bg-gradient-to-r from-[#1261A6] to-[#126DA6] bg-clip-text text-transparent">
            {roleName}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <Smile size={11} className="text-[#2A95BF]" />
        <p className="text-xs font-semibold text-slate-600">Chúc bạn một ngày làm việc hiệu quả!</p>
      </div>
    </div>
  )
}
