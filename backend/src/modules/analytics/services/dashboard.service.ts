// Dashboard Service - Aggregate metrics for main dashboard
import { prisma } from '@config/database';
import { StatisticsUtils, getPerformanceTier } from '../utils/statistics.util';
import { DashboardData, SubjectSummary, TermMetric } from '../types/analytics.types';

export class DashboardService {
  /**
   * Get complete dashboard data for a class
   */
  static async getDashboardData(
    classId: string,
    sessionId: string,
    termId: string
  ): Promise<DashboardData> {
    // Get all current term results
    const currentResults = await prisma.studentResult.findMany({
      where: {
        classId,
        sessionId,
        termId,
      },
    });

    if (currentResults.length === 0) {
      return this.getEmptyDashboard();
    }

    // Get all subjects
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: { subject: true },
    });

    // Calculate overall metrics
    const averages = currentResults.map(r => r.overallAverage || 0);
    const passCount = averages.filter(a => a >= 60).length;
    const classAverage = StatisticsUtils.mean(averages);
    const passRate = (passCount / currentResults.length) * 100;

    // Student tier distribution
    const tierDistribution = {
      excellent: averages.filter(a => a >= 90).length,
      good: averages.filter(a => a >= 80 && a < 90).length,
      average: averages.filter(a => a >= 60 && a < 80).length,
      atRisk: averages.filter(a => a < 60).length,
    };

    // Subject summaries
    const subjectSummaries: SubjectSummary[] = classSubjects.map(cs => {
      const scores = currentResults.map(r => {
        const parsed = JSON.parse(r.subjectResults || '{}');
        return parsed[cs.subject.name]?.total || 0;
      });

      const subjectAvg = StatisticsUtils.mean(scores);
      const passCount = scores.filter(s => s >= 60).length;

      return {
        subjectId: cs.subjectId,
        subjectName: cs.subject.name,
        average: subjectAvg,
        passRate: (passCount / scores.length) * 100,
      };
    });

    // Sort for top and worst
    const sorted = [...subjectSummaries].sort((a, b) => b.average - a.average);
    const topSubjects = sorted.slice(0, 3);
    const worstSubjects = sorted.slice(-3).reverse();

    // Term trend (last 3 terms including current)
    const termTrend = await this.getTermTrend(classId, sessionId);

    return {
      classAverage,
      passRate,
      atRiskCount: tierDistribution.atRisk,
      excellenceCount: tierDistribution.excellent,
      topSubjects,
      worstSubjects,
      termTrend,
      studentTierDistribution: tierDistribution,
    };
  }

  /**
   * Get dashboard data for entire school (all classes)
   */
  static async getSchoolDashboardData(schoolId: string, sessionId: string, termId: string) {
    const classes = await prisma.class.findMany({
      where: { schoolId },
    });

    const dashboards = await Promise.all(
      classes.map(async c => {
        const data = await this.getDashboardData(c.id, sessionId, termId);
        return {
          classId: c.id,
          className: c.name,
          data,
        };
      })
    );

    // Aggregate
    const allAverages = dashboards.map(d => d.data.classAverage);
    const allPassRates = dashboards.map(d => d.data.passRate);
    const allAtRisk = dashboards.reduce((sum, d) => sum + d.data.atRiskCount, 0);

    return {
      schoolAverage: StatisticsUtils.mean(allAverages),
      schoolPassRate: StatisticsUtils.mean(allPassRates),
      totalAtRisk: allAtRisk,
      classDashboards: dashboards,
    };
  }

  // ============= PRIVATE HELPERS =============

  private static async getTermTrend(
    classId: string,
    sessionId: string
  ): Promise<TermMetric[]> {
    // Get terms for this session
    const session = await prisma.academicSession.findUnique({
      where: { id: sessionId },
      include: { terms: true },
    });

    if (!session || session.terms.length === 0) {
      return [];
    }

    const trend: TermMetric[] = [];

    for (const term of session.terms) {
      const results = await prisma.studentResult.findMany({
        where: {
          classId,
          sessionId,
          termId: term.id,
        },
      });

      if (results.length > 0) {
        const averages = results.map(r => r.overallAverage || 0);
        const passCount = averages.filter(a => a >= 60).length;

        trend.push({
          term: term.name,
          average: StatisticsUtils.mean(averages),
          passRate: (passCount / results.length) * 100,
          timestamp: term.startDate,
        });
      }
    }

    return trend;
  }

  private static getEmptyDashboard(): DashboardData {
    return {
      classAverage: 0,
      passRate: 0,
      atRiskCount: 0,
      excellenceCount: 0,
      topSubjects: [],
      worstSubjects: [],
      termTrend: [],
      studentTierDistribution: {
        excellent: 0,
        good: 0,
        average: 0,
        atRisk: 0,
      },
    };
  }
}
