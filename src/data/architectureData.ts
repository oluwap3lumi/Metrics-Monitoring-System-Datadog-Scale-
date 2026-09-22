import { ArchitectureNode, ArchitectureLink } from '../types';

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'host_agent_web01',
    title: 'Host Agent (web-01)',
    subtitle: 'Metric Collector (Go)',
    category: 'source',
    x: 4,
    y: 12,
    highlightInPaths: ['all', 'write'],
    badge: 'Go Agent',
    tags: ['cpu.usage{region=us-east}', 'sys.load'],
    description: 'Ultra-low overhead daemon compiling system metrics every 15s using OS procfs and eBPF probes.',
    keyResponsibilities: [
      'Scrapes host CPU, memory, network, and disk metrics every 15 seconds',
      'Locally micro-batches telemetry before transmission to minimize TCP/TLS handshakes',
      'Appends immutable static host metadata tags (hostname, AZ, instance_id)'
    ],
    technologies: ['Go runtime', 'eBPF / procfs', 'Protobuf over gRPC / mTLS'],
    deepDive: {
      problemStatement: 'Running metric collection on 10,000+ servers must consume <0.5% CPU and <30MB RAM without causing network micro-bursts.',
      designChoice: 'Push-based architecture with local 15-second accumulation buffer and jittered flush intervals to prevent thundering herd on gateways.',
      tradeoffs: {
        pros: ['Minimal CPU overhead (~0.1%)', 'Jittered writes prevent gateway spikes', 'Local ring buffer handles brief network disconnects'],
        cons: ['Requires agent daemon upgrade management', 'Agent configuration drift must be centrally audited']
      },
      interviewProTip: 'Monarch (Google) and Datadog favor push agents for scale. Prometheus uses pull, which requires heavy service discovery and central scraper state.'
    }
  },
  {
    id: 'host_agent_web02',
    title: 'Host Agent (web-02)',
    subtitle: 'Metric Collector (Go)',
    category: 'source',
    x: 4,
    y: 28,
    highlightInPaths: ['all', 'write'],
    badge: 'Go Agent',
    tags: ['mem.used{region=us-east}', 'disk.io'],
    description: 'Peer host collector gathering kernel telemetry and container cgroup allocations.',
    keyResponsibilities: [
      'Monitors application memory footprint (RSS, cache, swap) and IOPS',
      'Encodes metrics via compact binary format (Protocol Buffers v3)',
      'Implements exponential backoff with circuit breaker if gateway returns HTTP 429'
    ],
    technologies: ['Go', 'cgroups v2', 'gRPC'],
    deepDive: {
      problemStatement: 'Ensuring metrics from thousands of heterogeneous instances arrive reliably despite transient network blips.',
      designChoice: 'Client-side ring buffer with drop-oldest policy under severe network isolation to safeguard host memory.',
      tradeoffs: {
        pros: ['Host OS safety guaranteed (bounded memory)', 'Automatic retry on transient connection drops'],
        cons: ['Drops oldest data if network outage exceeds 10 minutes']
      },
      interviewProTip: 'Always mention bounded buffers on the collector! A monitoring agent must never crash the host application by leaking memory during network partition.'
    }
  },
  {
    id: 'k8s_daemonset',
    title: 'K8s DaemonSet',
    subtitle: 'Kube-State-Metrics',
    category: 'source',
    x: 4,
    y: 45,
    highlightInPaths: ['all', 'write'],
    badge: 'Cluster Collector',
    tags: ['pod.uptime{ns=prod}', 'container.cpu'],
    description: 'Monitors container lifecycle, pod readiness, node pressure, and Kubernetes deployment states.',
    keyResponsibilities: [
      'Listens to K8s API server events and transforms object states into time-series data',
      'Normalizes pod, namespace, and service labels into Datadog standard tag formats',
      'Aggregates ephemeral container stats into node-level streams'
    ],
    technologies: ['Kubernetes DaemonSet', 'Kube-State-Metrics', 'cAdvisor'],
    deepDive: {
      problemStatement: 'Kubernetes introduces short-lived pods and auto-scaling events that can create rapid tag churn.',
      designChoice: 'DaemonSet model collocated on each worker node; queries local kubelet directly rather than overloading central kube-apiserver.',
      tradeoffs: {
        pros: ['Zero load on central Kube API master', 'Collects sub-second pod lifecycles accurately'],
        cons: ['High pod churn can stress metadata index if pod_id is accidentally used as an index tag']
      },
      interviewProTip: 'Highlight the distinction between high cardinality (many concurrent series) and high churn (short-lived series like pod UUIDs).'
    }
  },
  {
    id: 'cardinality_limiter',
    title: 'Staff L6/L7 Shield',
    subtitle: 'Cardinality Limiter',
    category: 'defense',
    x: 4,
    y: 62,
    highlightInPaths: ['all', 'write'],
    badge: 'Protection Layer',
    tags: ['Drops user_id', 'Drops request_id', 'Tenant Quotas'],
    description: 'First line of defense against cardinality explosions. Inspects incoming tag sets in real time and strips unbound keys.',
    keyResponsibilities: [
      'Evaluates unique tag combinations using streaming HyperLogLog and Count-Min Sketch',
      'Automatically drops high-cardinality tags (e.g., user_id, uuid, order_id, request_id)',
      'Enforces tenant-wide series creation quotas to protect metadata inverted indexes',
      'Emits alerts to tenant engineering teams when runaway cardinality is detected'
    ],
    technologies: ['HyperLogLog', 'Token Bucket Rate Limiting', 'eBPF / Envoy filter'],
    deepDive: {
      problemStatement: 'If an engineer pushes code adding `user_id` or `uuid` to a metric tag, 1M users create 1M new time series, blowing up RAM in the inverted index.',
      designChoice: 'Inline gateway filter that hashes (metric_name, tag_keys, tag_values). If distinct count exceeds tenant ceiling (e.g. 100k series), strips the offending tag or drops the metric.',
      tradeoffs: {
        pros: ['Guarantees cluster survival against accidental code deployments', 'Prevents multi-tenant noisy neighbor memory exhaustion'],
        cons: ['Requires strict whitelist/blacklist policies', 'Can surprise users if their desired tags get sanitized']
      },
      interviewProTip: 'This is the signature Staff/Principal engineer point! Interviewers love asking "What happens when someone adds `customer_id` as a tag?" The answer is the Cardinality Limiter.'
    }
  },
  {
    id: 'cloudwatch_poller',
    title: 'CloudWatch / API Poller',
    subtitle: 'External Pull Integration',
    category: 'source',
    x: 4,
    y: 80,
    highlightInPaths: ['all', 'write'],
    badge: 'Pull Integrator',
    tags: ['AWS metrics', 'Rate limited', 'Micro-batched'],
    description: 'Distributed pollers querying third-party cloud metrics (AWS CloudWatch, GCP Cloud Monitoring, Snowflake).',
    keyResponsibilities: [
      'Pulls external cloud provider metrics via paginated APIs with adaptive throttling',
      'Normalizes cloud provider timestamps and converts varying resolutions into uniform 15s buckets',
      'Buffers and batches remote metrics directly into the Ingest Gateway'
    ],
    technologies: ['AWS CloudWatch Metric Streams', 'GCP Monitoring API', 'Kafka Connect'],
    deepDive: {
      problemStatement: 'Third-party APIs have aggressive rate limits (e.g. AWS GetMetricData) and unpredictable reporting latencies.',
      designChoice: 'Prefer CloudWatch Metric Streams (Kinesis Firehose push) where available; fallback to worker pools doing micro-batched queries.',
      tradeoffs: {
        pros: ['Single pane of glass across hybrid cloud infrastructure'],
        cons: ['Slightly delayed arrival (1-3 min delay from AWS) requiring late-arrival handling']
      },
      interviewProTip: 'Mention late-arriving data handling (watermarking in Flink and backfill allowance in LSM memtable).'
    }
  },
  {
    id: 'ingest_gateway',
    title: 'Ingest Gateway',
    subtitle: 'Load Balanced gRPC / TLS',
    category: 'gateway',
    x: 28,
    y: 35,
    highlightInPaths: ['all', 'write'],
    badge: '8 MB/s Throughput',
    tags: ['Tenant Auth', 'Batch Aggregation', 'gRPC/mTLS'],
    description: 'Horizontally scalable stateless edge tier receiving 1,000,000 metrics/sec across thousands of concurrent TLS connections.',
    keyResponsibilities: [
      'Terminates mTLS and authenticates tenant API keys in <1ms using cached tokens',
      'Validates metric syntax, numeric value boundaries (NaN/Inf rejection), and timestamp skew (±15 min)',
      'Aggregates individual point payloads into compact 1MB batches for Kafka efficiency',
      'Saturates ~8 MB/sec total wire bandwidth with zero disk I/O'
    ],
    technologies: ['Envoy Proxy', 'Go / Rust', 'gRPC Protobuf v3', 'Network LB'],
    deepDive: {
      problemStatement: 'Directly writing 1M individual network packets to message queues introduces massive CPU context switching and network header overhead.',
      designChoice: 'Gateway groups metrics into 50ms / 500KB micro-batches partitioned by `hash(tenant_id, metric_name)` before publishing to Kafka.',
      tradeoffs: {
        pros: ['Reduces Kafka message publish overhead by 20x', 'Stateless tier scales elastically with incoming traffic', 'Protects Kafka from unauthenticated or malformed payloads'],
        cons: ['Adds ~25-50ms buffering latency to raw stream']
      },
      interviewProTip: '1M metrics/sec at 8 bytes is 8 MB/sec pure payload, but raw JSON HTTP/1.1 would be ~200 MB/sec! Explain how Protobuf + gRPC + micro-batching keeps wire throughput at ~8-12 MB/sec.'
    }
  },
  {
    id: 'kafka_cluster',
    title: 'Kafka Cluster',
    subtitle: 'Distributed Message Log',
    category: 'queue',
    x: 46,
    y: 35,
    highlightInPaths: ['all', 'write', 'alert'],
    badge: 'Writes Decoupled',
    tags: ['Partition 0..N', 'Replication factor 3', 'Zero-Loss Buffer'],
    description: 'High-throughput write-ahead buffer that decouples volatile ingestion spikes from storage and alerting workers.',
    keyResponsibilities: [
      'Absorbs traffic surges (e.g., morning spike or outage incident) without backpressuring host agents',
      'Partitions streams using `hash(metric_id)` to ensure all points for a given series land on the same consumer worker',
      'Provides 4-hour retention buffer allowing storage or indexing components to be rebooted with zero data loss',
      'Fans out identical metric stream to Storage Workers and Real-time Alerting Engine simultaneously'
    ],
    technologies: ['Apache Kafka / Apache Pulsar', 'ZStandard Compression', 'NVMe SSDs'],
    deepDive: {
      problemStatement: 'Storage workers doing LSM-tree flushes or disk compactions can stutter; without a queue, host agents would drop telemetry.',
      designChoice: 'Dedicated Kafka topic `metrics.incoming` with 64 partitions, partitioning key = `hash(tenant_id + metric_name + tags)`.',
      tradeoffs: {
        pros: ['Strict per-series ordering maintained per partition', 'Decouples write path from query and alert paths', 'Independent consumer group scaling'],
        cons: ['Requires operating and monitoring a distributed Kafka cluster with high disk throughput']
      },
      interviewProTip: 'Why Kafka over RabbitMQ or SQS? Kafka delivers append-only sequential disk I/O, partitioned ordering, and multiple consumer groups reading at independent offsets.'
    }
  },
  {
    id: 'alerting_engine',
    title: 'Alerting Engine',
    subtitle: 'Flink Sliding Window Compute',
    category: 'compute',
    x: 62,
    y: 12,
    highlightInPaths: ['all', 'alert'],
    badge: 'Sub-5s Detection',
    tags: ['Sliding Windows', 'Anomaly Detection', 'Notification Router'],
    description: 'Stateful stream processing cluster evaluating threshold rules and dynamic anomaly baselines with sub-second latency.',
    keyResponsibilities: [
      'Maintains stateful sliding windows (e.g. 5-minute moving average, P99 percentile) in memory (RocksDB state store)',
      'Evaluates user-defined alert conditions (e.g. `cpu.usage > 90% for 3 consecutive intervals`)',
      'Runs seasonal Holt-Winters and EWMA anomaly detection without querying cold databases',
      'Dispatches deduplicated and grouped trigger events to Notification Router (PagerDuty, Slack, Webhooks)'
    ],
    technologies: ['Apache Flink', 'RocksDB State Backend', 'PagerDuty API', 'Slack Webhooks'],
    deepDive: {
      problemStatement: 'Evaluating 100,000 alert rules against a database by running SQL/TSDB queries every minute would crush the storage tier.',
      designChoice: 'Stream-first alerting: alerts are evaluated *in-flight* as metrics flow through Flink straight off Kafka. The storage database is never touched for real-time alerting!',
      tradeoffs: {
        pros: ['Zero load on primary time-series database', 'Sub-second alert trigger latency', 'Handles stateful rolling aggregates accurately'],
        cons: ['Requires memory for stateful windows; late-arriving metrics need bounded watermarks']
      },
      interviewProTip: 'This is a crucial architectural distinction in top-tier interviews: Alerting MUST be decoupled from storage query path. Alerting is a streaming problem, not a dashboard query problem.'
    }
  },
  {
    id: 'storage_workers',
    title: 'Storage Workers',
    subtitle: 'Ingest & Tag Decoupler',
    category: 'compute',
    x: 64,
    y: 38,
    highlightInPaths: ['all', 'write'],
    badge: 'Batch Processor',
    tags: ['Resolve Tag to ID', 'Decouple Tags', 'Sequential Append'],
    description: 'Processes raw metrics from Kafka, decouples string metadata from numeric datapoints, and writes to TSDB shards.',
    keyResponsibilities: [
      'Step 1: Checks local LRU cache to resolve tag strings into a compact 64-bit `metric_id`',
      'Step 2: If new series, updates Metadata Indexes (Inverted Index) on NVMe',
      'Step 3: Strips all string tags, leaving pure `(metric_id, timestamp, float64)` tuples',
      'Step 4: Performs direct sequential append into Raw Time-Series Store shards'
    ],
    technologies: ['Go Worker Pool', 'Local RocksDB LRU Cache', 'Gorilla Compression Engine'],
    deepDive: {
      problemStatement: 'Repeating tag strings like `host=web-01.prod.us-east-1a, env=production` with every 8-byte metric point would balloon storage by 1500%.',
      designChoice: 'Decouple metadata from time-series values. Series metadata is stored once in an inverted index; points are stored as pure compact (int64, int64, float64) arrays.',
      tradeoffs: {
        pros: ['90%+ storage reduction in raw store', 'Write pipeline performs zero string manipulation during data block writes', 'Predictable memory footprint'],
        cons: ['Reads must perform a two-phase query: resolve tags -> IDs, then fetch datapoints']
      },
      interviewProTip: 'Always emphasize the two-step read/write separation: Tag Resolution (Metadata Index) vs Numeric Stream (TSDB Shard).'
    }
  },
  {
    id: 'metadata_indexes',
    title: 'Metadata Indexes',
    subtitle: 'Map: metric_id → String Tags',
    category: 'storage',
    x: 84,
    y: 20,
    highlightInPaths: ['all', 'write', 'read'],
    badge: 'Inverted Index',
    tags: ['Roaring Bitmaps', 'NVMe Flash', 'Retention Config'],
    description: 'Fast inverted index mapping metric names and tag key-values to metric IDs, enabling instant multi-dimensional filtering.',
    keyResponsibilities: [
      'Maintains inverted index: `region=us-east` -> Bitset [1, 4, 982, 10423]',
      'Supports Boolean queries (`service:auth AND env:prod AND region:us-east`) via Roaring Bitmaps',
      'Maintains lifecycle and retention tier policies per tenant and metric namespace',
      'Serves tag lookup queries to Distributed Query Engine in <5ms'
    ],
    technologies: ['Inverted Index (Lucene/Roaring Bitmaps)', 'RocksDB on NVMe', 'Distributed Hash Table'],
    deepDive: {
      problemStatement: 'Finding all metrics matching `env:prod AND service:payment` across 500M series must not scan all time-series tables.',
      designChoice: 'Roaring Bitmap inverted index stored in memory and NVMe SSDs. Intersecting two tag bitmaps takes microseconds using CPU bitwise instructions.',
      tradeoffs: {
        pros: ['Ultra-fast tag queries (<5ms)', 'Extremely compact posting lists'],
        cons: ['Vulnerable to high cardinality tags if not shielded by the Cardinality Limiter']
      },
      interviewProTip: 'Explain how Roaring Bitmaps perform fast bitwise AND operations across tags to find matching `metric_id`s before scanning any time-series blocks.'
    }
  },
  {
    id: 'raw_store',
    title: '1. Raw Store (15s res)',
    subtitle: 'Retention: 24 Hours',
    category: 'storage',
    x: 84,
    y: 45,
    highlightInPaths: ['all', 'write', 'read', 'alert'],
    badge: 'Volume: ~46 GB/Day',
    tags: ['15-second resolution', 'LSM-Tree Append', 'Gorilla Compression'],
    description: 'Write-optimized Tier-1 time-series storage retaining high-fidelity 15-second data for 24 hours.',
    keyResponsibilities: [
      'Appends datapoints sequentially to in-memory MemTable and write-ahead log (WAL)',
      'Flushes immutable 2-hour TSDB blocks compressed with Gorilla delta-of-delta and XOR floating point encodings',
      'Serves real-time dashboard queries with full 15s granularity for debugging current incidents',
      'Drops data blocks automatically after 24-hour TTL expiration without expensive row-by-row deletes'
    ],
    technologies: ['Custom LSM-Tree / Prometheus TSDB', 'Gorilla XOR Floating Point', 'NVMe Storage'],
    deepDive: {
      problemStatement: 'Writing 1M points/sec requires ~8 MB/sec sequential disk throughput. Random B-Tree updates would thrash disk heads and exhaust IOPS.',
      designChoice: 'Log-Structured Merge-tree (LSM) append-only architecture. Data is buffered in RAM, sorted by (metric_id, timestamp), and flushed sequentially to disk.',
      tradeoffs: {
        pros: ['Sustains massive write throughput without disk thrashing', 'Gorilla compression packs 8-byte floats down to ~1.37 bytes', 'TTL drops are instant block deletions (unlink file)'],
        cons: ['Range queries must merge MemTable and on-disk SSTables']
      },
      interviewProTip: 'At 15s resolution: 1M metrics * 4 pts/min * 60 min * 24h = 5.8B points/day. At 8 bytes = 46.4 GB/day. With Gorilla compression (~1.5 bytes/point), storage drops to < 9 GB/day!'
    }
  },
  {
    id: 'rollup_1m',
    title: 'Rollup Pipeline (1m Roll)',
    subtitle: 'Periodic Compactor',
    category: 'compute',
    x: 84,
    y: 57,
    highlightInPaths: ['all', 'alert'],
    badge: '15s → 1m Aggregator',
    tags: ['Min, Max, Avg, Sum, Count', '4x Downsample'],
    description: 'Background streaming compactor aggregating four 15s datapoints into one 1-minute rollup block.',
    keyResponsibilities: [
      'Extracts 15s raw blocks every 10 minutes once writes for the window are closed',
      'Computes 5 core statistics per metric series: Min, Max, Sum, Count, and Last Value',
      'Writes compacted 1-minute blocks into Mid Store',
      'Allows sub-second query execution across 30 days without scanning billions of 15s points'
    ],
    technologies: ['Distributed Rollup Workers', 'Compaction Jobs', 'Streaming T-Digest for Percentiles'],
    deepDive: {
      problemStatement: 'A user plotting a 7-day dashboard would have to scan 40,320 points per series. With 100 series, that is 4,000,000 points—taking seconds to load.',
      designChoice: 'Pre-aggregate to 1-minute resolution. 7 days becomes only 10,080 points per series, a 75% reduction with zero visual degradation on screen.',
      tradeoffs: {
        pros: ['Guarantees <500ms dashboard queries across multi-day views', 'Min/Max preserves critical spike visibility'],
        cons: ['Percentiles (e.g. P99) require sketch algorithms (like T-Digest or HdrHistogram) to merge correctly across windows']
      },
      interviewProTip: 'Address the "Percentile Rollup Trap" in interviews! You cannot simply average P99 values across buckets. Mention storing sketches (T-Digest / DDSketch) during rollup.'
    }
  },
  {
    id: 'mid_store',
    title: '2. Mid Store (1m res)',
    subtitle: 'Retention: 30 Days',
    category: 'storage',
    x: 84,
    y: 69,
    highlightInPaths: ['all', 'read', 'alert'],
    badge: 'Compacted Blocks',
    tags: ['1-minute resolution', 'Aggs: Avg, Min, Max, Sum', 'NVMe / SSD'],
    description: 'Tier-2 storage optimized for operational dashboards spanning several days to 30 days.',
    keyResponsibilities: [
      'Stores pre-aggregated 1-minute metric blocks with precomputed rollups (Avg, Min, Max, Sum, Count)',
      'Retains 30 days of data for sprint planning, deployment comparisons, and weekly triage',
      'Volume is ~50 GB/month thanks to downsampling and block compression',
      'Automatic block drops after 30 days'
    ],
    technologies: ['Columnar TSDB Blocks', 'Snappy / Zstd Compression', 'SSD Tier'],
    deepDive: {
      problemStatement: 'Balancing fast query speeds for month-long trends with reasonable infrastructure hosting bills.',
      designChoice: 'Columnar layout separating timestamps, avg, min, and max columns. Queries requesting only `avg` only read 25% of the file data.',
      tradeoffs: {
        pros: ['4x point reduction compared to raw', 'Columnar read pruning speeds up single-statistic queries'],
        cons: ['15-second sub-minute jitter details are smoothed out']
      },
      interviewProTip: 'Storing {min, max, avg, sum, count} allows re-aggregating higher time windows mathematically without bias: Global_Avg = Sum_all / Count_all.'
    }
  },
  {
    id: 'rollup_1h',
    title: 'Rollup Pipeline (1h Roll)',
    subtitle: 'Hourly Compactor',
    category: 'compute',
    x: 84,
    y: 81,
    highlightInPaths: ['all', 'alert'],
    badge: '1m → 1h Aggregator',
    tags: ['60x Downsample', 'Parquet Format'],
    description: 'Long-term rollup worker combining sixty 1-minute points into single hourly summary records for multi-year retention.',
    keyResponsibilities: [
      'Executes hourly batch jobs over completed 1-minute blocks',
      'Generates compressed Parquet / ORC columnar files with embedded column statistics (min/max indexes)',
      'Pushes long-term historical files to low-cost Cloud Object Storage (S3 / GCS)',
      'Provides historical baseline data for multi-month capacity planning'
    ],
    technologies: ['Apache Arrow / Parquet', 'Cloud Object Store (S3/GCS)', 'DuckDB / ClickHouse query reader'],
    deepDive: {
      problemStatement: 'Keeping 2 years of metrics at 15s would require ~33 Terabytes of NVMe SSDs, costing thousands per month per tenant.',
      designChoice: 'Hourly rollups reduce 2-year storage to <150 GB total in cost-effective object storage ($0.02/GB/mo = $3/month!).',
      tradeoffs: {
        pros: ['99.6% reduction in storage volume and cost', 'Enables 2-year year-over-year seasonality analysis'],
        cons: ['Queries over 30 days old have 1-hour resolution granularity']
      },
      interviewProTip: 'Explain the tiered storage hierarchy: NVMe for Raw (24h) -> SSD for Mid (30d) -> Object Store (S3) for Final (2y). This demonstrates Staff-level cost optimization.'
    }
  },
  {
    id: 'final_store',
    title: '3. Final Store (1h res)',
    subtitle: 'Retention: 2 Years',
    category: 'storage',
    x: 84,
    y: 93,
    highlightInPaths: ['all', 'read'],
    badge: 'Cold Tier / Object Store',
    tags: ['1-hour resolution', 'Block Parquet', 'S3 / GCS'],
    description: 'Tier-3 cold archive on cloud object storage for long-term capacity forecasts and yearly SLA audits.',
    keyResponsibilities: [
      'Stores immutable Apache Parquet files partitioned by `year=YYYY/month=MM/tenant_id=XYZ`',
      'Leverages S3 lifecycle policies for near-zero operational maintenance',
      'Queried via vectorized readers with pushdown predicates (filtering on metric_id and timestamp)'
    ],
    technologies: ['AWS S3 / Google Cloud Storage', 'Apache Parquet', 'Presto / ClickHouse query execution'],
    deepDive: {
      problemStatement: 'Querying 2 years of data directly from object storage without timing out user dashboards.',
      designChoice: 'Parquet footer contains metadata and min/max chunk stats; query engine skips 95% of row groups without reading raw bytes.',
      tradeoffs: {
        pros: ['Ultra-cheap durability (99.999999999%)', 'Infinite horizontal capacity without cluster scaling'],
        cons: ['Slightly higher first-byte latency (~100-300ms) compared to local NVMe']
      },
      interviewProTip: 'Object storage for cold tier time-series is standard across Datadog (Husky storage engine) and Prometheus Thanos/Cortex.'
    }
  },
  {
    id: 'query_engine',
    title: 'Distributed Query Engine',
    subtitle: 'Smart Horizon Optimization Routing',
    category: 'query',
    x: 54,
    y: 80,
    highlightInPaths: ['all', 'read'],
    badge: 'Sub-2s Query SLO',
    tags: ['Smart Horizon Router', 'Tag Intersect', 'Scatter-Gather'],
    description: 'Stateless query coordinator that inspects user time-range and dynamically routes queries to the optimal storage tier.',
    keyResponsibilities: [
      'Step 1: Queries Metadata Indexes with tag filters to retrieve target `metric_id`s',
      'Step 2: Inspects requested time window (Smart Horizon Optimization):',
      '  • Window ≤ 24h → Route to Tier 1 (Raw Store, 15s resolution)',
      '  • Window ≤ 30d → Route to Tier 2 (Mid Store, 1m resolution)',
      '  • Window > 30d → Route to Tier 3 (Final Store, 1h resolution)',
      'Step 3: Scatter-gathers sub-queries across storage shards, merges streams, and returns JSON series to UI'
    ],
    technologies: ['Go / Rust Query Gateway', 'Vectorized Merging', 'Connection Pooling'],
    deepDive: {
      problemStatement: 'A dashboard has 20 graph widgets. If a user sets the picker to "Last 6 Months", querying the raw store would crash the cluster.',
      designChoice: 'Automatic downsampling tier selection based on screen pixel density. 1920px screen cannot display more than ~1000 datapoints anyway!',
      tradeoffs: {
        pros: ['Guarantees sub-second dashboard rendering regardless of time range', 'Protects raw store from heavy historical analytical queries'],
        cons: ['Cross-boundary queries (e.g. 25 hours ago to now) must stitch Raw Store and Mid Store blocks']
      },
      interviewProTip: 'Key insight: "A 4K monitor only has 3,840 horizontal pixels. Returning 5,000,000 raw points for a 30-day graph wastes 99.9% of network bandwidth and browser memory."'
    }
  },
  {
    id: 'ui_dash',
    title: 'Interactive UI Dash',
    subtitle: 'Client Dashboard & Visualizer',
    category: 'ui',
    x: 34,
    y: 80,
    highlightInPaths: ['all', 'read'],
    badge: 'Sub-second UX',
    tags: ['Line Charts', 'Toplists', 'Heatmaps'],
    description: 'End-user analytics dashboard rendering metric graphs, SLA monitors, and real-time drill-downs.',
    keyResponsibilities: [
      'Issues unified PromQL/Datadog metric queries (e.g., `avg:cpu.usage{env:prod} by {host}`)',
      'Renders high-performance canvas/WebGL line charts with crosshair sync',
      'Handles automatic background polling refreshes for live monitoring walls'
    ],
    technologies: ['React 19', 'Canvas / WebGL / SVG', 'WebSocket / SSE stream'],
    deepDive: {
      problemStatement: 'Browser freezing when rendering hundreds of active charts across an enterprise operations center.',
      designChoice: 'Server-side downsampled buckets return precisely 500-1000 points per graph, rendering smoothly at 60 FPS.',
      tradeoffs: {
        pros: ['Instant client response', 'Low client CPU and memory footprint'],
        cons: ['Deep zooming into old historical points is bounded by the rollup tier resolution']
      },
      interviewProTip: 'Emphasize client-side efficiency: the monitoring system guarantees UI predictability through server-side aggregation.'
    }
  }
];

