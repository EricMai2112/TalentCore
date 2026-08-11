import { X, Calendar, MapPin, DollarSign, Briefcase, User, Users, Clock, AlertCircle } from "lucide-react";
import { JobDescription, JobStatus, JobPriority } from "../types/job-description.types";

interface JobRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobDescription | null;
}

export default function JobRequestDetailsModal({
  isOpen,
  onClose,
  job,
}: JobRequestDetailsModalProps) {
  if (!isOpen || !job) return null;

  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Chưa rõ";
  const postedByName = typeof job.postedById === "object" ? job.postedById?.name : "Tuyển dụng";
  const interviewerName = typeof job.interviewerId === "object" ? job.interviewerId?.name : "Chưa phân công";

  const getStatusLabel = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING: return "Chờ duyệt";
      case JobStatus.APPROVED: return "Đã duyệt";
      case JobStatus.REJECTED: return "Từ chối";
      case JobStatus.JD_CREATED: return "Đã tạo JD";
    }
  };

  const getPriorityLabel = (priority: JobPriority) => {
    switch (priority) {
      case JobPriority.HIGH: return "Gấp";
      case JobPriority.MEDIUM: return "Bình thường";
      case JobPriority.LOW: return "Thấp";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
              Chi tiết yêu cầu tuyển dụng
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{job.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
              <Briefcase className="text-gray-400 shrink-0" size={18} />
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Hình thức & Địa điểm</span>
                <span className="text-xs font-bold text-gray-800">{job.employmentType} · {job.location}</span>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
              <DollarSign className="text-gray-400 shrink-0" size={18} />
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Mức lương (USD)</span>
                <span className="text-xs font-bold text-gray-800">${job.minimumSalary.toLocaleString()} - ${job.maximumSalary.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
              <Users className="text-gray-400 shrink-0" size={18} />
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Số lượng tuyển dụng</span>
                <span className="text-xs font-bold text-gray-800">{job.headcount} nhân sự</span>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
              <Clock className="text-gray-400 shrink-0" size={18} />
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Trạng thái & Độ ưu tiên</span>
                <span className="text-xs font-bold text-gray-800">{getStatusLabel(job.status)} · {getPriorityLabel(job.priority)}</span>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
              <User className="text-gray-400 shrink-0" size={18} />
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Người phỏng vấn chính</span>
                <span className="text-xs font-bold text-gray-800">{interviewerName}</span>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
              <Calendar className="text-gray-400 shrink-0" size={18} />
              <div>
                <span className="text-[10px] font-semibold text-gray-400 block">Hạn nhận hồ sơ</span>
                <span className="text-xs font-bold text-gray-800">
                  {job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split("T")[0] : "Không thời hạn"}
                </span>
              </div>
            </div>
          </div>

          {/* Department & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Phòng ban</span>
              <span className="text-sm font-semibold text-gray-700 bg-gray-50/70 border border-gray-100 rounded-xl px-4 py-2 block">
                {deptName}
              </span>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Yêu cầu kinh nghiệm</span>
              <span className="text-sm font-semibold text-gray-700 bg-gray-50/70 border border-gray-100 rounded-xl px-4 py-2 block">
                {job.experienceLevel}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Kỹ năng yêu cầu</span>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills.map((sk: any, idx) => {
                const name = typeof sk === "object" ? sk?.name : sk;
                return (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-50 border border-indigo-100/50 text-indigo-700 font-semibold rounded-lg text-xs"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Review Note / Remarks */}
          {job.note && (
            <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Ghi chú / Lý do xét duyệt
              </span>
              <p className="text-sm text-amber-900 whitespace-pre-wrap font-medium">
                {job.note}
              </p>
            </div>
          )}

          {/* Texts fields */}
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Mô tả công việc</span>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/20 border border-gray-100/50 rounded-xl p-4">
                {job.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Yêu cầu ứng viên</span>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/20 border border-gray-100/50 rounded-xl p-4">
                {job.requirements}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Quyền lợi đãi ngộ</span>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/20 border border-gray-100/50 rounded-xl p-4">
                {job.benefits}
              </p>
            </div>
          </div>

          {/* Interview pipeline flow */}
          {typeof job.pipelineTemplateId === "object" && job.pipelineTemplateId?.stages && (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Quy trình tuyển dụng áp dụng ({job.pipelineTemplateId.name})
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {job.pipelineTemplateId.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-gray-700">{stage.name}</span>
                        <span
                          className="w-2 h-2 rounded-full border border-black/5"
                          style={{ backgroundColor: stage.color }}
                        />
                      </div>
                      {idx < (job.pipelineTemplateId as any).stages.length - 1 && (
                        <span className="text-gray-300 font-bold text-sm">→</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
