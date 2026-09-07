import CandidateProfileView from '@/src/features/user/components/CandidateProfileView'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Chỉnh sửa Hồ sơ | TalentCore Careers',
  description: 'Cập nhật thông tin chi tiết hồ sơ ứng viên tại TalentCore'
}

export default async function EditProfileByIdPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pt-3 pb-8 px-2 sm:px-4 lg:px-6 xl:px-8">
      <CandidateProfileView profileId={id} />
    </div>
  )
}
