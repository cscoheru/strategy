/**
 * 通用 AI API 集成服务（支持多供应商）
 */
import { ModelConfig, ModelProvider, PROVIDER_OPTIONS } from '@/types/strategy';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

/**
 * 获取供应商的 API URL 和配置
 */
function getProviderConfig(provider: ModelProvider, baseUrl?: string): { url: string; headers: HeadersInit } {
  switch (provider) {
    case 'zhipu':
      return {
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        headers: {}
      };
    default:
      return {
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        headers: {}
      };
  }
}

/**
 * 构建 API 请求头
 */
function buildHeaders(config: ModelConfig): HeadersInit {
  const { provider, apiKey } = config;

  switch (provider) {
    case 'zhipu':
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };
    default:
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };
  }
}

/**
 * 构建请求体
 */
function buildRequestBody(config: ModelConfig, messages: AIMessage[]): any {
  const model = config.model || PROVIDER_OPTIONS.find(p => p.id === config.provider)?.defaultModel || 'glm-4';

  const body: any = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2000,
  };

  return body;
}

/**
 * 调用 AI API（通用方法）
 */
export async function callAI(
  config: ModelConfig,
  messages: AIMessage[]
): Promise<string> {
  try {
    const providerConfig = getProviderConfig(config.provider, config.baseUrl);
    const headers = buildHeaders(config);
    const body = buildRequestBody(config, messages);

    const response = await fetch(providerConfig.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // 解析响应（兼容不同格式）
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (data.output && data.output.text) {
      // 文心一言格式
      return data.output.text;
    } else if (data.content) {
      // Ollama 格式
      return data.content;
    }

    return '';
  } catch (error: any) {
    console.error('AI API 调用错误:', error);
    throw error;
  }
}

/**
 * Step 1: 生成业绩复盘总结
 */
export async function generateReviewSummary(
  config: ModelConfig,
  goals: string,
  actuals: string
): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你是一位资深的战略咨询顾问，擅长业绩分析和战略规划。请用专业、客观的语言分析业绩差距，指出主要短板和改进方向。'
    },
    {
      role: 'user',
      content: `请分析以下业绩数据，生成一份专业的复盘总结：

去年目标：
${goals}

实际完成：
${actuals}

请重点分析：
1. 主要差距在哪里？
2. 未能达成目标的核心原因
3. 最突出的短板和不足
4. 简明的改进方向建议

请用简洁、专业的商务语言，300-500字。`
    }
  ];

  return callAI(config, messages);
}

/**
 * Step 2: 生成 SWOT 矩阵和战略机会点
 */
export async function generateSWOTAndOpportunities(
  config: ModelConfig,
  trends: string,
  competitors: string,
  advantages: string
): Promise<{ swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }; strategicPoints: string[] }> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你是一位战略专家，擅长SWOT分析和战略机会识别。请基于输入的信息，生成专业的SWOT矩阵和战略机会点。'
    },
    {
      role: 'user',
      content: `请基于以下信息，生成SWOT分析矩阵和战略机会点：

行业趋势：
${trends}

竞争对手情况：
${competitors}

核心优势：
${advantages}

请以JSON格式返回（不要有其他内容，只要纯JSON）：
{
  "swot": {
    "strengths": ["优势1", "优势2", "优势3"],
    "weaknesses": ["劣势1", "劣势2"],
    "opportunities": ["机会1", "机会2", "机会3"],
    "threats": ["威胁1", "威胁2"]
  },
  "strategicPoints": ["战略机会点1", "战略机会点2", "战略机会点3", "战略机会点4", "战略机会点5"]
}

每个SWOT维度列出3-5项，战略机会点列出5项。`
    }
  ];

  const response = await callAI(config, messages);

  // 尝试解析JSON，如果失败则返回默认结构
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('解析SWOT JSON失败:', e);
  }

  // 返回默认结构
  return {
    swot: {
      strengths: ['待分析'],
      weaknesses: ['待分析'],
      opportunities: ['待分析'],
      threats: ['待分析']
    },
    strategicPoints: ['待分析']
  };
}

/**
 * Step 3: 生成建议目标
 */
export async function generateTargets(
  config: ModelConfig,
  summary: string,
  strategicPoints: string[]
): Promise<Array<{ name: string; type: 'revenue' | 'market' | 'other'; currentValue: number; targetValue: number; description: string }>> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你是一位战略规划专家，擅长设定企业年度目标。请基于业绩复盘和战略机会，生成具体的年度目标建议。'
    },
    {
      role: 'user',
      content: `请基于以下信息，生成年度的关键目标建议：

业绩复盘总结：
${summary}

战略机会点：
${strategicPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

请以JSON格式返回（不要有其他内容，只要纯JSON）：
[
  {
    "name": "目标名称（如：营收增长、市场份额等）",
    "type": "revenue" 或 "market" 或 "other",
    "currentValue": 当前数值（数字）,
    "targetValue": 目标数值（数字）,
    "description": "目标描述"
  }
]

生成5-8个关键目标，覆盖财务、市场、产品、运营等维度。`
    }
  ];

  const response = await callAI(config, messages);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((item: any) => ({
        name: item.name || '未命名目标',
        type: item.type || 'other',
        currentValue: Number(item.currentValue) || 0,
        targetValue: Number(item.targetValue) || 0,
        description: item.description || ''
      }));
    }
  } catch (e) {
    console.error('解析目标JSON失败:', e);
  }

  return [];
}

/**
 * Step 4: 生成作战地图
 */
export async function generateExecutionMap(
  config: ModelConfig,
  targets: Array<{ name: string; description: string }>
): Promise<{ keyBattles: Array<{ name: string; description: string; owner: string }>; quarterlyActions: Array<{ quarter: string; action: string; deadline: string }> }> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: '你是一位战略执行专家，擅长将战略目标拆解为具体的行动计划。请基于年度目标，生成关键战役和季度行动计划。'
    },
    {
      role: 'user',
      content: `请基于以下年度目标，生成战略执行方案：

年度目标：
${targets.map((t, i) => `${i + 1}. ${t.name}: ${t.description}`).join('\n')}

请以JSON格式返回（不要有其他内容，只要纯JSON）：
{
  "keyBattles": [
    {
      "name": "战役名称",
      "description": "战役描述",
      "owner": "负责人/部门"
    }
  ],
  "quarterlyActions": [
    {
      "quarter": "Q1/Q2/Q3/Q4",
      "action": "具体行动",
      "deadline": "截止时间"
    }
  ]
}

生成3-5个关键战役，每个季度至少2-3个关键行动。`
    }
  ];

  const response = await callAI(config, messages);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('解析执行方案JSON失败:', e);
  }

  return {
    keyBattles: [],
    quarterlyActions: []
  };
}
