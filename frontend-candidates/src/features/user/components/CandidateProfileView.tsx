"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Award,
  Languages,
  Plus,
  Pencil,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Building2,
  FileText,
  Globe,
  Target,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "@/src/providers/AuthProvider";
import { CandidateProfile } from "../types/profile.types";
import { profileApi } from "../services/user.api";
import EditCareerObjectiveModal from "./EditCareerObjectiveModal";
import EditPersonalInfoModal from "./EditPersonalInfoModal";

export default function CandidateProfileView() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileApi.getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const candidateName =
    (typeof profile?.userId === "object" ? profile?.userId?.name : null) ||
    authUser?.name ||
    "Ứng viên";

  const candidateEmail =
    (typeof profile?.userId === "object" ? profile?.userId?.email : null) ||
    authUser?.email ||
    "";

  const candidatePhone =
    (typeof profile?.userId === "object" ? profile?.userId?.phone : null) ||
    authUser?.phone ||
    "";

  const initialLetter = candidateName.charAt(0).toUpperCase();

  const hasCareerObjective = Boolean(profile?.careerObjective && profile.careerObjective.trim().length > 0);
  const hasExperience = (profile?.experiences?.length ?? 0) > 0;
  const hasEducation = (profile?.educations?.length ?? 0) > 0;
  const hasProjects = (profile?.projects?.length ?? 0) > 0;
  const hasSkills = (profile?.skills?.length ?? 0) > 0;
  const hasCertifications = (profile?.certifications?.length ?? 0) > 0;
  const hasLanguages = (profile?.languages?.length ?? 0) > 0;
  const hasCustomSections = (profile?.customSections?.length ?? 0) > 0;

  const renderSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("github")) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    }
    if (p.includes("linkedin")) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    }
    return <Globe size={14} />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 text-slate-900">

      {/* 1. THÔNG TIN CÁ NHÂN & SOCIAL LINKS (HEADER CARD) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
        {/* Header hàng trên: Avatar + Thông tin bên trái & DUY NHẤT 1 NÚT CHỈNH SỬA bên phải */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Avatar chữ cái */}
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md shadow-blue-500/20 shrink-0">
              {initialLetter}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {candidateName}
              </h1>

              <p className="text-base font-semibold text-blue-600">
                {profile?.headline || "Chưa cập nhật chức danh nghề nghiệp"}
              </p>

              {/* Thông tin liên hệ cơ bản */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-0.5">
                {candidateEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-400" />
                    {candidateEmail}
                  </span>
                )}
                {candidatePhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    {candidatePhone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {profile?.address || "Chưa cập nhật địa chỉ"}
                </span>
              </div>

              {/* Social Links (Hiển thị các link đã có, không có nút thêm lẻ) */}
              {profile?.socialLinks && profile.socialLinks.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {profile.socialLinks.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-colors"
                    >
                      {renderSocialIcon(item.platform)}
                      <span>{item.platform}</span>
                      <ExternalLink size={11} className="text-slate-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DUY NHẤT 1 NÚT CHỈNH SỬA Ở ĐÂY */}
          <button
            type="button"
            onClick={() => setIsPersonalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition-all cursor-pointer shrink-0"
          >
            <Pencil size={13} />
            <span>Chỉnh sửa</span>
          </button>
        </div>

        {/* Giới thiệu bản thân (Chỉ hiển thị text, không còn nút chỉnh sửa) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Giới thiệu bản thân
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {profile?.summary ||
              "Thêm mô tả ngắn về kinh nghiệm và thế mạnh của bạn để tạo ấn tượng tốt với nhà tuyển dụng."}
          </p>
        </div>
      </section>
      {/* Modal Chỉnh sửa Thông tin cá nhân & Giới thiệu */}
      <EditPersonalInfoModal
        isOpen={isPersonalModalOpen}
        onClose={() => setIsPersonalModalOpen(false)}
        profile={profile}
        onSuccess={(updatedData) => {
          setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
        }}
      />

      {/* 2. MỤC TIÊU NGHỀ NGHIỆP (BẮT BUỘC) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                Mục tiêu nghề nghiệp <span className="text-rose-500 font-bold">*</span>
              </h2>
              {hasCareerObjective ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
                  <CheckCircle2 size={13} /> Đã hoàn thành
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-500 mt-1 block">
                  Chưa hoàn thành
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!hasCareerObjective && <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition-all cursor-pointer"
              onClick={() => setIsObjectiveModalOpen(true)}
            >
              <Plus size={15} />
              <span>Thêm mới</span>
            </button>}
            
          </div>
        </div>
        <EditCareerObjectiveModal
          isOpen={isObjectiveModalOpen}
          onClose={() => setIsObjectiveModalOpen(false)}
          initialValue={profile?.careerObjective || ""}
          onSuccess={(updatedValue) => {
            setProfile((prev) => prev ? { ...prev, careerObjective: updatedValue } : null);
          }}
        />

        <div className="mt-6">
          {!hasCareerObjective ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/60 text-left">
              <p className="text-sm text-slate-600 font-medium">
                Nêu rõ mục tiêu ngắn hạn và dài hạn trong sự nghiệp giúp nhà tuyển dụng đánh giá định hướng phát triển của bạn
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline uppercase tracking-wider cursor-pointer"
                onClick={() => setIsObjectiveModalOpen(true)}
              >
                <Plus size={14} />
                <span>THÊM MỤC TIÊU NGHỀ NGHIỆP</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-start gap-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {profile?.careerObjective}
              </p>
              <button type="button" onClick={() => setIsObjectiveModalOpen(true)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer">
                <Pencil size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. HỌC VẤN (BẮT BUỘC) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                Học vấn <span className="text-rose-500 font-bold">*</span>
              </h2>
              {hasEducation ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
                  <CheckCircle2 size={13} /> Đã hoàn thành
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-500 mt-1 block">
                  Chưa hoàn thành
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span>Tips</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          {!hasEducation ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/60 text-left">
              <p className="text-sm text-slate-600 font-medium">
                Nhập thông tin học vấn của bạn
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline uppercase tracking-wider cursor-pointer"
              >
                <Plus size={14} />
                <span>THÊM MỚI</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.educations.map((edu, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-start gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">{edu.institution}</h3>
                    <p className="text-sm font-semibold text-slate-700">
                      {edu.major} {edu.degree && `• ${edu.degree}`}
                    </p>
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-xs text-slate-400">
                        {edu.startDate || "N/A"} - {edu.endDate || "Hiện tại"}
                      </p>
                    )}
                    {edu.gpa !== undefined && (
                      <p className="text-xs font-bold text-slate-800 pt-0.5">
                        GPA: <span className="text-blue-600">{edu.gpa}</span>
                      </p>
                    )}
                  </div>
                  <button type="button" className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer">
                    <Pencil size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. KỸ NĂNG CHUYÊN MÔN */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Kỹ năng chuyên môn</h2>
              {hasSkills ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
                  <CheckCircle2 size={13} /> Đã cập nhật ({profile?.skills.length} kỹ năng)
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400 mt-1 block">
                  Chưa cập nhật
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          {!hasSkills ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/60 text-left">
              <p className="text-sm text-slate-600 font-medium">
                Thêm các kỹ năng chuyên môn của bạn để hệ thống AI so khớp độ tương thích với Job Description
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
              >
                <Plus size={14} />
                <span>THÊM KỸ NĂNG</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {profile?.skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2"
                >
                  <span className="text-sm font-bold text-slate-800">{skill.name}</span>
                  {skill.yearsOfExperience && (
                    <span className="text-[11px] text-slate-500 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {skill.yearsOfExperience} năm
                    </span>
                  )}
                  {skill.proficiency && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {skill.proficiency}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. KINH NGHIỆM LÀM VIỆC (KHÔNG BẮT BUỘC) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Kinh nghiệm làm việc
              </h2>
              {hasExperience ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
                  <CheckCircle2 size={13} /> Đã cập nhật ({profile?.experiences.length} kinh nghiệm)
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 mt-1 block">
                  Chưa có kinh nghiệm / Fresher
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span>Tips</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          {!hasExperience ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/60 text-left">
              <p className="text-sm text-slate-600 font-medium">
                Nếu bạn là sinh viên hoặc thực tập sinh, bạn có thể bỏ qua phần này hoặc thêm các kỳ thực tập trước đây
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline uppercase tracking-wider cursor-pointer"
              >
                <Plus size={14} />
                <span>THÊM KINH NGHIỆM / THỰC TẬP</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.experiences.map((exp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-start gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">{exp.position}</h3>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400" />
                      <span>{exp.company}</span>
                    </p>
                    {(exp.startDate || exp.endDate) && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={13} />
                        <span>{exp.startDate || "N/A"} - {exp.endDate || "Hiện tại"}</span>
                      </p>
                    )}
                    {exp.description && (
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {exp.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cấp bậc & Số năm kinh nghiệm */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="font-bold text-slate-700">Số năm kinh nghiệm:</span>
            <span className="text-slate-600 font-medium flex items-center gap-2">
              {profile?.yearsOfExperience ? `${profile.yearsOfExperience} năm` : "Chưa có kinh nghiệm (0 năm)"}
              <button type="button" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                <Pencil size={13} />
              </button>
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="font-bold text-slate-700">Cấp bậc hiện tại:</span>
            <span className="text-slate-600 font-medium flex items-center gap-2">
              {profile?.currentLevel || "Intern / Fresher"}
              <button type="button" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                <Pencil size={13} />
              </button>
            </span>
          </div>
        </div>
      </section>

      {/* 5. DỰ ÁN THỰC TẾ (CÓ THỜI GIAN & TECHNOLOGIES LIỆT KÊ Ở DƯỚI) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Dự án thực tế</h2>
              {hasProjects ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
                  <CheckCircle2 size={13} /> Đã cập nhật ({profile?.projects.length} dự án)
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400 mt-1 block">
                  Chưa cập nhật
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          {!hasProjects ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/60 text-left">
              <p className="text-sm text-slate-600 font-medium">
                Thêm dự án nổi bật cùng link GitHub / Demo để tăng điểm AI Fit Score
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
              >
                <Plus size={14} />
                <span>THÊM DỰ ÁN</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {profile?.projects?.map((proj, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-start gap-4"
                >
                  <div className="space-y-2 flex-1">
                    {/* Tên dự án & Vai trò */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900">{proj.name}</h3>
                      {proj.role && (
                        <span className="text-xs px-2.5 py-0.5 bg-blue-100/80 text-blue-700 rounded-md font-semibold">
                          {proj.role}
                        </span>
                      )}
                    </div>

                    {/* Thời gian thực hiện dự án */}
                    {(proj.startDate || proj.endDate) && (
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{proj.startDate || "N/A"} - {proj.endDate || "Hiện tại"}</span>
                      </p>
                    )}

                    {/* Link GitHub / Demo */}
                    {proj.projectUrl && (
                      <div>
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> {proj.projectUrl}
                        </a>
                      </div>
                    )}

                    {/* Mô tả chi tiết */}
                    {proj.description && (
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pt-0.5">
                        {proj.description}
                      </p>
                    )}

                    {/* DANH SÁCH CÔNG NGHỆ (TECHNOLOGIES) LIỆT KÊ Ở DƯỚI */}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 mt-3">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                          Công nghệ sử dụng:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.technologies.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 rounded-lg shadow-2xs"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer shrink-0"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. CHỨNG CHỈ & NGOẠI NGỮ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CHỨNG CHỈ */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Award size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Chứng chỉ</h2>
                  <span className="text-[11px] text-slate-500">IELTS, AWS, Microsoft...</span>
                </div>
              </div>
              <button
                type="button"
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                title="Thêm chứng chỉ"
              >
                <Plus size={18} />
              </button>
            </div>

            {!hasCertifications ? (
              <div className="border border-dashed border-slate-300 rounded-xl p-5 bg-slate-50/60 text-left">
                <p className="text-xs text-slate-600 font-medium">Chưa có chứng chỉ</p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  <Plus size={13} />
                  <span>THÊM MỚI</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {profile?.certifications?.map((cert, index) => (
                  <div key={index} className="p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs space-y-0.5">
                    <p className="font-bold text-slate-800">{cert.name}</p>
                    <p className="text-slate-500">{cert.organization} {cert.scoreOrLevel && `• ${cert.scoreOrLevel}`}</p>
                    {cert.issueDate && <p className="text-slate-400 text-[11px]">{cert.issueDate}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* NGOẠI NGỮ */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Languages size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Ngoại ngữ</h2>
                  <span className="text-[11px] text-slate-500">Tiếng Anh, Nhật, Hàn...</span>
                </div>
              </div>
              <button
                type="button"
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                title="Thêm ngoại ngữ"
              >
                <Plus size={18} />
              </button>
            </div>

            {!hasLanguages ? (
              <div className="border border-dashed border-slate-300 rounded-xl p-5 bg-slate-50/60 text-left">
                <p className="text-xs text-slate-600 font-medium">Chưa có ngoại ngữ</p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  <Plus size={13} />
                  <span>THÊM MỚI</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {profile?.languages?.map((lang, index) => (
                  <div key={index} className="p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-bold text-slate-800">{lang.language}</span>
                    <span className="text-blue-600 font-semibold px-2 py-0.5 bg-blue-50 rounded-md">
                      {lang.proficiency || "Cơ bản"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 8. CÁC MỤC BỔ SUNG & TÙY CHỈNH */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mục bổ sung & Tùy chỉnh</h2>
              <p className="text-xs text-slate-500 mt-1">
                Giải thưởng, Hoạt động ngoại khóa, Tình nguyện, Sở thích cá nhân...
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-50 transition-all cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Thêm mục khác</span>
          </button>
        </div>

        <div className="mt-6">
          {!hasCustomSections ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/60 text-left">
              <p className="text-sm text-slate-600 font-medium">
                Thêm các thành tích, giải thưởng hoặc hoạt động ngoại khóa để hồ sơ nổi bật hơn
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
              >
                <Plus size={14} />
                <span>THÊM MỤC MỚI</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {profile?.customSections.map((section, sIdx) => (
                <div key={sIdx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{section.sectionTitle}</h3>
                  <div className="space-y-2">
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="text-xs p-3 bg-white border border-slate-100 rounded-lg">
                        <p className="font-bold text-slate-800">{item.title}</p>
                        {item.subtitle && <p className="text-slate-600">{item.subtitle}</p>}
                        {item.description && <p className="text-slate-500 mt-1">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}