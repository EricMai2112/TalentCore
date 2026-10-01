'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Zap, Search, RotateCcw } from 'lucide-react'
import {
  Skill,
  PositionWithSkills,
  DeptOption,
  CreateSkillDto,
  buildDepartmentGroups
} from '../types/skill.types'
import { skillApi, positionApi } from '../services/skill.api'
import DepartmentGroup from './DepartmentGroup'
import AddSkillModal from './AddSkillModal'
import EditPositionModal from './EditPositionModal'
import DeletePositionModal from './DeletePositionModal'
import { useAuth } from '@/src/providers/AuthProvider'
import { UserRole, Department } from '@/src/features/users/types/user.types'
import {
  CustomButton,
  CustomInput,
  CustomSelect,
  CustomPagination,
  Toast,
  useToast
} from '@/src/components/common'

interface SkillManagerProps {
  initialPositions: PositionWithSkills[]
  initialSkills: Skill[]
  initialDepartments: DeptOption[]
}

type ModalMode = 'add-skill' | 'add-position'

const getDeptIdStr = (
  dept: string | Department | DeptOption | { _id: string } | undefined
): string => {
  if (!dept) return ''
  if (typeof dept === 'string') return dept
  if (typeof dept === 'object' && '_id' in dept && typeof dept._id === 'string') return dept._id
  return ''
}

