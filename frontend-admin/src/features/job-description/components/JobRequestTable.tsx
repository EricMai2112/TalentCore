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
import {
  CustomSelect,
  CustomPagination,
  CustomButton,
  CustomInput,
  CustomTableContainer,
  CustomActionMenu
} from '@/src/components/common'
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
    <div className="space-y-3">
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
          className="ml-auto font-bold sm:ml-0 shrink-0"
        >
          Tạo yêu cầu mới
        </CustomButton>
      </div>

      {/* Reusable Glassmorphic Table Container with Sticky Header & Internal Scroll */}
      <CustomTableContainer
        pagination={{
          currentPage,
          totalPages: Math.ceil(filteredJobs.length / pageSize),
          totalItems: filteredJobs.length,
          pageSize,
          onPageChange: setCurrentPage
        }}
        isEmpty={filteredJobs.length === 0}
        emptyTitle="Không tìm thấy yêu cầu tuyển dụng nào"
        emptyDescription="Thử điều chỉnh bộ lọc trạng thái hoặc phòng ban phía trên"
        emptyIcon={<Briefcase className="w-8 h-8 stroke-[1.5]" />}
      >
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 z-10 border-b shadow-sm bg-white/80 backdrop-blur-lg border-slate-200/60">
            <tr className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
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
          <tbody className="divide-y divide-slate-200/40">
            {filteredJobs
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((job, idx) => {
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
                    className={`hover:bg-white/50 transition-all duration-150 group border-b border-slate-200/40 ${
                      idx % 2 === 0 ? '' : 'bg-white/15'
                    }`}
                  >
                    {/* Job Title & Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/80 border border-white text-[#3B82F6] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3B82F6] group-hover:text-white group-hover:border-[#3B82F6] transition-all duration-200">
                          <Briefcase size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 group-hover:text-[#3B82F6] transition-colors text-[13px] block truncate">
                            {job.title}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium block truncate mt-0.5">
                            {(job.minimumSalary === 0 && job.maximumSalary === 0) ||
                            (!job.minimumSalary && !job.maximumSalary)
                              ? 'Thỏa thuận'
                              : `${(job.minimumSalary ?? 0).toLocaleString('vi-VN')} - ${(job.maximumSalary ?? 0).toLocaleString('vi-VN')} VNĐ`}{' '}
                            · {job.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-4 font-semibold text-slate-700 text-[13px]">
                      {deptName}
                    </td>

                    {/* Headcount */}
                    <td className="px-4 py-4 text-center font-bold text-slate-800 text-[13px]">
                      {job.headcount}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold shadow-2xs ${priorityConf.style}`}
                      >
                        {priorityConf.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold shadow-2xs ${statusConf.style}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot} shrink-0`} />
                        {statusConf.label}
                      </span>
                    </td>

                    {/* Requester */}
                    <td className="px-4 py-4 text-slate-700 font-semibold text-[13px]">
                      {postedByName}
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-4 text-xs font-medium text-slate-400">{createdDate}</td>

                    {/* Actions Button */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center">
                        <CustomActionMenu
                          items={[
                            {
                              id: 'view',
                              label: 'Xem chi tiết',
                              icon: <Eye size={15} />,
                              variant: 'primary',
                              onClick: () => onView(job)
                            },
                            {
                              id: 'review',
                              label: 'Xét duyệt yêu cầu',
                              icon: <CheckCheck size={15} />,
                              variant: 'success',
                              hidden: !isHrAdmin || job.status !== JobStatus.PENDING,
                              onClick: () => onReview(job)
                            },
                            {
                              id: 'promote',
                              label: 'Chuyển thành Job',
                              icon: <Briefcase size={15} />,
                              variant: 'indigo',
                              hidden: !isHrAdmin || job.status !== JobStatus.APPROVED,
                              onClick: () => onPromote(job)
                            },
                            {
                              id: 'complete',
                              label: 'Đánh dấu Hoàn thành',
                              icon: <CheckCircle2 size={15} />,
                              variant: 'primary',
                              hidden:
                                !isHrAdmin ||
                                (job.status !== JobStatus.APPROVED &&
                                  job.status !== JobStatus.JD_CREATED),
                              onClick: () => onComplete(job)
                            },
                            {
                              id: 'edit',
                              label: 'Chỉnh sửa',
                              icon: <Edit2 size={15} />,
                              variant: 'default',
                              hidden: !isHrAdmin && job.status !== JobStatus.PENDING,
                              onClick: () => onEdit(job)
                            },
                            {
                              id: 'delete',
                              label: 'Xóa yêu cầu',
                              icon: <Trash2 size={15} />,
                              variant: 'danger',
                              dividerAbove: true,
                              hidden: !isHrAdmin && job.status !== JobStatus.PENDING,
                              onClick: () => onDelete(job)
                            }
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
    </div>
  )
}
