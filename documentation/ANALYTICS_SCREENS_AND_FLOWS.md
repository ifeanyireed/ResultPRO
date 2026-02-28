# Student Academic Performance Analytics - Screens, Flows & Logic

**Document**: Analytics Architecture  
**Date**: February 28, 2026  
**Objective**: Define UI screens, user flows, and backend logic for student performance analytics

---

## 1. DASHBOARD SCREENS

### 1.1 Analytics Home/Landing Screen
**Path**: `/analytics` or `/dashboard/analytics`

**Components:**
```
┌─────────────────────────────────────────────────────────┐
│ Analytics Dashboard                          [Select Session ▼] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Quick Stats Cards Row:                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │ Avg Score   │ │ Pass Rate   │ │ At-Risk     │     │
│  │   78.5%     │ │   92.5%     │ │  5 Students │     │
│  └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                         │
│  ┌──────────────────────────┬──────────────────────┐  │
│  │ Class Trend (3 Terms)    │ Top/Bottom Subjects  │  │
│  │ Line Chart: Avg Score    │ Horizontal Bar Chart │  │
│  │ Term1: 75% → T2: 77%     │ Math: 85%            │  │
│  │ → T3: 78%                │ English: 72% (↓)     │  │
│  └──────────────────────────┴──────────────────────┘  │
│                                                         │
│  ┌──────────────────────┐ ┌──────────────────────┐    │
│  │ Attendance Impact    │ │ Performance by Tier  │    │
│  │ Scatter Plot:        │ │ Excellent: 12%       │    │
│  │ Attendance vs Grade  │ │ Good:      45%       │    │
│  │ (Strong Correlation) │ │ Average:   32%       │    │
│  └──────────────────────┘ │ At-Risk:   11%       │    │
│                            └──────────────────────┘    │
│                                                         │
│  [View At-Risk] [Compare Classes] [Export Report]     │
└─────────────────────────────────────────────────────────┘
```

**Data Displayed:**
- Key Performance Indicators (KPIs)
- 3-term trend line (class average progression)
- Top/worst 5 subjects by pass rate
- Attendance vs. performance correlation
- Student tier distribution (pie chart)

**Logic Required:**
```typescript
interface DashboardData {
  classAverage: number;
  passRate: number;
  atRiskCount: number;
  topSubjects: Subject[];
  worstSubjects: Subject[];
  attendanceCorrelation: number; // -1 to 1
  studentTierDistribution: {
    excellent: number; // 90-100%
    good: number;      // 80-89%
    average: number;   // 60-79%
    atRisk: number;    // <60%
  };
  termTrend: { term: string; average: number }[];
}
```

---

### 1.2 At-Risk Students Screen
**Path**: `/analytics/at-risk`

**Components:**
```
┌─────────────────────────────────────────────────────────┐
│ At-Risk Students                    [Filter ▼] [Export] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Risk Score: [HIGH ████] [MEDIUM ██] [LOW █]           │
│  Danger Indicators:                                     │
│  ☑ Below 50% Average   ☑ Attendance <70%              │
│  ☑ Declining CA Trend  ☑ Missing Assessments          │
│                                                         │
│  Table:                                               │
│  ┌────┬──────────┬─────────┬──────────┬──────────┐    │
│  │ #  │ Name     │ Risk ↓  │ Avg Grade│ Trigger  │    │
│  ├────┼──────────┼─────────┼──────────┼──────────┤    │
│  │ 1  │ John D.  │ 92%     │ 45%      │ Low avg  │    │
│  │    │ [Details]           │ + Low attendance (60%) │  │
│  │    │                     │                   [Help] │  │
│  ├────┼──────────┼─────────┼──────────┼──────────┤    │
│  │ 2  │ Sarah K. │ 78%     │ 58%      │ Decline  │    │
│  │    │ [Details]           │ CA1→CA2: 65%→52%      │  │
│  │    │                     │                   [Help] │  │
│  ├────┼──────────┼─────────┼──────────┼──────────┤    │
│  │ 3  │ Mike L.  │ 65%     │ 68%      │ Weak     │    │
│  │    │ [Details]           │ Science & Math struggle  │  │
│  │    │                     │                   [Help] │  │
│  └────┴──────────┴─────────┴──────────┴──────────┘    │
│                                                         │
│  [Create Intervention Report]                         │
└─────────────────────────────────────────────────────────┘
```

**Data Displayed:**
- Risk score (0-100) per student
- Risk factors breakdown
- Average grade
- Trigger indicators
- Recommended actions

