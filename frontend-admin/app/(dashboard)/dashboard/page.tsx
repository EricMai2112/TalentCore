import type { Metadata } from 'next';
import DashboardManager from '@/src/features/dashboard/components/DashboardManager';

export const metadata: Metadata = {
  title: 'Dashboard | TalentCore Admin',
  description: 'Tổng quan hiệu suất và phân tích tuyển dụng',
};

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardManager />;
}
