import React, { useState } from 'react';
import { Calculator, HardDrive, Network, DollarSign, TrendingDown, RefreshCw } from 'lucide-react';

export const CapacityEstimator: React.FC = () => {
  // Configurable sliders
  const [ingestionRate, setIngestionRate] = useState<number>(1000000); // 1M/s
  const [rawResolutionSec, setRawResolutionSec] = useState<number>(15); // 15 seconds
  const [datapointBytes, setDatapointBytes] = useState<number>(8); // 8 bytes (int64 ts + float64 val)
  const [rawRetentionHours, setRawRetentionHours] = useState<number>(24); // 24h
  const [midRetentionDays, setMidRetentionDays] = useState<number>(30); // 30 days
  const [finalRetentionYears, setFinalRetentionYears] = useState<number>(2); // 2 years
  const [applyGorilla, setApplyGorilla] = useState<boolean>(true); // Gorilla compression

  // Mathematical computations based on prompt
  const effectiveBytesPerPoint = applyGorilla ? 1.4 : datapointBytes; // Gorilla compresses 8-16 bytes to ~1.4 bytes

  // 1. Write Throughput
  const rawBytesPerSec = ingestionRate * datapointBytes;
  const writeThroughputMBs = rawBytesPerSec / (1024 * 1024);

  // 2. Datapoints per day at raw resolution
  const pointsPerMinPerMetric = 60 / rawResolutionSec; // 4 points/min at 15s
  const rawPointsPerDay = ingestionRate * pointsPerMinPerMetric * 60 * rawRetentionHours;
  const rawDailyStorageGB = (rawPointsPerDay * effectiveBytesPerPoint) / (1024 * 1024 * 1024);

  // 3. What if we stored raw for 30 days without rollup?
  const uncompressed30DayPoints = ingestionRate * pointsPerMinPerMetric * 60 * 24 * midRetentionDays;
  const uncompressed30DayGB = (uncompressed30DayPoints * datapointBytes) / (1024 * 1024 * 1024);
  const uncompressed30DayTB = uncompressed30DayGB / 1024;

  // 4. Mid store (1m resolution) for 30 days
  // 1 point per minute instead of 4 points per minute (4x downsample)
  // Each 1m rollup stores: avg, min, max, sum, count = ~20 bytes or ~6 bytes compressed
  const midRollupBytesPerPoint = applyGorilla ? 6 : 24;
  const midStorePoints30d = ingestionRate * 1 * 60 * 24 * midRetentionDays;
  const midStoreStorageGB = (midStorePoints30d * midRollupBytesPerPoint) / (1024 * 1024 * 1024);

  // 5. Final store (1h resolution) for 2 years
  // 1 point per hour instead of 240 points per hour (240x downsample from raw)
  // Parquet columnar storage on S3
  const finalRollupBytesPerPoint = applyGorilla ? 8 : 32;
  const finalStorePoints2y = ingestionRate * 1 * 24 * (365 * finalRetentionYears);
  const finalStoreStorageGB = (finalStorePoints2y * finalRollupBytesPerPoint) / (1024 * 1024 * 1024);

  // Total 2-year storage with rollups vs naive raw 2-year
  const naiveRaw2YearTB = ((ingestionRate * pointsPerMinPerMetric * 60 * 24 * 365 * finalRetentionYears * datapointBytes) / (1024 * 1024 * 1024 * 1024));
  const tieredTotalTB = (rawDailyStorageGB + midStoreStorageGB + finalStoreStorageGB) / 1024;
  const storageReductionPct = Math.max(0, ((naiveRaw2YearTB - tieredTotalTB) / naiveRaw2YearTB) * 100);

  // Kafka partition sizing
  const recommendedPartitions = Math.max(16, Math.ceil(writeThroughputMBs / 0.25)); // 250KB/s per partition guideline

  // Monthly Cloud Storage Cost estimate
  const nvmeCostPerGB = 0.20; // NVMe SSD high-performance
  const s3CostPerGB = 0.023; // AWS S3 Standard / GCS Standard
  const naiveMonthlyCost = uncompressed30DayGB * nvmeCostPerGB;
  const tieredMonthlyCost = (rawDailyStorageGB * nvmeCostPerGB) + (midStoreStorageGB * nvmeCostPerGB * 0.5) + (finalStoreStorageGB * s3CostPerGB);
  const monthlySavings = Math.max(0, naiveMonthlyCost - tieredMonthlyCost);

  const resetToPromptDefaults = () => {
    setIngestionRate(1000000);
    setRawResolutionSec(15);
    setDatapointBytes(8);
    setRawRetentionHours(24);
    setMidRetentionDays(30);
    setFinalRetentionYears(2);
    setApplyGorilla(true);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Calculator className="w-4 h-4" />
            Step 2 — Mathematical Capacity Sizing
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Back-of-the-Envelope Capacity &amp; Rollup Estimator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time interactive validation of Datadog scale write throughput and tiered compression math.
          </p>
        </div>

        <button
          id="reset-estimator-defaults-btn"
          onClick={resetToPromptDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset to Prompt Baseline (1M/s)
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
        
        {/* Metric Ingestion Rate */}
        <div>
          <div className="flex justify-between items-center text-xs font-medium mb-1.5">
            <span className="text-slate-300">Ingestion Rate:</span>
            <span className="font-mono text-cyan-400 font-bold">
              {(ingestionRate / 1000000).toFixed(1)}M metrics/sec
            </span>
          </div>
          <input
            id="slider-ingestion-rate"
            type="range"
            min="200000"
            max="3000000"
            step="100000"
            value={ingestionRate}
            onChange={(e) => setIngestionRate(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>200K/s</span>
            <span>1.0M/s (Prompt)</span>
            <span>3.0M/s</span>
          </div>
        </div>

        {/* Raw Resolution */}
        <div>
          <div className="flex justify-between items-center text-xs font-medium mb-1.5">
            <span className="text-slate-300">Raw Resolution:</span>
            <span className="font-mono text-yellow-400 font-bold">{rawResolutionSec} seconds</span>
          </div>
          <input
            id="slider-raw-resolution"
            type="range"
            min="5"
            max="60"
            step="5"
            value={rawResolutionSec}
            onChange={(e) => setRawResolutionSec(Number(e.target.value))}
            className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>5s</span>
            <span>15s (Standard)</span>
            <span>60s</span>
          </div>
        </div>

        {/* Compression Engine Toggle */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-medium mb-1.5">
            <span className="text-slate-300">TSDB Compression:</span>
            <span className={`font-mono font-bold text-xs ${applyGorilla ? 'text-emerald-400' : 'text-slate-400'}`}>
              {applyGorilla ? 'Gorilla (1.4B/point)' : 'Raw Uncompressed (8B)'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              id="toggle-gorilla-on"
              onClick={() => setApplyGorilla(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                applyGorilla
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Gorilla TSDB Enabled
            </button>
            <button
              id="toggle-gorilla-off"
              onClick={() => setApplyGorilla(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                !applyGorilla
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Raw 8-byte Float
            </button>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">XOR float + delta-of-delta timestamps</span>
        </div>

      </div>

      {/* High-Level Calculation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Write Bandwidth */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Write Throughput</span>
            <Network className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {writeThroughputMBs.toFixed(1)} <span className="text-sm font-normal text-slate-400">MB/sec</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {ingestionRate.toLocaleString()} pts/s × {datapointBytes}B
            </p>
          </div>
          <div className="text-[11px] font-mono text-blue-300 bg-blue-950/60 px-2 py-1 rounded border border-blue-900/50">
            Recommended Kafka: {recommendedPartitions} Partitions
          </div>
        </div>

        {/* Card 2: 24h Raw Volume */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>24-Hour Raw Volume</span>
            <HardDrive className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-yellow-300">
              {rawDailyStorageGB.toFixed(1)} <span className="text-sm font-normal text-slate-400">GB/day</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {(rawPointsPerDay / 1000000000).toFixed(2)} Billion points/day
            </p>
          </div>
          <div className="text-[11px] font-mono text-yellow-300 bg-yellow-950/60 px-2 py-1 rounded border border-yellow-900/50">
            Tier 1 Retention: 24 Hours
          </div>
        </div>

        {/* Card 3: 30-Day Rollup Savings */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>30-Day Storage: Naive vs 1m Rollup</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {midStoreStorageGB.toFixed(0)} GB
              </span>
              <span className="text-xs font-mono line-through text-slate-500">
                {uncompressed30DayTB.toFixed(2)} TB Raw
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              4x point downsample + compaction
            </p>
          </div>
          <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-900/50">
            {(((uncompressed30DayGB - midStoreStorageGB) / uncompressed30DayGB) * 100).toFixed(1)}% Volume Reduction
          </div>
        </div>

        {/* Card 4: 2-Year Storage Comparison */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>2-Year Cloud Cost Impact</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-cyan-300">
              ${tieredMonthlyCost.toFixed(0)} <span className="text-sm font-normal text-slate-400">/mo</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              vs ${naiveMonthlyCost.toFixed(0)}/mo without rollups
            </p>
          </div>
          <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-900/50">
            Saves ~${monthlySavings.toFixed(0)}/mo in SSD bills
          </div>
        </div>

      </div>

      {/* Step 2 Walkthrough Equation Breakdown */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Step 2 Formula Walkthrough (System Design Interview Script)
        </h4>
        <div className="space-y-3 font-mono text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-blue-400 font-semibold">1. Ingestion Bandwidth:</span>
            <div className="text-slate-300 mt-1">
              1,000,000 metrics/sec × 8 bytes/datapoint = <span className="text-white font-bold">8.0 MB/sec</span> write throughput.
            </div>
            <p className="text-slate-400 text-[11px] mt-1 font-sans">
              Takeaway: 8 MB/sec is comfortably within modern 10GbE network interfaces and a single modest Kafka partition cluster.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-yellow-400 font-semibold">2. 24h Daily Raw Volume:</span>
            <div className="text-slate-300 mt-1">
              At 15-second resolution: 1,000,000 × 4 datapoints/min × 60 min × 24 hours = <span className="text-white font-bold">5.76 Billion datapoints/day</span>.
            </div>
            <div className="text-slate-300 mt-1">
              5.76B datapoints × 8 bytes = <span className="text-white font-bold">46.08 GB/day raw value data</span>.
            </div>
            <p className="text-slate-400 text-[11px] mt-1 font-sans">
              With Gorilla compression (XOR float + delta-of-delta timestamps), 46 GB compresses to <span className="text-emerald-400 font-semibold">~8.5 GB/day</span>!
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-emerald-400 font-semibold">3. Why Rollups are Mandatory (The 30-Day &amp; 2-Year Calculation):</span>
            <div className="text-slate-300 mt-1">
              • If kept raw for 30 days: 46 GB/day × 30 days = <span className="text-amber-400 font-bold">1.38 TB</span> uncompressed.
            </div>
            <div className="text-slate-300 mt-1">
              • If kept raw for 2 years: 46 GB/day × 730 days = <span className="text-rose-400 font-bold">33.6 TB</span> of expensive NVMe SSDs.
            </div>
            <div className="text-slate-300 mt-1">
              • With Rollup Hierarchy (15s → 1m → 1h): Each compression tier is only <span className="text-emerald-400 font-bold">~50 GB/month</span>!
            </div>
            <p className="text-slate-400 text-[11px] mt-1 font-sans">
              Staff Engineer Punchline: Storing 2 years at 1-hour resolution on AWS S3 / Parquet costs less than $3/month, while answering 2-year dashboard queries in &lt;1.5 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
