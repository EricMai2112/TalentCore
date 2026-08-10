import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStageDto {
  @IsString({ message: 'Tên stage không hợp lệ' })
  @IsNotEmpty({ message: 'Tên stage không được để trống' })
  name: string;

  @IsInt({ message: 'Order phải là số nguyên' })
  @Min(0, { message: 'Order phải >= 0' })
  order: number;

  @IsString({ message: 'Color không hợp lệ' })
  @IsNotEmpty({ message: 'Color không được để trống' })
  color: string;
}

export class CreatePipelineTemplateDto {
  @IsString({ message: 'Tên template không hợp lệ' })
  @IsNotEmpty({ message: 'Tên template không được để trống' })
  name: string;

  @IsArray({ message: 'Stages phải là một mảng' })
  @ArrayMinSize(1, { message: 'Pipeline template phải có ít nhất 1 stage' })
  @ValidateNested({ each: true })
  @Type(() => CreateStageDto)
  stages: CreateStageDto[];
}

export class UpdateStageDto {
  @IsString({ message: 'Tên stage không hợp lệ' })
  @IsNotEmpty({ message: 'Tên stage không được để trống' })
  @IsOptional()
  name?: string;

  @IsInt({ message: 'Order phải là số nguyên' })
  @Min(0, { message: 'Order phải >= 0' })
  @IsOptional()
  order?: number;

  @IsString({ message: 'Color không hợp lệ' })
  @IsNotEmpty({ message: 'Color không được để trống' })
  @IsOptional()
  color?: string;
}

export class UpdatePipelineTemplateDto {
  @IsString({ message: 'Tên template không hợp lệ' })
  @IsNotEmpty({ message: 'Tên template không được để trống' })
  @IsOptional()
  name?: string;

  @IsArray({ message: 'Stages phải là một mảng' })
  @ArrayMinSize(1, { message: 'Pipeline template phải có ít nhất 1 stage' })
  @ValidateNested({ each: true })
  @Type(() => UpdateStageDto)
  @IsOptional()
  stages?: UpdateStageDto[];
}