export const ARCHITECTURE_LINKS: ArchitectureLink[] = [
  // Write Path
  { id: 'l_web01_gw', source: 'host_agent_web01', target: 'ingest_gateway', label: 'gRPC mTLS (15s)', pathType: 'write' },
  { id: 'l_web02_gw', source: 'host_agent_web02', target: 'ingest_gateway', label: 'gRPC mTLS (15s)', pathType: 'write' },
  { id: 'l_k8s_gw', source: 'k8s_daemonset', target: 'ingest_gateway', label: 'Batched Ingest', pathType: 'write' },
  { id: 'l_shield_gw', source: 'cardinality_limiter', target: 'ingest_gateway', label: 'Sanitized Tags', pathType: 'write' },
  { id: 'l_cw_gw', source: 'cloudwatch_poller', target: 'ingest_gateway', label: 'Micro-Batched', pathType: 'write' },
  { id: 'l_gw_kafka', source: 'ingest_gateway', target: 'kafka_cluster', label: 'Batching: 8 MB/s', pathType: 'write' },
  { id: 'l_kafka_workers', source: 'kafka_cluster', target: 'storage_workers', label: 'Drain Buffer', pathType: 'write' },
  { id: 'l_workers_meta', source: 'storage_workers', target: 'metadata_indexes', label: '1. Resolve Tag Strings to ID', pathType: 'write' },
  { id: 'l_workers_raw', source: 'storage_workers', target: 'raw_store', label: 'Direct Sequential Append', pathType: 'write' },
  
  // Alert Path
  { id: 'l_kafka_alert', source: 'kafka_cluster', target: 'alerting_engine', label: 'Stream Fan-out', pathType: 'alert', dashed: true, styleColor: '#22c55e' },
  
  // Rollup Pipeline
  { id: 'l_raw_rollup1m', source: 'raw_store', target: 'rollup_1m', label: 'Every 10m Compaction', pathType: 'alert', dashed: true, styleColor: '#f97316' },
  { id: 'l_rollup1m_mid', source: 'rollup_1m', target: 'mid_store', label: 'Compacted 1m Block', pathType: 'alert', dashed: true, styleColor: '#f97316' },
  { id: 'l_mid_rollup1h', source: 'mid_store', target: 'rollup_1h', label: 'Hourly Batch Compaction', pathType: 'alert', dashed: true, styleColor: '#f97316' },
  { id: 'l_rollup1h_final', source: 'rollup_1h', target: 'final_store', label: 'Block Parquet Upload', pathType: 'alert', dashed: true, styleColor: '#f97316' },

  // Read Path
  { id: 'l_ui_query', source: 'ui_dash', target: 'query_engine', label: 'Dashboard Query', pathType: 'read' },
  { id: 'l_query_meta', source: 'query_engine', target: 'metadata_indexes', label: 'Resolve Tags to IDs', pathType: 'read', dashed: true },
  { id: 'l_query_raw', source: 'query_engine', target: 'raw_store', label: 'Window ≤ 24h (Raw)', pathType: 'read', styleColor: '#eab308' },
  { id: 'l_query_mid', source: 'query_engine', target: 'mid_store', label: 'Window ≤ 30d (1m)', pathType: 'read', styleColor: '#f97316' },
  { id: 'l_query_final', source: 'query_engine', target: 'final_store', label: 'Window > 30d (1h)', pathType: 'read', styleColor: '#a855f7' }
];

