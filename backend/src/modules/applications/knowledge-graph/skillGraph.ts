import {
  ESCO_SKILL_NODES,
  ESCO_SKILL_EDGES,
  EscoSkillNode,
  EscoSkillEdge,
  EscoRelationType,
  Sector,
  normalizeSkillText,
  textContainsWord,
  escapeRegex,
  isCrossSector,
  validateEscoTaxonomy,
  assertEscoTaxonomy,
} from './esco-taxonomy.data';

export type {
  EscoSkillNode,
  EscoSkillEdge,
  EscoRelationType,
  Sector,
};

export {
  ESCO_SKILL_NODES,
  ESCO_SKILL_EDGES,
  normalizeSkillText,
  textContainsWord,
  escapeRegex,
  isCrossSector,
  validateEscoTaxonomy,
  assertEscoTaxonomy,
};

export const SCORING_CONFIG = {
  MAX_DEPTH: 2,
  STEP_DECAY: 0.9,
  CROSS_SECTOR_DECAY: 0.6,
  CROSS_SECTOR_CAP: 0.25,
  /**
   * Ngưỡng tối thiểu để chấp nhận một kỹ năng là "chuyển giao được".
   * Mặc định 0.40. Cần hiệu chỉnh bằng dữ liệu đánh giá thực tế (gold set evaluation).
   */
  MIN_TRANSFER_SCORE: 0.4,
} as const;

export interface ResolveContext {
  sector?: string;
  textContext?: string;
  resolvedSkills?: string[];
  returnNullOnTie?: boolean;
}

export interface MatchStep {
  from: string;
  to: string;
  relation: EscoRelationType;
  weight: number;
  isCrossSector: boolean;
}

export interface MatchExplanation {
  candidateId: string;
  requiredId: string;
  score: number;
  path: string[];
  nodeNames: string[];
  steps: MatchStep[];
  stepDecay: number;
  crossSectorDecay: number;
  reason: string;
}

export type WarnCallback = (message: string) => void;

export class SkillGraphEngine {
  private nodesMap = new Map<string, EscoSkillNode>();
  private aliasMap = new Map<string, string>();
  private normalizedAliasMap = new Map<string, string>();
  private sortedNormalizedAliases: { alias: string; id: string }[] = [];
  private ambiguousMap = new Map<
    string,
    { nodeId: string; sector: Sector; contextHints: string[]; minHints: number }[]
  >();
  private adjList = new Map<string, EscoSkillEdge[]>();

  constructor(
    nodes: EscoSkillNode[] = ESCO_SKILL_NODES,
    edges: EscoSkillEdge[] = ESCO_SKILL_EDGES,
    warnCallback?: WarnCallback,
  ) {
    const errors = validateEscoTaxonomy(nodes, edges);
    if (errors.length > 0) {
      const msg = `[SkillGraphEngine] Cảnh báo kiểm định đồ thị: ${errors.join('; ')}`;
      if (warnCallback) {
        warnCallback(msg);
      } else {
        // Fallback
        // eslint-disable-next-line no-console
        console.warn(msg);
      }
    }

    for (const node of nodes) {
      this.nodesMap.set(node.id, node);

      const normId = normalizeSkillText(node.id);
      this.aliasMap.set(node.id.toLowerCase().trim(), node.id);
      this.normalizedAliasMap.set(normId, node.id);

      const normName = normalizeSkillText(node.name);
      this.aliasMap.set(node.name.toLowerCase().trim(), node.id);
      this.normalizedAliasMap.set(normName, node.id);

      for (const alias of node.aliases) {
        const clean = alias.toLowerCase().trim();
        const norm = normalizeSkillText(clean);
        this.aliasMap.set(clean, node.id);
        this.normalizedAliasMap.set(norm, node.id);
      }

      if (node.ambiguousAliases) {
        for (const item of node.ambiguousAliases) {
          const normAmbiguous = normalizeSkillText(item.alias);
          if (!this.ambiguousMap.has(normAmbiguous)) {
            this.ambiguousMap.set(normAmbiguous, []);
          }
          this.ambiguousMap.get(normAmbiguous)!.push({
            nodeId: node.id,
            sector: node.sector,
            contextHints: item.contextHints.map((h) => normalizeSkillText(h)),
            minHints: item.minHints ?? 1,
          });
        }
      }

      this.adjList.set(node.id, []);
    }

    // Sort aliases by length descending so longest matches ("react native") take precedence over ("react")
    this.sortedNormalizedAliases = Array.from(this.normalizedAliasMap.entries())
      .map(([alias, id]) => ({ alias, id }))
      .sort((a, b) => b.alias.length - a.alias.length);

    for (const edge of edges) {
      if (!this.adjList.has(edge.from)) this.adjList.set(edge.from, []);
      this.adjList.get(edge.from)!.push(edge);
    }
  }

