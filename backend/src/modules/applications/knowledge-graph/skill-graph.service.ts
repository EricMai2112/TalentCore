import { Injectable, Logger } from '@nestjs/common';
import {
  EscoSkillNode,
  Sector,
} from './esco-taxonomy.data';
import {
  SkillGraphEngine,
  SCORING_CONFIG,
  ResolveContext,
  MatchExplanation,
  normalizeSkillText,
} from './skillGraph';

export type {
  ResolveContext,
  MatchExplanation,
};

export {
  SCORING_CONFIG,
  normalizeSkillText,
};

export interface TransferableSkillMatch {
  candidateSkill: string;
  requiredSkill: string;
  similarity: number;
  path: string[];
  sector: Sector;
  category: string;
  explanation: string;
  escoUri?: string;
}

export interface FindTransferableSkillResult {
  match: TransferableSkillMatch | null;
  unresolvedSkills: string[];
}

@Injectable()
export class SkillKnowledgeGraphService {
  private readonly logger = new Logger(SkillKnowledgeGraphService.name);
  private readonly engine: SkillGraphEngine;

  constructor() {
    this.engine = new SkillGraphEngine(
      undefined,
      undefined,
      (msg) => this.logger.warn(msg),
    );
    this.logger.log(`[SkillKnowledgeGraphService] Đã nạp Đồ thị kỹ năng hoàn tất.`);
  }

  resolveSkillId(rawName: string, context?: ResolveContext): string | null {
    return this.engine.resolveSkill(rawName, context);
  }

  extractSkills(text: string, context?: ResolveContext): string[] {
    return this.engine.extractSkills(text, context);
  }

  getSkillNode(id: string): EscoSkillNode | undefined {
    return this.engine.getNode(id);
  }

  calculateGraphSimilarity(
    candidateSkill: string,
    requiredSkill: string,
    options?: Partial<typeof SCORING_CONFIG>,
  ): { similarity: number; path: string[] } {
    const explanation = this.engine.explainMatch(candidateSkill, requiredSkill, options);
    return {
      similarity: explanation.score,
      path: explanation.nodeNames,
    };
  }

  /**
   * Xuất danh sách kỹ năng không nhận diện được (unresolved) ra log có cấu trúc.
   * Đảm bảo tính riêng tư: chỉ chứa tên kỹ năng và số lượng, không có thông tin ứng viên.
   */
  logUnresolvedSkills(unresolvedSkills: string[], context?: string): void {
    if (!unresolvedSkills || unresolvedSkills.length === 0) return;
    const uniqueSkills = Array.from(new Set(unresolvedSkills.map((s) => s.trim()))).filter(Boolean);
    if (uniqueSkills.length === 0) return;

    this.logger.warn(
      JSON.stringify({
        event: 'unresolved_skills',
        timestamp: new Date().toISOString(),
        context: context || 'skill_matching',
        count: uniqueSkills.length,
        skills: uniqueSkills,
      }),
    );
  }

  /**
   * Tìm kỹ năng chuyển giao tốt nhất từ tập candidateSkills cho một requiredSkill.
   * Sử dụng offline graph resolution. Mọi kỹ năng không nhận diện được sẽ được ghi lại trong unresolvedSkills.
   */
  findBestTransferableSkill(
    requiredSkill: string,
    candidateSkills: string[],
    minSimilarityThreshold: number = SCORING_CONFIG.MIN_TRANSFER_SCORE,
    context?: ResolveContext,
    options?: { allowContinuousScore?: boolean },
  ): FindTransferableSkillResult {
    const unresolvedSkills: string[] = [];

    if (!requiredSkill || !candidateSkills || candidateSkills.length === 0) {
      if (requiredSkill && !this.resolveSkillId(requiredSkill, context)) {
        unresolvedSkills.push(requiredSkill);
      }
      return { match: null, unresolvedSkills };
    }

    const reqId = this.resolveSkillId(requiredSkill, context);
    if (!reqId) {
      unresolvedSkills.push(requiredSkill);
      return { match: null, unresolvedSkills };
    }

    const reqNode = this.getSkillNode(reqId);
    if (!reqNode) {
      unresolvedSkills.push(requiredSkill);
      return { match: null, unresolvedSkills };
    }

    let highestMatch: TransferableSkillMatch | null = null;
    const effectiveThreshold = options?.allowContinuousScore ? 0 : minSimilarityThreshold;

    for (const candSkill of candidateSkills) {
      const candId = this.resolveSkillId(candSkill, context);
      if (!candId) {
        unresolvedSkills.push(candSkill);
        continue;
      }

      if (candId === reqId) {
        return {
          match: {
            candidateSkill: candSkill,
            requiredSkill: reqNode.name,
            similarity: 1.0,
            path: [reqNode.name],
            sector: reqNode.sector,
            category: reqNode.category,
            explanation: `Trùng khớp chính xác kỹ năng ${reqNode.name}`,
            escoUri: reqNode.escoUri,
          },
          unresolvedSkills,
        };
      }

      const explanation = this.engine.explainMatch(candId, reqId);
      if (explanation.score >= effectiveThreshold && explanation.score > 0) {
        if (!highestMatch || explanation.score > highestMatch.similarity) {
          const candNode = this.getSkillNode(candId);
          const candName = candNode?.name || candSkill;
          const pct = Math.round(explanation.score * 100);
          highestMatch = {
            candidateSkill: candName,
            requiredSkill: reqNode.name,
            similarity: explanation.score,
            path: explanation.nodeNames,
            sector: reqNode.sector,
            category: reqNode.category,
            explanation: `Kỹ năng tương đương theo đồ thị kỹ năng của hệ thống: ${candName} tương quan ${pct}% với ${reqNode.name} (Đường đi tri thức: ${explanation.nodeNames.join(' ➔ ')})`,
            escoUri: reqNode.escoUri,
          };
        }
      }
    }

    return { match: highestMatch, unresolvedSkills };
  }
}
