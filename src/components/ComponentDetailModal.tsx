import React from 'react';
import { ArchitectureNode } from '../types';
import { X, CheckCircle2, AlertTriangle, Lightbulb, Code2, Layers, Cpu, Database } from 'lucide-react';

interface Props {
  node: ArchitectureNode | null;
  onClose: () => void;
}

export const ComponentDetailModal: React.FC<Props> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="component-modal-container"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-6 bg-slate-900/95 border-b border-slate-800 backdrop-blur">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {node.badge || node.category}
              </span>
              <span className="text-xs text-slate-400">
                Component ID: <code className="text-slate-300 font-mono">{node.id}</code>
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">{node.title}</h2>
            {node.subtitle && <p className="text-sm font-medium text-slate-400">{node.subtitle}</p>}
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <p className="text-base text-slate-300 leading-relaxed">{node.description}</p>
          </div>

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Architectural Tags & Examples</h4>
              <div className="flex flex-wrap gap-2">
                {node.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 font-mono text-xs rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Responsibilities */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
              <Layers className="w-4 h-4 text-blue-400" />
              Core Responsibilities
            </h4>
            <ul className="space-y-2">
              {node.keyResponsibilities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Production Tech Stack & Protocols
            </h4>
            <div className="flex flex-wrap gap-2">
              {node.technologies.map((tech, idx) => (
                <span key={idx} className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-800/80 text-purple-300 border border-purple-800/30">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Deep Dive: Problem & Design Choice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Problem at Scale
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{node.deepDive.problemStatement}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Datadog / Monarch Design Choice
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{node.deepDive.designChoice}</p>
            </div>
          </div>

          {/* Trade-offs */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Architectural Trade-offs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Advantages</span>
                <ul className="mt-2 space-y-1.5">
                  {node.deepDive.tradeoffs.pros.map((pro, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Costs & Limitations</span>
                <ul className="mt-2 space-y-1.5">
                  {node.deepDive.tradeoffs.cons.map((con, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Staff Interview Tip */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Staff / Principal Interview Pro-Tip
            </div>
            <p className="text-sm text-amber-200/90 leading-relaxed">{node.deepDive.interviewProTip}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-slate-900/95 border-t border-slate-800 flex justify-end">
          <button
            id="modal-done-btn"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Close Deep Dive
          </button>
        </div>
      </div>
    </div>
  );
};
