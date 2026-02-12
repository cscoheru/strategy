# Vercel 部署指南

## 环境变量配置

### 重要说明
部署到 Vercel 后，必须配置以下环境变量，否则云端登录功能将无法使用。

### 配置步骤

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目：`strategy-kappa`
3. 进入项目 **Settings** → **Environment Variables**
4. 添加以下环境变量：

### 必需的环境变量

```bash
# Supabase 配置（从 Supabase 控制台获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 获取 Supabase 配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目：`zfmopehdntuhpprqzmhu`
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 部署后验证

部署完成后，访问网站并检查：

1. ✅ 右上角"登录"按钮是否可点击
2. ✅ 点击登录，跳转到登录页面
3. ✅ 输入邮箱和密码，可以正常注册/登录
4. ✅ 登录后，数据保存到云端

### 故障排查

#### 问题：登录按钮不可用
**原因**：Supabase 环境变量未配置
**解决**：按照上述步骤添加环境变量，然后重新部署

#### 问题：注册提示"请先验证邮箱"
**原因**：Supabase 默认开启邮箱验证
**解决**：
1. 进入 Supabase Dashboard → **Authentication** → **Providers**
2. 找到 **Email** provider
3. 关闭 **Confirm email** 选项
4. 或者使用以下代码跳过验证（已实现）

#### 问题：远程访问提示"Supabase not configured"
**原因**：环境变量在 Vercel 上未正确传递
**解决**：
1. 确认环境变量名称完全一致（区分大小写）
2. 确认值没有多余的空格或引号
3. 重新部署项目（push 到 GitHub 或在 Vercel 手动部署）

### 环境变量检查

添加以下代码到任意页面，检查环境变量是否正确加载：

```typescript
// 仅开发环境显示
if (process.env.NODE_ENV === 'development') {
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置');
}
```

### 本地开发配置

在 `.env.local` 文件中添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zfmopehdntuhpprqzmhu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**注意**：
- `.env.local` 文件不会被 Git 追踪
- 不要提交包含敏感信息的环境变量到代码仓库
- 每位开发者需要自己的 `.env.local` 文件

### 生产环境建议

1. **关闭邮箱验证**：提升用户体验，注册后直接使用
2. **启用邮件服务**：如需邮箱验证功能，配置 SMTP 服务器
3. **设置密码策略**：在 Supabase Dashboard 中配置密码复杂度要求
4. **监控日志**：定期检查 Supabase Logs 和 Vercel Logs

### 数据库设置

如果还未创建 Supabase 表，请执行：

```sql
-- 创建 strategies 表
CREATE TABLE IF NOT EXISTS strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step1_data JSONB,
  step2_data JSONB,
  step3_data JSONB,
  step4_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own strategies"
  ON strategies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own strategies"
  ON strategies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own strategies"
  ON strategies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own strategies"
  ON strategies FOR DELETE USING (auth.uid() = user_id);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 联系支持

如有问题，请检查：
- Vercel 部署日志
- Supabase Dashboard 日志
- 浏览器控制台错误（F12）
