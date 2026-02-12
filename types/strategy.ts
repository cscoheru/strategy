// 3力3平台维度定义
export type DimensionType =
  | 'sales'        // 销售力
  | 'product'      // 产品力
  | 'delivery'     // 交付力
  | 'hr'           // 人力资源
  | 'finance'      // 财务物资
  | 'digital';     // 流程数字化

export interface DimensionCard {
  id: DimensionType;
  name: string;
  category: 'force' | 'platform'; // force = 3力, platform = 3平台
  isHighlighted: boolean; // AI 标记为可能的问题领域
  reason: string; // AI 给出的初步理由
  score: number; // 问题可能性评分 0-100
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
}

export interface DiagnosticSession {
  selectedDimension: DimensionType | null;
  messages: ChatMessage[];
  rootCause: string | null;
  isCompleted: boolean;
}

export interface Step1Data {
  goals: string;
  actuals: string;
  summary: string;
  dimensions: DimensionCard[];
  diagnosticSession: DiagnosticSession;
  rootCause: string; // 最终锁定的核心短板
}

// ========== Step 2 数据结构 ==========
// 客户需求洞察
export interface CustomerInsight {
  profile: string;
  kbf: string[];
  kbfLocked: boolean;
}

// 竞对优势分析
export interface CompetitorAdvantage {
  id: string;
  competitorName: string;
  advantage: string;
  category?: string;
}

export interface CompetitorAnalysis {
  advantages: CompetitorAdvantage[];
  searchResults?: string;
  analysisLocked: boolean;
}

// KSF 维度（带推导理由）
export interface KSFDimension {
  id: string;
  name: string;
  description: string;
  reasoning: string;
}

// 竞争对标评分
export interface BenchmarkScore {
  dimensionId: string;
  dimensionName: string;
  myScore: number;
  competitorScore: number;
  ranking: 'high' | 'medium' | 'low';
}

// 洞察小结（新增）
export interface InsightSummary {
  strengths: string;   // 用户手动总结或 AI 生成的优势
  weaknesses: string;  // 用户手动总结或 AI 生成的劣势
  opportunities: string; // 用户手动总结或 AI 生成的机会
  threats: string;    // 用户手动总结或 AI 生成的威胁
}

// 产品-客户矩阵（新增）
export interface ProductCustomerMatrix {
  marketPenetration: string[];   // 老客户+老产品
  productDevelopment: string[];    // 老客户+新产品
  marketDevelopment: string[];    // 新客户+老产品
  diversification: string[];       // 新客户+新产品
}

export interface Step2Data {
  // 原始输入
  trends: string;
  trendsFile?: { name: string; content: string };
  competitors: string;
  competitorsFile?: { name: string; content: string };
  companyInfo: string;

  // 客户需求洞察
  customerInsight: CustomerInsight;

  // 竞对优势分析
  competitorAnalysis: CompetitorAnalysis;

  // KSF 分析
  ksfDimensions: KSFDimension[];
  ksfLocked: boolean;

  // 竞争力对标
  benchmarkScores: BenchmarkScore[];
  benchmarkLocked: boolean;

  // 洞察小结（新增）
  insightSummary?: InsightSummary;

  // SWOT（合并洞察小结 + 对标推导）
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  swotLocked?: boolean;

  // TOWS 交叉策略推演
  towsStrategies?: {
    so: string[];
    wo: string[];
    st: string[];
    wt: string[];
  };
  towsGenerated?: boolean;

  // 战略方向决策
  strategicDirection?: string;
  aiStrategicRecommendation?: string;

  // 产品-客户矩阵
  productCustomerMatrix?: ProductCustomerMatrix;
  matrixGenerated?: boolean;
}

// ========== Step 3 数据结构 ==========
export interface MatrixData {
  oldClients: string[];    // 老客户/存量市场
  newClients: string[];    // 新客户/增量市场
  oldProducts: string[];   // 原有产品/服务
  newProducts: string[];   // 新产品/服务
  values: {
    [key: string]: number;  // 格式: "client_id_product_id": 金额
  };
}

export interface CalculatedTargets {
  base: number;      // 保底目标
  standard: number;   // 达标目标
  challenge: number;    // 挑战目标
}

export interface Step3Data {
  matrixData: MatrixData;
  calculatedTargets: CalculatedTargets;
  confidenceIndex: number; // 信心指数 100-200
}

// ========== Step 4 数据结构（保留，后续开发）==========
export interface ExecutionTask {
  id: string;
  title: string;
  description: string;
  quadrant: 'marketPenetration' | 'productDevelopment' | 'marketDevelopment' | 'diversification';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  assignee?: string;
  status: 'pending' | 'inProgress' | 'completed';
}

export interface Step4Data {
  tasks: ExecutionTask[];
  ganttChart?: any;
}

// ========== 全局数据结构 ==========
export interface StrategicData {
  step1: Step1Data;
  step2: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
}

export interface ModelConfig {
  provider: 'zhipu';
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface CompanyInfo {
  name: string;
  industry: string;
}
