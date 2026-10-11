import React from 'react'
import {
  Radio,
  Clock,
  Zap,
  SlidersHorizontal,
  GitFork,
  ShieldCheck,
  Gauge,
  Sparkles,
  Smile,
  BrainCircuit,
  Globe,
  BellRing,
  FileText,
  Settings,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock3
} from 'lucide-react'
import type { WorkflowNode, NodeStatus } from '../types/workflow'
import { NODE_REGISTRY } from '../data/nodeMetadata'

interface NodeCardProps {
  node: WorkflowNode
  isSelected: boolean
  onSelect: (node: WorkflowNode) => void
  onDelete: (id: string) => void
  onOpenSettings: (node: WorkflowNode) => void
  onStartConnection: (nodeId: string, handle?: 'default' | 'true' | 'false') => void
  onCompleteConnection: (nodeId: string) => void
  isConnecting: boolean
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onOpenSettings,
  onStartConnection,
  onCompleteConnection,
  isConnecting
}) => {
  const meta = NODE_REGISTRY[node.type] || {
    label: node.label,
    icon: 'Zap',
    color: 'from-slate-600 to-slate-800',
    glowColor: 'rgba(255,255,255,0.2)'
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Radio': return <Radio className="w-3.5 h-3.5" />
      case 'Clock': return <Clock className="w-3.5 h-3.5" />
      case 'Zap': return <Zap className="w-3.5 h-3.5" />
      case 'SlidersHorizontal': return <SlidersHorizontal className="w-3.5 h-3.5" />
      case 'GitFork': return <GitFork className="w-3.5 h-3.5" />
      case 'ShieldCheck': return <ShieldCheck className="w-3.5 h-3.5" />
      case 'Gauge': return <Gauge className="w-3.5 h-3.5" />
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5" />
      case 'Smile': return <Smile className="w-3.5 h-3.5" />
      case 'BrainCircuit': return <BrainCircuit className="w-3.5 h-3.5" />
      case 'Globe': return <Globe className="w-3.5 h-3.5" />
      case 'BellRing': return <BellRing className="w-3.5 h-3.5" />
      case 'FileText': return <FileText className="w-3.5 h-3.5" />
      default: return <Zap className="w-3.5 h-3.5" />
    }
  }

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 animate-pulse">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            <span>Çalışıyor</span>
          </span>
        )
      case 'success':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Başarılı</span>
          </span>
        )
      case 'error':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-red-950/80 text-red-400 border border-red-500/40">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>Hata</span>
          </span>
        )
      case 'skipped':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50">
            <Clock3 className="w-2.5 h-2.5" />
            <span>Atlandı</span>
          </span>
        )
      default:
        return (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800">
            Bekliyor
          </span>
        )
    }
  }

  const isCondition = node.type === 'condition_branch'
  const isTrigger = node.type.includes('trigger')

  return (
    <div
      onClick={e => {
        e.stopPropagation()
        onSelect(node)
      }}
      className={`absolute w-64 rounded-xl border transition-all duration-200 cursor-move select-none ${
        node.status === 'running'
          ? 'node-running-glow border-cyan-400 bg-slate-900/95 ring-2 ring-cyan-500/30'
          : isSelected
          ? 'border-cyan-400/80 bg-slate-900/95 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
          : 'border-slate-800/90 bg-slate-900/85 hover:border-slate-700/90 hover:bg-slate-900/95 shadow-lg shadow-black/40'
      }`}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`
      }}
    >
      {/* Target input port (on the left edge, except for triggers) */}
      {!isTrigger && (
        <div
          onClick={e => {
            e.stopPropagation()
            if (isConnecting) onCompleteConnection(node.id)
          }}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer group ${
            isConnecting ? 'ring-2 ring-cyan-400 animate-pulse bg-cyan-950' : ''
          }`}
          title="Girdi Portu (Bağlantı almak için tıkla)"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-slate-900 group-hover:bg-cyan-400 group-hover:scale-125 transition" />
        </div>
      )}

      {/* Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-md bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shrink-0 shadow-sm`}
          >
            {getIcon(meta.icon)}
          </div>
          <span className="text-xs font-semibold text-slate-200 truncate">
            {node.label}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={e => {
              e.stopPropagation()
              onOpenSettings(node)
            }}
            title="Düğümü Yapılandır"
            className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onDelete(node.id)
            }}
            title="Düğümü Sil"
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content body */}
      <div className="p-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Durum:</span>
          {getStatusBadge(node.status)}
        </div>

        {node.latencyMs !== undefined && (
          <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
            <span>Gecikme:</span>
            <span className="text-cyan-400 font-semibold">{node.latencyMs}ms</span>
          </div>
        )}

        {/* Dynamic preview of node data */}
        <div className="bg-slate-950/80 rounded-lg p-2 font-mono text-[10px] text-slate-400 border border-slate-800/60 truncate">
          {node.type === 'condition_branch' ? (
            <span>IF {node.data.field || 'val'} {node.data.operator || '>'} {node.data.threshold ?? 1000}</span>
          ) : node.type === 'webhook_trigger' ? (
            <span>POST {node.data.path || '/webhook'}</span>
          ) : node.type === 'schedule_trigger' ? (
            <span>CRON {node.data.cron || '0 0 * * *'}</span>
          ) : node.type === 'crypto_hash' ? (
            <span>{node.data.algorithm || 'SHA-256'} Checksum</span>
          ) : node.type === 'ai_prompt' ? (
            <span>Ajan: {node.data.template?.slice(0, 24) || 'LLM Analizi'}...</span>
          ) : (
            <span>Hazır • {node.type}</span>
          )}
        </div>
      </div>

      {/* Source Output Ports (on the right edge) */}
      {!isCondition ? (
        <div
          onClick={e => {
            e.stopPropagation()
            onStartConnection(node.id, 'default')
          }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer group"
          title="Çıktı Portu (Bağlantı çekmek için tıkla)"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900 group-hover:scale-125 group-hover:bg-cyan-300 shadow-sm shadow-cyan-400/50 transition" />
        </div>
      ) : (
        <>
          {/* True Branch Port */}
          <div
            onClick={e => {
              e.stopPropagation()
              onStartConnection(node.id, 'true')
            }}
            className="absolute -right-3 top-[35%] -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer group"
            title="True (Koşul Sağlandı) Çıktı Portu"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 group-hover:scale-125 group-hover:bg-emerald-300 shadow-sm shadow-emerald-400/50 transition" />
            <span className="absolute right-4 text-[9px] font-mono text-emerald-400 font-bold bg-slate-950 px-1 rounded border border-emerald-900/60 pointer-events-none">
              T
            </span>
          </div>

          {/* False Branch Port */}
          <div
            onClick={e => {
              e.stopPropagation()
              onStartConnection(node.id, 'false')
            }}
            className="absolute -right-3 top-[65%] -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer group"
            title="False (Koşul Sağlanmadı) Çıktı Portu"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 border-2 border-slate-900 group-hover:scale-125 group-hover:bg-purple-300 shadow-sm shadow-purple-400/50 transition" />
            <span className="absolute right-4 text-[9px] font-mono text-purple-400 font-bold bg-slate-950 px-1 rounded border border-purple-900/60 pointer-events-none">
              F
            </span>
          </div>
        </>
      )}
    </div>
  )
}
