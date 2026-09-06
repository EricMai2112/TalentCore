'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Loader2,
  Save,
  CheckCircle2,
  SlidersHorizontal,
  Briefcase,
  Layers,
  FileText,
  Clock,
  UserCheck,
  RefreshCw,
  Info
} from 'lucide-react'
import {
  CustomInput,
  CustomSelect,
  CustomDatePicker,
  CustomTextarea
} from '@/src/components/common'
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
  CriteriaRequirementType,
  JobCriteria
} from '../types/job-description.types'
import { jobDescriptionApi } from '../services/job-description.api'
import { useAuth } from '@/src/providers/AuthProvider'
import { UserRole } from '@/src/features/users/types/user.types'
import UnsavedChangesModal from './UnsavedChangesModal'
import CriteriaBenchmarkHint from './CriteriaBenchmarkHint'

interface JobRequestFormWizardProps {
  mode: 'create' | 'edit'
  initialJob?: JobDescription | null
  departments: Department[]
  pipelineTemplates: PipelineTemplate[]
  skills: Skill[]
  employees: User[]
  positions: Position[]
}

const DEFAULT_SKILLS = [
  { name: 'React' },
  { name: 'TypeScript' },
  { name: 'Next.js' },
  { name: 'Node.js' },
  { name: 'PostgreSQL' },
  { name: 'Docker' },
  { name: 'AWS' },
  { name: 'GraphQL' },
  { name: 'Tailwind CSS' },
  { name: 'Redis' },
  { name: 'Kubernetes' },
  { name: 'Figma' },
  { name: 'User Research' },
  { name: 'Python' },
  { name: 'Go' },
  { name: 'Vue.js' },
  { name: 'Angular' },
  { name: 'MongoDB' }
]

