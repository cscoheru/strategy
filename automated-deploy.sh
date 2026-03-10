#!/bin/bash

echo "🚀 自动化部署脚本"
echo "===================="

# 等待你完成 GitHub 仓库创建
echo ""
echo "📋 请先完成以下手动步骤："
echo ""
echo "1️⃣ 创建 GitHub 公开仓库："
echo "   - 访问：https://github.com"
echo "   - '+' → 'New repository'"
echo "   - Name: strategydecoding"
echo "   - Description: 企业战略解码工作台"
echo "   - ☑️ Public (公开)"
echo "   - ❌ 不勾选 'Add a README'"
echo "   - 点击 'Create repository'"
echo ""
echo "2️⃣ 推送代码："
echo "   git remote add origin https://github.com/cscoheru/strategydecoding.git"
echo "   git push -u origin main"
echo "   （密码：Lotus781315）"
echo ""

# 等待用户确认
read -p "GitHub 仓库创建完成了吗？(y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 开始 Vercel 部署..."

    # 检查 Vercel 登录状态
    if npx vercel whoami > /dev/null 2>&1; then
        echo "✅ Vercel 已登录"

        # 部署到 Vercel
        echo "🚀 开始部署..."
        npx vercel --prod

        echo ""
        echo "🎉 部署完成！"
        echo "访问你的网站："
        echo "$(npx vercel ls | grep 'production' | awk '{print $2}')"
    else
        echo "❌ Vercel 未登录，请先访问："
        echo "https://vercel.com/oauth/device?user_code=VBRX-SWBT"
        echo "完成登录后再运行此脚本"
    fi
else
    echo "请完成 GitHub 仓库创建后再运行此脚本"
fi