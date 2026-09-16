import { Bell } from 'lucide-react'
import WeatherWidget from '@/src/components/layout/WeatherWidget'
import TopbarGreeting from '@/src/components/layout/TopbarGreeting'
import UserDropdown from '@/src/components/layout/UserDropdown'

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-2 py-3 bg-transparent shrink-0 z-20 min-h-[64px]">
      {/* LEFT: Weather Widget + Dynamic Greeting */}
      <div className="flex items-center gap-3.5">
        <WeatherWidget />
        <TopbarGreeting />
      </div>

      {/* RIGHT: Notifications & User Dropdown */}
      <div className="flex items-center gap-3">
        {/* Bell Notification */}
        <button
          type="button"
          className="relative p-2.5 rounded-xl text-[#3B82F6] hover:text-[#8B5CF6] hover:bg-[#3B82F6]/10 transition-all cursor-pointer flex items-center justify-center bg-white/40 backdrop-blur-md border border-[#3B82F6]/60 hover:border-[#8B5CF6]/60 shadow-2xs"
        >
          <Bell size={19} />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-2xs leading-none">
            3
          </span>
        </button>

        {/* Circle User Avatar Dropdown */}
        <UserDropdown />
      </div>
    </header>
  )
}
