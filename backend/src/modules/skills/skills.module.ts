import { Module } from '@nestjs/common';
import { SkillsService } from './services/skills.service';
import { SkillsController } from './controllers/skills.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Skill, SkillSchema } from './schemas/skills.schema';

@Module({
    imports: [MongooseModule.forFeature([{name: Skill.name, schema: SkillSchema} ])],
    controllers: [SkillsController],
    providers: [SkillsService],
    exports: [SkillsService]
})
export class SkillsModule {}
