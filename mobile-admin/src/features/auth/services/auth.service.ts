import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../../config/api.config';
import { LoginPayload, LoginResponse, User, UserRole } from '../types/auth.types';

const TOKEN_KEY = '@talencore_admin_token';
const USER_KEY = '@talencore_admin_user';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const url = `${API_CONFIG.BASE_URL}/auth/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          (Array.isArray(data?.message) ? data.message.join(', ') : 'Đăng nhập không thành công');
        throw new Error(errorMsg);
      }

      const user: User = data.user;
      if (user.role === UserRole.CANDIDATE) {
        throw new Error('Ứng viên vui lòng đăng nhập qua ứng dụng dành cho Ứng viên.');
      }

      if (data.access_token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return data as LoginResponse;
    } catch (err: any) {
      if (err.message?.includes('Network request failed')) {
        throw new Error(
          `Không thể kết nối đến máy chủ (${API_CONFIG.BASE_URL}). Vui lòng kiểm tra lại kết nối mạng hoặc đảm bảo backend đang chạy.`,
        );
      }
      throw err;
    }
  },

  async getStoredSession(): Promise<{ token: string | null; user: User | null }> {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      const user = userJson ? (JSON.parse(userJson) as User) : null;
      return { token, user };
    } catch {
      return { token: null, user: null };
    }
  },

  async logout(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  async updateProfile(payload: { name?: string; phone?: string }): Promise<User> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const url = `${API_CONFIG.BASE_URL}/users/profile`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Cập nhật thông tin thất bại');
    }
    const updatedUser = data.user;
    if (updatedUser) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
    return updatedUser;
  },

  async changePassword(payload: { oldPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const url = `${API_CONFIG.BASE_URL}/auth/change-password`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      throw new Error(errorMsg || 'Đổi mật khẩu thất bại');
    }
    return data;
  },
};
