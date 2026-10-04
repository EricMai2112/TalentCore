import Link from "next/link";
import {
  MapPin,
  Banknote,
  Briefcase,
  ArrowUpRight,
  Clock,
  Building2,
  Calendar,
} from "lucide-react";
import { CandidateJob, EmploymentType, JobPriority } from "../types/job.types";
import { formatJobSalary } from "../utils/salary.utils";

interface JobCardProps {
  job: CandidateJob;
}

export default function JobCard({ job }: JobCardProps) {
  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Công nghệ";

  const getEmploymentLabel = (type: EmploymentType) => {
    switch (type) {
      case EmploymentType.FULL_TIME: return "Toàn thời gian";
      case EmploymentType.PART_TIME: return "Bán thời gian";
      case EmploymentType.CONTRACT: return "Hợp đồng";
      case EmploymentType.REMOTE: return "Từ xa (Remote)";
      case EmploymentType.HYBRID: return "Linh hoạt (Hybrid)";
      case EmploymentType.ONSITE: return "Tại văn phòng";
      default: return type;
    }
  };

  const isNegotiable =
    (job.minimumSalary === 0 && job.maximumSalary === 0) ||
    (!job.minimumSalary && !job.maximumSalary);

  const formattedSalary = formatJobSalary(job.minimumSalary, job.maximumSalary);

  // Format hạn nộp nếu có
  const formattedDeadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/jobs/${job._id}`}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 block ${
        job.isNew ? "ring-2 ring-emerald-500/30 bg-emerald-50/10" : ""
      }`}
    >
      {/* Real-time Glowing indicator for newly published jobs */}
      {job.isNew && (
        <div className="absolute -top-3 right-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs animate-pulse">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Vừa đăng tuyển</span>
        </div>
      )}

      <div>
        {/* Top Badges Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100/80 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <Building2 size={13} className="text-blue-500" />
              {deptName}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100/80 border border-slate-200/70 px-2.5 py-1 text-xs font-medium text-slate-600">
              <Clock size={13} className="text-slate-400" />
              {getEmploymentLabel(job.employmentType)}
            </span>
          </div>

          {job.priority === JobPriority.HIGH && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Tuyển gấp
            </span>
          )}
        </div>

        {/* Job Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3 leading-snug">
          {job.title}
        </h3>

        {/* Salary Highlight Pill & Key Specs */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
              isNegotiable
                ? "bg-amber-50 border-amber-200/90 text-amber-700"
                : "bg-emerald-50 border-emerald-200/90 text-emerald-700"
            }`}
          >
            <Banknote size={15} className="shrink-0" />
            <span>{formattedSalary}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/60">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span>{job.location}</span>
          </div>

          {job.experienceLevel && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/60">
              <Briefcase size={13} className="text-slate-400 shrink-0" />
              <span>{job.experienceLevel}</span>
            </div>
          )}
        </div>

        {/* Required Skills tags */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.requiredSkills.slice(0, 4).map((sk, idx) => {
              const name = typeof sk === "object" ? sk.name : sk;
              return (
                <span
                  key={idx}
                  className="rounded-lg bg-slate-50 border border-slate-200/60 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {name}
                </span>
              );
            })}
            {job.requiredSkills.length > 4 && (
              <span className="rounded-lg bg-slate-100 border border-slate-200/70 px-2 py-1 text-xs font-medium text-slate-500">
                +{job.requiredSkills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & CTA Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          {formattedDeadline ? (
            <>
              <Calendar size={13} className="text-slate-400" />
              <span>Hạn: <strong className="text-slate-600 font-semibold">{formattedDeadline}</strong></span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Đang tuyển dụng
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-white bg-blue-50 group-hover:bg-blue-600 border border-blue-100 group-hover:border-transparent px-3.5 py-2 rounded-xl transition-all duration-300 shadow-2xs group-hover:shadow-md group-hover:shadow-blue-500/20">
          <span>Xem chi tiết</span>
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