  resolveSkill(text: string, context?: ResolveContext): string | null {
    if (!text) return null;
    const trimmed = text.trim();
    if (this.nodesMap.has(trimmed)) return trimmed;

    const lower = trimmed.toLowerCase();
    if (this.aliasMap.has(lower)) {
      return this.aliasMap.get(lower)!;
    }

    const norm = normalizeSkillText(lower);
    if (!norm) return null;

    if (this.normalizedAliasMap.has(norm)) {
      return this.normalizedAliasMap.get(norm)!;
    }

    if (this.ambiguousMap.has(norm)) {
      const candidates = this.ambiguousMap.get(norm)!;
      let contextPool = '';
      if (context?.textContext) contextPool += ' ' + normalizeSkillText(context.textContext);

      // Cho phép resolvedSkills (cả id, name, aliases) làm nguồn ngữ cảnh
      let hasResolvedDomainSkill = false;
      if (context?.resolvedSkills && context.resolvedSkills.length > 0) {
        for (const skillId of context.resolvedSkills) {
          const node = this.nodesMap.get(skillId);
          if (node) {
            contextPool += ' ' + normalizeSkillText(node.id) + ' ' + normalizeSkillText(node.name) + ' ' + node.aliases.map((a) => normalizeSkillText(a)).join(' ');
          } else {
            contextPool += ' ' + normalizeSkillText(skillId);
          }
        }
      }

      const qualified = candidates.filter((candidate) => {
        const matchCount = candidate.contextHints.filter((h) => textContainsWord(contextPool, h)).length;
        // minHints 1 nếu tín hiệu là skill kế toán/chuyên môn khác đã resolve cùng ngành; minHints đầy đủ nếu chỉ dựa vào từ chung
        let requiredMin = candidate.minHints;
        if (context?.resolvedSkills && context.resolvedSkills.length > 0) {
          const hasResolvedSkillInSameSector = context.resolvedSkills.some((sId) => {
            const rNode = this.nodesMap.get(sId);
            return rNode && (rNode.sector === candidate.sector || !isCrossSector(rNode.sector, candidate.sector));
          });
          if (hasResolvedSkillInSameSector) {
            requiredMin = Math.min(candidate.minHints, 1);
          }
        }
        return matchCount >= requiredMin;
      });

      if (qualified.length === 1) {
        return qualified[0].nodeId;
      }

      if (qualified.length > 1) {
        if (context?.sector) {
          const matchedSector = qualified.find(
            (c) => c.sector.toLowerCase() === context.sector!.toLowerCase(),
          );
          if (matchedSector) return matchedSector.nodeId;
        }
        return null;
      }

      return null;
    }

    // Fallback: match by word boundary, strictly prioritized by longest alias
    const matchedCandidates: string[] = [];
    let longestLength = 0;

    for (const item of this.sortedNormalizedAliases) {
      if (item.alias.length < 3) continue;
      if (textContainsWord(norm, item.alias)) {
        if (matchedCandidates.length === 0) {
          longestLength = item.alias.length;
          matchedCandidates.push(item.id);
        } else if (item.alias.length === longestLength) {
          if (!matchedCandidates.includes(item.id)) {
            matchedCandidates.push(item.id);
          }
        } else {
          // Since sorted descending, anything shorter is ignored once a longer match is found
          break;
        }
      }
    }

    if (matchedCandidates.length === 1) {
      return matchedCandidates[0];
    }

    if (matchedCandidates.length > 1) {
      if (context?.returnNullOnTie) {
        return null;
      }
      return matchedCandidates[0];
    }

    return null;
  }

