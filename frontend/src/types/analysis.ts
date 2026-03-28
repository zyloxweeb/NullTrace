export type IOCs = {
  urls: string[];
  ips: string[];
  emails: string[];
  domains: string[];
};

export type RiskAssessment = {
  score: number;
  severity: string;
  reasons: string[];
};

export type SuspiciousPattern = {
  pattern: string;
  category: string;
  severity: string;
  description: string;
};

export type AnalysisResult = {
  analysis_id?: string;
  created_at?: string;
  cached?: boolean;
  filename: string;
  size: number;
  mime_type: string;
  file_category: string;
  sha256: string;
  md5: string;
  entropy: number;
  strings: string[];
  iocs: IOCs;
  suspicious_patterns: SuspiciousPattern[];
  risk_assessment: RiskAssessment;
  trust_assessment?: TrustAssessment;
  verdict?: Verdict;
};

export type AnalysisSummary = {
  analysis_id: string;
  created_at: string;
  filename: string;
  size: number;
  mime_type: string;
  file_category: string;
  sha256: string;
  severity: string;
  score: number;
};

export type TrustAssessment = {
  trust_score: number;
  is_likely_installer: boolean;
  has_benign_cert_infrastructure: boolean;
  matched_cert_keywords: string[];
  matched_installer_hints: string[];
  reasons: string[];
};

export type Verdict = {
  raw_risk_score: number;
  trust_score: number;
  final_score: number;
  verdict: string;
  confidence: string;
  reasons: string[];
};