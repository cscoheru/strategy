'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Star, Edit2, X, Plus, Trash2 } from 'lucide-react';
import { StrategyCard } from '@/types/strategy';

// 层级颜色配置
const LAYER_COLORS = {
  financial: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-900 dark:text-amber-100',
  },
  customer: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-900 dark:text-blue-100',
  },
  process: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-900 dark:text-emerald-100',
  },
  learning: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-900 dark:text-purple-100',
  },
};

interface StrategyCardNodeData extends StrategyCard {
  onEdit?: (nodeId: string, data: Partial<StrategyCard>) => void;
}

function StrategyCardNode({ data, selected }: NodeProps<StrategyCardNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: data.title,
    description: data.description,
    items: [...data.items],
  });

  const colors = LAYER_COLORS[data.layer];

  const handleSave = () => {
    if (data.onEdit) {
      data.onEdit(data.id, {
        ...editForm,
        items: editForm.items.filter(i => i.trim()),
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      title: data.title,
      description: data.description,
      items: [...data.items],
    });
    setIsEditing(false);
  };

  const handleAddItem = () => {
    setEditForm({ ...editForm, items: [...editForm.items, ''] });
  };

  const handleUpdateItem = (index: number, value: string) => {
    const newItems = [...editForm.items];
    newItems[index] = value;
    setEditForm({ ...editForm, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editForm.items.filter((_, i) => i !== index);
    setEditForm({ ...editForm, items: newItems });
  };

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} border-2 rounded-xl p-4 min-w-[280px] max-w-[320px]
        transition-all duration-200
        ${selected ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}
        ${data.isHighlighted ? 'ring-2 ring-yellow-500' : ''}
      `}
    >
      {/* 必赢战役标记 */}
      {data.isHighlighted && (
        <div className="absolute -top-2 -right-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      {/* 上方连接点（连接到下层） */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-6 h-6 !bg-white !border-gray-400 !border-2 rounded-full shadow-md"
      />

      {/* 顶部 Handle（拖拽连线起点） */}
      {data.isEditable && (
        <Handle
          type="source"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400 !border-gray-600"
        />
      )}

      {/* 编号 */}
      <div className={`text-xs font-bold ${colors.text} opacity-70 mb-1`}>
        {data.id}
      </div>

      {isEditing ? (
        // 编辑模式
        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm font-semibold"
              placeholder="标题"
            />
          </div>

          <div>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded
                         bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
              placeholder="描述"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">举措</span>
              <button
                onClick={handleAddItem}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                + 添加
              </button>
            </div>
            <div className="space-y-1">
              {editForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-1">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateItem(idx, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded
                               bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-xs"
                    placeholder={`举措 ${idx + 1}`}
                  />
                  {editForm.items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        // 查看模式
        <>
          {/* 标题 */}
          <h4 className={`font-bold ${colors.text} mb-2 text-base`}>
            {data.title}
          </h4>

          {/* 描述 */}
          {data.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
              {data.description}
            </p>
          )}

          {/* 举措列表 */}
          {data.items.length > 0 && (
            <ul className="space-y-1">
              {data.items.slice(0, 4).map((item, idx) => (
                <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                  <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${colors.text.split(' ')[0].replace('text-', 'bg-')}`} />
                  <span className="flex-1">{item}</span>
                </li>
              ))}
              {data.items.length > 4 && (
                <li className="text-xs text-gray-500 dark:text-gray-400">
                  +{data.items.length - 4} 更多...
                </li>
              )}
            </ul>
          )}

          {/* 编辑按钮 */}
          {data.isEditable && (
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Edit2 className="w-3 h-3" />
                编辑
              </button>
            </div>
          )}
        </>
      )}

      {/* 下方连接点（连接到上层） */}
      {data.isEditable && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-400 !border-gray-600"
        />
      )}
    </div>
  );
}

export default memo(StrategyCardNode);
