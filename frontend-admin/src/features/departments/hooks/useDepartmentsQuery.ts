import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '../services/department.api';
import { Department } from '../types/department.types';

export const DEPARTMENTS_QUERY_KEY = ['departments'] as const;

export function useDepartmentsQuery(options?: { initialData?: Department[] }) {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: () => departmentApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    ...options,
  });
}
