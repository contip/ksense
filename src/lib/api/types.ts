import { Patient } from "@/types/patient";

export interface ApiResponse {
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  metadata: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

export interface RiskAssessment {
  patient_id: string;
  bpRisk: number;
  tempRisk: number;
  ageRisk: number;
  totalRisk: number;
  hasDataQualityIssues: boolean;
  hasFever: boolean;
}

export interface AssessmentResults {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

export interface BreakdownCategory {
  score: number;
  max: number;
  correct: number;
  submitted: number;
  matches: number;
}

export interface AssessmentResponse {
  success: boolean;
  message: string;
  results: {
    score: number;
    percentage: number;
    status: string;
    breakdown: {
      high_risk: BreakdownCategory;
      fever: BreakdownCategory;
      data_quality: BreakdownCategory;
    };
    feedback: {
      strengths: string[];
      issues: string[];
    };
    attempt_number: number;
    remaining_attempts: number;
    is_personal_best: boolean;
    can_resubmit: boolean;
  };
}
