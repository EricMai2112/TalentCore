'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Send,
  Building2,
  User,
  DollarSign,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  X,
  Search,
  Edit3
} from 'lucide-react'
import {
  CustomInput,
  CustomSelect,
  CustomDatePicker,
  CustomTextarea,
  CustomButton,
  UnsavedChangesModal,
  Toast,
  useToast
} from '@/src/components/common'
import { offersApi } from '../services/offers.api'
import { ContractType, OfferItem } from '../types/offer.types'
import { Department } from '@/src/features/departments/types/department.types'

interface CreateOfferPageContentProps {
  initialOfferId?: string
  initialOffer?: OfferItem | null
  initialApplicationId?: string
  initialApplications?: any[]
  initialDepartments?: Department[]
}

export default function CreateOfferPageContent({
  initialOfferId,
  initialOffer = null,
  initialApplicationId,
  initialApplications = [],
  initialDepartments = []
}: CreateOfferPageContentProps) {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()

  const isEditMode = Boolean(initialOfferId || initialOffer?._id)
  const targetOfferId = initialOfferId || initialOffer?._id

  // Unsaved changes state
  const [isDirty, setIsDirty] = useState(false)
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false)
  const pendingNavigationUrlRef = useRef<string>('/offers')

  const [selectedApplicationId, setSelectedApplicationId] = useState<string>(
    initialApplicationId || ''
  )
  const [candidateSearchText, setCandidateSearchText] = useState('')
  const [isCandidateDropdownOpen, setIsCandidateDropdownOpen] = useState(false)
  const candidateInputRef = useRef<HTMLDivElement>(null)

  const [positionTitle, setPositionTitle] = useState('')
  const [contractType, setContractType] = useState<ContractType>(ContractType.FULL_TIME)
  const [workLocation, setWorkLocation] = useState(
    'Văn phòng chính - Tầng 8, Tòa nhà TalentCore, TP. Hồ Chí Minh'
  )
  const [salary, setSalary] = useState<string>('20000000')
  const [currency] = useState('VND')
  const [probationDurationMonths, setProbationDurationMonths] = useState('2')
  const [probationSalaryPercentage, setProbationSalaryPercentage] = useState('85')
  const [startDate, setStartDate] = useState<string>('')
  const [expirationDate, setExpirationDate] = useState<string>('')
  const [benefits, setBenefits] = useState<string>(
    `- Bảo hiểm sức khỏe toàn diện PTI
- Thưởng lương tháng 13 & thưởng hiệu quả kinh doanh
- Xét tăng lương định kỳ 2 lần/năm
- Phụ cấp ăn trưa, gửi xe và teambuilding hàng quý
- Trang bị máy tính làm việc hiệu năng cao (MacBook / Dell XPS)`
  )
  const [notes, setNotes] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [offerLetterHtml, setOfferLetterHtml] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Populate data if in edit mode
  useEffect(() => {
    const populateFromOffer = (offer: OfferItem) => {
      const appId =
        typeof offer.applicationId === 'object'
          ? (offer.applicationId as any)._id || (offer.applicationId as any).id
          : offer.applicationId
      setSelectedApplicationId(appId)
      setPositionTitle(offer.positionTitle || '')
      setContractType(offer.contractType || ContractType.FULL_TIME)
      setWorkLocation(offer.workLocation || '')
      setSalary(String(offer.salary || ''))
      setProbationDurationMonths(String(offer.probationDurationMonths || '2'))
      setProbationSalaryPercentage(String(offer.probationSalaryPercentage || '85'))
      if (offer.startDate) {
        setStartDate(offer.startDate.split('T')[0])
      }
      if (offer.expirationDate) {
        setExpirationDate(offer.expirationDate.split('T')[0])
      }
      if (offer.benefits && offer.benefits.length > 0) {
        setBenefits(offer.benefits.map((b) => (b.startsWith('-') ? b : `- ${b}`)).join('\n'))
      }
      setNotes(offer.notes || '')
      setEmailSubject(offer.emailSubject || '')
      setOfferLetterHtml(offer.offerLetterHtml || '')

      const cand = offer.candidateId
      const name = cand?.userId?.name || cand?.profileName || 'Ứng viên'
      setCandidateSearchText(offer.positionTitle ? `${name} — ${offer.positionTitle}` : name)
    }

    if (initialOffer) {
      populateFromOffer(initialOffer)
    } else if (initialOfferId) {
      const fetchOffer = async () => {
        try {
          const res = await offersApi.getOfferById(initialOfferId)
          if (res) {
            populateFromOffer(res)
          }
        } catch (err: any) {
          console.error('Lỗi khi tải thông tin offer:', err)
          showToast('Không thể tải thông tin đề nghị nhận việc', 'error')
        }
      }
      fetchOffer()
    }
  }, [initialOffer, initialOfferId])

  // Set default dates if in create mode
  useEffect(() => {
    if (isEditMode) return
    const today = new Date()
    const inTwoWeeks = new Date(today)
    inTwoWeeks.setDate(today.getDate() + 14)
    const inThreeDays = new Date(today)
    inThreeDays.setDate(today.getDate() + 3)

    setStartDate(inTwoWeeks.toISOString().split('T')[0])
    setExpirationDate(inThreeDays.toISOString().split('T')[0])
  }, [isEditMode])

  // Determine selected application
  const selectedApp = useMemo(() => {
    return initialApplications.find((app) => (app._id || app.id) === selectedApplicationId)
  }, [initialApplications, selectedApplicationId])

  // Extract application metadata
  const candidateName = useMemo(() => {
    return (
      selectedApp?.candidateId?.userId?.name ||
      selectedApp?.candidateId?.name ||
      selectedApp?.candidateName ||
      selectedApp?.candidateId?.profileName ||
      initialOffer?.candidateId?.userId?.name ||
      initialOffer?.candidateId?.profileName ||
      'Ứng viên'
    )
  }, [selectedApp, initialOffer])

  const candidateEmail = useMemo(() => {
    return (
      selectedApp?.candidateId?.userId?.email ||
      selectedApp?.candidateEmail ||
      initialOffer?.candidateId?.userId?.email ||
      ''
    )
  }, [selectedApp, initialOffer])

  const candidatePhone = useMemo(() => {
    return (
      selectedApp?.candidateId?.userId?.phone ||
      selectedApp?.candidatePhone ||
      initialOffer?.candidateId?.userId?.phone ||
      ''
    )
  }, [selectedApp, initialOffer])

  const jobTitle = useMemo(() => {
    return (
      selectedApp?.jobDescriptionId?.title ||
      selectedApp?.jobTitle ||
      selectedApp?.positionTitle ||
      initialOffer?.jobDescriptionId?.title ||
      ''
    )
  }, [selectedApp, initialOffer])

  const departmentName = useMemo(() => {
    return (
      selectedApp?.departmentId?.name ||
      selectedApp?.jobDescriptionId?.departmentId?.name ||
      initialOffer?.departmentId?.name ||
      'TalentCore'
    )
  }, [selectedApp, initialOffer])

  // Auto set position title when job title changes in create mode
  useEffect(() => {
    if (!isEditMode && jobTitle && !positionTitle) {
      setPositionTitle(jobTitle)
    }
  }, [isEditMode, jobTitle, positionTitle])

  // Synchronize candidate input text when selectedApp is found
  useEffect(() => {
    if (selectedApp && !candidateSearchText) {
      const name =
        selectedApp?.candidateId?.userId?.name ||
        selectedApp?.candidateId?.name ||
        selectedApp?.candidateName ||
        selectedApp?.candidateId?.profileName ||
        ''
      const title =
        selectedApp?.jobDescriptionId?.title ||
        selectedApp?.jobTitle ||
        selectedApp?.positionTitle ||
        ''
      setCandidateSearchText(title ? `${name} — ${title}` : name)
    }
  }, [selectedApp, candidateSearchText])

  // Global unsaved changes listener (link interception & window beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handleGlobalDocumentClick = (e: MouseEvent) => {
      if (!isDirty) return

      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a') as HTMLAnchorElement | null

      if (anchor && anchor.href) {
        const targetUrl = new URL(anchor.href, window.location.href)
        const currentUrl = new URL(window.location.href)

        if (targetUrl.pathname !== currentUrl.pathname) {
          e.preventDefault()
          e.stopPropagation()
          pendingNavigationUrlRef.current = targetUrl.pathname + targetUrl.search + targetUrl.hash
          setIsUnsavedModalOpen(true)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleGlobalDocumentClick, true)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleGlobalDocumentClick, true)
    }
  }, [isDirty])

  // Filtered applications based on candidate input text
  const filteredApplications = useMemo(() => {
    if (!candidateSearchText.trim()) return initialApplications
    const q = candidateSearchText.toLowerCase().trim()
    return initialApplications.filter((app) => {
      const name = (
        app.candidateName ||
        app.candidateId?.userId?.name ||
        app.candidateId?.profileName ||
        ''
      ).toLowerCase()
      const title = (app.jobTitle || app.jobDescriptionId?.title || '').toLowerCase()
      const email = (
        app.candidateEmail ||
        app.candidateId?.userId?.email ||
        ''
      ).toLowerCase()
      return name.includes(q) || title.includes(q) || email.includes(q)
    })
  }, [initialApplications, candidateSearchText])

  // Close candidate dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (candidateInputRef.current && !candidateInputRef.current.contains(e.target as Node)) {
        setIsCandidateDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectCandidate = (app: any) => {
    setSelectedApplicationId(app._id || app.id)
    const name =
      app.candidateName ||
      app.candidateId?.userId?.name ||
      app.candidateId?.profileName ||
      'Ứng viên'
    const title = app.jobTitle || app.jobDescriptionId?.title || ''
    setCandidateSearchText(title ? `${name} — ${title}` : name)
    setIsCandidateDropdownOpen(false)
    setIsDirty(true)
  }

  const handleBackOrCancelClick = () => {
    if (isDirty) {
      pendingNavigationUrlRef.current = '/offers'
      setIsUnsavedModalOpen(true)
    } else {
      router.push('/offers')
    }
  }

  // Generate Letter Subject & HTML Template
  const generateTemplate = () => {
    const formattedSalary = Number(salary || 0).toLocaleString('vi-VN')
    const formattedProbationSalary = Math.round(
      (Number(salary || 0) * Number(probationSalaryPercentage || 85)) / 100
    ).toLocaleString('vi-VN')
    const startFormatted = startDate
      ? new Date(startDate).toLocaleDateString('vi-VN')
      : 'Theo thoả thuận'
    const expireFormatted = expirationDate
      ? new Date(expirationDate).toLocaleDateString('vi-VN')
      : 'Sau 03 ngày làm việc'
    const benefitsList = benefits
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean)
      .map((b) => `<li style="margin-bottom: 6px;">${b.replace(/^[-•*]\s*/, '')}</li>`)
      .join('\n')

    const subject = `[TalentCore] Thư mời nhận việc - Vị trí ${positionTitle || jobTitle || 'Chuyên viên'} - ${candidateName}`
    const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
  <div style="text-align: center; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0;">
    <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 700;">THƯ MỜI NHẬN VIỆC</h1>
    <p style="color: #64748b; margin: 6px 0 0 0; font-size: 14px;">Công ty Cổ phần Giải pháp Công nghệ TalentCore</p>
  </div>

  <div style="padding: 24px 0;">
    <p>Kính gửi <strong>${candidateName}</strong>,</p>
    <p>Thay mặt Ban lãnh đạo cùng tập thể TalentCore, chúng tôi xin chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn và đánh giá chuyên môn vừa qua. Chúng tôi rất ấn tượng với năng lực và tiềm năng của bạn, và trân trọng gửi đến bạn lời mời gia nhập đội ngũ TalentCore với các thông tin chi tiết như sau:</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #0f172a; margin-top: 0; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">1. THÔNG TIN VỊ TRÍ & ĐIỀU KIỆN LÀM VIỆC</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Vị trí công tác:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${positionTitle || jobTitle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Phòng ban:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${departmentName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Hình thức hợp đồng:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">Toàn thời gian (Full-time)</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Địa điểm làm việc:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${workLocation}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Thời gian bắt đầu làm việc:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #2563eb;">${startFormatted}</td>
        </tr>
      </table>

      <h3 style="color: #0f172a; margin-top: 16px; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">2. CHẾ ĐỘ LƯƠNG & ĐÃI NGỘ</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Mức lương chính thức (Gross):</td>
          <td style="padding: 6px 0; font-weight: 700; color: #16a34a; font-size: 16px;">${formattedSalary} VND/tháng</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Thời gian thử việc:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${probationDurationMonths} tháng</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Lương thử việc (${probationSalaryPercentage}%):</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${formattedProbationSalary} VND/tháng</td>
        </tr>
      </table>

      <h4 style="color: #0f172a; margin: 16px 0 8px 0; font-size: 14px;">Quyền lợi và phúc lợi bổ sung:</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
        ${benefitsList}
      </ul>
    </div>

    <p>Thư mời nhận việc này có hiệu lực phản hồi đến hết ngày <strong>${expireFormatted}</strong>. Bạn vui lòng xác nhận đồng ý hoặc từ chối thông qua Cổng thông tin ứng viên TalentCore.</p>

    <p>Nếu bạn có bất kỳ câu hỏi hoặc cần trao đổi thêm thông tin, vui lòng liên hệ trực tiếp với Phòng Nhân sự TalentCore.</p>

    <p style="margin-top: 32px;">Trân trọng,<br><strong>Phòng Nhân sự TalentCore</strong></p>
  </div>
