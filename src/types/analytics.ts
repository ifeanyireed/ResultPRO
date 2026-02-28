// Analytics types for frontend
export interface DashboardData {
  classAverage: number;
  passRate: number;
  atRiskCount: number;
  excellenceCount: number;
  topSubjects: SubjectSummary[];
  worstSubjects: SubjectSummary[];
  termTrend: TermMetric[];
  studentTierDistribution: StudentTierDistribution;
}

export interface SubjectSummary {
  subjectId: string;
  subjectName: string;
  average: number;
  passRate: number;
}

export interface TermMetric {
  term: string;
  average: number;
  passRate: number;
}

export interface StudentTierDistribution {
  excellent: number;
  good: number;
  average: number;
  atRisk: number;
}

export interface RiskScore {
  studentId: string;
  studentName: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  currentAverage: number;
  classAverage: number;
  factors: any;
  recommendations: string[];
}

export interface AtRiskStudentsList {
  students: RiskScore[];
  summary: {
    totalAtRisk: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SubjectAnalytics {
  subjectId: string;
  subjectName: string;
  classAverage: number;
  passRate: number;
  difficultyIndex: number;
  studentPerformance: any[];
}

export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  termProgress: any[];
  subjectPerformance: any[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskScore: number;
  riskLevel: string;
}
