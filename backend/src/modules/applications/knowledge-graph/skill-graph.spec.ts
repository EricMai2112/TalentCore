import {
  ESCO_SKILL_NODES,
  ESCO_SKILL_EDGES,
  assertEscoTaxonomy,
  validateEscoTaxonomy,
  SECTORS,
  WEIGHT_RULES,
} from './esco-taxonomy.data';
import {
  resolveSkill,
  extractSkills,
  getMatchScore,
  explainMatch,
  SCORING_CONFIG,
} from './skillGraph';
import { SkillKnowledgeGraphService } from './skill-graph.service';

describe('Skill Knowledge Graph & Ontology Test Suite', () => {
  let service: SkillKnowledgeGraphService;

  beforeAll(() => {
    service = new SkillKnowledgeGraphService();
  });

  describe('1. Validate Taxonomy & Graph Rules', () => {
    it('should assert graph taxonomy passes all validation rules without error', () => {
      expect(() => assertEscoTaxonomy()).not.toThrow();
      const errors = validateEscoTaxonomy(ESCO_SKILL_NODES, ESCO_SKILL_EDGES);
      expect(errors).toHaveLength(0);
    });

    it('should ensure every SUBSTITUTE relation has a reverse SUBSTITUTE edge', () => {
      const substituteEdges = ESCO_SKILL_EDGES.filter((e) => e.relation === 'SUBSTITUTE');
      for (const edge of substituteEdges) {
        const reverse = ESCO_SKILL_EDGES.find(
          (e) => e.from === edge.to && e.to === edge.from && e.relation === 'SUBSTITUTE',
        );
        expect(reverse).toBeDefined();
      }
    });

    it('should not contain duplicate ESCO URIs across different nodes', () => {
      const uriMap = new Map<string, string>();
      for (const node of ESCO_SKILL_NODES) {
        if (node.escoUri) {
          expect(uriMap.has(node.escoUri)).toBe(false);
          uriMap.set(node.escoUri, node.id);
        }
      }
    });

    it('should have valid type, source and sector for every node', () => {
      const validTypes = new Set([
        'skill',
        'tool',
        'certification',
        'language',
        'soft_skill',
        'domain_knowledge',
      ]);
      for (const node of ESCO_SKILL_NODES) {
        expect(validTypes.has(node.type)).toBe(true);
        expect(['esco', 'custom']).toContain(node.source);
        expect(SECTORS).toContain(node.sector);
      }
    });
  });

  describe('2. Sector Node Statistics', () => {
    it('should have at least 12 nodes in every sector', () => {
      const counts: Record<string, number> = {};
      for (const node of ESCO_SKILL_NODES) {
        counts[node.sector] = (counts[node.sector] || 0) + 1;
      }

      for (const sector of SECTORS) {
        expect(counts[sector]).toBeGreaterThanOrEqual(12);
      }
    });

    it('should ensure IT sector nodes do not exceed 35% of total nodes', () => {
      const itNodes = ESCO_SKILL_NODES.filter((n) => n.sector === 'IT').length;
      const ratio = itNodes / ESCO_SKILL_NODES.length;
      expect(ratio).toBeLessThanOrEqual(0.35);
    });
  });

  describe('3. Core Matching Requirements (IT, Finance, Marketing, HR, Design)', () => {
    it('IT: nextjs -> react >= 0.85', () => {
      const score = getMatchScore('nextjs', 'react');
      expect(score).toBeGreaterThanOrEqual(0.85);
    });

    it('IT: react -> nextjs within [0.55, 0.75]', () => {
      const score = getMatchScore('react', 'nextjs');
      expect(score).toBeGreaterThanOrEqual(0.55);
      expect(score).toBeLessThanOrEqual(0.75);
    });

    it('IT: docker -> kubernetes < 0.45', () => {
      const score = getMatchScore('docker', 'kubernetes');
      expect(score).toBeLessThan(0.45);
    });

    it('IT: redux -> react >= 0.75', () => {
      const score = getMatchScore('redux', 'react');
      expect(score).toBeGreaterThanOrEqual(0.75);
    });

    it('Finance: MISA <-> FAST within [0.6, 0.8]', () => {
      const scoreMisaToFast = getMatchScore('misa_software', 'fast_software');
      const scoreFastToMisa = getMatchScore('fast_software', 'misa_software');
      expect(scoreMisaToFast).toBeGreaterThanOrEqual(0.6);
      expect(scoreMisaToFast).toBeLessThanOrEqual(0.8);
      expect(scoreFastToMisa).toBeGreaterThanOrEqual(0.6);
      expect(scoreFastToMisa).toBeLessThanOrEqual(0.8);
    });

    it('Finance: ke toan tong hop -> kiem toan doc lap < 0.45', () => {
      const score = getMatchScore('accounting_general', 'external_audit');
      expect(score).toBeLessThan(0.45);
    });

    it('Finance: kiem toan doc lap -> ke toan tong hop >= 0.65', () => {
      const score = getMatchScore('external_audit', 'accounting_general');
      expect(score).toBeGreaterThanOrEqual(0.65);
    });

    it('Finance: ACCA -> IFRS >= 0.85', () => {
      const score = getMatchScore('acca_cert', 'ifrs_standards');
      expect(score).toBeGreaterThanOrEqual(0.85);
    });

    it('Marketing: Google Ads -> SEO < 0.4', () => {
      const score = getMatchScore('google_ads', 'seo');
      expect(score).toBeLessThan(0.4);
    });

    it('Marketing: Google Ads -> Meta Ads within [0.5, 0.65]', () => {
      const score = getMatchScore('google_ads', 'meta_ads');
      expect(score).toBeGreaterThanOrEqual(0.5);
      expect(score).toBeLessThanOrEqual(0.65);
    });

    it('HR: tuyen dung -> C&B < 0.35', () => {
      const score = getMatchScore('talent_acquisition', 'cb_management');
      expect(score).toBeLessThan(0.35);
    });

    it('Design: Figma -> Adobe XD within [0.75, 0.9]', () => {
      const score = getMatchScore('figma', 'adobe_xd');
      expect(score).toBeGreaterThanOrEqual(0.75);
      expect(score).toBeLessThanOrEqual(0.9);
    });

    it('Design: Photoshop -> Illustrator within [0.4, 0.6]', () => {
      const score = getMatchScore('photoshop', 'illustrator');
      expect(score).toBeGreaterThanOrEqual(0.4);
      expect(score).toBeLessThanOrEqual(0.6);
    });
  });

  describe('4. Additional Sectors Test Pairs (At least 3 pairs per sector)', () => {
    // Healthcare
    it('Healthcare: midwifery -> clinical_nursing >= 0.75', () => {
      expect(getMatchScore('midwifery', 'clinical_nursing')).toBeGreaterThanOrEqual(0.75);
    });
    it('Healthcare: medical_laboratory -> medical_diagnosis < 0.45', () => {
      expect(getMatchScore('medical_laboratory', 'medical_diagnosis')).toBeLessThan(0.45);
    });
    it('Healthcare: clinical_nursing -> first_aid_cpr >= 0.75', () => {
      expect(getMatchScore('clinical_nursing', 'first_aid_cpr')).toBeGreaterThanOrEqual(0.75);
    });

    // Education
    it('Education: classroom_management -> teaching_pedagogy >= 0.75', () => {
      expect(getMatchScore('classroom_management', 'teaching_pedagogy')).toBeGreaterThanOrEqual(0.75);
    });
    it('Education: edtech_integration -> lms_elearning >= 0.70', () => {
      expect(getMatchScore('edtech_integration', 'lms_elearning')).toBeGreaterThanOrEqual(0.7);
    });
    it('Education: admissions_counseling -> academic_advising < 0.45', () => {
      expect(getMatchScore('admissions_counseling', 'academic_advising')).toBeLessThan(0.45);
    });

    // Construction
    it('Construction: construction_qa_qc -> site_supervision >= 0.75', () => {
      expect(getMatchScore('construction_qa_qc', 'site_supervision')).toBeGreaterThanOrEqual(0.75);
    });
    it('Construction: structural_design -> revit_bim < 0.45', () => {
      expect(getMatchScore('structural_design', 'revit_bim')).toBeLessThan(0.45);
    });
    it('Construction: construction_bidding -> construction_cost_estimate >= 0.70', () => {
      expect(getMatchScore('construction_bidding', 'construction_cost_estimate')).toBeGreaterThanOrEqual(0.7);
    });

    // Hospitality
    it('Hospitality: hotel_front_office -> hotel_pms >= 0.70', () => {
      expect(getMatchScore('hotel_front_office', 'hotel_pms')).toBeGreaterThanOrEqual(0.7);
    });
    it('Hospitality: tour_guide -> tour_operations within [0.35, 0.55]', () => {
      const score = getMatchScore('tour_guide', 'tour_operations');
      expect(score).toBeGreaterThanOrEqual(0.35);
      expect(score).toBeLessThanOrEqual(0.55);
    });
    it('Hospitality: housekeeping_operations -> hotel_pms < 0.35', () => {
      expect(getMatchScore('housekeeping_operations', 'hotel_pms')).toBeLessThan(0.35);
    });

    // Legal
    it('Legal: inhouse_counsel -> legal_compliance >= 0.80', () => {
      expect(getMatchScore('inhouse_counsel', 'legal_compliance')).toBeGreaterThanOrEqual(0.8);
    });
    it('Legal: legal_advisory -> corporate_law >= 0.75', () => {
      expect(getMatchScore('legal_advisory', 'corporate_law')).toBeGreaterThanOrEqual(0.75);
    });
    it('Legal: administrative_licensing -> legal_compliance < 0.45', () => {
      expect(getMatchScore('administrative_licensing', 'legal_compliance')).toBeLessThan(0.45);
    });

    // CustomerService
    it('CustomerService: omnichannel_support -> customer_service >= 0.75', () => {
      expect(getMatchScore('omnichannel_support', 'customer_service')).toBeGreaterThanOrEqual(0.75);
    });
    it('CustomerService: zendesk_freshdesk -> helpdesk_support >= 0.75', () => {
      expect(getMatchScore('zendesk_freshdesk', 'helpdesk_support')).toBeGreaterThanOrEqual(0.75);
    });
    it('CustomerService: telephonic_persuasion -> call_center < 0.45', () => {
      expect(getMatchScore('telephonic_persuasion', 'call_center')).toBeLessThan(0.45);
    });

    // Engineering
    it('Engineering: six_sigma -> lean_manufacturing >= 0.70', () => {
      expect(getMatchScore('six_sigma', 'lean_manufacturing')).toBeGreaterThanOrEqual(0.7);
    });
    it('Engineering: industrial_electricity -> mechanical_maintenance >= 0.70', () => {
      expect(getMatchScore('industrial_electricity', 'mechanical_maintenance')).toBeGreaterThanOrEqual(0.7);
    });
    it('Engineering: manufacturing_qc_qa -> lean_manufacturing < 0.45', () => {
      expect(getMatchScore('manufacturing_qc_qa', 'lean_manufacturing')).toBeLessThan(0.45);
    });

    // Administration
    it('Administration: executive_secretary -> office_administration >= 0.75', () => {
      expect(getMatchScore('executive_secretary', 'office_administration')).toBeGreaterThanOrEqual(0.75);
    });
    it('Administration: official_dispatch_drafting -> records_document_management >= 0.75', () => {
      expect(getMatchScore('official_dispatch_drafting', 'records_document_management')).toBeGreaterThanOrEqual(0.75);
    });
    it('Administration: front_desk_reception -> office_administration < 0.45', () => {
      expect(getMatchScore('front_desk_reception', 'office_administration')).toBeLessThan(0.45);
    });

    // Common
    it('Common: excel_advanced -> excel_basic >= 0.85', () => {
      expect(getMatchScore('excel_advanced', 'excel_basic')).toBeGreaterThanOrEqual(0.85);
    });
    it('Common: ielts_cert -> english_language >= 0.85', () => {
      expect(getMatchScore('ielts_cert', 'english_language')).toBeGreaterThanOrEqual(0.85);
    });
    it('Common: presentation_skill -> communication_skill >= 0.75', () => {
      expect(getMatchScore('presentation_skill', 'communication_skill')).toBeGreaterThanOrEqual(0.75);
    });

    // Sales
    it('Sales: zoho_crm -> crm >= 0.80', () => {
      expect(getMatchScore('zoho_crm', 'crm')).toBeGreaterThanOrEqual(0.8);
    });
    it('Sales: zoho_crm -> hubspot_crm within [0.55, 0.75]', () => {
      const score = getMatchScore('zoho_crm', 'hubspot_crm');
      expect(score).toBeGreaterThanOrEqual(0.55);
      expect(score).toBeLessThanOrEqual(0.75);
    });
    it('Sales: sales_pipeline_management -> b2b_sales >= 0.75', () => {
      expect(getMatchScore('sales_pipeline_management', 'b2b_sales')).toBeGreaterThanOrEqual(0.75);
    });

    // Operations
    it('Operations: fleet_management -> transportation_management >= 0.75', () => {
      expect(getMatchScore('fleet_management', 'transportation_management')).toBeGreaterThanOrEqual(0.75);
    });
    it('Operations: customs_declaration_software -> customs_clearance >= 0.80', () => {
      expect(getMatchScore('customs_declaration_software', 'customs_clearance')).toBeGreaterThanOrEqual(0.8);
    });
    it('Operations: supply_chain_management -> procurement < 0.45', () => {
      expect(getMatchScore('supply_chain_management', 'procurement')).toBeLessThan(0.45);
    });

    // Data
    it('Data: pytorch -> deep_learning >= 0.85', () => {
      expect(getMatchScore('pytorch', 'deep_learning')).toBeGreaterThanOrEqual(0.85);
    });
    it('Data: deep_learning -> machine_learning >= 0.80', () => {
      expect(getMatchScore('deep_learning', 'machine_learning')).toBeGreaterThanOrEqual(0.8);
    });
    it('Data: power_bi -> data_analysis < 0.45', () => {
      expect(getMatchScore('power_bi', 'data_analysis')).toBeLessThan(0.45);
    });
  });

  describe('5. Ambiguous Alias Resolution Accuracy', () => {
    it('"AI engineer" must NOT resolve to Illustrator', () => {
      const res = resolveSkill('AI engineer');
      expect(res).not.toBe('illustrator');
    });

    it('"go to market" must NOT resolve to Golang', () => {
      const res = resolveSkill('go to market');
      expect(res).toBeNull();
    });

    it('"fast learner" must NOT resolve to FAST software', () => {
      const res = resolveSkill('fast learner');
      expect(res).toBeNull();
    });

    it('"sales" in Finance JD without hints must NOT resolve to sales node', () => {
      const res = resolveSkill('sales', { sector: 'Finance' });
      expect(res).toBeNull();
    });

    it('"Excel" should resolve cleanly to excel_basic', () => {
      const res = resolveSkill('Excel');
      expect(res).toBe('excel_basic');
    });

    it('"bravo" in "bravo team" must NOT resolve to Bravo software', () => {
      const res = resolveSkill('bravo', { textContext: 'bravo team good work' });
      expect(res).toBeNull();
    });

    it('"c#" and ".net" should resolve cleanly to csharp_net', () => {
      expect(resolveSkill('c#')).toBe('csharp_net');
      expect(resolveSkill('.net')).toBe('csharp_net');
    });

    it('should prioritize longest alias: "senior react native engineer" -> react_native, "deep learning" -> deep_learning', () => {
      expect(resolveSkill('senior react native engineer')).toBe('react_native');
      expect(resolveSkill('deep learning engineer')).toBe('deep_learning');
    });

    it('extractSkills should extract all unique skill ids preserving order and avoid breaking sub-phrases', () => {
      const text = 'Yêu cầu: Thành thạo React Native, React, TypeScript, C#, Docker và hiểu biết sâu về Deep Learning.';
      const extracted = extractSkills(text);
      expect(extracted).toContain('react_native');
      expect(extracted).toContain('react');
      expect(extracted).toContain('typescript');
      expect(extracted).toContain('csharp_net');
      expect(extracted).toContain('docker');
      expect(extracted).toContain('deep_learning');
      // Subphrases like 'learning' or single letters should not exist as fake duplicates
      expect(new Set(extracted).size).toBe(extracted.length);
    });

    it('ambiguous alias with word-boundary hints: "gin" in "engineering" or "login" must NOT resolve golang', () => {
      expect(resolveSkill('go', { textContext: 'chemical engineering background' })).toBeNull();
      expect(resolveSkill('go', { textContext: 'user login authentication error' })).toBeNull();
      expect(resolveSkill('go', { textContext: 'we use gin framework and goroutines' })).toBe('golang');
    });

    it('"copywriting" must resolve to copywriting_creative, not content_marketing', () => {
      expect(resolveSkill('copywriting')).toBe('copywriting_creative');
    });

    it('"bravo" with accounting/ERP hints resolves bravo_software; without hints resolves null', () => {
      expect(resolveSkill('bravo')).toBeNull();
      expect(resolveSkill('bravo', { textContext: 'kinh nghiệm kế toán hóa đơn và misa' })).toBe('bravo_software');
    });

    it('resolvedSkills should serve as context hints for ambiguous aliases', () => {
      expect(resolveSkill('bravo', { resolvedSkills: ['misa_software', 'tax_accounting'] })).toBe('bravo_software');
    });
  });

  describe('6. Anti-Cross-Sector Leakage & Chain Restrictions', () => {
    it('IT skills against Finance JD must yield near 0 score (< 0.1)', () => {
      expect(getMatchScore('react', 'accounting_general')).toBeLessThan(0.1);
      expect(getMatchScore('nodejs', 'financial_reporting')).toBeLessThan(0.1);
      expect(getMatchScore('docker', 'tax_accounting')).toBeLessThan(0.1);
    });

    it('should not chain two SUBSTITUTE edges', () => {
      // react <-> vue is SUBSTITUTE (0.65), vue <-> angular is SUBSTITUTE (0.55)
      // Path react -> vue -> angular crosses two SUBSTITUTE edges, which must be blocked
      const score = getMatchScore('react', 'angular');
      expect(score).toBe(0.55);
      // Verify that explanation doesn't chain through vue:
      const explanation = explainMatch('react', 'angular');
      const hasTwoSubs = explanation.steps.filter((s) => s.relation === 'SUBSTITUTE').length > 1;
      expect(hasTwoSubs).toBe(false);
    });

    it('should explain matches with informative reasoning', () => {
      const explanation = explainMatch('nextjs', 'react');
      expect(explanation.score).toBeGreaterThanOrEqual(0.85);
      expect(explanation.nodeNames).toContain('Next.js');
      expect(explanation.nodeNames).toContain('React');
      expect(explanation.reason).toContain('Chuyển giao năng lực');
    });
  });

  describe('7. FOUNDATION Relation & 1-Step Direct Decay Tests', () => {
    it('Mọi cạnh trực tiếp from -> to: getMatchScore(from, to) === edge.weight (sai số 1e-9), trừ khi có đường khác cao hơn', () => {
      let matchCount = 0;
      let higherCount = 0;

      for (const edge of ESCO_SKILL_EDGES) {
        const score = getMatchScore(edge.from, edge.to);
        expect(score).toBeGreaterThanOrEqual(edge.weight - 1e-9);

        if (Math.abs(score - edge.weight) < 1e-9) {
          matchCount++;
        } else {
          higherCount++;
        }
      }

      console.log(`Kiểm thử ${ESCO_SKILL_EDGES.length} cạnh trực tiếp: ${matchCount} cạnh có điểm bằng chính xác edge.weight, ${higherCount} cạnh có đường gián tiếp điểm cao hơn.`);
      expect(matchCount + higherCount).toBe(ESCO_SKILL_EDGES.length);
    });

    it('should respect FOUNDATION weight boundaries [0.4, 0.7]', () => {
      const foundationEdges = ESCO_SKILL_EDGES.filter((e) => e.relation === 'FOUNDATION');
      expect(foundationEdges.length).toBeGreaterThan(0);
      for (const edge of foundationEdges) {
        expect(edge.weight).toBeGreaterThanOrEqual(0.4);
        expect(edge.weight).toBeLessThanOrEqual(0.7);
      }
    });

    it('should not chain two FOUNDATION edges', () => {
      // machine_learning -[FOUNDATION]-> deep_learning -[FOUNDATION]-> pytorch
      // Chaining two FOUNDATION edges must be blocked
      const explanation = explainMatch('machine_learning', 'pytorch');
      const foundationSteps = explanation.steps.filter((s) => s.relation === 'FOUNDATION');
      expect(foundationSteps.length).toBeLessThanOrEqual(1);
    });

    it('should explain react -> nextjs as FOUNDATION transfer with score 0.65', () => {
      const explanation = explainMatch('react', 'nextjs');
      expect(explanation.score).toBe(0.65);
      expect(explanation.steps[0].relation).toBe('FOUNDATION');
      expect(explanation.steps[0].weight).toBe(0.65);
    });

    it('Property test: Liệt kê mọi cạnh IMPLIES có điểm thực tế < 0.5 do trần liên ngành (để rà soát)', () => {
      const throttledImplies: { from: string; to: string; weight: number; actualScore: number }[] = [];
      const impliesEdges = ESCO_SKILL_EDGES.filter((e) => e.relation === 'IMPLIES');

      for (const edge of impliesEdges) {
        const score = getMatchScore(edge.from, edge.to);
        if (score < 0.5) {
          throttledImplies.push({
            from: edge.from,
            to: edge.to,
            weight: edge.weight,
            actualScore: score,
          });
        }
      }

      console.log(`Số cạnh IMPLIES bị trần liên ngành ép xuống dưới 0.5: ${throttledImplies.length}`);
      if (throttledImplies.length > 0) {
        console.log('Danh sách cạnh IMPLIES bị ép dưới 0.5:', throttledImplies);
      }
      expect(throttledImplies).toHaveLength(0);
    });
  });

  describe('8. SkillKnowledgeGraphService Offline Transfer & Unresolved Tracking', () => {
    it('findBestTransferableSkill returns transferable match and collects unresolved skills without network calls', () => {
      const res = service.findBestTransferableSkill('Next.js', ['React', 'UnknownSkill123', 'RandomGizmo']);
      expect(res.match).toBeDefined();
      expect(res.match?.candidateSkill).toBe('React');
      expect(res.match?.requiredSkill).toBe('Next.js');
      expect(res.match?.similarity).toBeGreaterThanOrEqual(0.6);
      expect(res.match?.explanation).toContain('theo đồ thị kỹ năng của hệ thống');
      expect(res.unresolvedSkills).toEqual(expect.arrayContaining(['UnknownSkill123', 'RandomGizmo']));
    });

    it('findBestTransferableSkill handles unresolved requiredSkill', () => {
      const res = service.findBestTransferableSkill('CompletelyFakeSkill', ['React']);
      expect(res.match).toBeNull();
      expect(res.unresolvedSkills).toContain('CompletelyFakeSkill');
    });

    it('findBestTransferableSkill respects SCORING_CONFIG.MIN_TRANSFER_SCORE (0.40) and allowContinuousScore', () => {
      // Complement edge revit_bim -> autocad_design has weight 0.30
      const standardRes = service.findBestTransferableSkill('AutoCAD 2D/3D', ['Revit & Mô hình BIM']);
      expect(standardRes.match).toBeNull(); // 0.30 < 0.40

      const continuousRes = service.findBestTransferableSkill('AutoCAD 2D/3D', ['Revit & Mô hình BIM'], undefined, undefined, {
        allowContinuousScore: true,
      });
      expect(continuousRes.match).toBeDefined();
      expect(continuousRes.match?.similarity).toBeCloseTo(0.3, 2);
    });

    it('logUnresolvedSkills produces structured JSON log without PII', () => {
      const warnSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation(() => {});
      service.logUnresolvedSkills(['UnrecognizedSkillA', 'UnrecognizedSkillB'], 'test_context');
      expect(warnSpy).toHaveBeenCalled();
      const loggedJson = JSON.parse(warnSpy.mock.calls[0][0] as string);
      expect(loggedJson.event).toBe('unresolved_skills');
      expect(loggedJson.count).toBe(2);
      expect(loggedJson.skills).toEqual(['UnrecognizedSkillA', 'UnrecognizedSkillB']);
      expect(loggedJson.context).toBe('test_context');
      warnSpy.mockRestore();
    });
  });

  describe('9. Recall, Edge Reciprocity & Data Integrity Verification (Mục 7)', () => {
    it('extractSkills("ReactJS, Node.js, MySQL, C#, MISA, Bravo, Excel") must extract all 7 skills correctly', () => {
      const extracted = service.extractSkills('ReactJS, Node.js, MySQL, C#, MISA, Bravo, Excel');
      expect(extracted).toEqual([
        'react',
        'nodejs',
        'mysql',
        'csharp_net',
        'misa_software',
        'bravo_software',
        'excel_basic',
      ]);
    });

    it('extractSkills("Senior React Native engineer") must resolve react_native and NOT react', () => {
      const extracted = service.extractSkills('Senior React Native engineer');
      expect(extracted).toContain('react_native');
      expect(extracted).not.toContain('react');
    });

    it('extractSkills("Python Flask API, Docker") must extract python, flask, and docker', () => {
      const extracted = service.extractSkills('Python Flask API, Docker');
      expect(extracted).toContain('python');
      expect(extracted).toContain('flask');
      expect(extracted).toContain('docker');
    });

    it('base implications and recall edges must score properly', () => {
      expect(getMatchScore('react', 'javascript')).toBeGreaterThan(0);
      expect(getMatchScore('mysql', 'sql_general')).toBeGreaterThan(0);
      expect(getMatchScore('scikit_learn', 'python')).toBeGreaterThanOrEqual(0.8);
    });

    it('hint word boundary check: "engineering team" does NOT trigger gin for go', () => {
      expect(service.resolveSkillId('go', { textContext: 'engineering team' })).toBeNull();
    });

    it('Bravo ambiguous resolution: "bravo team good work" does NOT resolve Bravo software, while "MISA, Bravo" resolves it', () => {
      expect(service.resolveSkillId('bravo', { textContext: 'bravo team good work' })).toBeNull();
      const extracted = service.extractSkills('MISA, Bravo');
      expect(extracted).toContain('bravo_software');
      expect(extracted).toContain('misa_software');
    });

    it('consistent behavior with/without context for c#, ps, and spring', () => {
      // c# is safe whitelisted alias
      expect(service.resolveSkillId('c#')).toBe('csharp_net');
      expect(service.resolveSkillId('c#', { textContext: 'random context' })).toBe('csharp_net');

      // ps is ambiguous (needs design context)
      expect(service.resolveSkillId('ps')).toBeNull();
      expect(service.resolveSkillId('ps', { textContext: 'adobe photoshop design retouch' })).toBe('photoshop');

      // spring is ambiguous (needs java/backend context)
      expect(service.resolveSkillId('spring')).toBeNull();
      expect(service.resolveSkillId('spring', { textContext: 'java backend spring microservices' })).toBe('spring_boot');
    });

    it('every SUBSTITUTE edge must have a reciprocal edge in the opposite direction', () => {
      const substituteEdges = ESCO_SKILL_EDGES.filter((e) => e.relation === 'SUBSTITUTE');
      const missingReciprocals: string[] = [];

      for (const edge of substituteEdges) {
        const hasOpposite = ESCO_SKILL_EDGES.some(
          (e) => e.from === edge.to && e.to === edge.from && e.relation === 'SUBSTITUTE',
        );
        if (!hasOpposite) {
          missingReciprocals.push(`${edge.from} <-> ${edge.to}`);
        }
      }

      expect(missingReciprocals).toHaveLength(0);
    });

    it('findBestTransferableSkill must NEVER call network fetch', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch' as any);
      const res = service.findBestTransferableSkill('Next.js', ['React', 'CompletelyFakeSkill']);
      expect(res.match).toBeDefined();
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  describe('10. Targeted Fixes Verification (5 vấn đề)', () => {
    it('1. TypeScript spec compiles and logUnresolvedSkills works', () => {
      const warnSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation(() => {});
      service.logUnresolvedSkills(['SkillA'], 'context');
      expect(warnSpy).toHaveBeenCalled();
      const parsed = JSON.parse(warnSpy.mock.calls[0][0] as string);
      expect(parsed.event).toBe('unresolved_skills');
      expect(parsed.skills).toEqual(['SkillA']);
      warnSpy.mockRestore();
    });

    it('2. extractSkills recognizes CI/CD accurately without splitting into CI and CD', () => {
      expect(service.extractSkills('CI/CD')).toEqual(['cicd']);
      expect(service.extractSkills('Senior CI/CD Engineer')).toEqual(['cicd']);
      expect(service.extractSkills('Kinh nghiệm CI/CD, Docker, Kubernetes')).toEqual(['cicd', 'docker', 'kubernetes']);
      expect(service.extractSkills('GitLab CI/CD')).toContain('gitlab_ci');
      expect(service.resolveSkillId('CI/CD')).toBe('cicd');
    });

    it('3. C&B is recognized cleanly as cb_management with and without context', () => {
      expect(service.resolveSkillId('C&B')).toBe('cb_management');
      expect(service.resolveSkillId('c&b')).toBe('cb_management');
      expect(service.resolveSkillId('C&B', { textContext: 'tuyển dụng nhân sự' })).toBe('cb_management');
      expect(service.extractSkills('Chuyên viên C&B')).toEqual(['cb_management']);
      expect(service.extractSkills('C&B, recruitment, chế độ bhxh')).toEqual(['cb_management', 'talent_acquisition', 'social_insurance']);
    });

    it('4. kiểm toán general alias maps to external_audit while preserving specific audit nodes', () => {
      // General alias resolves to external_audit
      expect(service.resolveSkillId('kiểm toán')).toBe('external_audit');
      expect(service.resolveSkillId('kiem toan')).toBe('external_audit');
      expect(service.extractSkills('kiểm toán')).toEqual(['external_audit']);
      expect(service.extractSkills('kế toán thuế, kiểm toán')).toEqual(['tax_accounting', 'external_audit']);

      // Specific aliases still resolve to their respective specific nodes
      expect(service.resolveSkillId('kiểm toán nội bộ')).toBe('internal_audit');
      expect(service.extractSkills('kiểm toán nội bộ')).toEqual(['internal_audit']);
      expect(service.resolveSkillId('kiểm toán độc lập')).toBe('external_audit');
      expect(service.extractSkills('kiểm toán độc lập')).toEqual(['external_audit']);
    });

    it('5. labor_law_legal -> labor_law has only SUBSTITUTE relation and no duplicate COMPLEMENT', () => {
      const edges = ESCO_SKILL_EDGES.filter(
        (e) => e.from === 'labor_law_legal' && e.to === 'labor_law',
      );
      expect(edges).toHaveLength(1);
      expect(edges[0].relation).toBe('SUBSTITUTE');
      expect(edges[0].weight).toBe(0.8);

      const reverseEdges = ESCO_SKILL_EDGES.filter(
        (e) => e.from === 'labor_law' && e.to === 'labor_law_legal',
      );
      expect(reverseEdges).toHaveLength(1);
      expect(reverseEdges[0].relation).toBe('SUBSTITUTE');
      expect(reverseEdges[0].weight).toBe(0.8);
    });
  });
});

