'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Send,
  Sparkles,
  Building2,
  User,
  DollarSign,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  CheckCircle2,
  Clock
} from 'lucide-react'
import {
  CustomInput,
  CustomSelect,
  CustomDatePicker,
  CustomTextarea,
  CustomButton,
  Toast,
  useToast
} from '@/src/components/common'
import { offersApi } from '../services/offers.api'
import { ContractType } from '../types/offer.types'
import { Department } from '@/src/features/departments/types/department.types'

interface CreateOfferPageContentProps {
  initialApplicationId?: string
  initialApplications?: any[]
  initialDepartments?: Department[]
}

export default function CreateOfferPageContent({
  initialApplicationId,
  initialApplications = [],
  initialDepartments = []
}: CreateOfferPageContentProps) {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()

  const [selectedApplicationId, setSelectedApplicationId] = useState<string>(
    initialApplicationId || ''
  )
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
    'Bảo hiểm sức khỏe toàn diện PTI\nThưởng lương tháng 13 & thưởng hiệu quả kinh doanh\nXét tăng lương định kỳ 2 lần/năm\nPhụ cấp ăn trưa, gửi xe và teambuilding hàng quý\nTrang bị máy tính làm việc hiệu năng cao (MacBook / Dell XPS)'
  )
  const [notes, setNotes] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [offerLetterHtml, setOfferLetterHtml] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Set default dates: start in 14 days, expire in 3 days
  useEffect(() => {
    const today = new Date()
    const inTwoWeeks = new Date(today)
    inTwoWeeks.setDate(today.getDate() + 14)
    const inThreeDays = new Date(today)
    inThreeDays.setDate(today.getDate() + 3)

    setStartDate(inTwoWeeks.toISOString().split('T')[0])
    setExpirationDate(inThreeDays.toISOString().split('T')[0])
  }, [])

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
      'Ứng viên'
    )
  }, [selectedApp])

  const candidateEmail = useMemo(() => {
    return selectedApp?.candidateId?.userId?.email || selectedApp?.candidateEmail || ''
  }, [selectedApp])

  const candidatePhone = useMemo(() => {
    return selectedApp?.candidateId?.userId?.phone || selectedApp?.candidatePhone || ''
  }, [selectedApp])

  const jobTitle = useMemo(() => {
    return (
      selectedApp?.jobDescriptionId?.title ||
      selectedApp?.jobTitle ||
      selectedApp?.positionTitle ||
      ''
    )
  }, [selectedApp])

  const departmentName = useMemo(() => {
    return (
      selectedApp?.departmentId?.name ||
      selectedApp?.jobDescriptionId?.departmentId?.name ||
      'TalentCore'
    )
  }, [selectedApp])

  useEffect(() => {
    if (jobTitle && !positionTitle) {
      setPositionTitle(jobTitle)
    }
  }, [jobTitle, positionTitle])

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
      .map((b) => `<li style="margin-bottom: 6px;">${b}</li>`)
      .join('\n')

    const subject = `[TalentCore] Thư mời nhận việc - Vị trí ${positionTitle || jobTitle || 'Chuyên viên'} - ${candidateName}`
    const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
  <div style="text-align: center; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0;">
    <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 700;">THƯ MỜI NHẬN VIỆC (JOB OFFER LETTER)</h1>
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
    if (!selectedApp) {
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

      const candidateId =
        typeof selectedApp.candidateId === 'object'
          ? selectedApp.candidateId._id
          : selectedApp.candidateId

      const jobDescriptionId =
        typeof selectedApp.jobDescriptionId === 'object'
          ? selectedApp.jobDescriptionId._id
          : selectedApp.jobDescriptionId

      const departmentId =
        typeof selectedApp.departmentId === 'object'
          ? selectedApp.departmentId?._id
          : selectedApp.departmentId ||
            selectedApp.jobDescriptionId?.departmentId?._id ||
            selectedApp.jobDescriptionId?.departmentId

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

      showToast(
        sendImmediately
          ? 'Đã gửi lời mời nhận việc thành công đến ứng viên!'
          : 'Đã lưu bản nháp đề nghị nhận việc thành công!',
        'success'
      )

      // Redirect back to offers management page after short delay
      setTimeout(() => {
        router.push('/offers')
      }, 1000)
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo đề nghị nhận việc', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Top Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                Giai đoạn 5
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Soạn Đề Nghị Nhận Việc (Job Offer)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Thiết lập điều khoản tuyển dụng và xuất bản thư mời nhận việc chính thức gửi ứng viên
            </p>
          </div>
        </div>

        {/* Action Buttons on Top Bar */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <CustomButton
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Hủy bỏ
          </CustomButton>
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            Lưu bản nháp
          </CustomButton>
          <CustomButton
            type="button"
            variant="primary"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            icon={Send}
          >
            Gửi đề nghị ngay cho ứng viên
          </CustomButton>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Candidate Selection & Info */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                1. Thông tin Ứng viên & Hồ sơ
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Chọn hồ sơ ứng viên nhận Offer *
              </label>
              <CustomSelect
                options={initialApplications.map((app) => ({
                  value: app._id || app.id,
                  label: `${
                    app.candidateName ||
                    app.candidateId?.userId?.name ||
                    app.candidateId?.profileName ||
                    'Ứng viên'
                  } — ${app.jobTitle || app.jobDescriptionId?.title || 'Vị trí'} (${
                    app.departmentId?.name ||
                    app.jobDescriptionId?.departmentId?.name ||
                    'Phòng ban'
                  })`
                }))}
                value={selectedApplicationId}
                onChange={(val) => setSelectedApplicationId(val)}
                placeholder="-- Chọn hồ sơ ứng viên để soạn Offer --"
              />
            </div>

            {/* Candidate Card Summary */}
            {selectedApp && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                    {candidateName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{candidateName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-2xs font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Đạt yêu cầu phỏng vấn
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{departmentName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Work Conditions & Compensation */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                2. Vị trí, Địa điểm & Chế độ Lương thưởng
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Vị trí công tác chính thức *
                </label>
                <CustomInput
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  placeholder="Ví dụ: Senior Frontend Developer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Hình thức hợp đồng
                </label>
                <CustomSelect
                  options={[
                    { value: ContractType.FULL_TIME, label: 'Toàn thời gian (Full-time)' },
                    { value: ContractType.PART_TIME, label: 'Bán thời gian (Part-time)' },
                    { value: ContractType.INTERNSHIP, label: 'Thực tập sinh (Internship)' },
                    { value: ContractType.FREELANCE, label: 'Cộng tác viên (Freelance)' }
                  ]}
                  value={contractType}
                  onChange={(val) => setContractType(val as ContractType)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Địa điểm làm việc *
                </label>
                <CustomInput
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="Địa chỉ làm việc chính thức của ứng viên"
                  icon={<MapPin className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Mức lương chính thức (VND/tháng) *
                </label>
                <CustomInput
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="20000000"
                  icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                />
                <p className="text-2xs text-slate-500 font-semibold mt-1">
                  Đọc: {Number(salary || 0).toLocaleString('vi-VN')} {currency} (Gross)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Thử việc (Tháng)
                  </label>
                  <CustomInput
                    type="number"
                    value={probationDurationMonths}
                    onChange={(e) => setProbationDurationMonths(e.target.value)}
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    % Lương thử việc
                  </label>
                  <CustomInput
                    type="number"
                    value={probationSalaryPercentage}
                    onChange={(e) => setProbationSalaryPercentage(e.target.value)}
                    placeholder="85"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Ngày bắt đầu làm việc (Start Date) *
                </label>
                <CustomDatePicker
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholder="Chọn ngày bắt đầu"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Hạn chót phản hồi Offer *
                </label>
                <CustomDatePicker
                  value={expirationDate}
                  onChange={(date) => setExpirationDate(date)}
                  placeholder="Chọn hạn chót phản hồi"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Benefits & Internal Notes */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                3. Chế độ Phúc Lợi & Ghi chú nội bộ
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Quyền lợi & Chế độ đãi ngộ (Mỗi dòng một quyền lợi)
                </label>
                <CustomTextarea
                  rows={5}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Nhập danh sách quyền lợi (thưởng, bảo hiểm, đào tạo...)"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Ghi chú nội bộ (Chỉ HR & Ban quản lý xem, không gửi ứng viên)
                </label>
                <CustomInput
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú thêm về thỏa thuận lương hoặc đề xuất của phòng ban..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Letter Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Xem trước Thư mời (Preview)
                </h3>
              </div>
              <button
                type="button"
                onClick={generateTemplate}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
                title="Cập nhật lại theo dữ liệu đã nhập"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Làm mới
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Tiêu đề email thư mời
              </label>
              <CustomInput
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Tiêu đề email gửi đến ứng viên"
              />
            </div>

            {/* Letter Preview Frame */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div
                className="bg-white p-5 rounded-xl border border-slate-100 shadow-2xs max-h-[580px] overflow-y-auto text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: offerLetterHtml }}
              />
            </div>
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  )
}
