'use client';

import { useState } from 'react';
import { X, ChevronDown, Sparkles, RefreshCw, Lightbulb, Check } from 'lucide-react';

interface Swimlane {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface CardSuggestion {
  title: string;
  description: string;
  items: string[];
}

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSwimlane: string | null;
  swimlanes: Swimlane[];
  suggestions: CardSuggestion[];
  isGenerating: boolean;
  onAddCard: (suggestion: CardSuggestion) => void;
  onRegenerate: () => void;
}

export default function AISidebar({
  isOpen,
  onClose,
  activeSwimlane,
  swimlanes,
  suggestions,
  isGenerating,
  onAddCard,
  onRegenerate,
}: AISidebarProps) {
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const activeSwimlaneConfig = swimlanes.find(s => s.id === activeSwimlane);

  const handleGenerateFromInput = () => {
    if (!userInput.trim()) return;
    // TODO: 可以基于用户输入生成更精准的建议
    setShowInput(false);
    setUserInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-slate-800 shadow-2xl border-l border-gray-200 dark:border-slate-700 z-20 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">AI 战略顾问</h3>
            {activeSwimlaneConfig && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                正在为 {activeSwimlaneConfig.label} 提供建议
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AI 提问区域 */}
        {!showInput && suggestions.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeSwimlaneConfig
                ? `为了达成财务目标，您认为 ${activeSwimlaneConfig.label} 最关键的是什么？`
                : '请先选择一个泳道'}
            </p>
            {activeSwimlane && (
              <button
                onClick={() => setShowInput(true)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                输入我的想法
              </button>
            )}
          </div>
        )}

        {/* 用户输入区域 */}
        {showInput && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-700 rounded-lg
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
              placeholder="输入您的想法，例如：我想重点抓大客户..."
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleGenerateFromInput}
                className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg"
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                生成建议
              </button>
              <button
                onClick={() => {
                  setShowInput(false);
                  setUserInput('');
                }}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* AI 建议卡片列表 */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                推荐的战略要素
              </h4>
              <button
                onClick={onRegenerate}
                disabled={isGenerating}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-purple-300 dark:hover:border-purple-700"
                onClick={() => onAddCard(suggestion)}
              >
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {suggestion.title}
                </h5>
                {suggestion.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {suggestion.description}
                  </p>
                )}
                {suggestion.items && suggestion.items.length > 0 && (
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {suggestion.items.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                  点击添加到画布 →
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 加载状态 */}
        {isGenerating && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                AI 正在思考...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">使用提示：</p>
            <ul className="space-y-1 text-gray-400 dark:text-gray-500">
              <li>• 点击推荐卡片将其添加到画布</li>
              <li>• 拖拽卡片顶部 Handle 连线到其他卡片</li>
              <li>• 双击卡片可以编辑内容</li>
              <li>• 右键卡片可以复制或删除</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
