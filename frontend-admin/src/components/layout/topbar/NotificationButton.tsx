'use client'

import { Bell } from 'lucide-react'
import { BRAND_COLORS } from '@/src/constants/theme'

export default function NotificationButton() {
  return (
    <button
      style={{
        borderColor: BRAND_COLORS.primary.DEFAULT,
        color: BRAND_COLORS.primary.DEFAULT
      }}
      className="relative p-2 rounded-xl bg-transparent hover:bg-slate-100/60 transition-all duration-150 cursor-pointer flex items-center justify-center focus:outline-none"
      title="Thông báo"
    >
      <Bell size={18} />
      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none border-2 border-white shadow-xs">
        3
      </span>
    </button>
  )
}
