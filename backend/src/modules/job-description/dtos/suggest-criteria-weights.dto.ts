import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JobCriteriaDto } from './job-description.dto';

export class SuggestCriteriaWeightsDto {
  @IsString({ message: 'Vị trí tuyển dụng phải là chuỗi' })
  @IsOptional()
  positionTitle?: string;

  @IsString({ message: 'Cấp độ kinh nghiệm phải là chuỗi' })
  @IsOptional()
  experienceLevel?: string;

  @IsString({ message: 'Phòng ban phải là chuỗi' })
  @IsOptional()
  departmentName?: string;

  @IsArray({ message: 'criteria phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => JobCriteriaDto)
  criteria: JobCriteriaDto[];
}
