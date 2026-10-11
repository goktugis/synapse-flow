import React, { useState } from 'react'
import { X, Save, Settings, Sliders } from 'lucide-react'
import type { WorkflowNode } from '../types/workflow'

interface NodeInspectorModalProps {
  node: WorkflowNode | null
  onClose: () => void
  onSave: (updatedNode: WorkflowNode) => void
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  onClose,
  onSave
}) => {
  if (!node) return null

  const [label, setLabel] = useState(node.label)
  const [data, setData] = useState<Record<string, any>>({ ...node.data })

  const handleSave = () => {
    onSave({
      ...node,
      label,
      data
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Düğüm Ayarları: {node.label}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">{node.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Label Input */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Düğüm Başlığı (Label)
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Condition-specific inputs */}
          {node.type === 'condition_branch' && (
            <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Koşullu Dallanma Parametreleri
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Alan (Field)</label>
                  <input
                    type="text"
                    value={data.field || 'amount'}
                    onChange={e => setData({ ...data, field: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Operatör</label>
                  <select
                    value={data.operator || '>'}
                    onChange={e => setData({ ...data, operator: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
                  >
                    <option value=">">&gt; (Büyüktür)</option>
                    <option value=">=">&gt;= (Büyük Eşittir)</option>
                    <option value="<">&lt; (Küçüktür)</option>
                    <option value="==">== (Eşittir)</option>
                    <option value="!=">!= (Eşit Değildir)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Eşik Değer (Threshold)</label>
                  <input
                    type="number"
                    value={data.threshold ?? 1000}
                    onChange={e => setData({ ...data, threshold: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI Prompt specific input */}
          {node.type === 'ai_prompt' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Ajan Şablonu (Prompt Template)
              </label>
              <textarea
                rows={3}
                value={data.template || ''}
                onChange={e => setData({ ...data, template: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Raw JSON Data config */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Ekstra Yapılandırma (JSON)
            </label>
            <textarea
              rows={4}
              value={JSON.stringify(data, null, 2)}
              onChange={e => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  setData(parsed)
                } catch {
                  // Keep user typing
                }
              }}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-300 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2.5 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition shadow-md shadow-cyan-900/40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  )
}
