import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as mammoth from 'mammoth';

@Injectable()
export class CvParserService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Thiếu GEMINI_API_KEY trong file .env');
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async parseCvFileWithAi(file: Express.Multer.File) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File tải lên rỗng hoặc không hợp lệ.');
    }

    const mimeType = file.mimetype.toLowerCase();
    const originalName = file.originalname.toLowerCase();

    const systemInstruction = `
      Bạn là chuyên gia phân tích CV (AI Resume Parser) cao cấp cho hệ thống tuyển dụng TalentCore.
      Nhiệm vụ của bạn là đọc toàn bộ nội dung tài liệu CV của ứng viên (văn bản, PDF, hình ảnh scan) và bóc tách chính xác thành cấu trúc JSON theo đúng schema được yêu cầu.
      
      Quy tắc bắt buộc:
      1. Chỉ trích xuất thông tin có thật trong CV. Tuyệt đối không tự suy luận, không thêm giải thích ngoài lề, không độc thoại nội tâm.
      2. Chuẩn hóa ngày tháng theo định dạng MM/YYYY hoặc YYYY (Ví dụ: "06/2024", "2025"). Nếu đang diễn ra thì ghi endDate là "Hiện tại".
      3. Đánh giá số năm kinh nghiệm (yearsOfExperience) dạng số thực (number) dựa trên lịch sử làm việc. Nếu là Intern/Fresher thì để 0.
      4. Phân loại proficiency kỹ năng thành một trong các giá trị: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT.
      5. Không bịa đặt dữ liệu. Nếu không tìm thấy trường thông tin, để chuỗi rỗng "" hoặc mảng rỗng [].
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING, description: 'Họ và tên đầy đủ của ứng viên' },
        headline: { type: Type.STRING, description: 'Chức danh nghề nghiệp của ứng viên' },
        summary: { type: Type.STRING, description: 'Tóm tắt bản thân' },
        careerObjective: { type: Type.STRING, description: 'Mục tiêu nghề nghiệp ngắn và dài hạn' },
        address: { type: Type.STRING, description: 'Địa chỉ hoặc khu vực sinh sống' },
        phone: { type: Type.STRING, description: 'Số điện thoại' },
        yearsOfExperience: { type: Type.NUMBER, description: 'Tổng số năm kinh nghiệm' },
        currentLevel: { type: Type.STRING, description: 'Cấp bậc (Intern, Fresher, Junior, Middle, Senior...)' },
        socialLinks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING, description: 'GitHub, LinkedIn, Portfolio, Facebook...' },
              url: { type: Type.STRING, description: 'Đường dẫn liên kết' },
            },
            required: ['platform', 'url'],
          },
        },
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Tên kỹ năng/công nghệ' },
              proficiency: { type: Type.STRING, description: 'BEGINNER, INTERMEDIATE, ADVANCED, EXPERT' },
              yearsOfExperience: { type: Type.NUMBER, description: 'Số năm sử dụng' },
            },
            required: ['name'],
          },
        },
        experiences: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              position: { type: Type.STRING },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              description: { type: Type.STRING },
              technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['company', 'position'],
          },
        },
        educations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              degree: { type: Type.STRING },
              major: { type: Type.STRING },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              gpa: { type: Type.NUMBER },
            },
            required: ['institution'],
          },
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              description: { type: Type.STRING },
              projectUrl: { type: Type.STRING },
              technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['name'],
          },
        },
        certifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              organization: { type: Type.STRING },
              scoreOrLevel: { type: Type.STRING },
              issueDate: { type: Type.STRING },
            },
            required: ['name'],
          },
        },
        languages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              proficiency: { type: Type.STRING },
            },
            required: ['language'],
          },
        },
      },
    };

    try {
      let parts: any[] = [];

      if (originalName.endsWith('.docx') || mimeType.includes('wordprocessingml')) {
        const { value: extractedText } = await mammoth.extractRawText({
          buffer: file.buffer,
        });

        if (!extractedText || extractedText.trim().length < 30) {
          throw new BadRequestException('Không thể đọc nội dung văn bản từ file Word.');
        }

        parts = [
          {
            text: `Dưới đây là toàn bộ nội dung trích xuất từ CV định dạng Word. Hãy bóc tách thành JSON theo schema:\n\n${extractedText}`,
          },
        ];
      }
      else if (
        mimeType === 'application/pdf' ||
        mimeType.startsWith('image/') ||
        originalName.match(/\.(pdf|png|jpg|jpeg|webp)$/)
      ) {
        const targetMime =
          mimeType === 'application/pdf' || originalName.endsWith('.pdf')
            ? 'application/pdf'
            : mimeType.startsWith('image/')
            ? mimeType
            : 'image/jpeg';

        parts = [
          {
            inlineData: {
              mimeType: targetMime,
              data: file.buffer.toString('base64'),
            },
          },
          {
            text: 'Hãy đọc toàn bộ tài liệu CV đính kèm và trích xuất dữ liệu hồ sơ ứng viên theo đúng cấu trúc schema được yêu cầu.',
          },
        ];
      } else {
        throw new BadRequestException(
          'Định dạng file không được hỗ trợ. Vui lòng tải lên PDF, DOCX hoặc Ảnh (PNG, JPG).'
        );
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.0,
          maxOutputTokens: 8192,
        },
      });

      let rawText = response.text || '';
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(rawText.trim());
    } catch (error: any) {
      console.error('Lỗi khi bóc tách CV qua Gemini:', error);
      throw new InternalServerErrorException(
        error.message || 'Lỗi xử lý bóc tách CV bằng AI.'
      );
    }
  }
}