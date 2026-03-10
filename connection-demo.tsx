"use client"

/**
 * ============================================================
 *  连线模式参考示例 (Connection Mode Reference Demo)
 * ============================================================
 *
 * 核心流程:
 *   1. 用户点击「开启连线模式」按钮  →  connectMode = true
 *   2. 用户点击第一个图形框（源节点） →  pendingFrom = sourceId
 *   3. 鼠标移动时，一条虚线跟随鼠标   →  mousePos 实时更新, SVG 渲染虚线
 *   4. 用户点击第二个图形框（目标节点）→  创建 Connection, 重置 pendingFrom
 *   5. 按 Escape 可随时取消当前连线
 *
 * 关键数据结构:
 *   - Connection { id, fromId, toId }
 *   - pendingFrom: string | null     — 正在连线的起点节点 ID
 *   - mousePos: {x, y} | null        — 鼠标实时坐标(用于画虚线)
 *
 * 你可以把这个文件直接复制出去作为参考。
 * ============================================================
 */

import { useState, useRef, useCallback, useEffect } from "react"

// ─── 数据类型 ─────────────────────────────────────────────

interface NodeData {
  id: string
  label: string
  x: number
  y: number
}

interface Connection {
  id: string
  fromId: string
  toId: string
}

// ─── 初始节点 ─────────────────────────────────────────────

const INITIAL_NODES: NodeData[] = [
  { id: "a", label: "节点 A", x: 80, y: 60 },
  { id: "b", label: "节点 B", x: 300, y: 60 },
  { id: "c", label: "节点 C", x: 80, y: 220 },
  { id: "d", label: "节点 D", x: 300, y: 220 },
  { id: "e", label: "节点 E", x: 190, y: 380 },
]

// ─── 主组件 ───────────────────────────────────────────────

