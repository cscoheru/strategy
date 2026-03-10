'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { StrategyMap } from '@/types/strategy';
import {
  ArrowLeft,
  ArrowRight,
  Save,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import StrategyCardNode from './nodes/StrategyCardNode';

// 自定义节点类型
const nodeTypes = {
  strategyCard: StrategyCardNode,
};

interface StrategyMapCanvasProps {
  strategyMap: StrategyMap;
  onStrategyMapChange: (map: StrategyMap) => void;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
}

export default function StrategyMapCanvas({
  strategyMap,
  onStrategyMapChange,
  onBack,
  onNext,
  onSave
}: StrategyMapCanvasProps) {
  const { data } = useStore();

  // 初始化节点
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];

    // 从已保存的地图加载节点
    Object.values(strategyMap.layers).forEach(cards => {
      cards.forEach(card => {
        nodes.push({
          id: card.id,
          type: 'strategyCard',
          position: card.position || { x: 0, y: 0 },
          data: card,
        });
      });
    });

    // 如果没有保存的节点，添加测试节点
    if (nodes.length === 0) {
      // 财务层
      nodes.push({
        id: 'F1',
        type: 'strategyCard',
        position: { x: 400, y: 50 },
        data: {
          id: 'F1',
          layer: 'financial',
          title: '测试财务目标',
          description: '这是一个测试节点',
          items: ['目标: 1000万'],
          isHighlighted: true,
          isEditable: false,
        },
      });

      // 客户层
      nodes.push({
        id: 'C1',
        type: 'strategyCard',
        position: { x: 100, y: 250 },
        data: {
          id: 'C1',
          layer: 'customer',
          title: '提升客户满意度',
          description: '改善客户体验',
          items: ['优化服务流程'],
          isHighlighted: false,
          isEditable: true,
        },
      });

      // 流程层
      nodes.push({
        id: 'P1',
        type: 'strategyCard',
        position: { x: 700, y: 450 },
        data: {
          id: 'P1',
          layer: 'process',
          title: '优化供应链',
          description: '提升运营效率',
          items: ['简化采购流程'],
          isHighlighted: false,
          isEditable: true,
        },
      });

      // 学习层
      nodes.push({
        id: 'L1',
        type: 'strategyCard',
        position: { x: 400, y: 650 },
        data: {
          id: 'L1',
          layer: 'learning',
          title: '加强员工培训',
          description: '提升团队能力',
          items: ['开展技能培训'],
          isHighlighted: false,
          isEditable: true,
        },
      });
    }

    return nodes;
  }, [strategyMap]);

  // 初始化连线
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    // 测试节点之间的连接
    edges.push({
      id: 'F1-C1',
      source: 'F1',
      target: 'C1',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    });

    // 从已保存的地图加载连线
    Object.values(strategyMap.layers).forEach(cards => {
      cards.forEach(card => {
        card.childCardIds?.forEach(childId => {
          edges.push({
            id: `${card.id}-${childId}`,
            source: card.id,
            target: childId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', strokeWidth: 2, width: 20, height: 20 },
          });
        });
      });
    });

    return edges;
  }, [strategyMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 处理连线
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 保存战略地图
  const handleSaveMap = () => {
    onStrategyMapChange(strategyMap);
    onSave();
  };

  return (
    <div className="w-full h-screen flex">
      {/* 顶部工具栏 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            上一步
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            战略地图画板
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            测试模式：{nodes.length} 个节点
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveMap}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2"
          >
            下一步
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* React Flow 画布 */}
      <div className="flex-1 relative">
        <div className="w-full h-[calc(100vh-73px)]">
          {/* 泳道背景：4条水平线 */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            {/* 财务线 y=100px */}
            <line x1="0%" y1="100px" x2="100%" y2="100px" stroke="#f59e0b" strokeWidth="4" opacity="0.15" />

            {/* 客户线 y=200px */}
            <line x1="0%" y1="300px" x2="100%" y2="300px" stroke="#3b82f6" strokeWidth="4" opacity="0.15" />

            {/* 流程线 y=400px */}
            <line x1="0%" y1="500px" x2="100%" y2="500px" stroke="#10b981" strokeWidth="4" opacity="0.15" />

            {/* 学习线 y=600px */}
            <line x1="0%" y1="700px" x2="100%" y2="700px" stroke="#8b5cf6" strokeWidth="4" opacity="0.15" />
          </svg>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent dark:bg-transparent"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
