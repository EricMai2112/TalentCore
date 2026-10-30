import {
  ESCO_SKILL_NODES,
  EscoSkillNode,
  isCrossSector,
} from './esco-taxonomy.data';
import { getMatchScore, SCORING_CONFIG } from './skillGraph';

interface CrossSectorPairScore {
  fromId: string;
  fromName: string;
  fromSector: string;
  toId: string;
  toName: string;
  toSector: string;
  score: number;
}

describe('Cross-Sector Leakage Property Tests', () => {
  it('Duyệt mọi cặp (u, v) có sector chuyên môn khác nhau: không cặp nào được > 0.30 (ngoại trừ các cụm sector tương thích SECTOR_CLUSTERS); báo cáo các cặp > 0.25 và top 20', () => {
    const specializedNodes = ESCO_SKILL_NODES.filter((n) => n.sector !== 'Common');
    const positivePairs: CrossSectorPairScore[] = [];
    const pairsOver25: CrossSectorPairScore[] = [];
    const pairsOver30: CrossSectorPairScore[] = [];

    let totalPairsEvaluated = 0;

    for (const u of specializedNodes) {
      for (const v of specializedNodes) {
        if (!isCrossSector(u.sector, v.sector)) continue;
        totalPairsEvaluated++;

        const score = getMatchScore(u.id, v.id);

        if (score > 0) {
          const item: CrossSectorPairScore = {
            fromId: u.id,
            fromName: u.name,
            fromSector: u.sector,
            toId: v.id,
            toName: v.name,
            toSector: v.sector,
            score,
          };
          positivePairs.push(item);

          if (score > 0.25) {
            pairsOver25.push(item);
          }
          if (score > 0.3) {
            pairsOver30.push(item);
          }
        }
      }
    }

    positivePairs.sort((a, b) => b.score - a.score);

    console.log(`\n================================================================================`);
    console.log(`PROPERTY TEST: KIỂM SOÁT RÒ RỈ ĐIỂM LIÊN NGÀNH (CROSS-SECTOR LEAKAGE)`);
    console.log(`================================================================================`);
    console.log(`Tổng số cặp chuyên môn đánh giá: ${totalPairsEvaluated}`);
    console.log(`Số cặp có điểm > 0: ${positivePairs.length}`);
    console.log(`Số cặp có điểm > 0.25: ${pairsOver25.length}`);
    console.log(`Số cặp có điểm > 0.30: ${pairsOver30.length}`);

    if (pairsOver25.length > 0) {
      console.log(`\n--- DANH SÁCH TẤT CẢ CÁC CẶP CÓ ĐIỂM > 0.25 (Trọng số liên ngành trực tiếp) ---`);
      for (const p of pairsOver25) {
        console.log(`  * ${p.fromId} (${p.fromSector}) -> ${p.toId} (${p.toSector}): score = ${p.score} ["${p.fromName}" -> "${p.toName}"]`);
      }
    }

    console.log(`\n--- TOP 20 CẶP ĐIỂM LIÊN NGÀNH CAO NHẤT ---`);
    const top20 = positivePairs.slice(0, 20);
    top20.forEach((p, idx) => {
      console.log(`  ${(idx + 1).toString().padStart(2, ' ')}. ${p.fromId} (${p.fromSector}) -> ${p.toId} (${p.toSector}): ${p.score} (${p.fromName} -> ${p.toName})`);
    });
    console.log(`================================================================================\n`);

    // Strict assertion: KHÔNG cặp liên ngành nào được vượt quá 0.30 (ngưỡng tối đa WEIGHT_RULES.CROSS_SECTOR_MAX)
    expect(pairsOver30).toHaveLength(0);
  });

  it('Ứng viên IT có trọn bộ skill chuyên sâu khi ứng tuyển JD Finance phải có điểm trung bình < 0.1', () => {
    const candidateItSkills = [
      'react',
      'nextjs',
      'nodejs',
      'typescript',
      'python',
      'docker',
      'kubernetes',
      'mongodb',
      'postgresql',
      'aws',
      'cicd',
    ];

    const jdFinanceSkills = [
      'accounting_general',
      'tax_accounting',
      'financial_reporting',
      'external_audit',
      'cpa_cert',
      'misa_software',
      'fast_software',
      'financial_analysis',
      'cost_accounting',
    ];

    let totalScore = 0;
    const details: { jdSkill: string; bestCandSkill: string; score: number }[] = [];

    for (const reqSkill of jdFinanceSkills) {
      let maxScoreForSkill = 0;
      let matchedCandSkill = '';

      for (const candSkill of candidateItSkills) {
        const score = getMatchScore(candSkill, reqSkill);
        if (score > maxScoreForSkill) {
          maxScoreForSkill = score;
          matchedCandSkill = candSkill;
        }
      }

      totalScore += maxScoreForSkill;
      details.push({
        jdSkill: reqSkill,
        bestCandSkill: matchedCandSkill || '(none)',
        score: maxScoreForSkill,
      });
    }

    const averageScore = totalScore / jdFinanceSkills.length;

    console.log(`\n--- ĐÁNH GIÁ ỨNG VIÊN IT vs JD FINANCE ---`);
    console.log(`Điểm trung bình chuyển đổi: ${averageScore.toFixed(4)} (< 0.10)`);
    for (const d of details) {
      console.log(`  JD [${d.jdSkill}] <- Candidate [${d.bestCandSkill}]: score = ${d.score}`);
    }

    expect(averageScore).toBeLessThan(0.1);
  });
});

