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
import { ApplicationsModule } from './modules/applications/applications.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OffersModule } from './modules/offers/offers.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

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
    ApplicationsModule,
    InterviewsModule,
    NotificationsModule,
    OffersModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
