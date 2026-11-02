import { LoginPayload } from '../types/auth.types';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLogin = (payload: LoginPayload): string | null => {
  if (!payload.email?.trim()) {
    return 'Vui lòng nhập địa chỉ email';
  }
  if (!EMAIL_REGEX.test(payload.email.trim())) {
    return 'Định dạng email không hợp lệ';
  }
  if (!payload.password) {
    return 'Vui lòng nhập mật khẩu';
  }
  if (payload.password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  return null;
};
