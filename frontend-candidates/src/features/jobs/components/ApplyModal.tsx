"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { CandidateJob } from "../types/job.types";
import { useAuth } from "@/src/providers/AuthProvider";
import { candidateJobApi } from "../services/job-api";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: CandidateJob | null;
}

export default function ApplyModal({ isOpen, onClose, job }: ApplyModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const deptName =
    typeof job.departmentId === "object" ? job.departmentId?.name : "Công nghệ";

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await candidateJobApi.applyJob({
        jobDescriptionId: job._id,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(
        err?.message || "Ứng tuyển không thành công. Vui lòng thử lại sau!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
              Xác nhận ứng tuyển
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {job.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Nộp hồ sơ ứng tuyển thành công!
            </h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Hồ sơ trực tuyến của bạn đã được chuyển trực tiếp đến bộ phận tuyển
              dụng của TalentCore.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="p-6 space-y-5">
            {/* Thông báo lỗi nếu có */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Thông tin Job tóm tắt */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Phòng ban:</span>
                <span className="font-bold text-slate-800">{deptName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Địa điểm làm việc:</span>
                <span className="font-bold text-slate-800">{job.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Mức lương:</span>
                <span className="font-bold text-emerald-600">
                  ${(job.minimumSalary ?? 0).toLocaleString("en-US")} - $
                  {(job.maximumSalary ?? 0).toLocaleString("en-US")} / tháng
                </span>
              </div>
            </div>

            {/* Thông tin Ứng viên / Hồ sơ trực tuyến */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Hồ sơ ứng tuyển sẽ gửi đi
              </span>

              {user ? (
                <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <User size={14} className="text-blue-600" />
                    <span>{user.name || "Ứng viên"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-blue-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-blue-600" /> Hồ sơ trực tuyến tại TalentCore
                    </span>
                    <Link
                      href="/user/profile"
                      target="_blank"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Xem hồ sơ
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-xs text-amber-800 space-y-2">
                  <p className="font-medium">
                    Bạn chưa đăng nhập. Vui lòng đăng nhập tài khoản Ứng viên để nộp hồ sơ.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block font-bold text-blue-600 underline"
                  >
                    Đăng nhập ngay &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !user}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang nộp hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Nộp hồ sơ ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}