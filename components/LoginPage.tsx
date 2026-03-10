'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authHelpers, isSupabaseConfigured } from '@/lib/supabase';
import {
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CloudOff,
  Home,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  type ViewMode = 'login' | 'register' | 'forgot-password' | 'reset-password';
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 检查是否已登录，并检查 URL 参数
  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured) return;

      // 检查 URL 参数中的错误信息
      const params = new URLSearchParams(window.location.search);
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description');
      const isReset = params.get('reset');

      // 处理错误
      if (errorCode === 'otp_expired') {
        setError('重置链接已过期，请重新申请密码重置');
        setViewMode('forgot-password');
      } else if (errorCode) {
        setError(decodeURIComponent(errorDesc || '重置密码失败，请重试'));
        if (isReset === 'true') {
          setViewMode('forgot-password');
        }
      }
      // 处理密码重置模式
      else if (isReset === 'true') {
        setViewMode('reset-password');
        setSuccessMessage('请输入您的新密码');
      }

      // 检查用户登录状态
      const user = await authHelpers.getCurrentUser();
      if (user && !isReset) {
        await login(user.id, user.email || '');
        router.push('/');
      }
    };
    checkAuth();
  }, []);

  // 如果 Supabase 未配置，显示提示
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl mb-6">
            <CloudOff className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            云端服务未配置
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            当前环境未配置云端数据库，仅支持本地试用模式。<br />
            数据将保存在浏览器中，清除浏览器数据后会丢失。
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600
                       text-white rounded-lg font-medium transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            返回首页（试用模式）
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (viewMode === 'forgot-password') {
        // 忘记密码 - 发送重置邮件
        const result = await authHelpers.resetPassword(email);
        if (result.error) {
          throw new Error(result.error.message || '发送重置邮件失败，请重试');
        }
        setSuccessMessage('密码重置邮件已发送到您的邮箱，请查收邮件并按提示重置密码。');
      } else if (viewMode === 'reset-password') {
        // 重置密码 - 验证并更新密码
        if (newPassword.length < 6) {
          throw new Error('密码长度至少为 6 位');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('两次输入的密码不一致');
        }

        const result = await authHelpers.updatePassword(newPassword);
        if (result.error) {
          throw new Error(result.error.message || '密码重置失败，请重试');
        }

        setSuccessMessage('密码重置成功！请使用新密码登录。');
        // 3秒后切换到登录模式
        setTimeout(() => {
          setViewMode('login');
          setSuccessMessage('');
          setPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 3000);
      } else if (viewMode === 'login') {
        // 登录
        const result = await authHelpers.signInWithEmail(email, password);
        if (result.error || !result.data?.user) {
          throw new Error(result.error?.message || '登录失败，请重试');
        }

        await login(result.data.user.id, email);
        router.push('/');
      } else if (viewMode === 'register') {
        // 注册
        const result = await authHelpers.signUpWithEmail(email, password);
        if (result.error) {
          // 检查是否是用户已存在错误
          if (result.error.message.includes('already been registered')) {
            setError('该邮箱已被注册，请直接登录');
          } else {
            throw new Error(result.error?.message || '注册失败，请重试');
          }
        } else if (result.data?.user) {
          // 注册成功，自动登录
          await login(result.data.user.id, email);
          router.push('/');
        } else {
          throw new Error('注册失败，请重试');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message?.includes('Invalid login') || err.message?.includes('invalid_credentials')) {
        setError('邮箱或密码错误');
      } else if (err.message?.includes('User already registered') || err.message?.includes('already been registered')) {
        setError('该邮箱已被注册，请直接登录');
      } else if (err.message?.includes('Email not confirmed') || err.message?.includes('Email not verified')) {
        setError('请先验证邮箱');
      } else if (err.message?.includes('Supabase not configured')) {
        setError('云端服务未配置，当前仅支持本地试用模式。请刷新页面使用试用模式。');
      } else {
        setError(err.message || '操作失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">战</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            企业战略解码工作台
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {viewMode === 'forgot-password'
              ? '重置您的密码'
              : viewMode === 'reset-password'
              ? '设置新密码'
              : viewMode === 'login'
              ? '登录以同步您的战略数据'
              : '创建账号开始使用'}
          </p>
        </div>

        {/* 登录/注册表单 */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          {/* 切换按钮（忘记密码和重置密码模式时隐藏） */}
          {viewMode !== 'forgot-password' && viewMode !== 'reset-password' && (
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
              <button
                onClick={() => setViewMode('login')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'login'
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600'
                }`}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                登录
              </button>
              <button
                onClick={() => setViewMode('register')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'register'
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                注册
              </button>
            </div>
          )}

          {/* 成功提示 */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary-500
                             placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* 密码输入（忘记密码和重置密码模式时隐藏） */}
            {viewMode !== 'forgot-password' && viewMode !== 'reset-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-primary-500
                               placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* 忘记密码链接（仅在登录模式显示） */}
                {viewMode === 'login' && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setViewMode('forgot-password')}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                    >
                      忘记密码？
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 重置密码模式：新密码输入 */}
            {viewMode === 'reset-password' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    新密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="输入新密码（至少6位）"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                                 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                 focus:outline-none focus:ring-2 focus:ring-primary-500
                                 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    确认新密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="再次输入新密码"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                                 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                 focus:outline-none focus:ring-2 focus:ring-primary-500
                                 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed
                         text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {viewMode === 'forgot-password'
                    ? '发送中...'
                    : viewMode === 'reset-password'
                    ? '重置中...'
                    : viewMode === 'login'
                    ? '登录中...'
                    : '注册中...'}
                </>
              ) : (
                <>
                  {viewMode === 'forgot-password' ? (
                    <Mail className="w-5 h-5" />
                  ) : viewMode === 'reset-password' ? (
                    <Lock className="w-5 h-5" />
                  ) : viewMode === 'login' ? (
                    <LogIn className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                  {viewMode === 'forgot-password'
                    ? '发送重置邮件'
                    : viewMode === 'reset-password'
                    ? '重置密码'
                    : viewMode === 'login'
                    ? '登录'
                    : '创建账号'}
                </>
              )}
            </button>

            {/* 返回登录按钮（忘记密码和重置密码模式） */}
            {(viewMode === 'forgot-password' || viewMode === 'reset-password') && (
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="w-full py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600
                           text-gray-700 dark:text-gray-300 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回登录
              </button>
            )}
          </form>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
              💡 使用提示
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>未登录时</strong>数据保存在浏览器本地（试用模式）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>登录后</strong>数据自动同步到云端（会员模式）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>支持多设备访问，数据永不丢失</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
