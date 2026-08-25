import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { JobCriteria } from 'src/modules/job-description/schemas/job-description.schema';
import { Candidate } from 'src/modules/candidates/schema/candidate.schema';

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  // 1. Tổng hợp toàn văn hồ sơ ứng viên thành Plain Text
  buildFullCvText(candidate: Candidate): string {
    const sections: string[] = [];
    if (candidate.headline) sections.push(`Chức danh: ${candidate.headline}`);
    if (candidate.summary) sections.push(`Tóm tắt: ${candidate.summary}`);
    if (candidate.careerObjective) sections.push(`Mục tiêu: ${candidate.careerObjective}`);
    
    if (candidate.skills?.length) {
      sections.push(`Kỹ năng: ${candidate.skills.map((s) => `${s.name} (${s.proficiency || 'Trung bình'} - ${s.yearsOfExperience || 0} năm)`).join(', ')}`);
    }

    if (candidate.experiences?.length) {
      sections.push('Kinh nghiệm làm việc:\n' + candidate.experiences.map((e) => 
        `- Vị trí: ${e.position} tại ${e.company} (${e.startDate || ''} - ${e.endDate || 'Hiện tại'}). Mô tả: ${e.description || ''}. Công nghệ: ${e.technologies?.join(', ') || ''}`
      ).join('\n'));
    }

    if (candidate.projects?.length) {
      sections.push('Dự án thực tế:\n' + candidate.projects.map((p) => 
        `- Dự án: ${p.name} (Vai trò: ${p.role || ''}). Mô tả: ${p.description || ''}. Công nghệ: ${p.technologies?.join(', ') || ''}`
      ).join('\n'));
    }

    if (candidate.educations?.length) {
      sections.push('Học vấn:\n' + candidate.educations.map((ed) => 
        `- ${ed.institution} - ${ed.major} (${ed.degree || ''}, GPA: ${ed.gpa || 'N/A'})`
      ).join('\n'));
    }

    if (candidate.certifications?.length) {
      sections.push('Chứng chỉ:\n' + candidate.certifications.map((c) => `- ${c.name} cấp bởi ${c.organization || ''}`).join('\n'));
    }

    return sections.join('\n\n');
  }

  // 2. Gọi Gemini LLM với Temperature = 0 và Thang điểm 6 mức
  async evaluateCriteriaWithAi(cvText: string, jobTitle: string, criteria: JobCriteria[]) {
    const systemInstruction = `
      Bạn là Chuyên gia AI Tuyển dụng & Thẩm định CV cao cấp của hệ thống TalentCore ATS.
      Nhiệm vụ: Đọc toàn văn CV và đánh giá ứng viên dựa trên danh sách tiêu chí của Job Description.

      QUY TẮC CHẤM ĐIỂM (THANG 6 MỨC CỐ ĐỊNH):
      - 0: Không tìm thấy bất kỳ bằng chứng nào trong CV.
      - 20: Bằng chứng rất yếu, gián tiếp, chưa đủ xác nhận.
      - 40: Có đề cập hoặc liệt kê tên kỹ năng nhưng chưa có bằng chứng áp dụng.
      - 60: Có bằng chứng sử dụng trong học tập, đồ án, dự án cá nhân.
      - 80: Có bằng chứng sử dụng trong công việc/dự án thực tế ở doanh nghiệp.
      - 100: Bằng chứng mạnh: vai trò rõ ràng, kết quả đóng góp và số liệu cụ thể.

      QUY TẮC TRÍCH XUẤT BẰNG CHỨNG (EVIDENCE):
      - Trích xuất CHÍNH XÁC nguyên văn câu chữ có thật từ văn bản CV làm bằng chứng.
      - Tuyệt đối không tự suy diễn hoặc bịa đặt bằng chứng không tồn tại trong CV.
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: 'Tóm tắt nhận định tổng quan về ứng viên' },
        keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Các điểm mạnh nổi bật' },
        potentialGaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Các điểm còn thiếu hoặc yếu' },
        suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Câu hỏi phỏng vấn đề xuất' },
        criteriaResults: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              score: { type: Type.NUMBER, description: 'Chỉ nhận một trong 6 giá trị: 0, 20, 40, 60, 80, 100' },
              evidence: { type: Type.STRING, description: 'Trích dẫn nguyên văn đoạn văn bản làm bằng chứng' },
              isPassed: { type: Type.BOOLEAN, description: 'True nếu score >= 60' },
            },
            required: ['name', 'score', 'evidence', 'isPassed'],
          },
        },
      },
      required: ['summary', 'keyStrengths', 'potentialGaps', 'suggestedQuestions', 'criteriaResults'],
    };

    const criteriaPrompt = criteria.map((c, i) => `${i + 1}. [${c.requirementType}] ${c.name} (Trọng số: ${c.weight}%)`).join('\n');

    const prompt = `
      VỊ TRÍ ỨNG TUYỂN: ${jobTitle}

      DANH SÁCH TIÊU CHÍ ĐÁNH GIÁ:
      ${criteriaPrompt}

      TOÀN VĂN CV ỨNG VIÊN:
      """
      ${cvText}
      """
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.0, // Đảm bảo tính nhất quán tối đa
      },
    });

    return JSON.parse(response.text?.trim() || '{}');
  }

  // 3. Giai đoạn 5 — Validate Bằng Chứng & Tính Điểm Tất Định
  processDeterministicScoring(cvText: string, jobCriteria: JobCriteria[], aiResult: any) {
    const lowerCvText = cvText.toLowerCase();
    const warnings: string[] = [];
    let isMissingMandatory = false;
    let totalScore = 0;

    const evaluatedCriteria = jobCriteria.map((criterion) => {
      const matched = aiResult.criteriaResults?.find((r: any) => 
        r.name?.toLowerCase().trim() === criterion.name.toLowerCase().trim()
      ) || { score: 0, evidence: '', isPassed: false };

      // Validate bằng chứng: kiểm tra xem evidence có trong CV không
      const evidence = (matched.evidence || '').trim();
      const isEvidenceVerified = evidence.length > 0 && lowerCvText.includes(evidence.toLowerCase().slice(0, 30));

      if (evidence.length > 0 && !isEvidenceVerified) {
        warnings.push(`Cảnh báo ảo giác AI: Bằng chứng cho tiêu chí "${criterion.name}" cần được xem xét thủ công.`);
      }

      // Xử lý tiêu chí Bắt buộc (MANDATORY)
      const isMandatory = criterion.requirementType === 'MANDATORY';
      if (isMandatory && (!matched.isPassed || matched.score < 60)) {
        isMissingMandatory = true;
        warnings.push(`Không đáp ứng yêu cầu Bắt buộc: "${criterion.name}" (Điểm: ${matched.score}/100)`);
      }

      // Công thức tính điểm tất định: Điểm đóng góp = (score / 100) * weight
      const score = [0, 20, 40, 60, 80, 100].includes(matched.score) ? matched.score : 0;
      const scoreContribution = Number(((score / 100) * criterion.weight).toFixed(2));
      totalScore += scoreContribution;

      return {
        name: criterion.name,
        requirementType: criterion.requirementType,
        weight: criterion.weight,
        score,
        scoreContribution,
        evidence,
        isEvidenceVerified,
        isPassed: Boolean(matched.isPassed),
      };
    });

    // Chuẩn hóa điểm tổng theo tổng trọng số (nếu tổng trọng số khác 100%)
    const totalWeight = jobCriteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    const finalScore = totalWeight > 0 && Math.abs(totalWeight - 100) > 0.01 
      ? (totalScore / totalWeight) * 100 
      : totalScore;

    return {
      aiFitScore: Math.min(100, Math.max(0, Math.round(finalScore))),
      isMissingMandatory,
      warnings,
      summary: aiResult.summary || '',
      keyStrengths: aiResult.keyStrengths || [],
      potentialGaps: aiResult.potentialGaps || [],
      suggestedQuestions: aiResult.suggestedQuestions || [],
      evaluatedCriteria,
    };
  }
}