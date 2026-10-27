import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import {
  AvailableSlot,
  CandidateInterviewItem,
  CandidateInvitationItem,
  CandidateOfferItem,
  MyApplicationsResponseData,
} from '../types/application.types';

interface ApiResponse<T> {
  message: string;
  data: T;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const session = await authService.getStoredSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  return headers;
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = await getAuthHeaders();
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    if (!response.ok) {
      const errorMsg = Array.isArray(result.message)
        ? result.message.join(', ')
        : result.message || 'Yêu cầu không thành công';
      throw new Error(errorMsg);
    }

    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Kết nối máy chủ quá hạn. Vui lòng thử lại!');
    }
    throw error;
  }
};

export interface ApplyJobMobilePayload {
  jobDescriptionId: string;
  candidateId?: string;
  cvFile?: {
    uri: string;
    name: string;
    mimeType?: string;
    file?: any;
  } | null;
}

export const applicationService = {
  // 1. Applications
  getMyApplications: async (): Promise<MyApplicationsResponseData> => {
    try {
      const res = await request<ApiResponse<MyApplicationsResponseData>>(
        '/applications/my-applications',
      );
      return (
        res.data || {
          applications: [],
          stats: {
            totalApplied: 0,
            processingCount: 0,
            interviewCount: 0,
            offerCount: 0,
          },
        }
      );
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ứng tuyển:', error);
      return {
        applications: [],
        stats: {
          totalApplied: 0,
          processingCount: 0,
          interviewCount: 0,
          offerCount: 0,
        },
      };
    }
  },

  applyJob: async (
    payload: ApplyJobMobilePayload | FormData,
  ): Promise<{ message: string; applicationId: string; currentStage?: any }> => {
    let body: any;
    if (payload instanceof FormData) {
      body = payload;
    } else {
      const formData = new FormData();
      formData.append('jobDescriptionId', payload.jobDescriptionId);
      if (payload.candidateId) {
        formData.append('candidateId', payload.candidateId);
      }
      if (payload.cvFile) {
        const { uri, name, mimeType, file } = payload.cvFile;
        if (file && typeof file === 'object' && ('size' in file || 'arrayBuffer' in file)) {
          formData.append('cv', file, name);
        } else {
          try {
            const fileRes = await fetch(uri);
            const blob = await fileRes.blob();
            formData.append('cv', blob, name);
          } catch {
            formData.append('cv', {
              uri,
              name,
              type: mimeType || 'application/pdf',
            } as any);
          }
        }
      }
      body = formData;
    }

    return await request('/applications/apply', {
      method: 'POST',
      body,
    });
  },

  // 2. Interviews
  getMyInterviews: async (): Promise<CandidateInterviewItem[]> => {
    try {
      const res = await request<ApiResponse<CandidateInterviewItem[]>>(
        '/interviews/my-interviews',
      );
      return res.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phỏng vấn:', error);
      return [];
    }
  },

  getAvailableSlots: async (
    interviewerId?: string,
    date?: string,
  ): Promise<AvailableSlot[]> => {
    try {
      const params = new URLSearchParams();
      if (interviewerId) params.append('interviewerId', interviewerId);
      if (date) params.append('date', date);
      const res = await request<AvailableSlot[]>(
        `/interviews/available-slots?${params.toString()}`,
      );
      return Array.isArray(res) ? res : [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khung giờ khả dụng:', error);
      return [];
    }
  },

  confirmInterview: async (interviewId: string): Promise<boolean> => {
    try {
      await request(`/interviews/${interviewId}/candidate-confirm`, {
        method: 'PATCH',
        body: JSON.stringify({ confirmationStatus: 'CONFIRMED' }),
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi xác nhận lịch phỏng vấn:', error);
      return false;
    }
  },

  submitRescheduleRequest: async (
    interviewId: string,
    payload: {
      selectedSlot?: { date: string; startTime: string; endTime: string };
      customSlot?: { date: string; startTime: string; endTime: string };
      reason?: string;
    },
  ): Promise<boolean> => {
    try {
      await request(`/interviews/${interviewId}/reschedule-request`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu đổi lịch:', error);
      return false;
    }
  },

  submitCancelRequest: async (
    interviewId: string,
    reason?: string,
  ): Promise<boolean> => {
    try {
      await request(`/interviews/${interviewId}/cancel-request`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu hủy lịch:', error);
      return false;
    }
  },

  // 3. Offers
  getMyOffers: async (): Promise<CandidateOfferItem[]> => {
    try {
      const res = await request<ApiResponse<CandidateOfferItem[]>>(
        '/offers/my-offers',
      );
      return res.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách offer:', error);
      return [];
    }
  },

  respondOffer: async (
    offerId: string,
    action: 'ACCEPT' | 'DECLINE',
    declineReason?: string,
    otp?: string,
    firebaseVerified?: boolean,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await request<ApiResponse<CandidateOfferItem>>(
        `/offers/${offerId}/respond`,
        {
          method: 'POST',
          body: JSON.stringify({
            action,
            declineReason,
            otp,
            firebaseVerified,
          }),
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

  requestOtp: async (
    offerId: string,
  ): Promise<{ success: boolean; message: string; maskedPhone?: string; phone?: string }> => {
    try {
      const res = await request<ApiResponse<{ message: string; maskedPhone: string; phone?: string }>>(
        `/offers/${offerId}/request-otp`,
        {
          method: 'POST',
        },
      );
      return {
        success: true,
        message: res.message || 'Đã gửi mã OTP đến số điện thoại của bạn.',
        maskedPhone: res.data?.maskedPhone,
        phone: res.data?.phone,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Không thể gửi lại mã OTP lúc này',
      };
    }
  },

  // 4. Rediscovery Invitations
  getMyInvitations: async (): Promise<CandidateInvitationItem[]> => {
    try {
      const res = await request<ApiResponse<CandidateInvitationItem[]>>(
        '/applications/rediscovery/my-invitations',
      );
      return res.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lời mời:', error);
      return [];
    }
  },

  respondInvitation: async (
    invitationId: string,
    action: 'ACCEPT' | 'DECLINE',
    declineReason?: string,
  ): Promise<any> => {
    return await request(
      `/applications/rediscovery/respond/${invitationId}`,
      {
        method: 'POST',
        body: JSON.stringify({ action, declineReason }),
      },
    );
  },
};
