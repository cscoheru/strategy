# Vercel 环境变量设置指南

## 📋 项目信息
- **项目名称**: Strategy Decoding (战略解码工作台)
- **项目类型**: Next.js 14+ (App Router)
- **当前目录**: /Users/kjonekong/Documents/strategydecoding
- **Git仓库**: github.com:cscoheru/strategy.git

## 🚨 问题描述
远程访问（Vercel 部署）时提示"请在环境变量中配置 ZHIPU_AI_KEY"

## ✅ 解决方案

### 方法 1：在 Vercel 项目中设置环境变量（推荐）
1. 打开 Vercel Dashboard：https://vercel.com/username/dashboard
2. 找到项目：`strategydecoding`
3. 进入：Settings → Environment Variables
4. 点击：Add New 添加新变量：
   - **Key**: `ZHIPU_AI_KEY`
   - **Value**: 你的智谱AI API Key（从 https://open.bigmodel.cn/usercenter/apikeys 获取）
   - **解释**：在 Vercel 环境变量中设置，Next.js后端会自动读取
5. 点击：Save 保存
6. 等待 1-2 分钟自动重新部署

### 方法 2：本地开发测试（备用）
1. 在本地创建 `.env.local` 文件
2. 添加环境变量：
   ```bash
   echo "ZHIPU_AI_KEY=your-actual-api-key-here" >> .env.local
   ```

## 🔍 验证步骤

设置完成后，重新访问网站：
- 🌐 https://3strategy.cc/
- 🌐 https://strategy-kappa.vercel.app/

## ⚠️ 注意事项

1. **不要在代码中硬编码 API Key**（已通过后端 API 路由解决）
2. **生产环境必须使用 Vercel 环境变量**
3. **本地开发可使用 `.env.local` 文件**
4. **环境变量优先级**: Vercel > .env.local > 硬编码
5. **Vercel 免费额度**：免费版每月 1亿次调用

## 📚 相关链接

- **智谱 AI 文档**: https://open.bigmodel.cn/dev/api
- **API Key 获取**: https://open.bigmodel.cn/usercenter/apikeys
- **Vercel 文档**: https://vercel.com/docs
- **项目仓库**: github.com:cscoheru/strategy.git

## 🎯 项目结构说明

当前项目是 Next.js App，包含以下核心功能：
- **Step 1**: 根因分析（5 Dimensions + 2 Diagnostic Sessions）
- **Step 2**: SWOT 分析 + 产品客户矩阵
- **Step 3**: 目标设定（保底/达标/挑战）
- **Step 4**: BSC 平衡计分卡（4 Layers + 可视化连线）
- **AI 助手**: 智谱 AI 集成（基于 BSC 数据分析）

## 📞 下一步计划

用户需要创建全新项目：`/Users/kjonekong/Documents/aiWebsite`

---

**准备好清空退出并开始新项目了吗？**
- 需要我继续添加功能或进行其他修改？
- 需要创建新项目的初始化脚本？
- 还有其他需要处理的任务？

请确认后我将清空当前工作目录并退出。

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
