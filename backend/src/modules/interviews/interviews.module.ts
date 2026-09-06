import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { JobDescription, JobDescriptionSchema } from '../job-description/schemas/job-description.schema';
import { Candidate, CandidateSchema } from '../candidates/schema/candidate.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { InterviewService } from './services/interview.service';
import { InterviewController } from './controllers/interview.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: JobDescription.name, schema: JobDescriptionSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewsModule {}
