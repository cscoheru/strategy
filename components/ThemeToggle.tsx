'use client';

import { useStore } from '@/lib/store';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400
                 transition-all duration-200"
      title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
