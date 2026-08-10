import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmailTemplateType } from '../schemas/email-template.schema';

export class CreateEmailTemplateDto {
  @IsString({ message: 'Tên template không hợp lệ' })
  @IsNotEmpty({ message: 'Tên template không được để trống' })
  name: string;

  @IsEnum(EmailTemplateType, { message: 'Loại template không hợp lệ' })
  @IsNotEmpty({ message: 'Loại template không được để trống' })
  type: EmailTemplateType;

  @IsString({ message: 'Tiêu đề email không hợp lệ' })
  @IsNotEmpty({ message: 'Tiêu đề email không được để trống' })
  subject: string;

  @IsString({ message: 'Nội dung email không hợp lệ' })
  @IsNotEmpty({ message: 'Nội dung email không được để trống' })
  body: string;

  @IsArray({ message: 'Placeholders phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi placeholder phải là chuỗi' })
  @IsOptional()
  placeholders?: string[];
}

export class UpdateEmailTemplateDto {
  @IsString({ message: 'Tên template không hợp lệ' })
  @IsNotEmpty({ message: 'Tên template không được để trống' })
  @IsOptional()
  name?: string;

  @IsEnum(EmailTemplateType, { message: 'Loại template không hợp lệ' })
  @IsOptional()
  type?: EmailTemplateType;

  @IsString({ message: 'Tiêu đề email không hợp lệ' })
  @IsNotEmpty({ message: 'Tiêu đề email không được để trống' })
  @IsOptional()
  subject?: string;

  @IsString({ message: 'Nội dung email không hợp lệ' })
  @IsNotEmpty({ message: 'Nội dung email không được để trống' })
  @IsOptional()
  body?: string;

  @IsArray({ message: 'Placeholders phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi placeholder phải là chuỗi' })
  @IsOptional()
  placeholders?: string[];
}
