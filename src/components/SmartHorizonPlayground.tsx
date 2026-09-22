import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  ComposedChart 
} from 'recharts';
import { Search, Zap, Database, ArrowRight, Gauge, Clock, Layers } from 'lucide-react';

interface TimeWindowOption {
  id: string;
  label: string;
  durationHours: number;
  expectedTier: 'raw' | 'mid' | 'final';
  tierName: string;
  resolution: string;
  secondsPerPoint: number;
}

const TIME_WINDOWS: TimeWindowOption[] = [
  { id: '15m', label: 'Last 15 Minutes', durationHours: 0.25, expectedTier: 'raw', tierName: '1. Raw Store', resolution: '15s', secondsPerPoint: 15 },
  { id: '6h', label: 'Last 6 Hours', durationHours: 6, expectedTier: 'raw', tierName: '1. Raw Store', resolution: '15s', secondsPerPoint: 15 },
  { id: '24h', label: 'Last 24 Hours', durationHours: 24, expectedTier: 'raw', tierName: '1. Raw Store', resolution: '15s', secondsPerPoint: 15 },
  { id: '7d', label: 'Last 7 Days', durationHours: 168, expectedTier: 'mid', tierName: '2. Mid Store', resolution: '1m Rollup', secondsPerPoint: 60 },
  { id: '30d', label: 'Last 30 Days', durationHours: 720, expectedTier: 'mid', tierName: '2. Mid Store', resolution: '1m Rollup', secondsPerPoint: 60 },
  { id: '90d', label: 'Last 90 Days', durationHours: 2160, expectedTier: 'final', tierName: '3. Final Store', resolution: '1h Rollup', secondsPerPoint: 3600 },
  { id: '1y', label: 'Last 1 Year', durationHours: 8760, expectedTier: 'final', tierName: '3. Final Store', resolution: '1h Rollup', secondsPerPoint: 3600 },
];