**Sub-Flow: Click on Student → Student Detail View**
```
┌──────────────────────────────────┐
│ John Doe - At-Risk Profile        │
├──────────────────────────────────┤
│                                  │
│ Risk Score: 92% [████████░]      │
│ Current Avg: 45% ↓               │
│ Class Avg: 78%                   │
│ Percentile: 8th (Bottom tier)     │
│                                  │
│ PROBLEM AREAS:                   │
│ ┌────────────────────────────┐   │
│ │ Overall: 45% (RED)         │   │
│ │ • English: 62% (FAIR)      │   │
│ │ • Math: 38% (CRITICAL)  ←  │   │
│ │ • Science: 41% (CRITICAL)│ │   │
│ └────────────────────────────┘   │
│                                  │
│ ASSESSMENT BREAKDOWN:            │
│ Math:  CA1 70% → CA2 45%↓ Exam?  │
│ Science: CA1 60% → CA2 35%↓      │
│                                  │
│ ATTENDANCE: 60% (14/23 days)     │
│ Trend: ↓ Declining              │
│                                  │
│ RECOMMENDATIONS:                 │
│ 1. Math tutoring 2x/week         │
│ 2. Science lab practice          │
│ 3. Attendance intervention       │
│ 4. Motivational counselling      │
│                                  │
│ [Generate Intervention Plan]     │
│ [Notify Guardian]                │
└──────────────────────────────────┘
```

**Logic Required:**
```typescript
interface RiskScore {
  studentId: string;
  riskScore: number; // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  
  factors: {
    lowAverageScore: { triggered: boolean; weight: 0.35; score: number };
    declingGradeCA1toCA2: { triggered: boolean; weight: 0.25; };
    lowAttendance: { triggered: boolean; weight: 0.20; gapDays: number };
    weakSubjects: { triggered: boolean; weight: 0.15; subjectIds: string[] };
    missingAssessments: { triggered: boolean; weight: 0.05 };
  };
  
  recommendations: string[];
}

// Formula: Risk = (factor.weight * factor.score) + ...
function calculateRiskScore(student: StudentResult, classAvg: number): RiskScore
```

---

### 1.3 Subject Performance Analysis Screen
**Path**: `/analytics/subjects`

**Components:**
```
┌─────────────────────────────────────────────────────────┐
│ Subject Performance Analysis              [Export] [Print]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [English ▼] [Summary] [Difficulty] [Student Breakdown] │
│                                                         │
│ ENGLISH - Class Average: 78%                           │
│                                                         │
│ Distribution Curve:                                   │
│    │                                                  │
│    │                     ╱╲                           │
│    │              ╱────╱  ╲──╲                       │
│    │          ╱╱          ╲╲ ╲                       │
│    └──────────────────────────────> Score            │
│      F   E   D   C   B   A   A+                      │
│      2   5   12  18  20  8   1  (count)             │
│                                                         │
│ Metrics:                                              │
│ ┌──────────────────┬──────────────────┐             │
│ │ Average: 78%     │ Median: 79%      │             │
│ │ Std Dev: 12.4    │ Pass Rate: 95%   │             │
│ │ Top Score: 98%   │ Lowest: 42%      │             │
│ └──────────────────┴──────────────────┘             │
│                                                         │
│ Assessment Components:                               │
│ ┌────────────────┬────────┬──────────┐              │
│ │ Component      │ Avg    │ vs Class │              │
│ ├────────────────┼────────┼──────────┤              │
│ │ CA1 (20%)      │ 75%    │ =        │              │
│ │ CA2 (20%)      │ 79%    │ ↑ +1    │              │
│ │ Project (10%)  │ 82%    │ ↑ +3    │              │
│ │ Exam (50%)     │ 77%    │ ↓ -2    │              │
│ └────────────────┴────────┴──────────┘              │
│                                                         │
│ Difficulty Index: MEDIUM (7/10)                      │
│ • High exam variance suggests tricky questions       │
│ • CA scores stable (good learning)                   │
│ • Recommendation: Increase exam practice            │
│                                                         │
│ [View Student Breakdown] [Compare with Other Subject]│
└─────────────────────────────────────────────────────────┘
```

**Sub-Flow: Student Breakdown**
```
┌──────────────────────────────────────┐
│ English: Student Breakdown            │
├──────────────────────────────────────┤
│ Sort: [By Final Grade ▼]             │
│ Filter: [All Students ▼]             │
│                                      │
│ Name       │Grade│CA1│CA2│PRJ│Exam │
│ ───────────┼─────┼───┼───┼───┼──── │
│ Sarah M.   │ A+  │95 │98 │95 │96   │
│ John D.    │ B   │72 │75 │68 │74   │
│ Mike L.    │ C   │65 │62 │55 │58   │
│ Emma K.    │ F   │42 │38 │30 │35   │
│                                      │
│ [View Detail] [Email Feedback]      │
└──────────────────────────────────────┘
```

**Logic Required:**
```typescript
interface SubjectAnalytics {
  subjectId: string;
  classAverage: number;
  medianScore: number;
  stdDeviation: number;
  passRate: number;
  failCount: number;
  
  distributionCurve: {
    scoreRange: string;
    count: number;
  }[];
  
  assessmentComponentBreakdown: {
    component: string; // CA1, CA2, Project, Exam
    weight: number;
    classAverage: number;
    variance: number;
  }[];
  
  difficultyIndex: number; // 1-10
  // High exam variance = difficult exam
  // Low CA variance = good teaching
  
  trends: {
    ca1_to_ca2_change: number; // % increase/decrease
    ca_vs_exam_gap: number; // Do CAs predict exam?
  };
}
```

