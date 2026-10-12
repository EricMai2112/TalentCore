import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class InviteCandidateDto {
  @IsNotEmpty({ message: 'jobDescriptionId không được để trống' })
  @IsMongoId({ message: 'jobDescriptionId phải là một MongoId hợp lệ' })
  jobDescriptionId: string;

  @IsNotEmpty({ message: 'candidateId không được để trống' })
  @IsMongoId({ message: 'candidateId phải là một MongoId hợp lệ' })
  candidateId: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsInt({ message: 'expireDays phải là số nguyên' })
  @Min(1, { message: 'expireDays tối thiểu là 1 ngày' })
  @Max(30, { message: 'expireDays tối đa là 30 ngày' })
  expireDays?: number;
}

export enum InvitationAction {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
}

export class RespondInvitationDto {
  @IsNotEmpty({ message: 'Hành động không được để trống' })
  @IsEnum(InvitationAction, { message: 'Hành động phải là ACCEPT hoặc DECLINE' })
  action: InvitationAction;

  @IsOptional()
  @IsString()
  declineReason?: string;
}
