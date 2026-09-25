import CreateOfferPageContent from '@/src/features/offers/components/CreateOfferPageContent';
import { createServerApiClient } from '@/src/lib/api-client';
import { getCachedDepartments } from '@/src/lib/server-cache';
import { Department } from '@/src/features/departments/types/department.types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soạn đề nghị nhận việc | TalentCore Admin',
  description: 'Thiết lập điều kiện tuyển dụng và soạn thảo thư mời nhận việc (Offer Letter) cho ứng viên',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ applicationId?: string }>;
}

export default async function CreateOfferPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const applicationId = resolvedSearchParams?.applicationId;

  let initialApplications: any[] = [];
  let initialDepartments: Department[] = [];

  try {
    const api = await createServerApiClient();

    const [depts, appsRes] = await Promise.allSettled([
      getCachedDepartments(),
      api.get<any[]>('/applications/kanban'),
    ]);

    if (depts.status === 'fulfilled') {
      initialDepartments = depts.value;
    }

    if (appsRes.status === 'fulfilled') {
      initialApplications = (appsRes.value as any)?.data ?? appsRes.value ?? [];
    }
  } catch (err) {
    console.error('[CreateOfferPage] SSR fetch error:', err);
  }

  return (
    <CreateOfferPageContent
      initialApplicationId={applicationId}
      initialApplications={initialApplications}
      initialDepartments={initialDepartments}
    />
  );
}
