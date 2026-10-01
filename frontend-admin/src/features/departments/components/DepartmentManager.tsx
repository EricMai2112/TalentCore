'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Building2, Search } from 'lucide-react'
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  getManagerName
} from '../types/department.types'
import { User } from '@/src/features/users/types/user.types'
import { departmentApi } from '../services/department.api'
import DepartmentCard from './DepartmentCard'
import DepartmentModal from './DepartmentModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import {
  CustomButton,
  CustomInput,
  CustomPagination,
  Toast,
  useToast
} from '@/src/components/common'

interface DepartmentManagerProps {
  initialDepartments: Department[]
  employees: User[] // để chọn trưởng phòng trong modal
}

export default function DepartmentManager({
  initialDepartments,
  employees
}: DepartmentManagerProps) {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    setDepartments(initialDepartments)
  }, [initialDepartments])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null)

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDepartments = async () => {
    try {
      const data = await departmentApi.getAll()
      setDepartments(data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng ban:', err)
    }
  }

  // Đếm số thành viên theo departmentId
  const getMemberCount = (deptId: string) =>
    employees.filter((e) => e.departmentId === deptId).length

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingDept(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept)
    setIsModalOpen(true)
  }

  const handleOpenDelete = (dept: Department) => {
    setDeptToDelete(dept)
    setIsDeleteOpen(true)
  }

  const handleModalSubmit = async (data: CreateDepartmentDto | UpdateDepartmentDto) => {
    setIsSubmitting(true)
    try {
      if (editingDept) {
        await departmentApi.update(editingDept._id, data as UpdateDepartmentDto)
        showToast('Cập nhật phòng ban thành công!', 'success')
      } else {
        await departmentApi.create(data as CreateDepartmentDto)
        showToast('Tạo phòng ban thành công!', 'success')
      }
      setIsModalOpen(false)
      await fetchDepartments()
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      throw new Error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return
    setIsSubmitting(true)
    try {
      await departmentApi.remove(deptToDelete._id)
      showToast('Xóa phòng ban thành công!', 'success')
      setIsDeleteOpen(false)
      setDeptToDelete(null)
      await fetchDepartments()
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xóa phòng ban'
      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredDepartments = departments.filter((dept) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const managerName = getManagerName(dept.managerId) || ''
    return (
      dept.name.toLowerCase().includes(q) ||
      dept.code.toLowerCase().includes(q) ||
      managerName.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filteredDepartments.length / pageSize) || 1
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="space-y-3">
      {/* Header toolbar: Search input and Action button aligned space-between */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <CustomInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên phòng ban, mã..."
            icon={<Search size={15} />}
            className="!py-1.5 !rounded-xl text-xs"
          />
        </div>
        <CustomButton
          onClick={handleOpenCreate}
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          className="self-start font-bold shrink-0 sm:self-auto"
        >
          Thêm phòng ban
        </CustomButton>
      </div>

      {/* List */}
      {filteredDepartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center border shadow-xl bg-white/50 border-white/70 rounded-3xl backdrop-blur-md shadow-blue-500/5">
          <div className="p-4 mb-4 rounded-2xl bg-slate-100/80 text-slate-400 shadow-2xs">
            <Building2 size={36} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? 'Không tìm thấy phòng ban phù hợp' : 'Chưa có phòng ban nào'}
          </h3>
          <p className="max-w-sm mx-auto mt-1 text-sm text-slate-500">
            {searchQuery
              ? `Không có kết quả nào khớp với từ khóa "${searchQuery}".`
              : 'Tạo phòng ban đầu tiên để bắt đầu phân công nhân sự.'}
          </p>
          {!searchQuery && (
            <CustomButton
              onClick={handleOpenCreate}
              variant="secondary"
              icon={<Plus size={16} />}
              className="mt-5"
            >
              Tạo phòng ban đầu tiên
            </CustomButton>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3.5">
            {paginatedDepartments.map((dept) => (
              <DepartmentCard
                key={dept._id}
                department={dept}
                memberCount={getMemberCount(dept._id)}
                onEdit={() => handleOpenEdit(dept)}
                onDelete={() => handleOpenDelete(dept)}
              />
            ))}
          </div>

          <div className="overflow-hidden border shadow-xs rounded-2xl border-white/70">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDepartments.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialDepartment={editingDept}
        managers={employees}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeptToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        departmentName={deptToDelete?.name ?? ''}
        isDeleting={isSubmitting}
      />

      {/* Standard Toast Notification */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