export const SmartHorizonPlayground: React.FC = () => {
  const [selectedWindowId, setSelectedWindowId] = useState<string>('24h');
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu.usage');
  const [selectedTag, setSelectedTag] = useState<string>('host=web-01, region=us-east');
  const [aggFunc, setAggFunc] = useState<'avg' | 'max' | 'min'>('avg');

  const activeWindow = TIME_WINDOWS.find(w => w.id === selectedWindowId) || TIME_WINDOWS[2];

  // Mathematical points scanned calculation
  const totalSeconds = activeWindow.durationHours * 3600;
  const naive15sPoints = Math.round(totalSeconds / 15);
  const actualPointsScanned = Math.round(totalSeconds / activeWindow.secondsPerPoint);
  const dataReductionRatio = ((naive15sPoints - actualPointsScanned) / naive15sPoints) * 100;
  
  // Simulated query latency based on tier and points scanned
  const estimatedLatencyMs = useMemo(() => {
    if (activeWindow.expectedTier === 'raw') {
      return Math.round(15 + (actualPointsScanned * 0.006));
    } else if (activeWindow.expectedTier === 'mid') {
      return Math.round(25 + (actualPointsScanned * 0.003));
    } else {
      return Math.round(90 + (actualPointsScanned * 0.001)); // Parquet pushdown on S3
    }
  }, [activeWindow, actualPointsScanned]);

  // Synthetic time-series chart data generated according to selected resolution
  const chartData = useMemo(() => {
    // Generate between 30 to 80 representative sample points for smooth rendering
    const pointCount = 45;
    const now = Date.now();
    const intervalMs = (totalSeconds * 1000) / pointCount;
    const points = [];

    const baseVal = selectedMetric === 'cpu.usage' ? 42 : selectedMetric === 'mem.used' ? 68 : 120;
    const amplitude = selectedMetric === 'cpu.usage' ? 25 : selectedMetric === 'mem.used' ? 12 : 50;

    for (let i = 0; i < pointCount; i++) {
      const time = new Date(now - (pointCount - i) * intervalMs);
      const angle = (i / pointCount) * Math.PI * 4;
      const noise = (Math.sin(angle) * amplitude) + (Math.cos(i * 1.5) * 6);
      const avg = Math.max(5, Math.min(98, Math.round(baseVal + noise)));
      const max = Math.min(100, Math.round(avg + (activeWindow.expectedTier === 'raw' ? 4 : 12)));
      const min = Math.max(2, Math.round(avg - (activeWindow.expectedTier === 'raw' ? 4 : 12)));

      const timeStr = activeWindow.durationHours <= 24 
        ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : time.toLocaleDateString([], { month: 'short', day: 'numeric' });

      points.push({
        time: timeStr,
        avg: avg,
        max: max,
        min: min,
        value: aggFunc === 'avg' ? avg : aggFunc === 'max' ? max : min
      });
    }
    return points;
  }, [selectedMetric, activeWindow, totalSeconds, aggFunc]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Zap className="w-4 h-4" />
            Query Engine Interactive Simulator
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Smart Horizon Query Routing &amp; Multi-Tier Storage Access
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrates how the Distributed Query Engine chooses Raw Store vs 1m Rollup vs 1h Rollup to maintain &lt;2s query SLOs.
          </p>
        </div>

        {/* Query Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="select-metric"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="cpu.usage">cpu.usage (%)</option>
            <option value="mem.used">mem.used (%)</option>
            <option value="disk.iops">disk.iops (ops/sec)</option>
          </select>

          <select
            id="select-tag"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="host=web-01, region=us-east">host=web-01, region=us-east</option>
            <option value="host=web-02, region=us-east">host=web-02, region=us-east</option>
            <option value="env=prod, region=eu-west">env=prod, region=eu-west</option>
          </select>

          <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            {(['avg', 'max', 'min'] as const).map((fn) => (
              <button
                key={fn}
                id={`btn-agg-${fn}`}
                onClick={() => setAggFunc(fn)}
                className={`px-2.5 py-1 rounded font-mono uppercase font-semibold transition-all ${
                  aggFunc === fn ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Time Window Buttons */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Select Dashboard Query Time Window:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {TIME_WINDOWS.map((win) => {
            const isSelected = win.id === selectedWindowId;
            const tierColor = win.expectedTier === 'raw' ? 'border-yellow-500 text-yellow-300' : win.expectedTier === 'mid' ? 'border-orange-500 text-orange-300' : 'border-purple-500 text-purple-300';
            return (
              <button
                key={win.id}
                id={`win-btn-${win.id}`}
                onClick={() => setSelectedWindowId(win.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected 
                    ? `bg-slate-800 ${tierColor} ring-1 ring-cyan-400/50 shadow-lg` 
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">{win.label}</div>
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                  <span className={win.expectedTier === 'raw' ? 'text-yellow-400' : win.expectedTier === 'mid' ? 'text-orange-400' : 'text-purple-400'}>
                    {win.resolution}
                  </span>
                  <span className="text-slate-500">{win.expectedTier.toUpperCase()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Horizon Routing Diagnosis Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            activeWindow.expectedTier === 'raw' 
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' 
              : activeWindow.expectedTier === 'mid' 
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' 
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Router Decision:</span>
              <span className="text-sm font-bold text-white font-mono">{activeWindow.tierName}</span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-cyan-300 border border-slate-700">
                Res: {activeWindow.resolution}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeWindow.expectedTier === 'raw' 
                ? 'Time window ≤ 24h: Direct read from Tier 1 LSM-tree on NVMe with raw 15s granularity.' 
                : activeWindow.expectedTier === 'mid' 
                ? 'Time window ≤ 30d: Read Tier 2 1-minute compacted blocks with precomputed min/max/avg.' 
                : 'Time window > 30d: Read Tier 3 1-hour rollup columnar Parquet from Cloud Object Storage (S3).'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6">
          <div>
            <span className="text-[11px] text-slate-500 block">Query Latency</span>
            <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {estimatedLatencyMs} ms
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Points Scanned</span>
            <span className="text-sm font-bold font-mono text-cyan-300">
              {actualPointsScanned.toLocaleString()} pts
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Bandwidth Saved</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {dataReductionRatio > 0 ? `${dataReductionRatio.toFixed(1)}%` : 'Baseline'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="font-mono text-slate-300">
            <span className="text-cyan-400">{aggFunc}:</span>{selectedMetric}&#123;{selectedTag}&#125;
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Selected Metric ({aggFunc})
            </span>
            {activeWindow.expectedTier !== 'raw' && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500/20 border border-cyan-500/40" /> Min/Max Envelope
              </span>
            )}
          </div>
        </div>

        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
              />
              {activeWindow.expectedTier !== 'raw' && (
                <Area 
                  type="monotone" 
                  dataKey="max" 
                  stroke="transparent" 
                  fill="#06b6d4" 
                  fillOpacity={0.12} 
                />
              )}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={2.5} 
                dot={false}
                activeDot={{ r: 5, fill: '#38bdf8' }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deep-dive explanation for the interview */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
        <span className="font-bold text-slate-200">Why this satisfies the Query SLO:</span> An interactive dashboard query over the last 24h scans only 5,760 points per series at 15s resolution. If a user zooms out to 30 days, querying raw points would require scanning 172,800 points per series; the Smart Horizon router shifts to 1m rollups (43,200 points), and for a 1-year graph to 1h rollups (8,760 points). Query response times remain sub-second across any time horizon!
      </div>
    </div>
  );
};
