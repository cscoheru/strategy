# 🚀 最终部署指南

## 📋 完整部署步骤

### 1. 配置 Git 认证
```bash
# 设置 Git 使用 HTTPS 协议
git remote set-url origin https://github.com/cscoheru/strategydecoding.git

# 首次推送时会提示输入用户名和密码
# 用户名: cscoheru
# 密码: Lotus781315
git push -u origin main
```

### 2. 手动创建 GitHub 仓库（如果还没创建）
1. 访问：https://github.com
2. 点击 **"+"** → **"New repository"**
3. Repository name: `strategydecoding`
4. ☑️ **Public**（公开）
5. ❌ **不要**勾选 "Add a README"
6. 点击 **"Create repository"**

### 3. 完成推送代码
在终端运行：
```bash
git push -u origin main
```
- 用户名：`cscoheru`
- 密码：`Lotus781315`

### 4. Vercel 部署

#### 4.1 完成 Vercel 登录
访问：https://vercel.com/oauth/device?user_code=VBRX-SWBT
- 登录你的 Vercel 账户
- 授权 CLI 访问

#### 4.2 部署项目
```bash
npx vercel --yes --prod
```

### 5. 验证部署
- 访问公网地址
- 测试所有功能

## 🎯 预期结果
网站将在公网运行，地址格式：
`https://strategydecoding-yourname.vercel.app`

## 🔧 已准备好的文件
- ✅ `package.json` - 移除端口配置
- ✅ `vercel.json` - Vercel 配置
- ✅ `deploy.sh` - 自动化部署脚本
- ✅ 所有代码已提交到 Git

## ⚡ 快速命令
```bash
# 如果需要重新部署
cd /Users/kjonekong/Documents/strategydecoding
./deploy.sh
```

祝部署成功！