import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/user.api';
import { User } from '../types/user.types';

export const EMPLOYEES_QUERY_KEY = ['employees'] as const;

export function useEmployeesQuery(options?: { initialData?: User[]; enabled?: boolean }) {
  return useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: () => userApi.getEmployees(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    ...options,
  });
}
