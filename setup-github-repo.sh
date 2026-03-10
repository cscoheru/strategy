#!/bin/bash

echo "🚀 设置 GitHub 公开仓库并部署到 Vercel"
echo "============================================"

echo ""
echo "📋 第一步：创建 GitHub 公开仓库"
echo "1. 访问：https://github.com"
echo "2. 点击右上角 '+' → 'New repository'"
echo "3. 填写以下信息："
echo "   - Repository name: strategydecoding"
echo "   - Description: 企业战略解码工作台 - Strategic Decoding Workbench"
echo "   - ☑️ Public（公开）"
echo "   - ❌ 不要勾选 'Add a README file'"
echo "4. 点击 'Create repository'"

echo ""
echo "📡 第二步：推送代码到 GitHub"
echo "运行以下命令："
echo "git remote add origin https://github.com/cscoheru/strategydecoding.git"
echo "git push -u origin main"
echo "（输入密码：Lotus781315）"

echo ""
echo "🌐 第三步：Vercel 部署"
echo "1. 打开浏览器访问：https://vercel.com/oauth/device?user_code=VBRX-SWBT"
echo "2. 登录 Vercel 账户并授权"
echo "3. 完成后运行：npx vercel"
echo "4. 选择 'Import Git Repository' → 'strategydecoding'"
echo "5. 点击 'Deploy'"

echo ""
echo "✅ 完成后，网站将获得公网访问地址！"
echo "============================================"