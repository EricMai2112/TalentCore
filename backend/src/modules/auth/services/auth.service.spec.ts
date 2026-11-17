import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../users/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../email-template/services/email.service';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '../../users/schemas/user.schema';

describe('AuthService - Forgot & Reset Password', () => {
  let authService: AuthService;
  let mockUserService: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockEmailService: any;

  beforeEach(async () => {
    mockUserService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateUserById: jest.fn().mockResolvedValue({}),
      createUser: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_jwt_reset_token'),
      verifyAsync: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_SECRET_FORGOT_PASSWORD_TOKEN') return 'secret_key';
        return 'default_secret';
      }),
    };

    mockEmailService = {
      sendForgotPasswordEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('forgotPassword', () => {
    it('should throw NotFoundException if email does not exist', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.forgotPassword({ email: 'nonexistent@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if account is locked', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        _id: 'user_1',
        email: 'locked@example.com',
        status: UserStatus.LOCKED,
      });

      await expect(
        authService.forgotPassword({ email: 'locked@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should enforce cooldown if request was made within 60s', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        _id: 'user_1',
        email: 'cooldown@example.com',
        status: UserStatus.ACTIVE,
        forgot_password_requested_at: new Date(Date.now() - 30 * 1000), // 30s ago
      });

      await expect(
        authService.forgotPassword({ email: 'cooldown@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate token, update user and send SES email on success', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        _id: 'user_1',
        email: 'candidate@example.com',
        name: 'Nguyen Van A',
        status: UserStatus.ACTIVE,
      });

      const result = await authService.forgotPassword({ email: 'candidate@example.com' });

      expect(result.message).toContain('Liên kết đặt lại mật khẩu đã được gửi');
      expect(mockJwtService.signAsync).toHaveBeenCalled();
      expect(mockUserService.updateUserById).toHaveBeenCalledWith(
        'user_1',
        expect.objectContaining({
          forgot_password_token: 'mock_jwt_reset_token',
        }),
      );
      expect(mockEmailService.sendForgotPasswordEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          toEmail: 'candidate@example.com',
          candidateName: 'Nguyen Van A',
          resetToken: 'mock_jwt_reset_token',
        }),
      );
    });
  });

  describe('verifyForgotPasswordToken', () => {
    it('should throw UnauthorizedException if token verification fails', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(
        authService.verifyForgotPasswordToken('invalid_token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token does not match user doc', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user_1', email: 'a@b.com' });
      mockUserService.findById.mockResolvedValue({
        _id: 'user_1',
        email: 'a@b.com',
        forgot_password_token: 'different_token',
      });

      await expect(
        authService.verifyForgotPasswordToken('valid_jwt_but_old'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return valid and email when token matches', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user_1', email: 'test@example.com' });
      mockUserService.findById.mockResolvedValue({
        _id: 'user_1',
        email: 'test@example.com',
        forgot_password_token: 'correct_token',
      });

      const res = await authService.verifyForgotPasswordToken('correct_token');
      expect(res.valid).toBe(true);
      expect(res.email).toBe('test@example.com');
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(
        authService.resetPassword({
          token: 'token_123',
          password: 'new_password',
          confirm_password: 'different_password',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reset password via valid token and clear forgot_password_token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user_1' });
      mockUserService.findById.mockResolvedValue({
        _id: 'user_1',
        email: 'test@example.com',
        forgot_password_token: 'valid_token',
      });

      const res = await authService.resetPassword({
        token: 'valid_token',
        password: 'Password@123',
        confirm_password: 'Password@123',
      });

      expect(res.message).toContain('Đặt lại mật khẩu thành công');
      expect(mockUserService.updateUserById).toHaveBeenCalledWith(
        'user_1',
        expect.objectContaining({
          forgot_password_token: '',
        }),
      );
    });

    it('should reject if token is invalid or expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      await expect(
        authService.resetPassword({
          token: 'expired_token',
          password: 'NewPassword123',
          confirm_password: 'NewPassword123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
