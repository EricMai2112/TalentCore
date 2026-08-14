import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Building2,
  Sparkles,
  ArrowLeft,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import { CandidateJob, EmploymentType, JobPriority } from "@/src/features/jobs/types/job.types";
import { candidateJobApi } from "@/src/features/jobs/services/job-api";
import { JobDetailHeaderActions, JobSidebarApplyButton } from "@/src/features/jobs/components/JobDetailActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate Dynamic SEO Metadata for Candidate Job Detail Page (SSR)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await candidateJobApi.getJobById(id);

  if (!job) {
    return {
      title: "Không tìm thấy công việc | TalentCore Careers",
      description: "Vị trí tuyển dụng này có thể đã dừng nhận hồ sơ hoặc không tồn tại.",
    };
  }

  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Công nghệ";

  return {
    title: `${job.title} - ${deptName} | TalentCore Careers`,
    description: job.description ? job.description.slice(0, 160) : `Ứng tuyển vị trí ${job.title} tại TalentCore.`,
    openGraph: {
      title: `${job.title} | TalentCore Careers`,
      description: job.description ? job.description.slice(0, 160) : `Vị trí ${job.title} tại TalentCore.`,
    },
  };
}

const getEmploymentLabel = (type: EmploymentType) => {
  switch (type) {
    case EmploymentType.FULL_TIME: return "Toàn thời gian (Full-time)";
    case EmploymentType.PART_TIME: return "Bán thời gian (Part-time)";
    case EmploymentType.CONTRACT: return "Hợp đồng (Contract)";
    case EmploymentType.REMOTE: return "Làm từ xa (Remote)";
    case EmploymentType.HYBRID: return "Linh hoạt (Hybrid)";
    case EmploymentType.ONSITE: return "Tại văn phòng (Onsite)";
    default: return type;
  }
};

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await candidateJobApi.getJobById(id);

  if (!job) {
    return (
      <div className="min-h-screen bg-[#020512] text-slate-100 py-24 px-4 text-center">
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
          <AlertCircle size={48} className="mx-auto text-rose-500" />
          <h2 className="text-xl font-bold text-white">Không tìm thấy công việc</h2>
          <p className="text-sm text-slate-400">Vị trí này có thể đã dừng nhận hồ sơ hoặc không tồn tại.</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft size={16} />
            <span>Quay lại danh sách việc làm</span>
          </Link>
        </div>
      </div>
    );
  }

  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Công nghệ";

  return (
    <div className="min-h-screen bg-[#020512] text-slate-100 flex flex-col justify-between relative">
      {/* Top Banner / Hero Header Section - Server-Side Rendered */}
      <section className="relative w-full overflow-hidden bg-[#020512] pt-12 pb-16">
        {/* Background Image - hero.png */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/hero.png"
            alt="TalentCore Job Details Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Overlays matching landing page hero */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020512]/95 via-[#020512]/85 to-[#020512]/95 md:bg-gradient-to-r md:from-[#020512]/95 md:via-[#020512]/80 md:to-[#020512]/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight size={12} className="text-slate-500" />
            <Link href="/jobs" className="hover:text-blue-400 transition-colors">
              Tuyển dụng
            </Link>
            <ChevronRight size={12} className="text-slate-500" />
            <span className="text-white font-bold truncate max-w-xs sm:max-w-sm">
              {job.title}
            </span>
          </nav>

          {/* Job Title & Main Info Hero Header Box */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-400">
                  <Building2 size={13} />
                  {deptName}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 px-3 py-1 text-xs font-medium text-slate-300">
                  <Clock size={13} />
                  {getEmploymentLabel(job.employmentType)}
                </span>

                {job.priority === JobPriority.HIGH && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-400">
                    ▲ Tuyển gấp
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-300 pt-1">
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-base">
                  <DollarSign size={18} className="shrink-0" />
                  <span>
                    ${job.minimumSalary.toLocaleString()} - ${job.maximumSalary.toLocaleString()} / tháng
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span>{job.location}</span>
                </div>
                {job.experienceLevel && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={16} className="text-slate-400 shrink-0" />
                    <span>{job.experienceLevel}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Header Client Actions (Share & Apply Modal Trigger) */}
            <JobDetailHeaderActions job={job} />
          </div>
        </div>
      </section>

      {/* Main Details Content Grid - Continuous Unified White Card (Server-Side Rendered) */}
      <section className="w-full bg-[#f8fafc] text-slate-900 flex-1 border-t border-slate-200/80 pt-10 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Main Content Column - Single Continuous Card Block */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xs space-y-10 text-slate-900">
                
                {/* Required Skills Section */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="space-y-3 pb-8 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Kỹ năng chuyên môn yêu cầu
                    </h3>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {job.requiredSkills.map((sk, idx) => {
                        const name = typeof sk === "object" ? sk.name : sk;
                        return (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-blue-50 border border-blue-100/80 text-blue-700 font-semibold rounded-xl text-sm shadow-2xs"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Job Description */}
                {job.description && (
                  <div className="space-y-4 pb-8 border-b border-slate-100">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-blue-600 shrink-0" />
                      <span>Mô tả công việc</span>
                    </h2>
                    <div className="text-base sm:text-[17px] text-slate-800 leading-relaxed sm:leading-[1.85] whitespace-pre-wrap font-normal tracking-wide">
                      {job.description}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements && (
                  <div className="space-y-4 pb-8 border-b border-slate-100">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <span>Yêu cầu ứng viên</span>
                    </h2>
                    <div className="text-base sm:text-[17px] text-slate-800 leading-relaxed sm:leading-[1.85] whitespace-pre-wrap font-normal tracking-wide">
                      {job.requirements}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <div className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                      <DollarSign className="w-6 h-6 text-amber-600 shrink-0" />
                      <span>Quyền lợi & Đãi ngộ</span>
                    </h2>
                    <div className="text-base sm:text-[17px] text-slate-800 leading-relaxed sm:leading-[1.85] whitespace-pre-wrap font-normal tracking-wide">
                      {job.benefits}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Sidebar Column (4 cols) - Server-Side Rendered */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Sticky Summary Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-8 shadow-md sticky top-24 space-y-7">
                <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 tracking-tight">
                  Tổng quan vị trí
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0 shadow-2xs">
                      <DollarSign size={22} />
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1 text-sm">Mức lương</span>
                      <span className="font-bold text-slate-900 text-base sm:text-[17px] leading-snug">
                        ${job.minimumSalary.toLocaleString()} - ${job.maximumSalary.toLocaleString()} / tháng
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0 shadow-2xs">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1 text-sm">Địa điểm làm việc</span>
                      <span className="font-bold text-slate-900 text-base sm:text-[17px] leading-snug">
                        {job.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0 shadow-2xs">
                      <Briefcase size={22} />
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1 text-sm">Hình thức làm việc</span>
                      <span className="font-bold text-slate-900 text-base sm:text-[17px] leading-snug">
                        {getEmploymentLabel(job.employmentType)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shrink-0 shadow-2xs">
                      <Users size={22} />
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1 text-sm">Số lượng cần tuyển</span>
                      <span className="font-bold text-slate-900 text-base sm:text-[17px] leading-snug">
                        {job.headcount} vị trí
                      </span>
                    </div>
                  </div>

                  {job.experienceLevel && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 shrink-0 shadow-2xs">
                        <Sparkles size={22} />
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block mb-1 text-sm">Cấp bậc / Kinh nghiệm</span>
                        <span className="font-bold text-slate-900 text-base sm:text-[17px] leading-snug">
                          {job.experienceLevel}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Apply CTA Button (Client Component) */}
                <div className="pt-3 border-t border-slate-100">
                  <JobSidebarApplyButton job={job} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
