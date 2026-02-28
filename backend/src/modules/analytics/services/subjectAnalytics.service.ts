// Subject Analytics Service - Analyze subject performance
import { prisma } from '@config/database';
import { StatisticsUtils, getLetterGrade } from '../utils/statistics.util';
import { SubjectAnalytics, DistributionBracket } from '../types/analytics.types';

export class SubjectAnalyticsService {
  /**
   * Get detailed analytics for a specific subject
   */
  static async getSubjectAnalytics(
    classId: string,
    subjectId: string,
    sessionId: string,
    termId: string
  ): Promise<SubjectAnalytics> {
    // Get all student results for this class/subject/term
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

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new Error(`Subject ${subjectId} not found`);
    }

    // Extract scores for this subject
    const subjectScores = results
      .map(result => {
        const scores = JSON.parse(result.subjectResults || '{}');
        return scores[subject.name] || null;
      })
      .filter(s => s !== null);

    // Get total scores
    const totalScores = subjectScores.map(s => s.total || 0);
    const studentScores = results.map(result => {
      const scores = JSON.parse(result.subjectResults || '{}');
      const subjectData = scores[subject.name];
      if (!subjectData) return null;

      return {
        studentId: result.studentId,
        studentName: result.studentName,
        grade: getLetterGrade(subjectData.total || 0),
        score: subjectData.total || 0,
        ca1: subjectData.ca1 || 0,
        ca2: subjectData.ca2 || 0,
        project: subjectData.project || 0,
        exam: subjectData.exam || 0,
      };
    }).filter(s => s !== null);

    // Calculate statistics
    const classAverage = StatisticsUtils.mean(totalScores);
    const medianScore = StatisticsUtils.median(totalScores);
    const stdDev = StatisticsUtils.stdDeviation(totalScores);
    
    const passCount = totalScores.filter(s => s >= 60).length;
    const failCount = totalScores.length - passCount;
    const passRate = totalScores.length > 0 ? (passCount / totalScores.length) * 100 : 0;

    // Component analysis
    const componentMetrics = this.analyzeComponents(subjectScores, results);

    // Distribution curve
    const distributionCurve = this.buildDistributionCurve(totalScores);

    // Difficulty index
    const difficultyIndex = this.calculateDifficultyIndex(componentMetrics);

    // Trends
    const trends = {
      ca1_to_ca2_change: componentMetrics.find(c => c.component === 'CA2')!.classAverage - 
                        componentMetrics.find(c => c.component === 'CA1')!.classAverage,
      ca_vs_exam_gap: componentMetrics.find(c => c.component === 'Exam')!.classAverage -
                     ((componentMetrics.find(c => c.component === 'CA1')!.classAverage +
                       componentMetrics.find(c => c.component === 'CA2')!.classAverage) / 2),
    };

    return {
      subjectId,
      subjectName: subject.name,
      classAverage,
      medianScore,
      stdDeviation: stdDev,
      passRate,
      failCount,
      distributionCurve,
      assessmentComponentBreakdown: componentMetrics,
      difficultyIndex,
      trends,
      studentPerformance: studentScores as any,
    };
  }

  /**
   * Get analytics for all subjects in a class
   */
  static async getClassSubjectsAnalytics(
    classId: string,
    sessionId: string,
    termId: string
  ) {
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: { subject: true },
    });

    const analytics = await Promise.all(
      classSubjects.map(cs =>
        this.getSubjectAnalytics(classId, cs.subjectId, sessionId, termId)
      )
    );

    // Sort by average descending
    return analytics.sort((a, b) => b.classAverage - a.classAverage);
  }

  // ============= PRIVATE HELPERS =============

  private static analyzeComponents(subjectScores: any[], results: any[]) {
    const components = ['CA1', 'CA2', 'Project', 'Exam'];
    const weights: Record<string, number> = {
      'CA1': 0.2,
      'CA2': 0.2,
      'Project': 0.1,
      'Exam': 0.5,
    };

    return components.map(comp => {
      const componentScores = subjectScores
        .map(s => s[comp] || 0)
        .filter(s => s > 0);

      const classAverage = StatisticsUtils.mean(componentScores);
      const variance = StatisticsUtils.variance(componentScores);

      return {
        component: comp,
        weight: weights[comp],
        classAverage,
        variance,
      };
    });
  }

  private static buildDistributionCurve(scores: number[]): DistributionBracket[] {
    const brackets = [
      { range: 'F (0-40)', min: 0, max: 40 },
      { range: 'E (40-50)', min: 40, max: 50 },
      { range: 'D (50-60)', min: 50, max: 60 },
      { range: 'C (60-70)', min: 60, max: 70 },
      { range: 'B (70-80)', min: 70, max: 80 },
      { range: 'A (80-90)', min: 80, max: 90 },
      { range: 'A+ (90-100)', min: 90, max: 100 },
    ];

    const total = scores.length;

    return brackets.map(bracket => {
      const count = scores.filter(
        s => s >= bracket.min && s <= bracket.max
      ).length;

      return {
        range: bracket.range,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      };
    });
  }

  private static calculateDifficultyIndex(componentMetrics: any[]): number {
    // High exam variance + low CA variance = difficult
    // Low exam variance + high CA variance = easy

    const ca1 = componentMetrics.find(c => c.component === 'CA1');
    const ca2 = componentMetrics.find(c => c.component === 'CA2');
    const exam = componentMetrics.find(c => c.component === 'Exam');

    const caAvgVariance = (ca1.variance + ca2.variance) / 2;
    const ratio = exam.variance / (caAvgVariance + 0.1); // Avoid division by zero

    // Convert to 1-10 scale
    if (ratio > 2) return 10; // Very difficult
    if (ratio > 1.5) return 8;
    if (ratio > 1) return 6;
    if (ratio > 0.5) return 4;
    return 2; // Easy
  }
}
