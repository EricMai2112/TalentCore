import NotificationDropdown from '@/src/components/layout/NotificationDropdown'
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
        {/* Real-time Notification Dropdown */}
        <NotificationDropdown />

        {/* Circle User Avatar Dropdown */}
        <UserDropdown />
      </div>
    </header>
  )
}
