import { X, MapPin, DollarSign, Briefcase, Calendar, CheckCircle2, Building2, Send, Sparkles } from "lucide-react";
import { CandidateJob, EmploymentType } from "../types/job.types";

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: CandidateJob | null;
  onApply: (job: CandidateJob) => void;
}

export default function JobDetailModal({
  isOpen,
  onClose,
  job,
  onApply,
}: JobDetailModalProps) {
  if (!isOpen || !job) return null;

  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Công nghệ";
  const pipeline = typeof job.pipelineTemplateId === "object" ? job.pipelineTemplateId : null;

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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700">
                <Building2 size={12} />
                {deptName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
                <DollarSign size={12} />
                ${job.minimumSalary.toLocaleString()} - ${job.maximumSalary.toLocaleString()}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">{job.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block uppercase tracking-wider mb-1">Địa điểm</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <MapPin size={13} className="text-blue-600" />
                {job.location}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block uppercase tracking-wider mb-1">Hình thức</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Briefcase size={13} className="text-blue-600" />
                {getEmploymentLabel(job.employmentType)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block uppercase tracking-wider mb-1">Kinh nghiệm</span>
              <span className="font-bold text-slate-800">{job.experienceLevel || "Không yêu cầu"}</span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block uppercase tracking-wider mb-1">Số lượng tuyển</span>
              <span className="font-bold text-slate-800">{job.headcount} vị trí</span>
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kỹ năng yêu cầu</h4>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((sk, idx) => {
                const name = typeof sk === "object" ? sk.name : sk;
                return (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 font-semibold rounded-xl text-xs"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              Mô tả công việc
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Job Requirements */}
          <div className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Yêu cầu ứng viên
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} className="text-amber-600" />
              Quyền lợi & Đãi ngộ
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.benefits}
            </p>
          </div>

          {/* Interview Pipeline */}
          {pipeline && pipeline.stages && pipeline.stages.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" />
                Quy trình phỏng vấn ({pipeline.name})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {pipeline.stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex items-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-700 truncate">{stage.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-4 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onApply(job);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Send size={16} />
            <span>Ứng tuyển ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
