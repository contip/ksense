export interface Patient {
  patient_id: string;
  name: string;
  age: number | string;
  gender: string;
  blood_pressure: string;
  temperature: number | string;
  visit_date: string;
  diagnosis: string;
  medications: string;
}

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
