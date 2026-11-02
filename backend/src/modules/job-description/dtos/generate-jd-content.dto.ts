import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class GenerateJdContentDto {
  @IsString({ message: 'Tên vị trí tuyển dụng phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên vị trí tuyển dụng không được để trống' })
  title: string;

  @IsString({ message: 'Tên phòng ban phải là chuỗi' })
  @IsOptional()
  departmentName?: string;

  @IsString({ message: 'Tên vị trí danh mục phải là chuỗi' })
  @IsOptional()
  positionName?: string;

  @IsString({ message: 'Địa điểm làm việc phải là chuỗi' })
  @IsOptional()
  location?: string;

  @IsString({ message: 'Hình thức làm việc phải là chuỗi' })
  @IsOptional()
  employmentType?: string;

  @IsString({ message: 'Cấp độ kinh nghiệm phải là chuỗi' })
  @IsOptional()
  experienceLevel?: string;

  @IsNumber({}, { message: 'Lương tối thiểu phải là số' })
  @IsOptional()
  minimumSalary?: number;

  @IsNumber({}, { message: 'Lương tối đa phải là số' })
  @IsOptional()
  maximumSalary?: number;

  @IsArray({ message: 'Danh sách kỹ năng phải là mảng' })
  @IsOptional()
  skillNames?: string[];

  @IsArray({ message: 'Danh sách tiêu chí phải là mảng' })
  @IsOptional()
  criteria?: any[];

  @IsString({ message: 'Phân loại cần sinh phải là chuỗi' })
  @IsOptional()
  section?: 'all' | 'description' | 'requirements' | 'benefits';
}
