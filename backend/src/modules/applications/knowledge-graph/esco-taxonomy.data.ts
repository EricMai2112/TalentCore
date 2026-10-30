// Quy ước: Edge from -> to với weight w nghĩa là: "nếu ứng viên CÓ from, thì đáp ứng được w (0..1) yêu cầu to của JD."
// Các loại quan hệ:
// - IMPLIES: from kéo theo to (ví dụ: Next.js kéo theo React; chứng chỉ CPA kéo theo Kế toán tổng hợp). Weight >= 0.5.
// - FOUNDATION: from là nền tảng trực tiếp của to (ví dụ: React là nền tảng của Next.js; Python là nền tảng của Django).
//   Có from thì đáp ứng một phần đáng kể to nhưng chưa đủ. Có hướng (nền tảng -> cái xây trên nó). Weight: 0.4 - 0.7. Tối đa 1 cạnh trên đường đi, không chain.
// - SUBSTITUTE: thay thế lẫn nhau (ví dụ: React <-> Vue; MISA <-> FAST). Weight <= 0.9. Tối đa 1 cạnh trên đường đi, không chain.
// - COMPLEMENT: bổ trợ nhẹ, hay đi cùng nhau (ví dụ: React -> Redux; Docker -> Kubernetes). Weight <= 0.4. Tối đa 1 cạnh trên đường đi, không chain.

// Cần hiệu chỉnh bằng dữ liệu đánh giá thực của recruiter
export const DEFAULT_WEIGHTS = {
  IMPLIES: 0.85,
  FOUNDATION: 0.55,
  SUBSTITUTE: 0.65,
  COMPLEMENT: 0.3,
} as const;

export const SECTORS = [
  'IT',
  'Data',
  'Finance',
  'Marketing',
  'Sales',
  'Design',
  'HR',
  'Operations',
  'Healthcare',
  'CustomerService',
  'Legal',
  'Engineering',
  'Construction',
  'Hospitality',
  'Education',
  'Administration',
  'Common',
] as const;

export type Sector = (typeof SECTORS)[number];

export type SkillType = 'skill' | 'tool' | 'certification' | 'language' | 'soft_skill' | 'domain_knowledge';

export interface AmbiguousAlias {
  alias: string;
  contextHints: string[];
  minHints?: number;
}

export interface EscoSkillNode {
  id: string;
  name: string;
  type: SkillType;
  aliases: string[];
  ambiguousAliases?: AmbiguousAlias[];
  sector: Sector;
  category: string;
  source: 'esco' | 'custom';
  escoUri?: string;
  confidence?: number;
}

export type EscoRelationType = 'IMPLIES' | 'FOUNDATION' | 'SUBSTITUTE' | 'COMPLEMENT';

export interface EscoSkillEdge {
  from: string;
  to: string;
  relation: EscoRelationType;
  weight: number;
  source?: 'esco' | 'custom';
  note?: string;
}

export function makeSubstitute(
  a: string,
  b: string,
  weightAtoB: number = DEFAULT_WEIGHTS.SUBSTITUTE,
  weightBtoA = weightAtoB,
  note?: string,
): EscoSkillEdge[] {
  return [
    { from: a, to: b, relation: 'SUBSTITUTE', weight: weightAtoB, source: 'custom', ...(note ? { note } : {}) },
    { from: b, to: a, relation: 'SUBSTITUTE', weight: weightBtoA, source: 'custom', ...(note ? { note } : {}) },
  ];
}

export const WEIGHT_RULES = {
  COMPLEMENT_MAX: 0.4,
  CROSS_SECTOR_MAX: 0.3,
  IMPLIES_MIN: 0.5,
  SUBSTITUTE_MAX: 0.9,
  FOUNDATION_MIN: 0.4,
  FOUNDATION_MAX: 0.7,
} as const;

export const TECHNICAL_SHORT_ALIAS_WHITELIST = new Set(['c#', 'c++', '.net', 'c', 'r']);

export const SECTOR_CLUSTERS: Sector[][] = [
  ['IT', 'Data'],
  ['Legal', 'HR'],
];

