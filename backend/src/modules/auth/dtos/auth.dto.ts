import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, {message: "Email không đúng định dạng"})
    @IsNotEmpty({message: "Email không được để trống"})
    email: string

    @IsString()
    @MinLength(6, {message: "Mật khẩu phải có ít nhất 6 kí tự"})
    @IsNotEmpty({message: "Mật khẩu không được để trống"})
    password: string

    @IsString()
    @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu' })
    confirm_password: string
}

export class LoginDto {
    @IsEmail({}, {message: "Email không đúng định dạng"})
    @IsNotEmpty({message: "Email không được để trống"})
    email: string

    @IsString()
    @MinLength(6, {message: "Mật khẩu phải có ít nhất 6 kí tự"})
    @IsNotEmpty({message: "Mật khẩu không được để trống"})
    password: string
}

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
    oldPassword: string

    @IsString()
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    newPassword: string

    @IsString()
    @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu mới' })
    confirmPassword: string
}

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
}

export class VerifyForgotPasswordDto {
    @IsString({ message: 'Mã xác thực hoặc liên kết không hợp lệ' })
    @IsNotEmpty({ message: 'Mã xác thực không được để trống' })
    token: string;
}

export class ResetPasswordDto {
    @IsString({ message: 'Mã xác thực liên kết không hợp lệ' })
    @IsNotEmpty({ message: 'Mã xác thực liên kết không được để trống' })
    token: string;

    @IsString()
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu mới' })
    confirm_password: string;
}
