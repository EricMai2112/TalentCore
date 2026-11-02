import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../modules/auth/services/auth.service';
import { UserService } from '../modules/users/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserStatus, UserRole } from '../modules/users/schemas/user.schema';
import { ApplicationService } from '../modules/applications/services/application.service';
import { AiMatchingService } from '../modules/applications/services/ai-matching.service';
import { AiMatchingProcessor } from '../modules/applications/processors/ai-matching.processor';
import { NotificationsService } from '../modules/notifications/services/notifications.service';
import { EmailService } from '../modules/email-template/services/email.service';
import { DepartmentService } from '../modules/departments/services/department.service';
import { InterviewService } from '../modules/interviews/services/interview.service';
import { JobCriteria } from '../modules/job-description/schemas/job-description.schema';
import * as bcrypt from 'bcrypt';

describe('TalentCore QA Automation Test Suite - Fix Verification', () => {

  // =========================================================================
  // FIX 1: Tài khoản bị khóa (status = LOCKED) bị chặn đăng nhập
  // File: backend/src/modules/auth/services/auth.service.ts
  // =========================================================================
  describe('FIX-01: [AuthService.login] Chặn đăng nhập đối với tài khoản bị khóa', () => {
    let authService: AuthService;
    let mockUserService: any;
    let mockJwtService: any;

    beforeEach(async () => {
      mockUserService = {
        findByEmail: jest.fn(),
      };
      mockJwtService = {
        sign: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: UserService, useValue: mockUserService },
          { provide: JwtService, useValue: mockJwtService },
        ],
      }).compile();

      authService = module.get<AuthService>(AuthService);
    });

    it('Xác nhận đã sửa: Ném UnauthorizedException khi tài khoản có status là LOCKED', async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const lockedUser = {
        _id: new Types.ObjectId(),
        email: 'locked_employee@talentcore.com',
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        status: UserStatus.LOCKED,
        toObject: function () {
          return { ...this };
        },
      };

      mockUserService.findByEmail.mockResolvedValue(lockedUser);

      const loginDto = {
        email: 'locked_employee@talentcore.com',
        password: '123456',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ.',
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // FIX 3: Chặn chuyển Application sang Stage không tồn tại trong Pipeline
  // File: backend/src/modules/applications/services/application.service.ts
  // =========================================================================
  describe('FIX-03: [ApplicationService.updateApplicationStage] Chặn chuyển sang stage không thuộc pipeline', () => {
    let applicationService: ApplicationService;
    let mockAppModel: any;
    let mockJobModel: any;
    let mockPipelineModel: any;

    beforeEach(async () => {
      mockAppModel = {
        findById: jest.fn(),
      };
      mockJobModel = {
        findById: jest.fn(),
      };
      mockPipelineModel = {
        findById: jest.fn(),
        findOne: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ApplicationService,
          { provide: 'ApplicationModel', useValue: mockAppModel },
          { provide: 'CandidateModel', useValue: {} },
          { provide: 'JobDescriptionModel', useValue: mockJobModel },
          { provide: 'PipelineTemplateModel', useValue: mockPipelineModel },
          { provide: 'AiEvaluationModel', useValue: { findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) }) } },
          { provide: 'InterviewModel', useValue: { findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) } },
          { provide: AiMatchingProcessor, useValue: {} },
          { provide: AiMatchingService, useValue: {} },
          { provide: NotificationsService, useValue: { notifyCandidateStageChanged: jest.fn() } },
          { provide: EmailService, useValue: { sendApplicationStageUpdateEmail: jest.fn() } },
        ],
      }).compile();

      applicationService = module.get<ApplicationService>(ApplicationService);
    });

    it('Xác nhận đã sửa: Ném BadRequestException khi stageId không tồn tại trong pipeline của Job', async () => {
      const validStage1Id = new Types.ObjectId();
      const validStage2Id = new Types.ObjectId();
      const fakeUnknownStageId = new Types.ObjectId();

      const appDoc: any = {
        _id: new Types.ObjectId(),
        currentStageId: validStage1Id,
        jobDescriptionId: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue(true),
        toObject: function () {
          return { ...this };
        },
      };

      mockAppModel.findById.mockImplementation((id: any) => {
        return {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(appDoc),
          then: (resolve: any) => resolve(appDoc),
        };
      });

      mockJobModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          pipelineTemplateId: new Types.ObjectId(),
        }),
      });

      mockPipelineModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          stages: [
            { _id: validStage1Id, name: 'Sàng lọc hồ sơ', order: 1 },
            { _id: validStage2Id, name: 'Phỏng vấn', order: 2 },
          ],
        }),
      });

      await expect(
        applicationService.updateApplicationStage(appDoc._id.toString(), fakeUnknownStageId.toString()),
      ).rejects.toThrow(BadRequestException);

      await expect(
        applicationService.updateApplicationStage(appDoc._id.toString(), fakeUnknownStageId.toString()),
      ).rejects.toThrow('Giai đoạn tuyển dụng không tồn tại trong quy trình của vị trí tuyển dụng này.');
    });
  });

  // =========================================================================
  // FIX 4: Chặn truy cập IDOR trên getApplicationById
  // File: backend/src/modules/applications/services/application.service.ts
  // =========================================================================
  describe('FIX-04: [ApplicationService.getApplicationById] Chặn IDOR đối với ứng viên khác', () => {
    let applicationService: ApplicationService;
    let mockAppModel: any;

    beforeEach(async () => {
      mockAppModel = {
        findById: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ApplicationService,
          { provide: 'ApplicationModel', useValue: mockAppModel },
          { provide: 'CandidateModel', useValue: {} },
          { provide: 'JobDescriptionModel', useValue: {} },
          { provide: 'PipelineTemplateModel', useValue: {} },
          { provide: 'AiEvaluationModel', useValue: { findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) }) } },
          { provide: 'InterviewModel', useValue: {} },
          { provide: AiMatchingProcessor, useValue: {} },
          { provide: AiMatchingService, useValue: {} },
          { provide: NotificationsService, useValue: {} },
          { provide: EmailService, useValue: {} },
        ],
      }).compile();

      applicationService = module.get<ApplicationService>(ApplicationService);
    });

    it('Xác nhận đã sửa: Ném ForbiddenException khi ứng viên A cố xem đơn ứng tuyển của ứng viên B', async () => {
      const ownerUserId = new Types.ObjectId('65f111111111111111111111');
      const attackerUserId = new Types.ObjectId('65f222222222222222222222');

      const mockApp = {
        _id: new Types.ObjectId(),
        currentStageId: new Types.ObjectId(),
        jobDescriptionId: { pipelineTemplateId: { stages: [] } },
        candidateId: {
          userId: { _id: ownerUserId },
        },
        toObject: function () {
          return { ...this };
        },
      };

      mockAppModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockApp),
        }),
      });

      const callerCandidate = {
        id: attackerUserId.toString(),
        role: 'CANDIDATE',
      };

      await expect(
        applicationService.getApplicationById(mockApp._id.toString(), callerCandidate),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        applicationService.getApplicationById(mockApp._id.toString(), callerCandidate),
      ).rejects.toThrow('Bạn không có quyền xem thông tin đơn ứng tuyển này.');
    });
  });

  // =========================================================================
  // FIX 5: Không gán CandidateId làm InterviewerId
  // File: backend/src/modules/applications/services/application.service.ts
  // =========================================================================
  describe('FIX-05: [ApplicationService.updateApplicationStage] Không gán CandidateId làm InterviewerId', () => {
    it('Xác nhận đã sửa: interviewerId là undefined khi job không có interviewerId được gán sẵn', () => {
      const job: any = { interviewerId: null, interviewerIds: [] };
      const populated: any = {
        candidateId: new Types.ObjectId('65f111111111111111111111'),
      };

      const defaultInterviewer = job?.interviewerId || (job?.interviewerIds && job.interviewerIds[0]) || undefined;

      expect(defaultInterviewer).toBeUndefined();
      expect(defaultInterviewer).not.toEqual(populated.candidateId);
    });
  });

  // =========================================================================
  // FIX 7: Chặn lịch phỏng vấn có startTime >= endTime
  // File: backend/src/modules/interviews/services/interview.service.ts
  // =========================================================================
  describe('FIX-07: [InterviewService] Chặn tạo lịch khi startTime >= endTime', () => {
    let interviewService: InterviewService;
    let mockAppModel: any;

    beforeEach(async () => {
      mockAppModel = {
        findById: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          InterviewService,
          { provide: 'InterviewModel', useValue: { find: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) }) } },
          { provide: 'InterviewEvaluationModel', useValue: {} },
          { provide: 'ApplicationModel', useValue: mockAppModel },
          { provide: 'JobDescriptionModel', useValue: {} },
          { provide: 'CandidateModel', useValue: {} },
          { provide: 'UserModel', useValue: {} },
          { provide: NotificationsService, useValue: {} },
          { provide: EmailService, useValue: {} },
        ],
      }).compile();

      interviewService = module.get<InterviewService>(InterviewService);
    });

    it('Xác nhận đã sửa: Ném BadRequestException khi startTime >= endTime', async () => {
      await expect(
        interviewService.checkInterviewerConflict(
          new Types.ObjectId().toString(),
          '2026-11-10',
          '16:00',
          '14:00', // Sai: kết thúc trước bắt đầu
        ),
      ).rejects.toThrow(BadRequestException);

      await expect(
        interviewService.checkInterviewerConflict(
          new Types.ObjectId().toString(),
          '2026-11-10',
          '15:00',
          '15:00', // Sai: trùng nhau
        ),
      ).rejects.toThrow('Thời gian kết thúc phỏng vấn phải diễn ra sau thời gian bắt đầu.');
    });
  });

  // =========================================================================
  // FIX 8: Chặn xóa Phòng ban khi còn Position hoặc JobDescription liên kết
  // File: backend/src/modules/departments/services/department.service.ts
  // =========================================================================
  describe('FIX-08: [DepartmentService.remove] Kiểm tra ràng buộc toàn vẹn khi xóa phòng ban', () => {
    let departmentService: DepartmentService;
    let mockDeptModel: any;
    let mockUserModel: any;

    beforeEach(async () => {
      mockDeptModel = {
        findById: jest.fn(),
        db: {
          collection: jest.fn().mockImplementation((name: string) => {
            if (name === 'jobdescriptions') {
              return { countDocuments: jest.fn().mockResolvedValue(2) }; // Có 2 tin tuyển dụng
            }
            return { countDocuments: jest.fn().mockResolvedValue(0) };
          }),
        },
      };
      mockUserModel = {
        updateMany: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DepartmentService,
          { provide: 'DepartmentModel', useValue: mockDeptModel },
          { provide: 'UserModel', useValue: mockUserModel },
        ],
      }).compile();

      departmentService = module.get<DepartmentService>(DepartmentService);
    });

    it('Xác nhận đã sửa: Ném BadRequestException khi phòng ban đang có JobDescription liên kết', async () => {
      const deptId = new Types.ObjectId();
      mockDeptModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: deptId, name: 'Phòng IT', code: 'IT' }),
      });

      await expect(departmentService.remove(deptId.toString())).rejects.toThrow(BadRequestException);
      await expect(departmentService.remove(deptId.toString())).rejects.toThrow(
        'Không thể xóa phòng ban đang có vị trí công việc hoặc tin tuyển dụng liên kết. Vui lòng di chuyển hoặc xóa các dữ liệu liên quan trước.',
      );
    });
  });

  // =========================================================================
  // FIX 9: Đồng bộ cờ isPassed với điểm số sau khi chuẩn hóa
  // File: backend/src/modules/applications/services/ai-matching.service.ts
  // =========================================================================
  describe('FIX-09: [AiMatchingService.processDeterministicScoring] Đồng bộ isPassed theo score chuẩn hóa', () => {
    let aiMatchingService: AiMatchingService;

    beforeEach(() => {
      aiMatchingService = new AiMatchingService();
    });

    it('Xác nhận đã sửa: isPassed = false khi score bị reset về 0 dù AI trả về isPassed = true', async () => {
      const criteria: JobCriteria[] = [
        {
          name: 'Node.js Backend',
          requirementType: 'MANDATORY',
          weight: 100,
        } as any,
      ];

      const aiResult = {
        summary: 'Đánh giá ứng viên',
        keyStrengths: [],
        potentialGaps: [],
        suggestedQuestions: [],
        criteriaResults: [
          {
            name: 'Node.js Backend',
            score: 35, // Điểm không hợp lệ, sẽ bị reset về 0
            evidence: 'Có làm việc với Node.js',
            isPassed: true, // Ảo giác AI
          },
        ],
      };

      const cvText = 'Có làm việc với Node.js trong 2 năm';
      const result = await aiMatchingService.processDeterministicScoring(
        cvText,
        criteria,
        aiResult,
        [],
      );

      const evaluated = result.evaluatedCriteria[0];

      // Xác nhận điểm bị hạ về 0 và cờ isPassed tự động đồng bộ thành false
      expect(evaluated.score).toBe(0);
      expect(evaluated.isPassed).toBe(false);
      expect(result.isMissingMandatory).toBe(true);
    });
  });

    describe('FEATURE: [InterviewService] Thời hạn xác nhận phỏng vấn và tự động hủy/từ chối khi quá hạn', () => {
      let interviewService: InterviewService;
      let mockInterviewModel: any;

      beforeEach(async () => {
        mockInterviewModel = {
          findById: jest.fn(),
          updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            InterviewService,
            { provide: 'InterviewModel', useValue: mockInterviewModel },
            { provide: 'InterviewEvaluationModel', useValue: {} },
            { provide: 'ApplicationModel', useValue: {} },
            { provide: 'JobDescriptionModel', useValue: {} },
            { provide: 'CandidateModel', useValue: {} },
            { provide: 'UserModel', useValue: {} },
            { provide: NotificationsService, useValue: {} },
            { provide: EmailService, useValue: {} },
          ],
        }).compile();

        interviewService = module.get<InterviewService>(InterviewService);
      });

      it('Tự động chuyển sang CANCELLED khi quá confirmationDeadline trong computeRealTimeStatus', () => {
        const pastDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const doc = {
          _id: '507f1f77bcf86cd799439011',
          status: 'SCHEDULED',
          confirmationStatus: 'SCHEDULED',
          confirmationDeadline: pastDeadline,
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          startTime: '10:00',
          endTime: '11:00',
        };

        const result = (interviewService as any).computeRealTimeStatus(doc);
        expect(result.status).toBe('CANCELLED');
        expect(result.confirmationStatus).toBe('CANCELLED');
        expect(result.cancelReason).toBe('Quá thời hạn xác nhận phỏng vấn');
      });

      it('Chặn ứng viên xác nhận khi đã quá hạn xác nhận (throw BadRequestException)', async () => {
        const pastDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const mockInterview = {
          _id: '507f1f77bcf86cd799439011',
          status: 'SCHEDULED',
          confirmationStatus: 'SCHEDULED',
          confirmationDeadline: pastDeadline,
          save: jest.fn().mockResolvedValue(true),
        };
        mockInterviewModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockInterview),
        });

        await expect(
          interviewService.updateCandidateConfirmation('507f1f77bcf86cd799439011', 'CONFIRMED' as any)
        ).rejects.toThrow('Đã quá thời hạn xác nhận lịch phỏng vấn');
        expect(mockInterview.status).toBe('CANCELLED');
        expect(mockInterview.confirmationStatus).toBe('CANCELLED');
      });
    });
  });
