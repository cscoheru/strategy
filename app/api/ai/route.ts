import { NextRequest, NextResponse } from 'next/server'

// 智谱 AI 配置（建议放在环境变量中）
const ZHIPU_AI_KEY = process.env.ZHIPU_AI_KEY || ''
const ZHIPU_AI_MODEL = 'glm-4-flash'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    apiKey: ZHIPU_AI_KEY,
    model: ZHIPU_AI_MODEL
  })
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!ZHIPU_AI_KEY) {
      return NextResponse.json(
        { error: '请在环境变量中配置 ZHIPU_AI_KEY' },
        { status: 500 }
      )
    }

    // 调用智谱 AI
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_AI_KEY}`
      },
      body: JSON.stringify({
        model: ZHIPU_AI_MODEL,
        messages: messages || []
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error?.message || 'AI 请求失败' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'AI 服务异常' },
      { status: 500 }
    )
  }
}
