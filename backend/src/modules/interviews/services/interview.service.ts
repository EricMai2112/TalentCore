import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interview, InterviewDocument, LocationType, InterviewStatus, InterviewResult, InterviewConfirmationStatus } from '../schemas/interview.schema';
import { Application, ApplicationDocument, ApplicationStatus } from '../../applications/schemas/application.schema';
import { JobDescription, JobDescriptionDocument } from '../../job-description/schemas/job-description.schema';
import { Candidate, CandidateDocument } from '../../candidates/schema/candidate.schema';
import { User, UserDocument, UserRole } from '../../users/schemas/user.schema';
import { CreateInterviewDto, UpdateInterviewDto } from '../dtos/interview.dto';

@Injectable()
export class InterviewService {
  constructor(
    @InjectModel(Interview.name) private interviewModel: Model<InterviewDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(JobDescription.name) private jobDescriptionModel: Model<JobDescriptionDocument>,
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Sinh tự động link phòng phỏng vấn Jitsi Meet theo chuẩn:
   * https://meet.jit.si/TalentCore-[Phòng_Ban]-[Tên_Ứng_Viên]-[Vị_Trí]
   */
  private generateJitsiMeetUrl(departmentName?: string, candidateName?: string, jobTitle?: string): string {
    const sanitize = (str?: string) => {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]/g, '')
        .trim();
    };

    const deptSlug = sanitize(departmentName) || 'PhongBan';
    const candSlug = sanitize(candidateName) || 'UngVien';
    const jobSlug = sanitize(jobTitle) || 'ViTri';

