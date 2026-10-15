import { apiClient } from '@/src/lib/api-client'
import { CandidateInterviewItem, AvailableSlot } from '../types/application.types'

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

  getAvailableSlots: async (interviewerId?: string, date?: string): Promise<AvailableSlot[]> => {
    try {
      const params = new URLSearchParams()
      if (interviewerId) params.append('interviewerId', interviewerId)
      if (date) params.append('date', date)
      const res = await apiClient.get<AvailableSlot[]>(`/interviews/available-slots?${params.toString()}`)
      return res || []
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khung giờ khả dụng:', error)
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

  submitRescheduleRequest: async (
    interviewId: string,
    payload: {
      selectedSlot?: { date: string; startTime: string; endTime: string }
      customSlot?: { date: string; startTime: string; endTime: string }
      reason?: string
    }
  ): Promise<boolean> => {
    try {
      await apiClient.post(`/interviews/${interviewId}/reschedule-request`, payload)
      return true
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu đổi lịch:', error)
      return false
    }
  },

  acceptProposedSlot: async (
    interviewId: string,
    selectedSlot: { date: string; startTime: string; endTime: string }
  ): Promise<boolean> => {
    try {
      await apiClient.patch(`/interviews/${interviewId}/accept-proposed-slot`, { selectedSlot })
      return true
    } catch (error) {
      console.error('Lỗi khi chọn lịch phỏng vấn HR đề xuất:', error)
      return false
    }
  },

  requestCancellation: async (interviewId: string, reason: string): Promise<boolean> => {
    try {
      await apiClient.patch(`/interviews/${interviewId}/request-cancel`, { reason })
      return true
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu hủy lịch phỏng vấn:', error)
      return false
    }
  }
}
