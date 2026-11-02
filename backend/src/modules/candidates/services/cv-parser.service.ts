import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

function cleanEnv(val?: string): string {
  return (val || '').replace(/^['"]|['"]$/g, '').trim();
}

function getEnv(key: string): string {
  let val = cleanEnv(process.env[key]);
  if (!val) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(new RegExp(`^${key}=([^\\r\\n]+)`, 'm'));
        if (match) {
          val = cleanEnv(match[1]);
          process.env[key] = val;
        }
      }
    } catch {}
  }
  return val;
}

@Injectable()
export class CvParserService {
  private readonly logger = new Logger(CvParserService.name);
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = getEnv('GEMINI_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async parseCvFileWithAi(file: Express.Multer.File) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File tải lên rỗng hoặc không hợp lệ.');
    }

    const mimeType = file.mimetype.toLowerCase();
    const originalName = file.originalname.toLowerCase();

    let extractedText = '';
    if (originalName.endsWith('.docx') || mimeType.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = (result.value || '').trim();
      if (!extractedText || extractedText.length < 30) {
        throw new BadRequestException('Không thể đọc nội dung văn bản từ file Word.');
      }
    } else if (originalName.endsWith('.pdf') || mimeType.includes('pdf')) {
      try {
        const pdfModule = require('pdf-parse');
        if (pdfModule?.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: file.buffer });
          const res = await parser.getText();
          extractedText = (res?.text || '').trim();
        } else if (typeof pdfModule === 'function') {
          const res = await pdfModule(file.buffer);
          extractedText = (res?.text || '').trim();
        }
      } catch (pdfErr: any) {
        this.logger.warn(`Lỗi trích xuất văn bản từ PDF trong CvParserService: ${pdfErr?.message || pdfErr}`);
      }
    } else if (
      !mimeType.startsWith('image/') &&
      !originalName.match(/\.(png|jpg|jpeg|webp)$/)
    ) {
      throw new BadRequestException(
        'Định dạng file không được hỗ trợ. Vui lòng tải lên PDF, DOCX hoặc Ảnh (PNG, JPG).'
      );
    }

    const openRouterKey = getEnv('OPENROUTER_API_KEY');
    if (openRouterKey) {
      try {
        const parsed = await this.parseViaOpenRouter(file, originalName, mimeType, extractedText, openRouterKey);
        if (parsed) {
          this.logger.log('Bóc tách CV thành công qua OpenRouter (Anthropic Claude Haiku 5.5)');
          return parsed;
        }
      } catch (err: any) {
        this.logger.error(`Lỗi khi bóc tách qua OpenRouter: ${err?.message || err}`);
      }
    }

    if (this.ai) {
      try {
        const parsed = await this.parseViaGemini(file, originalName, mimeType, extractedText);
        if (parsed) {
          this.logger.log('Bóc tách CV thành công qua Google Gemini');
          return parsed;
        }
      } catch (err: any) {
        this.logger.error(`Lỗi khi bóc tách qua Gemini: ${err?.message || err}`);
        if (err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand')) {
          throw new ServiceUnavailableException('Hệ thống AI đang bận hoặc quá tải. Vui lòng thử lại sau giây lát!');
        }
      }
    }

    throw new InternalServerErrorException('Có lỗi xảy ra khi bóc tách CV, vui lòng thử lại');
  }

  private async parseViaOpenRouter(
    file: Express.Multer.File,
    originalName: string,
    mimeType: string,
    extractedText: string,
    apiKey: string,
  ) {
    const model = getEnv('OPENROUTER_CV_MODEL') || 'anthropic/claude-haiku-5.5';
    this.logger.log(`Bắt đầu bóc tách CV qua OpenRouter model ${model}...`);

    const contentBlocks: any[] = [];

    if (extractedText) {
      contentBlocks.push({
        type: 'text',
        text: `NỘI DUNG TÀI LIỆU CV ỨNG VIÊN:\n\n${extractedText}`,
      });
    } else if (originalName.endsWith('.pdf') || mimeType.includes('pdf')) {
      contentBlocks.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: file.buffer.toString('base64'),
        },
      });
    } else {
      const targetMime = mimeType.startsWith('image/')
        ? mimeType
        : originalName.endsWith('.png')
        ? 'image/png'
        : originalName.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
      contentBlocks.push({
        type: 'image_url',
        image_url: {
          url: `data:${targetMime};base64,${file.buffer.toString('base64')}`,
        },
      });
    }

    const prompt = `
Bạn là chuyên gia phân tích CV (AI Resume Parser) cao cấp cho hệ thống tuyển dụng TalentCore.
Nhiệm vụ của bạn là đọc toàn bộ nội dung tài liệu CV của ứng viên (văn bản, PDF, hình ảnh scan) và bóc tách chính xác thành cấu trúc JSON theo đúng định dạng sau.

Quy tắc bắt buộc:
1. Chỉ trích xuất thông tin có thật trong CV. Tuyệt đối không tự suy luận, không thêm giải thích ngoài lề, không độc thoại nội tâm.
2. Chuẩn hóa ngày tháng theo định dạng MM/YYYY hoặc YYYY (Ví dụ: "06/2024", "2025"). Nếu đang diễn ra thì ghi endDate là "Hiện tại".
3. Đánh giá số năm kinh nghiệm (yearsOfExperience) dạng số thực (number) dựa trên lịch sử làm việc. Nếu là Intern/Fresher thì để 0.
4. Phân loại proficiency kỹ năng thành một trong các giá trị: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT.
5. Không bịa đặt dữ liệu. Nếu không tìm thấy trường thông tin, để chuỗi rỗng "" hoặc mảng rỗng [].
6. Chỉ trả về JSON thuần túy (không markdown, không bọc \`\`\`json):
{
  "fullName": "Họ và tên đầy đủ",
  "headline": "Chức danh nghề nghiệp",
  "summary": "Tóm tắt bản thân",
  "careerObjective": "Mục tiêu nghề nghiệp",
  "address": "Địa chỉ hoặc khu vực",
  "phone": "Số điện thoại",
  "yearsOfExperience": 0,
  "currentLevel": "Intern, Fresher, Junior, Middle, Senior...",
  "socialLinks": [
    {
      "platform": "GitHub, LinkedIn, Portfolio...",
      "url": "Đường dẫn"
    }
  ],
  "skills": [
    {
      "name": "Tên kỹ năng/công nghệ",
      "proficiency": "BEGINNER, INTERMEDIATE, ADVANCED, EXPERT",
      "yearsOfExperience": 0
    }
  ],
  "experiences": [
    {
      "company": "Tên công ty",
      "position": "Vị trí",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY hoặc Hiện tại",
      "description": "Mô tả công việc",
      "technologies": ["Tên công nghệ"]
    }
  ],
  "educations": [
    {
      "institution": "Tên trường",
      "degree": "Bằng cấp",
      "major": "Chuyên ngành",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "gpa": 0
    }
  ],
  "projects": [
    {
      "name": "Tên dự án",
      "role": "Vai trò",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "description": "Mô tả dự án",
      "projectUrl": "",
      "technologies": ["Tên công nghệ"]
    }
  ],
  "certifications": [
    {
      "name": "Tên chứng chỉ",
      "organization": "Nơi cấp",
      "scoreOrLevel": "",
      "issueDate": ""
    }
  ],
  "languages": [
    {
      "language": "Tên ngôn ngữ",
      "proficiency": "Trình độ"
    }
  ]
}
`;

    contentBlocks.push({ type: 'text', text: prompt });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: contentBlocks }],
        temperature: 0.0,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    let rawText = data.choices?.[0]?.message?.content || '';
    rawText = rawText.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      this.logger.warn(`OpenRouter không trả về đối tượng JSON: ${rawText.slice(0, 150)}`);
      return null;
    }

    rawText = rawText.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(rawText.trim());
    } catch (parseErr: any) {
      this.logger.warn(`JSON.parse từ OpenRouter thất bại: ${parseErr?.message || parseErr}`);
      return null;
    }
  }

  private async parseViaGemini(
    file: Express.Multer.File,
    originalName: string,
    mimeType: string,
    extractedText: string,
  ) {
    if (!this.ai) return null;

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
        fullName: { type: Type.STRING },
        headline: { type: Type.STRING },
        summary: { type: Type.STRING },
        careerObjective: { type: Type.STRING },
        address: { type: Type.STRING },
        phone: { type: Type.STRING },
        yearsOfExperience: { type: Type.NUMBER },
        currentLevel: { type: Type.STRING },
        socialLinks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ['platform', 'url'],
          },
        },
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              proficiency: { type: Type.STRING },
              yearsOfExperience: { type: Type.NUMBER },
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

    let parts: any[] = [];
    if (extractedText) {
      parts = [
        {
          text: `Dưới đây là toàn bộ nội dung trích xuất từ tài liệu CV của ứng viên. Hãy bóc tách thành JSON theo schema:\n\n${extractedText}`,
        },
      ];
    } else {
      const targetMime =
        mimeType.includes('pdf') || originalName.endsWith('.pdf')
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
    }

    const geminiCandidates = [
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
    ];

    for (const model of geminiCandidates) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts,
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.0,
            maxOutputTokens: 8192,
          },
        });

        let rawText = response.text || '';
        rawText = rawText.trim();
        if (rawText.startsWith('```json')) {
          rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          rawText = rawText.slice(firstBrace, lastBrace + 1);
        }

        return JSON.parse(rawText.trim());
      } catch (err: any) {
        this.logger.warn(`Gemini model ${model} parse CV failed: ${err?.message || err}`);
        continue;
      }
    }

    return null;
  }
}