"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, ChevronUp, ChevronDown, Sparkles, AlertTriangle, Loader2, Save } from "lucide-react";
import {
  JobDescription,
  EmploymentType,
  JobStatus,
  JobPriority,
  Department,
  Skill,
  PipelineTemplate,
  PipelineStage,
  User,
  Position,
} from "../types/job-description.types";
import { jobDescriptionApi } from "../services/job-description.api";
import { useAuth } from "@/src/providers/AuthProvider";
import { UserRole } from "@/src/features/users/types/user.types";
import UnsavedChangesModal from "./UnsavedChangesModal";

interface JobRequestFormWizardProps {
  mode: "create" | "edit";
  initialJob?: JobDescription | null;
  departments: Department[];
  pipelineTemplates: PipelineTemplate[];
  skills: Skill[];
  employees: User[];
  positions: Position[];
}

const DEFAULT_SKILLS = [
  { name: "React" },
  { name: "TypeScript" },
  { name: "Next.js" },
  { name: "Node.js" },
  { name: "PostgreSQL" },
  { name: "Docker" },
  { name: "AWS" },
  { name: "GraphQL" },
  { name: "Tailwind CSS" },
  { name: "Redis" },
  { name: "Kubernetes" },
  { name: "Figma" },
  { name: "User Research" },
  { name: "Python" },
  { name: "Go" },
  { name: "Vue.js" },
  { name: "Angular" },
  { name: "MongoDB" },
];

