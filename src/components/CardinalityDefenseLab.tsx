import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, Play, Flame, RefreshCw, Database } from 'lucide-react';

interface TagItem {
  key: string;
  value: string;
  isHighCardinality: boolean;
  cardinalityEstimate: string;
}

export const CardinalityDefenseLab: React.FC = () => {
  const [shieldActive, setShieldActive] = useState<boolean>(true);
  const [tags, setTags] = useState<TagItem[]>([
    { key: 'env', value: 'production', isHighCardinality: false, cardinalityEstimate: '3 values (prod, stage, dev)' },
    { key: 'service', value: 'payment-gateway', isHighCardinality: false, cardinalityEstimate: '25 services' },
    { key: 'region', value: 'us-east-1', isHighCardinality: false, cardinalityEstimate: '8 AWS regions' },
  ]);
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');

  const hasHighCardTag = tags.some(t => t.isHighCardinality);
  const totalSeriesPotential = hasHighCardTag ? '1,500,000+ (CRITICAL)' : '600 (Healthy)';

  const addTag = (key: string, value: string, highCard: boolean, cardDesc: string) => {
    if (!key || !value) return;
    if (tags.some(t => t.key.toLowerCase() === key.toLowerCase())) return;
    setTags([...tags, { key, value, isHighCardinality: highCard, cardinalityEstimate: cardDesc }]);
    setNewKey('');
    setNewValue('');
  };

  const removeTag = (key: string) => {
    setTags(tags.filter(t => t.key !== key));
  };

  const resetToSafeDefaults = () => {
    setTags([
      { key: 'env', value: 'production', isHighCardinality: false, cardinalityEstimate: '3 values (prod, stage, dev)' },
      { key: 'service', value: 'payment-gateway', isHighCardinality: false, cardinalityEstimate: '25 services' },
      { key: 'region', value: 'us-east-1', isHighCardinality: false, cardinalityEstimate: '8 AWS regions' },
    ]);
    setShieldActive(true);
  };

  const injectAccidentalUserId = () => {
    addTag('user_id', 'usr_8492091', true, '10,000,000+ unique customers (LETHAL)');
  };

  const injectAccidentalRequestId = () => {
    addTag('request_uuid', '8f7a2c4e-1289-4d2b-b9f1-a1b2c3d4e5f6', true, 'Unbounded UUID per HTTP request (LETHAL)');
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            Staff L6/L7 Shield Simulation
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Cardinality Explosion Defense Sandbox
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test how the gateway protects inverted metadata indexes when an engineer accidentally emits dynamic tags like <code className="text-rose-400 font-mono">user_id</code> or <code className="text-rose-400 font-mono">request_uuid</code>.
          </p>
        </div>

        {/* Shield Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Shield Protection:</span>
          <button
            id="toggle-shield-btn"
            onClick={() => setShieldActive(!shieldActive)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
              shieldActive
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-950'
                : 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
            }`}
          >
            {shieldActive ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SHIELD ACTIVE (AUTO-STRIP)
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                SHIELD BYPASSED (VULNERABLE)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulator Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Tag Configuration */}
        <div className="lg:col-span-6 flex flex-col gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Metric Tag Set
            </span>
            <button
              id="reset-tags-btn"
              onClick={resetToSafeDefaults}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Safe Tags
            </button>
          </div>

          {/* Quick Inject Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 self-center">Simulate Production Bug:</span>
            <button
              id="inject-user-id-btn"
              onClick={injectAccidentalUserId}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 flex items-center gap-1 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              + Add user_id tag
            </button>
            <button
              id="inject-uuid-btn"
              onClick={injectAccidentalRequestId}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 flex items-center gap-1 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              + Add request_uuid tag
            </button>
          </div>

          {/* Tag List */}
          <div className="space-y-2">
            {tags.map((tag) => (
              <div 
                key={tag.key} 
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  tag.isHighCardinality 
                    ? 'bg-rose-950/30 border-rose-500/60' 
                    : 'bg-slate-900 border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{tag.key}:</span>
                    <span className="font-mono text-xs text-slate-300">{tag.value}</span>
                    {tag.isHighCardinality && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-rose-900 text-rose-200 border border-rose-700">
                        HIGH CARDINALITY
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tag.cardinalityEstimate}</div>
                </div>
                <button
                  onClick={() => removeTag(tag.key)}
                  className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Tag key (e.g. host)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            />
            <input
              type="text"
              placeholder="Value (e.g. web-01)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            />
            <button
              id="add-custom-tag-btn"
              onClick={() => addTag(newKey, newValue, newKey.includes('id') || newKey.includes('uuid'), 'Custom tag')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* Right: Inspection & Impact Dashboard */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Status Verdict */}
          <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
            !hasHighCardTag 
              ? 'bg-emerald-950/30 border-emerald-600/50' 
              : shieldActive 
              ? 'bg-amber-950/30 border-amber-600/50' 
              : 'bg-rose-950/50 border-rose-600'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Metadata Inverted Index Health
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full font-mono ${
                !hasHighCardTag 
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' 
                  : shieldActive 
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-700' 
                  : 'bg-rose-900 text-rose-200 border border-rose-600 animate-pulse'
              }`}>
                {!hasHighCardTag 
                  ? 'HEALTHY (LOW CHURN)' 
                  : shieldActive 
                  ? 'PROTECTED BY SHIELD' 
                  : 'OUT-OF-MEMORY IMMINENT!'}
              </span>
            </div>

            <div className="text-sm text-slate-200 font-semibold mt-1">
              {!hasHighCardTag && (
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  All tag dimensions are bounded. Total unique series across cluster: ~600.
                </div>
              )}
              {hasHighCardTag && shieldActive && (
                <div className="flex items-start gap-2 text-amber-300">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span>Staff L6/L7 Shield detected unbounded tag entropy!</span>
                    <p className="text-xs text-amber-300/80 font-normal mt-1">
                      Action: The Cardinality Limiter safely <strong>strips the unbounded tag key</strong> before publishing to Kafka, preserving index stability while allowing valid metric aggregation.
                    </p>
                  </div>
                </div>
              )}
              {hasHighCardTag && !shieldActive && (
                <div className="flex items-start gap-2 text-rose-300">
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span>Catastrophic Cardinality Explosion In Progress!</span>
                    <p className="text-xs text-rose-200/80 font-normal mt-1">
                      Without the shield, each unique user ID instantiates a new time series in the Inverted Roaring Bitmap Index. NVMe memory usage will spike 2,500%, triggering cluster-wide OOM kills.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metric Series Impact Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Total Active Series</span>
              <span className={`text-lg font-bold font-mono ${hasHighCardTag && !shieldActive ? 'text-rose-400' : 'text-slate-200'}`}>
                {hasHighCardTag && !shieldActive ? '1,500,000+' : hasHighCardTag && shieldActive ? '600 (Sanitized)' : '600'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Metadata Index Memory</span>
              <span className={`text-lg font-bold font-mono ${hasHighCardTag && !shieldActive ? 'text-rose-400' : 'text-emerald-400'}`}>
                {hasHighCardTag && !shieldActive ? '48 GB (OOM Crash)' : '1.8 GB (Safe)'}
              </span>
            </div>
          </div>

          {/* Interview Talking Points Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              Staff / Principal Interview Discussion Points:
            </div>
            <p className="leading-relaxed">
              <strong>1. How does the Shield detect high cardinality?</strong> Using a streaming Count-Min Sketch or HyperLogLog (HLL) per tag key. If cardinality exceeds a predefined threshold (e.g. &gt;10,000 distinct values/hour), the tag is flagged.
            </p>
            <p className="leading-relaxed">
              <strong>2. Drop vs Sanitize vs Sample:</strong> Production systems like Datadog and Monarch either drop the high-cardinality tag completely, hash it to a fixed cohort bucket, or reject the metric at the gateway with an HTTP 422 error and alert the team.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
