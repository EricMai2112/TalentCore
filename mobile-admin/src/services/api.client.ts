import { API_CONFIG } from '../config/api.config';
import { authService } from '../features/auth/services/auth.service';

type UnauthorizedCallback = () => void;
let onUnauthorizedCallback: UnauthorizedCallback | null = null;

export const setOnUnauthorizedCallback = (cb: UnauthorizedCallback | null) => {
  onUnauthorizedCallback = cb;
};

const handleUnauthorized = async () => {
  try {
    await authService.logout();
  } catch (e) {
    console.error('Error logging out on 401:', e);
  }
  if (onUnauthorizedCallback) {
    onUnauthorizedCallback();
  }
};

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

export const apiClient = {
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const headers = await getAuthHeaders();
    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }
      throw new Error(data?.message || 'Yêu cầu không thành công');
    }
    return data?.data !== undefined ? data.data : data;
  },

  async post<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }
      throw new Error(data?.message || 'Thao tác không thành công');
    }
    return data?.data !== undefined ? data.data : data;
  },

  async put<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }
      throw new Error(data?.message || 'Cập nhật không thành công');
    }
    return data?.data !== undefined ? data.data : data;
  },

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }
      throw new Error(data?.message || 'Cập nhật không thành công');
    }
    return data?.data !== undefined ? data.data : data;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = await getAuthHeaders();
    const response = await fetch(url, { method: 'DELETE', headers });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }
      throw new Error(data?.message || 'Xóa không thành công');
    }
    return data?.data !== undefined ? data.data : data;
  },
};
