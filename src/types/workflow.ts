export type NodeCategory = 'trigger' | 'logic' | 'ai' | 'action'

export type NodeType =
  // Triggers
  | 'webhook_trigger'
  | 'schedule_trigger'
  | 'event_trigger'
  // Logic
  | 'data_transformer'
  | 'condition_branch'
  | 'crypto_hash'
  | 'rate_limiter'
  // AI
  | 'ai_prompt'
  | 'sentiment_analyzer'
  | 'intent_classifier'
  // Actions
  | 'rest_api'
  | 'notification_dispatch'
  | 'audit_logger'

export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped'

export interface NodeMetadata {
  type: NodeType
  category: NodeCategory
  label: string
  description: string
  icon: string
  color: string // Tailwind color class or hex
  glowColor: string
  defaultData: Record<string, any>
}

export interface WorkflowNode {
  id: string
  type: NodeType
  label: string
  position: { x: number; y: number }
  status: NodeStatus
  data: Record<string, any>
  output?: Record<string, any>
  error?: string
  latencyMs?: number
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: 'default' | 'true' | 'false'
  label?: string
  animated?: boolean
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'success' | 'warn' | 'error'
  nodeId?: string
  nodeLabel?: string
  message: string
  payload?: any
}

export interface StepMetric {
  nodeId: string
  nodeLabel: string
  type: NodeType
  durationMs: number
  status: NodeStatus
  timestamp: string
}

export interface WorkflowTemplate {
  id: string
  title: string
  description: string
  category: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  samplePayload: Record<string, any>
}

export interface ExecutionState {
  status: 'idle' | 'running' | 'completed' | 'failed'
  activeNodeId?: string
  logs: LogEntry[]
  metrics: StepMetric[]
  startTime?: number
  endTime?: number
  totalDurationMs?: number
}
