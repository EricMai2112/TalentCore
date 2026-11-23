jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => {},
  CronExpression: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InterviewReminderCron } from './interview-reminder.cron';
import { Interview, LocationType } from '../../interviews/schemas/interview.schema';
import { Application } from '../../applications/schemas/application.schema';
import { EmailService } from '../../email-template/services/email.service';
import { NotificationsService } from '../services/notifications.service';

describe('InterviewReminderCron', () => {
  let cron: InterviewReminderCron;
  let mockInterviewModel: any;
  let mockApplicationModel: any;
  let mockEmailService: any;
  let mockNotificationsService: any;

  beforeEach(async () => {
    mockInterviewModel = {
      find: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    mockApplicationModel = {
      findById: jest.fn(),
    };

    mockEmailService = {
      sendInterviewReminderEmail: jest.fn().mockResolvedValue(undefined),
    };

    mockNotificationsService = {
      notifyCandidateInterviewReminder: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewReminderCron,
        {
          provide: getModelToken(Interview.name),
          useValue: mockInterviewModel,
        },
        {
          provide: getModelToken(Application.name),
          useValue: mockApplicationModel,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    cron = module.get<InterviewReminderCron>(InterviewReminderCron);
  });

  it('nên được khởi tạo thành công', () => {
    expect(cron).toBeDefined();
  });

  it('nên gửi email và thông báo in-app khi cuộc phỏng vấn diễn ra trong vòng 1 giờ tới (45 phút)', async () => {
    const now = new Date();
    const interviewTime = new Date(now.getTime() + 45 * 60 * 1000);
    const dateStr = interviewTime.toISOString();
    const sHour = String(interviewTime.getHours()).padStart(2, '0');
    const sMin = String(interviewTime.getMinutes()).padStart(2, '0');
    const startTimeStr = `${sHour}:${sMin}`;

    const mockInterview = {
      _id: 'interview123',
      applicationId: 'app123',
      date: dateStr,
      startTime: startTimeStr,
      endTime: '18:00',
      locationType: LocationType.ONLINE,
      meetingLink: 'https://meet.google.com/abc-xyz',
      interviewerId: { name: 'Người phỏng vấn Test' },
    };

    mockInterviewModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockInterview]),
      }),
    });

    const mockApplication = {
      _id: 'app123',
      candidateId: {
        profileName: 'Nguyễn Văn A',
        userId: {
          _id: 'user123',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
        },
      },
      jobDescriptionId: {
        title: 'Senior Node.js Developer',
      },
    };

    mockApplicationModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockApplication),
        }),
      }),
    });

    const result = await cron.sendUpcomingReminders();

    expect(result.processedCount).toBe(1);
    expect(result.remindedCount).toBe(1);

    expect(mockEmailService.sendInterviewReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'nguyenvana@example.com',
        candidateName: 'Nguyễn Văn A',
        jobTitle: 'Senior Node.js Developer',
        interviewType: 'Trực tuyến (Online)',
        meetLink: 'https://meet.google.com/abc-xyz',
      }),
    );

    expect(mockNotificationsService.notifyCandidateInterviewReminder).toHaveBeenCalledWith(
      'user123',
      expect.objectContaining({
        jobTitle: 'Senior Node.js Developer',
        interviewId: 'interview123',
      }),
    );

    expect(mockInterviewModel.updateOne).toHaveBeenCalledWith(
      { _id: 'interview123' },
      { $set: { reminded1h: true } },
    );
  });

  it('không nên gửi nhắc lịch nếu cuộc phỏng vấn diễn ra sau hơn 1 giờ (120 phút)', async () => {
    const now = new Date();
    const interviewTime = new Date(now.getTime() + 120 * 60 * 1000);
    const dateStr = interviewTime.toISOString();
    const sHour = String(interviewTime.getHours()).padStart(2, '0');
    const sMin = String(interviewTime.getMinutes()).padStart(2, '0');
    const startTimeStr = `${sHour}:${sMin}`;

    const mockInterview = {
      _id: 'interview456',
      applicationId: 'app456',
      date: dateStr,
      startTime: startTimeStr,
    };

    mockInterviewModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockInterview]),
      }),
    });

    const result = await cron.sendUpcomingReminders();

    expect(result.processedCount).toBe(1);
    expect(result.remindedCount).toBe(0);
    expect(mockEmailService.sendInterviewReminderEmail).not.toHaveBeenCalled();
    expect(mockInterviewModel.updateOne).not.toHaveBeenCalled();
  });
});
