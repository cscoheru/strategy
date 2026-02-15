# Vercel 环境变量设置指南

## 🚨 问题描述
远程访问时提示"请在环境变量中配置 ZHIPU_AI_KEY"

## ✅ 解决方案

### 方法 1：在 Vercel 项目中设置环境变量（推荐）

1. 访问 Vercel Dashboard：https://vercel.com/username/dashboard
2. 选择项目：`strategydecoding`
3. 进入项目 → Settings → Environment Variables
4. 点击 "Add New" 添加新变量：
   - **Key**: `ZHIPU_AI_KEY`
   - **Value**: 你的智谱AI API Key（从 https://open.bigmodel.cn/usercenter/apikeys 获取）
5. 点击 "Save" 保存
6. 等待1-2分钟自动重新部署

### 方法 2：本地开发测试（跳过环境变量检查）

如果你是开发人员，可以在本地 `.env` 文件中设置测试Key：

```bash
# 复制示例环境变量
cp .env.example .env.local

# 编辑 .env.local，添加你的API Key
echo "ZHIPU_AI_KEY=your-actual-api-key-here" >> .env.local
```

## 📋 环境变量说明

### ZHIPU_AI_KEY
- **作用**: 智谱AI API密钥
- **获取地址**: https://open.bigmodel.cn/usercenter/apikeys
- **格式**: `sk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### DEMO_API_KEY（本地测试用）
- **作用**: 仅用于本地开发测试
- **优先级**: 低于 `ZHIPU_AI_KEY`（当环境变量存在时优先使用环境变量）

## 🔍 验证步骤

设置完成后，重新访问网站：
- https://3strategy.cc/
- https://strategy-kappa.vercel.app/

## ⚠️ 注意事项

1. **不要在代码中硬编码 API Key**
2. **生产环境必须使用 Vercel 环境变量**
3. **本地开发可使用 `.env.local` 文件**

## 📞 需要帮助？

- 智谱AI 文档: https://open.bigmodel.cn/dev/api
- 获取 API Key: https://open.bigmodel.cn/usercenter/apikeys
- Vercel 部署文档: https://vercel.com/docs
