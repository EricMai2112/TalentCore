import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Định dạng email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
