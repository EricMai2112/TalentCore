import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobDescription, JobDescriptionSchema } from './schemas/job-description.schema';
import { JobDescriptionService } from './services/job-description.service';
import { JobDescriptionController } from './controllers/job-description.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobDescription.name, schema: JobDescriptionSchema },
    ]),
  ],
  controllers: [JobDescriptionController],
  providers: [JobDescriptionService],
  exports: [JobDescriptionService],
})
export class JobDescriptionModule {}
