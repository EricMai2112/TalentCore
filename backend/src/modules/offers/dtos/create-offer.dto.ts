import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  Min,
  IsBoolean,
} from 'class-validator';
import { ContractType } from '../schemas/offer.schema';

export class CreateOfferDto {
  @IsNotEmpty({ message: 'applicationId không được để trống' })
  @IsString()
  applicationId: string;

  @IsNotEmpty({ message: 'candidateId không được để trống' })
  @IsString()
  candidateId: string;

  @IsNotEmpty({ message: 'jobDescriptionId không được để trống' })
  @IsString()
  jobDescriptionId: string;

  @IsNotEmpty({ message: 'departmentId không được để trống' })
  @IsString()
  departmentId: string;

  @IsNotEmpty({ message: 'Vị trí công việc không được để trống' })
  @IsString()
  positionTitle: string;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsNotEmpty({ message: 'Địa điểm làm việc không được để trống' })
  @IsString()
  workLocation: string;

  @IsNotEmpty({ message: 'Mức lương không được để trống' })
  @IsNumber()
  @Min(0)
  salary: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  probationDurationMonths?: number;

  @IsOptional()
  @IsNumber()
  probationSalaryPercentage?: number;

  @IsNotEmpty({ message: 'Ngày bắt đầu làm việc không được để trống' })
  @IsDateString()
  startDate: string;

  @IsNotEmpty({ message: 'Hạn phản hồi offer không được để trống' })
  @IsDateString()
  expirationDate: string;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty({ message: 'Tiêu đề thư mời nhận việc không được để trống' })
  @IsString()
  emailSubject: string;

  @IsNotEmpty({ message: 'Nội dung thư mời nhận việc không được để trống' })
  @IsString()
  offerLetterHtml: string;

  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
