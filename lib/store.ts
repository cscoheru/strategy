/**
 * 全局状态管理 (Zustand) - 重构版
 * 使用 DataManager 抽象存储层，支持 LocalStorage 和 Supabase
 */
import { create } from 'zustand';
import { StrategicData, Step, ModelConfig, CompanyInfo } from '@/types/strategy';
import { getDataManager, switchToSupabaseMode, switchToLocalMode } from './data-manager';
import { authHelpers } from './supabase';

interface AppState {
  currentStep: Step;
  showWelcome: boolean;
  showSettings: boolean;
  data: StrategicData;
  isDarkMode: boolean;
  modelConfig: ModelConfig;
  companyInfo: CompanyInfo;
  // 用户信息
  userId: string | null;
  isLoggedIn: boolean;
  userEmail: string | null;
  // Actions
  setStep: (step: Step) => void;
  setShowWelcome: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setData: (step: keyof StrategicData, value: any) => Promise<void>;
  toggleDarkMode: () => void;
  setModelConfig: (config: ModelConfig) => void;
  setCompanyInfo: (info: CompanyInfo) => void;
  clearData: () => Promise<void>;
  // 用户相关 Actions
  login: (userId: string, userEmail: string) => Promise<void>;
  logout: () => Promise<void>;
  // 刷新数据
  refreshData: () => Promise<void>;
  // 初始化认证状态
  initializeAuth: () => Promise<void>;
}

const defaultModelConfig: ModelConfig = {
  provider: 'zhipu',
  apiKey: '',
  baseUrl: '',
  model: 'glm-4-flash',
};

// 从 localStorage 加载数据
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const useStore = create<AppState>((set, get) => ({
  currentStep: 1,
  showWelcome: true,
  showSettings: false,
  data: loadFromStorage<StrategicData>('strategic_data', {}),
  isDarkMode: typeof window !== 'undefined' && localStorage.getItem('dark_mode') === 'true',
  modelConfig: loadFromStorage<ModelConfig>('model_config', defaultModelConfig),
  companyInfo: loadFromStorage<CompanyInfo>('company_info', { name: '', industry: '' }),
  userId: loadFromStorage<string | null>('user_id', null),
  isLoggedIn: false,
  userEmail: loadFromStorage<string | null>('user_email', null),

  setStep: (step) => set({ currentStep: step }),

  setShowWelcome: (show) => set({ showWelcome: show }),

  setShowSettings: (show) => set({ showSettings: show }),

  // 保存数据（异步）
  setData: async (step, value) => {
    // 更新内存状态
    set((state) => ({
      data: { ...state.data, [step]: value }
    }));

    // 持久化到存储
    const dataManager = getDataManager();
    await dataManager.saveStepData(step, value);
  },

  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dark_mode', String(newMode));
      document.documentElement.classList.toggle('dark', newMode);
    }
    return { isDarkMode: newMode };
  }),

  setModelConfig: (config) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('model_config', JSON.stringify(config));
    }
    set({ modelConfig: config });
  },

  setCompanyInfo: (info) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_info', JSON.stringify(info));
    }
    set({ companyInfo: info });
  },

  clearData: async () => {
    const dataManager = getDataManager();
    await dataManager.clearStrategicData();
    set({ data: {} });
  },

  // 用户登录
  login: async (userId: string, userEmail: string) => {
    // 切换到数据库模式
    switchToSupabaseMode(userId);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_email', userEmail || '');
    }

    set({
      userId,
      isLoggedIn: true,
      userEmail
    });

    // 从数据库加载数据
    await get().refreshData();
  },

  // 用户登出
  logout: async () => {
    // 先登出 Supabase
    await authHelpers.signOut();

    // 切换回本地模式
    switchToLocalMode();

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
    }

    set({
      userId: null,
      isLoggedIn: false,
      userEmail: null,
      data: {} // 清空数据
    });
  },

  // 刷新数据（从数据库重新加载）
  refreshData: async () => {
    const dataManager = getDataManager();
    const data = await dataManager.getStrategicData();

    if (data && Object.keys(data).length > 0) {
      set({ data });
    }
  },

  // 初始化认证状态（应用启动时调用）
  initializeAuth: async () => {
    const userId = loadFromStorage<string | null>('user_id', null);
    const userEmail = loadFromStorage<string | null>('user_email', null);

    if (userId) {
      // 验证 Supabase 会话是否仍然有效
      const user = await authHelpers.getCurrentUser();
      if (user && user.id === userId) {
        // 会话有效，恢复登录状态
        switchToSupabaseMode(userId);
        set({
          userId,
          isLoggedIn: true,
          userEmail
        });
        // 从数据库加载数据
        await get().refreshData();
      } else {
        // 会话无效，清除本地存储
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_email');
        }
        set({
          userId: null,
          isLoggedIn: false,
          userEmail: null
        });
      }
    }
  }
}));
