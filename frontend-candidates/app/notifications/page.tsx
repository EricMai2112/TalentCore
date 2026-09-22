import CandidateNotificationsView from '@/src/features/notifications/components/CandidateNotificationsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thông báo của tôi | TalentCore Careers',
  description: 'Xem tất cả thông báo lịch phỏng vấn và cập nhật tiến trình hồ sơ ứng tuyển của bạn',
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-4">
      <CandidateNotificationsView />
    </div>
  );
}
