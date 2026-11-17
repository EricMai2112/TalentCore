import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto, LoginDto, RegisterDto } from '../dtos/auth.dto';
import { User, UserDocument, UserStatus } from '../../users/schemas/user.schema';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, confirm_password } = registerDto;

    const isExistedEmail = await this.userService.findByEmail(email);

    if (isExistedEmail) {
      throw new BadRequestException('Email đã tồn tại trong hệ thống');
    }

    if (password !== confirm_password) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userService.createUser({
      email,
      password: hashedPassword,
    });

    return {
      message: 'Đăng ký người dùng thành công!',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email hoặc Password không chính xác');
    }

    const isMatchedPassword = await bcrypt.compare(password, user.password);
    if (!isMatchedPassword) {
      throw new UnauthorizedException('Email hoặc Password không chính xác');
    }

    if (user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      departmentId: user.departmentId ? user.departmentId.toString() : undefined,
    };

    const userObject = user.toObject();

    const { password: _, ...userWithoutPassword } = userObject;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async getMe(identifier: string) {
    let user;
    if (isValidObjectId(identifier)) {
      user = await this.userService.findById(identifier);
    }
    if (!user) {
      user = await this.userService.findByEmail(identifier);
    }
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return userWithoutPassword;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = dto;

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updateUserById(userId, { password: hashedPassword });

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }
}
