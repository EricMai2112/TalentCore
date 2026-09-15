import Sidebar from '@/src/components/layout/Sidebar'
import Topbar from '@/src/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 45%, #f1d5b1 100%)'
        // background: 'linear-gradient(145deg, #e0f2fe 0%, #f1f5f9 55%, #fed7aa 100%)'
      }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden pr-3 pb-3">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-white opacity-85 border border-slate-200/80 rounded-2xl shadow-2xs">
          {children}
        </main>
      </div>
    </div>
  )
}
