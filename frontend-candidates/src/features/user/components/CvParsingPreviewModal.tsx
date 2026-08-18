"use client";

import { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  Check,
  Loader2,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Languages,
  Globe,
  User,
  Target,
  ExternalLink,
} from "lucide-react";
import { CandidateProfile } from "../types/profile.types";
import { profileApi } from "../services/user.api";

interface CvParsingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: any;
  onSuccess: (updatedProfile: CandidateProfile) => void;
}

export default function CvParsingPreviewModal({
  isOpen,
  onClose,
  parsedData,
  onSuccess,
}: CvParsingPreviewModalProps) {
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !parsedData) return null;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const payloadToSave = {
      ...parsedData,
      name: parsedData.fullName || parsedData.name || undefined,
      };
      const updated = await profileApi.updateProfile(payloadToSave);
      onSuccess(updated);
      onClose();
    } catch (error) {
      console.error("Lỗi khi áp dụng dữ liệu CV:", error);
    } finally {
      setIsApplying(false);
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
        className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col text-slate-900 z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                AI đã bóc tách dữ liệu CV thành công!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vui lòng kiểm tra lại toàn bộ dữ liệu trước khi lưu vào hồ sơ chính thức
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

        {/* Nội dung kết quả bóc tách */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* 1. Thông tin chung & Liên hệ */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <User size={13} className="text-blue-600" /> Thông tin cơ bản
              </span>
              {(parsedData.currentLevel || parsedData.yearsOfExperience !== undefined) && (
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {parsedData.currentLevel || "Intern/Fresher"} • {parsedData.yearsOfExperience ?? 0} năm KN
                </span>
              )}
            </div>

            {parsedData.fullName && (
                <div>
                  <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Họ và tên ứng viên:</span>
                  <p className="text-base font-extrabold text-blue-600">{parsedData.fullName}</p>
                </div>
            )}

            <div>
              <p className="text-base font-extrabold text-slate-900">
                {parsedData.headline || "Chưa xác định chức danh"}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-slate-600 pt-0.5">
              {parsedData.phone && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone size={13} className="text-slate-400" />
                  {parsedData.phone}
                </span>
              )}
              {parsedData.address && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin size={13} className="text-slate-400" />
                  {parsedData.address}
                </span>
              )}
            </div>

            {/* Social Links */}
            {parsedData.socialLinks && parsedData.socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/60">
                {parsedData.socialLinks.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold"
                  >
                    <Globe size={11} className="text-blue-600" />
                    <span>{s.platform}:</span>
                    <span className="text-blue-600 max-w-[180px] truncate">{s.url}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. Tóm tắt bản thân */}
          {parsedData.summary && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Giới thiệu bản thân
              </span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {parsedData.summary}
              </p>
            </div>
          )}

          {/* 3. Mục tiêu nghề nghiệp */}
          {parsedData.careerObjective && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Target size={13} className="text-blue-600" /> Mục tiêu nghề nghiệp
              </span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {parsedData.careerObjective}
              </p>
            </div>
          )}

          {/* 4. Kỹ năng chuyên môn */}
          {parsedData.skills && parsedData.skills.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-2">
                Kỹ năng chuyên môn ({parsedData.skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parsedData.skills.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{s.name}</span>
                    {s.proficiency && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {s.proficiency}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. Kinh nghiệm làm việc */}
          {parsedData.experiences && parsedData.experiences.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Briefcase size={13} className="text-blue-600" /> Kinh nghiệm làm việc ({parsedData.experiences.length})
              </span>
              <div className="space-y-2">
                {parsedData.experiences.map((exp: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{exp.position}</p>
                        <p className="text-slate-600 font-medium">{exp.company}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        {exp.startDate} - {exp.endDate || "Hiện tại"}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-slate-500 leading-relaxed pt-1 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {exp.technologies.map((t: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 bg-slate-50 text-[10px] font-medium text-slate-600 rounded border border-slate-200"
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

          {/* 6. Học vấn */}
          {parsedData.educations && parsedData.educations.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <GraduationCap size={13} className="text-blue-600" /> Học vấn ({parsedData.educations.length})
              </span>
              <div className="space-y-2">
                {parsedData.educations.map((edu: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl space-y-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-slate-900">{edu.institution}</p>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {edu.startDate} - {edu.endDate || "Hiện tại"}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      {edu.major} {edu.degree && `• ${edu.degree}`}
                    </p>
                    {edu.gpa && (
                      <p className="text-[11px] text-blue-600 font-bold">GPA: {edu.gpa}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Dự án thực tế */}
          {parsedData.projects && parsedData.projects.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <FolderGit2 size={13} className="text-blue-600" /> Dự án thực tế ({parsedData.projects.length})
              </span>
              <div className="space-y-2">
                {parsedData.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{proj.name}</p>
                        {proj.role && (
                          <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold">
                            {proj.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {proj.startDate} - {proj.endDate || "Hiện tại"}
                      </span>
                    </div>
                    {proj.projectUrl && (
                      <a
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <ExternalLink size={11} /> {proj.projectUrl}
                      </a>
                    )}
                    {proj.description && (
                      <p className="text-slate-500 leading-relaxed pt-0.5 whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 bg-slate-50 text-[10px] font-medium text-slate-600 rounded border border-slate-200"
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

          {/* 8. Chứng chỉ & Ngoại ngữ (Grid 2 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Chứng chỉ */}
            {parsedData.certifications && parsedData.certifications.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Award size={13} className="text-blue-600" /> Chứng chỉ ({parsedData.certifications.length})
                </span>
                <div className="space-y-1.5">
                  {parsedData.certifications.map((c: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white border border-slate-100 rounded-xl">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {c.organization} {c.scoreOrLevel && `• ${c.scoreOrLevel}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ngoại ngữ */}
            {parsedData.languages && parsedData.languages.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Languages size={13} className="text-blue-600" /> Ngoại ngữ ({parsedData.languages.length})
                </span>
                <div className="space-y-1.5">
                  {parsedData.languages.map((l: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white border border-slate-100 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-slate-800">{l.language}</span>
                      <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                        {l.proficiency || "Cơ bản"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2 transition-all"
          >
            {isApplying ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang lưu vào hồ sơ...</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>Áp dụng vào Hồ sơ của tôi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}