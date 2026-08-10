import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @UsePipes(new ValidationPipe())
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto)
    }

    @Post("login")
    @UsePipes(new ValidationPipe())
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }
}
