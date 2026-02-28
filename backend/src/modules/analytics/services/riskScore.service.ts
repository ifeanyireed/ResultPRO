// Risk Score Service - Calculate at-risk student scores
import { prisma } from '@config/database';
import { StatisticsUtils, getLetterGrade, percentageChange } from '../utils/statistics.util';
import { RiskScore } from '../types/analytics.types';

export class RiskScoreService {
  /**
   * Calculate risk score for a single student
   */
  static async calculateStudentRiskScore(
    studentResult: any,
    classMetrics: { average: number; median: number; stdDev: number },
    historicalResults: any[]
  ): Promise<RiskScore> {
    // Parse subject results
    const subjectResults = JSON.parse(studentResult.subjectResults || '{}');
    const affective = JSON.parse(studentResult.affectiveDomain || '{}');
    const psychomotor = JSON.parse(studentResult.psychomotorDomain || '{}');

    // 1. Low Average Score Factor (Weight: 35%)
    const lowAvgFactor = this.calculateLowAverageFactor(
      studentResult.overallAverage,
      classMetrics.average,
      classMetrics.stdDev
    );

    // 2. Declining Trend Factor (Weight: 25%)
    const decliningFactor = this.calculateDecliningTrendFactor(
      studentResult.overallAverage,
      historicalResults
    );

    // 3. Low Attendance Factor (Weight: 20%)
    const attendanceFactor = this.calculateAttendanceFactor(
      studentResult.daysPresent,
      studentResult.daysSchoolOpen
    );

    // 4. Weak Subjects Factor (Weight: 15%)
    const weakSubjectsFactor = this.calculateWeakSubjectsFactor(subjectResults);

    // 5. Missing Assessments Factor (Weight: 5%)
    const missingAssessmentsFactor = this.calculateMissingAssessmentsFactor(
      subjectResults
    );

    // Weighted sum
    const riskScore = 
      (lowAvgFactor * 0.35) +
      (decliningFactor * 0.25) +
      (attendanceFactor * 0.20) +
      (weakSubjectsFactor * 0.15) +
      (missingAssessmentsFactor * 0.05);

    const riskLevel = this.getRiskLevel(riskScore);
    const recommendations = this.generateRecommendations(
      riskScore,
      {
        lowAvgFactor,
        decliningFactor,
        attendanceFactor,
        weakSubjectsFactor,
        missingAssessmentsFactor,
      },
      studentResult,
      subjectResults
    );

    return {
      studentId: studentResult.studentId,
      studentName: studentResult.studentName,
      riskScore: Math.round(riskScore),
      riskLevel,
      currentAverage: studentResult.overallAverage || 0,
      classAverage: classMetrics.average,
      factors: {
        lowAverageScore: {
          triggered: lowAvgFactor > 20,
          weight: 0.35,
          score: lowAvgFactor,
        },
        decliningTrend: {
          triggered: decliningFactor > 20,
          weight: 0.25,
          score: decliningFactor,
        },
        lowAttendance: {
          triggered: attendanceFactor > 20,
          weight: 0.20,
          score: attendanceFactor,
          gapDays: studentResult.daysSchoolOpen - studentResult.daysPresent,
        },
        weakSubjects: {
          triggered: weakSubjectsFactor > 20,
          weight: 0.15,
          score: weakSubjectsFactor,
          subjects: this.getWeakSubjects(subjectResults),
        },
        missingAssessments: {
          triggered: missingAssessmentsFactor > 20,
          weight: 0.05,
          score: missingAssessmentsFactor,
        },
      },
      recommendations,
    };
  }

