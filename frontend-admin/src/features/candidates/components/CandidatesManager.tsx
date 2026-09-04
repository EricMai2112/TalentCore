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
  AlertTriangle
} from 'lucide-react'
import { CandidateApplication } from '../types/candidate.types'
import { candidateApi } from '../services/candidate.api'
import { departmentApi } from '@/src/features/departments/services/department.api'
import { Department } from '@/src/features/departments/types/department.types'
import { useAuth } from '@/src/providers/AuthProvider'
import { UserRole } from '@/src/features/users/types/user.types'
import CandidateDetailModal from './CandidateDetailModal'
import CandidateNotesModal from './CandidateNotesModal'
import RejectConfirmModal from './RejectConfirmModal'
import CustomSelect, { CustomSelectOption } from '@/src/components/common/CustomSelect'

export default function CandidatesManager() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedStage, setSelectedStage] = useState('')

  // Modals state
  const [detailApp, setDetailApp] = useState<CandidateApplication | null>(null)
  const [notesApp, setNotesApp] = useState<CandidateApplication | null>(null)
  const [rejectApp, setRejectApp] = useState<CandidateApplication | null>(null)

  // Auto dismiss notification toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Check if logged in user is Employee or Department Manager
  const isRestrictedDept =
    user?.role === UserRole.EMPLOYEE || user?.role === UserRole.DEPARTMENT_MANAGER

  const userDeptId = useMemo(() => {
    if (!user?.departmentId) return ''
    return typeof user.departmentId === 'object' ? user.departmentId._id : user.departmentId
  }, [user])

  // Fetch departments & initial load
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const list = await departmentApi.getAll()
        setDepartments(list || [])
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phòng ban:', err)
      }
    }
    fetchDepartments()
  }, [])

  // Initialize department filter for restricted roles
  useEffect(() => {
    if (isRestrictedDept && userDeptId) {
      setSelectedDepartmentId(userDeptId)
    }
  }, [isRestrictedDept, userDeptId])

  // Load candidate applications
  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const data = await candidateApi.getCandidates({
        departmentId: selectedDepartmentId || undefined,
        search: searchQuery || undefined
      })
      setApplications(data || [])
    } catch (err) {
      console.error('Lỗi lấy danh sách ứng viên:', err)
      setToast({ message: 'Không thể tải danh sách ứng viên', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [selectedDepartmentId])

  // Department options for CustomSelect
  const departmentSelectOptions: CustomSelectOption[] = useMemo(() => {
    const opts: CustomSelectOption[] = []
    if (!isRestrictedDept) {
      opts.push({ value: '', label: 'Tất cả phòng ban' })
    }
    departments.forEach((dept) => {
      opts.push({ value: dept._id, label: dept.name })
    })
    return opts
  }, [departments, isRestrictedDept])

  // Extract position options from loaded applications & job descriptions
  const positionSelectOptions: CustomSelectOption[] = useMemo(() => {
    const titles = new Set<string>()
    applications.forEach((app) => {
      if (app.jobDescriptionId?.title) {
        titles.add(app.jobDescriptionId.title)
      }
    })
    const opts: CustomSelectOption[] = [{ value: '', label: 'Tất cả vị trí' }]
    Array.from(titles).forEach((t) => {
      opts.push({ value: t, label: t })
    })
    return opts
  }, [applications])

  // Extract stage options
  const stageSelectOptions: CustomSelectOption[] = useMemo(() => {
    const stages = new Set<string>()
    applications.forEach((app) => {
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
  }, [applications])

  // Client-side filtering for search, position, stage
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
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
  }, [applications, searchQuery, selectedPosition, selectedStage])

  const getAiScoreBadge = (score?: number | null) => {
    if (score === null || score === undefined) {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500">
          N/A
        </span>
      )
    }
    if (score >= 80) {
      return (
        <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-700">
          {score}/100
        </span>
      )
    }
    if (score >= 50) {
      return (
        <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-100 text-amber-700">
          {score}/100
        </span>
      )
    }
    return (
      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-rose-100 text-rose-700">
        {score}/100
      </span>
    )
  }

  const getStageBadge = (app: CandidateApplication) => {
    const s = app.stageName || (app as any).currentStage?.name || 'Mới'
    const customColor = app.stageColor || (app as any).currentStage?.color

    let style = 'bg-slate-100 text-slate-700 border-slate-200'
    let dotColor = 'bg-slate-500'

    const sLower = s.toLowerCase()
    if (sLower.includes('tech')) {
      style = 'bg-blue-50 text-blue-600 border-blue-200'
      dotColor = 'bg-blue-500'
    } else if (sLower.includes('phone')) {
      style = 'bg-purple-50 text-purple-600 border-purple-200'
      dotColor = 'bg-purple-500'
    } else if (sLower.includes('culture') || sLower.includes('văn hóa')) {
      style = 'bg-cyan-50 text-cyan-600 border-cyan-200'
      dotColor = 'bg-cyan-500'
    } else if (sLower.includes('offer')) {
      style = 'bg-emerald-50 text-emerald-600 border-emerald-200'
      dotColor = 'bg-emerald-500'
    } else if (sLower.includes('từ chối') || sLower.includes('reject')) {
      style = 'bg-rose-50 text-rose-600 border-rose-200'
      dotColor = 'bg-rose-500'
    } else if (sLower.includes('sàng lọc') || sLower.includes('filter')) {
      style = 'bg-amber-50 text-amber-600 border-amber-200'
      dotColor = 'bg-amber-500'
    } else if (sLower.includes('mới') || sLower.includes('new')) {
      style = 'bg-slate-100 text-slate-700 border-slate-200'
      dotColor = 'bg-slate-500'
    } else if (customColor) {
      return (
        <span
          style={{
            backgroundColor: `${customColor}15`,
            borderColor: `${customColor}40`,
            color: customColor
          }}
          className="px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5"
        >
          <span style={{ backgroundColor: customColor }} className="w-1.5 h-1.5 rounded-full" />
          <span>{s}</span>
        </span>
      )
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${style}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span>{s}</span>
      </span>
    )
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
    <div className="p-2 mx-auto space-y-4 overflow-x-hidden md:p-2 max-w-7xl text-slate-900">
      {/* Floating Notification Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-900 text-white border-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={18} className="text-rose-400" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý ứng viên</h1>
        <p className="mt-1 text-xs font-medium text-slate-400">
          {filteredApplications.length} ứng viên trong hệ thống
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Candidate Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm ứng viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
          />
          <Search
            size={16}
            className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Right Controls: CustomSelect for Department, Position, Stage */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Department Select */}
          <CustomSelect
            value={selectedDepartmentId}
            onChange={setSelectedDepartmentId}
            options={departmentSelectOptions}
            placeholder="Tất cả phòng ban"
            disabled={isRestrictedDept}
            isLocked={isRestrictedDept}
            icon={<Building2 size={14} />}
          />

          {/* Position Select */}
          <CustomSelect
            value={selectedPosition}
            onChange={setSelectedPosition}
            options={positionSelectOptions}
            placeholder="Tất cả vị trí"
            icon={<Briefcase size={14} />}
          />

          {/* Stage Select with right alignment to prevent horizontal scroll */}
          <CustomSelect
            value={selectedStage}
            onChange={setSelectedStage}
            options={stageSelectOptions}
            placeholder="Tất cả giai đoạn"
            align="right"
            icon={<Layers size={14} />}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden bg-white border shadow-xs border-slate-100 rounded-3xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={32} className="mb-2 text-indigo-600 animate-spin" />
            <p className="text-xs font-medium">Đang tải dữ liệu ứng viên...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users size={40} className="mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy ứng viên nào</p>
            <p className="mt-1 text-xs text-slate-400">
              Thử thay đổi bộ lọc tìm kiếm hoặc phòng ban
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Ứng viên</th>
                  <th className="px-4 py-4">Vị trí</th>
                  <th className="px-4 py-4 text-center">AI Score</th>
                  <th className="px-4 py-4 text-center">Giai đoạn</th>
                  <th className="px-4 py-4">Người phụ trách</th>
                  <th className="px-4 py-4">Ngày ứng tuyển</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredApplications.map((app) => {
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
                    <tr key={app._id} className="transition-colors hover:bg-slate-50/80 group">
                      {/* Candidate Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 text-xs font-extrabold text-indigo-700 bg-indigo-100 rounded-full shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold transition-colors text-slate-900 group-hover:text-indigo-600">
                              {name}
                            </p>
                            <p className="text-slate-400 font-medium text-[11px] mt-0.5">{email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-4 py-4 font-medium text-slate-700">{position}</td>

                      {/* AI Score */}
                      <td className="px-4 py-4 text-center">{getAiScoreBadge(aiScore)}</td>

                      {/* Stage Badge */}
                      <td className="px-4 py-4 text-center">{getStageBadge(app)}</td>

                      {/* Person in charge */}
                      <td className="px-4 py-4 italic font-medium text-slate-600">
                        {interviewer === 'Chưa phân công' ? (
                          <span className="text-slate-400">{interviewer}</span>
                        ) : (
                          <span className="font-semibold text-slate-800">{interviewer}</span>
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="px-4 py-4 font-medium text-slate-500">{appliedDate}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Detail Modal */}
                          <button
                            type="button"
                            onClick={() => setDetailApp(app)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Notes Modal */}
                          <button
                            type="button"
                            onClick={() => setNotesApp(app)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer relative"
                            title="Ghi chú ứng viên"
                          >
                            <FileText size={16} />
                            {app.notes && app.notes.length > 0 && (
                              <span className="absolute w-2 h-2 bg-indigo-500 rounded-full top-1 right-1" />
                            )}
                          </button>

                          {/* Reject / Delete Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setRejectApp(app)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Từ chối ứng viên"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Detail Side Drawer Modal */}
      {detailApp && (
        <CandidateDetailModal application={detailApp} onClose={() => setDetailApp(null)} />
      )}

      {/* Candidate Notes Modal */}
      {notesApp && (
        <CandidateNotesModal
          application={notesApp}
          onClose={() => setNotesApp(null)}
          onNotesUpdated={(updatedApp) => {
            setApplications((prev) =>
              prev.map((item) => (item._id === updatedApp._id ? updatedApp : item))
            )
            setNotesApp(updatedApp)
          }}
        />
      )}

      {/* Reject Confirmation Modal */}
      {rejectApp && (
        <RejectConfirmModal
          application={rejectApp}
          onClose={() => setRejectApp(null)}
          onRejected={(appId) => {
            setApplications((prev) => prev.filter((item) => item._id !== appId))
            setToast({ message: 'Đã từ chối ứng viên thành công', type: 'success' })
          }}
        />
      )}
    </div>
  )
}
