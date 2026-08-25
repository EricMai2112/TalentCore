import { Module } from '@nestjs/common';
import { ApplicationService } from './services/application.service';
import { ApplicationController } from './controllers/application.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { Candidate, CandidateSchema } from '../candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionSchema } from '../job-description/schemas/job-description.schema';
import { PipelineTemplate, PipelineTemplateSchema } from '../pipeline-template/schemas/pipeline-template.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiEvaluation, AiEvaluationSchema } from './schemas/ai-evaluation.schema';
import { AiMatchingService } from './services/ai-matching.service';
import { AiMatchingProcessor } from './processors/ai-matching.processor';

@Module({
    imports: [MongooseModule.forFeature([{name: Application.name, schema: ApplicationSchema},
        { name: Candidate.name, schema: CandidateSchema },
        { name: AiEvaluation.name, schema: AiEvaluationSchema },
      { name: JobDescription.name, schema: JobDescriptionSchema },
      { name: PipelineTemplate.name, schema: PipelineTemplateSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
      }),
      inject: [ConfigService],
    }),
],
    controllers: [ApplicationController],
    providers: [ApplicationService, AiMatchingService, AiMatchingProcessor],
    exports: [ApplicationService]
})
export class ApplicationsModule {}
