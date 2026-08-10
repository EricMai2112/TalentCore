import {IsEmail, IsNotEmpty, IsString, Matches, MinLength} from 'class-validator'

export class RegisterDto {
    @IsEmail({}, {message: "Email không đúng định dạng"})
    @IsNotEmpty({message: "Email không được để trống"})
    email: string

    @IsString()
    @IsNotEmpty({message: "Tên không được để trống"})
    name: string

    @IsString()
    @MinLength(6, {message: "Mật khẩu phải có ít nhất 6 kí tự"})
    @IsNotEmpty({message: "Mật khẩu không được để trống"})
    password: string

    @IsString()
    @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu' })
    confirm_password: string

    @IsString()
    @IsNotEmpty({message: "Số điện thoại không được để trống"})
    @Matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, {
    message: 'Số điện thoại không đúng định dạng',
})
    phone: string
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