'use client';

import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../services/analytics.api';
import { DashboardData } from '../types/dashboard.types';

export function useDashboardData(departmentId?: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await analyticsApi.getAllDashboardData(6, 5, departmentId);
      setData(result);
      setLastUpdated(new Date());
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => fetchData();

  return { data, isLoading, isError, refetch, lastUpdated };
}
