import Sidebar from '@/src/components/layout/Sidebar'
import Topbar from '@/src/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        // background: 'linear-gradient(135deg, #D5E7F2 0%, #EBF4FA 55%, #C4DFEF 100%)'
        background: 'linear-gradient(135deg, #C4DFEF 0%, #B8D9EC 40%, #8FC1E0 100%)'
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden pr-3 pb-3">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl shadow-xl shadow-[#1261A6]/8 transition-all">
          {children}
        </main>
      </div>
    </div>
  )
}
