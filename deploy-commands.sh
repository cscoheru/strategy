#!/bin/bash

# Git 配置
git config --global user.name "cscoheru"
git config --global user.email "cscoheru@example.com"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/strategydecoding.git

# 推送到 GitHub（需要输入密码 Lotus781315）
git push -u origin main

echo "代码已推送到 GitHub！"