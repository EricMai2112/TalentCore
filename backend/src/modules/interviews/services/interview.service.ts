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
    return doc;
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
      status: InterviewStatus.SCHEDULED,
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

      // Overlap condition: newStart < existEnd && newEnd > existStart
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

    // Check conflict for interviewer
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

    const targetInterviewerId = dto.interviewerId || interview.interviewerId?.toString();
    const targetDate = dto.date ? new Date(dto.date) : interview.date;
    const targetStartTime = dto.startTime || interview.startTime;
    const targetEndTime = dto.endTime || interview.endTime;

    // Check conflict if scheduled status
    const targetStatus = dto.status || interview.status;
    if (targetStatus === InterviewStatus.SCHEDULED && targetInterviewerId) {
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

      // Khi HR thay đổi thời gian/người phỏng vấn -> chuyển trạng thái chờ ứng viên xác nhận
      interview.confirmationStatus = 'PENDING';
      interview.proposedCustomDate = undefined;
      interview.proposedCustomStartTime = undefined;
      interview.proposedCustomEndTime = undefined;
      interview.isEscalated = false;
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

  /**
   * Tính toán danh sách "Khung giờ chưa có lịch phỏng vấn khác"
   * Áp dụng 4 bộ lọc ràng buộc:
   * 1. Giờ làm việc doanh nghiệp (08:00 - 12:00 & 13:30 - 17:30, trừ T7 & CN)
   * 2. Thời gian báo trước tối thiểu >= 24h
   * 3. Loại trừ trùng lịch phỏng vấn SCHEDULED khác của Interviewer
   * 4. Thời gian đệm nghỉ 15 phút sau mỗi buổi phỏng vấn
   */
  async getAvailableTimeSlots(
    interviewerId?: string,
    durationMinutes: number = 60,
    daysAhead: number = 14,
    targetDateStr?: string,
  ) {
    const now = new Date();
    const minStartDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h notice lead time

    const standardDailySlots = [
      { startTime: '08:00', endTime: '09:00' },
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '13:30', endTime: '14:30' },
      { startTime: '14:30', endTime: '15:30' },
      { startTime: '15:30', endTime: '16:30' },
      { startTime: '16:30', endTime: '17:30' },
    ];

    let existingInterviews: any[] = [];
    if (interviewerId && Types.ObjectId.isValid(interviewerId)) {
      existingInterviews = await this.interviewModel
        .find({
          $or: [
            { interviewerId: new Types.ObjectId(interviewerId) },
            { interviewerIds: new Types.ObjectId(interviewerId) },
          ],
          status: InterviewStatus.SCHEDULED,
        })
        .exec();
    }

    const availableSlots: {
      date: string;
      startTime: string;
      endTime: string;
      label: string;
      dayOfWeek: string;
      isAvailable?: boolean;
      disabledReason?: string;
    }[] = [];

    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    if (targetDateStr) {
      const targetDate = new Date(targetDateStr);
      if (!isNaN(targetDate.getTime())) {
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(targetDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;
        const dayOfWeek = targetDate.getDay();

        for (const slot of standardDailySlots) {
          const [sHour, sMin] = slot.startTime.split(':').map(Number);
          const [eHour, eMin] = slot.endTime.split(':').map(Number);

          const slotStart = new Date(targetDate);
          slotStart.setHours(sHour, sMin, 0, 0);

          const slotEnd = new Date(targetDate);
          slotEnd.setHours(eHour, eMin, 0, 0);

          let isAvailable = true;
          let disabledReason: string | undefined = undefined;

          if (dayOfWeek === 0 || dayOfWeek === 6) {
            isAvailable = false;
            disabledReason = 'Ngoài giờ làm việc (Cuối tuần)';
          } else if (slotStart < minStartDateTime) {
            isAvailable = false;
            disabledReason = 'Thời gian đã qua / Cần báo trước ít nhất 2h';
          } else {
            for (const exist of existingInterviews) {
              const existDate = new Date(exist.date);
              const existYear = existDate.getFullYear();
              const existMonth = String(existDate.getMonth() + 1).padStart(2, '0');
              const existDay = String(existDate.getDate()).padStart(2, '0');
              const existDateStr = `${existYear}-${existMonth}-${existDay}`;

              if (existDateStr !== dateString) continue;

              const [exSHour, exSMin] = (exist.startTime || '00:00').split(':').map(Number);
              const [exEHour, exEMin] = (exist.endTime || '00:00').split(':').map(Number);

              const existStart = new Date(existDate);
              existStart.setHours(exSHour, exSMin, 0, 0);

              const existEnd = new Date(existDate);
              existEnd.setHours(exEHour, exEMin + 15, 0, 0);

              if (slotStart < existEnd && slotEnd > existStart) {
                isAvailable = false;
                disabledReason = 'Người phỏng vấn bận (Đã có lịch phỏng vấn khác)';
                break;
              }
            }
          }

          availableSlots.push({
            date: dateString,
            startTime: slot.startTime,
            endTime: slot.endTime,
            label: `${slot.startTime} - ${slot.endTime}`,
            dayOfWeek: dayNames[dayOfWeek],
            isAvailable,
            disabledReason,
          });
        }
        return availableSlots;
      }
    }

    for (let dayOffset = 1; dayOffset <= daysAhead; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);

      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(targetDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dayStr}`;

      for (const slot of standardDailySlots) {
        const [sHour, sMin] = slot.startTime.split(':').map(Number);
        const [eHour, eMin] = slot.endTime.split(':').map(Number);

        const slotStart = new Date(targetDate);
        slotStart.setHours(sHour, sMin, 0, 0);

        const slotEnd = new Date(targetDate);
        slotEnd.setHours(eHour, eMin, 0, 0);

        if (slotStart < minStartDateTime) continue;

        let isConflicting = false;

        for (const exist of existingInterviews) {
          const existDate = new Date(exist.date);
          const existYear = existDate.getFullYear();
          const existMonth = String(existDate.getMonth() + 1).padStart(2, '0');
          const existDay = String(existDate.getDate()).padStart(2, '0');
          const existDateStr = `${existYear}-${existMonth}-${existDay}`;

          if (existDateStr !== dateString) continue;

          const [exSHour, exSMin] = (exist.startTime || '00:00').split(':').map(Number);
          const [exEHour, exEMin] = (exist.endTime || '00:00').split(':').map(Number);

          const existStart = new Date(existDate);
          existStart.setHours(exSHour, exSMin, 0, 0);

          const existEnd = new Date(existDate);
          existEnd.setHours(exEHour, exEMin + 15, 0, 0);

          if (slotStart < existEnd && slotEnd > existStart) {
            isConflicting = true;
            break;
          }
        }

        availableSlots.push({
          date: dateString,
          startTime: slot.startTime,
          endTime: slot.endTime,
          label: `${slot.startTime} - ${slot.endTime}, ${dayNames[dayOfWeek]} ${dayStr}/${month}/${year}`,
          dayOfWeek: dayNames[dayOfWeek],
          isAvailable: !isConflicting,
          disabledReason: isConflicting ? 'Người phỏng vấn bận (Đã có lịch phỏng vấn khác)' : undefined,
        });
      }
    }

    return availableSlots.slice(0, 24);
  }

  /**
   * Xử lý Đề nghị đổi lịch từ Ứng viên (Hỗ trợ chọn khung gợi ý HOẶC đề xuất thủ công + lối thoát Escalate)
   */
  async requestCandidateReschedule(
    id: string,
    dto: {
      selectedSlot?: { date: string; startTime: string; endTime: string };
      customSlot?: { date: string; startTime: string; endTime: string };
      reason?: string;
    }
  ) {
    const interview = await this.interviewModel
      .findById(id)
      .populate({
        path: 'jobDescriptionId',
        model: 'JobDescription',
        populate: [
          { path: 'interviewerId', model: 'User', select: 'name email' },
          { path: 'interviewerIds', model: 'User', select: 'name email' },
        ],
      })
      .exec();

    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    const currentCount = (interview.rescheduleCount || 0) + 1;
    interview.rescheduleCount = currentCount;
    interview.confirmationStatus = 'RESCHEDULE_REQUESTED';
    if (dto.reason) interview.rescheduleReason = dto.reason;

    const targetSlot = dto.selectedSlot || dto.customSlot;
    if (targetSlot) {
      interview.proposedCustomDate = new Date(targetSlot.date);
      interview.proposedCustomStartTime = targetSlot.startTime;
      interview.proposedCustomEndTime = targetSlot.endTime;
    }

    if (dto.customSlot || currentCount > 2) {
      interview.isEscalated = true;
    }

    return await interview.save();
  }

  /**
   * HR/Interviewer Chấp nhận đề nghị đổi lịch của Ứng viên
   */
  async approveCandidateReschedule(id: string) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    if (
      !interview.proposedCustomDate ||
      !interview.proposedCustomStartTime ||
      !interview.proposedCustomEndTime
    ) {
      throw new BadRequestException('Không tìm thấy thông tin đề xuất thời gian mới từ ứng viên.');
    }

    // Check conflict for interviewer at proposed time
    const conflict = await this.checkInterviewerConflict(
      interview.interviewerId.toString(),
      interview.proposedCustomDate,
      interview.proposedCustomStartTime,
      interview.proposedCustomEndTime,
      id,
    );

    if (conflict) {
      const interviewerUser = await this.userModel.findById(interview.interviewerId).exec();
      const interviewerName = interviewerUser?.name || 'Người phỏng vấn';
      throw new BadRequestException(
        `Người phỏng vấn ${interviewerName} đã có lịch phỏng vấn khác vào khung giờ ${conflict.timeSlot} ngày ${conflict.dateFormatted}. Vui lòng sắp xếp khung giờ khác!`,
      );
    }

    // Apply proposed custom date/time to main interview date/time
    interview.date = interview.proposedCustomDate;
    interview.startTime = interview.proposedCustomStartTime;
    interview.endTime = interview.proposedCustomEndTime;

    // Reset proposed custom fields
    interview.proposedCustomDate = undefined;
    interview.proposedCustomStartTime = undefined;
    interview.proposedCustomEndTime = undefined;
    interview.confirmationStatus = 'CONFIRMED';
    interview.isEscalated = false;

    return await interview.save();
  }

  /**
   * HR/Interviewer Từ chối đề nghị đổi lịch của Ứng viên
   */
  async rejectCandidateReschedule(id: string, reason?: string) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    interview.proposedCustomDate = undefined;
    interview.proposedCustomStartTime = undefined;
    interview.proposedCustomEndTime = undefined;
    interview.confirmationStatus = 'RESCHEDULE_REJECTED';
    interview.rescheduleRejectReason = reason || 'Hội đồng phỏng vấn bận/không thể thu xếp khung giờ này.';
    interview.isEscalated = false;

    return await interview.save();
  }

  /**
   * HR/Interviewer Đề xuất nhiều khung giờ khác cho ứng viên lựa chọn
   */
  async proposeAdminSlots(
    id: string,
    proposedSlots: { date: string; startTime: string; endTime: string }[],
    notes?: string,
  ) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    interview.proposedSlots = proposedSlots.map((s) => ({
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
    }));
    interview.proposedBy = 'ADMIN';
    interview.confirmationStatus = 'ADMIN_PROPOSED';
    if (notes) interview.notes = notes;

    return await interview.save();
  }

  /**
   * Ứng viên chọn 1 khung giờ duy nhất từ danh sách đề xuất của HR và xác nhận
   */
  async acceptProposedSlot(
    id: string,
    selectedSlot: { date: string; startTime: string; endTime: string },
  ) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn.');
    }

    const slotDate = new Date(selectedSlot.date);

    // Check conflict
    const conflict = await this.checkInterviewerConflict(
      interview.interviewerId.toString(),
      slotDate,
      selectedSlot.startTime,
      selectedSlot.endTime,
      id,
    );

    if (conflict) {
      throw new BadRequestException(
        `Khung giờ ${selectedSlot.startTime} - ${selectedSlot.endTime} ngày ${selectedSlot.date} vừa bị trùng lịch với buổi phỏng vấn khác. Vui lòng chọn khung giờ khác!`,
      );
    }

    interview.date = slotDate;
    interview.startTime = selectedSlot.startTime;
    interview.endTime = selectedSlot.endTime;
    interview.proposedSlots = [];
    interview.proposedCustomDate = undefined;
    interview.proposedCustomStartTime = undefined;
    interview.proposedCustomEndTime = undefined;
    interview.confirmationStatus = 'CONFIRMED';
    interview.isEscalated = false;

    return await interview.save();
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

    interview.confirmationStatus = 'CANCEL_REQUESTED';
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
    interview.confirmationStatus = 'CANCELLED';
    return await interview.save();
  }
}
