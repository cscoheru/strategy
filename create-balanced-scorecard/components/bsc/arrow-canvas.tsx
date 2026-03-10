"use client"

import { useEffect, useState, useCallback } from "react"

export interface Connection {
  id: string
  fromId: string
  toId: string
}

interface ArrowCanvasProps {
  connections: Connection[]
  containerRef: React.RefObject<HTMLDivElement | null>
  pendingFrom: string | null
  mousePos: { x: number; y: number } | null
}

interface ArrowLine {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

function getCapsuleEdge(
  capsuleEl: HTMLElement,
  container: HTMLElement,
  direction: "bottom" | "top"
) {
  const capsuleRect = capsuleEl.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const x =
    capsuleRect.left +
    capsuleRect.width / 2 -
    containerRect.left +
    container.scrollLeft
  const y =
    direction === "bottom"
      ? capsuleRect.bottom - containerRect.top + container.scrollTop
      : capsuleRect.top - containerRect.top + container.scrollTop
  return { x, y }
}

function getCapsuleCenter(capsuleEl: HTMLElement, container: HTMLElement) {
  const capsuleRect = capsuleEl.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    x:
      capsuleRect.left +
      capsuleRect.width / 2 -
      containerRect.left +
      container.scrollLeft,
    y:
      capsuleRect.top +
      capsuleRect.height / 2 -
      containerRect.top +
      container.scrollTop,
  }
}

export function ArrowCanvas({
  connections,
  containerRef,
  pendingFrom,
  mousePos,
}: ArrowCanvasProps) {
  const [arrows, setArrows] = useState<ArrowLine[]>([])
  const [pendingArrow, setPendingArrow] = useState<ArrowLine | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const recalculate = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    setDimensions({
      width: container.scrollWidth,
      height: container.scrollHeight,
    })

    const newArrows: ArrowLine[] = []
    for (const conn of connections) {
      const fromEl = container.querySelector(
        `[data-capsule-id="${conn.fromId}"]`
      ) as HTMLElement | null
      const toEl = container.querySelector(
        `[data-capsule-id="${conn.toId}"]`
      ) as HTMLElement | null
      if (!fromEl || !toEl) continue

      const fromCenter = getCapsuleCenter(fromEl, container)
      const toCenter = getCapsuleCenter(toEl, container)
      const goingDown = fromCenter.y < toCenter.y

      const from = getCapsuleEdge(
        fromEl,
        container,
        goingDown ? "bottom" : "top"
      )
      const to = getCapsuleEdge(
        toEl,
        container,
        goingDown ? "top" : "bottom"
      )

      newArrows.push({
        id: conn.id,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
      })
    }
    setArrows(newArrows)
  }, [connections, containerRef])

  // Use a continuous RAF loop to keep arrows in sync with dragged capsules
  useEffect(() => {
    let rafId: number

    const loop = () => {
      recalculate()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [recalculate])

  useEffect(() => {
    const container = containerRef.current
    if (!pendingFrom || !mousePos || !container) {
      setPendingArrow(null)
      return
    }
    const fromEl = container.querySelector(
      `[data-capsule-id="${pendingFrom}"]`
    ) as HTMLElement | null
    if (!fromEl) return

    const from = getCapsuleEdge(fromEl, container, "bottom")
    const containerRect = container.getBoundingClientRect()
    setPendingArrow({
      id: "pending",
      x1: from.x,
      y1: from.y,
      x2: mousePos.x - containerRect.left + container.scrollLeft,
      y2: mousePos.y - containerRect.top + container.scrollTop,
    })
  }, [pendingFrom, mousePos, containerRef])

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-30"
      width={dimensions.width || "100%"}
      height={dimensions.height || "100%"}
      style={{ overflow: "visible" }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon points="0 0, 10 4, 0 8" className="fill-foreground/60" />
        </marker>
        <marker
          id="arrowhead-pending"
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon points="0 0, 10 4, 0 8" className="fill-primary/50" />
        </marker>
      </defs>

      {arrows.map((arrow) => {
        const midY = (arrow.y1 + arrow.y2) / 2
        const path = `M ${arrow.x1} ${arrow.y1} C ${arrow.x1} ${midY}, ${arrow.x2} ${midY}, ${arrow.x2} ${arrow.y2}`
        return (
          <path
            key={arrow.id}
            d={path}
            fill="none"
            className="stroke-foreground/50"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        )
      })}

      {pendingArrow && (
        <path
          d={`M ${pendingArrow.x1} ${pendingArrow.y1} C ${pendingArrow.x1} ${
            (pendingArrow.y1 + pendingArrow.y2) / 2
          }, ${pendingArrow.x2} ${
            (pendingArrow.y1 + pendingArrow.y2) / 2
          }, ${pendingArrow.x2} ${pendingArrow.y2}`}
          fill="none"
          className="stroke-primary/40"
          strokeWidth="2"
          strokeDasharray="6 4"
          markerEnd="url(#arrowhead-pending)"
        />
      )}
    </svg>
  )
}
