import { useState, useEffect } from "react";
import { X, Check, AlertTriangle, Loader2 } from "lucide-react";
import { JobDescription, JobStatus } from "../types/job-description.types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobDescription | null;
  onSubmit: (status: JobStatus, note: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function ReviewModal({
  isOpen,
  onClose,
  job,
  onSubmit,
  isSubmitting,
}: ReviewModalProps) {
  const [decision, setDecision] = useState<JobStatus>(JobStatus.APPROVED);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDecision(JobStatus.APPROVED);
      setNote("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Chưa rõ";
  const postedByName = typeof job.postedById === "object" ? job.postedById?.name : "Tuyển dụng";
  const createdDate = job.createdAt ? new Date(job.createdAt).toISOString().split("T")[0] : "";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (decision === JobStatus.REJECTED && !note.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await onSubmit(decision, note.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              decision === JobStatus.APPROVED ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}>
              {decision === JobStatus.APPROVED ? <Check size={18} /> : <X size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Xét duyệt yêu cầu</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {decision === JobStatus.APPROVED ? "Phê duyệt yêu cầu tuyển dụng này" : "Từ chối yêu cầu tuyển dụng này"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-gray-50/75 border border-gray-100 rounded-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider shrink-0">Vị trí</span>
              <span className="text-sm font-bold text-gray-900 truncate">{job.title}</span>
            </div>
            <div className="flex justify-between items-baseline gap-4 border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider shrink-0">Phòng ban</span>
              <span className="text-sm font-semibold text-gray-700 truncate">{deptName}</span>
            </div>
            <div className="flex justify-between items-baseline gap-4 border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider shrink-0">Người yêu cầu</span>
              <span className="text-sm font-semibold text-gray-700 truncate">{postedByName}</span>
            </div>
            <div className="flex justify-between items-baseline gap-4 border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider shrink-0">Ngày gửi</span>
              <span className="text-sm font-semibold text-gray-700 truncate">{createdDate}</span>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Quyết định</span>
            <div className="flex gap-3 bg-gray-50 p-1.5 border border-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setDecision(JobStatus.APPROVED)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  decision === JobStatus.APPROVED
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Check size={14} />
                Phê duyệt
              </button>
              <button
                type="button"
                onClick={() => setDecision(JobStatus.REJECTED)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  decision === JobStatus.REJECTED
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                <X size={14} />
                Từ chối
              </button>
            </div>
          </div>

          {/* Textarea Note */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                {decision === JobStatus.APPROVED ? "Ghi chú cho trưởng phòng" : "Lý do từ chối"}
                {decision === JobStatus.REJECTED && <span className="text-red-500"> *</span>}
              </label>
              <span className="text-[10px] font-semibold text-gray-400">{note.length}/500</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              placeholder={
                decision === JobStatus.APPROVED
                  ? "VD: Đồng ý, sẽ tạo JD trong tuần này..."
                  : "VD: Ngân sách hiện tại chưa đủ, đề xuất xem xét lại Q4..."
              }
              rows={4}
              required={decision === JobStatus.REJECTED}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-1.5 px-5 py-2 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer ${
              decision === JobStatus.APPROVED ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              decision === JobStatus.APPROVED ? <Check size={16} /> : <X size={16} />
            )}
            {decision === JobStatus.APPROVED ? "Phê duyệt" : "Từ chối"}
          </button>
        </div>
      </form>
    </div>
  );
}
