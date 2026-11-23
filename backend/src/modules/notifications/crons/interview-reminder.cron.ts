import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Interview,
  InterviewDocument,
  InterviewStatus,
  InterviewConfirmationStatus,
  LocationType,
} from '../../interviews/schemas/interview.schema';
import {
  Application,
  ApplicationDocument,
} from '../../applications/schemas/application.schema';
import { EmailService } from '../../email-template/services/email.service';
import { NotificationsService } from '../services/notifications.service';

const REMINDER_MINUTES_BEFORE = 60;

@Injectable()
export class InterviewReminderCron {
  private readonly logger = new Logger(InterviewReminderCron.name);

  constructor(
    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('* * * * *')
  async handleInterviewReminders() {
    this.logger.log('[InterviewReminderCron] Bắt đầu quét các cuộc phỏng vấn cần nhắc hẹn trước 1 tiếng...');
    try {
      const result = await this.sendUpcomingReminders();
      this.logger.log(
        `[InterviewReminderCron] Hoàn tất quét: Đã xử lý ${result.processedCount} lịch, gửi nhắc hẹn thành công ${result.remindedCount} lịch.`,
      );
    } catch (err: any) {
      this.logger.error(`[InterviewReminderCron] Lỗi trong quá trình quét nhắc lịch: ${err?.message || err}`);
    }
  }

  async sendUpcomingReminders(): Promise<{ processedCount: number; remindedCount: number }> {
    const now = new Date();

    const candidateInterviews = await this.interviewModel
      .find({
        confirmationStatus: InterviewConfirmationStatus.CONFIRMED,
        status: { $nin: [InterviewStatus.CANCELLED, InterviewStatus.COMPLETED] },
        reminded1h: { $ne: true },
        date: { $exists: true, $ne: null },
      })
      .populate({ path: 'interviewerId', select: 'name email' })
      .exec();

    let remindedCount = 0;

    for (const interview of candidateInterviews) {
      if (!interview.date || !interview.startTime) {
        continue;
      }

      const dateObj = new Date(interview.date);
      const [sHour, sMin] = (interview.startTime || '00:00').split(':').map(Number);
      const startDateTime = new Date(dateObj);
      startDateTime.setHours(isNaN(sHour) ? 0 : sHour, isNaN(sMin) ? 0 : sMin, 0, 0);

      const diffMs = startDateTime.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes > 0 && diffMinutes <= REMINDER_MINUTES_BEFORE) {
        try {
          const appDoc = await this.applicationModel
            .findById(interview.applicationId)
            .populate({
              path: 'candidateId',
              model: 'Candidate',
              populate: { path: 'userId', model: 'User' },
            })
            .populate({
              path: 'jobDescriptionId',
              model: 'JobDescription',
            })
            .exec();

          const candUser: any = (appDoc?.candidateId as any)?.userId;
          const candEmail = candUser?.email;
          const candName = candUser?.name || (appDoc?.candidateId as any)?.profileName || 'Ứng viên';
          const job: any = appDoc?.jobDescriptionId;
          const jobTitle = job?.title || 'Vị trí ứng tuyển';

          const dateFormatted = new Date(interview.date).toLocaleDateString('vi-VN');
          const timeRange = `${interview.startTime}${interview.endTime ? ` - ${interview.endTime}` : ''}`;
          const interviewType =
            interview.locationType === LocationType.ONLINE
              ? 'Trực tuyến (Online)'
              : 'Trực tiếp tại văn phòng';
          const meetLink =
            interview.locationType === LocationType.ONLINE
              ? interview.meetingLink || 'Sẽ được cập nhật trước giờ phỏng vấn'
              : interview.offsiteLocation || 'Trụ sở công ty';

          const interviewerName = (interview.interviewerId as any)?.name || 'Hội đồng phỏng vấn';

          if (candEmail) {
            await this.emailService.sendInterviewReminderEmail({
              toEmail: candEmail,
              candidateName: candName,
              jobTitle,
              companyName: 'TalentCore',
              interviewDate: dateFormatted,
              interviewTime: timeRange,
              interviewType,
              meetLink,
              interviewerName,
            });
          }

          const candUserId = candUser?._id?.toString() || candUser?.toString();
          if (candUserId) {
            await this.notificationsService.notifyCandidateInterviewReminder(candUserId, {
              jobTitle,
              dateFormatted,
              timeRange,
              interviewId: interview._id.toString(),
              meetLink,
            });
          }

          await this.interviewModel.updateOne(
            { _id: interview._id },
            { $set: { reminded1h: true } },
          );

          remindedCount++;
          this.logger.log(
            `[InterviewReminderCron] Đã gửi nhắc lịch phỏng vấn trước 1h cho ứng viên ${candName} (${candEmail}) - Vị trí: ${jobTitle}. Bắt đầu sau: ${Math.round(diffMinutes)} phút.`,
          );
        } catch (itemErr: any) {
          this.logger.error(
            `[InterviewReminderCron] Lỗi gửi nhắc lịch cho interview ID ${interview._id}: ${itemErr?.message || itemErr}`,
          );
        }
      }
    }

    return {
      processedCount: candidateInterviews.length,
      remindedCount,
    };
  }
}
