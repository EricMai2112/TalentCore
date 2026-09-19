'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  CheckCheck,
  Briefcase,
  CheckCircle2,
  MoreVertical,
  FileText,
  Clock,
  XCircle,
  Award,
  Search,
  RotateCcw
} from 'lucide-react'
import { JobDescription, JobStatus, JobPriority, Department } from '../types/job-description.types'
import { CustomSelect, CustomPagination, CustomButton, CustomInput } from '@/src/components/common'
import JobRequestStatCards from './JobRequestStatCards'

interface JobRequestTableProps {
  jobs: JobDescription[]
  departments: Department[]
  onEdit: (job: JobDescription) => void
  onDelete: (job: JobDescription) => void
  onView: (job: JobDescription) => void
  onReview: (job: JobDescription) => void
  onPromote: (job: JobDescription) => void
  onComplete: (job: JobDescription) => void
  onAdd: () => void
  isHrAdmin?: boolean
  isDeptManager?: boolean
  userDeptId?: string
}

export default function JobRequestTable({
  jobs,
  departments,
  onEdit,
  onDelete,
  onView,
  onReview,
  onPromote,
  onComplete,
  onAdd,
  isHrAdmin = true,
  isDeptManager = false,
  userDeptId = ''
}: JobRequestTableProps) {
  const [selectedDept, setSelectedDept] = useState(isDeptManager && userDeptId ? userDeptId : 'all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDept, selectedStatus, selectedPriority, searchTerm])

  const handleResetFilters = () => {
    setSelectedDept(isDeptManager && userDeptId ? userDeptId : 'all')
    setSelectedStatus('all')
    setSelectedPriority('all')
    setSearchTerm('')
  }

  // Portal & Floating Popover state
  const [mounted, setMounted] = useState(false)
  const [activeMenu, setActiveMenu] = useState<{
    job: JobDescription
    rect: DOMRect
  } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isDeptManager && userDeptId) {
      setSelectedDept(userDeptId)
    }
  }, [isDeptManager, userDeptId])

  // Close floating menu on window scroll or resize
  useEffect(() => {
    if (!activeMenu) return
    const handleClose = () => setActiveMenu(null)
    window.addEventListener('scroll', handleClose, true)
    window.addEventListener('resize', handleClose)
    return () => {
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
    }
  }, [activeMenu])

  // Toggle action menu with precise button coordinates
  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, job: JobDescription) => {
    e.stopPropagation()
    if (activeMenu?.job._id === job._id) {
      setActiveMenu(null)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      setActiveMenu({ job, rect })
    }
  }

  // Status mapping to label, classes, and status dot color
  const getStatusConfig = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return {
          label: 'Chờ duyệt',
          style: 'bg-amber-500/15 text-amber-700 border-amber-300/50',
          dot: 'bg-amber-500'
        }
      case JobStatus.APPROVED:
        return {
          label: 'Đã duyệt',
          style: 'bg-teal-500/15 text-teal-700 border-teal-300/50',
          dot: 'bg-teal-500'
        }
      case JobStatus.REJECTED:
        return {
          label: 'Từ chối',
          style: 'bg-rose-500/15 text-rose-700 border-rose-300/50',
          dot: 'bg-rose-500'
        }
      case JobStatus.COMPLETED:
        return {
          label: 'Hoàn thành',
          style: 'bg-blue-500/15 text-blue-700 border-blue-300/50',
          dot: 'bg-blue-500'
        }
      case JobStatus.JD_CREATED:
      default:
        return {
          label: 'Đã tạo JD',
          style: 'bg-violet-500/15 text-violet-700 border-violet-300/50',
          dot: 'bg-violet-500'
        }
    }
  }

  // Priority mapping to label and classes
  const getPriorityConfig = (priority: JobPriority) => {
    switch (priority) {
      case JobPriority.HIGH:
        return { label: '▲ Gấp', style: 'bg-rose-500/15 text-rose-700 border-rose-300/50' }
      case JobPriority.LOW:
        return { label: 'Thấp', style: 'bg-slate-500/10 text-slate-600 border-slate-300/40' }
      case JobPriority.MEDIUM:
      default:
        return { label: 'Bình thường', style: 'bg-blue-500/15 text-blue-700 border-blue-300/50' }
    }
  }

  // Scope jobs list for metrics and display if user is Department Manager
  const scopedJobs = jobs.filter((job) => {
    if (isDeptManager && userDeptId) {
      const deptId = typeof job.departmentId === 'object' ? job.departmentId?._id : job.departmentId
      if (deptId !== userDeptId) return false
    }
    return true
  })

  // Filtering logic with character-by-character search on job title & department name
  const filteredJobs = scopedJobs.filter((job) => {
    const deptId = typeof job.departmentId === 'object' ? job.departmentId?._id : job.departmentId
    const deptName = typeof job.departmentId === 'object' ? job.departmentId?.name || '' : ''
    const title = job.title || ''

    const matchDept = selectedDept === 'all' || deptId === selectedDept
    const matchStatus = selectedStatus === 'all' || job.status === selectedStatus
    const matchPriority = selectedPriority === 'all' || job.priority === selectedPriority

    const query = searchTerm.trim().toLowerCase()
    const matchSearch =
      !query || title.toLowerCase().includes(query) || deptName.toLowerCase().includes(query)

    return matchDept && matchStatus && matchPriority && matchSearch
  })

  return (
    <div className="space-y-5">
      {/* Metrics Row - Componentized & Redesigned Glassmorphism Cards */}
      <JobRequestStatCards
        jobs={scopedJobs}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      {/* Filters Bar with Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input for Job Title & Department Name */}
          <div className="w-full sm:w-64 lg:w-72">
            <CustomInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo vị trí, phòng ban..."
              icon={<Search size={15} />}
              className="!py-1.5 !rounded-xl text-xs"
            />
          </div>

          <CustomSelect
            value={isDeptManager && userDeptId ? userDeptId : selectedDept}
            onChange={(val) => setSelectedDept(val)}
            isLocked={isDeptManager}
            disabled={isDeptManager}
            size="sm"
            className="w-full sm:w-auto"
            placeholder="Tất cả phòng ban"
            options={[
              ...(!isDeptManager ? [{ value: 'all', label: 'Tất cả phòng ban' }] : []),
              ...departments.map((dept) => ({
                value: dept._id,
                label: dept.name
              }))
            ]}
          />

          <CustomSelect
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            size="sm"
            className="w-full sm:w-auto"
            placeholder="Tất cả trạng thái"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: JobStatus.PENDING, label: 'Chờ duyệt' },
              { value: JobStatus.APPROVED, label: 'Đã duyệt' },
              { value: JobStatus.REJECTED, label: 'Từ chối' },
              { value: JobStatus.JD_CREATED, label: 'Đã tạo JD' },
              { value: JobStatus.COMPLETED, label: 'Hoàn thành' }
            ]}
          />

          <CustomSelect
            value={selectedPriority}
            onChange={(val) => setSelectedPriority(val)}
            size="sm"
            className="w-full sm:w-auto"
            placeholder="Tất cả ưu tiên"
            options={[
              { value: 'all', label: 'Tất cả ưu tiên' },
              { value: JobPriority.HIGH, label: 'Gấp' },
              { value: JobPriority.MEDIUM, label: 'Bình thường' },
              { value: JobPriority.LOW, label: 'Thấp' }
            ]}
          />

          {/* Reset Filters Button - Always Visible */}
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

        <CustomButton
          onClick={onAdd}
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          className="ml-auto sm:ml-0 shrink-0 font-bold"
        >
          Tạo yêu cầu mới
        </CustomButton>
      </div>

      {/* Table grid */}
      <div className="overflow-hidden bg-white/20 border border-white/60 shadow-xl shadow-blue-500/5 rounded-2xl transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/60 bg-white/30 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Vị trí tuyển dụng</th>
                <th className="px-4 py-3.5">Phòng ban</th>
                <th className="px-4 py-3.5 text-center">Số lượng</th>
                <th className="px-4 py-3.5">Mức ưu tiên</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Người yêu cầu</th>
                <th className="px-4 py-3.5">Ngày tạo</th>
                <th className="px-5 py-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filteredJobs.length === 0 ? (
                <tr className="border-b border-slate-100/70 bg-white/60">
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Briefcase size={36} className="text-slate-300 stroke-[1.5]" />
                      <p className="text-sm font-bold text-slate-700">
                        Không tìm thấy yêu cầu tuyển dụng nào
                      </p>
                      <p className="text-xs text-slate-400">
                        Thử điều chỉnh bộ lọc trạng thái hoặc phòng ban phía trên
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((job) => {
                    const deptName =
                      typeof job.departmentId === 'object' ? job.departmentId?.name : 'Chưa rõ'
                    const postedByName =
                      typeof job.postedById === 'object' ? job.postedById?.name : 'Tuyển dụng'
                    const statusConf = getStatusConfig(job.status)
                    const priorityConf = getPriorityConfig(job.priority)
                    const createdDate = job.createdAt
                      ? new Date(job.createdAt).toISOString().split('T')[0]
                      : ''
                    const isMenuOpen = activeMenu?.job._id === job._id

                    return (
                      <tr
                        key={job._id}
                        className="hover:bg-white/40 transition-all duration-150 group border-b border-slate-100/70"
                      >
                        {/* Job Title & Details */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/80 border border-white text-[#3B82F6] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3B82F6] group-hover:text-white group-hover:border-[#3B82F6] transition-all duration-200">
                              <Briefcase size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 group-hover:text-[#3B82F6] transition-colors text-xs block truncate">
                                {job.title}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium block truncate mt-0.5">
                                {(job.minimumSalary === 0 && job.maximumSalary === 0) || (!job.minimumSalary && !job.maximumSalary)
                                  ? 'Thỏa thuận'
                                  : `${(job.minimumSalary ?? 0).toLocaleString('vi-VN')} - ${(job.maximumSalary ?? 0).toLocaleString('vi-VN')} VNĐ`
                                } · {job.location}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5 font-semibold text-slate-700 text-xs">
                          {deptName}
                        </td>

                        {/* Headcount */}
                        <td className="px-4 py-3.5 text-center">{job.headcount}</td>

                        {/* Priority */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold shadow-2xs ${priorityConf.style}`}
                          >
                            {priorityConf.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold shadow-2xs ${statusConf.style}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusConf.dot} shrink-0`}
                            />
                            {statusConf.label}
                          </span>
                        </td>

                        {/* Requester */}
                        <td className="px-4 py-3.5 text-slate-700 font-semibold text-xs">
                          {postedByName}
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-3.5 text-slate-400 font-medium text-xs">
                          {createdDate}
                        </td>

                        {/* Actions Button */}
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={(e) => handleToggleMenu(e, job)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                isMenuOpen
                                  ? 'bg-[#3B82F6] text-white shadow-xs'
                                  : 'text-slate-400 hover:text-[#3B82F6] hover:bg-white/80 hover:border hover:border-white shadow-2xs'
                              }`}
                              title="Thao tác"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Table Pagination */}
        <CustomPagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredJobs.length / pageSize)}
          totalItems={filteredJobs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Floating Action Menu Portal (Rendered at document.body level - Bypasses table overflow & clipping) */}
      {mounted &&
        activeMenu &&
        createPortal(
          <>
            {/* Backdrop to close menu when clicking outside */}
            <div className="fixed inset-0 z-[9998]" onClick={() => setActiveMenu(null)} />

            {/* Floating Popover Menu */}
            <div
              style={{
                position: 'fixed',
                zIndex: 9999,
                right: `${Math.max(12, window.innerWidth - activeMenu.rect.right)}px`,
                ...(window.innerHeight - activeMenu.rect.bottom < 230
                  ? { bottom: `${window.innerHeight - activeMenu.rect.top + 6}px` }
                  : { top: `${activeMenu.rect.bottom + 6}px` })
              }}
              className="min-w-[195px] bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl shadow-xl shadow-blue-500/10 p-1.5 text-left animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Xem chi tiết */}
              <button
                onClick={() => {
                  const targetJob = activeMenu.job
                  setActiveMenu(null)
                  onView(targetJob)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all cursor-pointer whitespace-nowrap"
              >
                <Eye size={15} className="text-[#3B82F6] shrink-0" />
                <span>Xem chi tiết</span>
              </button>

              {/* Xét duyệt (chỉ HR Admin & PENDING) */}
              {isHrAdmin && activeMenu.job.status === JobStatus.PENDING && (
                <button
                  onClick={() => {
                    const targetJob = activeMenu.job
                    setActiveMenu(null)
                    onReview(targetJob)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  <CheckCheck size={15} className="text-emerald-600 shrink-0" />
                  <span>Xét duyệt yêu cầu</span>
                </button>
              )}

              {/* Chuyển thành Job (chỉ HR Admin & APPROVED) */}
              {isHrAdmin && activeMenu.job.status === JobStatus.APPROVED && (
                <button
                  onClick={() => {
                    const targetJob = activeMenu.job
                    setActiveMenu(null)
                    onPromote(targetJob)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Briefcase size={15} className="text-indigo-600 shrink-0" />
                  <span>Chuyển thành Job</span>
                </button>
              )}

              {/* Đánh dấu Hoàn thành (chỉ HR Admin & APPROVED/JD_CREATED) */}
              {isHrAdmin &&
                (activeMenu.job.status === JobStatus.APPROVED ||
                  activeMenu.job.status === JobStatus.JD_CREATED) && (
                  <button
                    onClick={() => {
                      const targetJob = activeMenu.job
                      setActiveMenu(null)
                      onComplete(targetJob)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#3B82F6] hover:bg-blue-50 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle2 size={15} className="text-[#3B82F6] shrink-0" />
                    <span>Đánh dấu Hoàn thành</span>
                  </button>
                )}

              {/* Chỉnh sửa (HR Admin hoặc PENDING) */}
              {(isHrAdmin || activeMenu.job.status === JobStatus.PENDING) && (
                <button
                  onClick={() => {
                    const targetJob = activeMenu.job
                    setActiveMenu(null)
                    onEdit(targetJob)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Edit2 size={15} className="text-slate-500 shrink-0" />
                  <span>Chỉnh sửa</span>
                </button>
              )}

              {/* Đường phân cách trước nút xóa */}
              {(isHrAdmin || activeMenu.job.status === JobStatus.PENDING) && (
                <div className="my-1 border-t border-slate-100" />
              )}

              {/* Xóa yêu cầu */}
              {(isHrAdmin || activeMenu.job.status === JobStatus.PENDING) && (
                <button
                  onClick={() => {
                    const targetJob = activeMenu.job
                    setActiveMenu(null)
                    onDelete(targetJob)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Trash2 size={15} className="text-rose-500 shrink-0" />
                  <span>Xóa yêu cầu</span>
                </button>
              )}
            </div>
          </>,
          document.body
        )}
    </div>
  )
}
