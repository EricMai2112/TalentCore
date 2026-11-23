import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Interview, InterviewSchema } from '../interviews/schemas/interview.schema';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { EmailTemplateModule } from '../email-template/email-template.module';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { InterviewReminderCron } from './crons/interview-reminder.cron';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Interview.name, schema: InterviewSchema },
      { name: Application.name, schema: ApplicationSchema },
    ]),
    EmailTemplateModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, InterviewReminderCron],
  exports: [NotificationsService, NotificationsGateway, InterviewReminderCron],
})
export class NotificationsModule {}
