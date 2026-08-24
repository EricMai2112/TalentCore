import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { JobDescription, JobDescriptionDocument, JobStatus } from '../schemas/job-description.schema';
import { CreateJobDescriptionDto, UpdateJobDescriptionDto } from '../dtos/job-description.dto';
import { SuggestCriteriaWeightsDto } from '../dtos/suggest-criteria-weights.dto';
import { GenerateJdContentDto } from '../dtos/generate-jd-content.dto';
import { EventsGateway } from '../gateways/events.gateway';

@Injectable()
export class JobDescriptionService {
  private ai: GoogleGenAI;

  constructor(
    @InjectModel(JobDescription.name)
    private readonly jobDescriptionModel: Model<JobDescriptionDocument>,
    private readonly eventsGateway: EventsGateway,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Thiếu GEMINI_API_KEY trong file .env');
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  private validateCriteriaWeights(criteria?: any[]): void {
    if (criteria && criteria.length > 0) {
      const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        throw new BadRequestException(
          `Tổng trọng số các tiêu chí phải bằng đúng 100% (Hiện tại: ${totalWeight}%)`,
        );
      }
    }
  }

  async suggestCriteriaWeightsWithAi(dto: SuggestCriteriaWeightsDto): Promise<{
    suggestedWeights: { index: number; name: string; weight: number }[];
    reasoning: string;
  }> {
    if (!dto.criteria || dto.criteria.length === 0) {
      throw new BadRequestException('Danh sách tiêu chí không được để trống');
    }

    const systemInstruction = `
      Bạn là Chuyên gia AI Tư vấn Tuyển dụng & Matching cao cấp cho hệ thống TalentCore ATS.
      Nhiệm vụ của bạn là phân tích Vị trí công việc, Cấp độ kinh nghiệm, Phòng ban và danh sách các tiêu chí kỹ năng/yêu cầu để tính toán trọng số % tối ưu cho từng tiêu chí.
      
      Quy tắc phân bổ trọng số (BẮT BUỘC):
      1. Tổng trọng số của TẤT CẢ tiêu chí phải bằng ĐÚNG 100%.
      2. Các tiêu chí MANDATORY (🔴 Bắt buộc) PHẢI có trọng số CAO HƠN các tiêu chí PREFERRED (🔵 Ưu tiên).
      3. Tránh để 1 tiêu chí quá 50% trừ khi danh sách chỉ có 1-2 tiêu chí.
      4. Trả về đúng chỉ số index của tiêu chí tương ứng trong mảng đầu vào.
      5. Đưa ra câu giải thích lý do phân bổ (reasoning) ngắn gọn, chuyên nghiệp bằng tiếng Việt (khoảng 2-3 câu).
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        reasoning: { type: Type.STRING, description: 'Lời giải thích lý do phân bổ trọng số' },
        suggestedWeights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.NUMBER, description: 'Chỉ số index của tiêu chí' },
              name: { type: Type.STRING, description: 'Tên tiêu chí' },
              weight: { type: Type.NUMBER, description: 'Trọng số phần trăm (số nguyên)' },
            },
            required: ['index', 'name', 'weight'],
          },
        },
      },
      required: ['reasoning', 'suggestedWeights'],
    };

    const criteriaListText = dto.criteria
      .map((c, i) => `[Index ${i}] Tên: "${c.name}", LoaiYeuCau: "${c.requirementType}"`)
      .join('\n');

    const promptText = `
      Vị trí tuyển dụng: ${dto.positionTitle || 'Chưa xác định'}
      Cấp độ kinh nghiệm: ${dto.experienceLevel || 'Chưa xác định'}
      Phòng ban: ${dto.departmentName || 'Chưa xác định'}

      Danh sách tiêu chí cần phân bổ trọng số %:
      ${criteriaListText}

      Hãy phân tích ngữ cảnh công việc và trả về kết quả JSON theo schema.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      });

      let rawText = response.text || '';
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(rawText.trim());

      if (parsed.suggestedWeights && parsed.suggestedWeights.length > 0) {
        const sum = parsed.suggestedWeights.reduce((a: number, b: any) => a + (Number(b.weight) || 0), 0);
        if (sum > 0 && Math.abs(sum - 100) > 0.01) {
          const factor = 100 / sum;
          let runningSum = 0;
          parsed.suggestedWeights.forEach((item: any, idx: number) => {
            if (idx === parsed.suggestedWeights.length - 1) {
              item.weight = 100 - runningSum;
            } else {
              item.weight = Math.round(item.weight * factor);
              runningSum += item.weight;
            }
          });
        }
      }

      return parsed;
    } catch (err: any) {
      console.error('Lỗi Gemini AI suggest weights:', err?.message || err);
      throw new InternalServerErrorException('Có lỗi xảy ra khi gọi AI gợi ý trọng số. Vui lòng thử lại!');
    }
  }

  async generateJdContentWithAi(dto: GenerateJdContentDto): Promise<{
    description: string;
    requirements: string;
    benefits: string;
  }> {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('Tiêu đề công việc không được để trống');
    }

    const systemInstruction = `
      Bạn là Chuyên gia Soạn thảo JD & Tuyển dụng Nhân sự Cao cấp tại TalentCore ATS.
      Nhiệm vụ của bạn là phân tích chi tiết vị trí công việc, kinh nghiệm, kỹ năng và tiêu chí để tự động sinh ra nội dung JD hoàn chỉnh gồm 3 phần:
      1. description (Mô tả công việc): Trách nhiệm daily, dự án, quy trình làm việc.
      2. requirements (Yêu cầu ứng viên): Yêu cầu kỹ năng chuyên môn, năm kinh nghiệm, bằng cấp, soft skills.
      3. benefits (Quyền lợi đãi ngộ): Chế độ lương thưởng, bảo hiểm, máy tính/thiết bị, du lịch, cơ hội thăng tiến.

      QUY TẮC BẮT BUỘC VỀ ĐỊNH DẠNG (STRICT FORMATTING RULES):
      - Trình bày trực diện, cô đọng bằng tiếng Việt chuyên nghiệp.
      - TUYỆT ĐỐI BẮT BUỘC ĐI THẲNG VÀO CÁC GẠCH ĐẦU DÒNG NỘI DUNG CHÍNH (bullet points: "• "). KHÔNG ĐƯỢC VIẾT CÂU MỞ ĐẦU HOẶC ĐOẠN GIỚI THIỆU THỪA THÃI (ví dụ: KHÔNG viết "Hiện tại phòng ban... đang tìm kiếm vị trí..."). Bắt đầu ngay dòng đầu tiên bằng gạch đầu dòng "• ".
      - TUYỆT ĐỐI KHÔNG SỬ DỤNG CÚ PHÁP IN ĐẬM MARKDOWN (KHÔNG DÙNG dấu "**" như **Backend Developer** hay **Nest.js**). Chỉ trả về văn bản thuần (plain text).
      - Mỗi ý chính nằm trên 1 gạch đầu dòng ("• ") riêng biệt và xuống dòng rõ ràng.
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        description: {
          type: Type.STRING,
          description: 'Mô tả chi tiết công việc dạng văn bản thuần gạch đầu dòng "• ", không dùng in đậm **, bắt đầu ngay bằng gạch đầu dòng',
        },
        requirements: {
          type: Type.STRING,
          description: 'Yêu cầu ứng viên dạng văn bản thuần gạch đầu dòng "• ", không dùng in đậm **, bắt đầu ngay bằng gạch đầu dòng',
        },
        benefits: {
          type: Type.STRING,
          description: 'Quyền lợi đãi ngộ dạng văn bản thuần gạch đầu dòng "• ", không dùng in đậm **, bắt đầu ngay bằng gạch đầu dòng',
        },
      },
      required: ['description', 'requirements', 'benefits'],
    };

    const skillsText = dto.skillNames && dto.skillNames.length > 0 ? dto.skillNames.join(', ') : 'Chưa chỉ định';
    const criteriaText = dto.criteria && dto.criteria.length > 0
      ? dto.criteria.map((c) => `- ${c.name} (${c.requirementType === 'MANDATORY' ? 'Bắt buộc' : 'Ưu tiên'} - Trọng số ${c.weight}%)`).join('\n')
      : 'Chưa có tiêu chí cụ thể';

    const promptText = `
      Thông tin cấu hình tuyển dụng ở Bước 1:
      - Tiêu đề công việc: ${dto.title}
      - Vị trí danh mục: ${dto.positionName || 'Chưa chọn'}
      - Phòng ban: ${dto.departmentName || 'Chưa chọn'}
      - Địa điểm: ${dto.location || 'Chưa chọn'}
      - Hình thức: ${dto.employmentType || 'Full-time'}
      - Yêu cầu kinh nghiệm: ${dto.experienceLevel || 'Mid-level'}
      - Mức lương đề xuất: ${dto.minimumSalary && dto.maximumSalary ? `$${dto.minimumSalary} - $${dto.maximumSalary}` : 'Thỏa thuận'}
      - Kỹ năng gợi ý: ${skillsText}
      - Các tiêu chí đánh giá AI trọng số:
      ${criteriaText}

      Hãy tự động soạn thảo 3 phần JD (description, requirements, benefits) đi thẳng vào các gạch đầu dòng "• ", KHÔNG câu giới thiệu mở đầu thừa vặt và KHÔNG dùng ký tự in đậm "**".
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      });

      let rawText = response.text || '';
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(rawText.trim());

      const cleanText = (str: string) => {
        if (!str) return '';
        return str
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/^[\s\S]*?(?=•)/, '') // Strip any intro text before the first bullet point
          .trim();
      };

      return {
        description: cleanText(parsed.description || ''),
        requirements: cleanText(parsed.requirements || ''),
        benefits: cleanText(parsed.benefits || ''),
      };
    } catch (err: any) {
      console.error('Lỗi Gemini AI generate JD content:', err?.message || err);
      throw new InternalServerErrorException('Có lỗi xảy ra khi AI soạn thảo JD. Vui lòng thử lại!');
    }
  }

  async create(createDto: CreateJobDescriptionDto): Promise<JobDescriptionDocument> {
    this.validateCriteriaWeights(createDto.criteria);

    const newJob = new this.jobDescriptionModel(createDto);
    const saved = await newJob.save();
    const populated = await this.findById(saved._id.toString());
    if (populated.status === JobStatus.JD_CREATED) {
      this.eventsGateway.emitJobPublished(populated);
    }
    return populated;
  }

  private async checkAndCompleteExpiredJobs(): Promise<void> {
    const now = new Date();
    await this.jobDescriptionModel.updateMany(
      {
        status: { $in: [JobStatus.JD_CREATED, JobStatus.APPROVED, JobStatus.PENDING] },
        applicationDeadline: { $exists: true, $ne: null, $lt: now },
      },
      { $set: { status: JobStatus.COMPLETED } },
    );
  }

  async findAll(): Promise<JobDescriptionDocument[]> {
    await this.checkAndCompleteExpiredJobs();
    return this.jobDescriptionModel
      .find()
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('criteria.skillId')
      .populate('interviewerId')
      .populate('interviewerIds')
      .populate('postedById')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPublicJobs(): Promise<JobDescriptionDocument[]> {
    await this.checkAndCompleteExpiredJobs();
    return this.jobDescriptionModel
      .find({ status: JobStatus.JD_CREATED })
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('criteria.skillId')
      .populate('interviewerId')
      .populate('interviewerIds')
      .populate('postedById')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<JobDescriptionDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id "${id}" không hợp lệ`);
    }
    const job = await this.jobDescriptionModel
      .findById(id)
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('criteria.skillId')
      .populate('interviewerId')
      .populate('interviewerIds')
      .populate('postedById')
      .exec();
    if (!job) {
      throw new NotFoundException(`Không tìm thấy Job Description với id "${id}"`);
    }
    return job;
  }

  async update(id: string, updateDto: UpdateJobDescriptionDto): Promise<JobDescriptionDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id "${id}" không hợp lệ`);
    }

    this.validateCriteriaWeights(updateDto.criteria);

    const updatedJob = await this.jobDescriptionModel
      .findByIdAndUpdate(id, { $set: updateDto }, { new: true, runValidators: true })
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('criteria.skillId')
      .populate('interviewerId')
      .populate('interviewerIds')
      .populate('postedById')
      .exec();

    if (!updatedJob) {
      throw new NotFoundException(`Không tìm thấy Job Description với id "${id}"`);
    }

    if (updatedJob.status === JobStatus.JD_CREATED) {
      this.eventsGateway.emitJobPublished(updatedJob);
    } else {
      this.eventsGateway.emitJobUpdated(updatedJob);
    }

    return updatedJob;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.jobDescriptionModel.findByIdAndDelete(id).exec();
  }
}
