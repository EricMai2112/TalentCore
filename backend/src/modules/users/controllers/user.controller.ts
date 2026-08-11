import { Body, Controller, Get, Param, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateEmployeeDto, UpdateEmployeeDto, ToggleStatusDto } from "../dtos/user.dto";

@Controller("users")
@UsePipes(new ValidationPipe({ whitelist: true }))
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post("employees")
    async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.userService.createEmployee(createEmployeeDto);
    }

    @Get("employees")
    async getEmployees() {
        return this.userService.getEmployees();
    }

    @Patch("employees/:id")
    async updateEmployee(
        @Param("id") id: string,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
    ) {
        return this.userService.updateEmployee(id, updateEmployeeDto);
    }

    @Patch("employees/:id/status")
    async toggleStatus(
        @Param("id") id: string,
        @Body() toggleStatusDto: ToggleStatusDto,
    ) {
        return this.userService.toggleStatus(id, toggleStatusDto);
    }
}
