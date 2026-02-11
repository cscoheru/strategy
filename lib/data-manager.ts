/**
 * 统一数据管理器 - 支持 LocalStorage 和 Supabase
 */
import { StrategicData } from '@/types/strategy';
import { supabase, dbHelpers } from './supabase';

// 存储接口定义
export interface IStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// LocalStorage 实现
class LocalStorageAdapter implements IStorage {
  async get(key: string): Promise<any> {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }
  }

  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}

// Supabase 实现
class SupabaseAdapter implements IStorage {
  private cache: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    // 先从缓存读取
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // 从数据库读取
    if (key === 'strategic_data') {
      const { data } = await dbHelpers.getUserStrategies();
      if (data && data.length > 0) {
        const strategy = data[0];
        const strategicData: StrategicData = {
          step1: strategy.step1_data,
          step2: strategy.step2_data,
          step3: strategy.step3_data,
          step4: strategy.step4_data
        };
        this.cache.set(key, strategicData);
        return strategicData;
      }
    }

    return null;
  }

  async set(key: string, value: any): Promise<void> {
    // 更新缓存
    this.cache.set(key, value);

    // 同步到数据库
    if (key === 'strategic_data') {
      const { error } = await dbHelpers.upsertStrategy(value);
      if (error) {
        console.error('Supabase save failed:', error);
        throw error;
      }
    }
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);

    if (key === 'strategic_data') {
      await dbHelpers.deleteStrategy();
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await dbHelpers.deleteStrategy();
  }
}

// 数据管理器
export class DataManager {
  private storage: IStorage;
  private userId: string | null = null;
  private useSupabase: boolean = false;

  constructor(storage?: IStorage) {
    this.storage = storage || new LocalStorageAdapter();
  }

  // 设置用户ID并切换到数据库模式
  setUserId(userId: string) {
    this.userId = userId;
    this.useSupabase = true;

    // 切换到 Supabase 存储
    this.storage = new SupabaseAdapter();
  }

  // 清除用户ID并切换回本地模式
  clearUserId() {
    this.userId = null;
    this.useSupabase = false;

    // 切换回 LocalStorage
    this.storage = new LocalStorageAdapter();
  }

  hasUser(): boolean {
    return this.userId !== null;
  }

  // ========== 战略数据操作 ==========

  // 获取完整的战略数据
  async getStrategicData(): Promise<StrategicData> {
    const data = await this.storage.get('strategic_data');
    return data || {};
  }

  // 保存完整的战略数据
  async saveStrategicData(data: StrategicData): Promise<void> {
    await this.storage.set('strategic_data', data);
  }

  // 获取指定步骤的数据
  async getStepData<T>(step: keyof StrategicData): Promise<T | null> {
    const data = await this.getStrategicData();
    return (data[step] as T) || null;
  }

  // 保存指定步骤的数据
  async saveStepData<T>(step: keyof StrategicData, value: T): Promise<void> {
    const data = await this.getStrategicData();
    (data as any)[step] = value; // 类型断言以允许动态赋值
    await this.saveStrategicData(data);
  }

  // 清空所有战略数据
  async clearStrategicData(): Promise<void> {
    await this.storage.remove('strategic_data');
  }

  // ========== 导入/导出 ==========

  // 导出数据为 JSON
  async exportData(): Promise<string> {
    const data = await this.getStrategicData();
    return JSON.stringify(data, null, 2);
  }

  // 从 JSON 导入数据
  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);
      await this.saveStrategicData(data);
    } catch (e) {
      throw new Error('数据格式错误，无法导入');
    }
  }

  // ========== 数据验证 ==========

  // 验证数据完整性
  async validateData(): Promise<{
    isValid: boolean;
    missingSteps: string[];
    errors: string[];
  }> {
    const data = await this.getStrategicData();
    const missingSteps: string[] = [];
    const errors: string[] = [];

    // 检查 Step 1
    if (!data.step1) {
      missingSteps.push('step1');
    } else if (!data.step1.goals || !data.step1.actuals) {
      errors.push('Step 1: 缺少目标或实际完成数据');
    }

    // 检查 Step 2
    if (!data.step2) {
      missingSteps.push('step2');
    } else if (!data.step2.trends || !data.step2.competitors) {
      errors.push('Step 2: 缺少行业趋势或竞争对手数据');
    }

    return {
      isValid: missingSteps.length === 0 && errors.length === 0,
      missingSteps,
      errors
    };
  }

  // 获取数据统计
  async getDataStats(): Promise<{
    totalSteps: number;
    completedSteps: number;
    progress: number;
    storageMode: 'local' | 'cloud';
  }> {
    const data = await this.getStrategicData();
    const steps = ['step1', 'step2', 'step3', 'step4'] as const;
    const completedSteps = steps.filter(step => data[step]);

    return {
      totalSteps: steps.length,
      completedSteps: completedSteps.length,
      progress: Math.round((completedSteps.length / steps.length) * 100),
      storageMode: this.useSupabase ? 'cloud' : 'local'
    };
  }
}

// 单例实例
let dataManagerInstance: DataManager | null = null;

export function getDataManager(): DataManager {
  if (!dataManagerInstance) {
    dataManagerInstance = new DataManager();
  }
  return dataManagerInstance;
}

// 重新初始化（用于切换存储后端）
export function initDataManager(storage?: IStorage): DataManager {
  dataManagerInstance = new DataManager(storage);
  return dataManagerInstance;
}

// 切换到数据库模式（供登录时调用）
export function switchToSupabaseMode(userId: string): DataManager {
  const dm = getDataManager();
  dm.setUserId(userId);
  return dm;
}

// 切换到本地模式（供登出时调用）
export function switchToLocalMode(): DataManager {
  const dm = getDataManager();
  dm.clearUserId();
  return dm;
}
