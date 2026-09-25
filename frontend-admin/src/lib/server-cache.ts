import { cache } from 'react';
import { createServerApiClient } from './api-client';
import { Department } from '@/src/features/departments/types/department.types';

interface ApiResponse<T> {
  message?: string;
  data?: T;
}

/**
 * Request Memoization & Data Cache for Departments.
 * - React cache(): Deduplicates calls within the same server request.
 * - Next.js revalidate (300s): Caches the response across requests for 5 mins.
 */
export const getCachedDepartments = cache(async (): Promise<Department[]> => {
  try {
    const api = await createServerApiClient();
    const res = await api.get<Department[] | ApiResponse<Department[]>>('/departments', {
      next: { revalidate: 300, tags: ['departments'] },
    });
    return (res as any)?.data ?? res ?? [];
  } catch (err) {
    console.error('[getCachedDepartments] Failed to fetch departments:', err);
    return [];
  }
});