export default function JobRequestFormWizard({
  mode,
  initialJob = null,
  departments,
  pipelineTemplates,
  skills,
  employees,
  positions,
}: JobRequestFormWizardProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isDeptManager = currentUser?.role === UserRole.DEPARTMENT_MANAGER;

  const getDeptIdStr = (dept: string | Department | undefined): string => {
    if (!dept) return "";
    if (typeof dept === "string") return dept;
    if (typeof dept === "object" && "_id" in dept) return dept._id;
    return "";
  };

  const userDeptId = getDeptIdStr(currentUser?.departmentId);

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unsaved changes state & refs
  const [isDirty, setIsDirty] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const isSubmittedRef = useRef(false);
  const isMountedRef = useRef(false);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>(EmploymentType.FULL_TIME);
  const [minimumSalary, setMinimumSalary] = useState<number | "">("");
  const [maximumSalary, setMaximumSalary] = useState<number | "">("");
  const [headcount, setHeadcount] = useState<number>(1);
  const [priority, setPriority] = useState<JobPriority>(JobPriority.MEDIUM);
  const [experienceLevel, setExperienceLevel] = useState("Mid-level");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [interviewerId, setInterviewerId] = useState("");

  // Step 2 State
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");

  // Step 3 State
  const [selectedPipelineTemplateId, setSelectedPipelineTemplateId] = useState("");
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [status, setStatus] = useState<JobStatus>(JobStatus.PENDING);

  // Skills list fallback
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  useEffect(() => {
    if (skills.length > 0) {
      setSkillsList(skills);
    } else {
      setSkillsList(
        DEFAULT_SKILLS.map((sk, idx) => ({
          _id: `default-${idx}`,
          name: sk.name,
        }))
      );
    }
  }, [skills]);

  // Sync state when loading initialJob or mode
  useEffect(() => {
    setStep(1);
    setError(null);

    if (mode === "edit" && initialJob) {
      setTitle(initialJob.title);
      const deptId = typeof initialJob.departmentId === "object" ? initialJob.departmentId?._id : initialJob.departmentId;
      setDepartmentId(deptId || "");
      setPositionId(initialJob.positionId || "");
      setLocation(initialJob.location);
      setEmploymentType(initialJob.employmentType);
      setMinimumSalary(initialJob.minimumSalary);
      setMaximumSalary(initialJob.maximumSalary);
      setHeadcount(initialJob.headcount || 1);
      setPriority(initialJob.priority || JobPriority.MEDIUM);
      setExperienceLevel(initialJob.experienceLevel || "Mid-level");

      const deadline = initialJob.applicationDeadline
        ? new Date(initialJob.applicationDeadline).toISOString().split("T")[0]
        : "";
      setApplicationDeadline(deadline);

      const skillIds = initialJob.requiredSkills.map((sk) => (typeof sk === "object" ? sk?._id : sk));
      setSelectedSkills(skillIds);

      const intvId = typeof initialJob.interviewerId === "object" ? initialJob.interviewerId?._id : initialJob.interviewerId;
      setInterviewerId(intvId || "");

      setDescription(initialJob.description);
      setRequirements(initialJob.requirements);
      setBenefits(initialJob.benefits);

      const pipeId = typeof initialJob.pipelineTemplateId === "object" ? initialJob.pipelineTemplateId?._id : initialJob.pipelineTemplateId;
      setSelectedPipelineTemplateId(pipeId || "");

      if (typeof initialJob.pipelineTemplateId === "object" && initialJob.pipelineTemplateId?.stages) {
        setPipelineStages(initialJob.pipelineTemplateId.stages.map((s) => ({ ...s })));
      } else {
        const matched = pipelineTemplates.find((t) => t._id === pipeId);
        if (matched) {
          setPipelineStages(matched.stages.map((s) => ({ ...s })));
        }
      }

      setStatus(initialJob.status || JobStatus.PENDING);
    } else {
      // Mode create
      setTitle("");
      setDepartmentId(isDeptManager && userDeptId ? userDeptId : "");
      setPositionId("");
      setLocation("");
      setEmploymentType(EmploymentType.FULL_TIME);
      setMinimumSalary("");
      setMaximumSalary("");
      setHeadcount(1);
      setPriority(JobPriority.MEDIUM);
      setExperienceLevel("Mid-level");
      setApplicationDeadline("");
      setSelectedSkills([]);
      setInterviewerId("");
      setDescription("");
      setRequirements("");
      setBenefits("");

      if (pipelineTemplates.length > 0) {
        setSelectedPipelineTemplateId(pipelineTemplates[0]._id);
        setPipelineStages(pipelineTemplates[0].stages.map((s) => ({ ...s })));
      } else {
        setSelectedPipelineTemplateId("");
        setPipelineStages([]);
      }

      setStatus(JobStatus.PENDING);
    }

    // Reset dirty state on initial form sync
    setIsDirty(false);
    isMountedRef.current = false;
  }, [mode, initialJob, isDeptManager, userDeptId, pipelineTemplates]);

  // Track user changes to mark form dirty
  useEffect(() => {
    if (isMountedRef.current) {
      setIsDirty(true);
    } else {
      isMountedRef.current = true;
    }
  }, [
    title,
    departmentId,
    positionId,
    location,
    employmentType,
    minimumSalary,
    maximumSalary,
    headcount,
    priority,
    experienceLevel,
    applicationDeadline,
    selectedSkills,
    interviewerId,
    description,
    requirements,
    benefits,
    selectedPipelineTemplateId,
    pipelineStages,
    status,
  ]);

  // Browser refresh / tab close warning prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Intercept internal link navigation (sidebar links, etc.) when dirty
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!isDirty || isSubmittedRef.current) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.href && !anchor.href.startsWith("javascript:")) {
        try {
          const url = new URL(anchor.href, window.location.origin);
          if (url.pathname !== window.location.pathname) {
            e.preventDefault();
            e.stopPropagation();
            setPendingUrl(url.pathname);
            setIsUnsavedModalOpen(true);
          }
        } catch (err) {
          // ignore
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isDirty]);

  // Back button handler
  const handleBackClick = () => {
    if (isDirty && !isSubmittedRef.current) {
      setPendingUrl("/job-description");
      setIsUnsavedModalOpen(true);
    } else {
      router.push("/job-description");
    }
  };

  const handlePipelineTemplateChange = (templateId: string) => {
    setSelectedPipelineTemplateId(templateId);
    const template = pipelineTemplates.find((t) => t._id === templateId);
    if (template) {
      setPipelineStages(template.stages.map((s) => ({ ...s })));
    } else {
      setPipelineStages([]);
    }
  };

  const handleToggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleMoveStage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === pipelineStages.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...pipelineStages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPipelineStages(updated.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleRemoveStage = (index: number) => {
    if (pipelineStages.length <= 1) {
      setError("Quy trình tuyển dụng phải có ít nhất 1 giai đoạn");
      return;
    }
    const updated = pipelineStages.filter((_, idx) => idx !== index).map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));
    setPipelineStages(updated);
    setError(null);
  };

  // Form step navigation & validation
  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (step === 1) {
      if (!title.trim()) return setError("Tên vị trí không được để trống");
      if (!departmentId) return setError("Hãy chọn một phòng ban");
      if (!location.trim()) return setError("Địa điểm không được để trống");
      if (minimumSalary === "" || maximumSalary === "") return setError("Vui lòng nhập mức lương");
      if (Number(minimumSalary) > Number(maximumSalary)) return setError("Lương tối thiểu không được lớn hơn lương tối đa");
      if (selectedSkills.length === 0) return setError("Chọn ít nhất một kỹ năng yêu cầu");
      setStep(2);
    } else if (step === 2) {
      if (!description.trim()) return setError("Mô tả công việc không được để trống");
      if (!requirements.trim()) return setError("Yêu cầu công việc không được để trống");
      if (!benefits.trim()) return setError("Quyền lợi không được để trống");
      setStep(3);
    }
  };

  const handlePrevStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  // Helper calculations for positions, skills, and employees
  const filteredPositions = positions.filter((pos) => {
    const dId = typeof pos.departmentId === "string" ? pos.departmentId : (pos.departmentId as any)?._id;
    return dId === departmentId;
  });

  const selectedPosition = positions.find((pos) => pos._id === positionId);
  const posSkillIds = selectedPosition?.skillIds?.map((s: any) => (typeof s === "string" ? s : s?._id)) || [];

  const filteredSkills = selectedPosition
    ? skillsList.filter((sk) => posSkillIds.includes(sk._id))
    : [];

  const filteredEmployees = employees.filter((emp) => {
    const empDeptId = emp.departmentId;
    return empDeptId === departmentId;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "DEPARTMENT_MANAGER": return "Trưởng phòng";
      case "HR_ADMIN": return "HR Admin";
      case "EMPLOYEE":
      default:
        return "Interviewer";
    }
  };

  const handleDepartmentChange = (deptId: string) => {
    setDepartmentId(deptId);
    setPositionId("");
    setTitle("");
    setSelectedSkills([]);
    setInterviewerId("");
  };

  const handlePositionChange = (posId: string) => {
    setPositionId(posId);
    const selectedPos = positions.find((pos) => pos._id === posId);
    if (selectedPos) {
      setTitle(selectedPos.name);
      const skillIdsToSelect = selectedPos.skillIds?.map((s: any) => (typeof s === "string" ? s : s?._id)) || [];
      setSelectedSkills(skillIdsToSelect);
    } else {
      setTitle("");
      setSelectedSkills([]);
    }
  };

  // Submit complete form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prevent submission if not at step 3
    if (step < 3) {
      handleNextStep();
      return;
    }

    if (!selectedPipelineTemplateId) {
      setError("Vui lòng chọn mẫu Quy trình phỏng vấn");
      return;
    }

    const payload = {
      title: title.trim(),
      departmentId,
      positionId: positionId || undefined,
      location: location.trim(),
      employmentType,
      minimumSalary: Number(minimumSalary),
      maximumSalary: Number(maximumSalary),
      headcount,
      priority,
      experienceLevel: experienceLevel.trim(),
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
      requiredSkills: selectedSkills.filter((id) => !id.startsWith("default-")),
      interviewerId: interviewerId || undefined,
      description: description.trim(),
      requirements: requirements.trim(),
      benefits: benefits.trim(),
      pipelineTemplateId: selectedPipelineTemplateId,
      status: isDeptManager ? JobStatus.PENDING : status,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await jobDescriptionApi.createJob(payload);
      } else if (mode === "edit" && initialJob) {
        await jobDescriptionApi.updateJob(initialJob._id, payload);
      }
      isSubmittedRef.current = true;
      router.push("/job-description");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi lưu yêu cầu tuyển dụng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-2 pb-12">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
              {mode === "create" ? "Tạo Yêu Cầu Tuyển Dụng Mới" : "Chỉnh Sửa Yêu Cầu Tuyển Dụng"}
            </span>
            <h1 className="text-xl font-bold text-gray-900">
              {mode === "create" ? "Quy trình thiết lập Yêu cầu Tuyển dụng" : title || "Chỉnh sửa công việc"}
            </h1>
          </div>
        </div>

        {/* Wizard Step Pills */}
        <div className="flex items-center gap-2">
          {[
            { stepNum: 1, label: "1. Thông tin chung" },
            { stepNum: 2, label: "2. Nội dung công việc" },
            { stepNum: 3, label: "3. Quy trình & Trạng thái" },
          ].map((sItem) => (
            <div
              key={sItem.stepNum}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                step === sItem.stepNum
                  ? "bg-indigo-600 text-white shadow-xs"
                  : step > sItem.stepNum
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step > sItem.stepNum && <Check size={14} />}
              <span>{sItem.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-semibold">
          <AlertTriangle size={18} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleFormSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-2xs p-6 space-y-6">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                1
              </span>
              Thông tin tổng quan vị trí tuyển dụng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Phòng ban <span className="text-rose-500">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={isDeptManager}
                  className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDeptManager ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-gray-800"
                  }`}
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Vị trí tuyển dụng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={positionId}
                  onChange={(e) => handlePositionChange(e.target.value)}
                  disabled={!departmentId}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">-- Chọn vị trí từ danh mục --</option>
                  {filteredPositions.map((pos) => (
                    <option key={pos._id} value={pos._id}>
                      {pos.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Position Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Tiêu đề công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Senior Frontend Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Địa điểm làm việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Hà Nội, Hồ Chí Minh"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>

              {/* Employment Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Hình thức làm việc
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
                >
                  <option value={EmploymentType.FULL_TIME}>Full-time</option>
                  <option value={EmploymentType.PART_TIME}>Part-time</option>
                  <option value={EmploymentType.CONTRACT}>Hợp đồng</option>
                  <option value={EmploymentType.REMOTE}>Remote</option>
                  <option value={EmploymentType.HYBRID}>Hybrid</option>
                </select>
              </div>

              {/* Headcount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Số lượng cần tuyển <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900"
                />
              </div>
            </div>

            {/* Salaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Lương tối thiểu (USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="VD: 1000"
                  value={minimumSalary}
                  onChange={(e) => setMinimumSalary(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Lương tối đa (USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="VD: 2000"
                  value={maximumSalary}
                  onChange={(e) => setMaximumSalary(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900"
                />
              </div>
            </div>

            {/* Experience level, priority & deadline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Kinh nghiệm yêu cầu
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
                >
                  <option value="Junior">Junior (0 - 2 năm)</option>
                  <option value="Mid-level">Mid-level (2 - 4 năm)</option>
                  <option value="Senior">Senior (5+ năm)</option>
                  <option value="Lead / Manager">Lead / Manager</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Mức độ ưu tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as JobPriority)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
                >
                  <option value={JobPriority.LOW}>Thấp</option>
                  <option value={JobPriority.MEDIUM}>Bình thường</option>
                  <option value={JobPriority.HIGH}>Gấp</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Hạn nộp hồ sơ
                </label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
              </div>
            </div>

            {/* Required Skills Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Kỹ năng yêu cầu <span className="text-rose-500">*</span>
              </label>
              <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 space-y-3">
                {!positionId ? (
                  <p className="text-xs text-gray-400 italic text-center py-2">
                    Vui lòng chọn Vị trí tuyển dụng ở trên để hiển thị danh sách kỹ năng tương ứng
                  </p>
                ) : filteredSkills.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-2">
                    Vị trí này chưa được thiết lập danh mục kỹ năng
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.map((sk) => {
                      const isSelected = selectedSkills.includes(sk._id);
                      return (
                        <button
                          key={sk._id}
                          type="button"
                          onClick={() => handleToggleSkill(sk._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {sk.name}
                          {isSelected && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Interviewer Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Người phỏng vấn chính
              </label>
              <select
                value={interviewerId}
                onChange={(e) => setInterviewerId(e.target.value)}
                disabled={!departmentId}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">-- Chưa chỉ định --</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({getRoleLabel(emp.role)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Job Description Content */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                2
              </span>
              Chi tiết mô tả, yêu cầu & quyền lợi công việc
            </h3>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Mô tả công việc <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Mô tả chi tiết nhiệm vụ hàng ngày, dự án đảm nhận..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 leading-relaxed"
              />
            </div>

            {/* Requirements */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Yêu cầu ứng viên <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Kinh nghiệm tối thiểu, trình độ học vấn, kỹ năng mềm..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 leading-relaxed"
              />
            </div>

            {/* Benefits */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Quyền lợi đãi ngộ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Lương thưởng, bảo hiểm, chế độ đào tạo, nghỉ mát..."
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step 3: Pipeline & Final Settings */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                3
              </span>
              Quy trình tuyển dụng & Trạng thái khởi tạo
            </h3>

            {/* Pipeline template select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Mẫu Quy trình phỏng vấn <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPipelineTemplateId}
                  onChange={(e) => handlePipelineTemplateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-gray-800"
                >
                  <option value="">-- Chọn Mẫu Pipeline --</option>
                  {pipelineTemplates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.stages.length} giai đoạn)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Trạng thái yêu cầu
                </label>
                <select
                  value={isDeptManager ? JobStatus.PENDING : status}
                  onChange={(e) => setStatus(e.target.value as JobStatus)}
                  disabled={isDeptManager}
                  className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold ${
                    isDeptManager ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-gray-800"
                  }`}
                >
                  <option value={JobStatus.PENDING}>Chờ duyệt</option>
                  {!isDeptManager && <option value={JobStatus.APPROVED}>Đã duyệt</option>}
                  {!isDeptManager && <option value={JobStatus.REJECTED}>Từ chối</option>}
                  {!isDeptManager && <option value={JobStatus.JD_CREATED}>Đã tạo JD</option>}
                  {!isDeptManager && <option value={JobStatus.COMPLETED}>Hoàn thành</option>}
                </select>
              </div>
            </div>

            {/* Pipeline Stage Preview */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                Cấu trúc các giai đoạn tuyển dụng
              </span>

              {pipelineStages.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs italic">
                  Vui lòng chọn mẫu pipeline để tải danh sách các giai đoạn phỏng vấn
                </div>
              ) : (
                <div className="space-y-2">
                  {pipelineStages.map((stg, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{stg.name}</span>
                        <span
                          className="w-3 h-3 rounded-full border border-black/5"
                          style={{ backgroundColor: stg.color }}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveStage(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStage(idx, "down")}
                          disabled={idx === pipelineStages.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(idx)}
                          className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer ml-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              Quay lại Bước {step - 1}
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Tiếp theo (Bước {step + 1})
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {mode === "create" ? "Tạo Yêu Cầu Tuyển Dụng" : "Cập Nhật Yêu Cầu Tuyển Dụng"}
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Unsaved changes confirmation modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => setIsUnsavedModalOpen(false)}
        onConfirm={() => {
          setIsUnsavedModalOpen(false);
          isSubmittedRef.current = true;
          router.push(pendingUrl || "/job-description");
        }}
      />
    </div>
  );
}
