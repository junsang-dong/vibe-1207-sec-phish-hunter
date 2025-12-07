export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  actionGuide: string[];
  keywords: string[];
}

export interface AnalysisError {
  message: string;
  code?: string;
}

