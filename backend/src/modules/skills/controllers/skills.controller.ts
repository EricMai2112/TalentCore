import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { SkillsService } from "../services/skills.service";
import { CreateSkillDto } from "../dtos/skill.dto";
import { Public } from "../../auth/decorators/public.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../users/schemas/user.schema";

@Controller("skills")
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) {}

    @Roles(UserRole.HR_ADMIN)
    @Post()
    async create(@Body() createSkillDto: CreateSkillDto) {
        return this.skillsService.create(createSkillDto);
    }

    @Public()
    @Get()
    async findAll() {
        return this.skillsService.getAll();
    }

    @Roles(UserRole.HR_ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.skillsService.remove(id);
    }
}
