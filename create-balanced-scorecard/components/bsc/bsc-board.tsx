"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { SwimLane, type CapsuleData } from "./swim-lane"
import { ArrowCanvas, type Connection } from "./arrow-canvas"
import { StylePanel } from "./style-panel"
import type { ShapeType } from "./shape-renderer"
import { Link2, Link2Off, Trash2, RotateCcw } from "lucide-react"

interface LaneData {
  id: string
  title: string
  colorClass: string
  height: number
  capsules: CapsuleData[]
}

const LANE_PAD_X = 24
const LANE_PAD_Y = 20
const CAP_H = 42
const CAP_GAP_Y = 16

const DEFAULT_FILL = "#ffffff"
const DEFAULT_BORDER = "#334155"

function makeInitialLanes(): LaneData[] {
  return [
    {
      id: "financial",
      title: "财务层面",
      colorClass: "bg-lane-financial",
      height: 200,
      capsules: [
        { id: "f1", text: "提高股东价值", x: 300, y: LANE_PAD_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "f2", text: "生产率战略", x: 140, y: LANE_PAD_Y + CAP_H + CAP_GAP_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "f3", text: "增长战略", x: 460, y: LANE_PAD_Y + CAP_H + CAP_GAP_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "f4", text: "改善成本结构", x: LANE_PAD_X, y: LANE_PAD_Y + (CAP_H + CAP_GAP_Y) * 2, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "f5", text: "提高资产利用率", x: 180, y: LANE_PAD_Y + (CAP_H + CAP_GAP_Y) * 2, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "f6", text: "增加收入机会", x: 380, y: LANE_PAD_Y + (CAP_H + CAP_GAP_Y) * 2, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "f7", text: "提高客户价值", x: 550, y: LANE_PAD_Y + (CAP_H + CAP_GAP_Y) * 2, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
      ],
    },
    {
      id: "customer",
      title: "客户层面",
      colorClass: "bg-lane-customer",
      height: 180,
      capsules: [
        { id: "c1", text: "客户满意度", x: LANE_PAD_X, y: LANE_PAD_Y + CAP_H + CAP_GAP_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "c2", text: "客户获取", x: 160, y: LANE_PAD_Y + CAP_H + CAP_GAP_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "c3", text: "客户保留", x: 300, y: LANE_PAD_Y + CAP_H + CAP_GAP_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "c4", text: "产品优势", x: 200, y: LANE_PAD_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "c5", text: "客户关系", x: 380, y: LANE_PAD_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "c6", text: "品牌形象", x: 520, y: LANE_PAD_Y, shape: "capsule", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
      ],
    },
    {
      id: "process",
      title: "内部流程层面",
      colorClass: "bg-lane-process",
      height: 140,
      capsules: [
        { id: "p1", text: "运营管理流程", x: LANE_PAD_X, y: LANE_PAD_Y + 20, shape: "chevron", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "p2", text: "客户管理流程", x: 200, y: LANE_PAD_Y + 20, shape: "chevron", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "p3", text: "创新流程", x: 380, y: LANE_PAD_Y + 20, shape: "chevron", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "p4", text: "法规与环境流程", x: 530, y: LANE_PAD_Y + 20, shape: "chevron", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
      ],
    },
    {
      id: "learning",
      title: "学习与成长层面",
      colorClass: "bg-lane-learning",
      height: 140,
      capsules: [
        { id: "l1", text: "人力资本", x: 80, y: LANE_PAD_Y + 20, shape: "rectangle", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "l2", text: "信息资本", x: 280, y: LANE_PAD_Y + 20, shape: "rectangle", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
        { id: "l3", text: "组织资本", x: 480, y: LANE_PAD_Y + 20, shape: "rectangle", fillColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER },
      ],
    },
  ]
}

const initialConnections: Connection[] = [
  { id: "conn1", fromId: "f1", toId: "f2" },
  { id: "conn2", fromId: "f1", toId: "f3" },
  { id: "conn3", fromId: "f2", toId: "f4" },
  { id: "conn4", fromId: "f2", toId: "f5" },
  { id: "conn5", fromId: "f3", toId: "f6" },
  { id: "conn6", fromId: "f3", toId: "f7" },
  { id: "conn7", fromId: "f4", toId: "c1" },
  { id: "conn8", fromId: "f7", toId: "c2" },
  { id: "conn9", fromId: "c1", toId: "p1" },
  { id: "conn10", fromId: "c2", toId: "p2" },
  { id: "conn11", fromId: "c4", toId: "p3" },
  { id: "conn12", fromId: "p1", toId: "l1" },
  { id: "conn13", fromId: "p2", toId: "l2" },
  { id: "conn14", fromId: "p4", toId: "l3" },
]

let capsuleIdCounter = 100

export function BSCBoard() {
  const [lanes, setLanes] = useState<LaneData[]>(makeInitialLanes)
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [connectMode, setConnectMode] = useState(false)
  const [pendingFrom, setPendingFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [selectedCapsuleId, setSelectedCapsuleId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Find the selected capsule's data for the style panel
  const selectedCapsule = selectedCapsuleId
    ? lanes.flatMap((l) => l.capsules).find((c) => c.id === selectedCapsuleId)
    : null

  const handleAddCapsule = useCallback((laneId: string) => {
    capsuleIdCounter++
    const newCapsule: CapsuleData = {
      id: `cap_${capsuleIdCounter}`,
      text: "新目标",
      x: LANE_PAD_X + Math.random() * 300,
      y: LANE_PAD_Y + Math.random() * 60,
      shape: "capsule",
      fillColor: DEFAULT_FILL,
      borderColor: DEFAULT_BORDER,
    }
    setLanes((prev) =>
      prev.map((lane) =>
        lane.id === laneId
          ? { ...lane, capsules: [...lane.capsules, newCapsule] }
          : lane
      )
    )
  }, [])

  const handleDeleteCapsule = useCallback(
    (laneId: string, capsuleId: string) => {
      setLanes((prev) =>
        prev.map((lane) =>
          lane.id === laneId
            ? { ...lane, capsules: lane.capsules.filter((c) => c.id !== capsuleId) }
            : lane
        )
      )
      setConnections((prev) =>
        prev.filter((c) => c.fromId !== capsuleId && c.toId !== capsuleId)
      )
      if (selectedCapsuleId === capsuleId) setSelectedCapsuleId(null)
    },
    [selectedCapsuleId]
  )

  const handleTextChange = useCallback(
    (_laneId: string, capsuleId: string, text: string) => {
      setLanes((prev) =>
        prev.map((lane) => ({
          ...lane,
          capsules: lane.capsules.map((c) =>
            c.id === capsuleId ? { ...c, text } : c
          ),
        }))
      )
    },
    []
  )

  const handlePositionChange = useCallback(
    (_laneId: string, capsuleId: string, newX: number, newY: number) => {
      setLanes((prev) =>
        prev.map((lane) => ({
          ...lane,
          capsules: lane.capsules.map((c) =>
            c.id === capsuleId ? { ...c, x: newX, y: newY } : c
          ),
        }))
      )
    },
    []
  )

  const handleLaneHeightChange = useCallback((laneId: string, newHeight: number) => {
    setLanes((prev) =>
      prev.map((lane) =>
        lane.id === laneId ? { ...lane, height: newHeight } : lane
      )
    )
  }, [])

  const handleSelectCapsule = useCallback((capsuleId: string) => {
    setSelectedCapsuleId((prev) => (prev === capsuleId ? null : capsuleId))
  }, [])

  const handleFillChange = useCallback(
    (color: string) => {
      if (!selectedCapsuleId) return
      setLanes((prev) =>
        prev.map((lane) => ({
          ...lane,
          capsules: lane.capsules.map((c) =>
            c.id === selectedCapsuleId ? { ...c, fillColor: color } : c
          ),
        }))
      )
    },
    [selectedCapsuleId]
  )

  const handleBorderChange = useCallback(
    (color: string) => {
      if (!selectedCapsuleId) return
      setLanes((prev) =>
        prev.map((lane) => ({
          ...lane,
          capsules: lane.capsules.map((c) =>
            c.id === selectedCapsuleId ? { ...c, borderColor: color } : c
          ),
        }))
      )
    },
    [selectedCapsuleId]
  )

  const handleShapeChange = useCallback(
    (shape: ShapeType) => {
      if (!selectedCapsuleId) return
      setLanes((prev) =>
        prev.map((lane) => ({
          ...lane,
          capsules: lane.capsules.map((c) =>
            c.id === selectedCapsuleId ? { ...c, shape } : c
          ),
        }))
      )
    },
    [selectedCapsuleId]
  )

  const handleConnectionTarget = useCallback(
    (_laneId: string, capsuleId: string) => {
      if (!connectMode) return

      if (!pendingFrom) {
        setPendingFrom(capsuleId)
        return
      }

      if (pendingFrom === capsuleId) {
        setPendingFrom(null)
        setMousePos(null)
        return
      }

      const exists = connections.some(
        (c) =>
          (c.fromId === pendingFrom && c.toId === capsuleId) ||
          (c.fromId === capsuleId && c.toId === pendingFrom)
      )
      if (!exists) {
        const newConn: Connection = {
          id: `conn_${Date.now()}`,
          fromId: pendingFrom,
          toId: capsuleId,
        }
        setConnections((prev) => [...prev, newConn])
      }
      setPendingFrom(null)
      setMousePos(null)
    },
    [pendingFrom, connections, connectMode]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (pendingFrom) {
        setMousePos({ x: e.clientX, y: e.clientY })
      }
    },
    [pendingFrom]
  )

  const handleClearConnections = useCallback(() => {
    setConnections([])
  }, [])

  const handleReset = useCallback(() => {
    setLanes(makeInitialLanes())
    setConnections(initialConnections)
    setConnectMode(false)
    setPendingFrom(null)
    setMousePos(null)
    setSelectedCapsuleId(null)
  }, [])

  // Click on empty area deselects capsule
  const handleBoardClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest("[data-capsule-id]")) {
      setSelectedCapsuleId(null)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPendingFrom(null)
        setMousePos(null)
        setSelectedCapsuleId(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Toolbar */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-6 py-3">
        <h1 className="text-lg font-bold text-foreground">
          {"BSC 平衡计分卡"}
        </h1>
        <div className="mx-2 h-6 w-px bg-border" />
        <button
          onClick={() => {
            setConnectMode(!connectMode)
            setPendingFrom(null)
            setMousePos(null)
          }}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            connectMode
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          {connectMode ? (
            <>
              <Link2 className="h-4 w-4" />
              <span>{"连线模式 (开启)"}</span>
            </>
          ) : (
            <>
              <Link2Off className="h-4 w-4" />
              <span>{"连线模式 (关闭)"}</span>
            </>
          )}
        </button>
        <button
          onClick={handleClearConnections}
          className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
        >
          <Trash2 className="h-4 w-4" />
          <span>{"清除连线"}</span>
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{"重置"}</span>
        </button>

        <p className="ml-auto text-xs text-muted-foreground">
          {"拖拽移动 | 双击编辑 | 点击选中改样式 | 拖拽泳道底边调高度"}
        </p>
      </header>

      {/* Board */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto p-6"
        onMouseMove={handleMouseMove}
        onClick={handleBoardClick}
      >
        <div className="relative flex flex-col gap-4">
          {lanes.map((lane) => (
            <SwimLane
              key={lane.id}
              id={lane.id}
              title={lane.title}
              colorClass={lane.colorClass}
              laneHeight={lane.height}
              onLaneHeightChange={handleLaneHeightChange}
              capsules={lane.capsules}
              onAddCapsule={handleAddCapsule}
              onDeleteCapsule={handleDeleteCapsule}
              onTextChange={handleTextChange}
              onPositionChange={handlePositionChange}
              onSelectCapsule={handleSelectCapsule}
              selectedCapsuleId={selectedCapsuleId}
              isConnecting={connectMode}
              pendingFrom={pendingFrom}
              onConnectionTarget={handleConnectionTarget}
            />
          ))}
        </div>

        <ArrowCanvas
          connections={connections}
          containerRef={containerRef}
          pendingFrom={pendingFrom}
          mousePos={mousePos}
        />

        {/* Style Panel */}
        <StylePanel
          selectedId={selectedCapsuleId}
          fillColor={selectedCapsule?.fillColor ?? DEFAULT_FILL}
          borderColor={selectedCapsule?.borderColor ?? DEFAULT_BORDER}
          shape={selectedCapsule?.shape ?? "capsule"}
          onFillChange={handleFillChange}
          onBorderChange={handleBorderChange}
          onShapeChange={handleShapeChange}
          onClose={() => setSelectedCapsuleId(null)}
        />
      </div>
    </div>
  )
}
