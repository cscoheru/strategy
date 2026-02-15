'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Star } from 'lucide-react';
import { StrategyCard } from '@/types/strategy';

// 层级边框颜色
const LAYER_BORDER = {
  financial: '#f59e0b',
  customer: '#3b82f6',
  process: '#10b981',
  learning: '#8b5cf6',
};

interface CompactNodeData extends StrategyCard {
  onEdit?: (nodeId: string, data: Partial<StrategyCard>) => void;
}

function CompactStrategyNode({ data, selected }: NodeProps<CompactNodeData>) {
  const config = LAYER_BORDER[data.layer];

  return (
    <div
      className={`
        relative bg-white dark:bg-slate-800
        border-2 rounded shadow-sm
        transition-all duration-200
        hover:shadow-md
        ${selected ? 'ring-3 ring-blue-400' : ''}
      `}
      style={{
        width: '160px',
        borderColor: selected ? '#2563eb' : config || '#cbd5e1',
      }}
    >
      {/* 上方连接点 - 大而明显 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 !bg-white !border-gray-400 !border-2 rounded-full border-2
                 translate-y-[-8px] z-10"
      />

      {/* 必赢战役标记 */}
      {data.isHighlighted && (
        <div className="absolute -top-2 -right-2 z-20">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      {/* 内容区域 */}
      <div className="px-2 py-1.5">
        {/* 编号 + 标题 */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: config || '#cbd5e1' }}
          >
            {data.id}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate flex-1"
                     style={{ fontSize: '13px', lineHeight: '1.3' }}>
            {data.title}
          </span>
        </div>
      </div>

      {/* 下方连接点 - 大而明显 */}
      {data.isEditable && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-4 h-4 !bg-gray-400 !border-gray-600 !border-2 rounded-full
                     translate-y-[8px] z-10"
        />
      )}
    </div>
  );
}

export default memo(CompactStrategyNode);
