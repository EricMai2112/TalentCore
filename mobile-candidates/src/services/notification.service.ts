import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

const TOKEN_KEY = '@talentcore_candidate_token';

export interface MobileNotificationItem {
  _id: string;
  recipientId?: string;
  recipientUserId?: string;
  recipientRole?: string;
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GetNotificationsResponse {
  items: MobileNotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export const notificationService = {
  getNotifications: async (params?: {
    category?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<GetNotificationsResponse> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.isRead !== undefined) query.append('isRead', String(params.isRead));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    const url = `${API_CONFIG.BASE_URL}/notifications${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy danh sách thông báo');
    }

    const payload = data.data || data;
    const items = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload)
      ? payload
      : [];

    return {
      items,
      total: payload.total ?? items.length,
      unreadCount: payload.unreadCount ?? items.filter((i: any) => !i.isRead).length,
      page: payload.page ?? 1,
      limit: payload.limit ?? 30,
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) return 0;
    return data.data?.count ?? data.count ?? 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Không thể cập nhật trạng thái');
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Không thể đánh dấu tất cả');
    }
  },

  deleteNotification: async (id: string): Promise<void> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Không thể xóa thông báo');
    }
  },
};