---

### 1.4 Student Individual Report Screen
**Path**: `/analytics/student/:studentId`

**Components:**
```
┌──────────────────────────────────────────────────────────┐
│ STUDENT PROGRESS REPORT                                  │
│ John Doe | Admission: ADS-2024-001                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  3-TERM JOURNEY                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Overall Average Trend:                           │   │
│  │ Term 1: 62% ─────[ ████░░░░░░ ] ────────────   │   │
│  │ Term 2: 67% ─────[ █████░░░░░ ] ────────────   │   │
│  │ Term 3: 71% ─────[ ██████░░░░ ] ────────────   │   │
│  │         ↑ +5%      ↑ Good Improvement           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  SUBJECT PERFORMANCE MATRIX (Term 3)                     │
│  ┌─────────────┬───┬──────┬──────┬──────┬──────────┐    │
│  │ Subject     │Gr │T1→T3 │Class │Pos   │Remark    │    │
│  ├─────────────┼───┼──────┼──────┼──────┼──────────┤    │
│  │ English     │ A │↑ 70→87│78%  │Top 5%│Excellent │    │
│  │ Math        │ B │= 72→73│76%  │31%  │Good      │    │
│  │ Science     │ C │↓ 68→64│75%  │52%  │Below Avg │    │
│  │ Social      │ B │↑ 65→80│74%  │8%   │Strong    │    │
│  └─────────────┴───┴──────┴──────┴──────┴──────────┘    │
│                                                          │
│  AFFECTIVE & PSYCHOMOTOR DOMAINS                         │
│  ┌─────────────────────┬──────────────────────────────┐  │
│  │ AFFECTIVE TRAITS    │        PSYCHOMOTOR SKILLS    │  │
│  │ Attentiveness: ████  │ Lab Work: ████░             │  │
│  │ (4/5)              │ (3/5) - Needs practice       │  │
│  │ Honesty: █████     │ Drawing: ████░              │  │
│  │ (5/5) - Excellent  │ (3/5) - Average             │  │
│  │ Responsibility: ███░ │ Teamwork: █████            │  │
│  │ (3/5) - Fair       │ (5/5) - Excellent           │  │
│  └─────────────────────┴──────────────────────────────┘  │
│                                                          │
│  ATTENDANCE & BEHAVIORAL INSIGHTS                        │
│  Present: 19/23 days (82%) ↓ (Down from 85% last term) │
│  Trend: Slight decline - Monitor closely                │
│                                                          │
│  STRENGTHS:                                              │
│  ✓ Excellent in English & Social Studies                │
│  ✓ Strong improvement trajectory (+9% over 3 terms)     │
│  ✓ Excellent behavioral ratings                         │
│  ✓ Good attendance                                       │
│                                                          │
│  AREAS FOR IMPROVEMENT:                                  │
│  ⚠ Science performance declining (68→64%)               │
│  ⚠ Psychomotor skills (lab work) below average         │
│  ⚠ Slight attendance decline                            │
│                                                          │
│  NEXT STEPS:                                             │
│  1. Science lab tutoring - 1 session/week               │
│  2. Maintain strong English performance                 │
│  3. Monitor attendance trend                             │
│                                                          │
│  [Print Report] [Email to Guardian] [Set Goal]         │
└──────────────────────────────────────────────────────────┘
```

**Logic Required:**
```typescript
interface StudentAnalytics {
  studentId: string;
  studentName: string;
  
  termProgress: {
    term: string;
    overallAverage: number;
    position: number;
    tier: "excellent" | "good" | "average" | "atRisk";
  }[];
  
  subjectPerformance: {
    subjectId: string;
    term1: number;
    term2: number;
    term3: number;
    trend: "improving" | "stable" | "declining";
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
    trend: "improving" | "stable" | "declining";
  }[];
  
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}
```

---

### 1.5 Class Comparison Screen
**Path**: `/analytics/compare-classes`

**Components:**
```
┌─────────────────────────────────────────────────────────┐
│ Class Performance Comparison                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Classes: [Form 3A ▼] vs [Form 3B ▼] vs [Form 4A ▼]    │
│                                                         │
│ OVERALL METRICS:                                       │
│ ┌────────────┬──────────┬──────────┬──────────┐       │
│ │ Metric     │ Form 3A  │ Form 3B  │ Form 4A  │       │
│ ├────────────┼──────────┼──────────┼──────────┤       │
│ │ Avg Score  │ 78.5% ◀──│ 72.3%    │ 81.2%    │       │
│ │ Pass Rate  │ 95%      │ 88% ◀────│ 96%      │       │
│ │ Median     │ 80%      │ 71%      │ 82%      │       │
│ │ Std Dev    │ 10.2     │ 14.8 ◀──│ 9.5      │       │
│ │ At-Risk    │ 2 stud   │ 5 stud ◀│ 1 stud   │       │
│ │ Top Perf   │ 5 stud   │ 3 stud   │ 6 stud   │       │
│ └────────────┴──────────┴──────────┴──────────┘       │
│                                (Form 3B struggling)    │
│                                                         │
│ SUBJECT-BY-SUBJECT COMPARISON:                         │
│ English:                                               │
│  Form 3A ████████░░ 82%                               │
│  Form 3B ███████░░░ 75% ◀ Needs attention             │
│  Form 4A █████████░ 88%                               │
│                                                         │
│ Math:                                                  │
│  Form 3A ██████░░░░ 68%                               │
│  Form 3B ██████░░░░ 65% ◀ Similar struggle            │
│  Form 4A ████████░░ 78%                               │
│                                                         │
│ [Show All Subjects] [Export Detailed Report]          │
└─────────────────────────────────────────────────────────┘
```

