import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ApplyJobDto {
  @IsNotEmpty({ message: 'jobDescriptionId không được để trống' })
  @IsMongoId({ message: 'jobDescriptionId phải là một MongoId hợp lệ' })
  jobDescriptionId: string;

  @IsNotEmpty({ message: 'Vui lòng chọn hồ sơ để ứng tuyển' })
  @IsMongoId({ message: 'candidateId phải là một MongoId hợp lệ' })
  candidateId: string;
}