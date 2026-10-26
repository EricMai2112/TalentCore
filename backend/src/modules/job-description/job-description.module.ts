import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobDescription, JobDescriptionSchema } from './schemas/job-description.schema';
import { JobDescriptionDraft, JobDescriptionDraftSchema } from './schemas/job-description-draft.schema';
import { JobDescriptionService } from './services/job-description.service';
import { JobDescriptionController } from './controllers/job-description.controller';
import { EventsGateway } from './gateways/events.gateway';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobDescription.name, schema: JobDescriptionSchema },
      { name: JobDescriptionDraft.name, schema: JobDescriptionDraftSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [JobDescriptionController],
  providers: [JobDescriptionService, EventsGateway],
  exports: [JobDescriptionService, EventsGateway],
})
export class JobDescriptionModule {}
