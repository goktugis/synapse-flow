import React from 'react'
import {
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  Layers,
  StepForward,
  AlertCircle
} from 'lucide-react'
import type { WorkflowTemplate } from '../types/workflow'

interface HeaderProps {
  templates: WorkflowTemplate[]
  selectedTemplateId: string
  onSelectTemplate: (id: string) => void
  onRunWorkflow: () => void
  onStepWorkflow: () => void
  onResetWorkflow: () => void
  isExecuting: boolean
  hasCycle: boolean
  onExportJson: () => void
  onImportJson: () => void
}

export const Header: React.FC<HeaderProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onRunWorkflow,
  onStepWorkflow,
  onResetWorkflow,
  isExecuting,
  hasCycle,
  onExportJson,
  onImportJson
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Layers className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                SynapseFlow
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                DAG ORCHESTRATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Görsel İş Akışı & Otonom Ajan Motoru</p>
          </div>
        </div>

        {/* Template Selector */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs text-slate-400 font-medium">Şablon:</span>
          <select
            value={selectedTemplateId}
            onChange={e => onSelectTemplate(e.target.value)}
            disabled={isExecuting}
            className="text-xs bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 hover:border-slate-600 transition cursor-pointer"
          >
            {templates.map(tpl => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Execution Controls */}
      <div className="flex items-center gap-2.5">
        {hasCycle && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-800/80 rounded-lg text-red-300 text-xs font-mono animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Döngü Tespit Edildi! (DAG Geçersiz)</span>
          </div>
        )}

        {/* Step Run */}
        <button
          onClick={onStepWorkflow}
          disabled={isExecuting || hasCycle}
          title="Adım adım yürüt"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <StepForward className="w-3.5 h-3.5 text-sky-400" />
          <span>Tek Adım</span>
        </button>

        {/* Full Run */}
        <button
          onClick={onRunWorkflow}
          disabled={isExecuting || hasCycle}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg transition duration-200 ${
            isExecuting
              ? 'bg-amber-600 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-950/50 hover:shadow-emerald-500/20'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Yürütülüyor...' : 'Akışı Başlat'}</span>
        </button>

        {/* Reset */}
        <button
          onClick={onResetWorkflow}
          disabled={isExecuting}
          title="Durumu Sıfırla"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Export / Import */}
        <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
          <button
            onClick={onExportJson}
            title="İş Akışını JSON Olarak İndir"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onImportJson}
            title="JSON İş Akışı Yükle"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/goktugis/synapse-flow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
        >
          <svg className="w-3.5 h-3.5 fill-current text-slate-400" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  )
}
