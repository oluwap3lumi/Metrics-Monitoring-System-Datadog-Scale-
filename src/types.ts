export type PathMode = 'all' | 'write' | 'read' | 'alert';

export interface ArchitectureNode {
  id: string;
  title: string;
  subtitle?: string;
  category: 'source' | 'gateway' | 'queue' | 'compute' | 'storage' | 'query' | 'ui' | 'defense';
  x: number; // percentage or grid coordinate
  y: number;
  width?: number;
  height?: number;
  highlightInPaths: PathMode[];
  badge?: string;
  tags?: string[];
  description: string;
  keyResponsibilities: string[];
  technologies: string[];
  deepDive: {
    problemStatement: string;
    designChoice: string;
    tradeoffs: { pros: string[]; cons: string[] };
    interviewProTip: string;
    codeSnippet?: string;
  };
}

export interface ArchitectureLink {
  id: string;
  source: string;
  target: string;
  label?: string;
  pathType: 'write' | 'read' | 'alert';
  dashed?: boolean;
  styleColor?: string;
}

export interface MetricDataPoint {
  timestamp: number;
  value: number;
  min?: number;
  max?: number;
  count?: number;
}

export interface QuerySimulationResult {
  tierUsed: 'raw' | 'mid' | 'final';
  tierName: string;
  resolution: string;
  timeWindowLabel: string;
  pointsScanned: number;
  rawPointsEquivalent: number;
  compressionRatio: string;
  latencyMs: number;
  storageFormat: string;
  data: MetricDataPoint[];
}
