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

// ========== 客户需求洞察模块 ==========
export interface CustomerInsight {
  profile: string;           // 典型客户画像
  kbf: string[];             // 关键购买因素 (Key Buying Factors)
  kbfLocked: boolean;        // 是否已确认
}

// ========== 竞对优势分析模块 ==========
export interface CompetitorAdvantage {
  id: string;
  competitorName: string;
  advantage: string;         // 竞对的核心必杀技
  category?: string;         // 可选：优势分类
}

export interface CompetitorAnalysis {
  advantages: CompetitorAdvantage[];
  searchResults?: string;    // 用户粘贴的搜索结果
  analysisLocked: boolean;   // 是否已确认
}

export interface Step2Data {
  // 原始输入
  trends: string;
  trendsFile?: { name: string; content: string };
  competitors: string;
  competitorsFile?: { name: string; content: string };
  companyInfo: string;

  // 客户需求洞察（新增）
  customerInsight: CustomerInsight;

  // 竞对优势分析（新增）
  competitorAnalysis: CompetitorAnalysis;

  // KSF 分析（增强版，带推导理由）
  ksfDimensions: KSFDimension[];
  ksfLocked: boolean;

  // 竞争力对标
  benchmarkScores: BenchmarkScore[];
  benchmarkLocked: boolean;

  // SWOT（基于以上分析生成）
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategicPoints: string[];
}

export interface KSFDimension {
  id: string;
  name: string;
  description: string;
  reasoning: string;         // 新增：推导理由（显示为什么推荐这个KSF）
}

export interface BenchmarkScore {
  dimensionId: string;
  dimensionName: string;
  myScore: number; // 1-10
  competitorScore: number; // 1-10
  ranking: 'high' | 'medium' | 'low';
}

export interface Target {
  name: string;
  type: 'revenue' | 'market' | 'other';
  currentValue: number;
  targetValue: number;
  description: string;
}

export interface Step3Data {
  targets: Target[];
}

export interface KeyBattle {
  name: string;
  description: string;
  owner: string;
}

export interface QuarterlyAction {
  quarter: string;
  action: string;
  deadline: string;
}

export interface Step4Data {
  keyBattles: KeyBattle[];
  quarterlyActions: QuarterlyAction[];
}

export interface StrategicData {
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
}

export type Step = 1 | 2 | 3 | 4 | 'report';

// 模型供应商类型
export type ModelProvider = 'zhipu' | 'openai' | 'qwen' | 'deepseek' | 'wenxin' | 'ollama' | 'custom';

export interface ModelConfig {
  provider: ModelProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface CompanyInfo {
  name: string;
  industry: string;
}

export interface ProviderOption {
  id: ModelProvider;
  name: string;
  models: string[];
  defaultModel: string;
  requiresBaseUrl: boolean;
  baseUrlPlaceholder: string;
  helpUrl?: string;
}

export const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    id: 'zhipu',
    name: '智谱 AI (GLM-4)',
    models: ['glm-4-flash', 'glm-4', 'glm-4-plus', 'glm-3-turbo'],
    defaultModel: 'glm-4-flash',
    requiresBaseUrl: false,
    baseUrlPlaceholder: '',
    helpUrl: 'https://open.bigmodel.cn/usercenter/apikeys'
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4)',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o',
    requiresBaseUrl: false,
    baseUrlPlaceholder: '',
    helpUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'qwen',
    name: '通义千问',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    defaultModel: 'qwen-plus',
    requiresBaseUrl: false,
    baseUrlPlaceholder: '',
    helpUrl: 'https://bailian.console.aliyun.com/'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
    defaultModel: 'deepseek-chat',
    requiresBaseUrl: false,
    baseUrlPlaceholder: '',
    helpUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    id: 'wenxin',
    name: '文心一言 (ERNIE)',
    models: ['ernie-4.0', 'ernie-3.5', 'ernie-speed'],
    defaultModel: 'ernie-3.5',
    requiresBaseUrl: false,
    baseUrlPlaceholder: '',
    helpUrl: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Nlks5zkzu'
  },
  {
    id: 'ollama',
    name: 'Ollama (本地模型)',
    models: ['llama2', 'mistral', 'codellama', 'custom'],
    defaultModel: 'llama2',
    requiresBaseUrl: true,
    baseUrlPlaceholder: 'http://localhost:11434',
    helpUrl: 'https://ollama.ai/'
  },
  {
    id: 'custom',
    name: '自定义 API',
    models: [],
    defaultModel: 'custom-model',
    requiresBaseUrl: true,
    baseUrlPlaceholder: 'https://api.example.com/v1',
    helpUrl: ''
  }
];
