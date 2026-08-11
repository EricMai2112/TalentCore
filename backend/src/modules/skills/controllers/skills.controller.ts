import { Body, Controller, Delete, Get, Param, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { SkillsService } from "../services/skills.service";
import { CreateSkillDto } from "../dtos/skill.dto";

@Controller("skills")
@UsePipes(new ValidationPipe({ whitelist: true }))
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) {}

    @Get()
    async findAll() {
        return this.skillsService.getAll();
    }

    @Post()
    async create(@Body() createSkillDto: CreateSkillDto) {
        return this.skillsService.create(createSkillDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.skillsService.remove(id);
    }
}
