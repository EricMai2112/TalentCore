import Sidebar from '@/src/components/layout/Sidebar'
import Topbar from '@/src/components/layout/Topbar'
import { NotificationProvider } from '@/src/providers/NotificationProvider'
import { SidebarProvider } from '@/src/providers/SidebarProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <div
          className="flex h-screen overflow-hidden"
          style={{
            // background: 'linear-gradient(135deg, #D5E7F2 0%, #EBF4FA 55%, #C4DFEF 100%)'
            background: `
            radial-gradient(circle at 12% 18%, rgba(139, 92, 246, 0.22), transparent 45%),
            radial-gradient(circle at 88% 12%, rgba(6, 182, 212, 0.26), transparent 50%),
            radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.18), transparent 55%),
            linear-gradient(135deg, #C4DFEF 0%, #B8D9EC 40%, #8FC1E0 100%)
          `
          }}
        >
          <Sidebar />
          <div className="flex flex-col flex-1 pb-2 pr-2 overflow-hidden">
            <Topbar />
            {/* <main className="flex-1 overflow-y-auto p-4 bg-white/70 backdrop-blur-xl border border-white/70 rounded-3xl shadow-xl shadow-[#1261A6]/8 transition-all [scrollbar-width:thin] [scrollbar-color:rgba(59,130,246,0.6)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3B82F6]/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#2563EB]"> */}
            <main
              className="flex-1 overflow-y-auto p-4 backdrop-blur-xl border border-white/70 rounded-3xl shadow-xl shadow-[#1261A6]/8 transition-all [scrollbar-width:thin] [scrollbar-color:rgba(59,130,246,0.6)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3B82F6]/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#2563EB]"
              style={{
                background: `
      radial-gradient(circle at 12% 18%, rgba(139, 92, 246, 0.08), transparent 45%),
      radial-gradient(circle at 88% 12%, rgba(6, 182, 212, 0.10), transparent 50%),
      radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.07), transparent 55%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(245, 250, 255, 0.80) 45%, rgba(232, 244, 252, 0.75) 100%)
    `
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  )
}
