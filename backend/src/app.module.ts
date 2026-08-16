import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PipelineTemplateModule } from './modules/pipeline-template/pipeline-template.module';
import { EmailTemplateModule } from './modules/email-template/email-template.module';
import { SkillsModule } from './modules/skills/skills.module';
import { PositionsModule } from './modules/positions/positions.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { JobDescriptionModule } from './modules/job-description/job-description.module';
import { CandidatesModule } from './modules/candidates/candidates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PipelineTemplateModule,
    EmailTemplateModule,
    SkillsModule,
    PositionsModule,
    DepartmentsModule,
    JobDescriptionModule,
    CandidatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
