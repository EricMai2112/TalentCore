import { Module } from '@nestjs/common';
import { SkillsService } from './services/skills.service';
import { SkillsController } from './controllers/skills.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Skill, SkillSchema } from './schemas/skills.schema';
import { PositionsModule } from '../positions/positions.module';

@Module({
    imports: [MongooseModule.forFeature([{name: Skill.name, schema: SkillSchema} ]), PositionsModule],
    controllers: [SkillsController],
    providers: [SkillsService],
    exports: [SkillsService]
})
export class SkillsModule {}