**Logic Required:**
```typescript
interface ClassComparison {
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
      avgScore: number;
      rank: number;
    }[];
  }[];
  
  insights: string[];
}
```

---

### 1.6 Attendance Impact Analysis Screen
**Path**: `/analytics/attendance-impact`

**Components:**
```
┌─────────────────────────────────────────────────────────┐
│ Attendance vs Academic Performance                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ CORRELATION ANALYSIS:                                  │
│ Overall Correlation: +0.78 (STRONG POSITIVE)           │
│ Interpretation: Higher attendance → Better grades      │
│                                                         │
│ Scatter Plot:                                          │
│      │                                                 │
│  100│           ▲ Sarah (19d, 92%)                    │
│   90│         ●▲●                                      │
│   80│       ●  ●  ● Strong cluster                    │
│   70│       ●●●●●                                     │
│   60│      ●         ▼ Mike (12d, 55%)                │
│   50│    ●           isolated case                     │
│      │__________________________________              │
│      0  5  10  15  20      Days Present               │
│       (Out of 23)                                     │
│                                                         │
│ ATTENDANCE IMPACT BY SUBJECT:                          │
│ ┌──────────────┬────────────────────────────────────┐ │
│ │ Subject      │ Correlation │ Impact per Day      │ │
│ ├──────────────┼────────────────────────────────────┤ │
│ │ Math         │ +0.85       │ +0.42% per day      │ │
│ │ Science      │ +0.82       │ +0.39% per day      │ │
│ │ English      │ +0.71       │ +0.28% per day      │ │
│ │ Social       │ +0.65       │ +0.22% per day      │ │
│ └──────────────┴────────────────────────────────────┘ │
│                                                         │
│ INTERPRETATION:                                        │
│ • Each day missed in Math costs ~0.42% in grade       │
│ • Attendance matters more for STEM (Math, Science)    │
│ • Every 5 days missed = ~2% grade drop               │
│                                                         │
│ AT-RISK ATTENDANCE:                                    │
│ Students with <75% attendance:                        │
│ ┌────────────────┬────────┬──────────┬────────────┐   │
│ │ Name           │ Attend │ Expected │ Actual Avg │   │
│ ├────────────────┼────────┼──────────┼────────────┤   │
│ │ John D.        │ 60%    │ 64%      │ 45% ◀ Gap  │   │
│ │ Emma K.        │ 70%    │ 71%      │ 58% ◀ Gap  │   │
│ └────────────────┴────────┴──────────┴────────────┘   │
│                                                         │
│ [Generate Attendance Intervention] [View Trends]      │
└─────────────────────────────────────────────────────────┘
```

**Logic Required:**
```typescript
interface AttendanceImpactAnalysis {
  overallCorrelation: number; // -1 to 1
  correlationStrength: "strong" | "moderate" | "weak";
  
  scatterPlotData: {
    studentId: string;
    attendancePercentage: number;
    averageGrade: number;
  }[];
  
  subjectImpact: {
    subjectId: string;
    correlation: number;
    impactPerDay: number; // % grade change per day attended
  }[];
  
  atRiskByAttendance: {
    studentId: string;
    attendance: number;
    expectedAverage: number; // based on correlation
    actualAverage: number;
    gap: number; // actual - expected
    recommendation: string;
  }[];
}

// Calculation:
// Correlation = covariance(attendance, grades) / (std_attendance * std_grades)
// impactPerDay = slope of regression line
// expectedAverage = intercept + (slope * attendance)
```

---

## 2. USER FLOWS

### 2.1 Teacher Analytics Access Flow
```
┌─────────────────┐
│  Teacher Login  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Go to Analytics Menu    │
│ [My Class Analytics]    │
└────────┬────────────────┘
         │
         ├─────────────────────────────────────────────────────┐
         │                                                     │
         ▼                                                     ▼
   ┌──────────────────┐                            ┌──────────────────┐
   │ View Dashboard   │                            │ View Subjects    │
   │ - Class Trend    │                            │ - Subject Dist   │
   │ - KPIs           │       [Help Student]       │ - Difficulty     │
   │ - Top/Bad Subj   │─────────────────────────► │ - Comp Analysis  │
   └──────┬───────────┘                            └──────┬───────────┘
         │                                                 │
         │                    ┌────────────────────────────┘
         │                    │
         ▼                    ▼
   ┌────────────────────────────────────┐
   │ Select Student (At-Risk Alert)     │
   │ View Detailed Profile              │
   │ - Grade Breakdown by Subject       │
   │ - Assessment Components            │
   │ - Attendance Data                  │
   │ - Risk Factors                     │
   └────────┬─────────────────────────────┘
            │
            ├─ [Create Tutoring Plan]
            ├─ [Email Guardian]
            ├─ [Generate Report]
            └─ [Set Student Goal]
```

