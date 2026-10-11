import { useState, useEffect, useMemo, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Header } from './components/Header'
import { NodePalette } from './components/NodePalette'
import { Canvas } from './components/Canvas'
import { TelemetryPanel } from './components/TelemetryPanel'
import { NodeInspectorModal } from './components/NodeInspectorModal'
import { WORKFLOW_TEMPLATES } from './data/templates'
import { NODE_REGISTRY } from './data/nodeMetadata'
import type {
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  LogEntry,
  StepMetric
} from './types/workflow'
import {
  detectCycles,
  topologicalSort,
  executeSingleNode
} from './engine/graphEngine'

export function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('secops_pipeline')
  const initialTemplate = WORKFLOW_TEMPLATES[0]

  const [nodes, setNodes] = useState<WorkflowNode[]>(initialTemplate.nodes)
  const [edges, setEdges] = useState<WorkflowEdge[]>(initialTemplate.edges)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null)

  const [isExecuting, setIsExecuting] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [metrics, setMetrics] = useState<StepMetric[]>([])
  const [executionDurationMs, setExecutionDurationMs] = useState<number | undefined>(undefined)

  const executionAbortRef = useRef(false)

  // Cycle check on any graph modification
  const cycleResult = useMemo(() => {
    return detectCycles(nodes, edges)
  }, [nodes, edges])

  // Template switch
  const handleSelectTemplate = (id: string) => {
    const tpl = WORKFLOW_TEMPLATES.find(t => t.id === id)
    if (!tpl) return
    setSelectedTemplateId(id)
    setNodes(tpl.nodes.map(n => ({ ...n, status: 'idle', output: undefined, latencyMs: undefined })))
    setEdges(tpl.edges)
    setSelectedNode(null)
    setLogs([
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('tr-TR'),
        level: 'info',
        message: `"${tpl.title}" şablonu yüklendi.`
      }
    ])
    setMetrics([])
    setExecutionDurationMs(undefined)
  }

  // Add node from palette
  const handleAddNode = (type: NodeType) => {
    const meta = NODE_REGISTRY[type]
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      label: meta.label,
      position: {
        x: 100 + Math.floor(Math.random() * 200),
        y: 100 + Math.floor(Math.random() * 200)
      },
      status: 'idle',
      data: { ...meta.defaultData }
    }
    setNodes(prev => [...prev, newNode])
    setLogs(prev => [
      ...prev,
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('tr-TR'),
        level: 'info',
        message: `Yeni düğüm eklendi: ${meta.label}`
      }
    ])
  }

  // Update position
  const handleUpdateNodePosition = (id: string, pos: { x: number; y: number }) => {
    setNodes(prev => prev.map(n => (n.id === id ? { ...n, position: pos } : n)))
  }

  // Delete node and connected edges
  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id))
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id))
    if (selectedNode?.id === id) setSelectedNode(null)
  }

  // Delete edge
  const handleDeleteEdge = (id: string) => {
    setEdges(prev => prev.filter(e => e.id !== id))
  }

  // Add edge
  const handleAddEdge = (edge: WorkflowEdge) => {
    setEdges(prev => [...prev, edge])
  }

  // Reset workflow
  const handleResetWorkflow = () => {
    executionAbortRef.current = true
    setIsExecuting(false)
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle', output: undefined, latencyMs: undefined })))
    setLogs([])
    setMetrics([])
    setExecutionDurationMs(undefined)
  }

  // Save edited node from modal
  const handleSaveNodeConfig = (updated: WorkflowNode) => {
    setNodes(prev => prev.map(n => (n.id === updated.id ? updated : n)))
    if (selectedNode?.id === updated.id) setSelectedNode(updated)
  }

  // Run full workflow
  const handleRunWorkflow = async () => {
    if (cycleResult.hasCycle) return
    setIsExecuting(true)
    executionAbortRef.current = false
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle', output: undefined, latencyMs: undefined })))
    setMetrics([])
    setExecutionDurationMs(undefined)

    const startTime = performance.now()
    const currentTemplate = WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplateId)
    let currentPayload = currentTemplate?.samplePayload || { timestamp: Date.now() }

    setLogs([
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('tr-TR'),
        level: 'info',
        message: 'İş akışı Kahn Algoritması ile sıralanıyor ve yürütme başlatılıyor...'
      }
    ])

    try {
      const sequence = topologicalSort(nodes, edges)
      const skippedNodes = new Set<string>()

      for (const nodeId of sequence) {
        if (executionAbortRef.current) break

        const node = nodes.find(n => n.id === nodeId)
        if (!node) continue

        if (skippedNodes.has(nodeId)) {
          setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, status: 'skipped' } : n)))
          setLogs(prev => [
            ...prev,
            {
              id: `log_${Date.now()}_${nodeId}`,
              timestamp: new Date().toLocaleTimeString('tr-TR'),
              level: 'warn',
              nodeId,
              nodeLabel: node.label,
              message: `[${node.label}] Koşul dalı dışında kaldığı için atlandı.`
            }
          ])
          continue
        }

        // Set status to running
        setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, status: 'running' } : n)))
        const stepStart = performance.now()

        setLogs(prev => [
          ...prev,
          {
            id: `log_${Date.now()}_${nodeId}`,
            timestamp: new Date().toLocaleTimeString('tr-TR'),
            level: 'info',
            nodeId,
            nodeLabel: node.label,
            message: `[${node.label}] Yürütülüyor...`
          }
        ])

        const res = await executeSingleNode(node, currentPayload)
        const stepDuration = Math.round(performance.now() - stepStart)

        currentPayload = { ...currentPayload, ...res.output }

        // Update node with success and output
        setNodes(prev =>
          prev.map(n =>
            n.id === nodeId
              ? { ...n, status: 'success', output: res.output, latencyMs: stepDuration }
              : n
          )
        )

        // Record metrics
        setMetrics(prev => [
          ...prev,
          {
            nodeId,
            nodeLabel: node.label,
            type: node.type,
            durationMs: stepDuration,
            status: 'success',
            timestamp: new Date().toLocaleTimeString('tr-TR')
          }
        ])

        setLogs(prev => [
          ...prev,
          {
            id: `log_res_${Date.now()}_${nodeId}`,
            timestamp: new Date().toLocaleTimeString('tr-TR'),
            level: 'success',
            nodeId,
            nodeLabel: node.label,
            message: `[${node.label}] Tamamlandı (${stepDuration}ms)`,
            payload: res.output
          }
        ])

        // If condition branch, skip the unselected branch
        if (node.type === 'condition_branch' && res.branchChoice) {
          const outEdges = edges.filter(e => e.source === nodeId)
          outEdges.forEach(e => {
            if (e.sourceHandle && e.sourceHandle !== res.branchChoice) {
              skippedNodes.add(e.target)
            }
          })
        }
      }

      const totalDuration = Math.round(performance.now() - startTime)
      setExecutionDurationMs(totalDuration)

      setLogs(prev => [
        ...prev,
        {
          id: `log_finish_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('tr-TR'),
          level: 'success',
          message: `Tüm iş akışı başarıyla tamamlandı! Toplam süre: ${totalDuration}ms`
        }
      ])

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (err: any) {
      setLogs(prev => [
        ...prev,
        {
          id: `log_err_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('tr-TR'),
          level: 'error',
          message: `Hata: ${err?.message || 'Bilinmeyen yürütme hatası'}`
        }
      ])
    } finally {
      setIsExecuting(false)
    }
  }

  // Single step run
  const handleStepWorkflow = async () => {
    if (cycleResult.hasCycle || isExecuting) return
    const nextIdleNode = nodes.find(n => n.status === 'idle')
    if (!nextIdleNode) {
      handleRunWorkflow()
      return
    }

    setIsExecuting(true)
    setNodes(prev => prev.map(n => (n.id === nextIdleNode.id ? { ...n, status: 'running' } : n)))

    const stepStart = performance.now()
    const res = await executeSingleNode(nextIdleNode, { step: true })
    const stepDuration = Math.round(performance.now() - stepStart)

    setNodes(prev =>
      prev.map(n =>
        n.id === nextIdleNode.id
          ? { ...n, status: 'success', output: res.output, latencyMs: stepDuration }
          : n
      )
    )

    setMetrics(prev => [
      ...prev,
      {
        nodeId: nextIdleNode.id,
        nodeLabel: nextIdleNode.label,
        type: nextIdleNode.type,
        durationMs: stepDuration,
        status: 'success',
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }
    ])

    setLogs(prev => [
      ...prev,
      {
        id: `log_step_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('tr-TR'),
        level: 'success',
        nodeId: nextIdleNode.id,
        nodeLabel: nextIdleNode.label,
        message: `Tek adım yürütüldü: [${nextIdleNode.label}] (${stepDuration}ms)`
      }
    ])

    setIsExecuting(false)
  }

  // Export JSON schema
  const handleExportJson = () => {
    const data = {
      name: 'SynapseFlow Export',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      nodes,
      edges
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synapse-flow-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import JSON schema
  const handleImportJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = event => {
        try {
          const parsed = JSON.parse(event.target?.result as string)
          if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            setNodes(parsed.nodes)
            setEdges(parsed.edges)
            setLogs(prev => [
              ...prev,
              {
                id: `log_import_${Date.now()}`,
                timestamp: new Date().toLocaleTimeString('tr-TR'),
                level: 'success',
                message: `JSON iş akışı başarıyla yüklendi (${parsed.nodes.length} Düğüm).`
              }
            ])
          }
        } catch {
          alert('Geçersiz JSON dosyası!')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // Load initial template logs on mount
  useEffect(() => {
    handleSelectTemplate('secops_pipeline')
  }, [])

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090a0f] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        templates={WORKFLOW_TEMPLATES}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={handleSelectTemplate}
        onRunWorkflow={handleRunWorkflow}
        onStepWorkflow={handleStepWorkflow}
        onResetWorkflow={handleResetWorkflow}
        isExecuting={isExecuting}
        hasCycle={cycleResult.hasCycle}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Node Palette Sidebar */}
        <NodePalette onAddNode={handleAddNode} />

        {/* Center: Graph Canvas */}
        <Canvas
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onUpdateNodePosition={handleUpdateNodePosition}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
          onAddEdge={handleAddEdge}
          onOpenSettings={node => setEditingNode(node)}
          isExecuting={isExecuting}
        />

        {/* Right: Telemetry & Logs Panel */}
        <TelemetryPanel
          logs={logs}
          metrics={metrics}
          selectedNode={selectedNode}
          executionDurationMs={executionDurationMs}
        />
      </div>

      {/* Node Settings Inspector Modal */}
      <NodeInspectorModal
        node={editingNode}
        onClose={() => setEditingNode(null)}
        onSave={handleSaveNodeConfig}
      />
    </div>
  )
}

export default App
