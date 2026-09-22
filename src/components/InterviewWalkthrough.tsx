import React, { useState } from 'react';
import { STEP_DESCRIPTIONS } from '../data/architectureData';
import { CheckCircle2, ChevronRight, HelpCircle, Code, Layers, FileText, Sparkles, BookOpen } from 'lucide-react';

export const InterviewWalkthrough: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <BookOpen className="w-4 h-4" />
            Staff / Principal Interview Framework
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            System Design Walkthrough &amp; Deep-Dive Script
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step interview execution matching the Datadog, Google (Monarch), and Meta (ODS) rubric.
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {STEP_DESCRIPTIONS.map((step) => (
            <button
              key={step.stepNumber}
              onClick={() => setActiveStep(step.stepNumber)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeStep === step.stepNumber
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Step {step.stepNumber}</span>
              <span className="hidden sm:inline text-[11px] opacity-75">
                {step.stepNumber === 1 ? 'Clarify' : step.stepNumber === 2 ? 'Estimate' : step.stepNumber === 3 ? 'Data Model' : 'Rollups'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The Probe Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          The Probe (Core Architectural Tension)
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Time-series data at massive scale. The interesting problem is <strong className="text-blue-300">write throughput</strong> (millions of metrics per second from thousands of servers) vs <strong className="text-cyan-300">query throughput</strong> (interactive dashboards needing sub-second response over months of data). These two requirements pull the architecture in opposite directions — <em>you optimize writes by sequential append, you optimize range queries by pre-aggregation</em>.
        </p>
      </div>

      {/* Active Step Content */}
      {(() => {
        const step = STEP_DESCRIPTIONS.find(s => s.stepNumber === activeStep) || STEP_DESCRIPTIONS[0];
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wide">
                  {step.tag}
                </span>
                <h4 className="text-lg font-bold text-white mt-0.5">{step.title}</h4>
              </div>
              <span className="text-xs text-slate-500 font-mono">Stage {step.stepNumber} of 4</span>
            </div>

            <p className="text-sm text-slate-300 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
              {step.summary}
            </p>

            {/* Checklist / Requirements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {step.items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <div className="text-xs text-slate-400 pl-5 leading-relaxed font-mono">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Step-Specific Deep Dive Tabs */}
            {activeStep === 1 && (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2 text-xs text-slate-300">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
                  Staff Interview Clarification Strategy:
                </span>
                <p>
                  <strong>Why scope out Logs and Traces?</strong> Metrics are structured numeric samples with fixed scalar values (float64). Logs require inverted text search engines (Elasticsearch / Quickwit) with heavy tokenize overhead. Traces require directed acyclic graph (DAG) span assembly. Conflating them in a 45-minute interview derails the discussion. Focus strictly on numeric time series.
                </p>
                <p>
                  <strong>Why different retention resolutions?</strong> Operational firefighting needs second-level resolution for the last 24 hours to spot sudden spikes. Capacity planning across 6 months only needs hourly trends. Trying to keep 15s data for 2 years is technically unnecessary and financially ruinous.
                </p>
              </div>
            )}

            {activeStep === 2 && (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2 text-xs text-slate-300">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
                  Capacity Calculation Summary:
                </span>
                <p>
                  • <strong>Write Throughput:</strong> 1M metrics/sec × 8 bytes = <strong>8 MB/sec</strong> wire payload.
                </p>
                <p>
                  • <strong>Daily Points:</strong> 1M × 4 points/min × 60 min × 24h = <strong>5.8 Billion datapoints/day</strong>.
                </p>
                <p>
                  • <strong>Raw Volume:</strong> 5.8B × 8 bytes = <strong>46 GB/day uncompressed</strong> (~9 GB/day with Gorilla TSDB compression).
                </p>
                <p>
                  • <strong>Tiered Savings:</strong> Rollups (15s → 1m → 1h) shrink monthly storage from 1.4 TB to <strong>~50 GB/month</strong> per tier!
                </p>
              </div>
            )}

            {activeStep === 3 && (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Code className="w-4 h-4" />
                  Time-Series Data Model &amp; Storage Schema
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Schema 1: Metadata */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-yellow-400 font-bold block mb-1">1. Metric Metadata Table (Inverted Index)</span>
                    <pre className="text-slate-300 text-[11px] overflow-x-auto">
{`// Key: 64-bit uint metric_id
// Value: Name, Sorted Tags, Retention
metric_metadata: {
  metric_id: 9482018471,
  metric_name: "cpu.usage",
  tags: {
    "host": "web-01",
    "region": "us-east",
    "env": "production"
  },
  retention_tier: "tier_raw_24h"
}`}
                    </pre>
                  </div>

                  {/* Schema 2: TSDB Points */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1">2. Datapoint Storage (LSM Append)</span>
                    <pre className="text-slate-300 text-[11px] overflow-x-auto">
{`// Compact 16-byte uncompressed tuple
// (metric_id, timestamp, float64_val)
// Compressed via Gorilla to ~1.4 bytes:
[
  { ts: 1718000000, val: 42.15 },
  { ts: 1718000015, val: 43.80 }, // delta=15s
  { ts: 1718000030, val: 41.90 }, // delta-of-delta=0
]`}
                    </pre>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  <strong>Why decouple metadata from datapoints?</strong> If the tag strings are stored alongside every 15s point, a metric like <code className="text-slate-200">cpu.usage&#123;host=web-01.us-east-1a, service=payments, env=prod&#125;</code> takes 120 bytes of strings for an 8-byte number (1500% overhead). Storing the tag strings once in an inverted index with a 64-bit ID eliminates this entirely.
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-3 text-xs text-slate-300">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
                  Rollup Architecture &amp; The Percentile Rollup Challenge:
                </span>
                <p>
                  <strong>The Percentile Rollup Trap:</strong> In an interview, candidates often say: <em>"We just pre-calculate the P99 during 1-minute rollups."</em> The interviewer will immediately ask: <em>"How do you query P99 over 24 hours across 5 hosts using 1-minute P99 values?"</em>
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
                  CRITICAL: You CANNOT average percentiles! avg(P99_host1, P99_host2) ≠ Global_P99!
                </div>
                <p>
                  <strong>The Correct Solution:</strong> Store <strong>Sketches</strong> (T-Digest, DDSketch, or HdrHistogram) during the rollup step. Sketches are mergeable data structures. A 24-hour query can accurately merge 1,440 one-minute sketches to compute the exact cluster-wide P99 with bounded mathematical error (&lt;1%).
                </p>
              </div>
            )}

          </div>
        );
      })()}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
          disabled={activeStep === 1}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
        >
          Previous Step
        </button>
        <span className="text-xs font-mono text-slate-400">
          Step {activeStep} / 4
        </span>
        <button
          onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
          disabled={activeStep === 4}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1"
        >
          <span>Next Step</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
