import React, { useState } from 'react'
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
  Search,
  Plus
} from 'lucide-react'
import { NODE_REGISTRY } from '../data/nodeMetadata'
import type { NodeType, NodeCategory } from '../types/workflow'

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Radio': return <Radio className="w-4 h-4" />
      case 'Clock': return <Clock className="w-4 h-4" />
      case 'Zap': return <Zap className="w-4 h-4" />
      case 'SlidersHorizontal': return <SlidersHorizontal className="w-4 h-4" />
      case 'GitFork': return <GitFork className="w-4 h-4" />
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />
      case 'Gauge': return <Gauge className="w-4 h-4" />
      case 'Sparkles': return <Sparkles className="w-4 h-4" />
      case 'Smile': return <Smile className="w-4 h-4" />
      case 'BrainCircuit': return <BrainCircuit className="w-4 h-4" />
      case 'Globe': return <Globe className="w-4 h-4" />
      case 'BellRing': return <BellRing className="w-4 h-4" />
      case 'FileText': return <FileText className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const categoryLabels: Record<NodeCategory, string> = {
    trigger: 'Tetikleyiciler',
    logic: 'İş Mantığı & Güvenlik',
    ai: 'Yapay Zeka Ajanları',
    action: 'Aksiyon & Çıktı'
  }

  const allNodes = Object.values(NODE_REGISTRY)

  const filteredNodes = allNodes.filter(node => {
    const matchesSearch =
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = activeCategory === 'all' || node.category === activeCategory
    return matchesSearch && matchesCat
  })

  return (
    <aside className="w-72 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex flex-col shrink-0 z-20">
      {/* Search Bar */}
      <div className="p-3.5 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Düğüm ara (örn. Webhook, AI)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'trigger', 'logic', 'ai', 'action'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 font-medium border border-cyan-800/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat === 'all' ? 'Tümü' : categoryLabels[cat as NodeCategory]}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNodes.map(node => (
          <div
            key={node.type}
            onClick={() => onAddNode(node.type)}
            className="group relative p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-cyan-950/20"
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${node.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition`}
              >
                {getIcon(node.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition">
                    {node.label}
                  </h4>
                  <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:rotate-90 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {node.description}
                </p>
              </div>
            </div>
          </div>
        ))}
        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            Eşleşen düğüm bulunamadı
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Tuvale eklemek için tıkla</span>
        <span className="font-mono text-cyan-400 font-semibold">{allNodes.length} Düğüm</span>
      </div>
    </aside>
  )
}
