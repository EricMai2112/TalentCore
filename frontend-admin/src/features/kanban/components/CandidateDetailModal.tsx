"use client";

import { useState, useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  GraduationCap,
  FolderGit2,
  Award,
  Globe,
  MapPin,
  Target,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { KanbanApplication } from "../types/kanban.types";

interface CandidateDetailModalProps {
  application: KanbanApplication | null;
  onClose: () => void;
}

export default function CandidateDetailModal({
  application,
  onClose,
}: CandidateDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"ai_insights" | "profile" | "criteria">("ai_insights");

  // Prevent background scroll when side drawer is open
  useEffect(() => {
    if (application) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [application]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!application) return null;

  const candidate = application.candidateId;
  const job = application.jobDescriptionId;
  const user = candidate?.userId;
  const aiEval = application.aiEvaluation;

  const name = user?.name || candidate?.fullName || candidate?.profileName || "Ứng viên";
  const email = user?.email || candidate?.email || "Chưa cập nhật";
  const phone = user?.phone || candidate?.phone || "Chưa cập nhật";
  const headline = candidate?.headline || "Chưa cập nhật chức danh";
  const address = candidate?.address;
  const deptName = typeof job?.departmentId === "object" ? job?.departmentId?.name : "Công nghệ";

  const aiScore = application.aiFitScore ?? aiEval?.aiFitScore ?? 0;
  const isMissingMandatory = Boolean(application.isMissingMandatory || aiEval?.isMissingMandatory);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-300";
    return "text-rose-700 bg-rose-50 border-rose-300";
  };

  const initial = (name.trim().charAt(0) || "U").toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Right Drawer */}
      <div
        className="relative w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 text-slate-900 border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              {initial}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {deptName}
                </span>
                {candidate?.currentLevel && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                    {candidate.currentLevel}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-indigo-600">{headline}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                <Briefcase size={13} className="text-slate-400" />
                <span>Ứng tuyển: <strong className="text-slate-700">{job?.title}</strong></span>
                <span>•</span>
                <Calendar size={13} className="text-slate-400" />
                <span>
                  {application.appliedAt
                    ? new Date(application.appliedAt).toLocaleDateString("vi-VN")
                    : "Hôm nay"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Đóng bảng chi tiết"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("ai_insights")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "ai_insights"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles size={15} />
            <span>Đánh giá & Chấm điểm AI</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getScoreColor(aiScore)}`}
            >
              {aiScore}%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("criteria")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "criteria"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Tiêu chí & Bằng chứng CV ({aiEval?.evaluatedCriteria?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User size={15} />
            <span>Hồ sơ ứng viên đầy đủ</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* TAB 1: AI INSIGHTS & SCORING */}
          {activeTab === "ai_insights" && (
            <div className="space-y-6">
              {/* 1. Score Hero Card */}
              <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 rounded-3xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                      Điểm Tương Thích AI (AI Match Score)
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      Đánh giá mức độ phù hợp với tiêu chí tuyển dụng
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tính toán theo công thức trọng số đa tầng & thẩm định bằng chứng thực tế từ CV.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div
                      className={`px-5 py-3 rounded-2xl border text-center shadow-xs ${getScoreColor(
                        aiScore
                      )}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                        Overall Score
                      </span>
                      <span className="text-3xl font-black tracking-tight">{aiScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Status Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-100/70 text-xs font-semibold">
                  {isMissingMandatory ? (
                    <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-1.5 font-bold">
                      <XCircle size={14} className="text-rose-600" />
                      Thiếu tiêu chí Bắt buộc (Missing Mandatory)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-1.5 font-bold">
                      <CheckCircle size={14} className="text-emerald-600" />
                      Đáp ứng đầy đủ tiêu chí Bắt buộc
                    </span>
                  )}

                  {aiEval?.evaluatedAt && (
                    <span className="text-slate-400 text-[11px] ml-auto">
                      Đánh giá lúc: {new Date(aiEval.evaluatedAt).toLocaleString("vi-VN")}
                    </span>
                  )}
                </div>
              </div>

              {/* 2. AI Summary */}
              {aiEval?.summary && (
                <div className="p-4.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-600" />
                    Nhận định tổng quan từ AI
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {aiEval.summary}
                  </p>
                </div>
              )}

              {/* 3. Key Strengths & Potential Gaps 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Strengths (Xanh lá đậm) */}
                <div className="p-4.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2.5 shadow-2xs">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Điểm mạnh nổi bật ({aiEval?.keyStrengths?.length || 0})
                  </span>
                  {aiEval?.keyStrengths && aiEval.keyStrengths.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-emerald-900 font-medium">
                      {aiEval.keyStrengths.map((str: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-600 font-bold text-sm">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-600/70 italic">Chưa ghi nhận điểm mạnh đặc biệt.</p>
                  )}
                </div>

                {/* Potential Gaps (Màu đỏ) */}
                <div className="p-4.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 shadow-2xs">
                  <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={16} className="text-rose-600" />
                    Điểm hạn chế / Cần lưu ý ({aiEval?.potentialGaps?.length || 0})
                  </span>
                  {aiEval?.potentialGaps && aiEval.potentialGaps.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-rose-900 font-medium">
                      {aiEval.potentialGaps.map((gap: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-rose-600 font-bold text-sm">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-rose-600/70 italic">Không có điểm hạn chế nghiêm trọng.</p>
                  )}
                </div>
              </div>

              {/* 4. Cảnh báo (Warnings - Màu vàng - Nằm dưới Strengths & Gaps) */}
              {(isMissingMandatory || (aiEval?.warnings && aiEval.warnings.length > 0)) && (
                <div className="p-4.5 bg-amber-50/90 border border-amber-300/80 rounded-2xl space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-950 font-bold uppercase tracking-wider">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <span>Cảnh báo & Rủi ro đánh giá ({aiEval?.warnings?.length || 1})</span>
                  </div>
                  <ul className="space-y-1 text-amber-900 list-disc list-inside">
                    {aiEval?.warnings?.map((warn: string, idx: number) => (
                      <li key={idx} className="font-medium leading-relaxed">
                        {warn}
                      </li>
                    )) || (
                      <li className="font-medium">
                        Ứng viên chưa vượt qua ngưỡng điểm của tiêu chí Bắt buộc (MANDATORY).
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* 5. Suggested Interview Questions */}
              {aiEval?.suggestedQuestions && aiEval.suggestedQuestions.length > 0 && (
                <div className="p-4.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle size={15} className="text-purple-600" />
                      Gợi ý câu hỏi phỏng vấn cho Hội đồng tuyển dụng ({aiEval.suggestedQuestions.length})
                    </span>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                      Tự động tạo bởi AI
                    </span>
                  </div>
                  <div className="space-y-2">
                    {aiEval.suggestedQuestions.map((q: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-purple-100 rounded-xl text-xs text-slate-800 flex items-start gap-2.5 shadow-2xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FULL CANDIDATE PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 text-xs">
              {/* Contact Info Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Thông tin liên hệ
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-semibold">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail size={14} className="text-slate-400" />
                    <span>{email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone size={14} className="text-slate-400" />
                    <span>{phone}</span>
                  </div>
                  {address && (
                    <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{address}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {candidate?.socialLinks && candidate.socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                    {candidate.socialLinks.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-indigo-600 hover:underline font-semibold"
                      >
                        <Globe size={12} />
                        <span>{s.platform}:</span>
                        <span className="max-w-[150px] truncate">{s.url}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {candidate?.summary && (
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Giới thiệu bản thân
                  </span>
                  <div
                    className="text-slate-700 leading-relaxed rich-text-content"
                    dangerouslySetInnerHTML={{ __html: candidate.summary }}
                  />
                </div>
              )}

              {/* Career Objective */}
              {candidate?.careerObjective && (
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Target size={13} className="text-indigo-600" /> Mục tiêu nghề nghiệp
                  </span>
                  <div
                    className="text-slate-700 leading-relaxed rich-text-content"
                    dangerouslySetInnerHTML={{ __html: candidate.careerObjective }}
                  />
                </div>
              )}

              {/* Skills */}
              {candidate?.skills && candidate.skills.length > 0 && (
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl space-y-2.5">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Kỹ năng chuyên môn ({candidate.skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((s, idx) => {
                      const sName = typeof s === "object" ? s.name : s;
                      const prof = typeof s === "object" ? s.proficiency : null;
                      const yoe = typeof s === "object" ? s.yearsOfExperience : null;
                      return (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold flex items-center gap-1.5"
                        >
                          <span>{sName}</span>
                          {yoe !== null && yoe !== undefined && (
                            <span className="text-[10px] text-slate-400">({yoe} năm)</span>
                          )}
                          {prof && (
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">
                              {prof}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Experiences */}
              {candidate?.experiences && candidate.experiences.length > 0 && (
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Briefcase size={13} className="text-indigo-600" /> Kinh nghiệm làm việc ({candidate.experiences.length})
                  </span>
                  <div className="space-y-3">
                    {candidate.experiences.map((exp, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{exp.position}</h5>
                            <p className="font-semibold text-slate-600 flex items-center gap-1">
                              <Building2 size={13} className="text-slate-400" /> {exp.company}
                            </p>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium shrink-0">
                            {exp.startDate || "N/A"} - {exp.endDate || "Hiện tại"}
                          </span>
                        </div>
                        {exp.description && (
                          <div
                            className="text-slate-600 leading-relaxed pt-1 rich-text-content"
                            dangerouslySetInnerHTML={{ __html: exp.description }}
                          />
                        )}
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {exp.technologies.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-medium text-slate-600 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {candidate?.projects && candidate.projects.length > 0 && (
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <FolderGit2 size={13} className="text-indigo-600" /> Dự án thực tế ({candidate.projects.length})
                  </span>
                  <div className="space-y-3">
                    {candidate.projects.map((proj, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900 text-sm">{proj.name}</h5>
                            {proj.role && (
                              <span className="px-2 py-0.5 bg-indigo-100/80 text-indigo-700 font-bold text-[10px] rounded">
                                {proj.role}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium shrink-0">
                            {proj.startDate || "N/A"} - {proj.endDate || "Hiện tại"}
                          </span>
                        </div>
                        {proj.projectUrl && (
                          <a
                            href={proj.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink size={11} /> {proj.projectUrl}
                          </a>
                        )}
                        {proj.description && (
                          <div
                            className="text-slate-600 leading-relaxed pt-1 rich-text-content"
                            dangerouslySetInnerHTML={{ __html: proj.description }}
                          />
                        )}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {proj.technologies.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-medium text-slate-600 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {candidate?.educations && candidate.educations.length > 0 && (
                <div className="p-4.5 bg-white border border-slate-200 rounded-2xl space-y-2.5">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-indigo-600" /> Học vấn ({candidate.educations.length})
                  </span>
                  <div className="space-y-2">
                    {candidate.educations.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-0.5 border border-slate-100">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-bold text-slate-900">{edu.institution}</h5>
                          <span className="text-[11px] text-slate-400">
                            {edu.startDate} - {edu.endDate || "Hiện tại"}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">
                          {edu.major} {edu.degree && `• ${edu.degree}`}
                        </p>
                        {edu.gpa && (
                          <p className="text-[11px] text-indigo-600 font-bold">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CRITERIA BREAKDOWN & EVIDENCE */}
          {activeTab === "criteria" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Bảng đối soát tiêu chí JD & Trích dẫn bằng chứng từ CV
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mỗi tiêu chí được chấm theo thang 6 mức (0, 20, 40, 60, 80, 100) nhân với trọng số %.
                  </p>
                </div>
              </div>

              {aiEval?.evaluatedCriteria && aiEval.evaluatedCriteria.length > 0 ? (
                <div className="space-y-3">
                  {aiEval.evaluatedCriteria.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3 text-xs"
                    >
                      {/* Criteria Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-sm">{c.name}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              c.requirementType === "MANDATORY"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {c.requirementType === "MANDATORY" ? "Bắt buộc" : "Ưu tiên"}
                          </span>
                          {c.isPassed ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Đạt (Passed)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600">
                              Chưa đạt
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium text-xs">
                            Trọng số: <strong>{c.weight}%</strong>
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-indigo-600 font-extrabold text-xs shadow-2xs">
                            {c.score}/100 (+{c.scoreContribution}%)
                          </span>
                        </div>
                      </div>

                      {/* Evidence Quote */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Trích dẫn bằng chứng từ CV (Evidence):
                          </span>
                          {c.isEvidenceVerified ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Đã kiểm chứng trong văn bản CV
                            </span>
                          ) : c.evidence ? (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                              <AlertTriangle size={11} /> Cần kiểm tra lại
                            </span>
                          ) : null}
                        </div>

                        {c.evidence ? (
                          <p className="text-slate-700 leading-relaxed italic text-xs">
                            &ldquo;{c.evidence}&rdquo;
                          </p>
                        ) : (
                          <p className="text-slate-400 italic text-xs">
                            Không tìm thấy đoạn văn bản nào tương ứng trong CV.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Chưa có dữ liệu bảng điểm chi tiết từng tiêu chí cho ứng viên này.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Ứng viên: <strong className="text-slate-800">{name}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            Đóng bảng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}