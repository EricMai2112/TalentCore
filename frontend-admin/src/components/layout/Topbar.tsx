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
          className="relative p-2 rounded-xl text-[#0a65bb] hover:bg-[#0a65bb]/10 transition-all cursor-pointer flex items-center justify-center bg-transparent"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold shadow-xs leading-none">
            3
          </span>
        </button>

        {/* Circle User Avatar Dropdown */}
        <UserDropdown />
      </div>
    </header>
  )
}
