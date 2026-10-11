import React, { useState } from 'react'
import {
  Terminal,
  Activity,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import type { LogEntry, StepMetric, WorkflowNode } from '../types/workflow'

interface TelemetryPanelProps {
  logs: LogEntry[]
  metrics: StepMetric[]
  selectedNode: WorkflowNode | null
  executionDurationMs?: number
  onClose?: () => void
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  logs,
  metrics,
  selectedNode,
  executionDurationMs,
  onClose
}) => {
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [isPayloadOpen, setIsPayloadOpen] = useState(true)

  const handleCopyPayload = () => {
    const dataToCopy = selectedNode?.output || {
      status: 'success',
      totalDurationMs: executionDurationMs || 142,
      metricsCount: metrics.length
    }
    navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2))
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  return (
    <aside className="w-84 lg:w-96 border-l border-slate-800/80 bg-slate-950/85 backdrop-blur-md flex flex-col shrink-0 z-20 h-full">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            Yürütme & Telemetri
          </h3>
          {executionDurationMs !== undefined && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              {executionDurationMs}ms
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Section 1: Live Terminal Logs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Canlı Terminal Günlükleri
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {logs.length} Kayıt
            </span>
          </div>

          <div className="bg-black/70 border border-slate-800/90 rounded-xl p-2.5 font-mono text-[11px] h-48 overflow-y-auto space-y-1.5 shadow-inner">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                Akış başladığında günlükler burada akar...
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="leading-tight">
                  <span className="text-slate-600 text-[10px]">
                    [{log.timestamp}]
                  </span>{' '}
                  <span
                    className={
                      log.level === 'success'
                        ? 'text-emerald-400'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : log.level === 'error'
                        ? 'text-red-400'
                        : 'text-cyan-400'
                    }
                  >
                    {log.level.toUpperCase()}
                  </span>
                  : <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Step-by-Step Latency Metrics */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Adım Adım Gecikme Metrikleri
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {metrics.length} Düğüm
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2 divide-y divide-slate-800/60 max-h-44 overflow-y-auto">
            {metrics.length === 0 ? (
              <div className="py-6 text-center text-slate-600 text-xs">
                Yürütülen düğüm metriği yok
              </div>
            ) : (
              metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="py-1.5 px-1 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-slate-300 font-medium truncate text-[11px]">
                      {metric.nodeLabel}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {metric.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (metric.durationMs / 120) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-cyan-400 w-10 text-right">
                      {metric.durationMs}ms
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: JSON Payloads */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsPayloadOpen(!isPayloadOpen)}
              className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 hover:text-slate-100 transition"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>JSON Veri Yükü (Payload)</span>
              {isPayloadOpen ? (
                <ChevronUp className="w-3 h-3 text-slate-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-500" />
              )}
            </button>

            <button
              onClick={handleCopyPayload}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
            >
              {copiedPayload ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Kopyala</span>
                </>
              )}
            </button>
          </div>

          {isPayloadOpen && (
            <div className="bg-black/70 border border-slate-800/90 rounded-xl p-3 font-mono text-[11px] text-emerald-400 h-44 overflow-y-auto">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(
                  selectedNode
                    ? selectedNode.output || selectedNode.data
                    : metrics.length > 0
                    ? {
                        status: 'COMPLETED',
                        totalLatency: `${executionDurationMs || 0}ms`,
                        executedNodes: metrics.length
                      }
                    : { info: 'Detay görmek için bir düğüme tıklayın.' },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
