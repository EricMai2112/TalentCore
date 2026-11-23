import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dtos/auth.dto';
import { User, UserDocument, UserStatus } from '../../users/schemas/user.schema';
import { UserService } from '../../users/services/user.service';
import { EmailService } from '../../email-template/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
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

  /**
   * Quên mật khẩu: Kiểm tra email, rate limit, sinh Token + OTP, gửi email qua AWS SES
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email.trim().toLowerCase());
    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống');
    }

    if (user.status === UserStatus.LOCKED) {
      throw new BadRequestException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.');
    }

    const now = new Date();

    // 1. Cooldown 60s giữa 2 lần gửi yêu cầu liên tiếp
    if (user.forgot_password_requested_at) {
      const diff = now.getTime() - new Date(user.forgot_password_requested_at).getTime();
      if (diff < 60 * 1000) {
        const remain = Math.ceil((60 * 1000 - diff) / 1000);
        throw new BadRequestException(`Vui lòng đợi ${remain} giây trước khi gửi lại yêu cầu.`);
      }
    }

    // 2. Rate limit trong khung 2 giờ (Tối đa 5 lần)
    const windowStart = user.forgot_password_request_window_start
      ? new Date(user.forgot_password_request_window_start).getTime()
      : 0;
    let requestCount = user.forgot_password_request_count || 0;
    let newWindowStart = user.forgot_password_request_window_start;

    if (!windowStart || now.getTime() - windowStart > 2 * 60 * 60 * 1000) {
      requestCount = 0;
      newWindowStart = now;
    }

    if (requestCount >= 5) {
      throw new BadRequestException('Bạn đã gửi quá nhiều yêu cầu khôi phục mật khẩu. Vui lòng thử lại sau 2 giờ.');
    }

    // 3. Tạo JWT Token đặt lại mật khẩu (Hiệu lực 15 phút)
    const secret =
      this.configService.get<string>('JWT_SECRET_FORGOT_PASSWORD_TOKEN') ||
      this.configService.get<string>('JWT_SECRET') ||
      'talentcore_forgot_password_secret_2026';

    const resetToken = await this.jwtService.signAsync(
      {
        sub: user._id.toString(),
        email: user.email,
        type: 'FORGOT_PASSWORD',
      },
      {
        secret,
        expiresIn: '15m',
      },
    );

    // 4. Lưu Token vào User document
    await this.userService.updateUserById(user._id.toString(), {
      forgot_password_token: resetToken,
      forgot_password_requested_at: now,
      forgot_password_request_count: requestCount + 1,
      forgot_password_request_window_start: newWindowStart,
    });

    // 5. Gửi email chứa liên kết qua AWS SES
    await this.emailService.sendForgotPasswordEmail({
      toEmail: user.email,
      candidateName: user.name,
      resetToken,
    });

    return {
      message: `Liên kết đặt lại mật khẩu đã được gửi đến email ${user.email}. Vui lòng kiểm tra hộp thư để tiến hành đổi mật khẩu.`,
    };
  }

  /**
   * Xác thực tính hợp lệ của Token đặt lại mật khẩu
   */
  async verifyForgotPasswordToken(token: string) {
    if (!token) {
      throw new BadRequestException('Mã xác thực không được để trống.');
    }

    const secret =
      this.configService.get<string>('JWT_SECRET_FORGOT_PASSWORD_TOKEN') ||
      this.configService.get<string>('JWT_SECRET') ||
      'talentcore_forgot_password_secret_2026';

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException('Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.');
    }

    const user = await this.userService.findById(decoded.sub);
    if (!user || user.forgot_password_token !== token) {
      throw new UnauthorizedException('Liên kết khôi phục mật khẩu đã được sử dụng hoặc không còn hiệu lực.');
    }

    return {
      valid: true,
      email: user.email,
    };
  }

  /**
   * Đặt lại mật khẩu mới qua Token liên kết xác thực email
   */
  async resetPassword(dto: ResetPasswordDto) {
    const { password, confirm_password, token } = dto;

    if (password !== confirm_password) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp.');
    }

    // 1. Xác thực Token
    const secret =
      this.configService.get<string>('JWT_SECRET_FORGOT_PASSWORD_TOKEN') ||
      this.configService.get<string>('JWT_SECRET') ||
      'talentcore_forgot_password_secret_2026';

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }

    const user = await this.userService.findById(decoded.sub);
    if (!user || user.forgot_password_token !== token) {
      throw new UnauthorizedException('Liên kết đặt lại mật khẩu đã được sử dụng hoặc không còn hiệu lực.');
    }

    // 2. Băm mật khẩu mới và cập nhật, xóa token đã dùng
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userService.updateUserById(user._id.toString(), {
      password: hashedPassword,
      forgot_password_token: '',
      forgot_password_requested_at: null,
    });

    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
    };
  }

  /**
   * Gửi mã xác thực OTP 6 số qua email cho ứng dụng di động
   */
  async sendForgotPasswordOtp(email: string) {
    if (!email) {
      throw new BadRequestException('Vui lòng cung cấp địa chỉ email.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await this.userService.findByEmail(cleanEmail);

    if (!user) {
      return {
        message: `Nếu email tồn tại trong hệ thống, mã xác thực OTP sẽ được gửi đến ${cleanEmail}.`,
      };
    }

    const now = new Date();

    if (user.forgot_password_requested_at) {
      const diff = now.getTime() - new Date(user.forgot_password_requested_at).getTime();
      if (diff < 60 * 1000) {
        const remain = Math.ceil((60 * 1000 - diff) / 1000);
        throw new BadRequestException(`Vui lòng đợi ${remain} giây trước khi gửi lại mã OTP.`);
      }
    }

    // 2. Rate limit trong khung 2 giờ (Tối đa 5 lần)
    const windowStart = user.forgot_password_request_window_start
      ? new Date(user.forgot_password_request_window_start).getTime()
      : 0;
    let requestCount = user.forgot_password_request_count || 0;
    let newWindowStart = user.forgot_password_request_window_start;

    if (!windowStart || now.getTime() - windowStart > 2 * 60 * 60 * 1000) {
      requestCount = 0;
      newWindowStart = now;
    }

    if (requestCount >= 5) {
      throw new BadRequestException('Bạn đã gửi quá nhiều yêu cầu mã OTP. Vui lòng thử lại sau 2 giờ.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 phút hiệu lực

    await this.userService.updateUserById(user._id.toString(), {
      forgot_password_otp: otp,
      forgot_password_otp_expires_at: expiresAt,
      forgot_password_otp_attempts: 0,
      forgot_password_requested_at: now,
      forgot_password_request_count: requestCount + 1,
      forgot_password_request_window_start: newWindowStart,
    });

    await this.emailService.sendForgotPasswordOtpEmail({
      toEmail: user.email,
      candidateName: user.name,
      otp,
    });

    return {
      message: `Mã xác thực OTP đã được gửi đến email ${user.email}. Vui lòng kiểm tra hộp thư để tiến hành đổi mật khẩu.`,
    };
  }

  async verifyForgotPasswordOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new BadRequestException('Email và mã OTP không được để trống.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const user = await this.userService.findByEmail(cleanEmail);
    if (!user || !user.forgot_password_otp) {
      throw new BadRequestException('Không tìm thấy yêu cầu đặt lại mật khẩu hoặc mã OTP đã hết hạn.');
    }

    const attempts = user.forgot_password_otp_attempts || 0;
    if (attempts >= 5) {
      throw new BadRequestException('Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng gửi lại yêu cầu mã mới.');
    }

    if (
      !user.forgot_password_otp_expires_at ||
      new Date().getTime() > new Date(user.forgot_password_otp_expires_at).getTime()
    ) {
      throw new BadRequestException('Mã xác thực OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    if (user.forgot_password_otp !== cleanOtp) {
      await this.userService.updateUserById(user._id.toString(), {
        forgot_password_otp_attempts: attempts + 1,
      });
      const remaining = 5 - (attempts + 1);
      throw new BadRequestException(
        remaining > 0
          ? `Mã xác thực OTP không chính xác. Bạn còn ${remaining} lần thử.`
          : 'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng gửi lại yêu cầu mã mới.',
      );
    }

    return {
      valid: true,
      message: 'Mã xác thực OTP hợp lệ.',
    };
  }

  async resetPasswordWithOtp(dto: {
    email: string;
    otp: string;
    password: string;
    confirm_password: string;
  }) {
    const { email, otp, password, confirm_password } = dto;

    if (password !== confirm_password) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp.');
    }

    await this.verifyForgotPasswordOtp(email, otp);

    const cleanEmail = email.trim().toLowerCase();
    const user = await this.userService.findByEmail(cleanEmail);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userService.updateUserById(user._id.toString(), {
      password: hashedPassword,
      forgot_password_otp: '',
      forgot_password_otp_expires_at: null,
      forgot_password_otp_attempts: 0,
      forgot_password_requested_at: null,
    });

    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
    };
  }
}