export default function ConnectionDemo() {
  const [nodes] = useState<NodeData[]>(INITIAL_NODES)
  const [connections, setConnections] = useState<Connection[]>([])

  // ★ 连线模式核心状态
  const [connectMode, setConnectMode] = useState(false)
  const [pendingFrom, setPendingFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  // ─── 步骤 2 & 4: 点击节点 ──────────────────────────────
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // 非连线模式下点击不处理连线
      if (!connectMode) return

      // 步骤 2: 还没选起点 → 设置起点
      if (!pendingFrom) {
        setPendingFrom(nodeId)
        return
      }

      // 点了同一个节点 → 取消
      if (pendingFrom === nodeId) {
        setPendingFrom(null)
        setMousePos(null)
        return
      }

      // 步骤 4: 已有起点，点击了不同节点 → 创建连线
      const alreadyExists = connections.some(
        (c) =>
          (c.fromId === pendingFrom && c.toId === nodeId) ||
          (c.fromId === nodeId && c.toId === pendingFrom)
      )
      if (!alreadyExists) {
        setConnections((prev) => [
          ...prev,
          {
            id: `conn_${Date.now()}`,
            fromId: pendingFrom,
            toId: nodeId,
          },
        ])
      }

      // 重置，准备下一条连线
      setPendingFrom(null)
      setMousePos(null)
    },
    [connectMode, pendingFrom, connections]
  )

  // ─── 步骤 3: 鼠标移动 → 更新虚线终点 ─────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!pendingFrom) return
      setMousePos({ x: e.clientX, y: e.clientY })
    },
    [pendingFrom]
  )

  // ─── 步骤 5: Escape 取消 ──────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPendingFrom(null)
        setMousePos(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>{"连线模式参考示例"}</h2>

      {/* ─── 步骤 1: 开关按钮 ─────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => {
            setConnectMode((prev) => !prev)
            setPendingFrom(null)
            setMousePos(null)
          }}
          style={{
            padding: "6px 16px",
            background: connectMode ? "#2563eb" : "#e5e7eb",
            color: connectMode ? "#fff" : "#333",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {connectMode ? "连线模式 (开启)" : "连线模式 (关闭)"}
        </button>
        <button
          onClick={() => setConnections([])}
          style={{
            padding: "6px 16px",
            background: "#fee2e2",
            color: "#b91c1c",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {"清除全部连线"}
        </button>
      </div>

      {/* 提示文字 */}
      {connectMode && (
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
          {pendingFrom
            ? `已选起点 [${pendingFrom}]，请点击目标节点完成连线，按 Escape 取消`
            : "请点击一个节点作为连线起点"}
        </p>
      )}

      {/* ─── 画布容器 ─────────────────────────────────── */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
          position: "relative",
          width: 500,
          height: 500,
          border: "1px solid #d1d5db",
          borderRadius: 12,
          background: "#f9fafb",
          overflow: "hidden",
        }}
      >
        {/* ─── 节点渲染 ──────────────────────────────── */}
        {nodes.map((node) => {
          const isSource = pendingFrom === node.id
          return (
            <div
              key={node.id}
              data-node-id={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                width: 120,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                border: `2px solid ${isSource ? "#2563eb" : "#6b7280"}`,
                background: isSource ? "#dbeafe" : "#ffffff",
                boxShadow: isSource
                  ? "0 0 0 3px rgba(37,99,235,0.3)"
                  : "0 1px 3px rgba(0,0,0,0.1)",
                cursor: connectMode ? "pointer" : "default",
                userSelect: "none",
                fontWeight: 500,
                fontSize: 14,
                transition: "box-shadow 0.15s, border-color 0.15s, background 0.15s",
                zIndex: 10,
              }}
            >
              {node.label}
            </div>
          )
        })}

        {/* ─── SVG 箭头层 ─────────────────────────────── */}
        <ArrowOverlay
          connections={connections}
          pendingFrom={pendingFrom}
          mousePos={mousePos}
          containerRef={containerRef}
          nodes={nodes}
        />
      </div>

      {/* 当前连接列表 (调试用) */}
      <div style={{ marginTop: 16 }}>
        <h4>{"当前连线列表:"}</h4>
        {connections.length === 0 && (
          <p style={{ color: "#9ca3af", fontSize: 13 }}>{"暂无连线"}</p>
        )}
        <ul style={{ fontSize: 13, color: "#374151" }}>
          {connections.map((c) => (
            <li key={c.id}>
              {c.fromId} {"→"} {c.toId}
              <button
                onClick={() =>
                  setConnections((prev) => prev.filter((x) => x.id !== c.id))
                }
                style={{
                  marginLeft: 8,
                  color: "#ef4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {"[删除]"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── SVG 箭头覆盖层 ──────────────────────────────────────
//
// 负责:
//   - 渲染已创建的 connections (实线 + 箭头)
//   - 渲染 pending 连线虚线 (从 pendingFrom 节点底部到鼠标位置)
//   - 使用 requestAnimationFrame 持续刷新坐标

interface ArrowOverlayProps {
  connections: Connection[]
  pendingFrom: string | null
  mousePos: { x: number; y: number } | null
  containerRef: React.RefObject<HTMLDivElement | null>
  nodes: NodeData[]
}

interface ArrowLine {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

function ArrowOverlay({
  connections,
  pendingFrom,
  mousePos,
  containerRef,
  nodes,
}: ArrowOverlayProps) {
  const [arrows, setArrows] = useState<ArrowLine[]>([])
  const [pendingArrow, setPendingArrow] = useState<ArrowLine | null>(null)

  // ─── 工具函数: 获取节点边缘中点 ─────────────────────
  const getNodeEdge = useCallback(
    (nodeId: string, direction: "top" | "bottom") => {
      const container = containerRef.current
      if (!container) return null
      const el = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement | null
      if (!el) return null
      const elRect = el.getBoundingClientRect()
      const cRect = container.getBoundingClientRect()
      return {
        x: elRect.left + elRect.width / 2 - cRect.left,
        y: direction === "bottom"
          ? elRect.bottom - cRect.top
          : elRect.top - cRect.top,
      }
    },
    [containerRef]
  )

  const getNodeCenter = useCallback(
    (nodeId: string) => {
      const container = containerRef.current
      if (!container) return null
      const el = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement | null
      if (!el) return null
      const elRect = el.getBoundingClientRect()
      const cRect = container.getBoundingClientRect()
      return {
        x: elRect.left + elRect.width / 2 - cRect.left,
        y: elRect.top + elRect.height / 2 - cRect.top,
      }
    },
    [containerRef]
  )

  // ─── RAF 循环: 每帧重新计算箭头坐标 ─────────────────
  const recalculate = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // 已确认的连线
    const newArrows: ArrowLine[] = []
    for (const conn of connections) {
      const fromCenter = getNodeCenter(conn.fromId)
      const toCenter = getNodeCenter(conn.toId)
      if (!fromCenter || !toCenter) continue
      const goingDown = fromCenter.y < toCenter.y
      const from = getNodeEdge(conn.fromId, goingDown ? "bottom" : "top")
      const to = getNodeEdge(conn.toId, goingDown ? "top" : "bottom")
      if (!from || !to) continue
      newArrows.push({ id: conn.id, x1: from.x, y1: from.y, x2: to.x, y2: to.y })
    }
    setArrows(newArrows)

    // 正在拖拽的虚线
    if (pendingFrom && mousePos) {
      const from = getNodeEdge(pendingFrom, "bottom")
      if (from) {
        const cRect = container.getBoundingClientRect()
        setPendingArrow({
          id: "pending",
          x1: from.x,
          y1: from.y,
          x2: mousePos.x - cRect.left,
          y2: mousePos.y - cRect.top,
        })
      }
    } else {
      setPendingArrow(null)
    }
  }, [connections, pendingFrom, mousePos, containerRef, getNodeEdge, getNodeCenter])

  useEffect(() => {
    let rafId: number
    const loop = () => {
      recalculate()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [recalculate])

  // ─── 渲染 SVG ─────────────────────────────────────────
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <defs>
        {/* 箭头标记 */}
        <marker
          id="demo-arrowhead"
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill="#475569" />
        </marker>
        <marker
          id="demo-arrowhead-pending"
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill="#2563eb" fillOpacity={0.5} />
        </marker>
      </defs>

      {/* 已确认的连线: 实线 + 贝塞尔曲线 + 箭头 */}
      {arrows.map((a) => {
        const midY = (a.y1 + a.y2) / 2
        const d = `M ${a.x1} ${a.y1} C ${a.x1} ${midY}, ${a.x2} ${midY}, ${a.x2} ${a.y2}`
        return (
          <path
            key={a.id}
            d={d}
            fill="none"
            stroke="#475569"
            strokeWidth={2}
            markerEnd="url(#demo-arrowhead)"
          />
        )
      })}

      {/* 虚线: 从起点到鼠标当前位置 */}
      {pendingArrow && (
        <path
          d={`M ${pendingArrow.x1} ${pendingArrow.y1} C ${pendingArrow.x1} ${
            (pendingArrow.y1 + pendingArrow.y2) / 2
          }, ${pendingArrow.x2} ${
            (pendingArrow.y1 + pendingArrow.y2) / 2
          }, ${pendingArrow.x2} ${pendingArrow.y2}`}
          fill="none"
          stroke="#2563eb"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeOpacity={0.6}
          markerEnd="url(#demo-arrowhead-pending)"
        />
      )}
    </svg>
  )
}
