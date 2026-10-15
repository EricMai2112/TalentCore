import { useQuery } from '@tanstack/react-query'
import { interviewsApi } from '../services/interviews.api'
import { InterviewItem } from '../types/interview.types'

export const interviewKeys = {
  all: ['interviews'] as const,
  lists: () => [...interviewKeys.all, 'list'] as const,
  list: (status?: string) => [...interviewKeys.lists(), { status }] as const,
  details: () => [...interviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...interviewKeys.details(), id] as const
}

interface UseInterviewsQueryOptions {
  status?: string
  initialData?: InterviewItem[]
  enabled?: boolean
}

export function useInterviewsQuery({
  status,
  initialData,
  enabled = true
}: UseInterviewsQueryOptions = {}) {
  return useQuery({
    queryKey: interviewKeys.list(status),
    queryFn: () => interviewsApi.getInterviews(status),
    initialData,
    enabled,
    staleTime: 60 * 1000 // 1 minute
  })
}
