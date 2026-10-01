'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Mail, Search } from 'lucide-react'
import { EmailTemplate, EmailTemplateType } from '../types/email-ai.types'
import { emailAiApi } from '../services/email-ai.api'
import EmailCard from './EmailCard'
import EmailModal from './EmailModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import {
  CustomButton,
  CustomInput,
  CustomPagination,
  Toast,
  useToast
} from '@/src/components/common'

interface EmailManagerProps {
  initialTemplates: EmailTemplate[]
}

export default function EmailManager({ initialTemplates }: EmailManagerProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates)
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
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null)

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTemplates = async () => {
    try {
      const data = await emailAiApi.getTemplates()
      setTemplates(data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách email templates:', err)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingTemplate(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }

  const handleOpenDeleteModal = (template: EmailTemplate) => {
    setTemplateToDelete(template)
    setDeleteConfirmOpen(true)
  }

  const handleModalSubmit = async (payload: {
    name: string
    type: EmailTemplateType
    subject: string
    body: string
    placeholders: string[]
  }) => {
    setIsSubmitting(true)
    try {
      if (editingTemplate) {
        await emailAiApi.updateTemplate(editingTemplate._id, payload)
        showToast('Cập nhật email template thành công!', 'success')
      } else {
        await emailAiApi.createTemplate(payload)
        showToast('Tạo email template thành công!', 'success')
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
      await emailAiApi.deleteTemplate(templateToDelete._id)
      showToast('Xóa email template thành công!', 'success')
      setDeleteConfirmOpen(false)
      setTemplateToDelete(null)
      await fetchTemplates()
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa email template', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      template.name.toLowerCase().includes(q) ||
      template.subject.toLowerCase().includes(q) ||
      template.type.toLowerCase().includes(q)
    )
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
            placeholder="Tìm theo tên mẫu, tiêu đề email..."
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
          Thêm template
        </CustomButton>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center border shadow-xl bg-white/50 border-white/70 rounded-3xl backdrop-blur-md shadow-blue-500/5">
            <div className="p-4 mb-4 rounded-2xl bg-slate-100/80 text-slate-400 shadow-2xs">
              {searchQuery ? <Search size={36} /> : <Mail size={36} />}
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery ? 'Không tìm thấy template phù hợp' : 'Không có email template nào'}
            </h3>
            <p className="max-w-sm mx-auto mt-1 text-sm text-slate-500">
              {searchQuery
                ? `Không có kết quả nào khớp với từ khóa "${searchQuery}".`
                : 'Hãy tạo một email template hoặc AI prompt mới để bắt đầu quy trình tự động hóa tuyển dụng.'}
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
              {paginatedTemplates.map((template) => (
                <EmailCard
                  key={template._id}
                  template={template}
                  onEdit={() => handleOpenEditModal(template)}
                  onDelete={() => handleOpenDeleteModal(template)}
                />
              ))}
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
      <EmailModal
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