export default function JobRequestFormWizard({
  mode,
  initialJob = null,
  departments,
  pipelineTemplates,
  skills,
  employees,
  positions
}: JobRequestFormWizardProps) {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const isDeptManager = currentUser?.role === UserRole.DEPARTMENT_MANAGER

  const getDeptIdStr = (dept: string | Department | undefined): string => {
    if (!dept) return ''
    if (typeof dept === 'string') return dept
    if (typeof dept === 'object' && '_id' in dept) return dept._id
    return ''
  }

  const userDeptId = getDeptIdStr(currentUser?.departmentId)

  // Helper to get default application deadline (1 month from today)
  const getDefaultDeadline = () => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  }

  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Unsaved changes state & refs
  const [isDirty, setIsDirty] = useState(false)
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false)
  const [isAiSuggesting, setIsAiSuggesting] = useState(false)
  const [aiReasoning, setAiReasoning] = useState<string | null>(null)

  // AI JD Content Generation state in Step 2
  const [isAiGeneratingContent, setIsAiGeneratingContent] = useState(false)
  const [aiGeneratingSection, setAiGeneratingSection] = useState<
    'all' | 'description' | 'requirements' | 'benefits' | null
  >(null)

  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const isSubmittedRef = useRef(false)
  const isMountedRef = useRef(false)

  // Form Fields State
  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [positionId, setPositionId] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState<EmploymentType>(EmploymentType.FULL_TIME)
  const [minimumSalary, setMinimumSalary] = useState<number | ''>('')
  const [maximumSalary, setMaximumSalary] = useState<number | ''>('')
  const [headcount, setHeadcount] = useState<number>(1)
  const [priority, setPriority] = useState<JobPriority>(JobPriority.MEDIUM)
  const [experienceLevel, setExperienceLevel] = useState('Mid-level')
  const [applicationDeadline, setApplicationDeadline] = useState(getDefaultDeadline())
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [criteria, setCriteria] = useState<JobCriteria[]>([])
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([])

  // Step 2 State
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [benefits, setBenefits] = useState('')

  // Step 3 State
  const [selectedPipelineTemplateId, setSelectedPipelineTemplateId] = useState('')
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([])
  const [status, setStatus] = useState<JobStatus>(JobStatus.PENDING)

  // Skills list fallback
  const [skillsList, setSkillsList] = useState<Skill[]>([])

  useEffect(() => {
    if (skills.length > 0) {
      setSkillsList(skills)
    } else {
      setSkillsList(
        DEFAULT_SKILLS.map((sk, idx) => ({
          _id: `default-${idx}`,
          name: sk.name
        }))
      )
    }
  }, [skills])

  // Sync state when loading initialJob or mode
  useEffect(() => {
    setStep(1)
    setError(null)

    if (mode === 'edit' && initialJob) {
      setTitle(initialJob.title)
      const deptId =
        typeof initialJob.departmentId === 'object'
          ? initialJob.departmentId?._id
          : initialJob.departmentId
      setDepartmentId(deptId || '')
      setPositionId(initialJob.positionId || '')
      setLocation(initialJob.location)
      setEmploymentType(initialJob.employmentType)
      setMinimumSalary(initialJob.minimumSalary)
      setMaximumSalary(initialJob.maximumSalary)
      setHeadcount(initialJob.headcount || 1)
      setPriority(initialJob.priority || JobPriority.MEDIUM)
      setExperienceLevel(initialJob.experienceLevel || 'Mid-level')

      const deadline = initialJob.applicationDeadline
        ? new Date(initialJob.applicationDeadline).toISOString().split('T')[0]
        : getDefaultDeadline()
      setApplicationDeadline(deadline)

      const skillIds = initialJob.requiredSkills.map((sk) =>
        typeof sk === 'object' ? sk?._id : sk
      )
      setSelectedSkills(skillIds)

      // Load criteria or initialize from skills
      if (initialJob.criteria && initialJob.criteria.length > 0) {
        setCriteria(
          initialJob.criteria.map((c) => ({
            ...c,
            weight: Number(c.weight) || 0,
            requirementType:
              c.requirementType === ('NICE_TO_HAVE' as any)
                ? CriteriaRequirementType.PREFERRED
                : c.requirementType,
            skillId: typeof c.skillId === 'object' ? c.skillId?._id : c.skillId
          }))
        )
      } else {
        // Fallback: auto-build criteria from skills if none saved
        const defaultCriteriaList: JobCriteria[] = skillIds.map((sId) => {
          const found = skills.find((sk) => sk._id === sId)
          return {
            name: found ? found.name : sId,
            requirementType: CriteriaRequirementType.MANDATORY,
            weight: 0,
            skillId: sId
          }
        })
        if (defaultCriteriaList.length > 0) {
          const count = defaultCriteriaList.length
          const baseWeight = Math.floor(100 / count)
          const remainder = 100 - baseWeight * count
          defaultCriteriaList.forEach((c, idx) => {
            c.weight = idx === 0 ? baseWeight + remainder : baseWeight
          })
        }
        setCriteria(defaultCriteriaList)
      }

      // Populate selected interviewers
      if (initialJob.interviewerIds && initialJob.interviewerIds.length > 0) {
        const intvIds = initialJob.interviewerIds.map((emp) =>
          typeof emp === 'object' ? emp?._id : emp
        )
        setSelectedInterviewerIds(intvIds)
      } else if (initialJob.interviewerId) {
        const singleId =
          typeof initialJob.interviewerId === 'object'
            ? initialJob.interviewerId?._id
            : initialJob.interviewerId
        setSelectedInterviewerIds(singleId ? [singleId] : [])
      } else {
        setSelectedInterviewerIds([])
      }

      setDescription(initialJob.description)
      setRequirements(initialJob.requirements)
      setBenefits(initialJob.benefits)

      const pipeId =
        typeof initialJob.pipelineTemplateId === 'object'
          ? initialJob.pipelineTemplateId?._id
          : initialJob.pipelineTemplateId
      setSelectedPipelineTemplateId(pipeId || '')

      if (
        typeof initialJob.pipelineTemplateId === 'object' &&
        initialJob.pipelineTemplateId?.stages
      ) {
        setPipelineStages(initialJob.pipelineTemplateId.stages.map((s) => ({ ...s })))
      } else {
        const matched = pipelineTemplates.find((t) => t._id === pipeId)
        if (matched) {
          setPipelineStages(matched.stages.map((s) => ({ ...s })))
        }
      }

      setStatus(initialJob.status || JobStatus.PENDING)
    } else {
      // Mode create
      setTitle('')
      setDepartmentId(isDeptManager && userDeptId ? userDeptId : '')
      setPositionId('')
      setLocation('')
      setEmploymentType(EmploymentType.FULL_TIME)
      setMinimumSalary('')
      setMaximumSalary('')
      setHeadcount(1)
      setPriority(JobPriority.MEDIUM)
      setExperienceLevel('Mid-level')
      setApplicationDeadline(getDefaultDeadline())
      setSelectedSkills([])
      setCriteria([])
      setSelectedInterviewerIds([])
      setDescription('')
      setRequirements('')
      setBenefits('')

      if (pipelineTemplates.length > 0) {
        setSelectedPipelineTemplateId(pipelineTemplates[0]._id)
        setPipelineStages(pipelineTemplates[0].stages.map((s) => ({ ...s })))
      } else {
        setSelectedPipelineTemplateId('')
        setPipelineStages([])
      }

      setStatus(JobStatus.PENDING)
    }

    // Reset dirty state on initial form sync
    setIsDirty(false)
    isMountedRef.current = false
  }, [mode, initialJob, isDeptManager, userDeptId, pipelineTemplates])

  // Track user changes to mark form dirty
  useEffect(() => {
    if (isMountedRef.current) {
      setIsDirty(true)
    } else {
      isMountedRef.current = true
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
    criteria,
    selectedInterviewerIds,
    description,
    requirements,
    benefits,
    selectedPipelineTemplateId,
    pipelineStages,
    status
  ])

  // Browser refresh / tab close warning prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmittedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  // Intercept internal link navigation (sidebar links, etc.) when dirty
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!isDirty || isSubmittedRef.current) return

      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor && anchor.href && !anchor.href.startsWith('javascript:')) {
        try {
          const url = new URL(anchor.href, window.location.origin)
          if (url.pathname !== window.location.pathname) {
            e.preventDefault()
            e.stopPropagation()
            setPendingUrl(url.pathname)
            setIsUnsavedModalOpen(true)
          }
        } catch (err) {
          // ignore
        }
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => {
      document.removeEventListener('click', handleAnchorClick, true)
    }
  }, [isDirty])

  // Back button handler
  const handleBackClick = () => {
    if (isDirty && !isSubmittedRef.current) {
      setPendingUrl('/job-description')
      setIsUnsavedModalOpen(true)
    } else {
      router.push('/job-description')
    }
  }

  const handlePipelineTemplateChange = (templateId: string) => {
    setSelectedPipelineTemplateId(templateId)
    const template = pipelineTemplates.find((t) => t._id === templateId)
    if (template) {
      setPipelineStages(template.stages.map((s) => ({ ...s })))
    } else {
      setPipelineStages([])
    }
  }

  // Helper to sync criteria array whenever skills are selected or position changes
  const syncCriteriaFromSkillIds = (skillIds: string[]) => {
    setCriteria((prevCriteria) => {
      const existingMap = new Map<string, JobCriteria>()
      prevCriteria.forEach((c) => {
        const sId = typeof c.skillId === 'object' ? (c.skillId as any)?._id : c.skillId
        if (sId) existingMap.set(sId, c)
      })

      const nextList: JobCriteria[] = []

      skillIds.forEach((sId) => {
        if (existingMap.has(sId)) {
          nextList.push(existingMap.get(sId)!)
        } else {
          const foundSkill = skillsList.find((s) => s._id === sId)
          const name = foundSkill ? foundSkill.name : sId
          nextList.push({
            name,
            requirementType: CriteriaRequirementType.MANDATORY,
            weight: 0,
            skillId: sId
          })
        }
      })

      // Keep custom criteria rows that don't have skillId
      prevCriteria.forEach((c) => {
        if (!c.skillId) {
          nextList.push(c)
        }
      })

      // Auto balance weights if list non-empty
      if (nextList.length > 0) {
        const count = nextList.length
        const baseWeight = Math.floor(100 / count)
        const remainder = 100 - baseWeight * count
        return nextList.map((c, idx) => ({
          ...c,
          weight: idx === 0 ? baseWeight + remainder : baseWeight
        }))
      }

      return nextList
    })
  }

  // Toggle skills tag
  const handleToggleSkill = (skillId: string) => {
    let nextSkills: string[]
    if (selectedSkills.includes(skillId)) {
      nextSkills = selectedSkills.filter((id) => id !== skillId)
    } else {
      nextSkills = [...selectedSkills, skillId]
    }
    setSelectedSkills(nextSkills)
    syncCriteriaFromSkillIds(nextSkills)
  }

  // Toggle interviewer selection
  const handleToggleInterviewer = (empId: string) => {
    if (selectedInterviewerIds.includes(empId)) {
      setSelectedInterviewerIds(selectedInterviewerIds.filter((id) => id !== empId))
    } else {
      setSelectedInterviewerIds([...selectedInterviewerIds, empId])
    }
  }

  // Add custom criteria row
  const handleAddCriteriaRow = () => {
    const newRow: JobCriteria = {
      name: '',
      requirementType: CriteriaRequirementType.PREFERRED,
      weight: 0
    }
    setCriteria([...criteria, newRow])
  }

  // Update specific criteria field
  const handleUpdateCriteria = (index: number, field: keyof JobCriteria, value: any) => {
    const updated = [...criteria]
    updated[index] = { ...updated[index], [field]: value }
    setCriteria(updated)
  }

  // Remove specific criteria row
  const handleRemoveCriteria = (index: number) => {
    const removedItem = criteria[index]
    const updated = criteria.filter((_, idx) => idx !== index)

    // If item had a skillId, unselect that skill from selectedSkills
    if (removedItem?.skillId) {
      const sId =
        typeof removedItem.skillId === 'object'
          ? (removedItem.skillId as any)?._id
          : removedItem.skillId
      setSelectedSkills((prev) => prev.filter((id) => id !== sId))
    }

    setCriteria(updated)
  }

  // Auto balance criteria weights so sum equals 100% (Equal Split)
  const handleEqualSplitWeights = () => {
    if (criteria.length === 0) return
    const count = criteria.length
    const baseWeight = Math.floor(100 / count)
    const remainder = 100 - baseWeight * count

    const updated = criteria.map((c, idx) => ({
      ...c,
      weight: idx === 0 ? baseWeight + remainder : baseWeight
    }))
    setCriteria(updated)
  }

  // Google Gemini AI Weight Suggestion Handler
  const handleAiSuggestWeights = async () => {
    if (criteria.length === 0) return
    setIsAiSuggesting(true)
    setAiReasoning(null)
    setError(null)

    const selectedDept = departments.find((d) => d._id === departmentId)
    const selectedPos = positions.find((p) => p._id === positionId)

    const payload = {
      positionTitle: title || selectedPos?.name || undefined,
      experienceLevel: experienceLevel || undefined,
      departmentName: selectedDept?.name || undefined,
      criteria: criteria.map((c) => ({
        name: c.name,
        requirementType: c.requirementType,
        weight: c.weight
      }))
    }

    try {
      const res = await jobDescriptionApi.suggestCriteriaWeightsWithAi(payload)
      if (res && res.suggestedWeights) {
        const updated = [...criteria]
        res.suggestedWeights.forEach((item) => {
          if (typeof item.index === 'number' && updated[item.index]) {
            updated[item.index] = { ...updated[item.index], weight: item.weight }
          }
        })
        setCriteria(updated)
      }
      if (res && res.reasoning) {
        setAiReasoning(res.reasoning)
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể lấy gợi ý trọng số từ AI. Vui lòng thử lại!')
    } finally {
      setIsAiSuggesting(false)
    }
  }

  // Google Gemini AI Auto-Generate JD Content Handler (Step 2)
  const handleAiGenerateJdContent = async (
    targetSection: 'all' | 'description' | 'requirements' | 'benefits' = 'all'
  ) => {
    if (!title.trim()) {
      setError('Vui lòng quay lại Bước 1 và nhập Tiêu đề công việc trước khi gọi AI.')
      return
    }

    setIsAiGeneratingContent(true)
    setAiGeneratingSection(targetSection)
    setError(null)

    const selectedDept = departments.find((d) => d._id === departmentId)
    const selectedPos = positions.find((p) => p._id === positionId)

    const skillNames = selectedSkills
      .map((sId) => {
        const sk = skillsList.find((s) => s._id === sId)
        return sk ? sk.name : sId
      })
      .filter((n) => !n.startsWith('default-'))

    const payload = {
      title: title.trim(),
      departmentName: selectedDept?.name,
      positionName: selectedPos?.name,
      location: location.trim(),
      employmentType,
      experienceLevel,
      minimumSalary: minimumSalary !== '' ? Number(minimumSalary) : undefined,
      maximumSalary: maximumSalary !== '' ? Number(maximumSalary) : undefined,
      skillNames,
      criteria: criteria.map((c) => ({
        name: c.name,
        requirementType: c.requirementType,
        weight: c.weight
      }))
    }

    try {
      const res = await jobDescriptionApi.generateJdContentWithAi(payload)
      if (res) {
        if (targetSection === 'all' || targetSection === 'description') {
          if (res.description) setDescription(res.description)
        }
        if (targetSection === 'all' || targetSection === 'requirements') {
          if (res.requirements) setRequirements(res.requirements)
        }
        if (targetSection === 'all' || targetSection === 'benefits') {
          if (res.benefits) setBenefits(res.benefits)
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tự động soạn thảo nội dung JD bằng AI. Vui lòng thử lại!')
    } finally {
      setIsAiGeneratingContent(false)
      setAiGeneratingSection(null)
    }
  }

  // Real-time Soft Warnings Generator for each criteria row
  const getCriteriaSoftWarning = (item: JobCriteria, index: number): string | null => {
    // 1. Single criteria dominant (> 50%)
    if (item.weight > 50) {
      return '⚠️ Tiêu chí này đang chiếm quá 50% tổng trọng số'
    }

    // 2. Requirement Type Inversion (Preferred weight >= Mandatory weight)
    if (item.requirementType !== CriteriaRequirementType.MANDATORY) {
      const mandatoryItems = criteria.filter(
        (c) => c.requirementType === CriteriaRequirementType.MANDATORY
      )
      if (mandatoryItems.length > 0) {
        const minMandatoryWeight = Math.min(...mandatoryItems.map((c) => c.weight))
        if (item.weight >= minMandatoryWeight && item.weight > 0) {
          return `⚠️ Trọng số tiêu chí Ưu tiên (${item.weight}%) lớn hơn/bằng tiêu chí Bắt buộc (${minMandatoryWeight}%)`
        }
      }
    }

    // 3. Extremely low weight (< 5%)
    if (item.weight > 0 && item.weight < 5) {
      return 'ℹ️ Trọng số tiêu chí quá thấp (< 5%)'
    }

    return null
  }

  // Total weight calculation
  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)

  // Move stage order inside JD form wizard
  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === pipelineStages.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...pipelineStages]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    setPipelineStages(updated.map((s, idx) => ({ ...s, order: idx + 1 })))
  }

  // Remove stage in wizard
  const handleRemoveStage = (index: number) => {
    if (pipelineStages.length <= 1) {
      setError('Quy trình tuyển dụng phải có ít nhất 1 giai đoạn')
      return
    }
    const updated = pipelineStages
      .filter((_, idx) => idx !== index)
      .map((s, idx) => ({
        ...s,
        order: idx + 1
      }))
    setPipelineStages(updated)
    setError(null)
  }

  // Form step navigation & validation
  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setError(null)
    if (step === 1) {
      if (!title.trim()) return setError('Tên vị trí không được để trống')
      if (!departmentId) return setError('Hãy chọn một phòng ban')
      if (!location.trim()) return setError('Địa điểm không được để trống')
      if (minimumSalary === '' || maximumSalary === '') return setError('Vui lòng nhập mức lương')
      if (Number(minimumSalary) > Number(maximumSalary))
        return setError('Lương tối thiểu không được lớn hơn lương tối đa')
      if (criteria.length === 0) return setError('Thêm ít nhất một tiêu chí đánh giá cho công việc')

      const sumWeights = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
      if (Math.abs(sumWeights - 100) > 0.01) {
        return setError(
          `Tổng trọng số tất cả các tiêu chí phải bằng đúng 100% (Hiện tại: ${sumWeights}%)`
        )
      }
      setStep(2)
    } else if (step === 2) {
      if (!description.trim()) return setError('Mô tả công việc không được để trống')
      if (!requirements.trim()) return setError('Yêu cầu công việc không được để trống')
      if (!benefits.trim()) return setError('Quyền lợi không được để trống')
      setStep(3)
    }
  }

  const handlePrevStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  const filteredPositions = positions.filter((pos) => {
    const dId =
      typeof pos.departmentId === 'string' ? pos.departmentId : (pos.departmentId as any)?._id
    return dId === departmentId
  })

  const selectedPosition = positions.find((pos) => pos._id === positionId)
  const posSkillIds =
    selectedPosition?.skillIds?.map((s: any) => (typeof s === 'string' ? s : s?._id)) || []

  const filteredSkills = selectedPosition
    ? skillsList.filter((sk) => posSkillIds.includes(sk._id))
    : []

  const filteredEmployees = employees.filter((emp) => {
    const empDeptId = emp.departmentId
    return empDeptId === departmentId
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'DEPARTMENT_MANAGER':
        return 'Trưởng phòng'
      case 'HR_ADMIN':
        return 'HR Admin'
      case 'EMPLOYEE':
      default:
        return 'Interviewer'
    }
  }

  const handleDepartmentChange = (deptId: string) => {
    setDepartmentId(deptId)
    setPositionId('')
    setTitle('')
    setSelectedSkills([])
    setCriteria([])
    setSelectedInterviewerIds([])
  }

  const handlePositionChange = (posId: string) => {
    setPositionId(posId)
    const selectedPos = positions.find((pos) => pos._id === posId)
    if (selectedPos) {
      setTitle(selectedPos.name)
      const skillIdsToSelect =
        selectedPos.skillIds?.map((s: any) => (typeof s === 'string' ? s : s?._id)) || []
      setSelectedSkills(skillIdsToSelect)
      syncCriteriaFromSkillIds(skillIdsToSelect)
    } else {
      setTitle('')
      setSelectedSkills([])
      setCriteria([])
    }
  }

  // Submit complete form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Prevent submission if not at step 3
    if (step < 3) {
      handleNextStep()
      return
    }

    if (!selectedPipelineTemplateId) {
      setError('Vui lòng chọn mẫu Quy trình phỏng vấn')
      return
    }

    const sumWeights = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
    if (Math.abs(sumWeights - 100) > 0.01) {
      setError(`Tổng trọng số tất cả các tiêu chí phải bằng đúng 100% (Hiện tại: ${sumWeights}%)`)
      return
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
      applicationDeadline: applicationDeadline
        ? new Date(applicationDeadline).toISOString()
        : undefined,
      requiredSkills: selectedSkills.filter((id) => !id.startsWith('default-')),
      criteria: criteria.map((c) => ({
        name: c.name.trim(),
        requirementType: c.requirementType,
        weight: Number(c.weight),
        skillId:
          c.skillId && typeof c.skillId === 'string'
            ? c.skillId
            : typeof c.skillId === 'object'
              ? (c.skillId as any)._id
              : undefined
      })),
      interviewerId: selectedInterviewerIds.length > 0 ? selectedInterviewerIds[0] : undefined,
      interviewerIds: selectedInterviewerIds,
      description: description.trim(),
      requirements: requirements.trim(),
      benefits: benefits.trim(),
      pipelineTemplateId: selectedPipelineTemplateId,
      status: isDeptManager ? JobStatus.PENDING : status
    }

    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        await jobDescriptionApi.createJob(payload)
      } else if (mode === 'edit' && initialJob) {
        await jobDescriptionApi.updateJob(initialJob._id, payload)
      }
      isSubmittedRef.current = true
      router.push('/job-description')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi lưu yêu cầu tuyển dụng')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6 pb-12 px-1 md:px-3">
      {/* Full-width Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={handleBackClick}
            className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all cursor-pointer border border-gray-100"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
              {mode === 'create' ? 'Khởi Tạo Yêu Cầu Tuyển Dụng' : 'Hiệu Chỉnh Công Việc'}
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {mode === 'create' ? 'Tạo Yêu Cầu Tuyển Dụng Mới' : title || 'Chỉnh sửa yêu cầu'}
            </h1>
          </div>
        </div>

        {/* Wizard Step Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { stepNum: 1, label: '1. Thông tin & Tiêu chí AI' },
            { stepNum: 2, label: '2. Nội dung công việc' },
            { stepNum: 3, label: '3. Quy trình & Trạng thái' }
          ].map((sItem) => (
            <button
              key={sItem.stepNum}
              type="button"
              onClick={() => {
                if (sItem.stepNum < step) setStep(sItem.stepNum)
                else if (sItem.stepNum > step) handleNextStep()
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                step === sItem.stepNum
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                  : step > sItem.stepNum
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200/70'
              }`}
            >
              {step > sItem.stepNum ? (
                <Check size={14} className="text-indigo-600" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 text-center leading-4 text-[11px]">
                  {sItem.stepNum}
                </span>
              )}
              <span>{sItem.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-semibold shadow-xs">
          <AlertTriangle size={20} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Integrated Form Card Container */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden flex flex-col"
      >
        {/* Inner Form Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Step 1: Basic Information & AI Criteria Weighting */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Section Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Thông tin vị trí & Phòng ban
                  </h3>
                  <p className="text-xs text-gray-500">
                    Khai báo phòng ban, vị trí công việc, địa điểm, hình thức và danh sách người
                    phỏng vấn.
                  </p>
                </div>
              </div>

              {/* Row 1: Department & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomSelect
                  label="Phòng ban"
                  required
                  value={departmentId}
                  onChange={(val) => handleDepartmentChange(val)}
                  isLocked={isDeptManager}
                  disabled={isDeptManager}
                  placeholder="-- Chọn phòng ban --"
                  options={[
                    { value: "", label: "-- Chọn phòng ban --" },
                    ...departments.map((dept) => ({
                      value: dept._id,
                      label: dept.name,
                    })),
                  ]}
                />

                <CustomSelect
                  label="Vị trí tuyển dụng"
                  required
                  value={positionId}
                  onChange={(val) => handlePositionChange(val)}
                  disabled={!departmentId}
                  placeholder="-- Chọn vị trí từ danh mục --"
                  options={[
                    { value: "", label: "-- Chọn vị trí từ danh mục --" },
                    ...filteredPositions.map((pos) => ({
                      value: pos._id,
                      label: pos.name,
                    })),
                  ]}
                />
              </div>

              {/* Row 2: Title (Col-span 2) + Experience Level (Col-span 1) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <CustomInput
                    label="Tiêu đề công việc"
                    required
                    placeholder="VD: Senior Frontend Developer (ReactJS / Next.js)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="md:col-span-1">
                  <CustomSelect
                    label="Kinh nghiệm yêu cầu"
                    value={experienceLevel}
                    onChange={(val) => setExperienceLevel(val)}
                    options={[
                      { value: "Intern", label: "Intern (Thực tập sinh - Dưới 6 tháng)" },
                      { value: "Fresher", label: "Fresher (Mới tốt nghiệp - Dưới 1 năm)" },
                      { value: "Junior", label: "Junior (1 - 3 năm)" },
                      { value: "Mid-level", label: "Mid-level (3 - 5 năm)" },
                      { value: "Senior", label: "Senior (5+ năm)" },
                      { value: "Lead / Manager", label: "Lead / Manager (7+ năm)" },
                    ]}
                  />
                </div>
              </div>

              {/* Row 3: Location, Employment Type & Headcount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <CustomInput
                  label="Địa điểm làm việc"
                  required
                  placeholder="VD: Hà Nội, TP. Hồ Chí Minh"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <CustomSelect
                  label="Hình thức làm việc"
                  value={employmentType}
                  onChange={(val) => setEmploymentType(val as EmploymentType)}
                  options={[
                    { value: EmploymentType.FULL_TIME, label: "Full-time" },
                    { value: EmploymentType.PART_TIME, label: "Part-time" },
                    { value: EmploymentType.CONTRACT, label: "Hợp đồng" },
                    { value: EmploymentType.REMOTE, label: "Remote" },
                    { value: EmploymentType.HYBRID, label: "Hybrid" },
                  ]}
                />

                <CustomInput
                  label="Số lượng cần tuyển"
                  required
                  type="number"
                  min={1}
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                />
              </div>

              {/* Row 4: Min Salary, Max Salary, Application Deadline, Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                <CustomInput
                  label="Lương tối thiểu (USD)"
                  required
                  type="number"
                  placeholder="VD: 1000"
                  value={minimumSalary}
                  onChange={(e) =>
                    setMinimumSalary(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />

                <CustomInput
                  label="Lương tối đa (USD)"
                  required
                  type="number"
                  placeholder="VD: 2500"
                  value={maximumSalary}
                  onChange={(e) =>
                    setMaximumSalary(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />

                {/* Application Deadline */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Hạn nộp hồ sơ
                  </label>
                  <CustomDatePicker
                    value={applicationDeadline}
                    onChange={(val) => setApplicationDeadline(val)}
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                <CustomSelect
                  label="Mức độ ưu tiên"
                  value={priority}
                  onChange={(val) => setPriority(val as JobPriority)}
                  options={[
                    { value: JobPriority.LOW, label: "Thấp" },
                    { value: JobPriority.MEDIUM, label: "Bình thường" },
                    { value: JobPriority.HIGH, label: "Gấp" },
                  ]}
                />
              </div>

              {/* Redesigned Interviewers Section */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Người phỏng vấn (Có thể chọn nhiều nhân sự thuộc phòng ban)
                </label>
                <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/60 space-y-3">
                  {!departmentId ? (
                    <p className="text-xs text-gray-400 italic text-center py-2">
                      Vui lòng chọn Phòng ban ở trên để hiển thị danh sách nhân sự phỏng vấn
                    </p>
                  ) : filteredEmployees.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-2">
                      Phòng ban này chưa có nhân sự phỏng vấn được thiết lập
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredEmployees.map((emp) => {
                        const isSelected = selectedInterviewerIds.includes(emp._id)
                        return (
                          <button
                            key={emp._id}
                            type="button"
                            onClick={() => handleToggleInterviewer(emp._id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span>{emp.name}</span>
                            <span
                              className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {getRoleLabel(emp.role)}
                            </span>
                            {isSelected && <Check size={14} />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Tags Bar */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Kỹ năng gợi ý theo vị trí
                </label>
                <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/60 space-y-3">
                  {!positionId ? (
                    <p className="text-xs text-gray-400 italic text-center py-2">
                      Chọn Vị trí tuyển dụng ở trên để hiển thị các thẻ kỹ năng gợi ý
                    </p>
                  ) : filteredSkills.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-2">
                      Vị trí này chưa có bộ kỹ năng mẫu
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredSkills.map((sk) => {
                        const isSelected = selectedSkills.includes(sk._id)
                        return (
                          <button
                            key={sk._id}
                            type="button"
                            onClick={() => handleToggleSkill(sk._id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {sk.name}
                            {isSelected && <Check size={14} />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Criteria Weighting Manager (Streamlined with Gemini AI & Equal Split) */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <SlidersHorizontal size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Cấu hình Tiêu chí Đánh giá
                      </h3>
                      <p className="text-xs text-gray-500">
                        Thiết lập các tiêu chí chuyên môn và phân bổ trọng số (Tổng trọng số bắt
                        buộc = 100%).
                      </p>
                    </div>
                  </div>

                  {/* Streamlined Weight Assistant Buttons Group */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Google Gemini AI Weight Suggestion Button */}
                    <button
                      type="button"
                      onClick={handleAiSuggestWeights}
                      disabled={criteria.length === 0 || isAiSuggesting}
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border border-purple-400/30 disabled:opacity-40"
                      title="Gemini AI phân tích vị trí và kinh nghiệm để tự động gợi ý trọng số tối ưu"
                    >
                      {isAiSuggesting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          AI đang phân tích...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-amber-300 animate-pulse" />
                          AI Gợi ý Trọng số
                        </>
                      )}
                    </button>

                    {/* Equal Split Button */}
                    <button
                      type="button"
                      onClick={handleEqualSplitWeights}
                      disabled={criteria.length === 0}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                      title="Chia đều phần trăm cho tất cả các tiêu chí"
                    >
                      <RefreshCw size={13} />
                      Chia đều %
                    </button>

                    {/* Weight Total Progress Indicator Badge */}
                    <div
                      className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 border ${
                        totalWeight === 100
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {totalWeight === 100 ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-600" />
                      )}
                      <span>Tổng: {totalWeight}% / 100%</span>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning Callout Box */}
                {aiReasoning && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl flex items-start gap-3 text-xs text-indigo-950 shadow-2xs animate-in fade-in duration-300">
                    <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0 shadow-xs">
                      <Sparkles size={16} />
                    </div>
                    <div className="space-y-1">
                      <span className="font-extrabold uppercase tracking-wider block text-purple-900 flex items-center gap-1">
                        Phân tích & Lý giải từ Google Gemini AI
                      </span>
                      <p className="text-slate-700 leading-relaxed font-medium">{aiReasoning}</p>
                    </div>
                  </div>
                )}

                {/* Benchmark Reference Hint Box */}
                <CriteriaBenchmarkHint
                  position={selectedPosition}
                  positionTitle={title}
                  totalCriteriaCount={criteria.length}
                />

                {/* Criteria Table */}
                <div className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {criteria.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-xs italic space-y-3">
                      <p>
                        Chưa có tiêu chí nào. Bấm nút bên dưới để tạo tiêu chí đánh giá cho AI
                        Matching.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddCriteriaRow}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus size={15} />
                        Thêm tiêu chí mới
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-5">Tên tiêu chí / Kỹ năng</div>
                        <div className="col-span-4">Loại yêu cầu đánh giá</div>
                        <div className="col-span-2 text-center">Trọng số (%)</div>
                        <div className="col-span-1 text-center">Xóa</div>
                      </div>

                      {/* Rows */}
                      {criteria.map((item, idx) => {
                        const softWarning = getCriteriaSoftWarning(item, idx)

                        return (
                          <div
                            key={idx}
                            className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-gray-50/50 transition-colors"
                          >
                            {/* Name & Soft Warnings */}
                            <div className="col-span-5 space-y-1">
                              <input
                                type="text"
                                placeholder="VD: ReactJS, TypeScript, 3+ năm kinh nghiệm..."
                                value={item.name}
                                onChange={(e) => handleUpdateCriteria(idx, 'name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                              />

                              {/* Real-time Soft Warning Badge */}
                              {softWarning && (
                                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-lg block">
                                  {softWarning}
                                </span>
                              )}
                            </div>

                            {/* Requirement Type (Simplified to 2 Levels) */}
                            <div className="col-span-4">
                              <select
                                value={item.requirementType}
                                onChange={(e) =>
                                  handleUpdateCriteria(
                                    idx,
                                    'requirementType',
                                    e.target.value as CriteriaRequirementType
                                  )
                                }
                                className={`w-full px-3.5 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                                  item.requirementType === CriteriaRequirementType.MANDATORY
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : 'bg-blue-50 border-blue-200 text-blue-700'
                                }`}
                              >
                                <option value={CriteriaRequirementType.MANDATORY}>
                                  🔴 Bắt buộc (Gắn cờ cảnh báo nếu thiếu)
                                </option>
                                <option value={CriteriaRequirementType.PREFERRED}>
                                  🔵 Ưu tiên (Tính điểm cộng)
                                </option>
                              </select>
                            </div>

                            {/* Weight & Inline Progress Bar */}
                            <div className="col-span-2 flex flex-col items-center justify-center">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={item.weight}
                                  onChange={(e) =>
                                    handleUpdateCriteria(
                                      idx,
                                      'weight',
                                      Math.max(0, Math.min(100, Number(e.target.value)))
                                    )
                                  }
                                  className="w-20 px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs font-extrabold text-center text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                                />
                                <span className="text-xs font-bold text-gray-500 ml-1">%</span>
                              </div>

                              {/* Inline Visual Progress Bar */}
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    item.weight > 50
                                      ? 'bg-amber-500'
                                      : item.requirementType === CriteriaRequirementType.MANDATORY
                                        ? 'bg-rose-500'
                                        : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min(100, item.weight)}%` }}
                                />
                              </div>
                            </div>

                            {/* Delete */}
                            <div className="col-span-1 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveCriteria(idx)}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                title="Xóa tiêu chí"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Table Footer Controls */}
                  {criteria.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddCriteriaRow}
                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus size={15} />
                        Thêm tiêu chí khác
                      </button>

                      <div className="text-xs font-semibold text-gray-500">
                        Tổng số tiêu chí:{' '}
                        <span className="font-bold text-gray-900">{criteria.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job Description Content (Upgraded with AI Content Generation) */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Section Top Header & AI Auto Generate Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Chi tiết nội dung Mô tả công việc
                    </h3>
                    <p className="text-xs text-gray-500">
                      Nêu rõ trách nhiệm công việc, yêu cầu ứng viên và chính sách đãi ngộ.
                    </p>
                  </div>
                </div>

                {/* AI Auto-Generate All JD Content Button */}
                <button
                  type="button"
                  onClick={() => handleAiGenerateJdContent('all')}
                  disabled={isAiGeneratingContent}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm border border-purple-400/30 disabled:opacity-40"
                  title="Gemini AI tự động phân tích thông tin Bước 1 để soạn thảo Mô tả, Yêu cầu & Quyền lợi chuẩn mực"
                >
                  {isAiGeneratingContent && aiGeneratingSection === 'all' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Gemini AI đang viết nội dung...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-amber-300 animate-pulse" />
                      AI Tự Động Soạn Thảo Toàn Bộ JD
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <CustomTextarea
                label="Mô tả công việc"
                required
                rows={7}
                placeholder="Mô tả chi tiết nhiệm vụ hàng ngày, quy trình làm việc, sản phẩm phát triển..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Requirements */}
              <CustomTextarea
                label="Yêu cầu ứng viên"
                required
                rows={7}
                placeholder="Kinh nghiệm chuyên môn tối thiểu, bằng cấp, ngoại ngữ, kỹ năng làm việc nhóm..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />

              {/* Benefits */}
              <CustomTextarea
                label="Quyền lợi đãi ngộ"
                required
                rows={6}
                placeholder="Lương thưởng hấp dẫn, bảo hiểm sức khỏe, máy tính làm việc, du lịch hàng năm..."
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
              />
            </div>
          )}

          {/* Step 3: Pipeline & Final Settings */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Quy trình Tuyển dụng & Trạng thái Khởi tạo
                  </h3>
                  <p className="text-xs text-gray-500">
                    Lựa chọn Mẫu Pipeline phỏng vấn và trạng thái phê duyệt khởi tạo.
                  </p>
                </div>
              </div>

              {/* Pipeline template select & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomSelect
                  label="Mẫu Quy trình phỏng vấn"
                  required
                  value={selectedPipelineTemplateId}
                  onChange={(val) => handlePipelineTemplateChange(val)}
                  placeholder="-- Chọn Mẫu Pipeline --"
                  options={[
                    { value: "", label: "-- Chọn Mẫu Pipeline --" },
                    ...pipelineTemplates.map((t) => ({
                      value: t._id,
                      label: `${t.name} (${t.stages.length} giai đoạn)`,
                    })),
                  ]}
                />

                <CustomSelect
                  label="Trạng thái yêu cầu"
                  value={isDeptManager ? JobStatus.PENDING : status}
                  onChange={(val) => setStatus(val as JobStatus)}
                  isLocked={isDeptManager}
                  disabled={isDeptManager}
                  options={[
                    { value: JobStatus.PENDING, label: "Chờ duyệt" },
                    ...(!isDeptManager ? [
                      { value: JobStatus.APPROVED, label: "Đã duyệt" },
                      { value: JobStatus.REJECTED, label: "Từ chối" },
                      { value: JobStatus.JD_CREATED, label: "Đã tạo JD" },
                      { value: JobStatus.COMPLETED, label: "Hoàn thành" },
                    ] : []),
                  ]}
                />
              </div>

              {/* Pipeline Stage Preview */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                  Các bước trong Quy trình Tuyển dụng đã chọn
                </span>

                {pipelineStages.length === 0 ? (
                  <div className="p-10 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs italic">
                    Vui lòng chọn mẫu pipeline ở trên để hiển thị danh sách các bước phỏng vấn
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pipelineStages.map((stg, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50/80 border border-gray-100 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-gray-800">{stg.name}</span>
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/5"
                            style={{ backgroundColor: stg.color }}
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveStage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 text-gray-400 hover:text-gray-800 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-white"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveStage(idx, 'down')}
                            disabled={idx === pipelineStages.length - 1}
                            className="p-1.5 text-gray-400 hover:text-gray-800 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-white"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStage(idx)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 cursor-pointer rounded-lg hover:bg-rose-50 ml-1"
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
        </div>

        {/* Integrated Sticky Action Footer Bar (Directly Attached to Form Card Bottom) */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 md:px-8 flex items-center justify-between shadow-md z-30">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              Quay lại (Bước {step - 1})
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-sm rounded-xl transition-all cursor-pointer border border-gray-200"
            >
              Hủy thay đổi
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Tiếp theo (Bước {step + 1})
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2.5 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang lưu yêu cầu...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {mode === 'create' ? 'Tạo Yêu Cầu Tuyển Dụng' : 'Cập Nhật Yêu Cầu Tuyển Dụng'}
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
          setIsUnsavedModalOpen(false)
          isSubmittedRef.current = true
          router.push(pendingUrl || '/job-description')
        }}
      />
    </div>
  )
}
