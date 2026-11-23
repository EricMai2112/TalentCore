import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';
import {
  AuthMessageResponse,
  CandidateUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordWithOtpPayload,
} from '../types/auth.types';

const TOKEN_KEY = '@talentcore_candidate_token';
const USER_KEY = '@talentcore_candidate_user';

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Đăng nhập không thành công';
        throw new Error(errorMsg);
      }

      if (data.user?.role && data.user.role !== 'CANDIDATE') {
        throw new Error('Tài khoản này không dành cho ứng viên.');
      }

      await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return data as LoginResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Kết nối máy chủ quá hạn. Vui lòng thử lại!');
      }
      throw error;
    }
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Đăng ký không thành công';
        throw new Error(errorMsg);
      }

      return data as RegisterResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Kết nối máy chủ quá hạn. Vui lòng thử lại!');
      }
      throw error;
    }
  },

  getStoredSession: async (): Promise<{ token: string; user: CandidateUser } | null> => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (token && userStr) {
        return {
          token,
          user: JSON.parse(userStr) as CandidateUser,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch {}
  },

  sendForgotPasswordOtp: async (email: string): Promise<AuthMessageResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgot-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Không thể gửi mã xác thực OTP';
        throw new Error(errorMsg);
      }

      return data as AuthMessageResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Kết nối máy chủ quá hạn. Vui lòng thử lại!');
      }
      throw error;
    }
  },

  verifyForgotPasswordOtp: async (email: string, otp: string): Promise<AuthMessageResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Mã xác thực không hợp lệ';
        throw new Error(errorMsg);
      }

      return data as AuthMessageResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Kết nối máy chủ quá hạn. Vui lòng thử lại!');
      }
      throw error;
    }
  },

  resetPasswordWithOtp: async (payload: ResetPasswordWithOtpPayload): Promise<AuthMessageResponse> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/reset-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: payload.email.trim().toLowerCase(),
          otp: payload.otp.trim(),
          password: payload.password,
          confirm_password: payload.confirm_password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Đặt lại mật khẩu thất bại';
        throw new Error(errorMsg);
      }

      return data as AuthMessageResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Kết nối máy chủ quá hạn. Vui lòng thử lại!');
      }
      throw error;
    }
  },
};
