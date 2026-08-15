// frontend-candidates/app/(auth)/register/page.tsx
import CandidateRegisterPage from "@/src/features/auth/components/CandidateRegisterPage";

export const metadata = {
  title: "Đăng ký tài khoản Ứng viên | TalentCore",
  description: "Tạo tài khoản ứng viên mới trên hệ thống tuyển dụng TalentCore",
};

export default function RegisterPage() {
  return <CandidateRegisterPage />;
}