import React, { useState, useEffect } from 'react';
import { Play, Pause, Activity, Zap, Server, Shield, Bell, CheckCircle2, Flame, ArrowUpRight } from 'lucide-react';

export const LiveIngestSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isSurge, setIsSurge] = useState<boolean>(false);
  const [ingestedCount, setIngestedCount] = useState<number>(14298104);
  const [kafkaLagMs, setKafkaLagMs] = useState<number>(14);
  const [kafkaQueueDepth, setKafkaQueueDepth] = useState<number>(2410);
  const [alertsTriggered, setAlertsTriggered] = useState<number>(0);
  
  const [logs, setLogs] = useState<Array<{ id: number; time: string; source: string; msg: string; type: 'info' | 'warn' | 'success' | 'alert' }>>([
    { id: 1, time: '02:39:15', source: 'Ingest Gateway', msg: 'Batch received: 12,000 metrics (1.2 MB Protobuf) from web-01, web-02', type: 'info' },
    { id: 2, time: '02:39:16', source: 'Kafka Partition 4', msg: 'Offset 849202 committed. Decoupled write buffer healthy.', type: 'info' },
    { id: 3, time: '02:39:17', source: 'Storage Worker 1', msg: 'Resolved tag set to metric_id=948210. Appended to MemTable.', type: 'success' },
    { id: 4, time: '02:39:18', source: 'Flink Alerting', msg: 'Sliding window 5m evaluated for cpu.usage: 42.1% (Threshold: 90%)', type: 'info' },
  ]);

  const currentRate = isSurge ? 2400000 : 1000000;
  const currentBandwidth = (currentRate * 8) / (1024 * 1024);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setIngestedCount(prev => prev + Math.round((currentRate / 10) * (0.95 + Math.random() * 0.1)));

      if (isSurge) {
        setKafkaQueueDepth(prev => Math.min(48000, prev + 1200));
        setKafkaLagMs(prev => Math.min(380, prev + 15));
      } else {
        setKafkaQueueDepth(prev => Math.max(1200, Math.round(prev * 0.92)));
        setKafkaLagMs(prev => Math.max(8, Math.round(prev * 0.94)));
      }

      // Add a periodic log
      const timeStr = new Date().toLocaleTimeString();
      const sources = ['Ingest Gateway', 'Storage Worker 3', 'Kafka Partition 7', 'Flink Alerting', 'Rollup Worker'];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      
      let msg = '';
      let type: 'info' | 'warn' | 'success' | 'alert' = 'info';

      if (isSurge && Math.random() > 0.6) {
        msg = `Surge detected! Ingestion at ${(currentRate / 1000000).toFixed(1)}M/s. Kafka buffering absorption in progress.`;
        type = 'warn';
      } else if (randomSource === 'Flink Alerting') {
        msg = `Evaluated 450 sliding alert windows. All health states NORMAL.`;
        type = 'info';
      } else if (randomSource === 'Storage Worker 3') {
        msg = `Flushed Gorilla-compressed block to Tier 1 LSM-tree (~1.38 bytes/pt).`;
        type = 'success';
      } else {
        msg = `Ingested 50ms micro-batch via gRPC mTLS: 50,000 metrics validated.`;
        type = 'info';
      }

      setLogs(prev => [
        { id: Date.now() + Math.random(), time: timeStr, source: randomSource, msg, type },
        ...prev.slice(0, 15)
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isSurge, currentRate]);

  const triggerSurge = () => {
    setIsSurge(true);
    setTimeout(() => {
      setIsSurge(false);
    }, 7000);
  };

  const triggerTestAlert = () => {
    setAlertsTriggered(prev => prev + 1);
    setLogs(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        source: 'Flink Alerting',
        msg: 'ALERT FIRED: cpu.usage > 90% (Host: web-01.prod) -> Dispatched to PagerDuty & Slack!',
        type: 'alert'
      },
      ...prev
    ]);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Activity className="w-4 h-4" />
            Live Ingestion Pipeline Simulator
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Real-Time Pipeline Telemetry &amp; Write Stream
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Watch live micro-batches traverse the Ingest Gateway, Kafka buffer, Storage Workers, and Flink Alerting.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="sim-toggle-run"
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isRunning ? 'bg-amber-600/30 text-amber-300 border border-amber-500' : 'bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? <><Pause className="w-3.5 h-3.5" /> Pause Stream</> : <><Play className="w-3.5 h-3.5" /> Start Stream</>}
          </button>

          <button
            id="sim-surge-btn"
            onClick={triggerSurge}
            disabled={isSurge}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isSurge 
                ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse' 
                : 'bg-slate-800 text-rose-300 border-rose-800/40 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            {isSurge ? 'Surge Active (2.4M/s)' : 'Simulate 2.4M/s Spike'}
          </button>

          <button
            id="sim-alert-test-btn"
            onClick={triggerTestAlert}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/40 flex items-center gap-1.5 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            Trigger Flink Alert
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Rate */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-500 block">Instantaneous Ingest</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {(currentRate / 1000000).toFixed(2)}M <span className="text-xs text-slate-400 font-normal">pts/sec</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
            {currentBandwidth.toFixed(1)} MB/sec wire throughput
          </span>
        </div>

        {/* Kafka Buffer */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-500 block">Kafka Partition Lag</span>
          <div className={`text-xl font-bold font-mono mt-1 ${kafkaLagMs > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {kafkaLagMs} ms
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
            {kafkaQueueDepth.toLocaleString()} messages in buffer
          </span>
        </div>

        {/* Total Processed */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-500 block">Total Ingested (Session)</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {ingestedCount.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
            Zero points dropped (WAL safe)
          </span>
        </div>

        {/* Flink State */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-500 block">Flink Alert Triggers</span>
          <div className={`text-xl font-bold font-mono mt-1 ${alertsTriggered > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {alertsTriggered} Events
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
            Off-stream sliding window check
          </span>
        </div>

      </div>

      {/* Live Pipeline Activity Logs */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Live Ingest &amp; Processing Stream:</span>
          <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            STREAMING ACTIVE
          </span>
        </div>

        <div className="h-48 overflow-y-auto font-mono text-xs space-y-1.5 pr-2">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`p-2 rounded flex items-start justify-between gap-3 text-[11px] leading-relaxed ${
                log.type === 'alert' 
                  ? 'bg-rose-950/50 border border-rose-600/80 text-rose-200' 
                  : log.type === 'warn' 
                  ? 'bg-amber-950/40 border border-amber-600/60 text-amber-200' 
                  : log.type === 'success' 
                  ? 'bg-emerald-950/30 border border-emerald-800/40 text-emerald-300' 
                  : 'bg-slate-900/70 border border-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span className="font-bold text-slate-300 shrink-0">[{log.source}]:</span>
                <span>{log.msg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
