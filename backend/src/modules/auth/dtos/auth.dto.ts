import {IsEmail, IsNotEmpty, IsString, Matches, MinLength} from 'class-validator'

export class RegisterDto {
    @IsEmail({}, {message: "Email không đúng định dạng"})
    @IsNotEmpty({message: "Email không được để trống"})
    email: string

    @IsString()
    @MinLength(6, {message: "Mật khẩu phải có ít nhất 6 kí tự"})
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
        message: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số",
    })
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