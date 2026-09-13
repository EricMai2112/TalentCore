'use client'

import { useState, useEffect } from 'react'
import { Sun, CloudSun, Moon } from 'lucide-react'
import { useAuth } from '@/src/providers/AuthProvider'
import { USER_ROLE_LABEL } from '@/src/features/users/types/user.types'

export default function TopbarGreeting() {
  const { user } = useAuth()
  const [timeGreeting, setTimeGreeting] = useState<{ text: string; icon: React.ReactNode }>({
    text: 'buổi sáng',
    icon: <Sun size={18} className="text-amber-500 shrink-0" />
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setTimeGreeting({
        text: 'buổi sáng',
        icon: <Sun size={18} className="text-amber-500 shrink-0" />
      })
    } else if (hour >= 12 && hour < 18) {
      setTimeGreeting({
        text: 'buổi chiều',
        icon: <CloudSun size={18} className="text-amber-500 shrink-0" />
      })
    } else {
      setTimeGreeting({
        text: 'buổi tối',
        icon: <Moon size={18} className="text-indigo-400 shrink-0" />
      })
    }
  }, [])

  const roleName = user?.role ? USER_ROLE_LABEL[user.role] : 'Người dùng'

  return (
    <div className="hidden sm:flex flex-col">
      <p className="text-xs font-semibold text-slate-600 leading-tight">
        Chào {timeGreeting.text},{' '}
        <span className="font-extrabold text-slate-900">{roleName}</span>
      </p>
      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
        Chúc bạn một ngày làm việc hiệu quả!
      </p>
    </div>
  )
}