export default function SkillManager({
  initialPositions,
  initialSkills,
  initialDepartments
}: SkillManagerProps) {
  const router = useRouter()
  const { user: currentUser } = useAuth()

  const isDeptManager = currentUser?.role === UserRole.DEPARTMENT_MANAGER
  const userDeptId = getDeptIdStr(currentUser?.departmentId)

  const [positions, setPositions] = useState<PositionWithSkills[]>(initialPositions)
  const [allSkills, setAllSkills] = useState<Skill[]>(initialSkills)
  const [departments] = useState<DeptOption[]>(initialDepartments)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    setPositions(initialPositions)
  }, [initialPositions])
  useEffect(() => {
    setAllSkills(initialSkills)
  }, [initialSkills])
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedDept])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDept('all')
  }

  // Add modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalMode, setAddModalMode] = useState<ModalMode>('add-skill')
  const [preselectedDeptId, setPreselectedDeptId] = useState<string | undefined>()

  // Edit position modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<PositionWithSkills | null>(null)

  // Delete position modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingPosition, setDeletingPosition] = useState<PositionWithSkills | null>(null)

  // Loading & toast
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchPositions = async () => {
    try {
      setPositions(await positionApi.getWithSkills())
    } catch {
      /* silent */
    }
  }
  const fetchSkills = async () => {
    try {
      setAllSkills(await skillApi.getAll())
    } catch {
      /* silent */
    }
  }

  // ── Add modal ──────────────────────────────────────────────────────────
  const openAddModal = (mode: ModalMode, deptId?: string) => {
    setAddModalMode(mode)
    setPreselectedDeptId(deptId || (isDeptManager ? userDeptId : undefined))
    setAddModalOpen(true)
  }

  const handleCreateSkill = async (data: CreateSkillDto) => {
    setIsSubmitting(true)
    try {
      await skillApi.create(data)
      showToast('Tạo kỹ năng thành công!', 'success')
      setAddModalOpen(false)
      await fetchSkills()
      router.refresh()
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreatePosition = async (name: string, departmentId: string) => {
    setIsSubmitting(true)
    try {
      const finalDeptId = isDeptManager ? userDeptId : departmentId
      await positionApi.create({ name, departmentId: finalDeptId })
      showToast('Tạo vị trí thành công!', 'success')
      setAddModalOpen(false)
      await fetchPositions()
      router.refresh()
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Skill on position ──────────────────────────────────────────────────
  const handleAddSkill = async (positionId: string, skillId: string) => {
    try {
      await positionApi.addSkill(positionId, skillId)
      setPositions((prev) =>
        prev.map((p) => {
          if (p._id !== positionId) return p
          const skill = allSkills.find((s) => s._id === skillId)
          if (!skill || p.skillIds.find((s) => s._id === skillId)) return p
          return { ...p, skillIds: [...p.skillIds, skill] }
        })
      )
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể thêm kỹ năng', 'error')
      await fetchPositions()
    }
  }

  const handleRemoveSkill = async (positionId: string, skillId: string) => {
    setPositions((prev) =>
      prev.map((p) =>
        p._id === positionId ? { ...p, skillIds: p.skillIds.filter((s) => s._id !== skillId) } : p
      )
    )
    try {
      await positionApi.removeSkill(positionId, skillId)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể xóa kỹ năng', 'error')
      await fetchPositions()
    }
  }

  // ── Edit position ──────────────────────────────────────────────────────
  const handleOpenEdit = (position: PositionWithSkills) => {
    setEditingPosition(position)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (id: string, name: string, departmentId: string) => {
    setIsSubmitting(true)
    try {
      const finalDeptId = isDeptManager ? userDeptId : departmentId
      await positionApi.update(id, { name, departmentId: finalDeptId })
      showToast('Cập nhật vị trí thành công!', 'success')
      setEditModalOpen(false)
      setEditingPosition(null)
      await fetchPositions()
      router.refresh()
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Không thể cập nhật vị trí')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete position ────────────────────────────────────────────────────
  const handleOpenDelete = (position: PositionWithSkills) => {
    setDeletingPosition(position)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingPosition) return
    setIsDeleting(true)
    try {
      await positionApi.remove(deletingPosition._id)
      showToast('Xóa vị trí thành công!', 'success')
      setDeleteModalOpen(false)
      setDeletingPosition(null)
      setPositions((prev) => prev.filter((p) => p._id !== deletingPosition._id))
      router.refresh()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể xóa vị trí', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // ── View ───────────────────────────────────────────────────────────────
  const scopedPositions = positions.filter((p) => {
    if (isDeptManager && userDeptId) {
      const pDeptId = getDeptIdStr(p.departmentId)
      if (pDeptId !== userDeptId) return false
    }
    return true
  })

  const filteredPositions = scopedPositions.filter((pos) => {
    const pDeptId = getDeptIdStr(pos.departmentId)
    if (selectedDept !== 'all' && pDeptId !== selectedDept) {
      return false
    }

    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const deptName =
      typeof pos.departmentId === 'object' && pos.departmentId
        ? (pos.departmentId as any).name || ''
        : ''
    const matchPos = pos.name.toLowerCase().includes(q)
    const matchDept = deptName.toLowerCase().includes(q)
    const matchSkill = pos.skillIds?.some((s) => s.name.toLowerCase().includes(q))
    return matchPos || matchDept || matchSkill
  })

  const groups = buildDepartmentGroups(filteredPositions)
  const totalPages = Math.ceil(groups.length / pageSize) || 1
  const paginatedGroups = groups.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-3">
      {/* Header toolbar: Search, Filter & Action button aligned space-between */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="w-full sm:w-64">
            <CustomInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo kỹ năng, vị trí..."
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
          onClick={() => openAddModal('add-skill')}
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          className="self-start font-bold shrink-0 sm:self-auto"
        >
          Thêm kỹ năng
        </CustomButton>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center border shadow-xl bg-white/50 border-white/70 rounded-3xl backdrop-blur-md shadow-blue-500/5">
          <div className="p-4 mb-4 rounded-2xl bg-slate-100/80 text-slate-400 shadow-2xs">
            {searchQuery || selectedDept !== 'all' ? <Search size={36} /> : <Zap size={36} />}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery || selectedDept !== 'all'
              ? 'Không tìm thấy kỹ năng phù hợp'
              : 'Chưa có dữ liệu kỹ năng'}
          </h3>
          <p className="max-w-sm mx-auto mt-1 text-sm text-slate-500">
            {searchQuery || selectedDept !== 'all'
              ? 'Không có kết quả nào khớp với điều kiện lọc hoặc từ khóa tìm kiếm.'
              : 'Hãy tạo vị trí trong phòng ban, sau đó gắn kỹ năng vào từng vị trí.'}
          </p>
          {!searchQuery && selectedDept === 'all' && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <CustomButton
                onClick={() => openAddModal('add-skill')}
                variant="primary"
                icon={<Plus size={15} />}
              >
                Thêm kỹ năng
              </CustomButton>
              <CustomButton
                onClick={() => openAddModal('add-position')}
                variant="secondary"
                icon={<Plus size={15} />}
              >
                Thêm vị trí
              </CustomButton>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3.5">
            {paginatedGroups.map((group) => (
              <DepartmentGroup
                key={group.deptId}
                group={group}
                allSkills={allSkills}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
                onEditPosition={handleOpenEdit}
                onDeletePosition={handleOpenDelete}
                onAddPosition={(deptId) => openAddModal('add-position', deptId)}
                defaultOpen={isDeptManager}
              />
            ))}
          </div>

          <div className="overflow-hidden border shadow-xs rounded-2xl border-white/70">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={groups.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Add skill / position modal */}
      <AddSkillModal
        isOpen={addModalOpen}
        mode={addModalMode}
        onClose={() => setAddModalOpen(false)}
        onCreateSkill={handleCreateSkill}
        onCreatePosition={handleCreatePosition}
        onAddSkillToPosition={handleAddSkill}
        departments={departments}
        positions={scopedPositions}
        allSkills={allSkills}
        preselectedDeptId={preselectedDeptId || (isDeptManager ? userDeptId : undefined)}
        isSubmitting={isSubmitting}
        isDeptManager={isDeptManager}
        userDeptId={userDeptId}
      />

      {/* Edit position modal */}
      <EditPositionModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingPosition(null)
        }}
        onSubmit={handleEditSubmit}
        position={editingPosition}
        departments={departments}
        isSubmitting={isSubmitting}
        isDeptManager={isDeptManager}
        userDeptId={userDeptId}
      />

      {/* Delete position modal */}
      <DeletePositionModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingPosition(null)
        }}
        onConfirm={handleDeleteConfirm}
        positionName={deletingPosition?.name ?? ''}
        isDeleting={isDeleting}
      />

      {/* Standard Toast Notification */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
