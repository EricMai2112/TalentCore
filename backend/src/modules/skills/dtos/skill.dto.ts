import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';


export class CreateSkillDto {
  @IsString()
  @IsNotEmpty({
    message: 'Tên kỹ năng không được để trống',
  })
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({
    each: true,
    message: 'positionIds không hợp lệ',
  })
  positionIds?: string[];
}