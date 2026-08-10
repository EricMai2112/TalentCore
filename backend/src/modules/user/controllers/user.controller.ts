import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { LoginDto, RegisterDto } from '../dtos/user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post("register")
    @UsePipes(new ValidationPipe())
    async register(@Body() registerDto: RegisterDto) {
        return this.userService.register(registerDto)
    }

    @Post("login")
    @UsePipes(new ValidationPipe())
    async login(@Body() loginDto: LoginDto) {
        return this.userService.login(loginDto)
    }
}
