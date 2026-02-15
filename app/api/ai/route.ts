import { NextRequest, NextResponse } from 'next/server'

// 智谱 AI 配置（建议放在环境变量中）
const ZHIPU_AI_KEY = process.env.ZHIPU_AI_KEY || ''
const ZHIPU_AI_MODEL = 'glm-4-flash'

// 开发环境默认Key（仅用于本地测试，生产环境必须设置环境变量）
const DEMO_API_KEY = 'sk-demo-key-for-testing-only'

export async function GET(request: NextRequest) {
  // 生产环境必须设置API Key
  if (!ZHIPU_AI_KEY) {
    return NextResponse.json(
      {
        error: '请在 Vercel 项目环境变量中设置 ZHIPU_AI_KEY（智谱AI API Key）\n\n设置方法：\n1. Vercel Dashboard → 项目 → Settings → Environment Variables\n2. 添加变量：ZHIPU_AI_KEY\n3. 值：你的智谱AI API Key（从 https://open.bigmodel.cn/usercenter/apikeys 获取）\n\n本地开发可设置 DEMO_API_KEY 环境变量跳过此检查。',
        status: 500
      }
    )
  }

  return NextResponse.json({
    apiKey: ZHIPU_AI_KEY || DEMO_API_KEY,
    model: ZHIPU_AI_MODEL
  })
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // 生产环境必须设置API Key
    if (!ZHIPU_AI_KEY) {
      return NextResponse.json(
        {
          error: '请在 Vercel 项目环境变量中设置 ZHIPU_AI_KEY（智谱AI API Key）\n\n设置方法：\n1. Vercel Dashboard → 项目 → Settings → Environment Variables\n2. 添加变量：ZHIPU_AI_KEY\n3. 值：你的智谱AI API Key（从 https://open.bigmodel.cn/usercenter/apikeys 获取）\n\n本地开发可设置 DEMO_API_KEY 环境变量跳过此检查。',
          status: 500
        }
      )
    }

    // 调用智谱 AI
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_AI_KEY || DEMO_API_KEY}`
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