### 2.2 Principal/Admin Analytics Flow
```
┌──────────────────┐
│  Principal Login │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│  School Analytics Dashboard  │
│  - All Classes Overview      │
│  - School-wide KPIs          │
│  - Trends                    │
└────────┬─────────────────────┘
         │
         ├─────────────────────────────────────────────────────┐
         │                                                     │
         ▼                                                     ▼
   ┌──────────────────────┐                         ┌──────────────────┐
   │ Compare Classes      │                         │ Deep Dive       │
   │ - Class Metrics      │                         │ - Subject Perf   │
   │ - Performance Ranks  │                         │ - Attendance     │
   │ - Identify Issues    │                         │ - Trends         │
   └──────┬───────────────┘                         └──────┬───────────┘
         │                                                 │
         ▼                                                 ▼
   ┌──────────────────────────────────┐    ┌──────────────────────────┐
   │ Find Struggling Classes          │    │ View Regional Insights   │
   │ [Form 3B: Low pass rate] ◄───── │    │ - Performance by State   │
   │ Generate Report                  │    │ - Benchmark vs Others    │
   │ [Email Teachers]                 │    └──────────────────────────┘
   │ [Plan Professional Dev]          │
   └──────────────────────────────────┘
         │
         └─────┬──────────────────────────────────────┐
               │                                      │
               ▼                                      ▼
         ┌──────────────┐                    ┌──────────────────┐
         │ Export Audit │                    │ Compliance Check │
         │ - PDF Report │                    │ - Quality Stats  │
         └──────────────┘                    └──────────────────┘
```

### 2.3 Student/Guardian Analytics Access Flow
```
┌────────────────────────┐
│ Student/Guardian Login │
└────────┬───────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ View My Performance Dashboard   │
│ - My Overall Average (3 Terms)  │
│ - Subject Performance           │
│ - How I Rank in Class           │
└────────┬────────────────────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
   ┌──────────────────┐              ┌──────────────────────┐
   │ My Strengths     │              │ Areas to Improve     │
   │ - Top Subjects   │              │ - Weak Subjects      │
   │ - Improvement    │              │ - Recommendations    │
   │   Areas          │              │ - Available Help     │
   └──────────────────┘              └──────────────────────┘
         │                                      │
         └──────────────┬──────────────────────┘
                        │
                        ▼
                ┌──────────────────────┐
                │ Set Academic Goal    │
                │ "Improve Math to A"  │
                │ Track Progress       │
                └──────────────────────┘
```

---

## 3. BACKEND LOGIC & CALCULATIONS

### 3.1 Risk Score Calculation Engine
```typescript
// File: backend/src/analytics/riskScore.ts

interface RiskCalculationInput {
  student: StudentResult;
  classMetrics: {
    classAverage: number;
    classMedian: number;
    classStdDev: number;
  };
  historicalData: StudentResult[]; // Previous terms
}

function calculateRiskScore(input: RiskCalculationInput): RiskScore {
  const { student, classMetrics, historicalData } = input;
  
  // 1. Low Average Score Factor (Weight: 35%)
  const avgScoreFactor = calculateAverageScoreFactor(
    student.overallAverage,
    classMetrics.classAverage
  ); // 0-100
  
  // 2. Declining Trend Factor (Weight: 25%)
  const declineFactor = calculateDeclineFactor(
    student.subjectResults, // Parse JSON
    historicalData
  ); // 0-100
  
  // 3. Attendance Factor (Weight: 20%)
  const attendanceFactor = calculateAttendanceFactor(
    student.daysPresent,
    student.daysSchoolOpen,
    classMetrics
  ); // 0-100
  
  // 4. Weak Subjects Factor (Weight: 15%)
  const weakSubjectsFactor = calculateWeakSubjectsFactor(
    student.subjectResults
  ); // 0-100
  
  // 5. Assessment Gap Factor (Weight: 5%)
  const assessmentGapFactor = calculateAssessmentGapFactor(
    student.subjectResults
  ); // 0-100
  
  // Weighted sum
  const riskScore =
    (avgScoreFactor * 0.35) +
    (declineFactor * 0.25) +
    (attendanceFactor * 0.20) +
    (weakSubjectsFactor * 0.15) +
    (assessmentGapFactor * 0.05);
  
  return {
    riskScore: Math.round(riskScore),
    riskLevel: getRiskLevel(riskScore),
    factors: { avgScoreFactor, declineFactor, attendanceFactor, weakSubjectsFactor, assessmentGapFactor },
    recommendations: generateRecommendations(riskScore, factors)
  };
}

// Helper: Average Score Factor
function calculateAverageScoreFactor(
  studentAvg: number,
  classAvg: number
): number {
  // If student is below class average, they're at risk
  const gap = classAvg - studentAvg;
  const maxGap = classAvg; // 0% is max gap
  
  if (gap <= 0) return 0; // Above average = no risk
  return Math.min((gap / maxGap) * 100, 100);
}

// Helper: Decline Factor
function calculateDeclineFactor(
  currentSubjects: JSON,
  historicalData: StudentResult[]
): number {
  // Parse current subject scores
  const current = JSON.parse(currentSubjects);
  
  // Find declining subjects
  let declineCount = 0;
  let totalSubjects = Object.keys(current).length;
  
  historicalData.forEach(history => {
    const prev = JSON.parse(history.subjectResults);
    Object.keys(current).forEach(subject => {
      if (prev[subject] && prev[subject].total > current[subject].total) {
        declineCount++;
      }
    });
  });
  
  return (declineCount / (totalSubjects * historicalData.length)) * 100;
}

// Helper: Attendance Factor
function calculateAttendanceFactor(
  daysPresent: number,
  daysOpen: number,
  classMetrics: { classAverage: number }
): number {
  const attendance = (daysPresent / daysOpen) * 100;
  
  if (attendance >= 85) return 0; // Good attendance
  if (attendance >= 75) return 20; // Warning
  if (attendance >= 60) return 60; // At-risk
  return 100; // Critical
}

// Helper: Risk Level
function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score < 25) return "LOW";
  if (score < 50) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}
```