  extractSkills(text: string, context?: ResolveContext): string[] {
    if (!text) return [];

    // Bảo vệ các alias chứa ký tự '/' (ví dụ: 'ci/cd', 'ui/ux', 'html/css') để không bị xé nhỏ khi tách mệnh đề
    let processedText = text;
    const slashPlaceholder = '___SLASH_TOKEN___';
    for (const item of this.sortedNormalizedAliases) {
      if (item.alias.includes('/')) {
        const escPattern = escapeRegex(item.alias).replace(/\//g, '\\s*\\/\\s*');
        const patternRegex = new RegExp(`(^|[^a-z0-9#+&/-])(${escPattern})([^a-z0-9#+&/-]|$)`, 'gi');
        processedText = processedText.replace(patternRegex, (match, prefix, term, suffix) => {
          return prefix + term.replace(/\//g, slashPlaceholder) + suffix;
        });
      }
    }

    // Tách theo dấu phẩy, gạch đầu dòng, xuống dòng, "và", "/", v.v.
    const clauses = processedText
      .split(/[\n,;•\-\*\t|\/]|(?:\s+(?:và|va|and|cùng|cung|hoặc|hoac|or|với|voi|with)\s+)/i)
      .map((s) => s.replace(new RegExp(slashPlaceholder, 'g'), '/').trim())
      .filter((s) => s.length > 0);

    const resultIds: string[] = [];
    const seenIds = new Set<string>();

    for (const clause of clauses) {
      const clauseNorm = normalizeSkillText(clause);
      if (!clauseNorm) continue;

      let remaining = clauseNorm;

      for (const item of this.sortedNormalizedAliases) {
        if (item.alias.length < 2) continue;

        if (textContainsWord(remaining, item.alias)) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            resultIds.push(item.id);
          }
          // Khi một cụm đã khớp alias dài thì không tách ra khớp alias ngắn bên trong nó
          const esc = escapeRegex(item.alias);
          remaining = remaining.replace(
            new RegExp(`(^|[^a-z0-9.#+&/-])${esc}([^a-z0-9.#+&/-]|$)`, 'gi'),
            ' ',
          );
        }
      }

      // Quét thêm ambiguousAliases với context là toàn bộ văn bản và các kỹ năng đã nhận diện
      for (const [ambiguousAlias] of this.ambiguousMap.entries()) {
        if (textContainsWord(remaining, ambiguousAlias)) {
          const resolvedId = this.resolveSkill(ambiguousAlias, {
            textContext: text,
            resolvedSkills: resultIds,
          });
          if (resolvedId && !seenIds.has(resolvedId)) {
            seenIds.add(resolvedId);
            resultIds.push(resolvedId);
            const esc = escapeRegex(ambiguousAlias);
            remaining = remaining.replace(
              new RegExp(`(^|[^a-z0-9.#+&/-])${esc}([^a-z0-9.#+&/-]|$)`, 'gi'),
              ' ',
            );
          }
        }
      }
    }

    return resultIds;
  }

  getMatchScore(
    candidateId: string,
    requiredId: string,
    options?: Partial<typeof SCORING_CONFIG>,
  ): number {
    return this.explainMatch(candidateId, requiredId, options).score;
  }

