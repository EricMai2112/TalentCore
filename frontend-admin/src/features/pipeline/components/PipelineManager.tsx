'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, GitBranch, Search } from 'lucide-react'
import { PipelineTemplate, Stage } from '../types/pipeline.types'
import { pipelineApi } from '../services/pipeline.api'
import PipelineCard from './PipelineCard'
import PipelineModal from './PipelineModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import {
  CustomButton,
  CustomInput,
  CustomPagination,
  Toast,
  useToast
} from '@/src/components/common'

interface PipelineManagerProps {
  initialTemplates: PipelineTemplate[]
}

export default function PipelineManager({ initialTemplates }: PipelineManagerProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<PipelineTemplate[]>(initialTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5
  const { toast, showToast, hideToast } = useToast()

  // Sync state with server-side fetched data
  useEffect(() => {
    setTemplates(initialTemplates)
  }, [initialTemplates])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PipelineTemplate | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<PipelineTemplate | null>(null)

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTemplates = async () => {
    try {
      const data = await pipelineApi.getTemplates()
      setTemplates(data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách templates:', err)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingTemplate(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (template: PipelineTemplate) => {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }

  const handleOpenDeleteModal = (template: PipelineTemplate) => {
    setTemplateToDelete(template)
    setDeleteConfirmOpen(true)
  }

  const handleModalSubmit = async (name: string, stages: Omit<Stage, '_id'>[]) => {
    setIsSubmitting(true)
    try {
      if (editingTemplate) {
        await pipelineApi.updateTemplate(editingTemplate._id, { name, stages })
        showToast('Cập nhật pipeline template thành công!', 'success')
      } else {
        await pipelineApi.createTemplate({ name, stages })
        showToast('Tạo pipeline template thành công!', 'success')
      }
      setIsModalOpen(false)
      await fetchTemplates()
      router.refresh()
    } catch (err: any) {
      throw new Error(err.message || 'Đã xảy ra lỗi khi gửi yêu cầu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return
    setIsSubmitting(true)
    try {
      await pipelineApi.deleteTemplate(templateToDelete._id)
      showToast('Xóa pipeline template thành công!', 'success')
      setDeleteConfirmOpen(false)
      setTemplateToDelete(null)
      await fetchTemplates()
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa pipeline template', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTemplates = templates.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const matchName = t.name.toLowerCase().includes(q)
    const matchStage = t.stages.some((s) => s.name.toLowerCase().includes(q))
    return matchName || matchStage
  })

  const totalPages = Math.ceil(filteredTemplates.length / pageSize) || 1
  const paginatedTemplates = filteredTemplates.slice(
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
            placeholder="Tìm theo tên quy trình, giai đoạn..."
            icon={<Search size={15} />}
            className="!py-1.5 !rounded-xl text-xs"
          />
        </div>
        <CustomButton
          onClick={handleOpenCreateModal}
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          className="self-start font-bold shrink-0 sm:self-auto"
        >
          Tạo template
        </CustomButton>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center border shadow-xl bg-white/50 border-white/70 rounded-3xl backdrop-blur-md shadow-blue-500/5">
            <div className="p-4 mb-4 rounded-2xl bg-slate-100/80 text-slate-400 shadow-2xs">
              <GitBranch size={36} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery
                ? 'Không tìm thấy pipeline template phù hợp'
                : 'Không có pipeline template nào'}
            </h3>
            <p className="max-w-sm mx-auto mt-1 text-sm text-slate-500">
              {searchQuery
                ? `Không có kết quả nào khớp với từ khóa "${searchQuery}".`
                : 'Hãy tạo một pipeline template mới để bắt đầu quy trình theo dõi ứng viên của bạn.'}
            </p>
            {!searchQuery && (
              <CustomButton
                onClick={handleOpenCreateModal}
                variant="secondary"
                icon={<Plus size={16} />}
                className="mt-5"
              >
                Tạo mẫu đầu tiên
              </CustomButton>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedTemplates.map((template, index) => {
                const isDefault =
                  (currentPage === 1 && index === 0) ||
                  template.name.toLowerCase().includes('standard')
                return (
                  <PipelineCard
                    key={template._id}
                    template={template}
                    isDefault={isDefault}
                    onEdit={() => handleOpenEditModal(template)}
                    onDelete={() => handleOpenDeleteModal(template)}
                  />
                )
              })}
            </div>

            <div className="overflow-hidden border shadow-xs rounded-2xl border-white/70">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTemplates.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      <PipelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialTemplate={editingTemplate}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setTemplateToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        templateName={templateToDelete?.name || ''}
        isDeleting={isSubmitting}
      />

      {/* Standard Toast Notification */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
