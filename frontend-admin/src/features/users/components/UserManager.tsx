'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Users, Search } from 'lucide-react'
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
import { CustomButton, CustomInput, CustomTableContainer, Toast, useToast } from '@/src/components/common'

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

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
    if (!q) return true
    const deptIdStr = getDeptIdStr(u.departmentId)
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (deptMap.get(deptIdStr)?.toLowerCase().includes(q) ?? false)
    )
  })

  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      <Toast toast={toast} onClose={hideToast} position="top-right" />

      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-[#1261A6] shrink-0" size={22} />
            {isDeptManager ? 'Thành viên phòng ban' : 'Quản lý người dùng'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isDeptManager
              ? 'Danh sách nhân viên thuộc phòng ban của bạn'
              : 'Quản lý danh sách tài khoản, phân quyền và thông tin người dùng'}
          </p>
        </div>
        <CustomButton
          onClick={() => setIsCreateOpen(true)}
          variant="primary"
          icon={<Plus size={16} />}
          className="self-start sm:self-auto shrink-0"
        >
          Thêm người dùng
        </CustomButton>
      </div>

      {/* Search bar */}
      <div className="w-full sm:max-w-xs">
        <CustomInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên, email..."
          icon={<Search size={15} />}
          className="!py-1.5 !rounded-xl text-xs"
        />
      </div>

      {/* Reusable Table Container */}
      <CustomTableContainer
        pagination={{
          currentPage,
          totalPages: Math.ceil(filtered.length / pageSize),
          totalItems: filtered.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
        isEmpty={filtered.length === 0}
        emptyTitle="Không tìm thấy người dùng nào"
        emptyDescription={searchQuery ? 'Thử tìm với từ khoá khác.' : isDeptManager ? 'Chưa có nhân viên nào thuộc phòng ban của bạn.' : 'Tạo tài khoản nhân viên đầu tiên để bắt đầu quản lý quy trình tuyển dụng.'}
        emptyIcon={<Users className="w-8 h-8 stroke-[1.5]" />}
      >
        <table className="w-full min-w-[640px] text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
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
