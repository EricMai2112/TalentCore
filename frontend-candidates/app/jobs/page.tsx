import { Metadata } from "next";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { candidateJobApi } from "@/src/features/jobs/services/job-api";
import CandidateJobsClient from "@/src/features/jobs/components/CandidateJobsClient";

export const metadata: Metadata = {
  title: "Cơ hội Nghề nghiệp & Tuyển dụng | TalentCore",
  description: "Khám phá các vị trí tuyển dụng mở mới nhất tại TalentCore. Ứng tuyển ngay để cùng phát triển sự nghiệp cùng công nghệ hàng đầu.",
};

export default async function CandidateJobsPage() {
  // Server-side Data Fetching (SSR)
  const initialJobs = await candidateJobApi.getPublicJobs();

  return (
    <div className="min-h-screen bg-[#020512] text-slate-100 flex flex-col justify-between relative">
      {/* Hero Header Section - Pre-rendered on Server */}
      <section className="relative w-full overflow-hidden bg-[#020512] min-h-[400px] lg:min-h-[450px] flex items-center pt-16 pb-16">
        {/* Background Image - hero.png */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/hero.png"
            alt="TalentCore Careers Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Overlays matching landing page hero */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020512]/95 via-[#020512]/85 to-[#020512]/95 md:bg-gradient-to-r md:from-[#020512]/95 md:via-[#020512]/80 md:to-[#020512]/60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 text-xs font-bold text-blue-400 backdrop-blur-md">
            <Sparkles size={14} />
            <span>CƠ HỘI NGHỀ NGHIỆP TẠI TALENTCORE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Kiến tạo sự nghiệp <br />
            <span className="block mt-2 text-[#7059E8]">Đột phá cùng công nghệ</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed pt-2">
            Khám phá danh sách các cơ hội nghề nghiệp mở mới nhất. Hệ thống cập nhật thời gian thực ngay khi vị trí tuyển dụng được phê duyệt.
          </p>
        </div>
      </section>

      {/* Main Content Area - Solid Light Background Section */}
      <section className="w-full bg-[#f8fafc] text-slate-900 flex-1 border-t border-slate-200/80 pt-10 pb-24 relative z-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Interactive Client Component for Filtering & Socket Updates */}
          <CandidateJobsClient initialJobs={initialJobs} />
        </main>
      </section>
    </div>
  );
}
