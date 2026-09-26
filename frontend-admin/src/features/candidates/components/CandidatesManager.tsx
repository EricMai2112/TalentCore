'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Eye,
  FileText,
  XCircle,
  Building2,
  Briefcase,
  Layers,
  Loader2,
  Users,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { CandidateApplication } from '../types/candidate.types'
import { candidateApi } from '../services/candidate.api'
import { departmentApi } from '@/src/features/departments/services/department.api'
import { Department } from '@/src/features/departments/types/department.types'
import { useAuth } from '@/src/providers/AuthProvider'
import { UserRole } from '@/src/features/users/types/user.types'
import CandidateStatCards from './CandidateStatCards'
import {
  CustomSelect,
  CustomInput,
  CustomPagination,
  CustomTableContainer,
  CustomActionMenu,
  RejectCandidateModal,
  Toast,
  useToast
} from '@/src/components/common'
import { CustomSelectOption } from '@/src/components/common/CustomSelect'
import { CandidateStageBadge, CandidateAiScoreBadge } from './'

// Lazy load the heavy (43KB) CandidateDetailModal on demand
const CandidateDetailModal = dynamic(() => import('./CandidateDetailModal'), {
  ssr: false,
})

interface CandidatesManagerProps {
  /** Pre-fetched applications from the Server Component (SSR). */
  initialApplications?: CandidateApplication[]
  /** Pre-fetched departments from the Server Component (SSR). */
  initialDepartments?: Department[]
}

