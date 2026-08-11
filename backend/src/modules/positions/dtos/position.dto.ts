import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePositionDto {
  @IsNotEmpty({
    message: 'Tên vị trí không được để trống',
  })
  @IsString()
  name: string;

  @IsNotEmpty({
    message: 'Phòng ban không được để trống',
  })
  @IsMongoId({
    message: 'Department không hợp lệ',
  })
  departmentId: string;
}

export class UpdatePositionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'Tên vị trí không được để trống',
  })
  name?: string;

  @IsOptional()
  @IsMongoId({
    message: 'Department không hợp lệ',
  })
  departmentId?: string;
}