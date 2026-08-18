"use client";

import { useEffect, useState, useMemo } from "react";
import {
  User,
  Target,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Award,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { CandidateProfile } from "../types/profile.types";

interface ProfileNavSidebarProps {
  profile: CandidateProfile | null;
}

// Đặt danh sách ID cố định ở ngoài để tham chiếu tĩnh tuyệt đối
const SECTION_IDS = [
  "section-personal-info",
  "section-career-objective",
  "section-experience",
  "section-education",
  "section-projects",
  "section-skills",
  "section-certifications",
  "section-custom",
];

export default function ProfileNavSidebar({ profile }: ProfileNavSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("section-personal-info");

  // Dùng useMemo để chỉ tính toán lại khi profile thay đổi
  const navItems = useMemo(
    () => [
      {
        id: "section-personal-info",
        label: "Thông tin cá nhân",
        icon: User,
        isFilled: Boolean(profile?.headline || profile?.address),
      },
      {
        id: "section-career-objective",
        label: "Mục tiêu nghề nghiệp",
        icon: Target,
        isFilled: Boolean(profile?.careerObjective),
      },
      {
        id: "section-experience",
        label: "Kinh nghiệm làm việc",
        icon: Briefcase,
        isFilled: Boolean(profile?.experiences && profile.experiences.length > 0),
      },
      {
        id: "section-education",
        label: "Học vấn",
        icon: GraduationCap,
        isFilled: Boolean(profile?.educations && profile.educations.length > 0),
      },
      {
        id: "section-projects",
        label: "Dự án thực tế",
        icon: FolderGit2,
        isFilled: Boolean(profile?.projects && profile.projects.length > 0),
      },
      {
        id: "section-skills",
        label: "Kỹ năng chuyên môn",
        icon: Cpu,
        isFilled: Boolean(profile?.skills && profile.skills.length > 0),
      },
      {
        id: "section-certifications",
        label: "Chứng chỉ & Ngoại ngữ",
        icon: Award,
        isFilled: Boolean(
          (profile?.certifications && profile.certifications.length > 0) ||
            (profile?.languages && profile.languages.length > 0)
        ),
      },
      {
        id: "section-custom",
        label: "Mục bổ sung & Tùy chỉnh",
        icon: FileText,
        isFilled: Boolean(profile?.customSections && profile.customSections.length > 0),
      },
    ],
    [profile]
  );

  const completedCount = useMemo(
    () => navItems.filter((it) => it.isFilled).length,
    [navItems]
  );
  const completionPercentage = Math.round((completedCount / navItems.length) * 100);
  const isFullyCompleted = completionPercentage === 100;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveSection(id);
    }
  };

  // ScrollSpy theo dõi qua SECTION_IDS cố định bên ngoài
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const id = SECTION_IDS[i];
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside className="sticky top-24 space-y-4 w-full">
      {/* Thẻ Độ hoàn thiện hồ sơ */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Độ hoàn thiện hồ sơ</span>
          <span
            className={`transition-colors duration-300 ${
              isFullyCompleted ? "text-emerald-600" : "text-blue-600"
            }`}
          >
            {completionPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isFullyCompleted ? "bg-emerald-500" : "bg-blue-600"
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">
            Đã hoàn thành {completedCount}/{navItems.length} đề mục
          </span>
          {isFullyCompleted && (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
              <CheckCircle2 size={12} /> Hoàn hảo
            </span>
          )}
        </div>
      </div>

      {/* Menu Mục lục đề mục */}
      <nav className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs space-y-1">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Mục lục hồ sơ
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-bold shadow-2xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  size={16}
                  className={`shrink-0 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {/* Chấm tròn trạng thái */}
              <div className="flex items-center shrink-0 ml-2">
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    item.isFilled ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                  title={item.isFilled ? "Đã có dữ liệu" : "Chưa cập nhật"}
                />
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}