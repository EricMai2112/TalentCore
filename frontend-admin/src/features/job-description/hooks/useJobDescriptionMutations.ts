import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobDescriptionApi } from '../services/job-description.api'
import { jobDescriptionKeys } from './useJobDescriptionsQuery'
import { UpdateJobDescriptionDto } from '../types/job-description.types'

export function useDeleteJobDescriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => jobDescriptionApi.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobDescriptionKeys.all })
    }
  })
}

export function useUpdateJobDescriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobDescriptionDto }) =>
      jobDescriptionApi.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobDescriptionKeys.all })
    }
  })
}
