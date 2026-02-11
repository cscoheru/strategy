'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ModelProvider, PROVIDER_OPTIONS } from '@/types/strategy';
import { X, Save, Settings as SettingsIcon, Key, Globe, Database, RefreshCw } from 'lucide-react';

export default function SettingsModal() {
  const { showSettings, setShowSettings, modelConfig, setModelConfig } = useStore();
  const [localConfig, setLocalConfig] = useState({ ...modelConfig });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setLocalConfig({ ...modelConfig });
  }, [modelConfig]);

  const handleSave = () => {
    if (!localConfig.apiKey.trim()) {
      alert('请输入 API Key');
      return;
    }
    const provider = PROVIDER_OPTIONS.find(p => p.id === localConfig.provider);
    if (provider?.requiresBaseUrl && !localConfig.baseUrl?.trim()) {
      alert('请输入 API 地址');
      return;
    }
    setModelConfig(localConfig);
    alert('设置已保存');
    setShowSettings(false);
  };

  const handleTestConnection = async () => {
    if (!localConfig.apiKey.trim()) {
      alert('请先输入 API Key');
      return;
    }

    setTestStatus('testing');
    setTestMessage('');

    try {
      const provider = PROVIDER_OPTIONS.find(p => p.id === localConfig.provider);
      const url = localConfig.provider === 'zhipu'
        ? 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
        : localConfig.provider === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : localConfig.provider === 'deepseek'
        ? 'https://api.deepseek.com/v1/chat/completions'
        : localConfig.baseUrl || '';

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (localConfig.provider !== 'wenxin') {
        headers['Authorization'] = `Bearer ${localConfig.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: localConfig.model || provider?.defaultModel,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('连接成功！');
      } else {
        const errorData = await response.text();
        setTestStatus('error');
        setTestMessage(`连接失败: ${response.status} - ${errorData}`);
      }
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(`连接失败: ${error.message}`);
    }
  };

  if (!showSettings) return null;

  const selectedProvider = PROVIDER_OPTIONS.find(p => p.id === localConfig.provider);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              系统设置
            </h2>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* AI Model Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary-500" />
              AI 模型配置
            </h3>

            {/* Provider Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择模型供应商
              </label>
              <select
                value={localConfig.provider}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  provider: e.target.value as ModelProvider,
                  model: PROVIDER_OPTIONS.find(p => p.id === e.target.value)?.defaultModel || ''
                })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PROVIDER_OPTIONS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Help Link */}
            {selectedProvider?.helpUrl && (
              <div className="mb-4">
                <a
                  href={selectedProvider.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-500 hover:underline flex items-center gap-1"
                >
                  <Globe className="w-4 h-4" />
                  获取 {selectedProvider.name} API Key →
                </a>
              </div>
            )}

            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择模型
              </label>
              {selectedProvider?.models && selectedProvider.models.length > 0 ? (
                <select
                  value={localConfig.model || selectedProvider.defaultModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {selectedProvider.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={localConfig.model || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  placeholder="请输入模型名称"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>

            {/* Base URL (for custom providers) */}
            {selectedProvider?.requiresBaseUrl && (
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Database className="w-4 h-4" />
                  API 地址
                </label>
                <input
                  type="text"
                  value={localConfig.baseUrl || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                  placeholder={selectedProvider.baseUrlPlaceholder}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                placeholder="请输入 API Key"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-primary-500
                           font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                API Key 仅保存在您的浏览器本地，不会上传到服务器。
              </p>
            </div>

            {/* Test Connection */}
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="flex items-center gap-2 px-4 py-2 border border-primary-500 text-primary-500
                         hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              测试连接
            </button>

            {testMessage && (
              <div className={`mt-2 text-sm ${
                testStatus === 'success' ? 'text-green-600 dark:text-green-400' :
                testStatus === 'error' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {testMessage}
              </div>
            )}
          </section>

          {/* Info */}
          <section className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              支持的模型供应商
            </h4>
            <ul className="text-xs text-gray-600 dark:text-slate-400 space-y-1">
              <li>• <strong>智谱 AI</strong>: 国内访问速度快，性价比高</li>
              <li>• <strong>OpenAI</strong>: GPT-4o 等强大模型，需要国际网络</li>
              <li>• <strong>通义千问</strong>: 阿里云，中文理解能力强</li>
              <li>• <strong>DeepSeek</strong>: 性价比高，推理能力强</li>
              <li>• <strong>文心一言</strong>: 百度出品，中文效果好</li>
              <li>• <strong>Ollama</strong>: 本地部署，完全免费</li>
              <li>• <strong>自定义 API</strong>: 支持任何兼容 OpenAI 格式的 API</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
          <button
            onClick={() => setShowSettings(false)}
            className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg
                       flex items-center gap-2 transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
