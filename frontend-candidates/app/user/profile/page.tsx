import CandidateProfileView from "@/src/features/user/components/CandidateProfileView";
import ProfilesManager from "@/src/features/user/components/ProfilesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | TalentCore Careers",
  description: "Quản lý và cập nhật thông tin hồ sơ ứng viên trực tuyến tại TalentCore",
};

export default function CandidateProfilePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <ProfilesManager />
    </div>
  );
}