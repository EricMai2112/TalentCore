import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { SkillsService } from "../services/skills.service";
import { CreateSkillDto } from "../dtos/skill.dto";

@Controller("skills")
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) {}

    @Post()
    async create(
    @Body() createSkillDto: CreateSkillDto,
    ) {
        return this.skillsService.create(
        createSkillDto,
        );
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
}
}