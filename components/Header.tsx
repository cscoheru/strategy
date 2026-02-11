'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useStore } from '@/lib/store';
import {
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  User,
  Loader2
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { showWelcome, setShowSettings, companyInfo, isLoggedIn, userEmail, logout } = useStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (showWelcome) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              企业战略解码工作台
            </h1>
            {companyInfo.name && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {companyInfo.name} · {companyInfo.industry}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* 登录状态 */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20
                             border border-green-200 dark:border-green-800 rounded-full">
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    {userEmail || '已登录'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700
                             hover:bg-gray-200 dark:hover:bg-slate-600
                             text-gray-600 dark:text-gray-300 hover:text-red-500
                             transition-all duration-200 disabled:opacity-50"
                  title="退出登录"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm ml-1">退出</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary-500 hover:bg-primary-600
                           text-white rounded-lg text-sm font-medium
                           transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>登录</span>
              </button>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                         text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400
                         hover:bg-gray-50 dark:hover:bg-slate-700
                         transition-all duration-200"
              title="系统设置"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
