import { z } from 'zod'
import { ContractType } from '../types/offer.types'

export const offerSchema = z
  .object({
    applicationId: z.string().min(1, 'Vui lòng chọn hồ sơ ứng viên nhận Offer'),
    positionTitle: z.string().min(1, 'Vui lòng nhập vị trí công tác chính thức'),
    contractType: z.nativeEnum(ContractType, {
      message: 'Vui lòng chọn hình thức hợp đồng hợp lệ'
    }),
    workLocation: z.string().min(1, 'Vui lòng nhập địa điểm làm việc'),
    salary: z
      .string()
      .min(1, 'Vui lòng nhập mức lương chính thức')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Mức lương phải lớn hơn 0'
      }),
    currency: z.string(),
    probationDurationMonths: z
      .string()
      .min(1, 'Vui lòng nhập số tháng thử việc')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Thời gian thử việc không hợp lệ'
      }),
    probationSalaryPercentage: z
      .string()
      .min(1, 'Vui lòng nhập % lương thử việc')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
        message: '% lương thử việc phải từ 0 đến 100%'
      }),
    startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu làm việc'),
    expirationDate: z.string().min(1, 'Vui lòng chọn hạn chót phản hồi Offer'),
    benefits: z.string().optional(),
    notes: z.string().optional(),
    emailSubject: z.string().optional(),
    offerLetterHtml: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.startDate && data.expirationDate) {
        return new Date(data.expirationDate) <= new Date(data.startDate)
      }
      return true
    },
    {
      message: 'Hạn chót phản hồi phải trước hoặc bằng ngày bắt đầu làm việc',
      path: ['expirationDate']
    }
  )

export type OfferFormData = z.infer<typeof offerSchema>
