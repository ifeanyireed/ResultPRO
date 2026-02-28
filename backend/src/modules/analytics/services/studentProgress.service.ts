// Student Progress Service - Track students across multiple terms
import { prisma } from '@config/database';
import { StatisticsUtils, getLetterGrade, getTrendDirection, percentageChange, getPerformanceTier } from '../utils/statistics.util';
import { StudentAnalytics } from '../types/analytics.types';
import { RiskScoreService } from './riskScore.service';

export class StudentProgressService {
  /**
   * Get comprehensive analytics for a single student
   */
  static async getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
    // Get all results for this student, last 3 terms
    const allResults = await prisma.studentResult.findMany({
      where: { studentId },
      orderBy: { createdAt: 'asc' },
      take: 3,
      include: {
        student: true,
        class: true,
      },
    });

    if (allResults.length === 0) {
      throw new Error(`No results found for student ${studentId}`);
    }

    const student = allResults[0].student;
    const latestResult = allResults[allResults.length - 1];

    // Term progress
    const termProgress = allResults.map((result: any, idx: number) => {
      const prevAvg = idx > 0 ? allResults[idx - 1].overallAverage || 0 : 0;
      const currentAvg = result.overallAverage || 0;

      return {
        term: `Term ${idx + 1}`,
        overallAverage: currentAvg,
        position: result.overallPosition || 0,
        tier: getPerformanceTier(currentAvg),
        change: idx === 0 ? 0 : percentageChange(prevAvg, currentAvg),
      };
    });

    // Get all subjects
    const allSubjectNames = new Set<string>();
    allResults.forEach(result => {
      const scores = JSON.parse(result.subjectResults || '{}');
      Object.keys(scores).forEach(s => allSubjectNames.add(s));
    });

    // Subject performance across terms
    // Pre-fetch latest term class scores to avoid await in map
    const latestSubjectScores = await prisma.studentResult.findMany({
      where: {
        classId: latestResult.classId,
        sessionId: latestResult.sessionId,
        termId: latestResult.termId,
      },
    });

    const subjectPerformance = Array.from(allSubjectNames).map(subjectName => {
      const scores = allResults.map(result => {
        const scores = JSON.parse(result.subjectResults || '{}');
        return scores[subjectName]?.total || 0;
      });

      // Get class average for latest term (already fetched above)
      const classScores = latestSubjectScores.map((r: any) => {
        const scores = JSON.parse(r.subjectResults || '{}');
        return scores[subjectName]?.total || 0;
      });

      const classAvg = StatisticsUtils.mean(classScores);
      const percentile = StatisticsUtils.percentileRank(scores[scores.length - 1], classScores);

      return {
        subjectId: '', // Would need subject ID mapping
        subjectName,
        term1: scores[0] || 0,
        term2: scores[1] || 0,
        term3: scores[2] || 0,
        trend: getTrendDirection(scores),
        classPercentile: percentile,
        remark: this.getSubjectRemark(scores[scores.length - 1], classAvg),
      };
    });

    // Affective domain
    const affective = JSON.parse(latestResult.affectiveDomain || '{}');
    const affectiveDomainScores = Object.entries(affective).map(([trait, score]) => ({
      trait,
      score: score as number,
    }));

    // Psychomotor domain
    const psychomotor = JSON.parse(latestResult.psychomotorDomain || '{}');
    const psychomotorDomainScores = Object.entries(psychomotor).map(([skill, score]) => ({
      skill,
      score: score as number,
    }));

    // Attendance data
    const attendanceData = allResults.map((result, idx) => {
      const prevAtt = idx > 0 ? (allResults[idx - 1].daysPresent / allResults[idx - 1].daysSchoolOpen) * 100 : 0;
      const currentAtt = (result.daysPresent / result.daysSchoolOpen) * 100;

      return {
        term: `Term ${idx + 1}`,
        daysPresent: result.daysPresent,
        daysOpen: result.daysSchoolOpen,
        percentage: currentAtt,
        trend: idx === 0 ? 'stable' as const : getTrendDirection([prevAtt, currentAtt]),
      };
    });

    // Identify strengths and weaknesses
    const latestScores = JSON.parse(latestResult.subjectResults || '{}');
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(latestScores).forEach(([subject, data]: [string, any]) => {
      if ((data.total || 0) >= 80) {
        strengths.push(`Strong performer in ${subject} (${Math.round(data.total)}%)`);
      } else if ((data.total || 0) < 60) {
        weaknesses.push(`Struggling in ${subject} (${Math.round(data.total)}%)`);
      }
    });

    // High affective traits
    Object.entries(affective).forEach(([trait, score]: [string, any]) => {
      if (score >= 4) {
        strengths.push(`Excellent ${trait}`);
      } else if (score <= 2) {
        weaknesses.push(`Needs improvement in ${trait}`);
      }
    });

    // Calculate risk score
    const classMetrics = await this.getClassMetrics(latestResult.classId, latestResult.sessionId, latestResult.termId);
    const riskScore = await RiskScoreService.calculateStudentRiskScore(
      latestResult,
      classMetrics,
      allResults.slice(0, -1)
    );

    // Recommendations
    const recommendations = this.generateRecommendations(
      termProgress,
      subjectPerformance,
      attendanceData,
      riskScore.factors
    );

    return {
      studentId,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      termProgress,
      subjectPerformance,
      affectiveDomainScores,
      psychomotorDomainScores,
      attendanceData,
      strengths,
      weaknesses,
      recommendations,
      riskScore: riskScore.riskScore,
      riskLevel: riskScore.riskLevel,
    };
  }

  // ============= PRIVATE HELPERS =============

  private static getSubjectRemark(score: number, classAvg: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) {
      return score > classAvg ? 'Satisfactory' : 'Below Average';
    }
    return 'Needs Improvement';
  }

  private static generateRecommendations(
    termProgress: any[],
    subjectPerformance: any[],
    attendanceData: any[],
    factors: any
  ): string[] {
    const recommendations: string[] = [];

    // Overall trend
    if (termProgress.length >= 2) {
      const latestChange = termProgress[termProgress.length - 1].change;
      if (latestChange > 5) {
        recommendations.push('✓ Excellent improvement trend - maintain momentum');
      } else if (latestChange < -5) {
        recommendations.push('⚠ Declining trend - need to investigate causes');
      }
    }

    // Subject-specific
    const weakSubjects = subjectPerformance.filter(s => (s.term3 || 0) < 60);
    if (weakSubjects.length > 0) {
      recommendations.push(`Focus on: ${weakSubjects.map(s => s.subjectName).join(', ')}`);
    }

    const strengths = subjectPerformance.filter(s => (s.term3 || 0) >= 85);
    if (strengths.length > 0) {
      recommendations.push(`Leverage strengths in ${strengths.map(s => s.subjectName).join(', ')}`);
    }

    // Attendance
    const latestAtt = attendanceData[attendanceData.length - 1];
    if ((latestAtt.percentage || 0) < 75) {
      recommendations.push('Improve attendance - missing classes impacts grades');
    }

    // Risk factors
    if (factors.lowAverageScore.triggered) {
      recommendations.push('Performance is below class average - consider tutoring');
    }

    return recommendations;
  }

  private static async getClassMetrics(classId: string, sessionId: string, termId: string) {
    const results = await prisma.studentResult.findMany({
      where: {
        classId,
        sessionId,
        termId,
      },
    });

    const averages = results.map(r => r.overallAverage || 0);

    return {
      average: StatisticsUtils.mean(averages),
      median: StatisticsUtils.median(averages),
      stdDev: StatisticsUtils.stdDeviation(averages),
    };
  }
}
