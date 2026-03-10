# 🚀 快速部署指南

## 📝 步骤 1：创建 GitHub 公开仓库

1. 访问：https://github.com
2. 点击右上角 **"+"** → **"New repository"**
3. 填写信息：
   - **Repository name**: `strategydecoding`
   - **Description**: `企业战略解码工作台 - Strategic Decoding Workbench`
   - ☑️ **Public**（公开）
   - ❌ **不要**勾选 "Add a README file"
4. 点击 **"Create repository"**

## 📡 步骤 2：推送代码到 GitHub

在终端运行：
```bash
cd /Users/kjonekong/Documents/strategydecoding

# 添加远程仓库
git remote add origin https://github.com/cscoheru/strategydecoding.git

# 推送到 GitHub（输入密码：Lotus781315）
git push -u origin main
```

## 🌐 步骤 3：Vercel 部署

### 3.1 完成 Vercel 登录
打开浏览器访问：https://vercel.com/oauth/device?user_code=VBRX-SWBT
- 登录你的 Vercel 账户
- 授权 CLI 访问权限

### 3.2 部署项目
在终端运行：
```bash
# 部署到 Vercel
npx vercel --prod
```

按照提示操作：
- 选择 "Import Git Repository"
- 选择 `strategydecoding` 仓库
- 确认配置
- 点击 "Deploy"

## 🎯 完成后的访问地址

部署成功后，你的网站将获得类似这样的公网地址：
```
https://strategydecoding-yourname.vercel.app
```

## ✅ 验证部署

1. 访问公网地址
2. 测试以下功能：
   - 首页是否正常显示
   - 设置按钮是否工作
   - AI 配置是否正常
   - 四个工作步骤是否正常

## 📞 需要帮助？

如果在部署过程中遇到问题，请提供具体的错误信息。