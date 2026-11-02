import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
    }

    try {
      const payload = this.jwtService.verify(token);
      // Standardize user object on request
      (request as any).user = {
        id: payload.sub || payload.id || payload._id,
        _id: payload.sub || payload.id || payload._id,
        sub: payload.sub || payload.id || payload._id,
        email: payload.email,
        role: payload.role,
        departmentId: payload.departmentId,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    let token = request.cookies?.['accessToken'];
    if (!token && request.headers.authorization) {
      const [type, headerToken] = request.headers.authorization.split(' ');
      if (type === 'Bearer' && headerToken) {
        token = headerToken;
      }
    }
    return token;
  }
}
