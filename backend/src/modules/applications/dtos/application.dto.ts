import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class ApplyJobDto {
  @IsNotEmpty({ message: 'jobDescriptionId không được để trống' })
  @IsMongoId({ message: 'jobDescriptionId phải là một MongoId hợp lệ' })
  jobDescriptionId: string;

  @IsOptional()
  @IsMongoId({ message: 'candidateId phải là một MongoId hợp lệ' })
  candidateId?: string;
}