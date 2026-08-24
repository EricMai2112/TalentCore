"use client";

import { X, Mail, Phone, Calendar, Briefcase, Building2, Star, CheckCircle2, User as UserIcon } from "lucide-react";
import { KanbanApplication } from "../types/kanban.types";

interface CandidateDetailModalProps {
  application: KanbanApplication | null;
  onClose: () => void;
}

export default function CandidateDetailModal({
  application,
  onClose,
}: CandidateDetailModalProps) {
  if (!application) return null;

  const candidate = application.candidateId;
  const job = application.jobDescriptionId;
  const user = candidate?.userId;

  const name = user?.name || candidate?.fullName || candidate?.profileName || "Ứng viên";
  const email = user?.email || candidate?.email || "Chưa cập nhật";
  const phone = user?.phone || candidate?.phone || "Chưa cập nhật";
  const deptName = typeof job?.departmentId === "object" ? job?.departmentId?.name : "Công nghệ";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-gray-900 z-10 animate-in zoom-in-95 duration-150 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block mb-0.5">
              Chi tiết Đơn ứng tuyển
            </span>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Info Card */}
          <div className="p-5 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-blue-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider block">
                {deptName}
              </span>
              <h4 className="text-base font-extrabold text-gray-900">{job?.title}</h4>
              <p className="text-xs font-semibold text-gray-500">
                Hạn nộp: {job ? "30 ngày" : "Đang mở"}
              </p>
            </div>

            <div className="text-center px-4 py-2.5 bg-white border border-indigo-200/80 rounded-2xl shadow-2xs shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                AI Fit Score
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                {application.aiFitScore || 85}%
              </span>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3.5 border border-gray-100 bg-gray-50/60 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Mail size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-gray-400 text-[10px] uppercase block">Email</span>
                <span className="text-gray-900 truncate block">{email}</span>
              </div>
            </div>

            <div className="p-3.5 border border-gray-100 bg-gray-50/60 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Phone size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-gray-400 text-[10px] uppercase block">Số điện thoại</span>
                <span className="text-gray-900 truncate block">{phone}</span>
              </div>
            </div>
          </div>

          {/* Skills Required vs Matching */}
          {job?.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Kỹ năng chuyên môn
              </span>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s, idx) => {
                  const sName = typeof s === "object" ? s.name : s;
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} className="text-purple-600" />
                      {sName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
