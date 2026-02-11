# Supabase 数据库设置指南

本文档介绍如何在 Supabase 中设置数据库表和 RLS 策略。

## 1. 创建数据库表

在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL：

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

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategies_updated_at ON strategies(updated_at DESC);

-- 创建自动更新 updated_at 的触发器
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

## 2. 启用 Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
```

## 3. 创建 RLS 策略

这些策略确保用户只能访问自己的数据：

```sql
-- 允许已认证用户查看自己的数据
CREATE POLICY "Users can view own strategies"
  ON strategies FOR SELECT
  USING (auth.uid() = user_id);

-- 允许已认证用户插入自己的数据
CREATE POLICY "Users can insert own strategies"
  ON strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许已认证用户更新自己的数据
CREATE POLICY "Users can update own strategies"
  ON strategies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 允许已认证用户删除自己的数据
CREATE POLICY "Users can delete own strategies"
  ON strategies FOR DELETE
  USING (auth.uid() = user_id);
```

## 4. 验证设置

在 Supabase Dashboard 的 **Table Editor** 中检查：

1. `strategies` 表已创建
2. RLS 已启用
3. 四个策略都已创建：
   - Users can view own strategies
   - Users can insert own strategies
   - Users can update own strategies
   - Users can delete own strategies

## 5. 测试数据同步

1. 运行应用并注册/登录
2. 填写 Step 1 的数据
3. 在 Supabase Dashboard 的 **Table Editor** 中检查 `strategies` 表
4. 应该能看到一条记录，`step1_data` 字段包含填写的数据

## 数据结构说明

每个策略记录包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（外键关联 auth.users） |
| step1_data | JSONB | Step 1 数据：业绩回顾 |
| step2_data | JSONB | Step 2 数据：市场与机会 |
| step3_data | JSONB | Step 3 数据：目标设定 |
| step4_data | JSONB | Step 4 数据：任务分解 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

## 故障排查

### 问题：登录后数据不同步到数据库

**解决方案：**
1. 检查 `.env.local` 中的 Supabase URL 和 Key 是否正确
2. 在浏览器控制台检查是否有错误信息
3. 在 Supabase Dashboard 检查 RLS 策略是否已启用

### 问题：注册时提示 "Email not confirmed"

**解决方案：**
默认情况下，Supabase 需要邮箱验证。可以关闭此要求：

1. 进入 Supabase Dashboard
2. 导航到 **Authentication** → **Providers**
3. 确保 Email 提供商已启用
4. 关闭 "Confirm email" 选项（开发环境）

或在代码中处理邮箱验证流程。

### 问题：RLS 策略阻止数据访问

**解决方案：**
在 Supabase Dashboard 的 **SQL Editor** 中运行：

```sql
-- 查看当前 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'strategies';

-- 确保用户已认证
-- 前端需要先调用 authHelpers.signInWithEmail() 登录
```
