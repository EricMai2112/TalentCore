import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateEmployeeDto } from "../dtos/user.dto";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post("employees")
    @UsePipes(new ValidationPipe())
    async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.userService.createEmployee(createEmployeeDto)
    }
}