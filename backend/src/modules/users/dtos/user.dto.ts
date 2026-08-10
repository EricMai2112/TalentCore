import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { UserRole } from "../schemas/user.schema";

export class CreateEmployeeDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsEnum(UserRole, {
    message: 'Vai trò không hợp lệ',
  })
  role: UserRole;

  // @IsMongoId({
  //   message: 'Department không hợp lệ',
  // })
  @IsNotEmpty({
    message: 'Department không được để trống',
  })
  @IsOptional()
  departmentId?: string;
}