import { Suspense } from "react";
import CandidateLoginPage from "@/src/features/auth/components/CandidateLoginPage";

export const metadata = {
  title: "Đăng nhập ứng viên | TalentCore",
  description: "Đăng nhập vào cổng thông tin ứng viên TalentCore",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center text-slate-400">Đang tải...</div>}>
      <CandidateLoginPage />
    </Suspense>
  );
}