### 3.2 Subject Analytics Engine
```typescript
// File: backend/src/analytics/subjectAnalytics.ts

interface SubjectAnalyticsInput {
  classId: string;
  sessionId: string;
  termId: string;
}

async function calculateSubjectAnalytics(
  input: SubjectAnalyticsInput
): Promise<SubjectAnalytics[]> {
  const students = await getStudentsWithResults(input);
  const subjects = await getClassSubjects(input.classId);
  
  return Promise.all(
    subjects.map(subject => computeSubjectMetrics(students, subject.id))
  );
}

function computeSubjectMetrics(
  students: StudentResult[],
  subjectId: string
): SubjectAnalytics {
  // Parse all student scores for this subject
  const scores = students.map(s => {
    const results = JSON.parse(s.subjectResults);
    return results[subjectId].total;
  });
  
  // Calculate statistics
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const median = getMedian(scores);
  const stdDev = getStdDeviation(scores, average);
  const passCount = scores.filter(s => s >= 60).length;
  const passRate = (passCount / scores.length) * 100;
  
  // Calculate assessment component breakdown
  const components = ["CA1", "CA2", "Project", "Exam"];
  const componentMetrics = components.map(comp => {
    const compScores = students.map(s => {
      const results = JSON.parse(s.subjectResults);
      return results[subjectId][comp];
    });
    return {
      component: comp,
      weight: getComponentWeight(comp),
      classAverage: getAverage(compScores),
      variance: getVariance(compScores)
    };
  });
  
  // Difficulty Index (1-10 scale)
  // High CA variance + Low exam variance = good teaching (low difficulty)
  // Low CA variance + High exam variance = hard teaching (high difficulty)
  const ca1_var = componentMetrics[0].variance;
  const ca2_var = componentMetrics[1].variance;
  const examVar = componentMetrics[3].variance;
  
  const difficultyIndex = Math.round(
    (examVar / (ca1_var + ca2_var + 1)) * 10
  );
  
  return {
    subjectId,
    classAverage: average,
    medianScore: median,
    stdDeviation: stdDev,
    passRate,
    difficultyIndex,
    distributionCurve: buildDistributionCurve(scores),
    assessmentComponentBreakdown: componentMetrics,
    trends: {
      ca1_to_ca2_change: componentMetrics[1].classAverage - componentMetrics[0].classAverage,
      ca_vs_exam_gap: componentMetrics[3].classAverage - ((componentMetrics[0].classAverage + componentMetrics[1].classAverage) / 2)
    }
  };
}

function buildDistributionCurve(scores: number[]): { range: string; count: number }[] {
  const ranges = ["F (0-40)", "E (40-50)", "D (50-60)", "C (60-70)", "B (70-80)", "A (80-90)", "A+ (90-100)"];
  
  return ranges.map(range => ({
    range,
    count: scores.filter(s => isInRange(s, range)).length
  }));
}
```

