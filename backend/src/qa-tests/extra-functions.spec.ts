import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../modules/auth/services/auth.service';
import { AuthController } from '../modules/auth/controllers/auth.controller';
import { UserService } from '../modules/users/services/user.service';
import { UserController } from '../modules/users/controllers/user.controller';
import * as bcrypt from 'bcrypt';

describe('EXTRA_FUNCTIONS Unit Tests (Quý)', () => {
  describe('AuthService - changePassword', () => {
    let authService: AuthService;
    let mockUserService: any;
    let mockJwtService: any;

    beforeEach(() => {
      mockUserService = {
        findById: jest.fn(),
        updateUserById: jest.fn(),
      };
      mockJwtService = {
        sign: jest.fn(),
      };
      authService = new AuthService(mockUserService, mockJwtService);
    });

    it('should change password successfully when all validations pass', async () => {
      const hashedOldPassword = await bcrypt.hash('oldPassword123', 10);
      mockUserService.findById.mockResolvedValue({
        _id: 'user123',
        email: 'test@talentcore.com',
        password: hashedOldPassword,
      });
      mockUserService.updateUserById.mockResolvedValue({
        _id: 'user123',
      });

      const result = await authService.changePassword('user123', {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456',
      });

      expect(result).toEqual({ message: 'Đổi mật khẩu thành công' });
      expect(mockUserService.updateUserById).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          password: expect.any(String),
        }),
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(
        authService.changePassword('nonexistent', {
          oldPassword: 'old',
          newPassword: 'newPassword1',
          confirmPassword: 'newPassword1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if old password does not match', async () => {
      const hashedOldPassword = await bcrypt.hash('correctPassword', 10);
      mockUserService.findById.mockResolvedValue({
        _id: 'user123',
        password: hashedOldPassword,
      });

      await expect(
        authService.changePassword('user123', {
          oldPassword: 'wrongPassword',
          newPassword: 'newPassword1',
          confirmPassword: 'newPassword1',
        }),
      ).rejects.toThrow(new BadRequestException('Mật khẩu hiện tại không chính xác'));
    });

    it('should throw BadRequestException if newPassword and confirmPassword do not match', async () => {
      const hashedOldPassword = await bcrypt.hash('correctPassword', 10);
      mockUserService.findById.mockResolvedValue({
        _id: 'user123',
        password: hashedOldPassword,
      });

      await expect(
        authService.changePassword('user123', {
          oldPassword: 'correctPassword',
          newPassword: 'newPassword1',
          confirmPassword: 'differentPassword2',
        }),
      ).rejects.toThrow(new BadRequestException('Mật khẩu xác nhận không khớp'));
    });

    it('should throw BadRequestException if newPassword is identical to oldPassword', async () => {
      const hashedOldPassword = await bcrypt.hash('samePassword123', 10);
      mockUserService.findById.mockResolvedValue({
        _id: 'user123',
        password: hashedOldPassword,
      });

      await expect(
        authService.changePassword('user123', {
          oldPassword: 'samePassword123',
          newPassword: 'samePassword123',
          confirmPassword: 'samePassword123',
        }),
      ).rejects.toThrow(
        new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại'),
      );
    });
  });

  describe('AuthController - changePassword', () => {
    let authController: AuthController;
    let mockAuthService: any;

    beforeEach(() => {
      mockAuthService = {
        changePassword: jest.fn().mockResolvedValue({ message: 'Đổi mật khẩu thành công' }),
      };
      authController = new AuthController(mockAuthService);
    });

    it('should call authService.changePassword with current user id', async () => {
      const dto = {
        oldPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'new',
      };
      const result = await authController.changePassword('user123', dto);
      expect(result).toEqual({ message: 'Đổi mật khẩu thành công' });
      expect(mockAuthService.changePassword).toHaveBeenCalledWith('user123', dto);
    });
  });

  describe('UserService - updateProfile', () => {
    let userService: UserService;
    let mockUserModel: any;
    let mockEmailService: any;

    beforeEach(() => {
      mockUserModel = {
        findById: jest.fn(),
      };
      mockEmailService = {};
      userService = new UserService(mockUserModel, mockEmailService);
    });

    it('should update profile name and phone successfully and return sanitized user without password', async () => {
      const mockUserDoc: any = {
        _id: 'user123',
        name: 'Nguyễn Văn Cũ',
        phone: '0901111111',
        password: 'secret_hash',
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          name: 'Nguyễn Văn Mới',
          phone: '0988888888',
          password: 'secret_hash',
        }),
      };

      const populatedMock: any = {
        _id: 'user123',
        name: 'Nguyễn Văn Mới',
        phone: '0988888888',
        password: 'secret_hash',
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          name: 'Nguyễn Văn Mới',
          phone: '0988888888',
          password: 'secret_hash',
        }),
      };

      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      }).mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(populatedMock),
        }),
      });

      const result = await userService.updateProfile('user123', {
        name: '  Nguyễn Văn Mới  ',
        phone: '  0988888888  ',
      });

      expect(mockUserDoc.name).toBe('Nguyễn Văn Mới');
      expect(mockUserDoc.phone).toBe('0988888888');
      expect(mockUserDoc.save).toHaveBeenCalled();
      expect(result.message).toBe('Cập nhật thông tin cá nhân thành công');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        userService.updateProfile('notfound', { name: 'ABC' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UserController - updateProfile', () => {
    let userController: UserController;
    let mockUserService: any;

    beforeEach(() => {
      mockUserService = {
        updateProfile: jest.fn().mockResolvedValue({ message: 'Cập nhật thông tin cá nhân thành công' }),
      };
      userController = new UserController(mockUserService);
    });

    it('should call userService.updateProfile with current user id', async () => {
      const dto = { name: 'Thành', phone: '0987654321' };
      const result = await userController.updateProfile('user999', dto);
      expect(result).toEqual({ message: 'Cập nhật thông tin cá nhân thành công' });
      expect(mockUserService.updateProfile).toHaveBeenCalledWith('user999', dto);
    });
  });
});
