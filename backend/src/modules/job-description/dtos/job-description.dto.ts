import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { EmploymentType, JobStatus, JobPriority } from '../schemas/job-description.schema';

export class CreateJobDescriptionDto {
  @IsString({ message: 'Pipeline template id phải là chuỗi' })
  @IsNotEmpty({ message: 'Pipeline template id không được để trống' })
  pipelineTemplateId: string;

  @IsString({ message: 'Department id phải là chuỗi' })
  @IsNotEmpty({ message: 'Department id không được để trống' })
  departmentId: string;

  @IsString({ message: 'Position id phải là chuỗi' })
  @IsOptional()
  positionId?: string;

  @IsString({ message: 'Interviewer id phải là chuỗi' })
  @IsOptional()
  interviewerId?: string;

  @IsString({ message: 'Tiêu đề không hợp lệ' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @IsString({ message: 'Địa điểm không hợp lệ' })
  @IsNotEmpty({ message: 'Địa điểm không được để trống' })
  location: string;

  @IsEnum(EmploymentType, { message: 'Hình thức làm việc không hợp lệ' })
  @IsNotEmpty({ message: 'Hình thức làm việc không được để trống' })
  employmentType: EmploymentType;

  @IsNumber({}, { message: 'Lương tối thiểu phải là số' })
  @Min(0, { message: 'Lương tối thiểu phải lớn hơn hoặc bằng 0' })
  minimumSalary: number;

  @IsNumber({}, { message: 'Lương tối đa phải là số' })
  @Min(0, { message: 'Lương tối đa phải lớn hơn hoặc bằng 0' })
  maximumSalary: number;

  @IsArray({ message: 'requiredSkills phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi skill id phải là chuỗi' })
  @IsOptional()
  requiredSkills?: string[];

  @IsString({ message: 'Yêu cầu kinh nghiệm không hợp lệ' })
  @IsNotEmpty({ message: 'Yêu cầu kinh nghiệm không được để trống' })
  experienceLevel: string;

  @IsString({ message: 'Mô tả công việc không hợp lệ' })
  @IsNotEmpty({ message: 'Mô tả công việc không được để trống' })
  description: string;

  @IsString({ message: 'Yêu cầu công việc không hợp lệ' })
  @IsNotEmpty({ message: 'Yêu cầu công việc không được để trống' })
  requirements: string;

  @IsString({ message: 'Quyền lợi không hợp lệ' })
  @IsNotEmpty({ message: 'Quyền lợi không được để trống' })
  benefits: string;

  @IsEnum(JobStatus, { message: 'Trạng thái công việc không hợp lệ' })
  @IsOptional()
  status?: JobStatus;

  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @IsOptional()
  note?: string;

  @IsEnum(JobPriority, { message: 'Độ ưu tiên không hợp lệ' })
  @IsOptional()
  priority?: JobPriority;

  @IsString({ message: 'Người đăng phải là chuỗi' })
  @IsOptional()
  postedById?: string;

  @IsNumber({}, { message: 'Số lượng tuyển phải là số' })
  @Min(1, { message: 'Số lượng tuyển phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  headcount?: number;

  @IsDateString({}, { message: 'Hạn nộp hồ sơ phải là ngày hợp lệ' })
  @IsOptional()
  applicationDeadline?: string;
}

export class UpdateJobDescriptionDto {
  @IsString({ message: 'Pipeline template id phải là chuỗi' })
  @IsOptional()
  pipelineTemplateId?: string;

  @IsString({ message: 'Department id phải là chuỗi' })
  @IsOptional()
  departmentId?: string;

  @IsString({ message: 'Position id phải là chuỗi' })
  @IsOptional()
  positionId?: string;

  @IsString({ message: 'Interviewer id phải là chuỗi' })
  @IsOptional()
  interviewerId?: string;

  @IsString({ message: 'Tiêu đề không hợp lệ' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Địa điểm không hợp lệ' })
  @IsOptional()
  location?: string;

  @IsEnum(EmploymentType, { message: 'Hình thức làm việc không hợp lệ' })
  @IsOptional()
  employmentType?: EmploymentType;

  @IsNumber({}, { message: 'Lương tối thiểu phải là số' })
  @Min(0, { message: 'Lương tối thiểu phải lớn hơn hoặc bằng 0' })
  @IsOptional()
  minimumSalary?: number;

  @IsNumber({}, { message: 'Lương tối đa phải là số' })
  @Min(0, { message: 'Lương tối đa phải lớn hơn hoặc bằng 0' })
  @IsOptional()
  maximumSalary?: number;

  @IsArray({ message: 'requiredSkills phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi skill id phải là chuỗi' })
  @IsOptional()
  requiredSkills?: string[];

  @IsString({ message: 'Yêu cầu kinh nghiệm không hợp lệ' })
  @IsOptional()
  experienceLevel?: string;

  @IsString({ message: 'Mô tả công việc không hợp lệ' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Yêu cầu công việc không hợp lệ' })
  @IsOptional()
  requirements?: string;

  @IsString({ message: 'Quyền lợi không hợp lệ' })
  @IsOptional()
  benefits?: string;

  @IsEnum(JobStatus, { message: 'Trạng thái công việc không hợp lệ' })
  @IsOptional()
  status?: JobStatus;

  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @IsOptional()
  note?: string;

  @IsEnum(JobPriority, { message: 'Độ ưu tiên không hợp lệ' })
  @IsOptional()
  priority?: JobPriority;

  @IsString({ message: 'Người đăng phải là chuỗi' })
  @IsOptional()
  postedById?: string;

  @IsNumber({}, { message: 'Số lượng tuyển phải là số' })
  @Min(1, { message: 'Số lượng tuyển phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  headcount?: number;

  @IsDateString({}, { message: 'Hạn nộp hồ sơ phải là ngày hợp lệ' })
  @IsOptional()
  applicationDeadline?: string;
}