### 3.3 Attendance Impact Calculator
```typescript
// File: backend/src/analytics/attendanceImpact.ts

interface AttendanceImpactInput {
  classId: string;
}

async function analyzeAttendanceImpact(
  input: AttendanceImpactInput
): Promise<AttendanceImpactAnalysis> {
  const students = await getStudentsWithResultsAndAttendance(input.classId);
  const subjects = await getClassSubjects(input.classId);
  
  // Calculate overall correlation
  const overallCorrelation = calculatePearsonCorrelation(
    students.map(s => (s.daysPresent / s.daysSchoolOpen) * 100),
    students.map(s => s.overallAverage)
  );
  
  // Calculate per-subject impact
  const subjectImpact = subjects.map(subject => {
    const subjectScores = students.map(s => {
      const results = JSON.parse(s.subjectResults);
      return results[subject.id].total;
    });
    
    const correlation = calculatePearsonCorrelation(
      students.map(s => (s.daysPresent / s.daysSchoolOpen) * 100),
      subjectScores
    );
    
    // Impact per day = regression slope
    const impactPerDay = calculateRegressionSlope(
      students.map(s => (s.daysPresent / s.daysSchoolOpen) * 100),
      subjectScores
    );
    
    return {
      subjectId: subject.id,
      correlation,
      impactPerDay
    };
  });
  
  // Identify at-risk by attendance
  const atRiskByAttendance = students
    .filter(s => (s.daysPresent / s.daysSchoolOpen) < 0.75)
    .map(student => {
      const expectedAvg = calculateExpectedGrade(
        (student.daysPresent / student.daysSchoolOpen) * 100,
        overallCorrelation
      );
      const actualAvg = student.overallAverage;
      
      return {
        studentId: student.id,
        attendance: (student.daysPresent / student.daysSchoolOpen) * 100,
        expectedAverage: expectedAvg,
        actualAverage: actualAvg,
        gap: actualAvg - expectedAvg,
        recommendation: generateAttendanceRecommendation(student, expectedAvg)
      };
    });
  
  return {
    overallCorrelation,
    scatterPlotData: students.map(s => ({
      studentId: s.id,
      attendancePercentage: (s.daysPresent / s.daysSchoolOpen) * 100,
      averageGrade: s.overallAverage
    })),
    subjectImpact,
    atRiskByAttendance
  };
}

// Pearson Correlation Coefficient
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const mean_x = x.reduce((a, b) => a + b) / n;
  const mean_y = y.reduce((a, b) => a + b) / n;
  
  const numerator = x.reduce((sum, xi, i) => sum + (xi - mean_x) * (y[i] - mean_y), 0);
  const denom_x = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - mean_x, 2), 0));
  const denom_y = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - mean_y, 2), 0));
  
  return numerator / (denom_x * denom_y);
}

// Linear Regression Slope
function calculateRegressionSlope(x: number[], y: number[]): number {
  const n = x.length;
  const mean_x = x.reduce((a, b) => a + b) / n;
  const mean_y = y.reduce((a, b) => a + b) / n;
  
  const numerator = x.reduce((sum, xi, i) => sum + (xi - mean_x) * (y[i] - mean_y), 0);
  const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - mean_x, 2), 0);
  
  return numerator / denominator;
}
```

### 3.4 Student Progress Tracking
```typescript
// File: backend/src/analytics/studentProgress.ts

interface StudentProgressInput {
  studentId: string;
}

async function getStudentProgressAnalytics(
  input: StudentProgressInput
): Promise<StudentAnalytics> {
  const student = await getStudentWithAllResults(input.studentId);
  const classData = await getClassMetrics(student.classId);
  
  // Get results from all terms
  const allResults = await getStudentResultsByTerms(student.id);
  
  // Calculate term progress
  const termProgress = allResults.map(result => ({
    term: `${result.session}/${result.term}`,
    overallAverage: result.overallAverage,
    position: result.overallPosition,
    tier: getTier(result.overallAverage)
  }));
  
  // Subject performance over time
  const subjectPerformance = getUniqueSubjects(allResults).map(subject => {
    const subjectScores = allResults.map(result => {
      const scores = JSON.parse(result.subjectResults);
      return scores[subject].total;
    });
    
    return {
      subjectId: subject,
      term1: subjectScores[0] || 0,
      term2: subjectScores[1] || 0,
      term3: subjectScores[2] || 0,
      trend: getTrend(subjectScores),
      classPercentile: calculatePercentile(
        subjectScores[subjectScores.length - 1],
        classData[subject]
      ),
      remark: getSubjectRemark(subjectScores)
    };
  });
  
  // Affective & Psychomotor
  const latestResult = allResults[allResults.length - 1];
  const affective = JSON.parse(latestResult.affectiveDomain || "{}");
  const psychomotor = JSON.parse(latestResult.psychomotorDomain || "{}");
  
  return {
    studentId: student.id,
    termProgress,
    subjectPerformance,
    affectiveDomainScores: Object.entries(affective).map(([trait, score]) => ({
      trait,
      score: score as number
    })),
    psychomotorDomainScores: Object.entries(psychomotor).map(([skill, score]) => ({
      skill,
      score: score as number
    })),
    attendanceData: allResults.map(r => ({
      term: `${r.session}/${r.term}`,
      daysPresent: r.daysPresent,
      daysOpen: r.daysSchoolOpen,
      percentage: (r.daysPresent / r.daysSchoolOpen) * 100,
      trend: calculateTrend([...])
    })),
    strengths: identifyStrengths(subjectPerformance, affective, psychomotor),
    improvements: identifyImprovementAreas(subjectPerformance, affective, psychomotor),
    recommendations: generateRecommendations(subjectPerformance, termProgress)
  };
}

function getTrend(scores: number[]): "improving" | "stable" | "declining" {
  if (scores.length < 2) return "stable";
  
  const change = scores[scores.length - 1] - scores[0];
  if (change > 5) return "improving";
  if (change < -5) return "declining";
  return "stable";
}

function identifyStrengths(
  subjectPerf: any[],
  affective: any,
  psychomotor: any
): string[] {
  const strengths: string[] = [];
  
  // Top 2 subjects
  const topSubjects = subjectPerf.sort((a, b) => b.term3 - a.term3).slice(0, 2);
  topSubjects.forEach(s => {
    strengths.push(`Excellent in ${s.subjectId}`);
  });
  
  // High affective traits
  Object.entries(affective).forEach(([trait, score]) => {
    if (score >= 4) strengths.push(`Strong ${trait}`);
  });
  
  return strengths;
}
```

