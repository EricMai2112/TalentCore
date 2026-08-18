"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Check, Plus, Trash2, ChevronUp, ChevronDown, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
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

interface JobRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialJob: JobDescription | null;
  isSubmitting: boolean;
  departments: Department[];
  pipelineTemplates: PipelineTemplate[];
  skills: Skill[];
  employees: User[];
  positions: Position[];
  isDeptManager?: boolean;
  userDeptId?: string;
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
  { name: "MongoDB" }
];

export default function JobRequestModal({
  isOpen,
  onClose,
  onSubmit,
  initialJob,
  isSubmitting,
  departments,
  pipelineTemplates,
  skills,
  employees,
  positions,
  isDeptManager = false,
  userDeptId = "",
}: JobRequestModalProps) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

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

  // Fallback skills list if empty
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  useEffect(() => {
    if (skills.length > 0) {
      setSkillsList(skills);
    } else {
      // Map defaults to Skill interface format with dummy ids
      setSkillsList(
        DEFAULT_SKILLS.map((sk, idx) => ({
          _id: `default-${idx}`,
          name: sk.name,
        }))
      );
    }
  }, [skills]);

  // Sync state when opening modal
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      
      if (initialJob) {
        // Load initial values
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

        const skillIds = initialJob.requiredSkills.map(sk => typeof sk === "object" ? sk?._id : sk);
        setSelectedSkills(skillIds);

        const intvId = typeof initialJob.interviewerId === "object" ? initialJob.interviewerId?._id : initialJob.interviewerId;
        setInterviewerId(intvId || "");

        setDescription(initialJob.description);
        setRequirements(initialJob.requirements);
        setBenefits(initialJob.benefits);

        const pipeId = typeof initialJob.pipelineTemplateId === "object" ? initialJob.pipelineTemplateId?._id : initialJob.pipelineTemplateId;
        setSelectedPipelineTemplateId(pipeId || "");

        // Set stages from loaded job
        if (typeof initialJob.pipelineTemplateId === "object" && initialJob.pipelineTemplateId?.stages) {
          setPipelineStages(initialJob.pipelineTemplateId.stages.map(s => ({ ...s })));
        } else {
          // fallback to load from list
          const matched = pipelineTemplates.find(t => t._id === pipeId);
          if (matched) {
            setPipelineStages(matched.stages.map(s => ({ ...s })));
          }
        }

        setStatus(initialJob.status || JobStatus.PENDING);
      } else {
        // Reset to default blank form
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
        
        // Select first pipeline template as default
        if (pipelineTemplates.length > 0) {
          setSelectedPipelineTemplateId(pipelineTemplates[0]._id);
          setPipelineStages(pipelineTemplates[0].stages.map(s => ({ ...s })));
        } else {
          setSelectedPipelineTemplateId("");
          setPipelineStages([]);
        }

        setStatus(JobStatus.PENDING);
      }
    }
  }, [isOpen, initialJob, departments, pipelineTemplates, isDeptManager, userDeptId]);

  if (!isOpen) return null;

  // Handles template selection and stages population
  const handlePipelineTemplateChange = (templateId: string) => {
    setSelectedPipelineTemplateId(templateId);
    const template = pipelineTemplates.find(t => t._id === templateId);
    if (template) {
      setPipelineStages(template.stages.map(s => ({ ...s })));
    } else {
      setPipelineStages([]);
    }
  };

  // Toggle skills tag
  const handleToggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  // Move stage order inside JD form wizard
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

  // Remove stage in wizard
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
  const handleNextStep = () => {
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

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  // Helper calculations for positions, skills, and employees
  const filteredPositions = positions.filter(pos => {
    const dId = typeof pos.departmentId === "string" ? pos.departmentId : (pos.departmentId as any)?._id;
    return dId === departmentId;
  });

  const selectedPosition = positions.find(pos => pos._id === positionId);
  const posSkillIds = selectedPosition?.skillIds?.map((s: any) => typeof s === "string" ? s : s?._id) || [];
  
  const filteredSkills = selectedPosition
    ? skillsList.filter(sk => posSkillIds.includes(sk._id))
    : []; // Empty if no position is selected

  const filteredEmployees = employees.filter(emp => {
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
    const selectedPos = positions.find(pos => pos._id === posId);
    if (selectedPos) {
      setTitle(selectedPos.name);
      const skillIdsToSelect = selectedPos.skillIds?.map((s: any) => typeof s === "string" ? s : s?._id) || [];
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

    if (!selectedPipelineTemplateId) {
      setError("Vui lòng chọn mẫu Pipeline tuyển dụng");
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
      requiredSkills: selectedSkills.filter(id => !id.startsWith("default-")), // strip out mock ids if any
      interviewerId: interviewerId || undefined,
      description: description.trim(),
      requirements: requirements.trim(),
      benefits: benefits.trim(),
      pipelineTemplateId: selectedPipelineTemplateId,
      status,
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {initialJob ? "Cập nhật Job Description" : "Tạo Job mới"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Bước {step}/3 — {step === 1 ? "Thông tin cơ bản" : step === 2 ? "Mô tả & yêu cầu" : "Pipeline & xuất bản"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Department & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Phòng ban <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={isDeptManager && userDeptId ? userDeptId : departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    disabled={isDeptManager}
                    required
                    className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-800 ${
                      isDeptManager ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Địa điểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="VD: Hồ Chí Minh"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* Pos Title (Dropdown filtered by selected department) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tên vị trí <span className="text-red-500">*</span>
                </label>
                <select
                  value={positionId}
                  onChange={(e) => handlePositionChange(e.target.value)}
                  disabled={!departmentId}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {!departmentId ? (
                    <option value="">-- Vui lòng chọn phòng ban trước --</option>
                  ) : (
                    <>
                      <option value="">-- Chọn vị trí --</option>
                      {filteredPositions.map((pos) => (
                        <option key={pos._id} value={pos._id}>
                          {pos.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Employment Type & Headcount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Hình thức <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                  >
                    <option value={EmploymentType.FULL_TIME}>Full-time</option>
                    <option value={EmploymentType.PART_TIME}>Part-time</option>
                    <option value={EmploymentType.CONTRACT}>Contract</option>
                    <option value={EmploymentType.REMOTE}>Remote</option>
                    <option value={EmploymentType.HYBRID}>Hybrid</option>
                    <option value={EmploymentType.ONSITE}>Onsite</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Số lượng tuyển (Headcount)
                  </label>
                  <input
                    type="number"
                    value={headcount}
                    onChange={(e) => setHeadcount(Math.max(1, Number(e.target.value)))}
                    min={1}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as JobPriority)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                  >
                    <option value={JobPriority.HIGH}>▲ Gấp</option>
                    <option value={JobPriority.MEDIUM}>Bình thường</option>
                    <option value={JobPriority.LOW}>Thấp</option>
                  </select>
                </div>
              </div>

              {/* Salary Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Lương tối thiểu (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={minimumSalary}
                    onChange={(e) => setMinimumSalary(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="VD: 2000"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Lương tối đa (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={maximumSalary}
                    onChange={(e) => setMaximumSalary(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="VD: 4000"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* Experience Level & Deadline & Interviewer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Mức kinh nghiệm
                  </label>
                  <input
                    type="text"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    placeholder="VD: Senior, 3+ năm"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Hạn nhận hồ sơ
                  </label>
                  <input
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Người phỏng vấn chính
                  </label>
                  <select
                    value={interviewerId}
                    onChange={(e) => setInterviewerId(e.target.value)}
                    disabled={!departmentId}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {!departmentId ? (
                      <option value="">-- Chọn phòng ban trước --</option>
                    ) : (
                      <>
                        <option value="">-- Chọn nhân viên --</option>
                        {filteredEmployees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} ({getRoleLabel(emp.role)})
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Required Skills tags selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                  Kỹ năng yêu cầu <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl">
                  {!positionId ? (
                    <div className="text-xs text-gray-400 italic py-1">
                      Vui lòng chọn tên vị trí để hiển thị danh sách kỹ năng yêu cầu.
                    </div>
                  ) : filteredSkills.length === 0 ? (
                    <div className="text-xs text-gray-400 italic py-1">
                      Không tìm thấy kỹ năng liên kết với vị trí này.
                    </div>
                  ) : (
                    filteredSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill._id);
                      return (
                        <button
                          key={skill._id}
                          type="button"
                          onClick={() => handleToggleSkill(skill._id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all hover:scale-102 ${
                            isSelected
                              ? "bg-indigo-600 text-white border-transparent shadow-xs"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Description & Requirements */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Mô tả công việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về vị trí, trách nhiệm, dự án..."
                  required
                  rows={5}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Yêu cầu <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="- 5+ years experience...&#10;- Strong proficiency in..."
                  required
                  rows={5}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Quyền lợi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="- Competitive salary...&#10;- Health insurance..."
                  required
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-800"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Pipeline & Publish */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Select template from settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Mẫu Pipeline Tuyển dụng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPipelineTemplateId}
                    onChange={(e) => handlePipelineTemplateChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-gray-800"
                  >
                    <option value="">-- Chọn mẫu pipeline --</option>
                    {pipelineTemplates.map((tpl) => (
                      <option key={tpl._id} value={tpl._id}>
                        {tpl.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Trạng thái yêu cầu
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-gray-800"
                  >
                    <option value={JobStatus.PENDING}>Chờ duyệt</option>
                    <option value={JobStatus.APPROVED}>Đã duyệt</option>
                    <option value={JobStatus.REJECTED}>Từ chối</option>
                    <option value={JobStatus.JD_CREATED}>Đã tạo JD</option>
                    <option value={JobStatus.COMPLETED}>Hoàn thành</option>
                  </select>
                </div>
              </div>

              {/* Stages List inside Wizard */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                  Cấu trúc quy trình phỏng vấn
                </span>
                
                {pipelineStages.length === 0 ? (
                  <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs italic">
                    Vui lòng chọn mẫu pipeline để tải danh sách các giai đoạn
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {pipelineStages
                      .sort((a, b) => a.order - b.order)
                      .map((stage, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50/75 border border-gray-100 rounded-xl p-3 shadow-3xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {stage.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Color preview */}
                            <span
                              className="w-3.5 h-3.5 rounded-full mr-2 border border-black/5"
                              style={{ backgroundColor: stage.color }}
                            />
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveStage(idx, "up")}
                              className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-20 rounded-md transition-colors cursor-pointer"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === pipelineStages.length - 1}
                              onClick={() => handleMoveStage(idx, "down")}
                              className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-20 rounded-md transition-colors cursor-pointer"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStage(idx)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors ml-1 cursor-pointer"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between sticky bottom-0 z-10">
          {/* Back btn */}
          <button
            type="button"
            disabled={step === 1}
            onClick={handlePrevStep}
            className="flex items-center gap-1 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>

          {/* Continue / Submit btn */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Tiếp tục
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Lưu nháp
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
