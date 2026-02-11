/**
 * Supabase 客户端配置
 */
import { createClient, AuthResponse } from '@supabase/supabase-js';

// 定义认证响应类型
interface AuthResult {
  data: AuthResponse['data'] | null;
  error: Error | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 只在环境变量配置时创建客户端
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 检查 Supabase 是否已配置
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// 类型定义
export interface StrategyRow {
  id: string;
  user_id: string;
  step1_data: any;
  step2_data: any;
  step3_data: any;
  step4_data: any;
  created_at: string;
  updated_at: string;
}

// 用户信息类型
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

// Auth 辅助函数
export const authHelpers = {
  // 获取当前用户
  async getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // 邮箱登录
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error: error || null };
  },

  // 邮箱注册
  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error: error || null };
  },

  // 登出
  async signOut() {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) return { data: { subscription: null } };
    return supabase.auth.onAuthStateChange(callback);
  }
};

// 数据库操作辅助函数
export const dbHelpers = {
  // 获取用户的策略数据
  async getUserStrategies() {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    return { data, error };
  },

  // 保存或更新策略数据
  async upsertStrategy(strategyData: any) {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const user = await authHelpers.getCurrentUser();
    if (!user) {
      return { error: new Error('User not logged in') };
    }

    const { data, error } = await supabase
      .from('strategies')
      .upsert({
        user_id: user.id,
        step1_data: strategyData.step1 || null,
        step2_data: strategyData.step2 || null,
        step3_data: strategyData.step3 || null,
        step4_data: strategyData.step4 || null,
      })
      .select()
      .single();

    return { data, error };
  },

  // 删除策略数据
  async deleteStrategy() {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const user = await authHelpers.getCurrentUser();
    if (!user) {
      return { error: new Error('User not logged in') };
    }

    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('user_id', user.id);

    return { error };
  }
};
