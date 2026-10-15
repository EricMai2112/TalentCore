import { useQuery } from '@tanstack/react-query'
import { jobDescriptionApi } from '../services/job-description.api'
import { JobDescription } from '../types/job-description.types'

export const jobDescriptionKeys = {
  all: ['job-descriptions'] as const,
  lists: () => [...jobDescriptionKeys.all, 'list'] as const,
  details: () => [...jobDescriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobDescriptionKeys.details(), id] as const
}

interface UseJobDescriptionsQueryOptions {
  initialData?: JobDescription[]
  enabled?: boolean
}

export function useJobDescriptionsQuery({
  initialData,
  enabled = true
}: UseJobDescriptionsQueryOptions = {}) {
  return useQuery({
    queryKey: jobDescriptionKeys.lists(),
    queryFn: () => jobDescriptionApi.getJobs(),
    initialData,
    enabled,
    staleTime: 60 * 1000 // 1 minute
  })
}
