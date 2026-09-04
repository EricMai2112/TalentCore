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

  async evaluateCriteriaWithAi(
    cvText: string,
    jobTitle: string,
    experienceLevel: string,
    criteria: JobCriteria[],
  ) {
    const levelExpectations: Record<string, string> = {
      Intern: `
        Ứng viên Intern KHÔNG được kỳ vọng có kinh nghiệm doanh nghiệp chính thức.
        Bằng chứng mạnh nhất có thể có ở cấp độ này là: đồ án môn học, đồ án tốt nghiệp,
        dự án cá nhân/nhóm trên GitHub, bài tập lớn, cuộc thi lập trình.
        MỘT ĐỒ ÁN CÁ NHÂN CÓ ĐỘ PHỨC TẠP CAO, CÓ KẾT QUẢ RÕ RÀNG PHẢI ĐƯỢC CHẤM Ở MỨC 80-100,
        vì đây là bằng chứng mạnh nhất thực tế có thể có ở vị trí Intern.
        TUYỆT ĐỐI KHÔNG hạ điểm chỉ vì "chưa từng đi làm" hoặc "chưa có kinh nghiệm doanh nghiệp".`,

      Fresher: `
        Ứng viên Fresher vừa tốt nghiệp, có thể chưa có kinh nghiệm làm việc chính thức.
        Đồ án tốt nghiệp có triển khai thực tế (deploy, có người dùng thử, có kiểm thử bài bản),
        dự án cá nhân quy mô lớn, hoặc kỳ thực tập ngắn hạn nên được chấm 80-100.
        Không có kinh nghiệm doanh nghiệp KHÔNG phải lý do để hạ điểm ở vị trí này.`,

      Junior: `
        Vị trí Junior nên có ít nhất một số bằng chứng đã áp dụng kỹ năng trong môi trường
        thực tế (thực tập, dự án freelance, hoặc công việc chính thức ban đầu).
        Dự án cá nhân đơn thuần vẫn có giá trị nhưng nên chấm tối đa khoảng 60,
        trừ khi dự án đó có độ phức tạp/quy mô tương đương công việc thực tế.`,

      'Mid-level': `
        Vị trí Mid-level cần có bằng chứng áp dụng kỹ năng trong môi trường làm việc thực tế,
        có đóng góp cụ thể, thể hiện khả năng làm việc độc lập trong một phần công việc/module.
        Thiếu hoàn toàn bằng chứng áp dụng thực tế (chỉ có đồ án cá nhân) nên chấm tối đa khoảng 40-60.`,

      Senior: `
        Vị trí Senior cần bằng chứng vai trò sở hữu (ownership) rõ ràng, ra quyết định kỹ thuật,
        xử lý vấn đề phức tạp, có kết quả đóng góp đo lường được (hiệu năng, quy mô, số liệu cụ thể).
        Thiếu các yếu tố này, dù có kinh nghiệm làm việc, chỉ nên chấm tối đa khoảng 60.`,

      'Lead / Manager': `
        Vị trí Lead/Manager cần bằng chứng dẫn dắt đội nhóm, ảnh hưởng đến quyết định kiến trúc
        hoặc chiến lược kỹ thuật, kết quả đo lường được ở cấp độ dự án/tổ chức, không chỉ đóng góp cá nhân.
        Thiếu bằng chứng vai trò lãnh đạo/ảnh hưởng rộng, chỉ nên chấm tối đa khoảng 60.`,
    };

    const levelGuidance = levelExpectations[experienceLevel] || levelExpectations['Junior'];

    const systemInstruction = `
      Bạn là Chuyên gia AI Tuyển dụng & Thẩm định CV cao cấp của hệ thống TalentCore ATS.
      Nhiệm vụ: Đọc toàn văn CV và đánh giá ứng viên dựa trên danh sách tiêu chí của Job Description,
      ĐƯỢC HIỆU CHỈNH THEO VỊ TRÍ ĐANG TUYỂN.

      VỊ TRÍ ĐANG CHẤM (experience_level): ${experienceLevel}
      KỲ VỌNG BẰNG CHỨNG Ở VỊ TRÍ NÀY:
      ${levelGuidance}

      NGUYÊN TẮC CHẤM ĐIỂM TƯƠNG ĐỐI (QUAN TRỌNG NHẤT):
      - Điểm số phản ánh mức độ bằng chứng SO VỚI KỲ VỌNG THỰC TẾ CỦA VỊ TRÍ ${experienceLevel},
        KHÔNG phải so với một chuẩn tuyệt đối "phải làm ở doanh nghiệp lớn".
      - Một ứng viên Intern có đồ án cá nhân xuất sắc PHẢI được chấm ngang bằng một ứng viên Senior
        có dự án doanh nghiệp tốt, NẾU cả hai đều là bằng chứng mạnh nhất có thể có ở vị trí tương ứng.

      QUY TẮC CHẤM ĐIỂM (THANG 6 MỨC CỐ ĐỊNH, DIỄN GIẢI THEO VỊ TRÍ ${experienceLevel}):
      - 0: Không tìm thấy bất kỳ bằng chứng nào trong CV.
      - 20: Bằng chứng rất yếu, gián tiếp, chưa đủ xác nhận.
      - 40: Có đề cập hoặc liệt kê tên kỹ năng nhưng chưa có bằng chứng áp dụng.
      - 60: Có bằng chứng áp dụng ở mức cơ bản, phù hợp một phần với kỳ vọng vị trí ${experienceLevel}.
      - 80: Có bằng chứng áp dụng đầy đủ, đạt mức kỳ vọng chuẩn của vị trí ${experienceLevel}.
      - 100: Bằng chứng vượt kỳ vọng: vai trò rõ ràng, kết quả đóng góp và số liệu cụ thể,
             thể hiện năng lực vượt trội so với mặt bằng chung của vị trí ${experienceLevel}.

      QUY TẮC TRÍCH XUẤT BẰNG CHỨNG (EVIDENCE):
      - Trích xuất CHÍNH XÁC nguyên văn câu chữ có thật từ văn bản CV làm bằng chứng.
      - Tuyệt đối không tự suy diễn hoặc bịa đặt bằng chứng không tồn tại trong CV.
      - Trong "reasoning", phải nêu rõ vì sao bằng chứng đạt/không đạt SO VỚI KỲ VỌNG CỦA VỊ TRÍ
        ${experienceLevel}, không so với chuẩn tuyệt đối.
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
              reasoning: {
                type: Type.STRING,
                description: `Giải thích ngắn gọn vì sao evidence tương ứng với mức điểm, đối chiếu với kỳ vọng vị trí ${experienceLevel}`,
              },
              isPassed: { type: Type.BOOLEAN, description: 'True nếu score >= 60' },
            },
            required: ['name', 'score', 'evidence', 'reasoning', 'isPassed'],
          },
        },
      },
      required: ['summary', 'keyStrengths', 'potentialGaps', 'suggestedQuestions', 'criteriaResults'],
    };

    const criteriaPrompt = criteria
      .map((c, i) => `${i + 1}. [${c.requirementType}] ${c.name} (Trọng số: ${c.weight}%)`)
      .join('\n');

    const prompt = `
      VỊ TRÍ ỨNG TUYỂN: ${jobTitle}
      CẤP ĐỘ (experience_level): ${experienceLevel}

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
        temperature: 0.0,
      },
    });

    return JSON.parse(response.text?.trim() || '{}');
  }

  /**
   * Phát hiện số liệu định lượng trong đoạn văn bản bằng chứng (Evidence) bằng biểu thức chính quy (Regex).
   * 
   * Hàm kiểm tra các mẫu định lượng phổ biến:
   * - Tỷ lệ phần trăm (VD: 20%, 50.5%)
   * - Số liệu kèm đơn vị kết quả đo lường (VD: người dùng, triệu, k, lần, giờ, ngày, khách hàng, doanh thu, req/s, ms...)
   * - Các động từ biến đổi kết quả kèm số liệu (VD: tăng 30%, tối ưu 2x, giảm 50%)
   * - Thứ hạng/xếp hạng định lượng (VD: top 1, top 5, hạng 1)
   * 
   * @param evidence Đoạn văn bản trích dẫn làm bằng chứng từ CV
   * @returns true nếu đoạn trích có chứa số liệu định lượng, false nếu không có
   */
  detectQuantifiableMetrics(evidence: string): boolean {
    if (!evidence || typeof evidence !== 'string') return false;
    const text = evidence.toLowerCase();

    // 1. Tỷ lệ phần trăm (VD: 30%, 50.5 %, 100%)
    const percentagePattern = /\d+(\.\d+)?\s*%/;

    // 2. Số kèm đơn vị quy mô / người dùng / dữ liệu / hiệu năng / thời gian / tiền tệ
    const metricUnitsPattern =
      /\b\d+(\.\d+)?\s*(k|m|b|triệu|nghìn|tỷ|users?|người\s*dùng|khách\s*hàng|thành\s*viên|lượt|lần|req(uests)?\/s|rps|tps|ms|s|giây|phút|giờ|h|ngày|tháng|năm|sao|stars?|điểm|gpa|đơn\s*hàng|orders?|doanh\s*thu|revenue|traffic|views?|tải|downloads?)\b/i;

    // 3. Số kèm các động từ chỉ sự thay đổi / tối ưu / tăng trưởng
    const impactKeywordsPattern =
      /(tăng|giảm|tối\s*ưu|cải\s*thiện|tiết\s*kiệm|đạt|vượt|phục\s*vụ|xử\s*lý|quản\s*lý|nâng\s*cao|rút\s*ngắn|giải\s*quyết)\s*([a-zA-Zà-ỹÀ-Ỹ0-9_]+\s*){0,3}\d+/i;

    // 4. Các định dạng số lượng tích cực (VD: 10+, 100+, top 1, top 5, hạng 1)
    const positiveQuantityPattern =
      /(\d+\s*\+\s*(users?|người|dự\s*án|projects?|năm|years?|thành\s*viên)|\b(top|hạng|thứ)\s*\d+)/i;

    return (
      percentagePattern.test(text) ||
      metricUnitsPattern.test(text) ||
      impactKeywordsPattern.test(text) ||
      positiveQuantityPattern.test(text)
    );
  }

  /**
   * Tính toán độ tương đồng chuỗi (Fuzzy Match / Similarity) giữa đoạn trích dẫn Evidence và toàn văn CV gốc.
   * Thuật toán kết hợp so khớp chuỗi con hoàn hảo (Substring Match) và tỷ lệ trùng lặp từ khóa (Token Overlap).
   * 
   * @param evidence Đoạn văn bản trích dẫn do AI trích xuất
   * @param cvText Toàn văn hồ sơ ứng viên
   * @returns Tỷ lệ tương đồng trong khoảng [0, 1]
   */
  calculateEvidenceSimilarity(evidence: string, cvText: string): number {
    if (!evidence || !cvText) return 0;

    const cleanEvidence = evidence.toLowerCase().replace(/[^a-z0-9à-ỹ\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanCv = cvText.toLowerCase().replace(/[^a-z0-9à-ỹ\s]/g, ' ').replace(/\s+/g, ' ').trim();

    if (!cleanEvidence || !cleanCv) return 0;

    // Trường hợp 1: Trích dẫn khớp chuỗi con trong CV
    if (cleanCv.includes(cleanEvidence)) {
      return 1.0;
    }

    // Trường hợp 2: Khớp một phần bằng tỷ lệ trùng lặp từ khóa
    const evidenceWords = cleanEvidence.split(' ').filter((w) => w.length > 1);
    if (evidenceWords.length === 0) return 0;

    let matchedWords = 0;
    for (const word of evidenceWords) {
      if (cleanCv.includes(word)) {
        matchedWords++;
      }
    }

    const similarity = matchedWords / evidenceWords.length;
    return Number(Math.min(1, Math.max(0, similarity)).toFixed(2));
  }

  calculateEvidenceStrengthScore(evidence: string, cvText: string): number {
    if (!evidence || !evidence.trim()) {
      return 0;
    }

    const trimmedEvidence = evidence.trim();

    // 1. Thành phần 1: Độ tương đồng với CV gốc (Trọng số 50%)
    const similarity = this.calculateEvidenceSimilarity(trimmedEvidence, cvText);
    const similarityScore = similarity * 50;

    // 2. Thành phần 2: Số liệu định lượng (Trọng số 30%)
    const hasQuantifiableMetrics = this.detectQuantifiableMetrics(trimmedEvidence);
    const metricsScore = hasQuantifiableMetrics ? 30 : 0;

    // 3. Thành phần 3: Độ dài và chiều sâu chi tiết (Trọng số 20%)
    const lengthRatio = Math.min(trimmedEvidence.length / 200, 1);
    const lengthScore = lengthRatio * 20;

    // Tổng hợp điểm số theo công thức
    const rawTotal = similarityScore + metricsScore + lengthScore;
    return Math.min(100, Math.max(0, Math.round(rawTotal)));
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

      const evidenceStrengthScore = this.calculateEvidenceStrengthScore(evidence, cvText);

      return {
        name: criterion.name,
        requirementType: criterion.requirementType,
        weight: criterion.weight,
        score,
        scoreContribution,
        evidence,
        isEvidenceVerified,
        evidenceStrengthScore,
        isPassed: Boolean(matched.isPassed),
      };
    });

    let totalEvidenceStrengthWeight = 0;
    let weightedEvidenceStrength = 0;

    evaluatedCriteria.forEach((c) => {
      const w = c.weight || 0;
      weightedEvidenceStrength += (c.evidenceStrengthScore || 0) * w;
      totalEvidenceStrengthWeight += w;
    });

    const overallEvidenceStrengthScore = totalEvidenceStrengthWeight > 0
      ? Math.min(100, Math.max(0, Math.round(weightedEvidenceStrength / totalEvidenceStrengthWeight)))
      : 0;

    return {
      aiFitScore: Math.min(100, Math.round(totalScore)),
      evidenceStrengthScore: overallEvidenceStrengthScore,
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