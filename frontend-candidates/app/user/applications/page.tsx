import MyApplicationsView from '@/src/features/applications/components/MyApplicationsView'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Công việc đã ứng tuyển | TalentCore Careers',
  description: 'Theo dõi trạng thái và tiến trình hồ sơ ứng tuyển của bạn tại TalentCore'
}

export default function MyApplicationsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-2">
      <MyApplicationsView />
    </div>
  )
}
