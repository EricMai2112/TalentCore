import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardManager from '@/src/features/dashboard/components/DashboardManager';

export const metadata: Metadata = {
  title: 'Dashboard | TalentCore Admin',
  description: 'Tổng quan hiệu suất và phân tích tuyển dụng',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload.role === 'EMPLOYEE') {
          redirect('/interviews');
        }
      }
    } catch {
      // fallback
    }
  }

  return <DashboardManager />;
}
