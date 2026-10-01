import { z } from 'zod'
import {
  EmploymentType,
  JobPriority,
  JobStatus,
  CriteriaRequirementType
} from '../types/job-description.types'

export const jobCriteriaSchema = z.object({
  name: z.string().min(1, 'Tên tiêu chí không được để trống'),
  requirementType: z.nativeEnum(CriteriaRequirementType),
  weight: z
    .number()
    .min(0, 'Trọng số không thể âm')
    .max(100, 'Trọng số không thể vượt quá 100%'),
  skillId: z.string().optional()
})

export type JobCriteriaFormData = z.infer<typeof jobCriteriaSchema>

export const jobRequestStep1Schema = z
  .object({
    title: z.string().min(1, 'Tên vị trí không được để trống'),
    departmentId: z.string().min(1, 'Hãy chọn một phòng ban'),
    positionId: z.string().optional(),
    location: z.string().min(1, 'Địa điểm không được để trống'),
    employmentType: z.nativeEnum(EmploymentType),
    minimumSalary: z
      .union([z.number(), z.string()])
      .refine((v) => v !== '' && !isNaN(Number(v)) && Number(v) >= 0, {
        message: 'Vui lòng nhập mức lương tối thiểu hợp lệ'
      }),
    maximumSalary: z
      .union([z.number(), z.string()])
      .refine((v) => v !== '' && !isNaN(Number(v)) && Number(v) >= 0, {
        message: 'Vui lòng nhập mức lương tối đa hợp lệ'
      }),
    headcount: z.number().min(1, 'Số lượng tuyển phải lớn hơn hoặc bằng 1'),
    priority: z.nativeEnum(JobPriority),
    experienceLevel: z.string().min(1, 'Vui lòng chọn mức kinh nghiệm'),
    applicationDeadline: z.string().optional(),
    requiredSkills: z.array(z.string()).default([]),
    criteria: z
      .array(jobCriteriaSchema)
      .min(1, 'Thêm ít nhất một tiêu chí đánh giá cho công việc')
  })
  .refine(
    (data) => {
      const min = Number(data.minimumSalary)
      const max = Number(data.maximumSalary)
      return min <= max
    },
    {
      message: 'Lương tối thiểu không được lớn hơn lương tối đa',
      path: ['minimumSalary']
    }
  )
  .refine(
    (data) => {
      const sum = data.criteria.reduce((acc, c) => acc + (Number(c.weight) || 0), 0)
      return Math.abs(sum - 100) < 0.01
    },
    {
      message: 'Tổng trọng số tất cả các tiêu chí phải bằng đúng 100%',
      path: ['criteria']
    }
  )

export const jobRequestStep2Schema = z.object({
  description: z.string().min(1, 'Mô tả công việc không được để trống'),
  requirements: z.string().min(1, 'Yêu cầu công việc không được để trống'),
  benefits: z.string().min(1, 'Quyền lợi không được để trống')
})

export const jobRequestStep3Schema = z.object({
  pipelineTemplateId: z.string().min(1, 'Vui lòng chọn mẫu Quy trình phỏng vấn'),
  status: z.nativeEnum(JobStatus).default(JobStatus.PENDING)
})

export const jobRequestFullSchema = z
  .object({
    title: z.string().min(1, 'Tên vị trí không được để trống'),
    departmentId: z.string().min(1, 'Hãy chọn một phòng ban'),
    positionId: z.string().optional(),
    location: z.string().min(1, 'Địa điểm không được để trống'),
    employmentType: z.nativeEnum(EmploymentType),
    minimumSalary: z
      .union([z.number(), z.string()])
      .refine((v) => v !== '' && !isNaN(Number(v)) && Number(v) >= 0, {
        message: 'Vui lòng nhập mức lương tối thiểu hợp lệ'
      }),
    maximumSalary: z
      .union([z.number(), z.string()])
      .refine((v) => v !== '' && !isNaN(Number(v)) && Number(v) >= 0, {
        message: 'Vui lòng nhập mức lương tối đa hợp lệ'
      }),
    headcount: z.number().min(1, 'Số lượng tuyển phải lớn hơn hoặc bằng 1'),
    priority: z.nativeEnum(JobPriority),
    experienceLevel: z.string().min(1, 'Vui lòng chọn mức kinh nghiệm'),
    applicationDeadline: z.string().optional(),
    requiredSkills: z.array(z.string()).default([]),
    criteria: z
      .array(jobCriteriaSchema)
      .min(1, 'Thêm ít nhất một tiêu chí đánh giá cho công việc'),
    description: z.string().min(1, 'Mô tả công việc không được để trống'),
    requirements: z.string().min(1, 'Yêu cầu công việc không được để trống'),
    benefits: z.string().min(1, 'Quyền lợi không được để trống'),
    pipelineTemplateId: z.string().min(1, 'Vui lòng chọn mẫu Quy trình phỏng vấn'),
    status: z.nativeEnum(JobStatus).default(JobStatus.PENDING)
  })
  .refine(
    (data) => {
      const min = Number(data.minimumSalary)
      const max = Number(data.maximumSalary)
      return min <= max
    },
    {
      message: 'Lương tối thiểu không được lớn hơn lương tối đa',
      path: ['minimumSalary']
    }
  )
  .refine(
    (data) => {
      const sum = data.criteria.reduce((acc, c) => acc + (Number(c.weight) || 0), 0)
      return Math.abs(sum - 100) < 0.01
    },
    {
      message: 'Tổng trọng số tất cả các tiêu chí phải bằng đúng 100%',
      path: ['criteria']
    }
  )

export type JobRequestFormData = z.infer<typeof jobRequestFullSchema>