    return `https://meet.jit.si/TalentCore-${deptSlug}-${candSlug}-${jobSlug}`;
  }

  /**
   * Tính toán tự động trạng thái hiển thị theo thời gian thực (Real-time Dynamic Status)
   * - Khi Ứng viên đã xác nhận (CONFIRMED) hoặc HR đã duyệt (SCHEDULED):
   *   + Giờ hiện tại < startTime ngày hẹn -> UPCOMING (Sắp diễn ra)
   *   + startTime <= Giờ hiện tại <= endTime -> IN_PROGRESS (Đang diễn ra)
   *   + Giờ hiện tại > endTime -> COMPLETED (Đã kết thúc)
   */
  private computeRealTimeStatus(doc: any) {
    if (!doc) return doc;
    if (doc.status === InterviewStatus.COMPLETED || doc.status === InterviewStatus.CANCELLED) {
      return doc;
    }
    if (doc.confirmationStatus === InterviewConfirmationStatus.REJECTED) {
      doc.status = InterviewStatus.CANCELLED;
      return doc;
    }
    if (
      doc.confirmationStatus === InterviewConfirmationStatus.CONFIRMED ||
      doc.confirmationStatus === InterviewConfirmationStatus.SCHEDULED
    ) {
      const now = new Date();
      const dateObj = new Date(doc.date);
      const [sHour, sMin] = (doc.startTime || '00:00').split(':').map(Number);
      const [eHour, eMin] = (doc.endTime || '23:59').split(':').map(Number);

      const startDateTime = new Date(dateObj);
      startDateTime.setHours(sHour, sMin, 0, 0);

      const endDateTime = new Date(dateObj);
      endDateTime.setHours(eHour, eMin, 0, 0);

      if (doc.confirmationStatus === InterviewConfirmationStatus.CONFIRMED) {
        if (now < startDateTime) {
          doc.status = InterviewStatus.UPCOMING;
        } else if (now >= startDateTime && now <= endDateTime) {
          doc.status = InterviewStatus.IN_PROGRESS;
        } else if (now > endDateTime) {
          doc.status = InterviewStatus.COMPLETED;
        }
      } else if (doc.confirmationStatus === InterviewConfirmationStatus.SCHEDULED) {
        if (now > endDateTime) {
          doc.status = InterviewStatus.COMPLETED;
        }
      }
    }
    return doc;
  }

  /**
   * Lấy danh sách ứng viên có hồ sơ để chọn trong trang Tạo lịch phỏng vấn (Đã tối ưu query DB)
   */
  async getCandidatesForSelect() {
    const scheduledInterviews = await this.interviewModel
      .find({ status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.UPCOMING, InterviewStatus.IN_PROGRESS] } })
      .select('applicationId')
      .exec();

    const scheduledAppIds = scheduledInterviews
      .filter((item) => item.applicationId)
      .map((item) => item.applicationId);

    const applications = await this.applicationModel
      .find({ _id: { $nin: scheduledAppIds } })
      .populate({
        path: 'candidateId',
        model: 'Candidate',
        populate: { path: 'userId', model: 'User', select: 'name email phone' },
      })
      .populate({
        path: 'jobDescriptionId',
        model: 'JobDescription',
        populate: [
          { path: 'departmentId', model: 'Department' },
          { path: 'interviewerId', model: 'User', select: 'name email role departmentId' },
          { path: 'interviewerIds', model: 'User', select: 'name email role departmentId' },
        ],
      })
      .exec();

    const staffUsers = await this.userModel
      .find({
        role: { $in: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_MANAGER, UserRole.HR_ADMIN] },
      })
      .select('_id name email role departmentId')
      .exec();

    return applications
      .filter((app) => app.candidateId && app.jobDescriptionId)
      .map((app: any) => {
        const candidate = app.candidateId;
        const userObj = candidate?.userId;
        const job = app.jobDescriptionId;
        const dept = job?.departmentId;

        const candidateName =
          typeof userObj === 'object' && userObj?.name && userObj.name.trim() !== ''
            ? userObj.name
            : typeof userObj === 'object' && userObj?.email
            ? userObj.email.split('@')[0]
            : candidate?.fullName || candidate?.name || candidate?.profileName || 'Ứng viên';

        const candidateEmail = typeof userObj === 'object' && userObj?.email ? userObj.email : '';
        const jobTitle = job?.title || 'Vị trí tuyển dụng';
        const defaultInterviewer = job?.interviewerId || (job?.interviewerIds && job.interviewerIds[0]) || null;

        const departmentStaff = staffUsers.filter((u) => {
          if (!dept?._id || !u.departmentId) return true;
          return u.departmentId.toString() === dept._id.toString();
        });

        return {
          applicationId: app._id,
          candidateId: candidate?._id,
          candidateName,
          candidateEmail,
          jobTitle,
          label: `${candidateName} — ${jobTitle}`,
          jobDescriptionId: job?._id,
          departmentId: dept?._id,
          departmentName: dept?.name || 'Phòng ban',
          defaultInterviewerId: defaultInterviewer ? defaultInterviewer._id || defaultInterviewer : null,
          defaultInterviewerName: defaultInterviewer ? defaultInterviewer.name || defaultInterviewer.email : null,
          assignedInterviewers:
            job?.interviewerIds && job.interviewerIds.length > 0
              ? job.interviewerIds
              : defaultInterviewer
              ? [defaultInterviewer]
              : [],
          departmentStaff: departmentStaff.map((u) => ({
            _id: u._id,
            name: u.name || u.email,
            email: u.email,
            role: u.role,
          })),
        };
      });
  }

  /**
   * Lấy danh sách tất cả các buổi phỏng vấn
   */
  async getInterviews(status?: string) {
    const query: any = {};
    if (status && status !== 'ALL' && status !== 'Tất cả trạng thái') {
      query.status = status;
    }

    const interviews = await this.interviewModel
      .find(query)
      .populate({
        path: 'candidateId',
        model: 'Candidate',
        populate: { path: 'userId', model: 'User', select: 'name email phone' },
      })
      .populate({
        path: 'jobDescriptionId',
        model: 'JobDescription',
        populate: { path: 'departmentId', model: 'Department' },
      })
      .populate({ path: 'interviewerId', model: 'User', select: 'name email role' })
      .populate({ path: 'interviewerIds', model: 'User', select: 'name email role' })
      .sort({ date: -1, startTime: 1 })
      .exec();

    return interviews.map((item: any) => {
      const doc = item.toObject ? item.toObject() : item;
      if (doc.candidateId && typeof doc.candidateId === 'object') {
        const u = doc.candidateId.userId;
        if (u && typeof u === 'object') {
          doc.candidateId.fullName = u.name || u.email || doc.candidateId.profileName;
          doc.candidateId.email = u.email;
        }
      }
      return this.computeRealTimeStatus(doc);
    });
  }

  /**
   * Lấy thông tin chi tiết một buổi phỏng vấn theo ID
   */
  async getInterviewById(id: string) {
    const interview = await this.interviewModel
      .findById(id)
      .populate({
        path: 'candidateId',
        model: 'Candidate',
        populate: { path: 'userId', model: 'User', select: 'name email phone' },
      })
      .populate({
        path: 'jobDescriptionId',
        model: 'JobDescription',
        populate: { path: 'departmentId', model: 'Department' },
      })
      .populate({ path: 'interviewerId', model: 'User', select: 'name email role' })
      .populate({ path: 'interviewerIds', model: 'User', select: 'name email role' })
      .exec();

    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn');
    }

    const doc = interview.toObject ? interview.toObject() : interview;
    if (doc.candidateId && typeof doc.candidateId === 'object') {
      const u = (doc.candidateId as any).userId;
      if (u && typeof u === 'object') {
        (doc.candidateId as any).fullName = u.name || u.email || (doc.candidateId as any).profileName;
        (doc.candidateId as any).email = u.email;
      }
    }
    return this.computeRealTimeStatus(doc);
  }

  /**
   * Kiểm tra xem Người phỏng vấn có bị trùng lịch phỏng vấn SCHEDULED khác hay không
   */
  async checkInterviewerConflict(
    interviewerId: string,
    date: string | Date,
    startTime: string,
    endTime: string,
    excludeInterviewId?: string,
  ) {
    if (!interviewerId || !date || !startTime || !endTime) return null;

    const targetDate = new Date(date);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const query: any = {
      $or: [
        { interviewerId: new Types.ObjectId(interviewerId) },
        { interviewerIds: new Types.ObjectId(interviewerId) },
      ],
      status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.UPCOMING, InterviewStatus.IN_PROGRESS] },
    };

    if (excludeInterviewId && Types.ObjectId.isValid(excludeInterviewId)) {
      query._id = { $ne: new Types.ObjectId(excludeInterviewId) };
    }

    const existingInterviews = await this.interviewModel
      .find(query)
      .populate({
        path: 'candidateId',
        model: 'Candidate',
        populate: { path: 'userId', model: 'User', select: 'name email' },
      })
      .exec();

    const [sHour, sMin] = startTime.split(':').map(Number);
    const [eHour, eMin] = endTime.split(':').map(Number);

    const newStart = new Date(targetDate);
    newStart.setHours(sHour, sMin, 0, 0);
    const newEnd = new Date(targetDate);
    newEnd.setHours(eHour, eMin, 0, 0);

    for (const exist of existingInterviews) {
      if (!exist.date) continue;
      const existDate = new Date(exist.date);
      const exYear = existDate.getFullYear();
      const exMonth = String(existDate.getMonth() + 1).padStart(2, '0');
      const exDay = String(existDate.getDate()).padStart(2, '0');
      const existDateStr = `${exYear}-${exMonth}-${exDay}`;

      if (existDateStr !== dateStr) continue;

      const [exSHour, exSMin] = (exist.startTime || '00:00').split(':').map(Number);
      const [exEHour, exEMin] = (exist.endTime || '00:00').split(':').map(Number);

      const existStart = new Date(existDate);
      existStart.setHours(exSHour, exSMin, 0, 0);
      const existEnd = new Date(existDate);
      existEnd.setHours(exEHour, exEMin, 0, 0);

      if (newStart < existEnd && newEnd > existStart) {
        const candObj: any = exist.candidateId;
        const userObj: any = candObj?.userId;
        const candidateName =
          userObj?.name || userObj?.email || candObj?.fullName || candObj?.name || 'ứng viên khác';
        return {
          exist,
          candidateName,
          timeSlot: `${exist.startTime} - ${exist.endTime}`,
          dateFormatted: `${exDay}/${exMonth}/${exYear}`,
        };
      }
    }

    return null;
  }

  /**
   * Tạo lịch phỏng vấn mới
   */
  async createInterview(dto: CreateInterviewDto) {
    const application = await this.applicationModel
      .findById(dto.applicationId)
      .populate({
        path: 'candidateId',
        model: 'Candidate',
        populate: { path: 'userId', model: 'User', select: 'name email' },
      })
      .populate({
        path: 'jobDescriptionId',
        model: 'JobDescription',
        populate: { path: 'departmentId', model: 'Department' },
      })
      .exec();

    if (!application) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển.');
    }

    const conflict = await this.checkInterviewerConflict(
      dto.interviewerId,
      dto.date,
      dto.startTime,
      dto.endTime,
    );

    if (conflict) {
      const interviewerUser = await this.userModel.findById(dto.interviewerId).exec();
      const interviewerName = interviewerUser?.name || 'Người phỏng vấn';
      throw new BadRequestException(
        `Người phỏng vấn ${interviewerName} đã có lịch phỏng vấn với ứng viên "${conflict.candidateName}" vào khung giờ ${conflict.timeSlot} ngày ${conflict.dateFormatted}. Vui lòng chọn khung giờ hoặc người phỏng vấn khác!`,
      );
    }

    const candObj: any = application.candidateId;
    const userObj: any = candObj?.userId;
    const candidateName =
      userObj?.name || userObj?.email?.split('@')[0] || candObj?.fullName || candObj?.name || 'UngVien';

    const jobObj: any = application.jobDescriptionId;
    const deptObj: any = jobObj?.departmentId;
    const departmentName = deptObj?.name || 'PhongBan';
    const jobTitle = jobObj?.title || 'ViTri';

    let meetingLink = dto.meetingLink;
    if (
      dto.locationType === LocationType.ONLINE ||
      (!dto.locationType && dto.autoCreateMeet !== false)
    ) {
      if (!meetingLink || dto.autoCreateMeet) {
        meetingLink = this.generateJitsiMeetUrl(departmentName, candidateName, jobTitle);
      }
    }

    const interview = new this.interviewModel({
      applicationId: application._id,
      candidateId: application.candidateId?._id || application.candidateId,
      jobDescriptionId: application.jobDescriptionId?._id || application.jobDescriptionId,
      interviewerId: new Types.ObjectId(dto.interviewerId),
      interviewerIds: [new Types.ObjectId(dto.interviewerId)],
      date: new Date(dto.date),
      startTime: dto.startTime,
      endTime: dto.endTime,
      locationType: dto.locationType || LocationType.ONLINE,
      meetingLink: dto.locationType === LocationType.OFFSITE ? undefined : meetingLink,
      offsiteLocation: dto.offsiteLocation,
      status: InterviewStatus.SCHEDULED,
      result: InterviewResult.PENDING,
      confirmationStatus: InterviewConfirmationStatus.SCHEDULED,
      notes: dto.notes,
    });

    return await interview.save();
  }

  /**
   * Cập nhật / Đổi lịch phỏng vấn
   */
  async updateInterview(id: string, dto: UpdateInterviewDto) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    const targetInterviewerId = dto.interviewerId || interview.interviewerId?.toString();
    const targetDate = dto.date ? new Date(dto.date) : interview.date;
    const targetStartTime = dto.startTime || interview.startTime;
    const targetEndTime = dto.endTime || interview.endTime;

    const targetStatus = dto.status || interview.status;
    if (
      (targetStatus === InterviewStatus.SCHEDULED || targetStatus === InterviewStatus.UPCOMING) &&
      targetInterviewerId &&
      targetDate &&
      targetStartTime &&
      targetEndTime
    ) {
      const conflict = await this.checkInterviewerConflict(
        targetInterviewerId,
        targetDate,
        targetStartTime,
        targetEndTime,
        id,
      );

      if (conflict) {
        const interviewerUser = await this.userModel.findById(targetInterviewerId).exec();
        const interviewerName = interviewerUser?.name || 'Người phỏng vấn';
        throw new BadRequestException(
          `Người phỏng vấn ${interviewerName} đã có lịch phỏng vấn với ứng viên "${conflict.candidateName}" vào khung giờ ${conflict.timeSlot} ngày ${conflict.dateFormatted}. Vui lòng chọn khung giờ hoặc người phỏng vấn khác!`,
        );
      }
    }

    if (dto.interviewerId) {
      interview.interviewerId = new Types.ObjectId(dto.interviewerId) as any;
    }
    if (dto.date || dto.startTime || dto.endTime || dto.interviewerId) {
      if (dto.date) interview.date = new Date(dto.date);
      if (dto.startTime) interview.startTime = dto.startTime;
      if (dto.endTime) interview.endTime = dto.endTime;

      interview.confirmationStatus = InterviewConfirmationStatus.SCHEDULED;
    }

    if (dto.locationType) interview.locationType = dto.locationType;
    if (dto.offsiteLocation !== undefined) interview.offsiteLocation = dto.offsiteLocation;
    if (dto.notes !== undefined) interview.notes = dto.notes;
    if (dto.status) interview.status = dto.status;
    if (dto.result) interview.result = dto.result;
    if (dto.feedback !== undefined) interview.feedback = dto.feedback;

    if (dto.locationType === LocationType.ONLINE) {
      if (dto.autoCreateMeet || !interview.meetingLink) {
        const application = await this.applicationModel
          .findById(interview.applicationId)
          .populate({
            path: 'candidateId',
            model: 'Candidate',
            populate: { path: 'userId', model: 'User', select: 'name email' },
          })
          .populate({
            path: 'jobDescriptionId',
            model: 'JobDescription',
            populate: { path: 'departmentId', model: 'Department' },
          })
          .exec();

        const candObj: any = application?.candidateId;
        const userObj: any = candObj?.userId;
        const candidateName =
          userObj?.name || userObj?.email?.split('@')[0] || candObj?.fullName || candObj?.name || 'UngVien';

        const jobObj: any = application?.jobDescriptionId;
        const deptObj: any = jobObj?.departmentId;
        const departmentName = deptObj?.name || 'PhongBan';
        const jobTitle = jobObj?.title || 'ViTri';

        interview.meetingLink = this.generateJitsiMeetUrl(departmentName, candidateName, jobTitle);
      }
    } else if (dto.locationType === LocationType.OFFSITE) {
      interview.meetingLink = undefined;
    }

    return await interview.save();
  }

  /**
   * Cập nhật nhanh trạng thái / kết quả / feedback
   */
  async updateStatus(id: string, status?: InterviewStatus, result?: InterviewResult, feedback?: string) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    if (status) interview.status = status;
    if (result) interview.result = result;
    if (feedback !== undefined) interview.feedback = feedback;

    return await interview.save();
  }

  /**
   * Lấy danh sách lịch phỏng vấn của ứng viên đang đăng nhập
   * (Chỉ hiển thị lịch khi HR đã duyệt: SCHEDULED, CONFIRMED, CANCEL_REQUESTED, CANCELLED)
   */
  async getMyInterviews(userId: string) {
    const candidateDocs = await this.candidateModel
      .find({ userId: new Types.ObjectId(userId) })
      .select('_id')
      .exec();

    const candidateIds = candidateDocs.map((c) => c._id);

    const interviews = await this.interviewModel
      .find({
        candidateId: { $in: candidateIds },
        confirmationStatus: {
          $in: [
            InterviewConfirmationStatus.SCHEDULED,
            InterviewConfirmationStatus.CONFIRMED,
            InterviewConfirmationStatus.CANCEL_REQUESTED,
            InterviewConfirmationStatus.CANCELLED,
          ],
        },
      })
      .populate({
        path: 'candidateId',
        model: 'Candidate',
        populate: { path: 'userId', model: 'User', select: 'name email phone' },
      })
      .populate({
        path: 'jobDescriptionId',
        model: 'JobDescription',
        populate: { path: 'departmentId', model: 'Department' },
      })
      .populate({ path: 'interviewerId', model: 'User', select: 'name email role' })
      .populate({ path: 'interviewerIds', model: 'User', select: 'name email role' })
      .sort({ date: -1, startTime: 1 })
      .exec();

    return interviews.map((item: any) => {
      const doc = item.toObject ? item.toObject() : item;
      delete doc.feedback;
      delete doc.notes;
      return this.computeRealTimeStatus(doc);
    });
  }

  /**
   * Lấy thông tin phỏng vấn theo applicationId
   */
  async getInterviewByApplicationId(applicationId: string) {
    if (!Types.ObjectId.isValid(applicationId)) {
      return null;
    }
    const interview = await this.interviewModel.findOne({ applicationId: new Types.ObjectId(applicationId) }).exec();
    if (!interview) return null;
    const doc = interview.toObject ? interview.toObject() : interview;
    return this.computeRealTimeStatus(doc);
  }

  /**
   * HR Yêu cầu Trưởng phòng xem CV & lên lịch phỏng vấn (Chuyển đơn sang Department Review)
   */
  async requestDeptSchedule(applicationId: string) {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('jobDescriptionId')
      .exec();

    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    let interview = await this.interviewModel.findOne({ applicationId: application._id }).exec();

    if (!interview) {
      const job: any = application.jobDescriptionId;
      const defaultInterviewer = job?.interviewerId || application.candidateId;

      interview = new this.interviewModel({
        applicationId: application._id,
        candidateId: application.candidateId,
        jobDescriptionId: application.jobDescriptionId,
        interviewerId: defaultInterviewer || new Types.ObjectId(),
        date: undefined,
        startTime: undefined,
        endTime: undefined,
        locationType: LocationType.ONLINE,
        status: InterviewStatus.SCHEDULED,
        result: InterviewResult.PENDING,
        confirmationStatus: InterviewConfirmationStatus.WAITING_DEPT_SCHEDULE,
      });
    } else {
      if (!interview.date || !interview.startTime) {
        interview.confirmationStatus = InterviewConfirmationStatus.WAITING_DEPT_SCHEDULE;
        interview.date = undefined;
        interview.startTime = undefined;
        interview.endTime = undefined;
      }
    }

    return await interview.save();
  }

  /**
   * Trưởng phòng từ chối CV ở vòng Department Review
   */
  async rejectDeptCv(id: string, reason?: string) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy thông tin phỏng vấn');
    }

    interview.confirmationStatus = InterviewConfirmationStatus.REJECTED;
    interview.status = InterviewStatus.CANCELLED;
    if (reason) interview.notes = reason;

    if (interview.applicationId) {
      await this.applicationModel.findByIdAndUpdate(interview.applicationId, {
        status: ApplicationStatus.REJECTED,
        reviewStatus: 'Rejected',
        rejectReason: reason || 'Trưởng phòng từ chối CV',
        rejectedAt: new Date(),
      }).exec();
    }

    return await interview.save();
  }

  /**
   * Trưởng phòng chọn lịch phỏng vấn và chọn Người phỏng vấn (Interviewer)
   * -> Chuyển sang trạng thái WAITING_HR_APPROVAL (Chờ HR duyệt)
   */
  async submitDeptSchedule(
    id: string,
    dto: {
      date: string;
      startTime: string;
      endTime: string;
      locationType?: LocationType;
      meetingLink?: string;
      offsiteLocation?: string;
      interviewerId: string;
      interviewerIds?: string[];
      notes?: string;
    },
  ) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy thông tin phỏng vấn');
    }

    interview.date = new Date(dto.date);
    interview.startTime = dto.startTime;
    interview.endTime = dto.endTime;
    if (dto.locationType) interview.locationType = dto.locationType;
    if (dto.locationType === LocationType.OFFSITE) {
      interview.meetingLink = undefined;
    } else if (dto.locationType === LocationType.ONLINE) {
      if (dto.meetingLink) {
        interview.meetingLink = dto.meetingLink;
      } else if (!interview.meetingLink) {
        const jobObj: any = interview.jobDescriptionId;
        const deptName = jobObj?.departmentId?.name || 'PhongBan';
        const jobTitle = jobObj?.title || 'ViTri';
        interview.meetingLink = this.generateJitsiMeetUrl(deptName, 'UngVien', jobTitle);
      }
    } else if (dto.meetingLink) {
      interview.meetingLink = dto.meetingLink;
    }
    if (dto.offsiteLocation) interview.offsiteLocation = dto.offsiteLocation;
    if (dto.interviewerId && Types.ObjectId.isValid(dto.interviewerId)) {
      interview.interviewerId = new Types.ObjectId(dto.interviewerId);
    }
    if (dto.interviewerIds && Array.isArray(dto.interviewerIds)) {
      interview.interviewerIds = dto.interviewerIds
        .filter((idStr) => Types.ObjectId.isValid(idStr))
        .map((idStr) => new Types.ObjectId(idStr));
    }
    if (dto.notes) interview.notes = dto.notes;

    interview.confirmationStatus = InterviewConfirmationStatus.WAITING_HR_APPROVAL;
    return await interview.save();
  }

  /**
   * HR Duyệt lịch phỏng vấn do Trưởng phòng đề xuất
   * -> Chuyển sang trạng thái SCHEDULED (Hiển thị cho Ứng viên xác nhận)
   */
  async approveInterviewSchedule(id: string) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn');
    }
    interview.confirmationStatus = InterviewConfirmationStatus.SCHEDULED;
    return await interview.save();
  }

  /**
   * Cập nhật trạng thái xác nhận tham gia của ứng viên (CONFIRMED) -> Sắp diễn ra (UPCOMING)
   */
  async updateCandidateConfirmation(id: string, confirmationStatus: InterviewConfirmationStatus) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }
    interview.confirmationStatus = confirmationStatus;
    const saved = await interview.save();

    // Khi ứng viên xác nhận phỏng vấn, tự động chuyển card ứng viên ở Kanban sang cột tiếp theo
    if (confirmationStatus === InterviewConfirmationStatus.CONFIRMED && interview.applicationId) {
      try {
        const application = await this.applicationModel
          .findById(interview.applicationId)
          .populate({
            path: 'jobDescriptionId',
            populate: { path: 'pipelineTemplateId' },
          })
          .exec();

        if (application && application.jobDescriptionId) {
          const job: any = application.jobDescriptionId;
          const pipeline: any = job?.pipelineTemplateId;
          if (pipeline && Array.isArray(pipeline.stages) && pipeline.stages.length > 0) {
            const sortedStages = [...pipeline.stages].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
            const currentIndex = sortedStages.findIndex(
              (s: any) => s._id?.toString() === application.currentStageId?.toString(),
            );

            if (currentIndex >= 0 && currentIndex < sortedStages.length - 1) {
              const nextStage = sortedStages[currentIndex + 1];
              application.currentStageId = nextStage._id;
              await application.save();
            }
          }
        }
      } catch (stageErr) {
        console.error('Lỗi khi tự động chuyển stage Kanban:', stageErr);
      }
    }

    return saved;
  }

  /**
   * Ứng viên gửi Yêu cầu Hủy lịch phỏng vấn (Bắt buộc kèm lý do)
   */
  async requestCandidateCancellation(id: string, reason: string) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    if (!reason || !reason.trim()) {
      throw new BadRequestException('Vui lòng cung cấp lý do hủy lịch phỏng vấn.');
    }

    interview.confirmationStatus = InterviewConfirmationStatus.CANCEL_REQUESTED;
    interview.cancelReason = reason.trim();
    return await interview.save();
  }

  /**
   * HR/Admin xác nhận đồng ý Hủy lịch phỏng vấn theo yêu cầu của Ứng viên
   */
  async approveCandidateCancellation(id: string) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    interview.status = InterviewStatus.CANCELLED;
    interview.confirmationStatus = InterviewConfirmationStatus.CANCELLED;
    return await interview.save();
  }
}
