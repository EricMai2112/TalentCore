import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSkillDto {
  @IsNotEmpty({
    message: 'Tên kỹ năng không được để trống',
  })
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({
    each: true,
    message: 'Alias phải là chuỗi',
  })
  aliases?: string[];
}