</div>
    `.trim()

    setEmailSubject(subject)
    setOfferLetterHtml(html)
  }

  // Auto-generate template whenever essential fields change
  useEffect(() => {
    generateTemplate()
  }, [
    candidateName,
    positionTitle,
    salary,
    startDate,
    expirationDate,
    benefits,
    workLocation,
    probationDurationMonths,
    probationSalaryPercentage
  ])

  const handleSubmit = async (sendImmediately: boolean) => {
    if (!selectedApp && !isEditMode) {
      showToast('Vui lòng chọn hồ sơ ứng viên nhận offer', 'error')
      return
    }
    if (!positionTitle) {
      showToast('Vui lòng nhập vị trí công việc chính thức', 'error')
      return
    }
    if (!salary || Number(salary) <= 0) {
      showToast('Vui lòng nhập mức lương hợp lệ', 'error')
      return
    }
    if (!startDate) {
      showToast('Vui lòng chọn ngày bắt đầu làm việc', 'error')
      return
    }
    if (!expirationDate) {
      showToast('Vui lòng chọn hạn chót phản hồi offer', 'error')
      return
    }

    try {
      setSubmitting(true)

      const benefitsArray = benefits
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean)

      if (isEditMode && targetOfferId) {
        await offersApi.updateOffer(targetOfferId, {
          positionTitle,
          contractType,
          workLocation,
          salary: Number(salary),
          currency,
          probationDurationMonths: Number(probationDurationMonths),
          probationSalaryPercentage: Number(probationSalaryPercentage),
          startDate: new Date(startDate).toISOString(),
          expirationDate: new Date(expirationDate).toISOString(),
          benefits: benefitsArray,
          notes,
          emailSubject: emailSubject || `Thư mời nhận việc vị trí ${positionTitle}`,
          offerLetterHtml
        })

        if (sendImmediately) {
          await offersApi.sendOffer(targetOfferId)
        }

        setIsDirty(false)
        showToast(
          sendImmediately
            ? 'Đã cập nhật và gửi đề nghị thành công đến ứng viên!'
            : 'Đã cập nhật đề nghị nhận việc thành công!',
          'success'
        )
      } else {
        const candidateId =
          typeof selectedApp?.candidateId === 'object'
            ? selectedApp.candidateId._id
            : selectedApp?.candidateId

        const jobDescriptionId =
          typeof selectedApp?.jobDescriptionId === 'object'
            ? selectedApp.jobDescriptionId._id
            : selectedApp?.jobDescriptionId

        const departmentId =
          typeof selectedApp?.departmentId === 'object'
            ? selectedApp.departmentId?._id
            : selectedApp?.departmentId ||
              selectedApp?.jobDescriptionId?.departmentId?._id ||
              selectedApp?.jobDescriptionId?.departmentId

        await offersApi.createOffer({
          applicationId: selectedApp._id || selectedApp.id,
          candidateId,
          jobDescriptionId,
          departmentId: departmentId || '660000000000000000000000',
          positionTitle,
          contractType,
          workLocation,
          salary: Number(salary),
          currency,
          probationDurationMonths: Number(probationDurationMonths),
          probationSalaryPercentage: Number(probationSalaryPercentage),
          startDate: new Date(startDate).toISOString(),
          expirationDate: new Date(expirationDate).toISOString(),
          benefits: benefitsArray,
          notes,
          emailSubject: emailSubject || `Thư mời nhận việc vị trí ${positionTitle}`,
          offerLetterHtml,
          sendImmediately
        })

        setIsDirty(false)
        showToast(
          sendImmediately
            ? 'Đã gửi lời mời nhận việc thành công đến ứng viên!'
            : 'Đã lưu bản nháp đề nghị nhận việc thành công!',
          'success'
        )
      }

      // Redirect back to offers management page after short delay
      setTimeout(() => {
        router.push('/offers')
      }, 1000)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu đề nghị nhận việc', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Top Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <CustomButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleBackOrCancelClick}
            title="Quay lại danh sách"
            className="!p-2.5 !rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </CustomButton>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              {isEditMode ? 'Chỉnh Sửa Đề Nghị Nhận Việc' : 'Soạn Đề Nghị Nhận Việc'}
            </h1>
            <p className="text-2xs sm:text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? 'Cập nhật điều khoản tuyển dụng và xuất bản lại thư mời nhận việc cho ứng viên'
                : 'Thiết lập điều khoản tuyển dụng và xuất bản thư mời nhận việc chính thức gửi ứng viên'}
            </p>
          </div>
        </div>

        {/* Action Buttons on Top Bar */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CustomButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBackOrCancelClick}
            disabled={submitting}
          >
            Hủy bỏ
          </CustomButton>
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {isEditMode ? 'Lưu thay đổi' : 'Lưu bản nháp'}
          </CustomButton>
          <CustomButton
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            icon={Send}
          >
            {isEditMode ? 'Cập nhật & gửi cho ứng viên' : 'Gửi đề nghị ngay cho ứng viên'}
          </CustomButton>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Form Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Card 1: Candidate Selection & Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                1. Thông tin Ứng viên & Hồ sơ
              </h2>
            </div>

            {/* Input with Autocomplete Suggestion Dropdown */}
            <div ref={candidateInputRef} className="relative">
              <CustomInput
                label="Chọn hồ sơ ứng viên nhận Offer"
                required
                value={candidateSearchText}
                onChange={(e) => {
                  setCandidateSearchText(e.target.value)
                  setIsCandidateDropdownOpen(true)
                  setIsDirty(true)
                  if (!e.target.value) {
                    setSelectedApplicationId('')
                  }
                }}
                onFocus={() => setIsCandidateDropdownOpen(true)}
                placeholder="Nhập tên ứng viên hoặc chọn hồ sơ từ danh sách..."
                icon={<Search className="w-4 h-4 text-slate-400" />}
                rightElement={
                  candidateSearchText ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateSearchText('')
                        setSelectedApplicationId('')
                        setIsCandidateDropdownOpen(true)
                        setIsDirty(true)
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title="Xóa lựa chọn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null
                }
              />

              {/* Suggestions Dropdown */}
              {isCandidateDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl shadow-blue-500/10 z-50 py-1.5 [scrollbar-width:thin]">
                  {filteredApplications.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center">
                      Không tìm thấy hồ sơ ứng viên phù hợp
                    </div>
                  ) : (
                    filteredApplications.map((app) => {
                      const appId = app._id || app.id
                      const name =
                        app.candidateName ||
                        app.candidateId?.userId?.name ||
                        app.candidateId?.profileName ||
                        'Ứng viên'
                      const title = app.jobTitle || app.jobDescriptionId?.title || 'Vị trí'
                      const dept =
                        app.departmentId?.name ||
                        app.jobDescriptionId?.departmentId?.name ||
                        'Phòng ban'
                      const email =
                        app.candidateEmail || app.candidateId?.userId?.email || ''
                      const isSelected = selectedApplicationId === appId

                      return (
                        <button
                          key={appId}
                          type="button"
                          onClick={() => handleSelectCandidate(app)}
                          className={`w-full text-left px-4 py-2.5 hover:bg-blue-50/80 transition-colors flex items-center justify-between gap-3 text-xs cursor-pointer ${
                            isSelected ? 'bg-blue-50/60 font-bold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{name}</p>
                            <p className="text-2xs text-slate-400 mt-0.5">
                              {title} • {dept} {email ? `• ${email}` : ''}
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {/* Candidate Card Summary */}
            {(selectedApp || initialOffer) && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {candidateName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{candidateName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-2xs sm:text-xs text-slate-500 mt-0.5">
                      {candidateEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {candidateEmail}
                        </span>
                      )}
                      {candidatePhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {candidatePhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-2xs font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Đạt yêu cầu phỏng vấn
                  </span>
                  <p className="text-2xs sm:text-xs text-slate-500 mt-0.5 font-medium">{departmentName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Work Conditions & Compensation */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                2. Vị trí, Địa điểm & Chế độ Lương thưởng
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <CustomInput
                  label="Vị trí công tác chính thức"
                  required
                  value={positionTitle}
                  onChange={(e) => {
                    setPositionTitle(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="Ví dụ: Senior Frontend Developer"
                />
              </div>

              <div>
                <CustomSelect
                  label="Hình thức hợp đồng"
                  options={[
                    { value: ContractType.FULL_TIME, label: 'Toàn thời gian (Full-time)' },
                    { value: ContractType.PART_TIME, label: 'Bán thời gian (Part-time)' },
                    { value: ContractType.INTERNSHIP, label: 'Thực tập sinh (Internship)' },
                    { value: ContractType.FREELANCE, label: 'Cộng tác viên (Freelance)' }
                  ]}
                  value={contractType}
                  onChange={(val) => {
                    setContractType(val as ContractType)
                    setIsDirty(true)
                  }}
                />
              </div>

              <div className="sm:col-span-2">
                <CustomInput
                  label="Địa điểm làm việc"
                  required
                  value={workLocation}
                  onChange={(e) => {
                    setWorkLocation(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="Địa chỉ làm việc chính thức của ứng viên"
                  icon={<MapPin className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div>
                <CustomInput
                  label="Mức lương chính thức (VND/tháng)"
                  required
                  type="number"
                  value={salary}
                  onChange={(e) => {
                    setSalary(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="20000000"
                  icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                  helperText={`Đọc: ${Number(salary || 0).toLocaleString('vi-VN')} ${currency} (Gross)`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <CustomInput
                    label="Thử việc (Tháng)"
                    type="number"
                    value={probationDurationMonths}
                    onChange={(e) => {
                      setProbationDurationMonths(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="2"
                  />
                </div>
                <div>
                  <CustomInput
                    label="% Lương thử việc"
                    type="number"
                    value={probationSalaryPercentage}
                    onChange={(e) => {
                      setProbationSalaryPercentage(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="85"
                  />
                </div>
              </div>

              <div>
                <CustomDatePicker
                  label="Ngày bắt đầu làm việc (Start Date)"
                  required
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date)
                    setIsDirty(true)
                  }}
                  placeholder="Chọn ngày bắt đầu"
                />
              </div>

              <div>
                <CustomDatePicker
                  label="Hạn chót phản hồi Offer"
                  required
                  value={expirationDate}
                  onChange={(date) => {
                    setExpirationDate(date)
                    setIsDirty(true)
                  }}
                  placeholder="Chọn hạn chót phản hồi"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Benefits & Internal Notes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                3. Chế độ Phúc Lợi & Ghi chú nội bộ
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <CustomTextarea
                  label="Quyền lợi & Chế độ đãi ngộ (Mỗi dòng một quyền lợi)"
                  rows={5}
                  value={benefits}
                  onChange={(e) => {
                    setBenefits(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="Nhập danh sách quyền lợi (thưởng, bảo hiểm, đào tạo...)"
                />
              </div>

              <div>
                <CustomInput
                  label="Ghi chú nội bộ (Chỉ HR & Ban quản lý xem, không gửi ứng viên)"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="Ghi chú thêm về thỏa thuận lương hoặc đề xuất của phòng ban..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Letter Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-4 space-y-3.5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Xem trước Thư mời
                </h3>
              </div>
            </div>

            <div>
              <CustomInput
                label="Tiêu đề email thư mời"
                value={emailSubject}
                onChange={(e) => {
                  setEmailSubject(e.target.value)
                  setIsDirty(true)
                }}
                placeholder="Tiêu đề email gửi đến ứng viên"
              />
            </div>

            {/* Letter Preview Frame */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
              <div
                className="bg-white p-4.5 rounded-lg border border-slate-100 shadow-2xs max-h-[560px] overflow-y-auto text-xs leading-relaxed [scrollbar-width:thin]"
                dangerouslySetInnerHTML={{ __html: offerLetterHtml }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => setIsUnsavedModalOpen(false)}
        onCancel={() => setIsUnsavedModalOpen(false)}
        onConfirm={() => {
          setIsDirty(false)
          setIsUnsavedModalOpen(false)
          router.push(pendingNavigationUrlRef.current || '/offers')
        }}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
