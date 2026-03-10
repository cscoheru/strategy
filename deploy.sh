#!/bin/bash

echo "🚀 自动化部署脚本"
echo "===================="

echo ""
echo "📋 步骤 1：推送代码到 GitHub"
echo "请在终端运行以下命令（输入密码 Lotus781315）："
echo "git push -u origin main"
echo ""

read -p "代码已推送到 GitHub 吗？(y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🌐 步骤 2：Vercel 部署"

    # 检查 Vercel 登录
    if npx vercel whoami > /dev/null 2>&1; then
        echo "✅ Vercel 已登录"

        # 询问是否部署
        read -p "现在部署到 Vercel 吗？(y/n): " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🚀 开始部署..."
            npx vercel --yes --prod
            echo ""
            echo "🎉 部署完成！"
            echo "访问你的网站："
            echo "$(npx vercel ls | grep 'production' | head -1 | awk '{print $2}')"
        fi
    else
        echo "❌ Vercel 未登录"
        echo "请先访问：https://vercel.com/oauth/device?user_code=VBRX-SWBT"
        echo "完成登录后再运行：npx vercel --yes --prod"
    fi
else
    echo "请先推送代码到 GitHub"
fi