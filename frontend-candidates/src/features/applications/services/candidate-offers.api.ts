import { apiClient } from '@/src/lib/api-client';
import { CandidateOfferItem } from '../types/application.types';

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const candidateOffersApi = {
  getMyOffers: async (): Promise<CandidateOfferItem[]> => {
    try {
      const res = await apiClient.get<ApiResponse<CandidateOfferItem[]>>('/offers/my-offers');
      return res.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lời mời nhận việc:', error);
      return [];
    }
  },

  respondOffer: async (
    offerId: string,
    action: 'ACCEPT' | 'DECLINE',
    declineReason?: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.post<ApiResponse<CandidateOfferItem>>(
        `/offers/${offerId}/respond`,
        {
          action,
          declineReason,
        },
      );
      return { success: true, message: res.message };
    } catch (error: any) {
      console.error('Lỗi khi phản hồi lời mời nhận việc:', error);
      return {
        success: false,
        message: error.message || 'Không thể gửi phản hồi lúc này',
      };
    }
  },
};
