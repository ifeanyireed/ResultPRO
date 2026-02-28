// Attendance Impact Service - Analyze attendance vs performance correlation
import { prisma } from '@config/database';
import { StatisticsUtils } from '../utils/statistics.util';
import { AttendanceImpactAnalysis } from '../types/analytics.types';

export class AttendanceImpactService {
  /**
   * Analyze attendance impact on academic performance
   */
  static async analyzeAttendanceImpact(
    classId: string,
    sessionId: string,
    termId: string
  ): Promise<AttendanceImpactAnalysis> {
    // Get all students with results
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

    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: { subject: true },
    });

    // Extract attendance and grade data
    const attendancePercentages = results.map(r =>
      r.daysSchoolOpen > 0 ? (r.daysPresent / r.daysSchoolOpen) * 100 : 0
    );
    const averageGrades = results.map(r => r.overallAverage || 0);

    // Overall correlation
    const overallCorrelation = StatisticsUtils.pearsonCorrelation(
      attendancePercentages,
      averageGrades
    );

    // Scatter plot data
    const scatterPlotData = results.map((r, idx) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      attendancePercentage: attendancePercentages[idx],
      averageGrade: averageGrades[idx],
    }));

    // Per-subject impact
    const subjectImpact = classSubjects.map(cs => {
      const subjectScores = results.map(r => {
        const scores = JSON.parse(r.subjectResults || '{}');
        return scores[cs.subject.name]?.total || 0;
      });

      const correlation = StatisticsUtils.pearsonCorrelation(
        attendancePercentages,
        subjectScores
      );

      const impactPerDay = StatisticsUtils.regressionSlope(
        attendancePercentages,
        subjectScores
      );

      return {
        subjectId: cs.subjectId,
        subjectName: cs.subject.name,
        correlation,
        impactPerDay: impactPerDay / 100, // Convert to % per day
      };
    });

    // Identify at-risk by attendance
    const atRiskByAttendance = results
      .filter(r => {
        const att = r.daysSchoolOpen > 0 ? (r.daysPresent / r.daysSchoolOpen) * 100 : 0;
        return att < 75;
      })
      .map((r, idx) => {
        const attendance = attendancePercentages[results.indexOf(r)];
        const expectedGrade = this.calculateExpectedGrade(
          attendance,
          overallCorrelation,
          StatisticsUtils.mean(averageGrades)
        );
        const actualGrade = r.overallAverage || 0;
        const gap = actualGrade - expectedGrade;

        return {
          studentId: r.studentId,
          studentName: r.studentName,
          attendance,
          expectedAverage: expectedGrade,
          actualAverage: actualGrade,
          gap,
          recommendation: this.generateAttendanceRecommendation(
            r,
            attendance,
            gap,
            expectedGrade
          ),
        };
      });

    return {
      overallCorrelation,
      correlationStrength: StatisticsUtils.getCorrelationStrength(overallCorrelation),
      scatterPlotData,
      subjectImpact,
      atRiskByAttendance,
    };
  }

  // ============= PRIVATE HELPERS =============

  private static calculateExpectedGrade(
    attendance: number,
    correlation: number,
    classAverage: number
  ): number {
    // Simple linear estimation based on correlation
    if (Math.abs(correlation) < 0.1) return classAverage;

    // At 100% attendance, student should be near average
    // At 0% attendance, student should score much lower
    const expectedAtThisAttendance = classAverage * (attendance / 100) * (1 + Math.abs(correlation));
    return Math.max(0, Math.min(100, expectedAtThisAttendance));
  }

  private static generateAttendanceRecommendation(
    student: any,
    attendance: number,
    gap: number,
    expectedGrade: number
  ): string {
    if (attendance < 50) {
      return 'CRITICAL: Extremely low attendance - immediate parental intervention required';
    } else if (attendance < 65) {
      return `Low attendance (${Math.round(attendance)}%) is significantly impacting performance. Expected grade: ${Math.round(expectedGrade)}%`;
    } else if (gap < -10) {
      return `Attendance is reasonable but performing below expected. Consider additional support.`;
    } else {
      return `Attendance adequate. Monitor to ensure consistency.`;
    }
  }
}
