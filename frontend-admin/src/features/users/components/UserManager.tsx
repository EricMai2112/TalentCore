'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Users, Search, RotateCcw } from 'lucide-react'
import {
  User,
  Department,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UserStatus,
  UserRole
} from '../types/user.types'
import { userApi } from '../services/user.api'
import UserRow from './UserRow'
import { useAuth } from '@/src/providers/AuthProvider'
import {
  CustomButton,
  CustomInput,
  CustomSelect,
  CustomTableContainer,
  Toast,
  useToast
} from '@/src/components/common'

// Lazy load user modals on demand
const CreateUserModal = dynamic(() => import('./CreateUserModal'), { ssr: false })
const EditUserModal = dynamic(() => import('./EditUserModal'), { ssr: false })

interface UserManagerProps {
  initialUsers: User[]
  initialDepartments: Department[]
}

const getDeptIdStr = (dept: string | Department | undefined): string => {
  if (!dept) return ''
  if (typeof dept === 'string') return dept
  if (typeof dept === 'object' && '_id' in dept && typeof dept._id === 'string') return dept._id
  return ''
}

export default function UserManager({ initialUsers, initialDepartments }: UserManagerProps) {
  const { user: currentUser } = useAuth()

  const isDeptManager = currentUser?.role === UserRole.DEPARTMENT_MANAGER
  const userDeptId = getDeptIdStr(currentUser?.departmentId)

  const [users, setUsers] = useState<User[]>(initialUsers)
  const [departments] = useState<Department[]>(initialDepartments)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedDept, selectedRole, selectedStatus])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDept('all')
    setSelectedRole('all')
    setSelectedStatus('all')
  }

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Loading & shared toast
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const fetchUsers = async () => {
    try {
      const data = await userApi.getEmployees()
      setUsers(data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err)
    }
  }

  // ── Handlers ──────────────────────────────────────────────

  const handleCreateSubmit = async (data: CreateEmployeeDto) => {
    setIsSubmitting(true)
    try {
      await userApi.createEmployee(data)
      showToast('Tạo tài khoản nhân viên thành công!', 'success')
      setIsCreateOpen(false)
      await fetchUsers()
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (data: UpdateEmployeeDto) => {
    if (!editingUser) return
    setIsSubmitting(true)
    try {
      await userApi.updateEmployee(editingUser._id, data)
      showToast('Cập nhật thông tin thành công!', 'success')
      setIsEditOpen(false)
      setEditingUser(null)
      await fetchUsers()
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (user: User) => {
    // Optimistic update ngay lập tức
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.LOCKED : UserStatus.ACTIVE
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)))

    try {
      await userApi.toggleStatus(user._id, newStatus)
      showToast(
        newStatus === UserStatus.LOCKED
          ? `Đã khóa tài khoản ${user.name}`
          : `Đã mở khóa tài khoản ${user.name}`,
        'success'
      )
    } catch (err: unknown) {
      // Rollback nếu lỗi
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: user.status } : u)))
      showToast(err instanceof Error ? err.message : 'Không thể thay đổi trạng thái', 'error')
    }
  }

  // Map departmentId → tên phòng ban
  const deptMap = new Map(departments.map((d) => [d._id, d.name]))

  // Lọc theo role & phòng ban & search query
  const scopedUsers = users.filter((u) => {
    if (isDeptManager && userDeptId) {
      const uDeptId = getDeptIdStr(u.departmentId)
      if (uDeptId !== userDeptId) return false
    }
    return true
  })

  const filtered = scopedUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim()
    const deptIdStr = getDeptIdStr(u.departmentId)
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (deptMap.get(deptIdStr)?.toLowerCase().includes(q) ?? false)

    const matchDept = selectedDept === 'all' || deptIdStr === selectedDept
    const matchRole = selectedRole === 'all' || u.role === selectedRole
    const matchStatus = selectedStatus === 'all' || u.status === selectedStatus

    return matchSearch && matchDept && matchRole && matchStatus
  })

  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-3">
      {/* Toast Alert */}
      <Toast toast={toast} onClose={hideToast} position="top-right" />

      {/* Header toolbar: Search, Filters & Action button aligned space-between */}
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="w-full sm:w-60">
            <CustomInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email..."
              icon={<Search size={15} />}
              className="!py-1.5 !rounded-xl text-xs"
            />
          </div>

          {!isDeptManager && (
            <CustomSelect
              value={selectedDept}
              onChange={(val) => setSelectedDept(val)}
              size="sm"
              className="w-full sm:w-auto"
              placeholder="Tất cả phòng ban"
              options={[
                { value: 'all', label: 'Tất cả phòng ban' },
                ...departments.map((d) => ({ value: d._id, label: d.name }))
              ]}
            />
          )}

          <CustomSelect
            value={selectedRole}
            onChange={(val) => setSelectedRole(val)}
            size="sm"
            className="w-full sm:w-auto"
            placeholder="Tất cả vai trò"
            options={[
              { value: 'all', label: 'Tất cả vai trò' },
              { value: UserRole.HR_ADMIN, label: 'HR Admin' },
              { value: UserRole.DEPARTMENT_MANAGER, label: 'Trưởng phòng' },
              { value: UserRole.EMPLOYEE, label: 'Nhân viên' }
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
              { value: UserStatus.ACTIVE, label: 'Hoạt động' },
              { value: UserStatus.LOCKED, label: 'Đã khóa' }
            ]}
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

        <CustomButton
          onClick={() => setIsCreateOpen(true)}
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          className="self-start font-bold shrink-0 xl:self-auto"
        >
          Thêm người dùng
        </CustomButton>
      </div>

      {/* Reusable Table Container */}
      <CustomTableContainer
        pagination={{
          currentPage,
          totalPages: Math.ceil(filtered.length / pageSize),
          totalItems: filtered.length,
          pageSize,
          onPageChange: setCurrentPage
        }}
        isEmpty={filtered.length === 0}
        emptyTitle="Không tìm thấy người dùng nào"
        emptyDescription={
          searchQuery ||
          selectedDept !== 'all' ||
          selectedRole !== 'all' ||
          selectedStatus !== 'all'
            ? 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm phía trên.'
            : isDeptManager
              ? 'Chưa có nhân viên nào thuộc phòng ban của bạn.'
              : 'Tạo tài khoản nhân viên đầu tiên để bắt đầu quản lý quy trình tuyển dụng.'
        }
        emptyIcon={<Users className="w-8 h-8 stroke-[1.5]" />}
      >
        <table className="w-full min-w-[640px] text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 border-b shadow-sm bg-white/80 backdrop-blur-lg border-slate-200/60">
            <tr className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              {['Người dùng', 'Email', 'Vai trò', 'Phòng ban', 'Trạng thái', 'Thao tác'].map(
                (h) => (
                  <th key={h} className="px-4 py-3.5">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/40">
            {paginatedUsers.map((user) => {
              const deptIdStr = getDeptIdStr(user.departmentId)
              return (
                <UserRow
                  key={user._id}
                  user={user}
                  departmentName={deptMap.get(deptIdStr)}
                  onEdit={() => handleOpenEdit(user)}
                  onToggleStatus={() => handleToggleStatus(user)}
                />
              )
            })}
          </tbody>
        </table>
      </CustomTableContainer>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        departments={departments}
        isSubmitting={isSubmitting}
        isDeptManager={isDeptManager}
        userDeptId={userDeptId}
      />

      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setEditingUser(null)
        }}
        onSubmit={handleEditSubmit}
        user={editingUser}
        departments={departments}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