export function isCrossSector(sectorA: Sector, sectorB: Sector): boolean {
  if (sectorA === sectorB) return false;
  if (sectorA === 'Common' || sectorB === 'Common') return false;
  for (const cluster of SECTOR_CLUSTERS) {
    if (cluster.includes(sectorA) && cluster.includes(sectorB)) {
      return false;
    }
  }
  return true;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeSkillText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s\.\#\+\&\-\/]/g, ' ')
    .replace(/\.(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function textContainsWord(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  const normH = normalizeSkillText(haystack);
  const normN = normalizeSkillText(needle);
  if (!normH || !normN) return false;

  const escaped = escapeRegex(normN);
  // Word boundary supporting technical characters (#, +, &, -, ., /)
  const regex = new RegExp(`(^|[^a-z0-9#+&/-])${escaped}([^a-z0-9#+&/-]|$)`, 'i');
  return regex.test(normH);
}

export function validateEscoTaxonomy(nodes: EscoSkillNode[], edges: EscoSkillEdge[]): string[] {
  const errors: string[] = [];
  const nodeMap = new Map<string, EscoSkillNode>();
  const duplicateNodes: string[] = [];
  for (const n of nodes) {
    if (nodeMap.has(n.id)) duplicateNodes.push(n.id);
    nodeMap.set(n.id, n);
  }
  if (duplicateNodes.length > 0) {
    errors.push(`Trùng lặp ID node: ${duplicateNodes.join(', ')}`);
  }

  const validTypes = new Set<SkillType>(['skill', 'tool', 'certification', 'language', 'soft_skill', 'domain_knowledge']);
  for (const n of nodes) {
    if (!validTypes.has(n.type)) {
      errors.push(`Node ${n.id} có type không hợp lệ: "${n.type}"`);
    }
    if (!SECTORS.includes(n.sector)) {
      errors.push(`Node ${n.id} có sector không hợp lệ: "${n.sector}"`);
    }
    if (!['esco', 'custom'].includes(n.source)) {
      errors.push(`Node ${n.id} có source không hợp lệ: "${n.source}"`);
    }
  }

  const normalizedNames = new Map<string, string>();
  for (const n of nodes) {
    const norm = normalizeSkillText(n.name);
    normalizedNames.set(norm, n.id);
  }

  const safeAliasMap = new Map<string, string>();
  for (const n of nodes) {
    const seenInNode = new Set<string>();
    for (const a of n.aliases) {
      const clean = a.trim();
      if (clean.length <= 2 && !TECHNICAL_SHORT_ALIAS_WHITELIST.has(clean.toLowerCase())) {
        errors.push(`Node ${n.id} chứa alias an toàn có độ dài <= 2 ký tự: "${clean}". Phải chuyển sang ambiguousAliases.`);
      }
      const norm = normalizeSkillText(clean);
      if (seenInNode.has(norm)) continue;
      seenInNode.add(norm);

      if (safeAliasMap.has(norm) && safeAliasMap.get(norm) !== n.id) {
        errors.push(`Alias an toàn bị trùng lặp: "${clean}" (giữa node ${safeAliasMap.get(norm)} và ${n.id})`);
      }
      safeAliasMap.set(norm, n.id);

      if (normalizedNames.has(norm) && normalizedNames.get(norm) !== n.id) {
        errors.push(`Alias an toàn "${clean}" của node ${n.id} trùng với name của node ${normalizedNames.get(norm)}`);
      }
    }
  }

  const connectedNodes = new Set<string>();
  const edgeKeys = new Set<string>();
  const duplicateEdges: string[] = [];
  const selfLoops: string[] = [];
  const missingNodes: string[] = [];
  const invalidWeights: string[] = [];
  const ruleViolations: string[] = [];

  for (const e of edges) {
    if (!nodeMap.has(e.from)) missingNodes.push(`from: ${e.from}`);
    if (!nodeMap.has(e.to)) missingNodes.push(`to: ${e.to}`);
    if (e.from === e.to) selfLoops.push(e.from);
    if (e.weight < 0 || e.weight > 1) invalidWeights.push(`${e.from}->${e.to}: ${e.weight}`);

    const key = `${e.from}__${e.to}__${e.relation}`;
    if (edgeKeys.has(key)) duplicateEdges.push(key);
    edgeKeys.add(key);

    connectedNodes.add(e.from);
    connectedNodes.add(e.to);

    const fromNode = nodeMap.get(e.from);
    const toNode = nodeMap.get(e.to);

    if (e.relation === 'COMPLEMENT' && e.weight > WEIGHT_RULES.COMPLEMENT_MAX) {
      ruleViolations.push(`COMPLEMENT weight vượt quá ${WEIGHT_RULES.COMPLEMENT_MAX}: ${e.from}->${e.to} (${e.weight})`);
    }
    if (e.relation === 'IMPLIES' && e.weight < WEIGHT_RULES.IMPLIES_MIN) {
      ruleViolations.push(`IMPLIES weight nhỏ hơn ${WEIGHT_RULES.IMPLIES_MIN}: ${e.from}->${e.to} (${e.weight})`);
    }
    if (e.relation === 'SUBSTITUTE' && e.weight > WEIGHT_RULES.SUBSTITUTE_MAX) {
      ruleViolations.push(`SUBSTITUTE weight vượt quá ${WEIGHT_RULES.SUBSTITUTE_MAX}: ${e.from}->${e.to} (${e.weight})`);
    }
    if (e.relation === 'FOUNDATION' && (e.weight < WEIGHT_RULES.FOUNDATION_MIN || e.weight > WEIGHT_RULES.FOUNDATION_MAX)) {
      ruleViolations.push(`FOUNDATION weight không nằm trong [${WEIGHT_RULES.FOUNDATION_MIN}, ${WEIGHT_RULES.FOUNDATION_MAX}]: ${e.from}->${e.to} (${e.weight})`);
    }

    if (fromNode && toNode) {
      const cross = isCrossSector(fromNode.sector, toNode.sector);
      if (cross && e.weight > WEIGHT_RULES.CROSS_SECTOR_MAX) {
        ruleViolations.push(`Edge liên sector vượt quá ${WEIGHT_RULES.CROSS_SECTOR_MAX}: ${e.from} (${fromNode.sector}) -> ${e.to} (${toNode.sector}) (${e.weight})`);
      }
    }
  }

  if (missingNodes.length > 0) errors.push(`Node không tồn tại trong edges: ${missingNodes.join(', ')}`);
  if (duplicateEdges.length > 0) errors.push(`Trùng lặp cạnh (from, to, relation): ${duplicateEdges.join(', ')}`);
  if (selfLoops.length > 0) errors.push(`Cạnh self-loop: ${selfLoops.join(', ')}`);
  if (invalidWeights.length > 0) errors.push(`Trọng số không nằm trong [0, 1]: ${invalidWeights.join(', ')}`);
  if (ruleViolations.length > 0) errors.push(`Vi phạm luật trọng số WEIGHT_RULES: ${ruleViolations.join('; ')}`);

  const orphanNodes = nodes.filter((n) => !connectedNodes.has(n.id)).map((n) => n.id);
  if (orphanNodes.length > 0) errors.push(`Node mồ côi (không có cạnh kết nối): ${orphanNodes.join(', ')}`);

  return errors;
}

export function assertEscoTaxonomy(
  nodes: EscoSkillNode[] = ESCO_SKILL_NODES,
  edges: EscoSkillEdge[] = ESCO_SKILL_EDGES,
): void {
  const errors = validateEscoTaxonomy(nodes, edges);
  if (errors.length > 0) {
    throw new Error(`EscoTaxonomy validation failed:\n- ${errors.join('\n- ')}`);
  }
}

export const ESCO_SKILL_NODES: EscoSkillNode[] = [
  {
    "id": "react",
    "name": "React",
    "type": "skill",
    "aliases": [
      "reactjs",
      "react js"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "vue",
    "name": "Vue.js",
    "type": "skill",
    "aliases": [
      "vuejs",
      "vue 3",
      "vue 2"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "angular",
    "name": "Angular",
    "type": "skill",
    "aliases": [
      "angularjs",
      "angular 2+",
      "angular io"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "svelte",
    "name": "Svelte",
    "type": "skill",
    "aliases": [
      "sveltejs",
      "svelte kit"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "nextjs",
    "name": "Next.js",
    "type": "skill",
    "aliases": [
      "nextjs",
      "next js"
    ],
    "ambiguousAliases": [
      {
        "alias": "next",
        "contextHints": [
          "nextjs",
          "react next",
          "ssr next",
          "frontend next"
        ],
        "minHints": 2
      }
    ],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "nuxtjs",
    "name": "Nuxt.js",
    "type": "skill",
    "aliases": [
      "nuxt",
      "nuxtjs",
      "nuxt js"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "typescript",
    "name": "TypeScript",
    "type": "skill",
    "aliases": [
      "typescript lang"
    ],
    "ambiguousAliases": [
      {
        "alias": "ts",
        "contextHints": [
          "typescript",
          "tsc",
          "ts code",
          "ts interface"
        ],
        "minHints": 1
      }
    ],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "javascript",
    "name": "JavaScript",
    "type": "skill",
    "aliases": [
      "javascript lang",
      "ecmascript",
      "es6"
    ],
    "ambiguousAliases": [
      {
        "alias": "js",
        "contextHints": [
          "javascript",
          "vanilla js",
          "es6 js"
        ],
        "minHints": 1
      }
    ],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "html_css",
    "name": "HTML/CSS",
    "type": "skill",
    "aliases": [
      "html5",
      "css3",
      "html css"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "tailwind",
    "name": "Tailwind CSS",
    "type": "tool",
    "aliases": [
      "tailwindcss",
      "tailwind ui"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "bootstrap",
    "name": "Bootstrap",
    "type": "tool",
    "aliases": [
      "bootstrap 5",
      "bootstrap 4"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "redux",
    "name": "Redux",
    "type": "tool",
    "aliases": [
      "redux toolkit",
      "redux saga"
    ],
    "ambiguousAliases": [
      {
        "alias": "rtk",
        "contextHints": [
          "redux",
          "react redux",
          "state management",
          "toolkit"
        ],
        "minHints": 1
      }
    ],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "vite",
    "name": "Vite",
    "type": "tool",
    "aliases": [
      "vitejs",
      "vite build"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "webpack",
    "name": "Webpack",
    "type": "tool",
    "aliases": [
      "webpack bundler"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "source": "custom"
  },
  {
    "id": "react_native",
    "name": "React Native",
    "type": "skill",
    "aliases": [
      "react-native"
    ],
    "ambiguousAliases": [
      {
        "alias": "rn",
        "contextHints": [
          "react native",
          "cross platform mobile",
          "react mobile"
        ],
        "minHints": 1
      }
    ],
    "sector": "IT",
    "category": "Mobile",
    "source": "custom"
  },
  {
    "id": "flutter",
    "name": "Flutter",
    "type": "skill",
    "aliases": [
      "flutter framework"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Mobile",
    "source": "custom"
  },
  {
    "id": "dart",
    "name": "Dart",
    "type": "skill",
    "aliases": [
      "dart lang"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Mobile",
    "source": "custom"
  },
  {
    "id": "swift",
    "name": "Swift",
    "type": "skill",
    "aliases": [
      "swift lang",
      "swiftui",
      "objective-c"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Mobile",
    "source": "custom"
  },
  {
    "id": "kotlin",
    "name": "Kotlin",
    "type": "skill",
    "aliases": [
      "kotlin lang",
      "jetpack compose"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Mobile",
    "source": "custom"
  },
  {
    "id": "ios_development",
    "name": "iOS Development",
    "type": "skill",
    "aliases": [
      "lập trình ios",
      "phát triển ứng dụng ios",
      "ios developer",
      "xcode"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Mobile",
    "source": "custom"
  },
  {
    "id": "android_development",
    "name": "Android Development",
    "type": "skill",
    "aliases": [
      "lập trình android",
      "phát triển ứng dụng android",
      "android sdk",
      "android developer"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Mobile",
    "source": "custom"
  },
  {
    "id": "ionic",
    "name": "Ionic",
    "type": "tool",
    "aliases": [
      "ionic framework",
      "capacitor",
      "cordova"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Mobile",
    "source": "custom"
  },
  {
    "id": "nodejs",
    "name": "Node.js",
    "type": "skill",
    "aliases": [
      "nodejs",
      "node js"
    ],
    "ambiguousAliases": [
      {
        "alias": "node",
        "contextHints": [
          "nodejs",
          "node.js",
          "npm",
          "backend node"
        ],
        "minHints": 1
      }
    ],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "nestjs",
    "name": "NestJS",
    "type": "skill",
    "aliases": [
      "nest.js",
      "nest js",
      "nestjs framework"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "expressjs",
    "name": "Express.js",
    "type": "skill",
    "aliases": [
      "expressjs",
      "express framework"
    ],
    "ambiguousAliases": [
      {
        "alias": "express",
        "contextHints": [
          "expressjs",
          "node express",
          "middleware express"
        ],
        "minHints": 1
      }
    ],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "python",
    "name": "Python",
    "type": "skill",
    "aliases": [
      "python 3",
      "python3"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "esco",
    "escoUri": "http://data.europa.eu/esco/skill/ccd0a1d9-afda-43d9-b901-96344886e14d",
    "confidence": 0.95
  },
  {
    "id": "django",
    "name": "Django",
    "type": "skill",
    "aliases": [
      "django framework",
      "django rest framework",
      "drf"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "fastapi",
    "name": "FastAPI",
    "type": "skill",
    "aliases": [
      "fast api",
      "fastapi framework"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "flask",
    "name": "Flask",
    "type": "skill",
    "aliases": [
      "flask framework",
      "flask api",
      "flask web"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "java",
    "name": "Java",
    "type": "skill",
    "aliases": [
      "java core",
      "java 8",
      "java 11",
      "java 17",
      "java 21",
      "jvm"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "spring_boot",
    "name": "Spring Boot",
    "type": "skill",
    "aliases": [
      "springboot",
      "spring framework"
    ],
    "ambiguousAliases": [
      {
        "alias": "spring",
        "contextHints": [
          "java",
          "spring boot",
          "backend",
          "microservices"
        ],
        "minHints": 1
      }
    ],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "csharp_net",
    "name": "C# / .NET",
    "type": "skill",
    "aliases": [
      "c#",
      ".net",
      "c-sharp",
      "c sharp",
      ".net core",
      "asp.net",
      "dotnet"
    ],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "golang",
    "name": "Go (Golang)",
    "type": "skill",
    "aliases": [
      "golang",
      "go lang"
    ],
    "ambiguousAliases": [
      {
        "alias": "go",
        "contextHints": [
          "goroutine",
          "goroutines",
          "gin",
          "fiber",
          "golang",
          "backend go"
        ],
        "minHints": 2
      }
    ],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "php",
    "name": "PHP",
    "type": "skill",
    "aliases": [
      "php 8",
      "php 7"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "laravel",
    "name": "Laravel",
    "type": "skill",
    "aliases": [
      "laravel framework"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "grpc",
    "name": "gRPC",
    "type": "skill",
    "aliases": [
      "protobuf",
      "protocol buffers"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "microservices",
    "name": "Microservices",
    "type": "domain_knowledge",
    "aliases": [
      "kiến trúc vi dịch vụ",
      "microservice architecture"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "rest_api",
    "name": "REST API",
    "type": "skill",
    "aliases": [
      "restful api",
      "restful web services",
      "rest api design"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "graphql",
    "name": "GraphQL",
    "type": "skill",
    "aliases": [
      "graphql api",
      "apollo graphql"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Backend",
    "source": "custom"
  },
  {
    "id": "postgresql",
    "name": "PostgreSQL",
    "type": "skill",
    "aliases": [
      "postgres",
      "pgsql"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "mysql",
    "name": "MySQL",
    "type": "skill",
    "aliases": [
      "mariadb"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "sql_server",
    "name": "SQL Server",
    "type": "skill",
    "aliases": [
      "mssql",
      "ms sql",
      "microsoft sql server"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "oracle_db",
    "name": "Oracle Database",
    "type": "skill",
    "aliases": [
      "oracle rdbms",
      "pl/sql"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "mongodb",
    "name": "MongoDB",
    "type": "skill",
    "aliases": [
      "mongo",
      "nosql mongodb"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "redis",
    "name": "Redis",
    "type": "tool",
    "aliases": [
      "redis cache",
      "in-memory redis"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "memcached",
    "name": "Memcached",
    "type": "tool",
    "aliases": [
      "memcache"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "elasticsearch",
    "name": "Elasticsearch",
    "type": "tool",
    "aliases": [
      "elastic search",
      "elk stack",
      "opensearch"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "kafka",
    "name": "Apache Kafka",
    "type": "tool",
    "aliases": [
      "message queue kafka",
      "event streaming kafka"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "rabbitmq",
    "name": "RabbitMQ",
    "type": "tool",
    "aliases": [
      "amqp rabbitmq",
      "rabbitmq queue"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Database",
    "source": "custom"
  },
  {
    "id": "docker",
    "name": "Docker",
    "type": "tool",
    "aliases": [
      "docker container",
      "containerization"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "podman",
    "name": "Podman",
    "type": "tool",
    "aliases": [
      "podman container"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "kubernetes",
    "name": "Kubernetes",
    "type": "tool",
    "aliases": [
      "k8s",
      "kube"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "aws",
    "name": "Amazon Web Services (AWS)",
    "type": "tool",
    "aliases": [
      "aws cloud",
      "amazon cloud"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Cloud",
    "source": "custom"
  },
  {
    "id": "gcp",
    "name": "Google Cloud Platform (GCP)",
    "type": "tool",
    "aliases": [
      "google cloud platform",
      "google cloud"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Cloud",
    "source": "custom"
  },
  {
    "id": "azure",
    "name": "Microsoft Azure",
    "type": "tool",
    "aliases": [
      "azure cloud",
      "ms azure"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Cloud",
    "source": "custom"
  },
  {
    "id": "cicd",
    "name": "CI/CD",
    "type": "domain_knowledge",
    "aliases": [
      "ci/cd",
      "ci cd",
      "ci-cd",
      "continuous integration",
      "continuous deployment"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "github_actions",
    "name": "GitHub Actions",
    "type": "tool",
    "aliases": [
      "gh actions"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "gitlab_ci",
    "name": "GitLab CI",
    "type": "tool",
    "aliases": [
      "gitlab ci/cd"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "jenkins",
    "name": "Jenkins",
    "type": "tool",
    "aliases": [
      "jenkins ci"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "linux",
    "name": "Linux System",
    "type": "skill",
    "aliases": [
      "ubuntu",
      "centos",
      "bash shell"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "nginx",
    "name": "Nginx",
    "type": "tool",
    "aliases": [
      "nginx reverse proxy",
      "web server nginx"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "terraform",
    "name": "Terraform",
    "type": "tool",
    "aliases": [
      "iac terraform",
      "infrastructure as code"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "ansible",
    "name": "Ansible",
    "type": "tool",
    "aliases": [
      "ansible automation"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "prometheus_grafana",
    "name": "Prometheus & Grafana",
    "type": "tool",
    "aliases": [
      "prometheus",
      "grafana",
      "monitoring prometheus"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "git_vcs",
    "name": "Git",
    "type": "tool",
    "aliases": [
      "git version control",
      "github",
      "gitlab",
      "git flow"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "DevOps",
    "source": "custom"
  },
  {
    "id": "software_testing",
    "name": "Kiểm thử phần mềm (QA/QC)",
    "type": "skill",
    "aliases": [
      "software testing",
      "manual testing",
      "kiem thu phan mem"
    ],
    "ambiguousAliases": [
      {
        "alias": "qa",
        "contextHints": [
          "test case",
          "manual test",
          "automation test",
          "bug tracking",
          "software test"
        ],
        "minHints": 1
      }
    ],
    "sector": "IT",
    "category": "QA",
    "source": "custom"
  },
  {
    "id": "automation_testing",
    "name": "Kiểm thử tự động (Automation Test)",
    "type": "skill",
    "aliases": [
      "automation testing",
      "automated test"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "QA",
    "source": "custom"
  },
  {
    "id": "selenium",
    "name": "Selenium",
    "type": "tool",
    "aliases": [
      "selenium webdriver"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "QA",
    "source": "custom"
  },
  {
    "id": "cypress",
    "name": "Cypress",
    "type": "tool",
    "aliases": [
      "cypress io",
      "cypress e2e"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "QA",
    "source": "custom"
  },
  {
    "id": "playwright",
    "name": "Playwright",
    "type": "tool",
    "aliases": [
      "playwright test"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "QA",
    "source": "custom"
  },
  {
    "id": "jest_testing",
    "name": "Jest",
    "type": "tool",
    "aliases": [
      "jest test",
      "unit test jest"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "QA",
    "source": "custom"
  },
  {
    "id": "machine_learning",
    "name": "Machine Learning",
    "type": "skill",
    "aliases": [
      "học máy",
      "machine learning model"
    ],
    "ambiguousAliases": [
      {
        "alias": "ml",
        "contextHints": [
          "machine learning",
          "scikit learn",
          "model training",
          "supervised learning"
        ],
        "minHints": 1
      }
    ],
    "sector": "Data",
    "category": "AI",
    "source": "custom"
  },
  {
    "id": "deep_learning",
    "name": "Deep Learning",
    "type": "skill",
    "aliases": [
      "học sâu",
      "neural networks"
    ],
    "ambiguousAliases": [
      {
        "alias": "dl",
        "contextHints": [
          "deep learning",
          "neural networks",
          "pytorch",
          "tensorflow",
          "cnn rnn"
        ],
        "minHints": 1
      }
    ],
    "sector": "Data",
    "category": "AI",
    "source": "custom"
  },
  {
    "id": "pytorch",
    "name": "PyTorch",
    "type": "skill",
    "aliases": [
      "torch"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "AI",
    "source": "custom"
  },
  {
    "id": "tensorflow",
    "name": "TensorFlow",
    "type": "skill",
    "aliases": [
      "keras"
    ],
    "ambiguousAliases": [
      {
        "alias": "tf",
        "contextHints": [
          "tensorflow",
          "keras tf",
          "deep learning tf"
        ],
        "minHints": 1
      }
    ],
    "sector": "Data",
    "category": "AI",
    "source": "custom"
  },
  {
    "id": "scikit_learn",
    "name": "Scikit-Learn",
    "type": "tool",
    "aliases": [
      "sklearn"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "AI",
    "source": "custom"
  },
  {
    "id": "data_analysis",
    "name": "Phân tích dữ liệu (Data Analysis)",
    "type": "skill",
    "aliases": [
      "data analytics",
      "phan tich du lieu"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "Analytics",
    "source": "custom"
  },
  {
    "id": "pandas_lib",
    "name": "Pandas",
    "type": "tool",
    "aliases": [
      "pandas dataframe",
      "pandas library"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "Analytics",
    "source": "custom"
  },
  {
    "id": "numpy_lib",
    "name": "NumPy",
    "type": "tool",
    "aliases": [
      "numpy array",
      "numpy library"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "Analytics",
    "source": "custom"
  },
  {
    "id": "sql_analytics",
    "name": "SQL for Analytics",
    "type": "skill",
    "aliases": [
      "data querying sql",
      "sql analytics"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "Analytics",
    "source": "custom"
  },
  {
    "id": "power_bi",
    "name": "Power BI",
    "type": "tool",
    "aliases": [
      "powerbi",
      "ms power bi"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "BI",
    "source": "custom"
  },
  {
    "id": "tableau",
    "name": "Tableau",
    "type": "tool",
    "aliases": [
      "tableau desktop"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "BI",
    "source": "custom"
  },
  {
    "id": "llm_prompting",
    "name": "Generative AI & LLM",
    "type": "skill",
    "aliases": [
      "prompt engineering",
      "large language models",
      "chatgpt api"
    ],
    "ambiguousAliases": [
      {
        "alias": "rag",
        "contextHints": [
          "retrieval augmented",
          "vector database",
          "langchain",
          "llamaindex"
        ],
        "minHints": 2
      }
    ],
    "sector": "Data",
    "category": "AI",
    "source": "custom"
  },
  {
    "id": "nlp",
    "name": "Xử lý ngôn ngữ tự nhiên (NLP)",
    "type": "skill",
    "aliases": [
      "natural language processing",
      "xu ly ngon ngu tu nhien",
      "text mining"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "AI",
    "source": "custom"
  },
  {
    "id": "computer_vision",
    "name": "Thị giác máy tính (Computer Vision)",
    "type": "skill",
    "aliases": [
      "opencv",
      "image processing",
      "nhận diện hình ảnh"
    ],
    "ambiguousAliases": [],
    "sector": "Data",
    "category": "AI",
    "source": "custom"
  },
  {
    "id": "accounting_general",
    "name": "Kế toán tổng hợp",
    "type": "skill",
    "aliases": [
      "general accounting",
      "ke toan tong hop"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Accounting",
    "source": "custom"
  },
  {
    "id": "tax_accounting",
    "name": "Kế toán thuế",
    "type": "skill",
    "aliases": [
      "tax accounting",
      "khai bao thue",
      "bao cao thue",
      "quyết toán thuế"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Accounting",
    "source": "custom"
  },
  {
    "id": "financial_reporting",
    "name": "Lập báo cáo tài chính",
    "type": "skill",
    "aliases": [
      "financial reporting",
      "lap bao cao tai chinh",
      "bctc"
    ],
    "ambiguousAliases": [
      {
        "alias": "report",
        "contextHints": [
          "báo cáo tài chính",
          "bctc",
          "kế toán",
          "quyết toán tài chính",
          "bảng cân đối"
        ],
        "minHints": 1
      }
    ],
    "sector": "Finance",
    "category": "Accounting",
    "source": "custom"
  },
  {
    "id": "receivable_accounting",
    "name": "Kế toán công nợ",
    "type": "skill",
    "aliases": [
      "accounts receivable",
      "accounts payable",
      "ke toan cong no",
      "theo dõi công nợ"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Accounting",
    "source": "custom"
  },
  {
    "id": "inventory_accounting",
    "name": "Kế toán kho",
    "type": "skill",
    "aliases": [
      "inventory accounting",
      "ke toan kho",
      "tính giá thành",
      "xuất nhập tồn"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Accounting",
    "source": "custom"
  },
  {
    "id": "payroll_accounting",
    "name": "Kế toán tiền lương",
    "type": "skill",
    "aliases": [
      "payroll accounting",
      "ke toan tien luong",
      "bảng lương"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Accounting",
    "source": "custom"
  },
  {
    "id": "internal_audit",
    "name": "Kiểm toán nội bộ",
    "type": "skill",
    "aliases": [
      "internal audit",
      "kiem toan noi bo",
      "kiểm soát nội bộ"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Audit",
    "source": "custom"
  },
  {
    "id": "external_audit",
    "name": "Kiểm toán độc lập",
    "type": "skill",
    "aliases": [
      "kiểm toán",
      "kiem toan",
      "audit",
      "external audit",
      "kiem toan doc lap",
      "big 4 audit"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Audit",
    "source": "custom"
  },
  {
    "id": "vas_standards",
    "name": "Chuẩn mực kế toán Việt Nam (VAS)",
    "type": "domain_knowledge",
    "aliases": [
      "chuẩn mực vas",
      "vietnam accounting standards"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Standards",
    "source": "custom"
  },
  {
    "id": "ifrs_standards",
    "name": "Chuẩn mực báo cáo tài chính quốc tế (IFRS)",
    "type": "domain_knowledge",
    "aliases": [
      "chuẩn mực ifrs",
      "international financial reporting standards"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Standards",
    "source": "custom"
  },
  {
    "id": "budget_management",
    "name": "Quản lý ngân sách",
    "type": "skill",
    "aliases": [
      "budgeting",
      "budget management",
      "lập ngân sách",
      "quan ly ngan sach"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "CorporateFinance",
    "source": "custom"
  },
  {
    "id": "cash_flow_management",
    "name": "Quản lý dòng tiền",
    "type": "skill",
    "aliases": [
      "cash flow management",
      "dòng tiền doanh nghiệp",
      "dự báo dòng tiền"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "CorporateFinance",
    "source": "custom"
  },
  {
    "id": "financial_analysis",
    "name": "Phân tích tài chính",
    "type": "skill",
    "aliases": [
      "financial analysis",
      "phan tich tai chinh",
      "thẩm định tài chính"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Analysis",
    "source": "custom"
  },
  {
    "id": "financial_valuation",
    "name": "Định giá tài chính (Financial Valuation)",
    "type": "skill",
    "aliases": [
      "financial valuation",
      "định giá doanh nghiệp",
      "dcf valuation"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Analysis",
    "source": "custom"
  },
  {
    "id": "excel_advanced",
    "name": "Excel nâng cao",
    "type": "tool",
    "aliases": [
      "advanced excel",
      "excel vba",
      "pivot table",
      "hàm excel phức tạp"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Tools",
    "source": "custom"
  },
  {
    "id": "misa_software",
    "name": "Phần mềm kế toán MISA",
    "type": "tool",
    "aliases": [
      "misa",
      "phần mềm misa",
      "misa sme",
      "misa ams"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Software",
    "source": "custom"
  },
  {
    "id": "fast_software",
    "name": "Phần mềm kế toán FAST",
    "type": "tool",
    "aliases": [
      "phần mềm fast",
      "fast accounting",
      "fast financial"
    ],
    "ambiguousAliases": [
      {
        "alias": "fast",
        "contextHints": [
          "kế toán",
          "phần mềm kế toán",
          "erp",
          "sổ sách",
          "hóa đơn",
          "misa"
        ],
        "minHints": 1
      }
    ],
    "sector": "Finance",
    "category": "Software",
    "source": "custom"
  },
  {
    "id": "bravo_software",
    "name": "Phần mềm Bravo",
    "type": "tool",
    "aliases": [
      "bravo accounting",
      "phần mềm bravo",
      "bravo erp"
    ],
    "ambiguousAliases": [
      {
        "alias": "bravo",
        "contextHints": [
          "kế toán",
          "phần mềm kế toán",
          "erp",
          "sổ sách",
          "hóa đơn",
          "misa"
        ],
        "minHints": 1
      }
    ],
    "sector": "Finance",
    "category": "Software",
    "source": "custom"
  },
  {
    "id": "sap_erp",
    "name": "SAP ERP",
    "type": "tool",
    "aliases": [
      "sap fi",
      "sap co",
      "sap s/4hana"
    ],
    "ambiguousAliases": [
      {
        "alias": "sap",
        "contextHints": [
          "erp",
          "hệ thống quản trị",
          "s4hana",
          "doanh nghiệp",
          "kế toán",
          "vận hành"
        ],
        "minHints": 1
      }
    ],
    "sector": "Finance",
    "category": "Software",
    "source": "custom"
  },
  {
    "id": "acca_cert",
    "name": "Chứng chỉ ACCA",
    "type": "certification",
    "aliases": [
      "chứng chỉ acca",
      "acca qualification"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Certifications",
    "source": "custom"
  },
  {
    "id": "cpa_cert",
    "name": "Chứng chỉ CPA",
    "type": "certification",
    "aliases": [
      "chứng chỉ cpa",
      "cpa vietnam",
      "cpa úc"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Certifications",
    "source": "custom"
  },
  {
    "id": "cfa_cert",
    "name": "Chứng chỉ CFA",
    "type": "certification",
    "aliases": [
      "chứng chỉ cfa",
      "cfa charterholder"
    ],
    "ambiguousAliases": [],
    "sector": "Finance",
    "category": "Certifications",
    "source": "custom"
  },
  {
    "id": "digital_marketing",
    "name": "Digital Marketing",
    "type": "skill",
    "aliases": [
      "tiếp thị số",
      "marketing online"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "General",
    "source": "custom"
  },
  {
    "id": "brand_marketing",
    "name": "Brand Marketing",
    "type": "skill",
    "aliases": [
      "quản trị thương hiệu",
      "phát triển thương hiệu",
      "brand management"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "Branding",
    "source": "custom"
  },
  {
    "id": "performance_marketing",
    "name": "Performance Marketing",
    "type": "skill",
    "aliases": [
      "tiếp thị hiệu suất",
      "chạy performance",
      "roi marketing"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "Advertising",
    "source": "custom"
  },
  {
    "id": "seo",
    "name": "SEO (Search Engine Optimization)",
    "type": "skill",
    "aliases": [
      "tối ưu hóa công cụ tìm kiếm",
      "seo onpage",
      "seo offpage"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "SEO",
    "source": "custom"
  },
  {
    "id": "google_ads",
    "name": "Google Ads",
    "type": "tool",
    "aliases": [
      "google adwords",
      "quảng cáo google",
      "sem google"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "Advertising",
    "source": "custom"
  },
  {
    "id": "meta_ads",
    "name": "Facebook & Meta Ads",
    "type": "tool",
    "aliases": [
      "facebook ads",
      "quảng cáo facebook",
      "quảng cáo meta"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "Advertising",
    "source": "custom"
  },
  {
    "id": "content_marketing",
    "name": "Content Marketing",
    "type": "skill",
    "aliases": [
      "sáng tạo nội dung",
      "content creator"
    ],
    "ambiguousAliases": [
      {
        "alias": "content",
        "contextHints": [
          "content creator",
          "sáng tạo nội dung",
          "social content"
        ],
        "minHints": 2
      }
    ],
    "sector": "Marketing",
    "category": "Content",
    "source": "custom"
  },
  {
    "id": "email_marketing",
    "name": "Email Marketing",
    "type": "skill",
    "aliases": [
      "tiếp thị qua email",
      "mailchimp",
      "newsletter"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "Content",
    "source": "custom"
  },
  {
    "id": "social_media_marketing",
    "name": "Social Media Marketing",
    "type": "skill",
    "aliases": [
      "quản trị mạng xã hội",
      "tiktok marketing",
      "facebook marketing",
      "zalo marketing"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "Social",
    "source": "custom"
  },
  {
    "id": "ga4_analytics",
    "name": "Google Analytics (GA4)",
    "type": "tool",
    "aliases": [
      "ga4",
      "google analytics",
      "đo lường website"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "Analytics",
    "source": "custom"
  },
  {
    "id": "b2b_sales",
    "name": "Bán hàng B2B (B2B Sales)",
    "type": "skill",
    "aliases": [
      "bán hàng doanh nghiệp",
      "kinh doanh b2b",
      "corporate sales"
    ],
    "ambiguousAliases": [
      {
        "alias": "sales",
        "contextHints": [
          "b2b sales",
          "doanh số bán hàng",
          "chốt deal sales",
          "pipeline sales"
        ],
        "minHints": 2
      }
    ],
    "sector": "Sales",
    "category": "Sales",
    "source": "custom"
  },
  {
    "id": "telesales",
    "name": "Telesales",
    "type": "skill",
    "aliases": [
      "bán hàng qua điện thoại",
      "telemarketing",
      "tư vấn qua điện thoại"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "Sales",
    "source": "custom"
  },
  {
    "id": "retail_sales",
    "name": "Bán hàng bán lẻ (Retail Sales)",
    "type": "skill",
    "aliases": [
      "bán lẻ",
      "tư vấn bán hàng",
      "bán lẻ showroom"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "Sales",
    "source": "custom"
  },
  {
    "id": "sales_negotiation",
    "name": "Đàm phán thương mại",
    "type": "skill",
    "aliases": [
      "đàm phán bán hàng",
      "commercial negotiation",
      "chốt hợp đồng"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "Negotiation",
    "source": "custom"
  },
  {
    "id": "key_account_management",
    "name": "Quản trị khách hàng trọng điểm (KAM)",
    "type": "skill",
    "aliases": [
      "key account manager",
      "quan ly khach hang lon",
      "kam"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "AccountManagement",
    "source": "custom"
  },
  {
    "id": "distribution_channel",
    "name": "Quản lý kênh phân phối",
    "type": "skill",
    "aliases": [
      "channel management",
      "phát triển đại lý",
      "kenh gt mt"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "Distribution",
    "source": "custom"
  },
  {
    "id": "crm",
    "name": "Quản trị quan hệ khách hàng (CRM)",
    "type": "skill",
    "aliases": [
      "customer relationship management",
      "he thong crm"
    ],
    "ambiguousAliases": [
      {
        "alias": "crm",
        "contextHints": [
          "crm system",
          "hubspot crm",
          "salesforce crm",
          "lead crm",
          "quản trị crm",
          "salesforce hubspot"
        ],
        "minHints": 1
      }
    ],
    "sector": "Sales",
    "category": "CRM",
    "source": "custom"
  },
  {
    "id": "hubspot_crm",
    "name": "HubSpot CRM",
    "type": "tool",
    "aliases": [
      "hubspot"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "CRM",
    "source": "custom"
  },
  {
    "id": "salesforce_crm",
    "name": "Salesforce CRM",
    "type": "tool",
    "aliases": [
      "salesforce"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "CRM",
    "source": "custom"
  },
  {
    "id": "talent_acquisition",
    "name": "Tuyển dụng nhân sự (Recruitment)",
    "type": "skill",
    "aliases": [
      "recruitment",
      "talent acquisition",
      "săn đầu người",
      "headhunter"
    ],
    "ambiguousAliases": [
      {
        "alias": "sourcing",
        "contextHints": [
          "ứng viên",
          "recruitment",
          "tuyển dụng",
          "headhunter",
          "nhân sự"
        ],
        "minHints": 1
      },
      {
        "alias": "hr",
        "contextHints": [
          "human resources",
          "tuyển dụng nhân sự",
          "chính sách nhân sự"
        ],
        "minHints": 1
      }
    ],
    "sector": "HR",
    "category": "Recruitment",
    "source": "custom"
  },
  {
    "id": "onboarding_hr",
    "name": "Tiếp nhận nhân sự mới (Onboarding)",
    "type": "skill",
    "aliases": [
      "onboarding process",
      "hòa nhập nhân viên mới"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Recruitment",
    "source": "custom"
  },
  {
    "id": "training_development",
    "name": "Đào tạo & Phát triển (L&D)",
    "type": "skill",
    "aliases": [
      "l&d",
      "learning and development",
      "đào tạo nội bộ"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Development",
    "source": "custom"
  },
  {
    "id": "labor_relations",
    "name": "Quan hệ lao động",
    "type": "skill",
    "aliases": [
      "labor relations",
      "giai quyet tranh chap lao dong",
      "kỷ luật lao động"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Relations",
    "source": "custom"
  },
  {
    "id": "labor_law",
    "name": "Luật lao động Việt Nam",
    "type": "domain_knowledge",
    "aliases": [
      "vietnam labor code",
      "bộ luật lao động",
      "pháp luật lao động"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Compliance",
    "source": "custom"
  },
  {
    "id": "social_insurance",
    "name": "Bảo hiểm xã hội & Phúc lợi (BHXH)",
    "type": "domain_knowledge",
    "aliases": [
      "chế độ bhxh",
      "bảo hiểm y tế",
      "bảo hiểm thất nghiệp"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Compensation",
    "source": "custom"
  },
  {
    "id": "performance_appraisal",
    "name": "Đánh giá hiệu suất nhân sự",
    "type": "skill",
    "aliases": [
      "performance appraisal",
      "đánh giá kpi",
      "kpi/okr",
      "quản trị hiệu suất"
    ],
    "ambiguousAliases": [
      {
        "alias": "kpi",
        "contextHints": [
          "chỉ số kpi",
          "kpi okr",
          "đánh giá kpi",
          "hiệu suất kpi"
        ],
        "minHints": 1
      }
    ],
    "sector": "HR",
    "category": "Performance",
    "source": "custom"
  },
  {
    "id": "employer_branding",
    "name": "Thương hiệu nhà tuyển dụng",
    "type": "skill",
    "aliases": [
      "employer branding",
      "quảng bá môi trường làm việc"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Branding",
    "source": "custom"
  },
  {
    "id": "cb_management",
    "name": "Chế độ & Lương thưởng (C&B)",
    "type": "skill",
    "aliases": [
      "c&b",
      "c & b",
      "compensation and benefits",
      "tính lương thưởng",
      "chế độ c&b"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Compensation",
    "source": "custom"
  },
  {
    "id": "hris_system",
    "name": "Hệ thống thông tin nhân sự (HRIS)",
    "type": "tool",
    "aliases": [
      "hris",
      "phần mềm quản trị nhân sự",
      "base hrm"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Tools",
    "source": "custom"
  },
  {
    "id": "ui_ux_design",
    "name": "Thiết kế UI/UX",
    "type": "skill",
    "aliases": [
      "ui/ux design",
      "user interface design",
      "user experience design",
      "product design"
    ],
    "ambiguousAliases": [
      {
        "alias": "design",
        "contextHints": [
          "ui/ux",
          "figma",
          "prototype",
          "wireframe",
          "user interface"
        ],
        "minHints": 2
      }
    ],
    "sector": "Design",
    "category": "UI/UX",
    "source": "custom"
  },
  {
    "id": "figma",
    "name": "Figma",
    "type": "tool",
    "aliases": [
      "figma design",
      "figma tool",
      "figma prototype"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "UI/UX",
    "source": "custom"
  },
  {
    "id": "adobe_xd",
    "name": "Adobe XD",
    "type": "tool",
    "aliases": [
      "adobe xd prototype"
    ],
    "ambiguousAliases": [
      {
        "alias": "xd",
        "contextHints": [
          "adobe xd",
          "xd prototype",
          "ui xd"
        ],
        "minHints": 1
      }
    ],
    "sector": "Design",
    "category": "UI/UX",
    "source": "custom"
  },
  {
    "id": "photoshop",
    "name": "Adobe Photoshop",
    "type": "tool",
    "aliases": [
      "photoshop design",
      "chỉnh sửa ảnh photoshop"
    ],
    "ambiguousAliases": [
      {
        "alias": "ps",
        "contextHints": [
          "adobe",
          "design",
          "thiết kế",
          "retouch",
          "illustrator",
          "đồ họa"
        ],
        "minHints": 1
      },
      {
        "alias": "pts",
        "contextHints": [
          "photoshop pts",
          "chỉnh sửa pts"
        ],
        "minHints": 1
      }
    ],
    "sector": "Design",
    "category": "Graphic",
    "source": "custom"
  },
  {
    "id": "illustrator",
    "name": "Adobe Illustrator",
    "type": "tool",
    "aliases": [
      "adobe illustrator",
      "illustrator vector",
      "ai vector"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "Graphic",
    "source": "custom"
  },
  {
    "id": "graphic_design",
    "name": "Thiết kế đồ họa",
    "type": "skill",
    "aliases": [
      "graphic design",
      "thiết kế banner",
      "ấn phẩm truyền thông"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "Graphic",
    "source": "custom"
  },
  {
    "id": "premiere_pro",
    "name": "Adobe Premiere Pro",
    "type": "tool",
    "aliases": [
      "premiere",
      "adobe premiere",
      "dựng phim premiere"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "Video",
    "source": "custom"
  },
  {
    "id": "after_effects",
    "name": "Adobe After Effects",
    "type": "tool",
    "aliases": [
      "after effects",
      "adobe ae",
      "kỹ xảo after effects"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "Video",
    "source": "custom"
  },
  {
    "id": "davinci_resolve",
    "name": "DaVinci Resolve",
    "type": "tool",
    "aliases": [
      "davinci",
      "chỉnh màu davinci"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "Video",
    "source": "custom"
  },
  {
    "id": "motion_graphics",
    "name": "Motion Graphics",
    "type": "skill",
    "aliases": [
      "đồ họa chuyển động",
      "motion design"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "Video",
    "source": "custom"
  },
  {
    "id": "blender_3d",
    "name": "Blender & 3D Modeling",
    "type": "tool",
    "aliases": [
      "blender",
      "dựng hình 3d",
      "3d modeling",
      "maya 3d"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "3D",
    "source": "custom"
  },
  {
    "id": "typography",
    "name": "Typography",
    "type": "skill",
    "aliases": [
      "nghệ thuật chữ",
      "bố cục chữ"
    ],
    "ambiguousAliases": [],
    "sector": "Design",
    "category": "Graphic",
    "source": "custom"
  },
  {
    "id": "warehouse_management",
    "name": "Quản lý kho bãi (Warehouse Management)",
    "type": "skill",
    "aliases": [
      "warehouse management",
      "quan ly kho",
      "wms kho bãi"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Logistics",
    "source": "custom"
  },
  {
    "id": "supply_chain_management",
    "name": "Quản lý chuỗi cung ứng (SCM)",
    "type": "skill",
    "aliases": [
      "supply chain management",
      "chuỗi cung ứng scm"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Logistics",
    "source": "custom"
  },
  {
    "id": "procurement",
    "name": "Thu mua & Mua hàng (Procurement)",
    "type": "skill",
    "aliases": [
      "mua hàng",
      "purchasing",
      "mua hàng doanh nghiệp"
    ],
    "ambiguousAliases": [
      {
        "alias": "sourcing",
        "contextHints": [
          "nhà cung cấp",
          "mua hàng",
          "vật tư",
          "báo giá",
          "vendor",
          "đấu thầu"
        ],
        "minHints": 1
      }
    ],
    "sector": "Operations",
    "category": "Procurement",
    "source": "custom"
  },
  {
    "id": "import_export",
    "name": "Xuất nhập khẩu (Import - Export)",
    "type": "skill",
    "aliases": [
      "xuat nhap khau",
      "thủ tục xnk",
      "giao nhận quốc tế"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Trade",
    "source": "custom"
  },
  {
    "id": "customs_clearance",
    "name": "Khai báo hải quan",
    "type": "domain_knowledge",
    "aliases": [
      "customs clearance",
      "khai hải quan",
      "thủ tục hải quan"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Trade",
    "source": "custom"
  },
  {
    "id": "incoterms",
    "name": "Điều kiện thương mại quốc tế (Incoterms)",
    "type": "domain_knowledge",
    "aliases": [
      "incoterms 2020",
      "fob cif incoterms"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Trade",
    "source": "custom"
  },
  {
    "id": "transportation_management",
    "name": "Quản lý vận tải (TMS)",
    "type": "skill",
    "aliases": [
      "transportation management",
      "điều vận",
      "giao nhận vận tải"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Logistics",
    "source": "custom"
  },
  {
    "id": "logistics_coordination",
    "name": "Điều phối vận chuyển (Logistics Coordinator)",
    "type": "skill",
    "aliases": [
      "dieu phoi van tai",
      "logistics coordinator"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Logistics",
    "source": "custom"
  },
  {
    "id": "production_planning",
    "name": "Lập kế hoạch sản xuất (MRP)",
    "type": "skill",
    "aliases": [
      "production planning",
      "kế hoạch sản xuất",
      "điều độ sản xuất"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Manufacturing",
    "source": "custom"
  },
  {
    "id": "inventory_control",
    "name": "Kiểm soát tồn kho",
    "type": "skill",
    "aliases": [
      "inventory control",
      "quản trị tồn kho",
      "tối ưu tồn kho"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Logistics",
    "source": "custom"
  },
  {
    "id": "clinical_nursing",
    "name": "Điều dưỡng lâm sàng",
    "type": "skill",
    "aliases": [
      "dieu duong lam sang",
      "chăm sóc bệnh nhân lâm sàng",
      "nursing care"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Nursing",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "patient_care",
    "name": "Chăm sóc bệnh nhân",
    "type": "skill",
    "aliases": [
      "cham soc benh nhan",
      "patient care"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Nursing",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "medical_diagnosis",
    "name": "Chẩn đoán lâm sàng",
    "type": "skill",
    "aliases": [
      "chan doan lam sang",
      "khám chữa bệnh"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Medical",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "pharmacology",
    "name": "Dược lý & Tư vấn sử dụng thuốc",
    "type": "domain_knowledge",
    "aliases": [
      "duoc ly",
      "tu van thuoc",
      "duoc si"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Pharmacy",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "first_aid_cpr",
    "name": "Sơ cấp cứu & CPR",
    "type": "skill",
    "aliases": [
      "so cap cuu",
      "cpr first aid",
      "first aid"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Emergency",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "customer_service",
    "name": "Chăm sóc khách hàng (Customer Service)",
    "type": "skill",
    "aliases": [
      "cskh",
      "cham soc khach hang",
      "dịch vụ khách hàng"
    ],
    "ambiguousAliases": [
      {
        "alias": "cs",
        "contextHints": [
          "customer service",
          "chăm sóc khách hàng",
          "khiếu nại khách hàng"
        ],
        "minHints": 1
      },
      {
        "alias": "support",
        "contextHints": [
          "hỗ trợ khách hàng",
          "ticket support",
          "cskh support",
          "hỗ trợ kỹ thuật",
          "helpdesk ticket"
        ],
        "minHints": 2
      }
    ],
    "sector": "CustomerService",
    "category": "Support",
    "source": "custom"
  },
  {
    "id": "complaint_handling",
    "name": "Xử lý khiếu nại khách hàng",
    "type": "skill",
    "aliases": [
      "complaint handling",
      "xu ly khieu nai",
      "giải quyết phản hồi"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Support",
    "source": "custom"
  },
  {
    "id": "call_center",
    "name": "Vận hành tổng đài (Call Center)",
    "type": "skill",
    "aliases": [
      "call center agent",
      "tổng đài viên",
      "inbound outbound call"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Operations",
    "source": "custom"
  },
  {
    "id": "helpdesk_support",
    "name": "Hỗ trợ kỹ thuật (Helpdesk)",
    "type": "skill",
    "aliases": [
      "helpdesk support",
      "it helpdesk",
      "hỗ trợ người dùng"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Technical",
    "source": "custom"
  },
  {
    "id": "csat_nps",
    "name": "Đo lường mức độ hài lòng (CSAT / NPS)",
    "type": "skill",
    "aliases": [
      "csat",
      "nps",
      "đo lường sự hài lòng"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Quality",
    "source": "custom"
  },
  {
    "id": "contract_drafting",
    "name": "Soạn thảo hợp đồng thương mại",
    "type": "skill",
    "aliases": [
      "contract drafting",
      "soan thao hop dong",
      "hợp đồng kinh tế"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Contract",
    "source": "custom"
  },
  {
    "id": "legal_compliance",
    "name": "Tuân thủ pháp lý doanh nghiệp",
    "type": "domain_knowledge",
    "aliases": [
      "legal compliance",
      "tuan thu phap ly",
      "kiểm soát tuân thủ"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Compliance",
    "source": "custom"
  },
  {
    "id": "intellectual_property",
    "name": "Sở hữu trí tuệ (Intellectual Property)",
    "type": "domain_knowledge",
    "aliases": [
      "so huu tri tue",
      "bản quyền nhãn hiệu",
      "đăng ký sáng chế"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "IP",
    "source": "custom"
  },
  {
    "id": "litigation_dispute",
    "name": "Giải quyết tranh chấp & Tố tụng",
    "type": "skill",
    "aliases": [
      "litigation",
      "tranh chap thuong mai",
      "tham gia to tung"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Litigation",
    "source": "custom"
  },
  {
    "id": "corporate_law",
    "name": "Luật doanh nghiệp & Đầu tư",
    "type": "domain_knowledge",
    "aliases": [
      "corporate law",
      "luat doanh nghiep",
      "thành lập doanh nghiệp"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Corporate",
    "source": "custom"
  },
  {
    "id": "autocad_design",
    "name": "AutoCAD 2D/3D",
    "type": "tool",
    "aliases": [
      "autocad",
      "vẽ autocad",
      "bản vẽ kỹ thuật autocad"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "CAD",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "solidworks",
    "name": "SolidWorks",
    "type": "tool",
    "aliases": [
      "solidworks 3d",
      "thiết kế cơ khí solidworks"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "CAD",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "cnc_machining",
    "name": "Gia công cơ khí CNC",
    "type": "skill",
    "aliases": [
      "gia cong cnc",
      "vận hành máy cnc",
      "lập trình cnc"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Machining",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "plc_automation",
    "name": "Tự động hóa PLC",
    "type": "tool",
    "aliases": [
      "plc siemens",
      "lập trình plc",
      "tự động hóa công nghiệp"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Automation",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "lean_manufacturing",
    "name": "Sản xuất tinh gọn (Lean Manufacturing)",
    "type": "domain_knowledge",
    "aliases": [
      "lean manufacturing",
      "san xuat tinh gon",
      "lean production"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Quality",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "six_sigma",
    "name": "Six Sigma",
    "type": "domain_knowledge",
    "aliases": [
      "6 sigma",
      "dmaic",
      "đai đen six sigma",
      "six sigma green belt",
      "six sigma black belt"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Quality",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "five_s_kaizen",
    "name": "5S & Kaizen",
    "type": "domain_knowledge",
    "aliases": [
      "phương pháp 5s",
      "cải tiến kaizen"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Quality",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "mechanical_maintenance",
    "name": "Bảo trì cơ điện (Maintenance)",
    "type": "skill",
    "aliases": [
      "bao tri co dien",
      "bảo trì máy móc nhà xưởng"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Maintenance",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "construction_cost_estimate",
    "name": "Dự toán xây dựng",
    "type": "skill",
    "aliases": [
      "du toan xay dung",
      "bóc tách khối lượng",
      "qs engineer"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Estimation",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "site_supervision",
    "name": "Giám sát thi công công trình",
    "type": "skill",
    "aliases": [
      "giam sat thi cong",
      "kỹ sư giám sát",
      "chỉ huy trưởng"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Supervision",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "revit_bim",
    "name": "Revit & Mô hình BIM",
    "type": "tool",
    "aliases": [
      "revit",
      "revit architecture",
      "mo hinh bim"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Design",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "construction_safety",
    "name": "An toàn lao động xây dựng (HSE)",
    "type": "domain_knowledge",
    "aliases": [
      "an toan lao dong",
      "hse construction",
      "vệ sinh an toàn"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Safety",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "kitchen_operations",
    "name": "Vận hành bếp (Kitchen Operations)",
    "type": "skill",
    "aliases": [
      "van hanh bep",
      "đầu bếp",
      "chế biến món ăn"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "F&B",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "haccp_food_safety",
    "name": "Tiêu chuẩn ATVSTP & HACCP",
    "type": "domain_knowledge",
    "aliases": [
      "haccp",
      "ve sinh an toan thuc pham",
      "an toan ve sinh"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "Standards",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "restaurant_management",
    "name": "Quản lý nhà hàng",
    "type": "skill",
    "aliases": [
      "quan ly nha hang",
      "restaurant manager",
      "vận hành f&b"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "Management",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "hotel_pms",
    "name": "Phần mềm quản lý khách sạn (PMS)",
    "type": "tool",
    "aliases": [
      "hotel pms",
      "opera pms",
      "smile pms"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "Software",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "bartender_barista",
    "name": "Pha chế đồ uống (Bartender & Barista)",
    "type": "skill",
    "aliases": [
      "pha che",
      "barista",
      "bartender"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "F&B",
    "confidence": 0.8,
    "source": "custom"
  },
  {
    "id": "teaching_pedagogy",
    "name": "Giảng dạy & Nghiệp vụ sư phạm",
    "type": "skill",
    "aliases": [
      "giang day",
      "nghiep vu su pham",
      "dung lop"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Pedagogy",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "curriculum_design",
    "name": "Thiết kế giáo trình & Bài giảng",
    "type": "skill",
    "aliases": [
      "thiet ke giao trinh",
      "soan giao an",
      "curriculum design"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Curriculum",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "lms_elearning",
    "name": "Quản trị hệ thống E-Learning (LMS)",
    "type": "tool",
    "aliases": [
      "e-learning lms",
      "moodle lms",
      "canvas lms"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Technology",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "communication_skill",
    "name": "Kỹ năng giao tiếp",
    "type": "soft_skill",
    "aliases": [
      "communication",
      "giao tiep hieu qua",
      "ky nang trinh bay"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "SoftSkills",
    "source": "custom"
  },
  {
    "id": "leadership",
    "name": "Kỹ năng lãnh đạo",
    "type": "soft_skill",
    "aliases": [
      "leadership",
      "lanh dao doi ngu",
      "quan ly con nguoi"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "SoftSkills",
    "source": "custom"
  },
  {
    "id": "teamwork",
    "name": "Làm việc nhóm",
    "type": "soft_skill",
    "aliases": [
      "teamwork",
      "lam viec nhom",
      "phối hợp nhóm"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "SoftSkills",
    "source": "custom"
  },
  {
    "id": "problem_solving",
    "name": "Giải quyết vấn đề",
    "type": "soft_skill",
    "aliases": [
      "problem solving",
      "giai quyet van de",
      "tư duy phân tích"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "SoftSkills",
    "source": "custom"
  },
  {
    "id": "time_management",
    "name": "Quản lý thời gian",
    "type": "soft_skill",
    "aliases": [
      "time management",
      "quan ly thoi gian",
      "sắp xếp công việc"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "SoftSkills",
    "source": "custom"
  },
  {
    "id": "agile_scrum",
    "name": "Agile / Scrum",
    "type": "domain_knowledge",
    "aliases": [
      "scrum master",
      "phương pháp agile"
    ],
    "ambiguousAliases": [
      {
        "alias": "sprint",
        "contextHints": [
          "agile",
          "scrum sprint",
          "jira sprint",
          "sprint planning"
        ],
        "minHints": 1
      }
    ],
    "sector": "Common",
    "category": "Methodology",
    "source": "custom"
  },
  {
    "id": "jira",
    "name": "Jira Software",
    "type": "tool",
    "aliases": [
      "atlassian jira",
      "jira board"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Tools",
    "source": "custom"
  },
  {
    "id": "project_management",
    "name": "Quản lý dự án (Project Management)",
    "type": "skill",
    "aliases": [
      "project manager",
      "quản trị dự án"
    ],
    "ambiguousAliases": [
      {
        "alias": "pm",
        "contextHints": [
          "project manager",
          "quản lý dự án",
          "tiến độ dự án",
          "project timeline"
        ],
        "minHints": 2
      }
    ],
    "sector": "Common",
    "category": "Management",
    "source": "custom"
  },
  {
    "id": "english_language",
    "name": "Tiếng Anh giao tiếp & chuyên ngành",
    "type": "language",
    "aliases": [
      "tiếng anh",
      "english communication",
      "tieng anh"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "source": "custom"
  },
  {
    "id": "ielts_cert",
    "name": "Chứng chỉ IELTS",
    "type": "certification",
    "aliases": [
      "ielts",
      "ielts 6.5",
      "ielts 7.0",
      "ielts 7.5"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "source": "custom"
  },
  {
    "id": "toeic_cert",
    "name": "Chứng chỉ TOEIC",
    "type": "certification",
    "aliases": [
      "toeic",
      "toeic 700",
      "toeic 800"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "source": "custom"
  },
  {
    "id": "japanese_language",
    "name": "Tiếng Nhật",
    "type": "language",
    "aliases": [
      "tiếng nhật",
      "japanese",
      "tieng nhat"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "source": "custom"
  },
  {
    "id": "jlpt_cert",
    "name": "Chứng chỉ tiếng Nhật JLPT",
    "type": "certification",
    "aliases": [
      "jlpt n1",
      "jlpt n2",
      "jlpt n3"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "source": "custom"
  },
  {
    "id": "chinese_language",
    "name": "Tiếng Trung Quốc",
    "type": "language",
    "aliases": [
      "tiếng trung",
      "chinese",
      "tiếng hoa"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "source": "custom"
  },
  {
    "id": "hsk_cert",
    "name": "Chứng chỉ HSK",
    "type": "certification",
    "aliases": [
      "hsk 4",
      "hsk 5",
      "hsk 6"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "source": "custom"
  },
  {
    "id": "pmp_cert",
    "name": "Chứng chỉ PMP (Project Management Professional)",
    "type": "certification",
    "aliases": [
      "pmp",
      "chứng chỉ pmp"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Certifications",
    "source": "custom"
  },
  {
    "id": "midwifery",
    "name": "Hộ sinh & Chăm sóc sản khoa",
    "type": "skill",
    "aliases": [
      "cham soc me va be",
      "chăm sóc mẹ và bé",
      "ho sinh",
      "san khoa",
      "midwifery care"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Nursing",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "medical_laboratory",
    "name": "Xét nghiệm y khoa (Medical Laboratory)",
    "type": "skill",
    "aliases": [
      "xet nghiem y khoa",
      "xét nghiệm y học",
      "medical laboratory",
      "xet nghiem mau",
      "ky thuat xet nghiem"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Laboratory",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "medical_imaging",
    "name": "Chẩn đoán hình ảnh (X-quang, Siêu âm, CT/MRI)",
    "type": "skill",
    "aliases": [
      "chan doan hinh anh",
      "x quang",
      "sieu am y te",
      "chup ct mri",
      "medical imaging"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Imaging",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "medical_records_management",
    "name": "Quản lý hồ sơ bệnh án (EMR / HIS)",
    "type": "skill",
    "aliases": [
      "quan ly benh an",
      "ho so benh an",
      "electronic medical records",
      "emr his"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Administration",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "infection_control",
    "name": "Kiểm soát nhiễm khuẩn bệnh viện",
    "type": "domain_knowledge",
    "aliases": [
      "kiem soat nhiem khuan",
      "khu khuan benh vien",
      "infection control",
      "ve sinh dich te benh vien"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Safety",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "public_health",
    "name": "Y tế công cộng & Dịch tễ học",
    "type": "domain_knowledge",
    "aliases": [
      "y te cong cong",
      "dich te hoc",
      "suc khoe cong dong",
      "public health"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "PublicHealth",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "clinical_nutrition",
    "name": "Dinh dưỡng lâm sàng & Tiết chế",
    "type": "skill",
    "aliases": [
      "dinh duong lam sang",
      "tu van dinh duong",
      "thuc don benh ly",
      "clinical nutrition"
    ],
    "ambiguousAliases": [],
    "sector": "Healthcare",
    "category": "Nutrition",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "classroom_management",
    "name": "Quản lý lớp học (Classroom Management)",
    "type": "skill",
    "aliases": [
      "quan ly lop hoc",
      "ky luat lop hoc",
      "classroom management"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Pedagogy",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "student_assessment",
    "name": "Đánh giá học sinh & Khảo thí",
    "type": "skill",
    "aliases": [
      "danh gia hoc sinh",
      "cham thi kiem tra",
      "khao thi giao duc",
      "student assessment"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Assessment",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "admissions_counseling",
    "name": "Tư vấn tuyển sinh giáo dục",
    "type": "skill",
    "aliases": [
      "tu van tuyen sinh",
      "tuyen sinh dao tao",
      "admissions counseling"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Admissions",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "tesol_tefl",
    "name": "Giảng dạy tiếng Anh (TESOL / CELTA)",
    "type": "certification",
    "aliases": [
      "chung chi tesol",
      "chung chi celta",
      "giang day tieng anh",
      "english teaching"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Languages",
    "confidence": 0.9,
    "source": "custom"
  },
  {
    "id": "early_childhood_education",
    "name": "Giáo dục mầm non",
    "type": "skill",
    "aliases": [
      "giao duc mam non",
      "su pham mam non",
      "early childhood education"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Pedagogy",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "edtech_integration",
    "name": "Ứng dụng công nghệ dạy học (EdTech)",
    "type": "skill",
    "aliases": [
      "ung dung cong nghe day hoc",
      "edtech",
      "cong nghe giao duc"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Technology",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "academic_advising",
    "name": "Cố vấn học tập (Academic Advising)",
    "type": "skill",
    "aliases": [
      "co van hoc tap",
      "academic advisor",
      "huong dan sinh vien"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Advising",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "corporate_training",
    "name": "Đào tạo doanh nghiệp (Corporate Training)",
    "type": "skill",
    "aliases": [
      "dao tao doanh nghiep",
      "corporate training",
      "tap huan noi bo"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Corporate",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "special_education",
    "name": "Giáo dục đặc biệt & Hòa nhập",
    "type": "skill",
    "aliases": [
      "giao duc dac biet",
      "can thiep tre tu ky",
      "special education"
    ],
    "ambiguousAliases": [],
    "sector": "Education",
    "category": "Pedagogy",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "structural_design",
    "name": "Thiết kế kết cấu xây dựng (Structural Design)",
    "type": "skill",
    "aliases": [
      "thiet ke ket cau",
      "ket cau cong trinh",
      "structural design",
      "etabs sap2000"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Engineering",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "construction_project_scheduling",
    "name": "Quản lý tiến độ xây dựng (MS Project / Primavera)",
    "type": "skill",
    "aliases": [
      "tien do xay dung",
      "lap tien do thi cong",
      "ms project xay dung",
      "primavera p6"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Management",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "mep_design",
    "name": "Thiết kế cơ điện công trình (MEP Design)",
    "type": "skill",
    "aliases": [
      "thiet ke mep",
      "co dien cong trinh",
      "mep engineer",
      "ky su mep"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Engineering",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "construction_qa_qc",
    "name": "Quản lý chất lượng công trình (QA/QC Xây dựng)",
    "type": "skill",
    "aliases": [
      "qa qc xay dung",
      "kiem dinh chat luong cong trinh",
      "nghiem thu cong trinh"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Quality",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "construction_bidding",
    "name": "Đấu thầu xây dựng (Bidding & Tendering)",
    "type": "skill",
    "aliases": [
      "dau thau xay dung",
      "ho so moi thau",
      "ho so du thau",
      "bidding construction"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Commercial",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "sketchup_3dsmax",
    "name": "Dựng hình kiến trúc (SketchUp / 3ds Max)",
    "type": "tool",
    "aliases": [
      "sketchup",
      "3ds max kien truc",
      "render kien truc",
      "vray lumion"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Design",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "surveying_geodesy",
    "name": "Khảo sát trắc địa công trình (Surveying)",
    "type": "skill",
    "aliases": [
      "trac dia cong trinh",
      "do dac xay dung",
      "may toan dac dien tu",
      "land surveying"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Surveying",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "concrete_technology",
    "name": "Kỹ thuật bê tông & Vật liệu xây dựng",
    "type": "domain_knowledge",
    "aliases": [
      "ky thuat be tong",
      "vat lieu xay dung",
      "cap phoi be tong",
      "thi nghiem vat lieu"
    ],
    "ambiguousAliases": [],
    "sector": "Construction",
    "category": "Materials",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "hotel_front_office",
    "name": "Lễ tân khách sạn (Front Office)",
    "type": "skill",
    "aliases": [
      "le tan khach san",
      "front office",
      "check in check out",
      "tiep tan khach san"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "FrontOffice",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "housekeeping_operations",
    "name": "Nghiệp vụ buồng phòng (Housekeeping)",
    "type": "skill",
    "aliases": [
      "buong phong khach san",
      "housekeeping",
      "don phong khach san"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "Housekeeping",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "banquet_event_catering",
    "name": "Tổ chức tiệc & sự kiện (Banquet & Catering)",
    "type": "skill",
    "aliases": [
      "to chuc tiec",
      "dich vu banquet",
      "tiec cuoi hoi nghi",
      "catering service"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "F&B",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "fnb_service",
    "name": "Dịch vụ khách hàng F&B (Food & Beverage Service)",
    "type": "skill",
    "aliases": [
      "phuc vu nha hang",
      "f&b service",
      "phuc vu ban",
      "order mon"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "F&B",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "hotel_revenue_management",
    "name": "Quản lý doanh thu khách sạn (Revenue Management)",
    "type": "skill",
    "aliases": [
      "quan ly doanh thu khach san",
      "revenue management hotel",
      "toi uu gia phong"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "Management",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "tour_guide",
    "name": "Hướng dẫn viên du lịch (Tour Guide)",
    "type": "skill",
    "aliases": [
      "huong dan vien du lich",
      "tour guide",
      "dan doan du lich",
      "thuyet minh du lich"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "Tourism",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "tour_operations",
    "name": "Điều hành tour & Lữ hành (Tour Operations)",
    "type": "skill",
    "aliases": [
      "dieu hanh tour",
      "tour operator",
      "thiet ke tour du lich",
      "dieu hanh lu hanh"
    ],
    "ambiguousAliases": [],
    "sector": "Hospitality",
    "category": "Tourism",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "legal_advisory",
    "name": "Tư vấn pháp lý chung (Legal Advisory)",
    "type": "skill",
    "aliases": [
      "tu van phap ly",
      "legal advisory",
      "tu van luat",
      "y kien phap ly"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Advisory",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "inhouse_counsel",
    "name": "Pháp chế doanh nghiệp (In-house Counsel)",
    "type": "skill",
    "aliases": [
      "phap che doanh nghiep",
      "inhouse counsel",
      "chuyen vien phap che",
      "luat su noi bo"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Corporate",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "ma_legal_advisory",
    "name": "M&A & Tái cấu trúc doanh nghiệp",
    "type": "skill",
    "aliases": [
      "tham dinh phap ly ma",
      "m&a legal",
      "sap nhap doanh nghiep",
      "legal due diligence"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Corporate",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "administrative_licensing",
    "name": "Thủ tục hành chính & Giấy phép con",
    "type": "skill",
    "aliases": [
      "thu tuc hanh chinh",
      "xin giay phep kinh doanh",
      "giay phep con",
      "administrative licensing"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Licensing",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "tax_law",
    "name": "Luật thuế & Khiếu nại thuế",
    "type": "domain_knowledge",
    "aliases": [
      "luat thue",
      "phap luat thue",
      "tranh chap thue",
      "tax law"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Tax",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "labor_law_legal",
    "name": "Tư vấn pháp luật lao động (Legal Perspective)",
    "type": "domain_knowledge",
    "aliases": [
      "tu van luat lao dong",
      "phap luat lao dong chuyen sau",
      "tranh chap hop dong lao dong"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Labor",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "banking_finance_law",
    "name": "Pháp luật ngân hàng & Tài chính tín dụng",
    "type": "domain_knowledge",
    "aliases": [
      "luat ngan hang",
      "phap luat tai chinh tin dung",
      "hop dong tin dung the chap"
    ],
    "ambiguousAliases": [],
    "sector": "Legal",
    "category": "Finance",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "omnichannel_support",
    "name": "Hỗ trợ đa kênh (Chat / Email Support)",
    "type": "skill",
    "aliases": [
      "chat support",
      "email support",
      "live chat",
      "cham soc khach hang qua chat"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Support",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "contact_center_qa",
    "name": "Quản lý chất lượng dịch vụ (QA Call Center)",
    "type": "skill",
    "aliases": [
      "qa call center",
      "giam sat chat luong cuoc goi",
      "call quality assurance"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Quality",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "customer_onboarding",
    "name": "Tiếp nhận & Hướng dẫn khách hàng (Customer Onboarding)",
    "type": "skill",
    "aliases": [
      "customer onboarding",
      "huong dan su dung san pham",
      "onboarding khach hang"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Support",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "zendesk_freshdesk",
    "name": "Hệ thống Helpdesk Ticket (Zendesk / Freshdesk)",
    "type": "tool",
    "aliases": [
      "zendesk",
      "freshdesk",
      "ticket helpdesk",
      "phan mem ticket"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Tools",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "telephonic_persuasion",
    "name": "Kỹ năng thuyết phục qua điện thoại",
    "type": "soft_skill",
    "aliases": [
      "thuyet phuc qua dien thoai",
      "teleservice persuasion",
      "xu ly tu choi qua dien thoai"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Skills",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "vip_customer_care",
    "name": "Chăm sóc khách hàng VIP / Khách hàng ưu tiên",
    "type": "skill",
    "aliases": [
      "cskh vip",
      "cham soc khach hang uu tien",
      "vip customer service"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Support",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "customer_retention",
    "name": "Giữ chân khách hàng & Giảm rời bỏ (Retention & Churn)",
    "type": "skill",
    "aliases": [
      "giu chan khach hang",
      "customer retention",
      "giam churn rate"
    ],
    "ambiguousAliases": [],
    "sector": "CustomerService",
    "category": "Support",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "industrial_electricity",
    "name": "Điện công nghiệp & Tủ bảng điện",
    "type": "skill",
    "aliases": [
      "dien cong nghiep",
      "dau noi tu dien",
      "industrial electricity",
      "so do mach dien cong nghiep"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Electrical",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "hvac_refrigeration",
    "name": "Cơ điện lạnh & Hệ thống HVAC",
    "type": "skill",
    "aliases": [
      "co dien lanh",
      "he thong hvac",
      "chiller dieu hoa thong gio",
      "hvac engineering"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "HVAC",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "manufacturing_qc_qa",
    "name": "Quản lý chất lượng sản xuất (QC/QA Nhà máy)",
    "type": "skill",
    "aliases": [
      "qc nha may",
      "qa san xuat",
      "kiem tra chat luong san pham",
      "kcs san xuat"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Quality",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "iso_standards_eng",
    "name": "Tiêu chuẩn ISO 9001 & ISO 14001",
    "type": "domain_knowledge",
    "aliases": [
      "tieu chuan iso 9001",
      "iso 14001",
      "he thong quan ly chat luong iso"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Standards",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "technical_drawing_interpretation",
    "name": "Đọc hiểu bản vẽ kỹ thuật cơ khí",
    "type": "skill",
    "aliases": [
      "doc ban ve ky thuat",
      "ban ve co khi",
      "technical drawing interpretation",
      "doc hieu gd&t"
    ],
    "ambiguousAliases": [],
    "sector": "Engineering",
    "category": "Mechanical",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "office_administration",
    "name": "Hành chính văn phòng (Office Administration)",
    "type": "skill",
    "aliases": [
      "hanh chinh van phong",
      "chuyen vien hanh chinh",
      "office administrator",
      "nghiep vu hanh chinh"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Administration",
    "confidence": 0.9,
    "source": "custom"
  },
  {
    "id": "executive_secretary",
    "name": "Thư ký & Trợ lý giám đốc (Executive Assistant)",
    "type": "skill",
    "aliases": [
      "thu ky giam doc",
      "tro ly ban giam doc",
      "executive assistant",
      "secretary"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Assistance",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "records_document_management",
    "name": "Quản lý hồ sơ & Lưu trữ văn thư",
    "type": "skill",
    "aliases": [
      "luu tru van thu",
      "quan ly cong van",
      "records management",
      "soan thao luu tru ho so"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Records",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "internal_event_organization",
    "name": "Tổ chức sự kiện & Hoạt động nội bộ",
    "type": "skill",
    "aliases": [
      "to chuc su kien noi bo",
      "team building",
      "to chuc hoi nghi noi bo",
      "internal events"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Events",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "office_procurement_supplies",
    "name": "Mua sắm văn phòng phẩm & Thiết bị VP",
    "type": "skill",
    "aliases": [
      "mua sam van phong pham",
      "trang thiet bi van phong",
      "office supplies procurement"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Procurement",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "front_desk_reception",
    "name": "Lễ tân văn phòng & Tiếp đón khách",
    "type": "skill",
    "aliases": [
      "le tan van phong",
      "tiep don khach",
      "front desk receptionist",
      "truc dien thoai van phong"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Reception",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "company_asset_management",
    "name": "Quản lý tài sản & Cơ sở vật chất VP",
    "type": "skill",
    "aliases": [
      "quan ly tai san cong ty",
      "co so vat chat van phong",
      "facility management",
      "kiem ke tai san"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Facilities",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "business_travel_management",
    "name": "Điều phối công tác & Đặt vé lịch trình",
    "type": "skill",
    "aliases": [
      "dieu phoi cong tac",
      "dat ve may bay khach san",
      "business travel management",
      "lich trinh cong tac"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Travel",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "official_dispatch_drafting",
    "name": "Soạn thảo công văn & Tờ trình hành chính",
    "type": "skill",
    "aliases": [
      "soan thao cong van",
      "to trinh hanh chinh",
      "van ban hanh chinh nha nuoc"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Documentation",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "stamp_seal_management",
    "name": "Quản lý con dấu & Pháp chế hành chính",
    "type": "skill",
    "aliases": [
      "quan ly con dau",
      "dong dau van ban",
      "seal management",
      "bao mat con dau"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Governance",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "meeting_minutes_preparation",
    "name": "Thư ký cuộc họp & Ghi biên bản",
    "type": "skill",
    "aliases": [
      "ghi bien ban cuoc hop",
      "thu ky cuoc hop",
      "meeting minutes",
      "tong hop ket luan hop"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Documentation",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "office_safety_hygiene",
    "name": "Vệ sinh & An toàn môi trường làm việc",
    "type": "domain_knowledge",
    "aliases": [
      "ve sinh van phong",
      "an toan van phong",
      "office 5s",
      "noi quy van phong"
    ],
    "ambiguousAliases": [],
    "sector": "Administration",
    "category": "Safety",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "copywriting_creative",
    "name": "Viết lời quảng cáo sáng tạo (Copywriting)",
    "type": "skill",
    "aliases": [
      "copywriting",
      "viet loi quang cao",
      "creative copywriting",
      "headline slogan",
      "viet kich ban quang cao"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "Content",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "pr_crisis_management",
    "name": "Quan hệ công chúng & Xử lý khủng hoảng (PR)",
    "type": "skill",
    "aliases": [
      "quan he cong chung",
      "public relations pr",
      "thong cao bao chi",
      "xu ly khung hoang truyen thong"
    ],
    "ambiguousAliases": [],
    "sector": "Marketing",
    "category": "PR",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "zoho_crm",
    "name": "Zoho CRM",
    "type": "tool",
    "aliases": [
      "zohocrm",
      "he thong zoho crm"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "CRM",
    "confidence": 0.9,
    "source": "custom"
  },
  {
    "id": "sales_pipeline_management",
    "name": "Quản trị phễu bán hàng (Pipeline Management)",
    "type": "skill",
    "aliases": [
      "quan tri pheu ban hang",
      "sales pipeline",
      "du bao doanh thu sales"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "Management",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "field_sales_canvassing",
    "name": "Bán hàng thị trường (Field Sales & Thị trường)",
    "type": "skill",
    "aliases": [
      "ban hang thi truong",
      "sales thi truong",
      "tiep thi thi truong",
      "field sales"
    ],
    "ambiguousAliases": [],
    "sector": "Sales",
    "category": "Sales",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "headhunting_executive_search",
    "name": "Tuyển dụng cấp cao (Headhunting & Executive Search)",
    "type": "skill",
    "aliases": [
      "headhunting",
      "executive search",
      "san dau nguoi cap cao"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Recruitment",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "corporate_culture_development",
    "name": "Phát triển văn hóa doanh nghiệp",
    "type": "skill",
    "aliases": [
      "phat trien van hoa doanh nghiep",
      "van hoa cong ty",
      "corporate culture"
    ],
    "ambiguousAliases": [],
    "sector": "HR",
    "category": "Culture",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "fleet_management",
    "name": "Quản lý đội xe & Điều vận (Fleet Management)",
    "type": "skill",
    "aliases": [
      "quan ly doi xe",
      "dieu van doi xe",
      "fleet management",
      "giao nhan xe tai"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Transportation",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "customs_declaration_software",
    "name": "Phần mềm khai hải quan điện tử (ECUS / VNACCS)",
    "type": "tool",
    "aliases": [
      "phan mem ecus",
      "khai hai quan vnaccs",
      "ecus5 vnaccs"
    ],
    "ambiguousAliases": [],
    "sector": "Operations",
    "category": "Trade",
    "confidence": 0.85,
    "source": "custom"
  },
  {
    "id": "storybook",
    "name": "Storybook",
    "type": "tool",
    "aliases": [
      "storybook js",
      "component library storybook"
    ],
    "ambiguousAliases": [],
    "sector": "IT",
    "category": "Frontend",
    "confidence": 0.9,
    "source": "custom"
  },
  {
    "id": "excel_basic",
    "name": "Microsoft Excel (Cơ bản - Trung bình)",
    "type": "tool",
    "aliases": [
      "microsoft excel",
      "ms excel",
      "excel van phong",
      "tinh toan excel",
      "excel"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Office",
    "confidence": 0.95,
    "source": "custom"
  },
  {
    "id": "word_office",
    "name": "Microsoft Word",
    "type": "tool",
    "aliases": [
      "microsoft word",
      "ms word",
      "soan thao word",
      "word van phong"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Office",
    "confidence": 0.95,
    "source": "custom"
  },
  {
    "id": "powerpoint_office",
    "name": "Microsoft PowerPoint",
    "type": "tool",
    "aliases": [
      "microsoft powerpoint",
      "ms powerpoint",
      "thiet ke slide",
      "trinh chieu powerpoint"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Office",
    "confidence": 0.95,
    "source": "custom"
  },
  {
    "id": "google_workspace",
    "name": "Google Workspace (Docs, Sheets, Slides, Drive)",
    "type": "tool",
    "aliases": [
      "google docs",
      "google sheets",
      "google slides",
      "gsuite",
      "google drive"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Office",
    "confidence": 0.95,
    "source": "custom"
  },
  {
    "id": "sql_general",
    "name": "SQL cơ bản (General SQL)",
    "type": "skill",
    "aliases": [
      "truy van sql",
      "sql co ban",
      "basic sql",
      "ngon ngu sql"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Database",
    "confidence": 0.9,
    "source": "custom"
  },
  {
    "id": "korean_language",
    "name": "Tiếng Hàn Quốc",
    "type": "language",
    "aliases": [
      "tieng han",
      "tiếng hàn",
      "korean",
      "tiếng triều tiên"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "confidence": 0.95,
    "source": "custom"
  },
  {
    "id": "topik_cert",
    "name": "Chứng chỉ tiếng Hàn TOPIK",
    "type": "certification",
    "aliases": [
      "chung chi topik",
      "topik ii",
      "topik 4",
      "topik 5",
      "topik 6"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "Languages",
    "confidence": 0.95,
    "source": "custom"
  },
  {
    "id": "presentation_skill",
    "name": "Kỹ năng thuyết trình (Presentation Skills)",
    "type": "soft_skill",
    "aliases": [
      "ky nang thuyet trinh",
      "thuyet trinh truoc dam dong",
      "public speaking",
      "presentation skills"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "SoftSkills",
    "confidence": 0.9,
    "source": "custom"
  },
  {
    "id": "general_negotiation",
    "name": "Kỹ năng đàm phán & Thương lượng chung",
    "type": "soft_skill",
    "aliases": [
      "ky nang dam phan",
      "thuong luong hop tac",
      "negotiation skills"
    ],
    "ambiguousAliases": [],
    "sector": "Common",
    "category": "SoftSkills",
    "confidence": 0.9,
    "source": "custom"
  }
];

export const ESCO_SKILL_EDGES: EscoSkillEdge[] = [
  {
    "from": "clinical_nursing",
    "to": "patient_care",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "medical_diagnosis",
    "to": "patient_care",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "pharmacology",
    "to": "patient_care",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "clinical_nursing",
    "to": "first_aid_cpr",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "nextjs",
    "to": "react",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "react",
    "to": "nextjs",
    "relation": "FOUNDATION",
    "weight": 0.65,
    "source": "custom",
    "note": "React là thư viện nền tảng trực tiếp của Next.js"
  },
  {
    "from": "nextjs",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "nextjs",
    "to": "typescript",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom",
    "note": "TypeScript là ngôn ngữ bổ trợ phổ biến hàng đầu trong các dự án Next.js"
  },
  {
    "from": "nuxtjs",
    "to": "vue",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "vue",
    "to": "nuxtjs",
    "relation": "FOUNDATION",
    "weight": 0.65,
    "source": "custom",
    "note": "Vue là nền tảng trực tiếp của Nuxt.js"
  },
  {
    "from": "nuxtjs",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "react",
    "to": "vue",
    "relation": "SUBSTITUTE",
    "weight": 0.65,
    "source": "custom",
    "note": ""
  },
  {
    "from": "vue",
    "to": "react",
    "relation": "SUBSTITUTE",
    "weight": 0.65,
    "source": "custom",
    "note": ""
  },
  {
    "from": "react",
    "to": "angular",
    "relation": "SUBSTITUTE",
    "weight": 0.55,
    "source": "custom",
    "note": ""
  },
  {
    "from": "angular",
    "to": "react",
    "relation": "SUBSTITUTE",
    "weight": 0.55,
    "source": "custom",
    "note": ""
  },
  {
    "from": "vue",
    "to": "angular",
    "relation": "SUBSTITUTE",
    "weight": 0.55,
    "source": "custom",
    "note": ""
  },
  {
    "from": "angular",
    "to": "vue",
    "relation": "SUBSTITUTE",
    "weight": 0.55,
    "source": "custom",
    "note": ""
  },
  {
    "from": "react",
    "to": "svelte",
    "relation": "SUBSTITUTE",
    "weight": 0.6,
    "source": "custom",
    "note": ""
  },
  {
    "from": "svelte",
    "to": "react",
    "relation": "SUBSTITUTE",
    "weight": 0.6,
    "source": "custom",
    "note": ""
  },
  {
    "from": "typescript",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "javascript",
    "to": "typescript",
    "relation": "FOUNDATION",
    "weight": 0.6,
    "source": "custom",
    "note": "JavaScript là nền tảng cú pháp và runtime của TypeScript"
  },
  {
    "from": "tailwind",
    "to": "bootstrap",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "bootstrap",
    "to": "tailwind",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "tailwind",
    "to": "html_css",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "bootstrap",
    "to": "html_css",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "redux",
    "to": "react",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "react",
    "to": "redux",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "vite",
    "to": "webpack",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "webpack",
    "to": "vite",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": ""
  },
  {
    "from": "react_native",
    "to": "flutter",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "flutter",
    "to": "react_native",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "react_native",
    "to": "react",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "react_native",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "react",
    "to": "react_native",
    "relation": "FOUNDATION",
    "weight": 0.55,
    "source": "custom",
    "note": "React là thư viện nền tảng trực tiếp của React Native"
  },
  {
    "from": "flutter",
    "to": "dart",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "swift",
    "to": "ios_development",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "ios_development",
    "to": "swift",
    "relation": "COMPLEMENT",
    "weight": 0.4,
    "source": "custom"
  },
  {
    "from": "kotlin",
    "to": "android_development",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "android_development",
    "to": "kotlin",
    "relation": "COMPLEMENT",
    "weight": 0.4,
    "source": "custom"
  },
  {
    "from": "swift",
    "to": "kotlin",
    "relation": "SUBSTITUTE",
    "weight": 0.4,
    "source": "custom",
    "note": ""
  },
  {
    "from": "kotlin",
    "to": "swift",
    "relation": "SUBSTITUTE",
    "weight": 0.4,
    "source": "custom",
    "note": ""
  },
  {
    "from": "ios_development",
    "to": "android_development",
    "relation": "SUBSTITUTE",
    "weight": 0.4,
    "source": "custom",
    "note": ""
  },
  {
    "from": "android_development",
    "to": "ios_development",
    "relation": "SUBSTITUTE",
    "weight": 0.4,
    "source": "custom",
    "note": ""
  },
  {
    "from": "react_native",
    "to": "ios_development",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "react_native",
    "to": "android_development",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "flutter",
    "to": "ios_development",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "flutter",
    "to": "android_development",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "react_native",
    "to": "ionic",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": ""
  },
  {
    "from": "ionic",
    "to": "react_native",
    "relation": "SUBSTITUTE",
    "weight": 0.65,
    "source": "custom",
    "note": ""
  },
  {
    "from": "nestjs",
    "to": "nodejs",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "nestjs",
    "to": "typescript",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "nestjs",
    "to": "expressjs",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "expressjs",
    "to": "nodejs",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "expressjs",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "expressjs",
    "to": "nestjs",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "django",
    "to": "fastapi",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "fastapi",
    "to": "django",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "fastapi",
    "to": "flask",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "flask",
    "to": "fastapi",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "django",
    "to": "flask",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "flask",
    "to": "django",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "django",
    "to": "python",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "fastapi",
    "to": "python",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "flask",
    "to": "python",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "spring_boot",
    "to": "java",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "laravel",
    "to": "php",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "spring_boot",
    "to": "csharp_net",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "csharp_net",
    "to": "spring_boot",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "spring_boot",
    "to": "nestjs",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "nestjs",
    "to": "spring_boot",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "golang",
    "to": "nodejs",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "nodejs",
    "to": "golang",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "laravel",
    "to": "django",
    "relation": "SUBSTITUTE",
    "weight": 0.5,
    "source": "custom",
    "note": ""
  },
  {
    "from": "django",
    "to": "laravel",
    "relation": "SUBSTITUTE",
    "weight": 0.5,
    "source": "custom",
    "note": ""
  },
  {
    "from": "microservices",
    "to": "rest_api",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "microservices",
    "to": "grpc",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "rest_api",
    "to": "graphql",
    "relation": "SUBSTITUTE",
    "weight": 0.6,
    "source": "custom",
    "note": ""
  },
  {
    "from": "graphql",
    "to": "rest_api",
    "relation": "SUBSTITUTE",
    "weight": 0.6,
    "source": "custom",
    "note": ""
  },
  {
    "from": "postgresql",
    "to": "mysql",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "mysql",
    "to": "postgresql",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "postgresql",
    "to": "sql_server",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "sql_server",
    "to": "postgresql",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "mysql",
    "to": "sql_server",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "sql_server",
    "to": "mysql",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "oracle_db",
    "to": "sql_server",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "sql_server",
    "to": "oracle_db",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "mongodb",
    "to": "postgresql",
    "relation": "SUBSTITUTE",
    "weight": 0.4,
    "source": "custom",
    "note": ""
  },
  {
    "from": "postgresql",
    "to": "mongodb",
    "relation": "SUBSTITUTE",
    "weight": 0.4,
    "source": "custom",
    "note": ""
  },
  {
    "from": "redis",
    "to": "memcached",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "memcached",
    "to": "redis",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "kafka",
    "to": "rabbitmq",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom"
  },
  {
    "from": "rabbitmq",
    "to": "kafka",
    "relation": "SUBSTITUTE",
    "weight": 0.65,
    "source": "custom"
  },
  {
    "from": "elasticsearch",
    "to": "mongodb",
    "relation": "COMPLEMENT",
    "weight": 0.2,
    "source": "custom"
  },
  {
    "from": "kubernetes",
    "to": "docker",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "docker",
    "to": "kubernetes",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "docker",
    "to": "podman",
    "relation": "SUBSTITUTE",
    "weight": 0.9,
    "source": "custom",
    "note": ""
  },
  {
    "from": "podman",
    "to": "docker",
    "relation": "SUBSTITUTE",
    "weight": 0.9,
    "source": "custom",
    "note": ""
  },
  {
    "from": "aws",
    "to": "gcp",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "gcp",
    "to": "aws",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "aws",
    "to": "azure",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "azure",
    "to": "aws",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "azure",
    "to": "gcp",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "gcp",
    "to": "azure",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "github_actions",
    "to": "cicd",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "gitlab_ci",
    "to": "cicd",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "jenkins",
    "to": "cicd",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "github_actions",
    "to": "gitlab_ci",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "gitlab_ci",
    "to": "github_actions",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "jenkins",
    "to": "github_actions",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": ""
  },
  {
    "from": "github_actions",
    "to": "jenkins",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "nginx",
    "to": "linux",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "terraform",
    "to": "aws",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "terraform",
    "to": "ansible",
    "relation": "SUBSTITUTE",
    "weight": 0.6,
    "source": "custom",
    "note": ""
  },
  {
    "from": "ansible",
    "to": "terraform",
    "relation": "SUBSTITUTE",
    "weight": 0.6,
    "source": "custom",
    "note": ""
  },
  {
    "from": "prometheus_grafana",
    "to": "kubernetes",
    "relation": "COMPLEMENT",
    "weight": 0.2,
    "source": "custom"
  },
  {
    "from": "git_vcs",
    "to": "github_actions",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "automation_testing",
    "to": "software_testing",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "software_testing",
    "to": "automation_testing",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "cypress",
    "to": "playwright",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "playwright",
    "to": "cypress",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "selenium",
    "to": "cypress",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": ""
  },
  {
    "from": "cypress",
    "to": "selenium",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "cypress",
    "to": "automation_testing",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "playwright",
    "to": "automation_testing",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "jest_testing",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "deep_learning",
    "to": "machine_learning",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "machine_learning",
    "to": "deep_learning",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Machine Learning là nền tảng thuật toán của Deep Learning"
  },
  {
    "from": "pytorch",
    "to": "deep_learning",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "tensorflow",
    "to": "deep_learning",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "pytorch",
    "to": "tensorflow",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "tensorflow",
    "to": "pytorch",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "scikit_learn",
    "to": "machine_learning",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "scikit_learn",
    "to": "python",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Scikit-Learn là thư viện cốt lõi viết trên Python, ngụ ý thành thạo Python"
  },
  {
    "from": "pandas_lib",
    "to": "data_analysis",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "numpy_lib",
    "to": "data_analysis",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "pandas_lib",
    "to": "python",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Pandas là thư viện Data Science chuẩn của Python"
  },
  {
    "from": "data_analysis",
    "to": "sql_analytics",
    "relation": "COMPLEMENT",
    "weight": 0.4,
    "source": "custom"
  },
  {
    "from": "power_bi",
    "to": "tableau",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "tableau",
    "to": "power_bi",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "power_bi",
    "to": "data_analysis",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "llm_prompting",
    "to": "nlp",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "computer_vision",
    "to": "deep_learning",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "external_audit",
    "to": "accounting_general",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "accounting_general",
    "to": "external_audit",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "internal_audit",
    "to": "accounting_general",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "internal_audit",
    "to": "external_audit",
    "relation": "SUBSTITUTE",
    "weight": 0.5,
    "source": "custom",
    "note": ""
  },
  {
    "from": "external_audit",
    "to": "internal_audit",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "tax_accounting",
    "to": "accounting_general",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "financial_reporting",
    "to": "accounting_general",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "receivable_accounting",
    "to": "accounting_general",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "inventory_accounting",
    "to": "accounting_general",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "payroll_accounting",
    "to": "accounting_general",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "ifrs_standards",
    "to": "vas_standards",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "vas_standards",
    "to": "ifrs_standards",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "budget_management",
    "to": "cash_flow_management",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "cash_flow_management",
    "to": "budget_management",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "financial_valuation",
    "to": "financial_analysis",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "financial_analysis",
    "to": "financial_reporting",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "misa_software",
    "to": "fast_software",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "fast_software",
    "to": "misa_software",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "bravo_software",
    "to": "fast_software",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "fast_software",
    "to": "bravo_software",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "bravo_software",
    "to": "misa_software",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "misa_software",
    "to": "bravo_software",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "sap_erp",
    "to": "misa_software",
    "relation": "SUBSTITUTE",
    "weight": 0.4,
    "source": "custom",
    "note": ""
  },
  {
    "from": "misa_software",
    "to": "sap_erp",
    "relation": "SUBSTITUTE",
    "weight": 0.35,
    "source": "custom",
    "note": ""
  },
  {
    "from": "acca_cert",
    "to": "ifrs_standards",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "acca_cert",
    "to": "accounting_general",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "cpa_cert",
    "to": "accounting_general",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "cfa_cert",
    "to": "financial_analysis",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "excel_advanced",
    "to": "accounting_general",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "google_ads",
    "to": "meta_ads",
    "relation": "SUBSTITUTE",
    "weight": 0.6,
    "source": "custom",
    "note": ""
  },
  {
    "from": "meta_ads",
    "to": "google_ads",
    "relation": "SUBSTITUTE",
    "weight": 0.6,
    "source": "custom",
    "note": ""
  },
  {
    "from": "performance_marketing",
    "to": "meta_ads",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "performance_marketing",
    "to": "google_ads",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "google_ads",
    "to": "seo",
    "relation": "COMPLEMENT",
    "weight": 0.25,
    "source": "custom"
  },
  {
    "from": "seo",
    "to": "google_ads",
    "relation": "COMPLEMENT",
    "weight": 0.2,
    "source": "custom"
  },
  {
    "from": "seo",
    "to": "digital_marketing",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom",
    "note": "SEO là một kênh trong Digital Marketing, nắm SEO đóng góp một phần nhỏ cho tổng thể marketing số"
  },
  {
    "from": "digital_marketing",
    "to": "seo",
    "relation": "FOUNDATION",
    "weight": 0.45,
    "source": "custom",
    "note": "Digital Marketing bao hàm nền tảng chiến lược cho kênh SEO"
  },
  {
    "from": "content_marketing",
    "to": "social_media_marketing",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "social_media_marketing",
    "to": "brand_marketing",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "email_marketing",
    "to": "digital_marketing",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom",
    "note": "Email marketing là một nhánh kỹ năng của Digital Marketing"
  },
  {
    "from": "ga4_analytics",
    "to": "digital_marketing",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "b2b_sales",
    "to": "sales_negotiation",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "key_account_management",
    "to": "b2b_sales",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "telesales",
    "to": "retail_sales",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "retail_sales",
    "to": "telesales",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "distribution_channel",
    "to": "b2b_sales",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "hubspot_crm",
    "to": "salesforce_crm",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "salesforce_crm",
    "to": "hubspot_crm",
    "relation": "SUBSTITUTE",
    "weight": 0.75,
    "source": "custom",
    "note": ""
  },
  {
    "from": "hubspot_crm",
    "to": "crm",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "salesforce_crm",
    "to": "crm",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "talent_acquisition",
    "to": "onboarding_hr",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "talent_acquisition",
    "to": "cb_management",
    "relation": "COMPLEMENT",
    "weight": 0.25,
    "source": "custom"
  },
  {
    "from": "cb_management",
    "to": "talent_acquisition",
    "relation": "COMPLEMENT",
    "weight": 0.2,
    "source": "custom"
  },
  {
    "from": "cb_management",
    "to": "social_insurance",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "cb_management",
    "to": "labor_law",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "labor_relations",
    "to": "labor_law",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "training_development",
    "to": "performance_appraisal",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "employer_branding",
    "to": "talent_acquisition",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "hris_system",
    "to": "cb_management",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "figma",
    "to": "adobe_xd",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "adobe_xd",
    "to": "figma",
    "relation": "SUBSTITUTE",
    "weight": 0.85,
    "source": "custom",
    "note": ""
  },
  {
    "from": "figma",
    "to": "ui_ux_design",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "adobe_xd",
    "to": "ui_ux_design",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "photoshop",
    "to": "illustrator",
    "relation": "SUBSTITUTE",
    "weight": 0.5,
    "source": "custom",
    "note": ""
  },
  {
    "from": "illustrator",
    "to": "photoshop",
    "relation": "SUBSTITUTE",
    "weight": 0.5,
    "source": "custom",
    "note": ""
  },
  {
    "from": "photoshop",
    "to": "graphic_design",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "illustrator",
    "to": "graphic_design",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "premiere_pro",
    "to": "davinci_resolve",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "davinci_resolve",
    "to": "premiere_pro",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": ""
  },
  {
    "from": "after_effects",
    "to": "motion_graphics",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "premiere_pro",
    "to": "after_effects",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "blender_3d",
    "to": "motion_graphics",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "typography",
    "to": "graphic_design",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "warehouse_management",
    "to": "inventory_control",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "supply_chain_management",
    "to": "procurement",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "supply_chain_management",
    "to": "logistics_coordination",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "import_export",
    "to": "customs_clearance",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "import_export",
    "to": "incoterms",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "warehouse_management",
    "to": "transportation_management",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "transportation_management",
    "to": "warehouse_management",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "production_planning",
    "to": "inventory_control",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "complaint_handling",
    "to": "customer_service",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "call_center",
    "to": "customer_service",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "helpdesk_support",
    "to": "customer_service",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "csat_nps",
    "to": "customer_service",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "contract_drafting",
    "to": "corporate_law",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "legal_compliance",
    "to": "corporate_law",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "intellectual_property",
    "to": "corporate_law",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "litigation_dispute",
    "to": "corporate_law",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "autocad_design",
    "to": "solidworks",
    "relation": "SUBSTITUTE",
    "weight": 0.5,
    "source": "custom",
    "note": ""
  },
  {
    "from": "solidworks",
    "to": "autocad_design",
    "relation": "SUBSTITUTE",
    "weight": 0.5,
    "source": "custom",
    "note": ""
  },
  {
    "from": "solidworks",
    "to": "cnc_machining",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "plc_automation",
    "to": "mechanical_maintenance",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "lean_manufacturing",
    "to": "five_s_kaizen",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "five_s_kaizen",
    "to": "lean_manufacturing",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "six_sigma",
    "to": "lean_manufacturing",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "lean_manufacturing",
    "to": "six_sigma",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "revit_bim",
    "to": "autocad_design",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "construction_cost_estimate",
    "to": "site_supervision",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "site_supervision",
    "to": "construction_safety",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "kitchen_operations",
    "to": "haccp_food_safety",
    "relation": "FOUNDATION",
    "weight": 0.55,
    "source": "custom",
    "note": "Vận hành bếp là môi trường thực hành nền tảng của tiêu chuẩn ATVSTP"
  },
  {
    "from": "restaurant_management",
    "to": "kitchen_operations",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "restaurant_management",
    "to": "hotel_pms",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "bartender_barista",
    "to": "restaurant_management",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "curriculum_design",
    "to": "teaching_pedagogy",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "lms_elearning",
    "to": "teaching_pedagogy",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "agile_scrum",
    "to": "jira",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "jira",
    "to": "agile_scrum",
    "relation": "COMPLEMENT",
    "weight": 0.4,
    "source": "custom"
  },
  {
    "from": "project_management",
    "to": "agile_scrum",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "pmp_cert",
    "to": "project_management",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "leadership",
    "to": "teamwork",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "teamwork",
    "to": "communication_skill",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "problem_solving",
    "to": "communication_skill",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "time_management",
    "to": "project_management",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "ielts_cert",
    "to": "english_language",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "toeic_cert",
    "to": "english_language",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "jlpt_cert",
    "to": "japanese_language",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "hsk_cert",
    "to": "chinese_language",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "data_analysis",
    "to": "financial_analysis",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "financial_analysis",
    "to": "data_analysis",
    "relation": "COMPLEMENT",
    "weight": 0.25,
    "source": "custom"
  },
  {
    "from": "crm",
    "to": "customer_service",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "customer_service",
    "to": "crm",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "payroll_accounting",
    "to": "cb_management",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "cb_management",
    "to": "payroll_accounting",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "midwifery",
    "to": "clinical_nursing",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "clinical_nursing",
    "to": "midwifery",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "medical_laboratory",
    "to": "medical_diagnosis",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "medical_imaging",
    "to": "medical_diagnosis",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "infection_control",
    "to": "patient_care",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "clinical_nutrition",
    "to": "patient_care",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "medical_records_management",
    "to": "medical_diagnosis",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom",
    "note": "Hồ sơ bệnh án EMR/HIS là nguồn dữ liệu bổ trợ cho chẩn đoán lâm sàng"
  },
  {
    "from": "public_health",
    "to": "infection_control",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "classroom_management",
    "to": "teaching_pedagogy",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "student_assessment",
    "to": "teaching_pedagogy",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "early_childhood_education",
    "to": "teaching_pedagogy",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "tesol_tefl",
    "to": "teaching_pedagogy",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "tesol_tefl",
    "to": "english_language",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "edtech_integration",
    "to": "lms_elearning",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "academic_advising",
    "to": "teaching_pedagogy",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "corporate_training",
    "to": "teaching_pedagogy",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "admissions_counseling",
    "to": "academic_advising",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "special_education",
    "to": "teaching_pedagogy",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "structural_design",
    "to": "site_supervision",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "structural_design",
    "to": "revit_bim",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "construction_qa_qc",
    "to": "site_supervision",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "construction_project_scheduling",
    "to": "site_supervision",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "construction_bidding",
    "to": "construction_cost_estimate",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "mep_design",
    "to": "revit_bim",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "sketchup_3dsmax",
    "to": "revit_bim",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "surveying_geodesy",
    "to": "site_supervision",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "concrete_technology",
    "to": "construction_qa_qc",
    "relation": "FOUNDATION",
    "weight": 0.4,
    "source": "custom",
    "note": "Bê tông là vật liệu cơ bản trong QA/QC xây lắp nhưng cần thêm quy trình nghiệm thu"
  },
  {
    "from": "hotel_front_office",
    "to": "hotel_pms",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "hotel_revenue_management",
    "to": "hotel_pms",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "housekeeping_operations",
    "to": "hotel_pms",
    "relation": "COMPLEMENT",
    "weight": 0.25,
    "source": "custom"
  },
  {
    "from": "banquet_event_catering",
    "to": "restaurant_management",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "fnb_service",
    "to": "restaurant_management",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "fnb_service",
    "to": "kitchen_operations",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "tour_guide",
    "to": "tour_operations",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "tour_operations",
    "to": "tour_guide",
    "relation": "SUBSTITUTE",
    "weight": 0.45,
    "source": "custom",
    "note": ""
  },
  {
    "from": "inhouse_counsel",
    "to": "legal_compliance",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "inhouse_counsel",
    "to": "contract_drafting",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "legal_advisory",
    "to": "corporate_law",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "ma_legal_advisory",
    "to": "corporate_law",
    "relation": "IMPLIES",
    "weight": 0.75,
    "source": "custom",
    "note": "M&A là nhánh chuyên sâu đòi hỏi nền tảng pháp chế doanh nghiệp"
  },
  {
    "from": "administrative_licensing",
    "to": "legal_compliance",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "tax_law",
    "to": "corporate_law",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "labor_law_legal",
    "to": "corporate_law",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "banking_finance_law",
    "to": "corporate_law",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "omnichannel_support",
    "to": "customer_service",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "contact_center_qa",
    "to": "call_center",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "customer_onboarding",
    "to": "customer_service",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "zendesk_freshdesk",
    "to": "helpdesk_support",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "telephonic_persuasion",
    "to": "call_center",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "vip_customer_care",
    "to": "customer_service",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "customer_retention",
    "to": "customer_service",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "industrial_electricity",
    "to": "mechanical_maintenance",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "hvac_refrigeration",
    "to": "mechanical_maintenance",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "manufacturing_qc_qa",
    "to": "lean_manufacturing",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "iso_standards_eng",
    "to": "manufacturing_qc_qa",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "autocad_design",
    "to": "technical_drawing_interpretation",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Thành thạo thiết kế AutoCAD bao hàm năng lực đọc hiểu bản vẽ kỹ thuật"
  },
  {
    "from": "technical_drawing_interpretation",
    "to": "autocad_design",
    "relation": "COMPLEMENT",
    "weight": 0.25,
    "source": "custom",
    "note": "Đọc hiểu bản vẽ là nền tảng nhận thức hỗ trợ tiếp cận phần mềm AutoCAD"
  },
  {
    "from": "executive_secretary",
    "to": "office_administration",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "records_document_management",
    "to": "office_administration",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "official_dispatch_drafting",
    "to": "records_document_management",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "stamp_seal_management",
    "to": "records_document_management",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "front_desk_reception",
    "to": "office_administration",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "internal_event_organization",
    "to": "office_administration",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "office_procurement_supplies",
    "to": "company_asset_management",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "company_asset_management",
    "to": "office_administration",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom"
  },
  {
    "from": "business_travel_management",
    "to": "executive_secretary",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "meeting_minutes_preparation",
    "to": "executive_secretary",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom",
    "note": "Ghi biên bản là kỹ năng bổ trợ cho vai trò trợ lý giám đốc"
  },
  {
    "from": "office_safety_hygiene",
    "to": "office_administration",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "copywriting_creative",
    "to": "content_marketing",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "pr_crisis_management",
    "to": "brand_marketing",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "zoho_crm",
    "to": "crm",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "zoho_crm",
    "to": "hubspot_crm",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": ""
  },
  {
    "from": "hubspot_crm",
    "to": "zoho_crm",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": ""
  },
  {
    "from": "sales_pipeline_management",
    "to": "b2b_sales",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "field_sales_canvassing",
    "to": "b2b_sales",
    "relation": "COMPLEMENT",
    "weight": 0.25,
    "source": "custom",
    "note": "Kỹ năng chào hàng trực tiếp hỗ trợ phản xạ giao tiếp nhưng khác biệt với đàm phán hợp đồng B2B"
  },
  {
    "from": "headhunting_executive_search",
    "to": "talent_acquisition",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "corporate_culture_development",
    "to": "employer_branding",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "fleet_management",
    "to": "transportation_management",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "customs_declaration_software",
    "to": "customs_clearance",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom"
  },
  {
    "from": "storybook",
    "to": "react",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "excel_advanced",
    "to": "excel_basic",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "topik_cert",
    "to": "korean_language",
    "relation": "IMPLIES",
    "weight": 0.95,
    "source": "custom"
  },
  {
    "from": "korean_language",
    "to": "communication_skill",
    "relation": "COMPLEMENT",
    "weight": 0.3,
    "source": "custom"
  },
  {
    "from": "word_office",
    "to": "google_workspace",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": ""
  },
  {
    "from": "google_workspace",
    "to": "word_office",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": ""
  },
  {
    "from": "powerpoint_office",
    "to": "google_workspace",
    "relation": "SUBSTITUTE",
    "weight": 0.65,
    "source": "custom",
    "note": ""
  },
  {
    "from": "google_workspace",
    "to": "powerpoint_office",
    "relation": "SUBSTITUTE",
    "weight": 0.65,
    "source": "custom",
    "note": ""
  },
  {
    "from": "excel_basic",
    "to": "google_workspace",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": "Excel cơ bản thay thế tốt Google Sheets trong Google Workspace"
  },
  {
    "from": "sql_analytics",
    "to": "sql_general",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom",
    "note": "SQL phân tích dữ liệu bao hàm gần trọn vẹn SQL thao tác cơ sở dữ liệu chung"
  },
  {
    "from": "presentation_skill",
    "to": "communication_skill",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "general_negotiation",
    "to": "communication_skill",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom"
  },
  {
    "from": "powerpoint_office",
    "to": "presentation_skill",
    "relation": "COMPLEMENT",
    "weight": 0.35,
    "source": "custom"
  },
  {
    "from": "html_css",
    "to": "tailwind",
    "relation": "FOUNDATION",
    "weight": 0.45,
    "source": "custom",
    "note": "HTML/CSS là nền tảng tạo kiểu dáng trực tiếp của Tailwind CSS"
  },
  {
    "from": "nodejs",
    "to": "nestjs",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Node.js là nền tảng runtime của NestJS"
  },
  {
    "from": "nodejs",
    "to": "expressjs",
    "relation": "FOUNDATION",
    "weight": 0.6,
    "source": "custom",
    "note": "Node.js là nền tảng trực tiếp của Express.js"
  },
  {
    "from": "python",
    "to": "django",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Python là ngôn ngữ nền tảng của Django"
  },
  {
    "from": "python",
    "to": "fastapi",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Python là ngôn ngữ nền tảng của FastAPI"
  },
  {
    "from": "python",
    "to": "flask",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Python là ngôn ngữ nền tảng của Flask"
  },
  {
    "from": "java",
    "to": "spring_boot",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Java là ngôn ngữ nền tảng của Spring Boot"
  },
  {
    "from": "php",
    "to": "laravel",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "PHP là ngôn ngữ nền tảng của Laravel"
  },
  {
    "from": "dart",
    "to": "flutter",
    "relation": "FOUNDATION",
    "weight": 0.45,
    "source": "custom",
    "note": "Dart là ngôn ngữ nền tảng của Flutter"
  },
  {
    "from": "deep_learning",
    "to": "pytorch",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Deep Learning là lý thuyết nền tảng khi lập trình PyTorch"
  },
  {
    "from": "deep_learning",
    "to": "tensorflow",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Deep Learning là lý thuyết nền tảng khi lập trình TensorFlow"
  },
  {
    "from": "accounting_general",
    "to": "tax_accounting",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Kế toán tổng hợp là nền tảng trực tiếp của Kế toán thuế"
  },
  {
    "from": "accounting_general",
    "to": "financial_reporting",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Kế toán tổng hợp là nền tảng trực tiếp lập Báo cáo tài chính"
  },
  {
    "from": "digital_marketing",
    "to": "email_marketing",
    "relation": "FOUNDATION",
    "weight": 0.45,
    "source": "custom",
    "note": "Digital Marketing bao hàm nền tảng triển khai Email Marketing"
  },
  {
    "from": "digital_marketing",
    "to": "performance_marketing",
    "relation": "FOUNDATION",
    "weight": 0.45,
    "source": "custom",
    "note": "Digital Marketing là nền tảng trực tiếp của Performance Marketing"
  },
  {
    "from": "customer_service",
    "to": "complaint_handling",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Chăm sóc khách hàng là kỹ năng nền tảng để xử lý khiếu nại"
  },
  {
    "from": "cnc_machining",
    "to": "technical_drawing_interpretation",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom",
    "note": "Vận hành máy CNC bắt buộc phải đọc hiểu bản vẽ kỹ thuật"
  },
  {
    "from": "executive_secretary",
    "to": "meeting_minutes_preparation",
    "relation": "IMPLIES",
    "weight": 0.9,
    "source": "custom",
    "note": "Thư ký & Trợ lý giám đốc bao hàm kỹ năng ghi biên bản cuộc họp"
  },
  {
    "from": "accounting_general",
    "to": "receivable_accounting",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Kế toán tổng hợp bao quát nghiệp vụ kế toán công nợ"
  },
  {
    "from": "accounting_general",
    "to": "inventory_accounting",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Kế toán tổng hợp bao quát nghiệp vụ kế toán kho"
  },
  {
    "from": "accounting_general",
    "to": "payroll_accounting",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Kế toán tổng hợp bao quát nghiệp vụ hạch toán lương"
  },
  {
    "from": "github_actions",
    "to": "git_vcs",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Sử dụng GitHub Actions đòi hỏi thành thạo Git"
  },
  {
    "from": "google_workspace",
    "to": "excel_basic",
    "relation": "SUBSTITUTE",
    "weight": 0.7,
    "source": "custom",
    "note": "Google Sheets trong Google Workspace thay thế tốt Excel cơ bản"
  },
  {
    "from": "corporate_law",
    "to": "contract_drafting",
    "relation": "FOUNDATION",
    "weight": 0.55,
    "source": "custom",
    "note": "Pháp chế doanh nghiệp là nền tảng soạn thảo hợp đồng"
  },
  {
    "from": "customer_service",
    "to": "omnichannel_support",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "CSKH là kỹ năng nền tảng của hỗ trợ đa kênh"
  },
  {
    "from": "customs_clearance",
    "to": "customs_declaration_software",
    "relation": "FOUNDATION",
    "weight": 0.5,
    "source": "custom",
    "note": "Nắm nghiệp vụ hải quan là nền tảng dùng phần mềm khai báo ECUS/VNACCS"
  },

  // --- BASE LANGUAGE IMPLICATIONS ---
  {
    "from": "react",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "React framework ngụ ý thành thạo ngôn ngữ JavaScript"
  },
  {
    "from": "vue",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Vue framework ngụ ý thành thạo ngôn ngữ JavaScript"
  },
  {
    "from": "angular",
    "to": "typescript",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Angular sử dụng TypeScript làm ngôn ngữ chính"
  },
  {
    "from": "angular",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.8,
    "source": "custom",
    "note": "Angular ngụ ý vững nền tảng JavaScript"
  },
  {
    "from": "nodejs",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Node.js runtime ngụ ý lập trình JavaScript"
  },
  {
    "from": "svelte",
    "to": "javascript",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Svelte compiler ngụ ý thành thạo JavaScript"
  },

  // --- RELATIONAL DATABASES TO GENERAL SQL ---
  {
    "from": "mysql",
    "to": "sql_general",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "MySQL ngụ ý thành thạo truy vấn SQL chuẩn"
  },
  {
    "from": "postgresql",
    "to": "sql_general",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "PostgreSQL ngụ ý thành thạo truy vấn SQL chuẩn"
  },
  {
    "from": "sql_server",
    "to": "sql_general",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "SQL Server ngụ ý thành thạo truy vấn SQL chuẩn"
  },
  {
    "from": "oracle_db",
    "to": "sql_general",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "Oracle DB ngụ ý thành thạo truy vấn SQL chuẩn"
  },

  // --- PYTHON ECOSYSTEM & LEGAL/HR CLUSTERS ---
  {
    "from": "numpy_lib",
    "to": "python",
    "relation": "IMPLIES",
    "weight": 0.85,
    "source": "custom",
    "note": "NumPy là thư viện nền tảng của Python Data Science"
  },
  {
    "from": "labor_law_legal",
    "to": "labor_law",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": "Pháp chế lao động đáp ứng phần lớn luật lao động HR"
  },
  {
    "from": "labor_law",
    "to": "labor_law_legal",
    "relation": "SUBSTITUTE",
    "weight": 0.8,
    "source": "custom",
    "note": "Luật lao động HR đáp ứng phần lớn pháp chế lao động"
  }
];