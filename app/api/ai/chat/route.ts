import { NextRequest, NextResponse } from 'next/server';

// 智谱 AI 配置
const ZHIPU_AI_KEY = process.env.ZHIPU_AI_KEY || '';
const ZHIPU_AI_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export async function POST(request: NextRequest) {
  // 生产环境必须设置API Key
  if (!ZHIPU_AI_KEY) {
    return NextResponse.json(
      { error: '请在 Vercel 项目环境变量中设置 ZHIPU_AI_KEY' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await request.json();

    const response = await fetch(ZHIPU_AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_AI_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      content: data.choices[0]?.message?.content || ''
    });
  } catch (error: any) {
    console.error('AI Chat API 错误:', error);
    return NextResponse.json(
      { error: error.message || 'AI 服务暂时不可用' },
      { status: 500 }
    );
  }
}
