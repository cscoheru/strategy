/**
 * 本地存储管理
 */
import { StrategicData } from '@/types/strategy';

const STORAGE_KEY = 'strategy_decoding_data';

/**
 * 保存数据到 LocalStorage
 */
export function saveToStorage(data: Partial<StrategicData>): void {
  try {
    const existingData = loadFromStorage();
    const mergedData = { ...existingData, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

/**
 * 从 LocalStorage 加载数据
 */
export function loadFromStorage(): StrategicData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  }
  return {};
}

/**
 * 清除所有数据
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('清除数据失败:', error);
  }
}

/**
 * 获取 API Key
 */
export function getApiKey(): string | null {
  try {
    return localStorage.getItem('zhipu_api_key');
  } catch (error) {
    console.error('获取 API Key 失败:', error);
    return null;
  }
}

/**
 * 保存 API Key
 */
export function saveApiKey(apiKey: string): void {
  try {
    localStorage.setItem('zhipu_api_key', apiKey);
  } catch (error) {
    console.error('保存 API Key 失败:', error);
  }
}

/**
 * 获取深色模式设置
 */
export function getDarkMode(): boolean {
  try {
    return localStorage.getItem('dark_mode') === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * 保存深色模式设置
 */
export function saveDarkMode(isDark: boolean): void {
  try {
    localStorage.setItem('dark_mode', String(isDark));
  } catch (error) {
    console.error('保存深色模式失败:', error);
  }
}
