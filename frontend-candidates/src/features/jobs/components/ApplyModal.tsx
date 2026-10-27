"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Layers,
  Plus,
  UploadCloud,
  FileText,
  Sparkles,
  Trash2,
} from "lucide-react";
import { CandidateJob } from "../types/job.types";
import { formatJobSalary } from "../utils/salary.utils";
import { useAuth } from "@/src/providers/AuthProvider";
import { candidateJobApi } from "../services/job-api";
import { profileApi } from "@/src/features/user/services/user.api";
import { CandidateProfile } from "@/src/features/user/types/profile.types";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: CandidateJob | null;
}

export default function ApplyModal({ isOpen, onClose, job }: ApplyModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "profile">("upload");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        try {
          const list = await profileApi.listProfiles();
          setProfiles(list);
          if (list.length > 0) {
            const defaultProf = list.find((p) => p.isDefault) || list[0];
            setSelectedCandidateId(defaultProf._id);
          }
        } catch (err) {
          console.error("Lỗi lấy danh sách profile:", err);
        } finally {
          setIsLoadingProfiles(false);
        }
      };

      fetchProfiles();
    }
  }, [isOpen, user]);

  if (!isOpen || !job || !mounted) return null;

  const deptName =
    typeof job.departmentId === "object" ? job.departmentId?.name : "Công nghệ";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    const isExtensionValid = /\.(pdf|docx|png|jpg|jpeg)$/i.test(file.name);

    if (!allowed.includes(file.type) && !isExtensionValid) {
      setErrorMsg("Chỉ hỗ trợ tệp định dạng PDF, DOCX, PNG hoặc JPG.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Kích thước tệp không được vượt quá 15MB.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    if (activeTab === "upload") {
      if (!selectedFile) {
        setErrorMsg("Vui lòng chọn hoặc tải lên một tệp CV.");
        return;
      }
    } else {
      if (!selectedCandidateId) {
        setErrorMsg("Vui lòng chọn một hồ sơ online để ứng tuyển.");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeTab === "upload") {
        await candidateJobApi.applyJob({
          jobDescriptionId: job._id,
          cvFile: selectedFile,
        });
      } else {
        await candidateJobApi.applyJob({
          jobDescriptionId: job._id,
          candidateId: selectedCandidateId,
        });
      }

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
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 z-[10000] animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
              Nộp hồ sơ ứng tuyển
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

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Nộp hồ sơ ứng tuyển thành công!
            </h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Hồ sơ mới đã được tạo và gửi trực tiếp vào quy trình tuyển dụng. Hệ thống AI đang phân tích độ phù hợp!
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="p-6 space-y-4 overflow-y-auto">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Phòng ban:</span>
                <span className="font-bold text-slate-800">{deptName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Địa điểm:</span>
                <span className="font-bold text-slate-800">{job.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Mức lương:</span>
                <span className="font-bold text-emerald-600">
                  {formatJobSalary(job.minimumSalary, job.maximumSalary)}
                </span>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  <UploadCloud size={14} />
                  <span>Tải lên tệp CV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  <Layers size={14} />
                  <span>Chọn hồ sơ online</span>
                </button>
              </div>

              {activeTab === "upload" && (
                <div className="space-y-3">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50/50"
                        : selectedFile
                        ? "border-emerald-400 bg-emerald-50/20"
                        : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2.5 text-left truncate mr-2">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                          <UploadCloud size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          Nhấp để tải lên hoặc kéo thả tệp CV vào đây
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Hỗ trợ định dạng PDF, Word (.docx) hoặc Ảnh (Tối đa 15MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3 flex items-start gap-2.5">
                    <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                      Khi tải lên, hệ thống sẽ <strong>tự động trích xuất thông tin tạo 1 hồ sơ mới</strong> lưu vào tài khoản của bạn, sau đó dùng hồ sơ đó để ứng tuyển và chấm điểm AI Matching tức thì.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={14} className="text-blue-600" />
                      Chọn hồ sơ ứng tuyển <span className="text-rose-500">*</span>
                    </label>
                    <Link
                      href="/user/profile"
                      target="_blank"
                      className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus size={12} /> Quản lý hồ sơ
                    </Link>
                  </div>

                  {isLoadingProfiles ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-blue-600" />
                      <span>Đang tải danh sách hồ sơ...</span>
                    </div>
                  ) : profiles.length > 0 ? (
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                      {profiles.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.profileName} {p.isDefault ? "(★ Mặc định)" : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-xs text-amber-800 space-y-2">
                      <p className="font-medium">
                        Bạn chưa có hồ sơ nào. Bạn có thể chọn tab &ldquo;Tải lên tệp CV&rdquo; để tự động tạo hồ sơ ngay lập tức.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("upload")}
                        className="inline-block font-bold text-blue-600 underline cursor-pointer"
                      >
                        Tải lên tệp CV &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !user ||
                  (activeTab === "upload" && !selectedFile) ||
                  (activeTab === "profile" && !selectedCandidateId)
                }
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>
                      {activeTab === "upload"
                        ? "Đang phân tích CV & nộp hồ sơ..."
                        : "Đang nộp hồ sơ..."}
                    </span>
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

  return createPortal(modalContent, document.body);
}