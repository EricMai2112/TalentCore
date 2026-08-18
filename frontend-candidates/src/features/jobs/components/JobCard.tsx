import Link from "next/link";
import { MapPin, DollarSign, Briefcase, ArrowUpRight, Clock, Building2 } from "lucide-react";
import { CandidateJob, EmploymentType, JobPriority } from "../types/job.types";

interface JobCardProps {
  job: CandidateJob;
  onApply: (job: CandidateJob) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Công nghệ";

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

  return (
    <Link
      href={`/jobs/${job._id}`}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 block ${
        job.isNew ? "ring-2 ring-emerald-500/50 bg-emerald-50/20" : ""
      }`}
    >
      {/* Real-time Glowing indicator for newly published jobs */}
      {job.isNew && (
        <div className="absolute -top-3 right-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs animate-pulse">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Vừa đăng tuyển (Real-time)</span>
        </div>
      )}

      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <Building2 size={13} />
              {deptName}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700">
              <Clock size={13} />
              {getEmploymentLabel(job.employmentType)}
            </span>
          </div>

          {job.priority === JobPriority.HIGH && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-600">
              ▲ Ưu tiên gấp
            </span>
          )}
        </div>

        {/* Job Title */}
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
          {job.title}
        </h3>

        {/* Salary & Location Bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-5">
          <div className="flex items-center gap-1 text-emerald-600 font-bold">
            <DollarSign size={16} className="shrink-0" />
            <span>
              ${(job.minimumSalary ?? 0).toLocaleString("en-US")} - ${(job.maximumSalary ?? 0).toLocaleString("en-US")} / tháng
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={15} className="text-slate-400 shrink-0" />
            <span>{job.location}</span>
          </div>
          {job.experienceLevel && (
            <div className="flex items-center gap-1.5">
              <Briefcase size={15} className="text-slate-400 shrink-0" />
              <span>{job.experienceLevel}</span>
            </div>
          )}
        </div>

        {/* Required Skills tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {job.requiredSkills.slice(0, 5).map((sk, idx) => {
            const name = typeof sk === "object" ? sk.name : sk;
            return (
              <span
                key={idx}
                className="rounded-lg bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {name}
              </span>
            );
          })}
          {job.requiredSkills.length > 5 && (
            <span className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-1 text-xs text-slate-500">
              +{job.requiredSkills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
        <span className="text-xs font-bold text-blue-600 group-hover:underline py-2">
          Xem chi tiết vị trí &rarr;
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onApply(job);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
        >
          <span>Ứng tuyển ngay</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </Link>
  );
}
