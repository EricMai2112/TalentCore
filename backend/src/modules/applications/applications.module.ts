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

@Module({
    imports: [MongooseModule.forFeature([{name: Application.name, schema: ApplicationSchema},
        { name: Candidate.name, schema: CandidateSchema },
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
    providers: [ApplicationService],
    exports: [ApplicationService]
})
export class ApplicationsModule {}
