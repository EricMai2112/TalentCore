import { IsMongoId, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SaveJobDraftDto {
  @IsNotEmpty({ message: 'positionId không được để trống' })
  @IsMongoId({ message: 'positionId phải là một MongoId hợp lệ' })
  positionId: string;

  @IsNotEmpty({ message: 'experienceLevel không được để trống' })
  @IsString({ message: 'experienceLevel phải là một chuỗi' })
  experienceLevel: string;

  @IsNotEmpty({ message: 'departmentId không được để trống' })
  @IsMongoId({ message: 'departmentId phải là một MongoId hợp lệ' })
  departmentId: string;

  @IsNotEmpty({ message: 'draftData không được để trống' })
  @IsObject({ message: 'draftData phải là một object' })
  draftData: Record<string, any>;
}
