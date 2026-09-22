import React, { useState } from 'react';
import { Award, ChevronDown, ChevronUp, Cpu, Database, AlertTriangle, ShieldCheck, Binary, Terminal } from 'lucide-react';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  interviewerFollowUp: string;
  codeExample?: string;
}

const FAQS: FAQ[] = [
  {
    id: 'gorilla',
    category: 'Storage & Compression',
    question: 'How does Gorilla Compression pack 8-byte floats and timestamps down to ~1.37 bytes per point?',
    answer: `Facebook's Gorilla algorithm uses two complementary algorithms:
1. Timestamps (Delta-of-Delta Encoding):
   • First delta: D1 = t_n - t_{n-1} (typically 15 seconds)
   • Delta-of-delta: D = D1 - D0
   • Since host agents emit points at regular 15-second intervals, D = 0 for 96%+ of all datapoints.
   • A value of D = 0 is encoded as a SINGLE BIT '0'.
2. Floating Point Values (XOR Encoding):
   • Calculate X = val_n XOR val_{n-1} (IEEE 754 float64).
   • If value is identical (X = 0), store a single bit '0'.
   • If different, store bit '1', then count leading and trailing zero bits to only store the meaningful delta bits.
   • Result: In metrics like CPU usage or disk space that vary gradually, 8 bytes (64 bits) drops to ~11 bits (1.37 bytes).`,
    interviewerFollowUp: 'What if timestamps arrive out of order? Gorilla requires strictly increasing timestamps; out-of-order points must be buffered in a small staging memtable and sorted before block compression.',
    codeExample: `// Gorilla Timestamp Delta-of-Delta Pseudocode
let D = (t_curr - t_prev) - (t_prev - t_prev2);
if (D === 0) {
  bitStream.writeBit(0); // 1 single bit!
} else if (D >= -63 && D <= 64) {
  bitStream.writeBits(0b10, 2);
  bitStream.writeBits(D, 7);
} else if (D >= -255 && D <= 256) {
  bitStream.writeBits(0b110, 3);
  bitStream.writeBits(D, 9);
}`
  },
  {
    id: 'cardinality',
    category: 'High Cardinality & Protection',
    question: 'How do you prevent an engineer from taking down the cluster with high-cardinality tags (e.g. user_id)?',
    answer: `High cardinality explosion is the #1 cause of death for time-series monitoring systems. If an engineer pushes code with cpu.usage{user_id: 12345}, 1M users creates 1M new time series.
Defense Strategy:
1. Staff L6/L7 Shield at the Ingestion Gateway uses streaming Count-Min Sketch or HyperLogLog (HLL) per tag key.
2. If distinct values for a key exceed a tenant quota (e.g. 5,000 values), the gateway automatically drops the offending tag key while keeping bounded tags (env, region).
3. If an entire tenant exceeds series quotas, rate limit with HTTP 429 and alert the tenant oncall.`,
    interviewerFollowUp: 'Why not just use Elasticsearch or a relational DB for tags? Inverted indexes like Lucene carry 50x higher write amplification and memory overhead compared to specialized Roaring Bitmap series indexes.'
  },
  {
    id: 'rollups',
    category: 'Query Optimization',
    question: 'Why can’t we just calculate P99 during the 1-minute rollup and store that?',
    answer: `The Percentile Rollup Trap: You CANNOT mathematically average or re-aggregate percentiles across multiple hosts or multiple time windows!
• For example, if web-01 has P99=200ms and web-02 has P99=20ms, the cluster-wide P99 is NOT (200 + 20) / 2 = 110ms. If web-01 handled 1 request and web-02 handled 100,000 requests, the true P99 is ~20ms.
Solution: Store Mergeable Sketches (such as T-Digest, DDSketch, or HdrHistogram) during rollup.
• A 1-minute block stores a compact 2KB sketch data structure.
• When a user queries 30 days of P99, the query engine quickly merges 43,200 sketches using mathematical union to derive the exact global P99 with <1% error.`,
    interviewerFollowUp: 'What metrics CAN be rolled up without sketches? Counters (Sum), Rates, Min, Max, and Avg (via storing Sum and Count).'
  },
  {
    id: 'hot_partitions',
    category: 'Kafka & Sharding',
    question: 'How do you partition Kafka and storage shards without causing severe hot spots?',
    answer: `If you partition Kafka simply by tenant_id, a massive tenant like Uber will overwhelm partition 3 while partition 4 is idle.
If you partition purely randomly, points for the same series land on different storage workers, breaking sequential timestamp ordering.
The Staff Engineer Solution:
Partition key = hash(tenant_id + metric_name + sorted_tags).
• Ensures all points for a single time series land on the exact same Kafka partition and storage worker (guaranteeing in-order sequential appends).
• Uniformly distributes heavy tenants across all 64+ Kafka partitions.`,
    interviewerFollowUp: 'What if a single metric (e.g. request.count across a 100,000-pod cluster) is massive? The tags include pod_name, which distributes the pods across different partitions naturally.'
  },
  {
    id: 'out_of_order',
    category: 'Data Ingestion & Integrity',
    question: 'How do you handle clock skew and out-of-order writes from distributed servers?',
    answer: `In a real deployment of 10,000 servers, NTP drift, network blips, and mobile clients cause points to arrive out of order or with timestamps in the future.
Three-tier defense:
1. Ingest Gateway Sanity Check: Reject any datapoint with timestamp > now + 15 minutes or < now - 24 hours.
2. MemTable Re-ordering Window: Storage workers keep an active in-memory buffer (MemTable) covering the last 15-30 minutes. Points are inserted into a skip-list or sorted array in memory before being flushed to immutable disk SSTables.
3. Flink Watermarks: For alerting, Flink uses bounded out-of-orderness watermarks (e.g. 15-second watermark delay) to ensure sliding window evaluations do not fire prematurely.`,
    interviewerFollowUp: 'What happens if data arrives 3 hours late? It skips the LSM MemTable and is written to a special late-arrival backfill partition, or dropped if outside the SLA window.'
  }
];

export const InterviewCheatsheet: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string>('gorilla');

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Award className="w-4 h-4" />
            Interview Preparation Guide
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Staff / Principal Engineer Defense Questions &amp; Rubric
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            The 5 most critical technical deep dives asked by Datadog, Google Monarch, and Meta ODS interview panels.
          </p>
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-3">
        {FAQS.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div 
              key={faq.id} 
              className={`rounded-xl border transition-all ${
                isExpanded ? 'bg-slate-950 border-cyan-500/50 shadow-lg' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                id={`faq-btn-${faq.id}`}
                onClick={() => setExpandedId(isExpanded ? '' : faq.id)}
                className="w-full p-4 text-left flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-cyan-300 border border-slate-700 shrink-0 mt-0.5">
                    {faq.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{faq.question}</h4>
                </div>
                <div className="p-1 rounded bg-slate-800 text-slate-400 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/80 text-xs text-slate-300">
                  <div className="whitespace-pre-line leading-relaxed text-slate-300 font-sans">
                    {faq.answer}
                  </div>

                  {faq.codeExample && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-semibold mb-2">
                        <Terminal className="w-3.5 h-3.5" />
                        Algorithm Reference:
                      </div>
                      <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto">
                        {faq.codeExample}
                      </pre>
                    </div>
                  )}

                  {/* Follow-up Pro Tip */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200">
                    <span className="font-bold text-amber-400 uppercase tracking-wide text-[10px] block mb-1">
                      Expected Interviewer Follow-Up:
                    </span>
                    <p className="leading-relaxed text-xs">
                      {faq.interviewerFollowUp}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
