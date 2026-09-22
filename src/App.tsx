/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PathMode, ArchitectureNode } from './types';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { ComponentDetailModal } from './components/ComponentDetailModal';
import { CapacityEstimator } from './components/CapacityEstimator';
import { SmartHorizonPlayground } from './components/SmartHorizonPlayground';
import { CardinalityDefenseLab } from './components/CardinalityDefenseLab';
import { InterviewWalkthrough } from './components/InterviewWalkthrough';
import { LiveIngestSimulator } from './components/LiveIngestSimulator';
import { InterviewCheatsheet } from './components/InterviewCheatsheet';
import { 
  Layers, 
  BookOpen, 
  Calculator, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Award, 
  Server, 
  Database,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

type TabType = 'diagram' | 'walkthrough' | 'estimator' | 'query' | 'shield' | 'live' | 'cheatsheet';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('diagram');
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);
  const [activePath, setActivePath] = useState<PathMode>('all');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Banner / Hero Info Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Metrics Monitoring System (Datadog Scale)
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  STAFF / PRINCIPAL WALKTHROUGH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Archetype: <span className="text-slate-300 font-medium">Infrastructure &amp; Platform</span> · Asked at: <span className="text-cyan-400 font-medium">Datadog</span>, <span className="text-cyan-400 font-medium">Google (Monarch)</span>, <span className="text-cyan-400 font-medium">Meta (ODS)</span>
              </p>
            </div>
          </div>

          {/* Quick SLA / Metrics Pills */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              Ingest: <span className="text-cyan-400 font-bold">1M/s</span> (8 MB/s)
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              Query SLO: <span className="text-emerald-400 font-bold">&lt; 2.0s</span>
            </div>
            <div className="hidden lg:block px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              Retention: <span className="text-yellow-400 font-bold">15s</span> → <span className="text-orange-400 font-bold">1m</span> → <span className="text-purple-400 font-bold">1h</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none border-t border-slate-800/40">
          <nav className="flex space-x-1 py-2 text-xs font-medium">
            <button
              id="tab-btn-diagram"
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'diagram'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              Architecture Map
            </button>

            <button
              id="tab-btn-walkthrough"
              onClick={() => setActiveTab('walkthrough')}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'walkthrough'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Interview Walkthrough (Steps 1–4)
            </button>

            <button
              id="tab-btn-estimator"
              onClick={() => setActiveTab('estimator')}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'estimator'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Step 2 Capacity Sizing
            </button>

            <button
              id="tab-btn-query"
              onClick={() => setActiveTab('query')}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'query'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              Smart Horizon Query Router
            </button>

            <button
              id="tab-btn-shield"
              onClick={() => setActiveTab('shield')}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'shield'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Staff L6/L7 Shield Lab
            </button>

            <button
              id="tab-btn-live"
              onClick={() => setActiveTab('live')}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'live'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              Live Ingest Stream
            </button>

            <button
              id="tab-btn-cheatsheet"
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'cheatsheet'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              Interview Defense Cheatsheet
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Core Probe Summary Banner (Visible across views) */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-slate-900/40 border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <span>The Core Architectural Dilemma</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 normal-case font-normal">Write Throughput vs Query Latency</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              1,000,000 metrics/sec written sequentially via <strong>LSM-Trees</strong> vs interactive sub-second queries across 2 years of history optimized via <strong>Distributed 1m &amp; 1h Rollups</strong> and <strong>Smart Horizon Routing</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="explore-diagram-quick-btn"
              onClick={() => setActiveTab('diagram')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition-colors flex items-center gap-1"
            >
              View Full Architecture Map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab View Switching */}
        {activeTab === 'diagram' && (
          <div className="flex flex-col gap-6">
            <ArchitectureDiagram 
              onSelectNode={(node) => setSelectedNode(node)} 
              activePath={activePath}
              setActivePath={setActivePath}
            />

            {/* Quick Walkthrough Card underneath Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('walkthrough')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-850"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Step 1 — Clarify</div>
                <h4 className="font-bold text-sm text-white mt-1">Requirements &amp; Scope</h4>
                <p className="text-xs text-slate-400 mt-1">
                  1M/s ingestion, &lt;2s query SLO, 15s/1m/1h retention, and sliding window alerting.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('estimator')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-850"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-yellow-400">Step 2 — Estimate</div>
                <h4 className="font-bold text-sm text-white mt-1">Capacity &amp; Sizing Math</h4>
                <p className="text-xs text-slate-400 mt-1">
                  8 MB/s write throughput, 5.8B points/day, 46 GB/day raw volume, and 50 GB/mo rollups.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('query')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:bg-slate-850"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Step 3 &amp; 4 — Deep Dive</div>
                <h4 className="font-bold text-sm text-white mt-1">Smart Horizon &amp; Rollups</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Test interactive queries over 24h, 30d, and 2y with dynamic storage tier selection.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'walkthrough' && <InterviewWalkthrough />}

        {activeTab === 'estimator' && <CapacityEstimator />}

        {activeTab === 'query' && <SmartHorizonPlayground />}

        {activeTab === 'shield' && <CardinalityDefenseLab />}

        {activeTab === 'live' && <LiveIngestSimulator />}

        {activeTab === 'cheatsheet' && <InterviewCheatsheet />}

      </main>

      {/* Slide-over Component Detail Modal */}
      <ComponentDetailModal 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Distributed Metrics Monitoring System Design · Modeled after Datadog, Google Monarch, &amp; Meta ODS
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Scale: 1,000,000 metrics/sec · Gorilla TSDB · LSM-Tree · Flink Alerting
          </span>
        </div>
      </footer>
    </div>
  );
}