### 3.5 Class Comparison Engine
```typescript
// File: backend/src/analytics/classComparison.ts

interface ClassComparisonInput {
  classIds: string[];
}

async function compareClasses(
  input: ClassComparisonInput
): Promise<ClassComparison> {
  const classMetrics = await Promise.all(
    input.classIds.map(classId => getClassMetrics(classId))
  );
  
  const classComparison = classMetrics.map(metrics => ({
    classId: metrics.classId,
    className: metrics.className,
    metrics: {
      avgScore: metrics.average,
      passRate: metrics.passRate,
      medianScore: metrics.median,
      stdDeviation: metrics.stdDev,
      atRiskCount: metrics.atRiskCount,
      excellentCount: metrics.excellentCount
    }
  }));
  
  // Subject comparison
  const subjects = await getCommonSubjects(input.classIds);
  const subjectComparison = subjects.map(subject => {
    const classPerformance = input.classIds.map(classId => {
      const metrics = classMetrics.find(m => m.classId === classId);
      return {
        classId,
        avgScore: metrics.subjectMetrics[subject.id].average,
        rank: 0 // Will be calculated
      };
    });
    
    // Rank classes for this subject
    classPerformance.sort((a, b) => b.avgScore - a.avgScore);
    classPerformance.forEach((perf, idx) => perf.rank = idx + 1);
    
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      classPerformance
    };
  });
  
  // Generate insights
  const insights = generateComparisonInsights(classComparison, subjectComparison);
  
  return {
    classes: classComparison,
    subjectComparison,
    insights
  };
}

function generateComparisonInsights(
  classMetrics: any[],
  subjectComparison: any[]
): string[] {
  const insights: string[] = [];
  
  // Find struggling class
  const worstClass = classMetrics.reduce((min, c) => 
    c.metrics.avgScore < min.metrics.avgScore ? c : min
  );
  insights.push(`${worstClass.className} needs attention (Avg: ${worstClass.metrics.avgScore}%)`);
  
  // Subject variance
  subjectComparison.forEach(subject => {
    const scores = subject.classPerformance.map(c => c.avgScore);
    const variance = getVariance(scores);
    if (variance > 10) {
      insights.push(`${subject.subjectName} has large performance gap across classes`);
    }
  });
  
  return insights;
}
```

---

## 4. API ENDPOINTS

### 4.1 Analytics Endpoints
```
GET    /api/analytics/dashboard?sessionId=X&termId=Y
GET    /api/analytics/at-risk-students?classId=X
GET    /api/analytics/subject/:subjectId?classId=X
GET    /api/analytics/student/:studentId?sessionId=X
GET    /api/analytics/compare-classes?classIds=X,Y,Z
GET    /api/analytics/attendance-impact?classId=X
GET    /api/analytics/class-comparison?classId=X
GET    /api/analytics/export?type=pdf&reportType=dashboard
POST   /api/analytics/student-goal?studentId=X (Set goal for student)
```

---

## 5. DATA MODELS (NEW)

### Analytics Caching Table
```sqlite
CREATE TABLE analytics_cache (
  id TEXT PRIMARY KEY,
  classId TEXT,
  sessionId TEXT,
  termId TEXT,
  analyticsType TEXT, -- 'dashboard', 'subject', 'riskScore'
  cachedData JSON,
  calculatedAt DATETIME,
  expiresAt DATETIME,
  
  FOREIGN KEY (classId) REFERENCES classes(id)
);
```

### Student Goals Table
```sqlite
CREATE TABLE student_goals (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  goal TEXT, -- "Improve Math to Grade A"
  targetGrade FLOAT,
  subjectId TEXT,
  setDate DATETIME,
  targetDate DATETIME,
  status TEXT, -- 'active', 'achieved', 'abandoned'
  
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (subjectId) REFERENCES subjects(id)
);
```

---

## 6. IMPLEMENTATION PRIORITY

### Phase 1 (Week 1-2):
1. Dashboard Screen + KPI Logic
2. At-Risk Students Screen + Risk Score Engine
3. Subject Analytics Screen

### Phase 2 (Week 3-4):
4. Student Individual Report
5. Attendance Impact Analysis
6. Class Comparison

### Phase 3 (Week 5+):
7. Advanced visualizations (Radar charts, Heatmaps)
8. Goal tracking & notifications
9. Automated report generation

