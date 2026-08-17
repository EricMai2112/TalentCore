"use client";

import { useState, useEffect } from "react";
import { X, Check, Trash2, Loader2, Award } from "lucide-react";
import { CertificateItem } from "../types/profile.types";
import { profileApi } from "../services/user.api";

interface EditCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CertificateItem | null;
  currentIndex?: number | null;
  allCertifications: CertificateItem[];
  onSuccess: (updatedCertifications: CertificateItem[]) => void;
}

export default function EditCertificationModal({
  isOpen,
  onClose,
  initialData,
  currentIndex,
  allCertifications,
  onSuccess,
}: EditCertificationModalProps) {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [scoreOrLevel, setScoreOrLevel] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEditMode = currentIndex !== null && currentIndex !== undefined;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setOrganization(initialData.organization || "");
        setScoreOrLevel(initialData.scoreOrLevel || "");
        setIssueDate(initialData.issueDate || "");
        setCredentialUrl((initialData as any).credentialUrl || "");
      } else {
        setName("");
        setOrganization("");
        setScoreOrLevel("");
        setIssueDate("");
        setCredentialUrl("");
      }
      setErrorMsg(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const newCert: CertificateItem = {
      name: name.trim(),
      organization: organization.trim() || undefined,
      scoreOrLevel: scoreOrLevel.trim() || undefined,
      issueDate: issueDate.trim() || undefined,
      ...(credentialUrl.trim() ? { credentialUrl: credentialUrl.trim() } : {}),
    };

    let updatedList: CertificateItem[] = [];
    if (isEditMode) {
      updatedList = allCertifications.map((item, idx) =>
        idx === currentIndex ? newCert : item
      );
    } else {
      updatedList = [newCert, ...allCertifications];
    }

    try {
      await profileApi.updateProfile({ certifications: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error: any) {
      console.error("Cập nhật chứng chỉ thất bại:", error);
      setErrorMsg(error?.response?.data?.message || "Không thể lưu chứng chỉ. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !confirm("Bạn có chắc chắn muốn xóa chứng chỉ này?")) return;
    setIsSubmitting(true);
    const updatedList = allCertifications.filter((_, idx) => idx !== currentIndex);
    try {
      await profileApi.updateProfile({ certifications: updatedList });
      onSuccess(updatedList);
      onClose();
    } catch (error) {
      console.error("Xóa chứng chỉ thất bại:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {isEditMode ? "Chỉnh sửa Chứng chỉ" : "Thêm mới Chứng chỉ"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chứng chỉ chuyên môn, ngoại ngữ hoặc chứng nhận hoàn thành khóa học
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Tên chứng chỉ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tên chứng chỉ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: AWS Certified Cloud Practitioner / TOEIC 785"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Tổ chức cấp */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tổ chức / Cơ vị cấp chứng chỉ
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="VD: Amazon Web Services (AWS) / IIG Vietnam"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Điểm số & Ngày cấp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Điểm số / Trình độ (Nếu có)
              </label>
              <input
                type="text"
                value={scoreOrLevel}
                onChange={(e) => setScoreOrLevel(e.target.value)}
                placeholder="VD: 785/990 hoặc Xuất sắc"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Thời gian cấp (Tháng/Năm)
              </label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                placeholder="VD: 08/2025"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Đường dẫn URL xác thực chứng chỉ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Đường dẫn xác thực (Credential URL)
            </label>
            <input
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://www.credly.com/badges/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Xóa chứng chỉ này</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Lưu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}