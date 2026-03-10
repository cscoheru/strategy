#!/bin/bash

echo "🔧 修复 Vercel 部署问题"
echo "========================"

# 步骤 1: 确保代码已推送到 GitHub
echo "📤 检查 GitHub 状态..."
git status
git remote -v

# 步骤 2: 强制使用个人账户部署
echo "🚀 尝试个人账户部署..."
npx vercel logout
npx vercel login --help

# 步骤 3: 手动创建项目
echo "📋 在浏览器中创建项目..."
echo "1. 访问: https://vercel.com/dashboard"
echo "2. 点击 'New Project'"
echo "3. 选择 'Import Git Repository'"
echo "4. 选择 strategydecoding 仓库"
echo "5. 点击 'Deploy'"

# 步骤 4: 提供替代方案
echo ""
echo "💡 如果自动部署仍然失败，请："
echo "1. 访问 Vercel Dashboard 手动创建项目"
echo "2. 或使用 GitHub 集成自动部署"
echo ""
echo "🔗 预期部署地址："
echo "https://strategydecoding.vercel.app"