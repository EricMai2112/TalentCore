import { useQuery } from '@tanstack/react-query'
import { candidateApi } from '../services/candidate.api'
import { CandidateApplication } from '../types/candidate.types'

export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (params?: { departmentId?: string; jobId?: string; search?: string }) =>
    [...candidateKeys.lists(), params] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const
}

interface UseCandidatesQueryOptions {
  params?: {
    departmentId?: string
    jobId?: string
    search?: string
  }
  initialData?: CandidateApplication[]
  enabled?: boolean
}

export function useCandidatesQuery({
  params,
  initialData,
  enabled = true
}: UseCandidatesQueryOptions = {}) {
  return useQuery({
    queryKey: candidateKeys.list(params),
    queryFn: () => candidateApi.getCandidates(params),
    placeholderData: (previousData) => previousData,
    initialData,
    enabled,
    staleTime: 60 * 1000 // 1 minute
  })
}
