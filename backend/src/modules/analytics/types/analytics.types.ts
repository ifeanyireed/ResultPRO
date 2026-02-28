// Analytics type definitions

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
  rank?: number;
}

export interface TermMetric {
  term: string;
  average: number;
  passRate: number;
  timestamp: Date;
}

export interface StudentTierDistribution {
  excellent: number; // 90-100%
  good: number; // 80-89%
  average: number; // 60-79%
  atRisk: number; // <60%
}

export interface RiskScore {
  studentId: string;
  studentName: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  currentAverage: number;
  classAverage: number;
  
  factors: {
    lowAverageScore: {
      triggered: boolean;
      weight: number;
      score: number;
    };
    decliningTrend: {
      triggered: boolean;
      weight: number;
      score: number;
    };
    lowAttendance: {
      triggered: boolean;
      weight: number;
      score: number;
      gapDays?: number;
    };
    weakSubjects: {
      triggered: boolean;
      weight: number;
      score: number;
      subjects: string[];
    };
    missingAssessments: {
      triggered: boolean;
      weight: number;
      score: number;
    };
  };
  
  recommendations: string[];
}

export interface SubjectAnalytics {
  subjectId: string;
  subjectName: string;
  classAverage: number;
  medianScore: number;
  stdDeviation: number;
  passRate: number;
  failCount: number;
  
  distributionCurve: DistributionBracket[];
  
  assessmentComponentBreakdown: {
    component: string; // CA1, CA2, Project, Exam
    weight: number;
    classAverage: number;
    variance: number;
  }[];
  
  difficultyIndex: number; // 1-10
  
  trends: {
    ca1_to_ca2_change: number; // % change
    ca_vs_exam_gap: number; // How CAs predict exam
  };
  
  studentPerformance: {
    studentId: string;
    studentName: string;
    grade: string;
    score: number;
    ca1: number;
    ca2: number;
    project: number;
    exam: number;
  }[];
}

export interface DistributionBracket {
  range: string; // 'F (0-40)', 'A+ (90-100)'
  count: number;
  percentage: number;
}

export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  
  termProgress: {
    term: string;
    overallAverage: number;
    position: number;
    tier: 'excellent' | 'good' | 'average' | 'atRisk';
    change: number; // % change from previous
  }[];
  
  subjectPerformance: {
    subjectId: string;
    subjectName: string;
    term1: number;
    term2: number;
    term3: number;
    trend: 'improving' | 'stable' | 'declining';
    classPercentile: number; // 0-100
    remark: string;
  }[];
  
  affectiveDomainScores: {
    trait: string;
    score: number; // 1-5
  }[];
  
  psychomotorDomainScores: {
    skill: string;
    score: number; // 1-5
  }[];
  
  attendanceData: {
    term: string;
    daysPresent: number;
    daysOpen: number;
    percentage: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ClassComparison {
  classes: {
    classId: string;
    className: string;
    metrics: {
      avgScore: number;
      passRate: number;
      medianScore: number;
      stdDeviation: number;
      atRiskCount: number;
      excellentCount: number;
    };
  }[];
  
  subjectComparison: {
    subjectId: string;
    subjectName: string;
    classPerformance: {
      classId: string;
      className: string;
      avgScore: number;
      rank: number;
    }[];
  }[];
  
  insights: string[];
}

export interface AttendanceImpactAnalysis {
  overallCorrelation: number; // -1 to 1
  correlationStrength: 'strong' | 'moderate' | 'weak';
  
  scatterPlotData: {
    studentId: string;
    studentName: string;
    attendancePercentage: number;
    averageGrade: number;
  }[];
  
  subjectImpact: {
    subjectId: string;
    subjectName: string;
    correlation: number;
    impactPerDay: number; // % grade change per day attended
  }[];
  
  atRiskByAttendance: {
    studentId: string;
    studentName: string;
    attendance: number;
    expectedAverage: number;
    actualAverage: number;
    gap: number;
    recommendation: string;
  }[];
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
