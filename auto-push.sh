#!/bin/bash

echo "🚀 自动推送脚本"
echo "=============="

echo "配置 Git 认证..."
git config --global credential.helper store

echo "添加所有文件..."
git add .

echo "提交更改..."
git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "请手动完成以下步骤："
echo "1. 在终端运行: git push -u origin main"
echo "2. 输入用户名: cscoheru"
echo "3. 输入密码: Lotus781315"
echo ""
echo "完成推送后，运行:"
echo "npx vercel --yes --prod"