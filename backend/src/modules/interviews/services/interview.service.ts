import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interview, InterviewDocument, LocationType, InterviewStatus, InterviewResult } from '../schemas/interview.schema';
import { Application, ApplicationDocument } from '../../applications/schemas/application.schema';
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
   * Lấy danh sách ứng viên có hồ sơ để chọn trong trang Tạo lịch phỏng vấn
   */
  async getCandidatesForSelect() {
    const applications = await this.applicationModel
      .find()
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

    // Đồng thời lấy tất cả Nhân viên và Trưởng phòng để dự phòng lọc theo phòng ban
    const staffUsers = await this.userModel
      .find({
        role: { $in: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_MANAGER, UserRole.HR_ADMIN] },
      })
      .select('_id name email role departmentId')
      .exec();

    // Lấy danh sách ID các đơn ứng tuyển đã có lịch phỏng vấn ở trạng thái SCHEDULED (Đã lên lịch)
    const scheduledInterviews = await this.interviewModel
      .find({ status: InterviewStatus.SCHEDULED })
      .select('applicationId')
      .exec();

    const scheduledAppIds = new Set(
      scheduledInterviews.map((item) => (item.applicationId ? item.applicationId.toString() : ''))
    );

    return applications
      .filter((app) => {
        if (!app.candidateId || !app.jobDescriptionId) return false;
        // Loại bỏ những ứng viên/hồ sơ đã có lịch phỏng vấn đang ở trạng thái SCHEDULED (Đã lên lịch)
        if (scheduledAppIds.has(app._id.toString())) return false;
        return true;
      })
      .map((app: any) => {
        const candidate = app.candidateId;
        const userObj = candidate?.userId;
        const job = app.jobDescriptionId;
        const dept = job?.departmentId;

        // Lấy tên thật của ứng viên từ User -> Candidate -> Fallback
        const candidateName =
          typeof userObj === 'object' && userObj?.name && userObj.name.trim() !== ''
            ? userObj.name
            : typeof userObj === 'object' && userObj?.email
            ? userObj.email.split('@')[0]
            : candidate?.fullName || candidate?.name || candidate?.profileName || 'Ứng viên';

        const candidateEmail = typeof userObj === 'object' && userObj?.email ? userObj.email : '';

        const jobTitle = job?.title || 'Vị trí tuyển dụng';

        // Người phỏng vấn gán sẵn trên JD (nếu có)
        const defaultInterviewer = job?.interviewerId || (job?.interviewerIds && job.interviewerIds[0]) || null;

        // Danh sách tất cả nhân viên / trưởng phòng thuộc phòng ban của JD
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

    // Map candidate name from userId if needed
    return interviews.map((item: any) => {
      const doc = item.toObject ? item.toObject() : item;
      if (doc.candidateId && typeof doc.candidateId === 'object') {
        const u = doc.candidateId.userId;
        if (u && typeof u === 'object') {
          doc.candidateId.fullName = u.name || u.email || doc.candidateId.profileName;
          doc.candidateId.email = u.email;
        }
      }
      return doc;
    });
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
      notes: dto.notes,
    });

    return await interview.save();
  }

  /**
   * Cập nhật / Đổi lịch phỏng vấn (Reschedule)
   */
  async updateInterview(id: string, dto: UpdateInterviewDto) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    if (dto.interviewerId) {
      interview.interviewerId = new Types.ObjectId(dto.interviewerId) as any;
    }
    if (dto.date) {
      interview.date = new Date(dto.date);
    }
    if (dto.startTime) interview.startTime = dto.startTime;
    if (dto.endTime) interview.endTime = dto.endTime;
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
      } else if (dto.meetingLink) {
        interview.meetingLink = dto.meetingLink;
      }
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
   * (Tự động loại bỏ thông tin đánh giá / feedback riêng của nhà tuyển dụng)
   */
  async getMyInterviews(userId: string) {
    const candidateDocs = await this.candidateModel
      .find({ userId: new Types.ObjectId(userId) })
      .select('_id')
      .exec();

    const candidateIds = candidateDocs.map((c) => c._id);

    const interviews = await this.interviewModel
      .find({ candidateId: { $in: candidateIds } })
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
      // Loại bỏ thông tin đánh giá / feedback cho ứng viên
      delete doc.feedback;
      delete doc.notes;
      return doc;
    });
  }

  /**
   * Cập nhật trạng thái xác nhận tham gia của ứng viên
   */
  async updateCandidateConfirmation(id: string, confirmationStatus: string) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }
    interview.confirmationStatus = confirmationStatus;
    return await interview.save();
  }
}