  explainMatch(
    candidateId: string,
    requiredId: string,
    options?: Partial<typeof SCORING_CONFIG>,
  ): MatchExplanation {
    const candId = this.resolveSkill(candidateId) || candidateId;
    const reqId = this.resolveSkill(requiredId) || requiredId;

    const maxDepth = options?.MAX_DEPTH ?? SCORING_CONFIG.MAX_DEPTH;
    const stepDecay = options?.STEP_DECAY ?? SCORING_CONFIG.STEP_DECAY;
    const crossSectorDecay = options?.CROSS_SECTOR_DECAY ?? SCORING_CONFIG.CROSS_SECTOR_DECAY;
    const crossSectorCap = options?.CROSS_SECTOR_CAP ?? SCORING_CONFIG.CROSS_SECTOR_CAP;

    if (!this.nodesMap.has(candId) || !this.nodesMap.has(reqId)) {
      return {
        candidateId: candId,
        requiredId: reqId,
        score: 0,
        path: [],
        nodeNames: [],
        steps: [],
        stepDecay,
        crossSectorDecay,
        reason: 'Không tìm thấy node tương ứng trong đồ thị tri thức.',
      };
    }

    if (candId === reqId) {
      const name = this.nodesMap.get(reqId)?.name || reqId;
      return {
        candidateId: candId,
        requiredId: reqId,
        score: 1.0,
        path: [candId],
        nodeNames: [name],
        steps: [],
        stepDecay,
        crossSectorDecay,
        reason: `Trùng khớp chính xác kỹ năng ${name}`,
      };
    }

    const candNode = this.nodesMap.get(candId)!;
    const reqNode = this.nodesMap.get(reqId)!;

    let bestScore = 0;
    let bestPath: string[] = [];
    let bestSteps: MatchStep[] = [];

    const queue: {
      id: string;
      path: string[];
      steps: MatchStep[];
      substituteCount: number;
      complementCount: number;
      foundationCount: number;
    }[] = [
      {
        id: candId,
        path: [candId],
        steps: [],
        substituteCount: 0,
        complementCount: 0,
        foundationCount: 0,
      },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      const currentNode = this.nodesMap.get(current.id);
      const edges = this.adjList.get(current.id) || [];

      for (const edge of edges) {
        if (current.path.includes(edge.to)) continue;

        const targetNode = this.nodesMap.get(edge.to);
        const isCross =
          currentNode &&
          targetNode &&
          isCrossSector(currentNode.sector, targetNode.sector);

        let newSubCount = current.substituteCount;
        let newCompCount = current.complementCount;
        let newFoundCount = current.foundationCount;

        if (edge.relation === 'SUBSTITUTE') {
          newSubCount++;
          if (newSubCount > 1) continue;
        } else if (edge.relation === 'COMPLEMENT') {
          newCompCount++;
          if (newCompCount > 1) continue;
        } else if (edge.relation === 'FOUNDATION') {
          newFoundCount++;
          if (newFoundCount > 1) continue;
        }

        const stepInfo: MatchStep = {
          from: edge.from,
          to: edge.to,
          relation: edge.relation,
          weight: edge.weight,
          isCrossSector: isCross || false,
        };

        const nextPath = [...current.path, edge.to];
        const nextSteps = [...current.steps, stepInfo];
        const numSteps = nextSteps.length;

        if (edge.to === reqId) {
          let pathScore: number;

          if (numSteps === 1) {
            // Direct 1-step edge: score is EXACTLY edge.weight (STEP_DECAY^0 = 1, no decay)
            pathScore = edge.weight;
          } else {
            // Multi-step path:
            // product of weights * STEP_DECAY^(steps - 1) * (isCrossSectorPath ? CROSS_SECTOR_DECAY : 1)
            const weightProduct = nextSteps.reduce((prod, s) => prod * s.weight, 1.0);
            const stepDecayMultiplier = Math.pow(stepDecay, numSteps - 1);

            const startSector = candNode.sector;
            const endSector = reqNode.sector;
            const isCrossSectorPath = isCrossSector(startSector, endSector);

            const crossMultiplier = isCrossSectorPath ? crossSectorDecay : 1.0;
            pathScore = weightProduct * stepDecayMultiplier * crossMultiplier;

            // Check if intermediate nodes contain 'Common' between two different specialized sectors
            const intermediateIds = nextPath.slice(1, -1);
            const hasCommonIntermediate = intermediateIds.some(
              (id) => this.nodesMap.get(id)?.sector === 'Common',
            );

            if (isCrossSectorPath && hasCommonIntermediate) {
              pathScore = Math.min(pathScore, crossSectorCap);
            }
          }

          if (pathScore > bestScore) {
            bestScore = pathScore;
            bestPath = nextPath;
            bestSteps = nextSteps;
          }
          continue;
        }

        if (nextSteps.length < maxDepth) {
          queue.push({
            id: edge.to,
            path: nextPath,
            steps: nextSteps,
            substituteCount: newSubCount,
            complementCount: newCompCount,
            foundationCount: newFoundCount,
          });
        }
      }
    }

    const finalScore = bestSteps.length === 1 ? bestScore : Number(bestScore.toFixed(4));
    const nodeNames = bestPath.map((id) => this.nodesMap.get(id)?.name || id);

    let reason = '';
    if (finalScore > 0) {
      const stepsText = bestSteps
        .map((s) => `${s.from} -[${s.relation} w=${s.weight}]-> ${s.to}`)
        .join(', ');
      reason = `Chuyển giao năng lực đạt ${Math.round(finalScore * 100)}% qua đường đi: ${nodeNames.join(' ➔ ')} (${stepsText})`;
    } else {
      reason = 'Không tìm thấy đường đi tương đương hợp lệ trong đồ thị tri thức.';
    }

    return {
      candidateId: candId,
      requiredId: reqId,
      score: finalScore,
      path: bestPath,
      nodeNames,
      steps: bestSteps,
      stepDecay,
      crossSectorDecay,
      reason,
    };
  }

  getNode(id: string): EscoSkillNode | undefined {
    return this.nodesMap.get(id);
  }
}

export const defaultSkillGraph = new SkillGraphEngine();

export function resolveSkill(text: string, context?: ResolveContext): string | null {
  return defaultSkillGraph.resolveSkill(text, context);
}

export function extractSkills(text: string, context?: ResolveContext): string[] {
  return defaultSkillGraph.extractSkills(text, context);
}

export function getMatchScore(
  candidateId: string,
  requiredId: string,
  options?: Partial<typeof SCORING_CONFIG>,
): number {
  return defaultSkillGraph.getMatchScore(candidateId, requiredId, options);
}

export function explainMatch(
  candidateId: string,
  requiredId: string,
  options?: Partial<typeof SCORING_CONFIG>,
): MatchExplanation {
  return defaultSkillGraph.explainMatch(candidateId, requiredId, options);
}