export const STEP_DESCRIPTIONS = [
  {
    stepNumber: 1,
    title: 'Clarify Requirements & Constraints',
    tag: 'Step 1 — Clarify',
    summary: 'Scope metrics ingestion, query SLOs, multi-resolution retention tiers, and real-time threshold & anomaly alerting.',
    items: [
      { label: 'Data Type Scope', value: 'Numeric time-series metrics only (Logs and distributed traces scoped out as separate systems).' },
      { label: 'Ingestion Throughput', value: '1,000,000 metrics/sec sustained (single large Datadog/Monarch deployment).' },
      { label: 'Query Latency SLO', value: 'Interactive dashboard queries over last 24h must return in < 2.0 seconds (P95 < 800ms).' },
      { label: 'Multi-Tier Retention', value: '15s resolution for 24h, 1m resolution for 30 days, 1h resolution for 2 years.' },
      { label: 'Alerting Requirements', value: 'Threshold-based alerts and sliding-window anomaly detection (evaluated sub-second off-stream).' }
    ]
  },
  {
    stepNumber: 2,
    title: 'Back-of-the-Envelope Capacity Estimations',
    tag: 'Step 2 — Estimate',
    summary: 'Mathematical sizing for network bandwidth, raw daily storage, and storage reduction through downsampling rollups.',
    items: [
      { label: 'Write Bandwidth', value: '1,000,000 metrics/sec × 8 bytes/datapoint = 8.0 MB/sec raw payload (~12 MB/sec on wire with framing).' },
      { label: '24-Hour Datapoints', value: '1M metrics × 4 points/min × 60 min × 24h = 5,760,000,000 (5.8 Billion) datapoints/day.' },
      { label: 'Raw Uncompressed Daily Volume', value: '5.76B points × 8 bytes = 46.08 GB/day raw value data.' },
      { label: '30-Day Uncompressed Raw Cost', value: '46.08 GB/day × 30 days = 1.38 TB (if stored raw without downsampling).' },
      { label: 'With 1m & 1h Downsampled Rollups', value: '~50 GB/month per compression tier. 2-year total storage drops from 33.6 TB to ~1.2 TB!' }
    ]
  },
  {
    stepNumber: 3,
    title: 'Data Model & Series Decoupling',
    tag: 'Step 3 — Data Model',
    summary: 'Separating metric metadata (tags & names) from raw numeric values to avoid 1500% tag string repetition.',
    items: [
      { label: 'Series Identification', value: 'Metric Name + sorted Key-Value Tag set: cpu.usage{host=web-01, region=us-east, env=prod}' },
      { label: 'Metadata Storage (NVMe)', value: 'metric_id (uint64) → {name, tag_map, retention_policy}. Queried via Roaring Bitmap inverted index.' },
      { label: 'Numeric TSDB Storage', value: '(metric_id, timestamp_uint32, value_float64) ordered chronologically in LSM append blocks.' },
      { label: 'Gorilla Compression', value: 'Delta-of-delta timestamp encoding + XOR float64 compression reduces 16 bytes to ~1.37 bytes/point.' },
      { label: 'Rollup Hierarchy', value: 'Three physical tiers: Raw (15s, 24h TTL) → Mid (1m, 30d TTL) → Final (1h, 2yr TTL on S3 Parquet).' }
    ]
  },
  {
    stepNumber: 4,
    title: 'Distributed Rollups & Smart Horizon Routing',
    tag: 'Step 4 — Architecture Deep Dive',
    summary: 'Reconciling write throughput (append-only) with interactive query throughput (smart tier selection).',
    items: [
      { label: 'The Core Conflict', value: 'Writes require sequential appends (LSM). Queries require fast range scans over millions of series.' },
      { label: 'The Solution: Rollups', value: 'Pre-compute Min, Max, Avg, Sum, and Sketches during 15s → 1m and 1m → 1h background compactions.' },
      { label: 'Smart Horizon Routing', value: 'Query Engine auto-inspects requested window: ≤24h reads Raw, ≤30d reads 1m Rollup, >30d reads 1h Rollup.' },
      { label: 'Data Transfer Reduction', value: 'Scanning a 30-day dashboard at 1m instead of 15s avoids scanning 3.4 billion unnecessary points!' }
    ]
  }
];
