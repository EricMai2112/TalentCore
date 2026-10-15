import CreateOfferPageContent from '@/src/features/offers/components/CreateOfferPageContent';
import { createServerApiClient } from '@/src/lib/api-client';
import { getCachedDepartments } from '@/src/lib/server-cache';
import { Department } from '@/src/features/departments/types/department.types';
import { OfferItem } from '@/src/features/offers/types/offer.types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chỉnh sửa đề nghị nhận việc | TalentCore Admin',
  description: 'Chỉnh sửa điều khoản tuyển dụng và cập nhật thư mời nhận việc cho ứng viên',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOfferPage({ params }: PageProps) {
  const { id } = await params;

  let initialOffer: OfferItem | null = null;
  let initialApplications: any[] = [];
  let initialDepartments: Department[] = [];

  try {
    const api = await createServerApiClient();

    interface ApiResponse<T> {
      message: string;
      data: T;
    }

    const [offerRes, depts, appsRes] = await Promise.allSettled([
      api.get<ApiResponse<OfferItem>>(`/offers/${id}`),
      getCachedDepartments(),
      api.get<any[]>('/applications/kanban'),
    ]);

    if (offerRes.status === 'fulfilled') {
      const data = offerRes.value?.data;
      initialOffer = (data as any)?.data ?? data ?? null;
    }

    if (depts.status === 'fulfilled') {
      initialDepartments = depts.value;
    }

    if (appsRes.status === 'fulfilled') {
      initialApplications = (appsRes.value as any)?.data ?? appsRes.value ?? [];
    }
  } catch (err) {
    console.error('[EditOfferPage] SSR fetch error:', err);
  }

  return (
    <CreateOfferPageContent
      initialOfferId={id}
      initialOffer={initialOffer}
      initialApplications={initialApplications}
      initialDepartments={initialDepartments}
    />
  );
}
