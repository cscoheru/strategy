'use client';

import { useState } from 'react';
import { StrategyMap, StrategyCard } from '@/types/strategy';
import {
  Edit2,
  Check,
  X,
  TrendingUp,
  Target,
  Users,
  GitBranch,
  Lightbulb,
  Star,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';

interface StrategyMapViewProps {
  strategyMap: StrategyMap;
  onUpdateCard: (cardId: string, updates: Partial<StrategyCard>) => void;
  onConfirm: () => void;
}

// 层级配置
const LAYER_CONFIG = {
  financial: {
    label: '财务层',
    icon: TrendingUp,
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    borderColor: 'border-amber-300 dark:border-amber-700',
    cardBg: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-900 dark:text-amber-100'
  },
  customer: {
    label: '客户层',
    icon: Users,
    bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    cardBg: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-900 dark:text-blue-100'
  },
  process: {
    label: '流程层',
    icon: GitBranch,
    bgColor: 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    cardBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-900 dark:text-emerald-100'
  },
  learning: {
    label: '学习层',
    icon: Lightbulb,
    bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    cardBg: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-900 dark:text-purple-100'
  }
} as const;

type LayerKey = keyof typeof LAYER_CONFIG;

export default function StrategyMapView({ strategyMap, onUpdateCard, onConfirm }: StrategyMapViewProps) {
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', items: [''] });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // 处理卡片点击
  const handleCardClick = (card: StrategyCard) => {
    if (!card.isEditable) return;
    setEditingCard(card.id);
    setEditForm({
      title: card.title,
      description: card.description,
      items: [...card.items]
    });
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingCard) return;
    onUpdateCard(editingCard, {
      title: editForm.title,
      description: editForm.description,
      items: editForm.items.filter(i => i.trim())
    });
    setEditingCard(null);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  // 添加新举措
  const handleAddItem = () => {
    setEditForm({ ...editForm, items: [...editForm.items, ''] });
  };

  // 更新举措
  const handleUpdateItem = (index: number, value: string) => {
    const newItems = [...editForm.items];
    newItems[index] = value;
    setEditForm({ ...editForm, items: newItems });
  };

  // 删除举措
  const handleRemoveItem = (index: number) => {
    const newItems = editForm.items.filter((_, i) => i !== index);
    setEditForm({ ...editForm, items: newItems });
  };

  // 判断卡片是否应该高亮（成组高亮）
  const shouldHighlight = (card: StrategyCard): boolean => {
    if (!hoveredCard) return false;

    // 如果当前悬停的卡片是财务层
    const hoveredCardObj = findCardById(hoveredCard);
    if (!hoveredCardObj) return false;

    // 向下查找：悬停卡片的所有子节点
    if (hoveredCardObj.childCardIds.includes(card.id)) return true;

    // 向上查找：悬停卡片的所有父节点
    if (hoveredCardObj.parentCardIds.includes(card.id)) return true;

    return false;
  };

  // 查找卡片
  const findCardById = (id: string): StrategyCard | null => {
    for (const layer of Object.values(strategyMap.layers)) {
      const card = layer.find(c => c.id === id);
      if (card) return card;
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* 顶部目标金额和战略主题 */}
      <div className="mb-8 text-center">
        <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl shadow-lg">
          <Target className="w-10 h-10 text-white" />
          <div className="text-white">
            <div className="text-sm opacity-90">年度战略目标</div>
            <div className="text-4xl font-bold">¥{strategyMap.targetAmount.toLocaleString()}万</div>
          </div>
          {strategyMap.theme && (
            <div className="mt-2 px-4 py-1 bg-white/20 rounded-full text-white text-sm">
              {strategyMap.themeDescription}
            </div>
          )}
        </div>
      </div>

      {/* 战略地图层级 */}
      <div className="space-y-4">
        {(Object.keys(LAYER_CONFIG) as LayerKey[]).map((layerKey, index) => {
          const config = LAYER_CONFIG[layerKey];
          const LayerIcon = config.icon;
          const cards = strategyMap.layers[layerKey];

          return (
            <div key={layerKey} className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-6`}>
              {/* 层级标题 */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 ${config.cardBg} rounded-lg`}>
                  <LayerIcon className={`w-5 h-5 ${config.textColor}`} />
                </div>
                <h3 className={`text-lg font-semibold ${config.textColor}`}>
                  {config.label}
                </h3>
              </div>

              {/* 卡片容器 - Flexbox 横向排列 */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {cards.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8 w-full">
                    暂无战略目标
                  </div>
                ) : (
                  cards.map((card) => {
                    const isHoveredOrRelated = hoveredCard === card.id || shouldHighlight(card);

                    return (
                      <div
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        onMouseEnter={() => setHoveredCard(card.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`
                          ${config.cardBg} ${config.borderColor}
                          border-2 rounded-xl p-4 min-w-[280px] max-w-[320px]
                          transition-all duration-200 cursor-pointer
                          ${card.isEditable ? 'hover:shadow-md' : ''}
                          ${isHoveredOrRelated ? 'ring-4 ring-yellow-400 ring-opacity-60 scale-105' : ''}
                          ${card.isHighlighted ? 'ring-2 ring-yellow-500' : ''}
                        `}
                      >
                        {/* 必赢战役标记 */}
                        {card.isHighlighted && (
                          <div className="absolute -top-2 -right-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          </div>
                        )}

                        {/* 编号 */}
                        <div className={`text-xs font-bold ${config.textColor} opacity-70 mb-1`}>
                          {card.id}
                        </div>

                        {/* 标题 */}
                        <h4 className={`font-bold ${config.textColor} mb-2 text-base`}>
                          {card.title}
                        </h4>

                        {/* 描述 */}
                        {card.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                            {card.description}
                          </p>
                        )}

                        {/* 举措列表 */}
                        {card.items.length > 0 && (
                          <ul className="space-y-1">
                            {card.items.slice(0, 3).map((item, idx) => (
                              <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                                <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${config.textColor.split(' ')[0].replace('text-', 'bg-')}`} />
                                <span className="flex-1">{item}</span>
                              </li>
                            ))}
                            {card.items.length > 3 && (
                              <li className="text-xs text-gray-500 dark:text-gray-400">
                                +{card.items.length - 3} 更多...
                              </li>
                            )}
                          </ul>
                        )}

                        {/* 可编辑提示 */}
                        {card.isEditable && (
                          <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Edit2 className="w-3 h-3" />
                            点击编辑
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 层级间的向下箭头 */}
      <div className="flex justify-center my-4 space-x-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ChevronDown key={i} className="w-6 h-6 text-gray-400 dark:text-gray-600" />
        ))}
      </div>

      {/* 编辑模态框 */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  编辑卡片: {editingCard}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    标题（简短动宾短语）
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder="如：提升客单价"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      具体举措
                    </label>
                    <button
                      onClick={handleAddItem}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      + 添加举措
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editForm.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleUpdateItem(idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                     bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                          placeholder={`举措 ${idx + 1}`}
                        />
                        {editForm.items.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 确认按钮 */}
      {!strategyMap.confirmed && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onConfirm}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700
                       text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 transition-all duration-200"
          >
            <Check className="w-5 h-5" />
            确认战略地图
          </button>
        </div>
      )}

      {/* 图例 */}
      <div className="mt-8 flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>必赢战役</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-yellow-400 rounded"></div>
          <span>关联高亮</span>
        </div>
        <div className="flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          <span>点击编辑</span>
        </div>
      </div>
    </div>
  );
}
