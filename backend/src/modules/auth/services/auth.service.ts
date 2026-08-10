import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { User, UserDocument } from 'src/modules/users/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
    ) {}

    async register(registerDto: RegisterDto) {
        const {email, name, phone, password, confirm_password} = registerDto

        const isExistedEmail = await this.userModel.findOne({email}).exec()

        if(isExistedEmail) {
            throw new BadRequestException(
                "Email đã tồn tại trong hệ thống"
            )
        }

        if (password !== confirm_password) {
            throw new BadRequestException(
            'Mật khẩu xác nhận không khớp',
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new this.userModel({
            email,
            name,
            phone,
            password: hashedPassword
        })

        await newUser.save()

        return {
            message: "Đăng ký người dùng thành công!"
        }
    }

    async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new UnauthorizedException('Email hoặc Password không chính xác');
    }

    const isMatchedPassword = await bcrypt.compare(password, user.password);
    if (!isMatchedPassword) {
      throw new UnauthorizedException('Email hoặc Password không chính xác');
    }

    const payload = { sub: user.id, email: user.email };

    const userObject = user.toObject();

    const { password: _, ...userWithoutPassword } = userObject;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword
    };
  }
}
