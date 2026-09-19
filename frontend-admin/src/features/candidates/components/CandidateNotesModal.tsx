"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Plus, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { CandidateApplication, CandidateNote } from "../types/candidate.types";
import { useAuth } from "@/src/providers/AuthProvider";
import { USER_ROLE_LABEL } from "@/src/features/users/types/user.types";
import { candidateApi } from "../services/candidate.api";
import { CustomTextarea, CustomButton } from "@/src/components/common";

interface CandidateNotesModalProps {
  application: CandidateApplication | null;
  onClose: () => void;
  onNotesUpdated?: (updatedApp: CandidateApplication) => void;
}

export default function CandidateNotesModal({
  application,
  onClose,
  onNotesUpdated,
}: CandidateNotesModalProps) {
  const { user } = useAuth();
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!application || !isMounted) return null;

  const candidate = application.candidateId;
  const job = application.jobDescriptionId;
  const userCandidate = candidate?.userId;

  const candidateName =
    userCandidate?.name || candidate?.fullName || candidate?.profileName || "Ứng viên";
  const jobTitle = job?.title || "Vị trí tuyển dụng";

  const notesList: CandidateNote[] = application.notes || [];

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleAddNote = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!noteContent.trim()) {
      setErrorMsg("Vui lòng nhập nội dung ghi chú");
      return;
    }

    setIsSubmitting(true);
    try {
      const authorName = user?.name || "Thành viên";
      const authorRole = user?.role ? USER_ROLE_LABEL[user.role] : "Người đánh giá";

      const updated = await candidateApi.addNote(application._id, {
        authorName,
        authorRole,
        content: noteContent.trim(),
      });

      setSuccessMsg("Thêm ghi chú thành công!");
      setNoteContent("");
      if (onNotesUpdated) {
        onNotesUpdated(updated);
      }
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Lỗi thêm ghi chú:", error);
      setErrorMsg("Không thể thêm ghi chú. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-blue-500/10 z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-slate-900 border border-white/80">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100/80 bg-blue-500/5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ghi chú ứng viên</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {candidateName} — <span className="text-[#3B82F6] font-bold">{jobTitle}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* List of existing notes */}
          {notesList.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3B82F6] flex items-center justify-center mb-3">
                <FileText size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700">Chưa có ghi chú nào</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Thêm ghi chú đầu tiên cho ứng viên này
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4 border-b border-slate-100 max-h-60 overflow-y-auto pr-1">
              {notesList.map((note, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {note.authorName}{" "}
                      <span className="text-slate-500 font-semibold">({note.authorRole})</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add New Note Section */}
          <div className="space-y-2">
            <CustomTextarea
              label="Thêm ghi chú mới"
              rows={4}
              maxLength={500}
              placeholder="Nhập ghi chú về ứng viên..."
              value={noteContent}
              onChange={(e) => {
                setNoteContent(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
            />
            <div className="flex justify-end">
              <span className="text-[11px] font-medium text-slate-400">
                {noteContent.length}/500 ký tự
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-3">
          <CustomButton
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Đóng
          </CustomButton>
          <CustomButton
            variant="primary"
            size="sm"
            onClick={handleAddNote}
            isLoading={isSubmitting}
            disabled={!noteContent.trim()}
            icon={Plus}
          >
            Thêm ghi chú
          </CustomButton>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

