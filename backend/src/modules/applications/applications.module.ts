import { Module } from '@nestjs/common';
import { ApplicationService } from './services/application.service';
import { ApplicationController } from './controllers/application.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { Candidate, CandidateSchema } from '../candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionSchema } from '../job-description/schemas/job-description.schema';
import { PipelineTemplate, PipelineTemplateSchema } from '../pipeline-template/schemas/pipeline-template.schema';
import { Interview, InterviewSchema } from '../interviews/schemas/interview.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiEvaluation, AiEvaluationSchema } from './schemas/ai-evaluation.schema';
import { AiMatchingService } from './services/ai-matching.service';
import { AiMatchingProcessor } from './processors/ai-matching.processor';
import { AiMatchingCronService } from './services/ai-matching-cron.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailTemplateModule } from '../email-template/email-template.module';

import { User, UserSchema } from '../users/schemas/user.schema';
import { CandidateInvitation, CandidateInvitationSchema } from './schemas/candidate-invitation.schema';
import { CandidateRediscoveryService } from './services/candidate-rediscovery.service';
import { CandidateRediscoveryController } from './controllers/candidate-rediscovery.controller';
import { InterviewEvaluation, InterviewEvaluationSchema } from '../interviews/schemas/interview-evaluation.schema';
import { Offer, OfferSchema } from '../offers/schemas/offer.schema';
import { CandidatesModule } from '../candidates/candidates.module';

import { S3StorageService } from './services/s3-storage.service';
import { AwsSqsService } from './services/aws-sqs.service';
import { SkillKnowledgeGraphService } from './knowledge-graph/skill-graph.service';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Application.name, schema: ApplicationSchema },
        { name: Candidate.name, schema: CandidateSchema },
        { name: AiEvaluation.name, schema: AiEvaluationSchema },
        { name: JobDescription.name, schema: JobDescriptionSchema },
        { name: PipelineTemplate.name, schema: PipelineTemplateSchema },
        { name: Interview.name, schema: InterviewSchema },
        { name: User.name, schema: UserSchema },
        { name: CandidateInvitation.name, schema: CandidateInvitationSchema },
        { name: InterviewEvaluation.name, schema: InterviewEvaluationSchema },
        { name: Offer.name, schema: OfferSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
    EmailTemplateModule,
    CandidatesModule,
],
    controllers: [ApplicationController, CandidateRediscoveryController],
    providers: [
      ApplicationService,
      AiMatchingService,
      AiMatchingProcessor,
      AiMatchingCronService,
      CandidateRediscoveryService,
      S3StorageService,
      AwsSqsService,
      SkillKnowledgeGraphService,
    ],
    exports: [
      ApplicationService,
      AiMatchingCronService,
      CandidateRediscoveryService,
      S3StorageService,
      AwsSqsService,
      SkillKnowledgeGraphService,
    ]
})
export class ApplicationsModule {}
