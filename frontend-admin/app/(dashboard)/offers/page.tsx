import { OffersManager } from '@/src/features/offers/components';
import { createServerApiClient } from '@/src/lib/api-client';
import { getCachedDepartments } from '@/src/lib/server-cache';
import { OfferItem, OfferListResponse } from '@/src/features/offers/types/offer.types';
import { Department } from '@/src/features/departments/types/department.types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý đề nghị nhận việc | TalentCore Admin',
  description: 'Quản lý và theo dõi quy trình gửi offer và phản hồi nhận việc của ứng viên',
};

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  let initialOffers: OfferItem[] = [];
  let initialTotal = 0;
  let initialDepartments: Department[] = [];
  let initialApplications: any[] = [];

  try {
    const api = await createServerApiClient();

    interface ApiResponse<T> {
      message: string;
      data: T;
    }

    const [offersRes, depts, appsRes] = await Promise.allSettled([
      api.get<ApiResponse<OfferListResponse>>('/offers?limit=10'),
      getCachedDepartments(),
      api.get<any[] | ApiResponse<any[]>>('/applications/kanban'),
    ]);

    if (offersRes.status === 'fulfilled') {
      const data = offersRes.value?.data;
      if (data && 'items' in data) {
        initialOffers = data.items;
        initialTotal = data.total;
      }
    }

    if (depts.status === 'fulfilled') {
      initialDepartments = depts.value;
    }

    if (appsRes.status === 'fulfilled') {
      initialApplications = (appsRes.value as any)?.data ?? appsRes.value ?? [];
    }
  } catch (err) {
    console.error('[OffersPage] SSR data fetch error:', err);
  }

  return (
    <OffersManager
      initialOffers={initialOffers}
      initialTotal={initialTotal}
      initialDepartments={initialDepartments}
      initialApplications={initialApplications}
    />
  );
}
