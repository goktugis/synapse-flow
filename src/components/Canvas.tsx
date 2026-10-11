import React, { useRef, useState, useEffect } from 'react'
import type { WorkflowNode, WorkflowEdge } from '../types/workflow'
import { NodeCard } from './NodeCard'

interface CanvasProps {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNode: WorkflowNode | null
  onSelectNode: (node: WorkflowNode | null) => void
  onUpdateNodePosition: (id: string, pos: { x: number; y: number }) => void
  onDeleteNode: (id: string) => void
  onDeleteEdge: (id: string) => void
  onAddEdge: (edge: WorkflowEdge) => void
  onOpenSettings: (node: WorkflowNode) => void
  isExecuting: boolean
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  onUpdateNodePosition,
  onDeleteNode,
  onDeleteEdge,
  onAddEdge,
  onOpenSettings,
  isExecuting
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Connection drawing state
  const [connectionDraft, setConnectionDraft] = useState<{
    sourceNodeId: string
    handle: 'default' | 'true' | 'false'
    mousePos: { x: number; y: number }
  } | null>(null)

  // Start dragging a node
  const handleMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if (connectionDraft) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDraggingNodeId(node.id)
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // Handle mouse move across canvas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - canvasRect.left
    const mouseY = e.clientY - canvasRect.top

    if (draggingNodeId) {
      const newX = Math.max(20, Math.min(2500, mouseX - dragOffset.x))
      const newY = Math.max(20, Math.min(1800, mouseY - dragOffset.y))
      onUpdateNodePosition(draggingNodeId, { x: newX, y: newY })
    }

    if (connectionDraft) {
      setConnectionDraft(prev => prev ? { ...prev, mousePos: { x: mouseX, y: mouseY } } : null)
    }
  }

  const handleMouseUp = () => {
    setDraggingNodeId(null)
  }

  // Cancel draft connection on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectionDraft(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Start a new connection from a port
  const handleStartConnection = (sourceNodeId: string, handle: 'default' | 'true' | 'false' = 'default') => {
    const node = nodes.find(n => n.id === sourceNodeId)
    if (!node) return
    setConnectionDraft({
      sourceNodeId,
      handle,
      mousePos: { x: node.position.x + 256, y: node.position.y + 60 }
    })
  }

  // Complete a connection by clicking on target port
  const handleCompleteConnection = (targetNodeId: string) => {
    if (!connectionDraft) return
    if (connectionDraft.sourceNodeId === targetNodeId) {
      setConnectionDraft(null)
      return
    }

    const alreadyExists = edges.some(
      e => e.source === connectionDraft.sourceNodeId && e.target === targetNodeId
    )

    if (!alreadyExists) {
      const newEdge: WorkflowEdge = {
        id: `e_${Date.now()}`,
        source: connectionDraft.sourceNodeId,
        target: targetNodeId,
        sourceHandle: connectionDraft.handle,
        animated: true,
        label:
          connectionDraft.handle === 'true'
            ? 'True'
            : connectionDraft.handle === 'false'
            ? 'False'
            : undefined
      }
      onAddEdge(newEdge)
    }

    setConnectionDraft(null)
  }

  // Calculate Cubic Bezier SVG path between two points
  const calculatePath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const dx = Math.abs(endX - startX) * 0.55
    return `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`
  }

  return (
    <div
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => {
        onSelectNode(null)
        if (connectionDraft) setConnectionDraft(null)
      }}
      className="relative flex-1 h-full canvas-grid overflow-auto select-none"
    >
      {/* SVG Canvas for connection lines */}
      <svg
        className="absolute inset-0 pointer-events-none z-10 w-[3000px] h-[2000px]"
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="edge-true" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="edge-false" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* Render Established Edges */}
        {edges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source)
          const targetNode = nodes.find(n => n.id === edge.target)
          if (!sourceNode || !targetNode) return null

          const isCondition = sourceNode.type === 'condition_branch'
          let startYOffset = 60
          if (isCondition) {
            startYOffset = edge.sourceHandle === 'true' ? 42 : 78
          }

          const startX = sourceNode.position.x + 256
          const startY = sourceNode.position.y + startYOffset
          const endX = targetNode.position.x
          const endY = targetNode.position.y + 60

          const pathD = calculatePath(startX, startY, endX, endY)
          const isEdgeActive =
            sourceNode.status === 'running' || sourceNode.status === 'success'

          let strokeColor = 'url(#edge-gradient)'
          if (edge.sourceHandle === 'true') strokeColor = 'url(#edge-true)'
          else if (edge.sourceHandle === 'false') strokeColor = 'url(#edge-false)'

          return (
            <g key={edge.id} className="group pointer-events-auto cursor-pointer">
              {/* Thick transparent hit area for easy click to delete */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                onClick={e => {
                  e.stopPropagation()
                  onDeleteEdge(edge.id)
                }}
              />
              {/* Background shadow stroke */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(0,0,0,0.6)"
                strokeWidth={4}
              />
              {/* Main glowing connection curve */}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isEdgeActive ? 2.5 : 1.8}
                className={isExecuting && isEdgeActive ? 'animate-flow-dash' : ''}
                strokeOpacity={isEdgeActive ? 0.95 : 0.6}
              />
              {/* Edge Label for conditional handles */}
              {edge.label && (
                <text
                  x={(startX + endX) / 2}
                  y={(startY + endY) / 2 - 8}
                  fill={edge.sourceHandle === 'true' ? '#34d399' : '#c084fc'}
                  fontSize={10}
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="bg-slate-950 px-1 py-0.5 rounded select-none pointer-events-none"
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Live Draft Connection Line when dragging a wire */}
        {connectionDraft && (() => {
          const sourceNode = nodes.find(n => n.id === connectionDraft.sourceNodeId)
          if (!sourceNode) return null
          const isCondition = sourceNode.type === 'condition_branch'
          let startYOffset = 60
          if (isCondition) {
            startYOffset = connectionDraft.handle === 'true' ? 42 : 78
          }
          const startX = sourceNode.position.x + 256
          const startY = sourceNode.position.y + startYOffset
          const pathD = calculatePath(
            startX,
            startY,
            connectionDraft.mousePos.x,
            connectionDraft.mousePos.y
          )
          return (
            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              className="animate-pulse"
            />
          )
        })()}
      </svg>

      {/* Render All Node Cards */}
      <div className="relative z-20 w-[3000px] h-[2000px]">
        {nodes.map(node => (
          <div key={node.id} onMouseDown={e => handleMouseDown(e, node)}>
            <NodeCard
              node={node}
              isSelected={selectedNode?.id === node.id}
              onSelect={onSelectNode}
              onDelete={onDeleteNode}
              onOpenSettings={onOpenSettings}
              onStartConnection={handleStartConnection}
              onCompleteConnection={handleCompleteConnection}
              isConnecting={Boolean(connectionDraft)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