export default function CandidatesManager({
  initialApplications = [],
  initialDepartments = [],
}: CandidatesManagerProps) {
  const { user } = useAuth()
  const [applications, setApplications] = useState<CandidateApplication[]>(initialApplications)
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  // Start as not loading when initial data is provided via SSR
  const [isLoading, setIsLoading] = useState(initialApplications.length === 0)
  const { toast, showToast, hideToast } = useToast()

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedStage, setSelectedStage] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedDepartmentId, selectedPosition, selectedStage])

  // Modals state
  const [detailApp, setDetailApp] = useState<CandidateApplication | null>(null)
  const [rejectApp, setRejectApp] = useState<CandidateApplication | null>(null)

  // Check if logged in user is Employee or Department Manager
  const isRestrictedDept =
    user?.role === UserRole.EMPLOYEE || user?.role === UserRole.DEPARTMENT_MANAGER

  const userDeptId = useMemo(() => {
    if (!user?.departmentId) return ''
    return typeof user.departmentId === 'object' ? user.departmentId._id : user.departmentId
  }, [user])

  // Fetch departments only if not provided via SSR
  useEffect(() => {
    if (initialDepartments.length > 0) return // Skip — already hydrated from SSR
    const fetchDepartments = async () => {
      try {
        const list = await departmentApi.getAll()
        setDepartments(list || [])
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phòng ban:', err)
      }
    }
    fetchDepartments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize department filter for restricted roles
  useEffect(() => {
    if (isRestrictedDept && userDeptId) {
      setSelectedDepartmentId(userDeptId)
    }
  }, [isRestrictedDept, userDeptId])

  // Load candidate applications — re-fetch when department filter changes (client-side filter change)
  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const activeDeptId = isRestrictedDept && userDeptId ? userDeptId : (selectedDepartmentId || undefined)
      const data = await candidateApi.getCandidates({
        departmentId: activeDeptId,
        search: searchQuery || undefined
      })
      setApplications(data || [])
    } catch (err) {
      console.error('Lỗi lấy danh sách ứng viên:', err)
      showToast('Không thể tải danh sách ứng viên', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Skip initial fetch if data was already provided via SSR
    if (initialApplications.length > 0 && selectedDepartmentId === '' && !isRestrictedDept) return
    fetchApplications()
  }, [selectedDepartmentId, isRestrictedDept, userDeptId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scope applications strictly for restricted department roles (e.g. Department Manager)
  const scopedApplications = useMemo(() => {
    if (isRestrictedDept && userDeptId) {
      return applications.filter((app) => {
        const job = app.jobDescriptionId
        const deptId = typeof job?.departmentId === 'object' ? job?.departmentId?._id : job?.departmentId
        if (deptId) {
          return deptId === userDeptId
        }
        return true
      })
    }
    return applications
  }, [applications, isRestrictedDept, userDeptId])

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('')
    if (!isRestrictedDept) {
      setSelectedDepartmentId('')
    }
    setSelectedPosition('')
    setSelectedStage('')
  }

  // Department options for CustomSelect
  const departmentSelectOptions: CustomSelectOption[] = useMemo(() => {
    const opts: CustomSelectOption[] = []
    if (!isRestrictedDept) {
      opts.push({ value: '', label: 'Tất cả phòng ban' })
      departments.forEach((dept) => {
        opts.push({ value: dept._id, label: dept.name })
      })
    } else {
      const myDept = departments.find((d) => d._id === userDeptId)
      opts.push({
        value: userDeptId,
        label: myDept ? myDept.name : 'Phòng ban của tôi'
      })
    }
    return opts
  }, [departments, isRestrictedDept, userDeptId])

  // Extract position options from loaded applications & job descriptions
  const positionSelectOptions: CustomSelectOption[] = useMemo(() => {
    const titles = new Set<string>()
    scopedApplications.forEach((app) => {
      if (app.jobDescriptionId?.title) {
        titles.add(app.jobDescriptionId.title)
      }
    })
    const opts: CustomSelectOption[] = [{ value: '', label: 'Tất cả vị trí' }]
    Array.from(titles).forEach((t) => {
      opts.push({ value: t, label: t })
    })
    return opts
  }, [scopedApplications])

  // Extract stage options
  const stageSelectOptions: CustomSelectOption[] = useMemo(() => {
    const stages = new Set<string>()
    scopedApplications.forEach((app) => {
      const sName = app.stageName || (app as any).currentStage?.name
      if (sName) {
        stages.add(sName)
      }
    })
    const opts: CustomSelectOption[] = [{ value: '', label: 'Tất cả giai đoạn' }]
    if (stages.size === 0) {
      ;['Mới', 'Sàng lọc', 'Phone', 'Tech', 'Culture Fit', 'Offer', 'Từ chối'].forEach((stg) => {
        opts.push({ value: stg, label: stg })
      })
    } else {
      Array.from(stages).forEach((stg) => {
        opts.push({ value: stg, label: stg })
      })
    }
    return opts
  }, [scopedApplications])

  // Client-side filtering for search, position, stage
  const filteredApplications = useMemo(() => {
    return scopedApplications.filter((app) => {
      const candidate = app.candidateId
      const u = candidate?.userId
      const name = u?.name || candidate?.fullName || candidate?.profileName || ''
      const email = u?.email || candidate?.email || ''
      const title = app.jobDescriptionId?.title || ''
      const stage = app.stageName || (app as any).currentStage?.name || ''

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchName = name.toLowerCase().includes(query)
        const matchEmail = email.toLowerCase().includes(query)
        const matchTitle = title.toLowerCase().includes(query)
        if (!matchName && !matchEmail && !matchTitle) return false
      }

      // Position filter
      if (selectedPosition && title !== selectedPosition) {
        return false
      }

      // Stage filter
      if (selectedStage && stage !== selectedStage) {
        return false
      }

      return true
    })
  }, [scopedApplications, searchQuery, selectedPosition, selectedStage])

  const getAiScoreBadge = (score?: number | null) => {
    return <CandidateAiScoreBadge score={score} />
  }

  const getStageBadge = (app: CandidateApplication) => {
    const stageName = app.stageName || (app as any).currentStage?.name
    const stageColor = app.stageColor || (app as any).currentStage?.color
    return <CandidateStageBadge stageName={stageName} stageColor={stageColor} />
  }

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'U'
    const parts = nameStr.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '2026-07-01'
    const d = new Date(dateStr)
    return d.toISOString().split('T')[0]
  }

  const getInterviewerName = (app: CandidateApplication) => {
    const job = app.jobDescriptionId
    if (job?.interviewerId?.name) return job.interviewerId.name
    if (job?.interviewerIds && job.interviewerIds.length > 0 && job.interviewerIds[0]?.name) {
      return job.interviewerIds[0].name
    }
    return 'Chưa phân công'
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={hideToast} position="bottom-right" />

      {/* Top Stat Cards Section */}
      <CandidateStatCards applications={scopedApplications} />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input for Candidate Name & Email & Position */}
          <div className="w-full sm:w-64 lg:w-72">
            <CustomInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm ứng viên..."
              icon={<Search size={15} />}
              className="!py-1.5 !rounded-xl text-xs"
            />
          </div>

          {/* Department Select */}
          <CustomSelect
            value={isRestrictedDept && userDeptId ? userDeptId : selectedDepartmentId}
            onChange={setSelectedDepartmentId}
            options={departmentSelectOptions}
            placeholder="Tất cả phòng ban"
            disabled={isRestrictedDept}
            isLocked={isRestrictedDept}
            icon={<Building2 size={14} />}
            size="sm"
            className="w-full sm:w-auto"
          />

          {/* Position Select */}
          <CustomSelect
            value={selectedPosition}
            onChange={setSelectedPosition}
            options={positionSelectOptions}
            placeholder="Tất cả vị trí"
            icon={<Briefcase size={14} />}
            size="sm"
            className="w-full sm:w-auto"
          />

          {/* Stage Select */}
          <CustomSelect
            value={selectedStage}
            onChange={setSelectedStage}
            options={stageSelectOptions}
            placeholder="Tất cả giai đoạn"
            icon={<Layers size={14} />}
            size="sm"
            className="w-full sm:w-auto"
          />

          {/* Reset Filters Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 rounded-xl border border-white/80 bg-white/60 hover:bg-white text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
            title="Đặt lại tất cả bộ lọc"
          >
            <RotateCcw size={14} />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Reusable Glassmorphism Table Section */}
      <CustomTableContainer
        pagination={{
          currentPage,
          totalPages: Math.ceil(filteredApplications.length / pageSize),
          totalItems: filteredApplications.length,
          pageSize,
          onPageChange: setCurrentPage
        }}
        isLoading={isLoading}
        loadingMessage="Đang tải dữ liệu ứng viên..."
        isEmpty={filteredApplications.length === 0}
        emptyTitle="Không tìm thấy ứng viên nào"
        emptyDescription="Thử điều chỉnh bộ lọc tìm kiếm hoặc vị trí phía trên"
        emptyIcon={<Users className="w-8 h-8 stroke-[1.5]" />}
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
            <tr className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="px-5 py-3.5">Ứng viên</th>
              <th className="px-4 py-3.5">Vị trí</th>
              <th className="px-4 py-3.5 text-center">AI Score</th>
              <th className="px-4 py-3.5 text-center">Giai đoạn</th>
              <th className="px-4 py-3.5">Người phụ trách</th>
              <th className="px-4 py-3.5">Ngày ứng tuyển</th>
              <th className="px-5 py-3.5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/40">
            {filteredApplications
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((app, idx) => {
                const candidate = app.candidateId
                const u = candidate?.userId
                const name =
                  u?.name || candidate?.fullName || candidate?.profileName || 'Ứng viên'
                const email = u?.email || candidate?.email || 'Chưa có email'
                const position = app.jobDescriptionId?.title || 'Vị trí tuyển dụng'
                const aiScore = app.aiFitScore ?? app.aiEvaluation?.aiFitScore
                const interviewer = getInterviewerName(app)
                const appliedDate = formatDate(app.appliedAt)
                const initials = getInitials(name)

                return (
                  <tr
                    key={app._id}
                    className={`hover:bg-white/50 transition-all duration-150 group border-b border-slate-200/40 ${
                      idx % 2 === 0 ? '' : 'bg-white/15'
                    }`}
                  >
                    {/* Candidate Name & Avatar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl font-black bg-blue-500/10 text-[#3B82F6] border border-blue-200/60 flex items-center justify-center shrink-0 text-xs shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 group-hover:text-[#3B82F6] transition-colors truncate">
                            {name}
                          </p>
                          <p className="text-slate-400 font-medium text-[11px] truncate">{email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="px-4 py-4 font-semibold text-slate-700 text-[13px]">{position}</td>

                    {/* AI Score */}
                    <td className="px-4 py-4 text-center">{getAiScoreBadge(aiScore)}</td>

                    {/* Stage Badge */}
                    <td className="px-4 py-4 text-center">{getStageBadge(app)}</td>

                    {/* Person in charge */}
                    <td className="px-4 py-4 font-medium text-slate-600 text-[13px]">
                      {interviewer === 'Chưa phân công' ? (
                        <span className="text-slate-400 italic">{interviewer}</span>
                      ) : (
                        <span className="font-semibold text-slate-800">{interviewer}</span>
                      )}
                    </td>

                    {/* Applied Date */}
                    <td className="px-4 py-4 font-medium text-slate-500 text-xs">{appliedDate}</td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <CustomActionMenu
                          menuWidthClass="min-w-[190px]"
                          items={[
                            {
                              id: 'view_detail',
                              label: 'Xem chi tiết',
                              icon: <Eye size={14} />,
                              variant: 'primary',
                              onClick: () => setDetailApp(app),
                            },
                            {
                              id: 'reject_candidate',
                              label: 'Từ chối ứng viên',
                              icon: <XCircle size={14} />,
                              variant: 'danger',
                              onClick: () => setRejectApp(app),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </CustomTableContainer>

      {/* Candidate Detail Side Drawer Modal */}
      {detailApp && (
        <CandidateDetailModal application={detailApp} onClose={() => setDetailApp(null)} />
      )}

      {/* Reject Confirmation Modal */}
      {rejectApp && (
        <RejectCandidateModal
          isOpen={!!rejectApp}
          onClose={() => setRejectApp(null)}
          applicationId={rejectApp._id}
          candidateName={
            typeof rejectApp.candidateId === 'object'
              ? rejectApp.candidateId?.userId?.name ||
                rejectApp.candidateId?.fullName ||
                (rejectApp.candidateId?.profileName && rejectApp.candidateId?.profileName !== 'Hồ sơ của tôi'
                  ? rejectApp.candidateId?.profileName
                  : 'Ứng viên')
              : 'Ứng viên'
          }
          jobTitle={
            typeof rejectApp.jobDescriptionId === 'object'
              ? rejectApp.jobDescriptionId?.title
              : 'Vị trí tuyển dụng'
          }
          onSuccess={() => {
            setApplications((prev) => prev.filter((item) => item._id !== rejectApp._id))
            showToast('Đã từ chối ứng viên thành công', 'success')
          }}
        />
      )}
    </div>
  )
}

