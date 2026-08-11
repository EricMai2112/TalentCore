import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { DepartmentService } from "../services/department.service";
import { CreateDepartMentDto, UpdateDepartmentDto } from "../dtos/department.dto";

@Controller("departments")
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}
    
    @Post()
    async createDeparment(@Body() createDepartMentDto: CreateDepartMentDto) {
        return this.departmentService.createDepartment(createDepartMentDto)
    }

    @Get()
    async findAll() {
        return this.departmentService.getAllDepartments();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.departmentService.findOne(id);
    }

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

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.departmentService.remove(id);
    }
}