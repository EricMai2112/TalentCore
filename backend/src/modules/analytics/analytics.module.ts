import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Candidate, CandidateSchema } from '../candidates/schema/candidate.schema';
import { JobDescription, JobDescriptionSchema } from '../job-description/schemas/job-description.schema';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { Interview, InterviewSchema } from '../interviews/schemas/interview.schema';
import { Offer, OfferSchema } from '../offers/schemas/offer.schema';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema';
import { AiEvaluation, AiEvaluationSchema } from '../applications/schemas/ai-evaluation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: JobDescription.name, schema: JobDescriptionSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Interview.name, schema: InterviewSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: AiEvaluation.name, schema: AiEvaluationSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
