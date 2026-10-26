import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCandidateProfileDto {
  @IsNotEmpty({ message: 'Tên hồ sơ không được để trống' })
  @IsString({ message: 'Tên hồ sơ phải là chuỗi' })
  profileName: string;

  @IsOptional()
  @IsString()
  cloneFromCandidateId?: string;
}

export class UpdateCandidateProfileDto {

  @IsOptional()
  @IsString()
  profileName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  careerObjective?: string;

  @IsOptional()
  @IsString()
  currentLevel?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  socialLinks?: Array<{ platform: string; url: string }>;

  @IsOptional()
  @IsArray()
  skills?: Array<{ name: string; proficiency?: string; yearsOfExperience?: number }>;

  @IsOptional()
  @IsArray()
  experiences?: Array<any>;

  @IsOptional()
  @IsArray()
  educations?: Array<any>;

  @IsOptional()
  @IsArray()
  projects?: Array<any>;

  @IsOptional()
  @IsArray()
  certifications?: Array<any>;

  @IsOptional()
  @IsArray()
  languages?: Array<any>;

  @IsOptional()
  @IsArray()
  customSections?: Array<any>;
}