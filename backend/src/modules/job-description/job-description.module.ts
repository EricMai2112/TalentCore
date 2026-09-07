import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobDescription, JobDescriptionSchema } from './schemas/job-description.schema';
import { JobDescriptionService } from './services/job-description.service';
import { JobDescriptionController } from './controllers/job-description.controller';
import { EventsGateway } from './gateways/events.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobDescription.name, schema: JobDescriptionSchema },
    ]),
  ],
  controllers: [JobDescriptionController],
  providers: [JobDescriptionService, EventsGateway],
  exports: [JobDescriptionService, EventsGateway],
})
export class JobDescriptionModule {}
