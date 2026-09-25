import { IsNotEmpty, IsIn, IsOptional, IsString } from 'class-validator';

export class RespondOfferDto {
  @IsNotEmpty({ message: 'Hành động không được để trống' })
  @IsIn(['ACCEPT', 'DECLINE'], { message: 'Hành động phải là ACCEPT hoặc DECLINE' })
  action: 'ACCEPT' | 'DECLINE';

  @IsOptional()
  @IsString({ message: 'Lý do từ chối phải là chuỗi ký tự' })
  declineReason?: string;
}
