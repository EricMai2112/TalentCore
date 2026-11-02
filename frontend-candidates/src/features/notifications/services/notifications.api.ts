import { apiClient } from '@/src/lib/api-client';
import {
  NotificationItem,
  NotificationListResponse,
} from '../types/notification.types';

export interface GetNotificationsParams {
  category?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export const notificationsApi = {
  getNotifications: async (
    params?: GetNotificationsParams,
  ): Promise<NotificationListResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.category) queryParams.category = params.category;
    if (params?.isRead !== undefined) queryParams.isRead = String(params.isRead);
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    const res = await apiClient.get<any>('/notifications', {
      params: queryParams,
    });

    const payload = res?.data || res || {};
    const items = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload)
      ? payload
      : [];

    return {
      items,
      total: payload.total ?? items.length,
      unreadCount: payload.unreadCount ?? 0,
      page: payload.page ?? 1,
      limit: payload.limit ?? 30,
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<any>('/notifications/unread-count');
    return res?.data?.count ?? res?.count ?? res?.unreadCount ?? 0;
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await apiClient.patch<any>(`/notifications/${id}/read`, {});
    return res?.data || res;
  },

  markAllAsRead: async (): Promise<{ modifiedCount: number }> => {
    const res = await apiClient.patch<any>('/notifications/read-all', {});
    return res?.data || res;
  },

  deleteNotification: async (id: string): Promise<{ deleted: boolean }> => {
    const res = await apiClient.delete<any>(`/notifications/${id}`);
    return res?.data || res;
  },
};
