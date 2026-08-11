import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole, UserStatus } from "../schemas/user.schema";

export class CreateEmployeeDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role: UserRole;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class ToggleStatusDto {
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  status: UserStatus;
}