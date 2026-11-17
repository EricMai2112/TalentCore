import {IsEmail, IsNotEmpty, IsString, Matches, MinLength} from 'class-validator'

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