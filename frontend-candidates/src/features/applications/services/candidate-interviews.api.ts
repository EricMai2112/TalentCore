import { apiClient } from '@/src/lib/api-client'
import { CandidateInterviewItem } from '../types/application.types'

interface ApiResponse<T> {
  message: string
  data: T
}

export const candidateInterviewsApi = {
  getMyInterviews: async (): Promise<CandidateInterviewItem[]> => {
    try {
      const res = await apiClient.get<ApiResponse<CandidateInterviewItem[]>>('/interviews/my-interviews')
      return res.data || []
    } catch (error) {
      console.error('Lỗi khi lấy lịch phỏng vấn của tôi:', error)
      return []
    }
  },

  confirmInterview: async (interviewId: string): Promise<boolean> => {
    try {
      await apiClient.patch(`/interviews/${interviewId}/candidate-confirm`, {
        confirmationStatus: 'CONFIRMED'
      })
      return true
    } catch (error) {
      console.error('Lỗi khi xác nhận lịch phỏng vấn:', error)
      return false
    }
  },

  requestReschedule: async (interviewId: string): Promise<boolean> => {
    try {
      await apiClient.patch(`/interviews/${interviewId}/candidate-confirm`, {
        confirmationStatus: 'RESCHEDULE_REQUESTED'
      })
      return true
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu đổi lịch:', error)
      return false
    }
  }
}
