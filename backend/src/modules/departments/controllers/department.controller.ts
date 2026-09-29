import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { DepartmentService } from "../services/department.service";
import { CreateDepartMentDto, UpdateDepartmentDto } from "../dtos/department.dto";
import { Public } from "../../auth/decorators/public.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../users/schemas/user.schema";

@Controller("departments")
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}
    
    @Roles(UserRole.HR_ADMIN)
    @Post()
    async createDeparment(@Body() createDepartMentDto: CreateDepartMentDto) {
        return this.departmentService.createDepartment(createDepartMentDto)
    }

    @Public()
    @Get()
    async findAll() {
        return this.departmentService.getAllDepartments();
    }

    @Public()
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.departmentService.findOne(id);
    }

    @Roles(UserRole.HR_ADMIN)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDepartmentDto: UpdateDepartmentDto,
    ) {
        return this.departmentService.update(
        id,
        updateDepartmentDto,
        );
    }

    @Roles(UserRole.HR_ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.departmentService.remove(id);
    }
}