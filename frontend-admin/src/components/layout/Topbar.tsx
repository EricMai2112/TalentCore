import WeatherWidget from "./topbar/WeatherWidget";
import UserGreeting from "./topbar/UserGreeting";
import NotificationButton from "./topbar/NotificationButton";
import UserMenuDropdown from "./topbar/UserMenuDropdown";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200/80 bg-white shrink-0 min-h-[60px] select-none">
      {/* Left side: Weather card + Time Greeting (No page title) */}
      <div className="flex items-center gap-4">
        <WeatherWidget />
        <UserGreeting />
      </div>

      {/* Right side: Transparent Notification Bell + User Avatar Dropdown */}
      <div className="flex items-center gap-3">
        <NotificationButton />
        <UserMenuDropdown />
      </div>
    </header>
  );
}