  /**
   * Calculates risk for all students in a class
   */
  static async calculateClassRiskScores(classId: string, sessionId: string, termId: string) {
    try {
      // Get all students in class with results
      const results = await prisma.studentResult.findMany({
        where: {
          classId,
          sessionId,
          termId,
        },
        include: {
          student: true,
        },
      });

      if (results.length === 0) {
        return [];
      }

      // Calculate class metrics
      const averages = results.map((r: any) => r.overallAverage || 0);
      const classMetrics = {
        average: StatisticsUtils.mean(averages),
        median: StatisticsUtils.median(averages),
        stdDev: StatisticsUtils.stdDeviation(averages),
      };

      // Get historical data for each student
      const riskScores: RiskScore[] = [];

      for (const result of results) {
        const historicalResults = await prisma.studentResult.findMany({
          where: {
            studentId: result.studentId,
            NOT: {
              id: result.id,
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 3, // Last 3 terms
        });

        const riskScore = await this.calculateStudentRiskScore(
          result,
          classMetrics,
          historicalResults
        );

        riskScores.push(riskScore);
      }

      // Sort by risk score descending
      return riskScores.sort((a, b) => b.riskScore - a.riskScore);
    } catch (error) {
      console.error('Error calculating class risk scores:', error);
      throw error;
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  private static calculateLowAverageFactor(
    studentAvg: number,
    classAvg: number,
    stdDev: number
  ): number {
    if (studentAvg >= classAvg) return 0; // Above average = no risk

    const gap = classAvg - studentAvg;
    const threshold = stdDev * 1.5; // 1.5 standard deviations below mean

    if (gap <= 0) return 0;
    if (gap >= threshold) return 100; // Very far below mean

    return (gap / threshold) * 100;
  }

  private static calculateDecliningTrendFactor(
    currentAvg: number,
    historicalResults: any[]
  ): number {
    if (historicalResults.length === 0) return 0;

    const previousAvg = historicalResults[historicalResults.length - 1].overallAverage || 0;
    const change = previousAvg - currentAvg;

    if (change <= 0) return 0; // Not declining
    if (change > 20) return 100; // Significant decline

    return (change / 20) * 100;
  }

  private static calculateAttendanceFactor(
    daysPresent: number,
    daysOpen: number
  ): number {
    const attendance = daysOpen > 0 ? (daysPresent / daysOpen) * 100 : 0;

    if (attendance >= 85) return 0; // Good
    if (attendance >= 75) return 20; // Warning
    if (attendance >= 60) return 60; // At-risk
    if (attendance >= 40) return 85; // Critical
    return 100; // Very critical
  }

  private static calculateWeakSubjectsFactor(subjectResults: any): number {
    if (!subjectResults || Object.keys(subjectResults).length === 0) return 0;

    const subjects = Object.values(subjectResults) as any[];
    const failingSubjects = subjects.filter(s => (s.total || 0) < 60).length;
    const totalSubjects = subjects.length;

    if (failingSubjects === 0) return 0;
    if (failingSubjects >= totalSubjects / 2) return 100; // Failing half or more

    return (failingSubjects / totalSubjects) * 100;
  }

  private static calculateMissingAssessmentsFactor(subjectResults: any): number {
    if (!subjectResults || Object.keys(subjectResults).length === 0) return 0;

    const subjects = Object.values(subjectResults) as any[];
    let missingCount = 0;

    for (const subject of subjects) {
      if (!subject.ca1 || !subject.ca2 || !subject.exam) {
        missingCount++;
      }
    }

    if (missingCount === 0) return 0;
    return (missingCount / subjects.length) * 100;
  }

  private static getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  }

  private static getWeakSubjects(subjectResults: any): string[] {
    if (!subjectResults) return [];

    const weak: string[] = [];
    Object.entries(subjectResults).forEach(([subject, data]: [string, any]) => {
      if ((data.total || 0) < 60) {
        weak.push(subject);
      }
    });

    return weak;
  }

  private static generateRecommendations(
    riskScore: number,
    factors: any,
    studentResult: any,
    subjectResults: any
  ): string[] {
    const recommendations: string[] = [];

    // Based on score
    if (riskScore >= 75) {
      recommendations.push('Urgent intervention needed - require meeting with parents');
      recommendations.push('Consider peer tutoring program immediately');
    } else if (riskScore >= 50) {
      recommendations.push('Schedule academic consultation with student');
      recommendations.push('Monitor progress weekly');
    } else if (riskScore >= 25) {
      recommendations.push('Provide additional support materials');
    }

    // Specific factor-based recommendations
    if (factors.lowAvgFactor > 40) {
      recommendations.push('Overall performance is significantly below class average');
    }

    if (factors.decliningFactor > 40) {
      recommendations.push('Grade trend is declining - identify root cause');
      recommendations.push('Increase teacher engagement and feedback');
    }

    if (factors.attendanceFactor > 40) {
      recommendations.push(`Attendance is low (${Math.round((studentResult.daysPresent / studentResult.daysSchoolOpen) * 100)}%) - address absenteeism`);
      recommendations.push('Engage with parents regarding attendance');
    }

    if (factors.weakSubjectsFactor > 40) {
      const weakSubjects = this.getWeakSubjects(subjectResults);
      recommendations.push(`Struggling in: ${weakSubjects.join(', ')}`);
      recommendations.push(`Subject-specific tutoring recommended for: ${weakSubjects.slice(0, 2).join(', ')}`);
    }

    return recommendations;
  }
}
