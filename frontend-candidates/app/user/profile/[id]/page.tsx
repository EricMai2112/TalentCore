import CandidateProfileView from "@/src/features/user/components/CandidateProfileView";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Chỉnh sửa Hồ sơ | TalentCore Careers",
  description: "Cập nhật thông tin chi tiết hồ sơ ứng viên tại TalentCore",
};

export default async function EditProfileByIdPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <CandidateProfileView profileId={id} />
    </div>
  );
}