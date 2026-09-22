import React, { useState } from 'react';
import { PathMode, ArchitectureNode } from '../types';
import { ARCHITECTURE_NODES } from '../data/architectureData';
import { 
  Play, 
  Pause, 
  Layers, 
  ArrowRight, 
  Info, 
  ShieldCheck, 
  Activity, 
  Database, 
  Server, 
  BellRing, 
  Cpu, 
  Search, 
  BarChart3,
  HardDrive
} from 'lucide-react';

interface Props {
  onSelectNode: (node: ArchitectureNode) => void;
  activePath: PathMode;
  setActivePath: (path: PathMode) => void;
}

export const ArchitectureDiagram: React.FC<Props> = ({
  onSelectNode,
  activePath,
  setActivePath
}) => {
  const [animating, setAnimating] = useState<boolean>(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const getNode = (id: string) => ARCHITECTURE_NODES.find(n => n.id === id);

  const isHighlighted = (nodeId: string) => {
    if (activePath === 'all') return true;
    const node = getNode(nodeId);
    if (!node) return false;
    return node.highlightInPaths.includes(activePath);
  };

  const getNodeClass = (nodeId: string, defaultBorder: string = 'border-slate-700') => {
    const active = isHighlighted(nodeId);
    const isHovered = hoveredNodeId === nodeId;
    return `relative transition-all duration-300 rounded-xl cursor-pointer select-none text-left p-3.5 ${
      active
        ? `${defaultBorder} shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02]`
        : 'opacity-35 grayscale-[50%] border-slate-800'
    } ${isHovered ? 'ring-2 ring-cyan-400/80 scale-[1.02]' : ''}`;
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col gap-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Metrics Monitoring System Architecture
            </h2>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Datadog Scale
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Scale: <span className="text-slate-200 font-semibold">1M metrics/sec</span> Ingestion · <span className="text-slate-200 font-semibold">Sub-second</span> Dashboard Queries · <span className="text-slate-200 font-semibold">Distributed Rollups</span>
          </p>
        </div>

        {/* Path Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="filter-all-path"
            onClick={() => setActivePath('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activePath === 'all'
                ? 'bg-slate-200 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Flows
          </button>

          <button
            id="filter-write-path"
            onClick={() => setActivePath('write')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              activePath === 'write'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                : 'bg-slate-800/80 text-blue-300 border-blue-800/40 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Write Path (8 MB/s)
          </button>

          <button
            id="filter-read-path"
            onClick={() => setActivePath('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              activePath === 'read'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800/80 text-cyan-300 border-cyan-800/40 hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Read Path (SLO &lt;2s)
          </button>

          <button
            id="filter-alert-path"
            onClick={() => setActivePath('alert')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              activePath === 'alert'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800/80 text-emerald-300 border-emerald-800/40 hover:bg-slate-800'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            Alert / Rollup
          </button>

          <button
            id="toggle-animation-btn"
            onClick={() => setAnimating(!animating)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ml-1"
            title={animating ? "Pause flow pulse" : "Resume flow pulse"}
          >
            {animating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Diagram Canvas */}
      <div className="relative w-full overflow-x-auto pb-4">
        <div className="min-w-[1020px] grid grid-cols-12 gap-5 relative">

          {/* COL 1: Data Sources / Agents (Cols 1-3) */}
          <div className="col-span-3 flex flex-col gap-3.5 p-3 rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-950/40">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                Data Sources / Agents
              </span>
              <span className="text-[10px] font-mono text-slate-400">Push &amp; Pull</span>
            </div>

            {/* Host Agent (web-01) */}
            <div
              id="node-host_agent_web01"
              onClick={() => onSelectNode(getNode('host_agent_web01')!)}
              onMouseEnter={() => setHoveredNodeId('host_agent_web01')}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={getNodeClass('host_agent_web01', 'bg-blue-950/40 border border-blue-700/50')}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-blue-200">Host Agent (web-01)</h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">Go</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Metric Collector</p>
              <div className="mt-2 text-[11px] font-mono text-cyan-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 truncate">
                cpu.usage&#123;region=us-east&#125;
              </div>
            </div>

            {/* Host Agent (web-02) */}
            <div
              id="node-host_agent_web02"
              onClick={() => onSelectNode(getNode('host_agent_web02')!)}
              onMouseEnter={() => setHoveredNodeId('host_agent_web02')}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={getNodeClass('host_agent_web02', 'bg-blue-950/40 border border-blue-700/50')}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-blue-200">Host Agent (web-02)</h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">Go</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Metric Collector</p>
              <div className="mt-2 text-[11px] font-mono text-cyan-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 truncate">
                mem.used&#123;region=us-east&#125;
              </div>
            </div>

            {/* K8s DaemonSet */}
            <div
              id="node-k8s_daemonset"
              onClick={() => onSelectNode(getNode('k8s_daemonset')!)}
              onMouseEnter={() => setHoveredNodeId('k8s_daemonset')}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={getNodeClass('k8s_daemonset', 'bg-slate-800/60 border border-slate-700')}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-200">K8s DaemonSet</h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">Kube</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Kube-State-Metrics</p>
              <div className="mt-2 text-[11px] font-mono text-indigo-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 truncate">
                pod.uptime&#123;ns=production&#125;
              </div>
            </div>

            {/* Staff L6/L7 Shield: Cardinality Limiter */}
            <div
              id="node-cardinality_limiter"
              onClick={() => onSelectNode(getNode('cardinality_limiter')!)}
              onMouseEnter={() => setHoveredNodeId('cardinality_limiter')}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={getNodeClass('cardinality_limiter', 'bg-amber-950/30 border-2 border-amber-600/60 shadow-amber-950/30')}
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Staff L6/L7 Shield
              </div>
              <h4 className="font-bold text-sm text-amber-200 mt-0.5">Cardinality Limiter</h4>
              <ul className="mt-2 space-y-1 text-[11px] text-amber-300/80">
                <li>• Evaluates unique tag sets (HLL)</li>
                <li>• Drops high-card tags (user_id, uuid)</li>
                <li>• Prevents Index Bloat &amp; OOM</li>
                <li>• Tenant-wide Rate Limiting</li>
              </ul>
            </div>

            {/* CloudWatch / API Poller */}
            <div
              id="node-cloudwatch_poller"
              onClick={() => onSelectNode(getNode('cloudwatch_poller')!)}
              onMouseEnter={() => setHoveredNodeId('cloudwatch_poller')}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={getNodeClass('cloudwatch_poller', 'bg-slate-800/50 border border-slate-700')}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-200">CloudWatch / API Poller</h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">Pull</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">External Pull Integration</p>
              <p className="text-[11px] text-slate-400 mt-1">Rate Limited · Micro Batched</p>
            </div>
          </div>

          {/* COL 2: Ingest Gateway & Kafka & Storage Workers (Cols 4-8) */}
          <div className="col-span-5 flex flex-col justify-between gap-4">
            
            {/* Top Stream: Flink Alerting Engine */}
            <div
              id="node-alerting_engine"
              onClick={() => onSelectNode(getNode('alerting_engine')!)}
              onMouseEnter={() => setHoveredNodeId('alerting_engine')}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={getNodeClass('alerting_engine', 'bg-emerald-950/40 border-2 border-emerald-500/60 shadow-emerald-950/30')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <BellRing className="w-3.5 h-3.5" />
                  Alerting Engine
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  Sub-5s Detection
                </span>
              </div>
              <h4 className="font-bold text-sm text-emerald-100 mt-1">Flink Sliding Window Compute</h4>
              <p className="text-xs text-emerald-300/80 mt-1">
                Evaluates metrics in real-time off Kafka buffer <br/>
                <span className="font-bold text-emerald-200">→ Trigger Notification Router (PagerDuty/Slack)</span>
              </p>
            </div>

            {/* Middle Pipeline: Ingest Gateway -> Kafka Cluster -> Storage Workers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-auto">
              
              {/* Ingest Gateway */}
              <div
                id="node-ingest_gateway"
                onClick={() => onSelectNode(getNode('ingest_gateway')!)}
                onMouseEnter={() => setHoveredNodeId('ingest_gateway')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={getNodeClass('ingest_gateway', 'bg-blue-900/60 border-2 border-blue-500/80 text-white shadow-blue-900/40')}
              >
                <div className="text-[10px] font-mono text-blue-300 uppercase tracking-wider font-bold">
                  Ingest Gateway
                </div>
                <h4 className="font-bold text-sm text-white mt-1">Load Balanced LB</h4>
                <p className="text-xs text-blue-200/80 mt-1 leading-snug">
                  Lightweight gRPC / TLS<br/>
                  Tenant Validation
                </p>
                <div className="mt-3 inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 border border-blue-400/40 text-blue-300">
                  Batching: 8 MB/s
                </div>
              </div>

              {/* Kafka Cluster */}
              <div
                id="node-kafka_cluster"
                onClick={() => onSelectNode(getNode('kafka_cluster')!)}
                onMouseEnter={() => setHoveredNodeId('kafka_cluster')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={getNodeClass('kafka_cluster', 'bg-slate-800 border-2 border-slate-600')}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-bold">
                    Kafka Cluster
                  </div>
                </div>
                <div className="my-2 space-y-1">
                  <div className="text-[10px] font-mono bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Partition 0
                  </div>
                  <div className="text-[10px] font-mono bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Partition 1
                  </div>
                  <div className="text-[10px] font-mono bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Partition N
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-400 text-center">Decouples Writes</p>
              </div>

              {/* Storage Workers */}
              <div
                id="node-storage_workers"
                onClick={() => onSelectNode(getNode('storage_workers')!)}
                onMouseEnter={() => setHoveredNodeId('storage_workers')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={getNodeClass('storage_workers', 'bg-blue-950/30 border-2 border-sky-500/70')}
              >
                <div className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                  Storage Workers
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
                  <li className="font-semibold text-sky-200">1. Resolve Tag Strings to ID</li>
                  <li>• Drain Buffer in Batches</li>
                  <li>• Decouple Tags from TS Data</li>
                  <li className="font-semibold text-emerald-300">• Direct Sequential Append</li>
                </ul>
              </div>
            </div>

            {/* Bottom: Interactive UI Dash & Distributed Query Engine */}
            <div className="grid grid-cols-12 gap-3 pt-2">
              {/* Interactive UI Dash */}
              <div
                id="node-ui_dash"
                onClick={() => onSelectNode(getNode('ui_dash')!)}
                onMouseEnter={() => setHoveredNodeId('ui_dash')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`col-span-4 ${getNodeClass('ui_dash', 'bg-slate-800/90 border border-slate-600')}`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Interactive UI Dash
                </div>
                <div className="mt-2 h-7 bg-slate-950/80 rounded border border-slate-800 p-1 flex items-center justify-center">
                  <svg className="w-full h-full stroke-cyan-400 fill-none" viewBox="0 0 100 24">
                    <path d="M 0 18 Q 15 2 30 14 T 60 8 T 85 16 T 100 6" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Distributed Query Engine */}
              <div
                id="node-query_engine"
                onClick={() => onSelectNode(getNode('query_engine')!)}
                onMouseEnter={() => setHoveredNodeId('query_engine')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`col-span-8 ${getNodeClass('query_engine', 'bg-slate-800/80 border-2 border-cyan-500/70')}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs md:text-sm text-cyan-200">Distributed Query Engine</h4>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">SLO &lt;2s</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-300 mt-1">Smart Horizon Optimization Routing:</p>
                <div className="mt-1 space-y-0.5 text-[11px] font-mono">
                  <div className="text-yellow-300">• Window ≤ 24h → Read Raw Store</div>
                  <div className="text-orange-300">• Window ≤ 30d → Read 1m Rollup</div>
                  <div className="text-purple-300">• Window &gt; 30d → Read 1h Rollup</div>
                </div>
              </div>
            </div>

          </div>

          {/* COL 3: Metadata Indexes & Time-Series DB Shards (Cols 9-12) */}
          <div className="col-span-4 flex flex-col gap-3.5">
            
            {/* Metadata Indexes (Top Right) */}
            <div
              id="node-metadata_indexes"
              onClick={() => onSelectNode(getNode('metadata_indexes')!)}
              onMouseEnter={() => setHoveredNodeId('metadata_indexes')}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={getNodeClass('metadata_indexes', 'bg-slate-800/70 border border-slate-600')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Search className="w-3.5 h-3.5 text-blue-400" />
                  Metadata Indexes
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                  NVMe
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1">Map: metric_id → String Tags</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Policy: retention config</p>
              <div className="mt-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded inline-block">
                [ Inverted Index / NVMe ]
              </div>
            </div>

            {/* Time-Series DB Shards (Tiered Storage Container) */}
            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-950/40 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  Time-Series DB Shards
                </span>
                <span className="text-[10px] font-mono text-slate-400">3-Tier Storage</span>
              </div>

              {/* 1. Raw Store (15s res) */}
              <div
                id="node-raw_store"
                onClick={() => onSelectNode(getNode('raw_store')!)}
                onMouseEnter={() => setHoveredNodeId('raw_store')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={getNodeClass('raw_store', 'bg-yellow-950/30 border-2 border-yellow-500/70')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs md:text-sm text-yellow-200">1. Raw Store (15s res)</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-300 border border-yellow-700/50">
                    Tier 1
                  </span>
                </div>
                <div className="mt-1 text-xs text-yellow-300/80 space-y-0.5">
                  <div>Retention: <span className="font-bold text-white">24 Hours</span></div>
                  <div>Volume: <span className="font-bold text-white">~46 GB/Day</span></div>
                  <div className="font-mono text-[11px] text-yellow-400">Engine: LSM-Tree Append</div>
                </div>
              </div>

              {/* Arrow: Rollup Pipeline (1m Roll) */}
              <div
                id="node-rollup_1m"
                onClick={() => onSelectNode(getNode('rollup_1m')!)}
                onMouseEnter={() => setHoveredNodeId('rollup_1m')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-slate-800/80 border border-orange-700/50 cursor-pointer hover:bg-orange-950/40 transition-colors text-center"
              >
                <span className="text-[11px] font-semibold text-orange-300">Rollup Pipeline (1m Roll)</span>
                <ArrowRight className="w-3 h-3 text-orange-400 rotate-90" />
              </div>

              {/* 2. Mid Store (1m res) */}
              <div
                id="node-mid_store"
                onClick={() => onSelectNode(getNode('mid_store')!)}
                onMouseEnter={() => setHoveredNodeId('mid_store')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={getNodeClass('mid_store', 'bg-orange-950/30 border-2 border-orange-500/70')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs md:text-sm text-orange-200">2. Mid Store (1m res)</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-300 border border-orange-700/50">
                    Tier 2
                  </span>
                </div>
                <div className="mt-1 text-xs text-orange-300/80 space-y-0.5">
                  <div>Retention: <span className="font-bold text-white">30 Days</span></div>
                  <div>Aggs: <span className="font-semibold text-white">Avg, Min, Max, Sum</span></div>
                  <div className="font-mono text-[11px] text-orange-400">Compacted Rollup Block</div>
                </div>
              </div>

              {/* Arrow: Rollup Pipeline (1h Roll) */}
              <div
                id="node-rollup_1h"
                onClick={() => onSelectNode(getNode('rollup_1h')!)}
                onMouseEnter={() => setHoveredNodeId('rollup_1h')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-slate-800/80 border border-purple-700/50 cursor-pointer hover:bg-purple-950/40 transition-colors text-center"
              >
                <span className="text-[11px] font-semibold text-purple-300">Rollup Pipeline (1h Roll)</span>
                <ArrowRight className="w-3 h-3 text-purple-400 rotate-90" />
              </div>

              {/* 3. Final Store (1h res) */}
              <div
                id="node-final_store"
                onClick={() => onSelectNode(getNode('final_store')!)}
                onMouseEnter={() => setHoveredNodeId('final_store')}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={getNodeClass('final_store', 'bg-purple-950/30 border-2 border-purple-500/70')}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs md:text-sm text-purple-200">3. Final Store (1h res)</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/50">
                    Tier 3
                  </span>
                </div>
                <div className="mt-1 text-xs text-purple-300/80 space-y-0.5">
                  <div>Retention: <span className="font-bold text-white">2 Years</span></div>
                  <div>Format: <span className="font-semibold text-white">Block Parquet</span></div>
                  <div className="font-mono text-[11px] text-purple-400">Cold Tier / Object Store S3</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Footer Interactive Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-5 flex-wrap">
          <span className="font-semibold text-slate-300">Legend:</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Write Path (Agents → Ingest → Kafka → Storage)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>Read Path (UI → Query Engine → Shards)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Alert Path (Kafka → Flink)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400" />
            <span>Rollup Pipeline (15s → 1m → 1h)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Click any block for Staff-level architecture deep dive</span>
        </div>
      </div>
    </div>
  );
};
