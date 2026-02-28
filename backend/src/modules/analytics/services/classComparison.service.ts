// Class Comparison Service - Compare performance across classes
import { prisma } from '@config/database';
import { StatisticsUtils } from '../utils/statistics.util';
import { ClassComparison } from '../types/analytics.types';

export class ClassComparisonService {
  /**
   * Compare multiple classes
   */
  static async compareClasses(
    classIds: string[],
    sessionId: string,
    termId: string
  ): Promise<ClassComparison> {
    // Get metrics for each class
    const classMetrics = await Promise.all(
      classIds.map(classId => this.getClassMetrics(classId, sessionId, termId))
    );

    const classes = await Promise.all(
      classIds.map(async (classId, idx) => {
        const classData = await prisma.class.findUnique({
          where: { id: classId },
        });

        const metrics = classMetrics[idx];

        return {
          classId,
          className: classData?.name || 'Unknown',
          metrics,
        };
      })
    );

    // Subject comparison
    const allSubjectsSet = new Set<string>();
    for (const classId of classIds) {
      const classSubjects = await prisma.classSubject.findMany({
        where: { classId },
        include: { subject: true },
      });

      classSubjects.forEach(cs => allSubjectsSet.add(cs.subject.name));
    }

    const subjectComparison = await Promise.all(
      Array.from(allSubjectsSet).map(async subjectName => {
        const classPerformance = [];

        for (let i = 0; i < classIds.length; i++) {
          const classId = classIds[i];
          const results = await prisma.studentResult.findMany({
            where: {
              classId,
              sessionId,
              termId,
            },
          });

          const scores = results.map(r => {
            const parsed = JSON.parse(r.subjectResults || '{}');
            return parsed[subjectName]?.total || 0;
          });

          const avgScore = StatisticsUtils.mean(scores);

          classPerformance.push({
            classId,
            className: classes[i].className,
            avgScore,
            rank: 0,
          });
        }

        // Rank classes for this subject
        classPerformance.sort((a, b) => b.avgScore - a.avgScore);
        classPerformance.forEach((perf, idx) => {
          perf.rank = idx + 1;
        });

        // Find subject ID
        const subjectRecord = await prisma.subject.findFirst({
          where: { name: subjectName },
        });

        return {
          subjectId: subjectRecord?.id || '',
          subjectName,
          classPerformance,
        };
      })
    );

    // Generate insights
    const insights = this.generateComparisonInsights(classes, subjectComparison);

    return {
      classes,
      subjectComparison,
      insights,
    };
  }

  // ============= PRIVATE HELPERS =============

  private static async getClassMetrics(
    classId: string,
    sessionId: string,
    termId: string
  ) {
    const results = await prisma.studentResult.findMany({
      where: {
        classId,
        sessionId,
        termId,
      },
    });

    const averages = results.map(r => r.overallAverage || 0);
    const passCount = averages.filter(a => a >= 60).length;
    const excellenceCount = averages.filter(a => a >= 85).length;
    const atRiskCount = averages.filter(a => a < 60).length;

    return {
      avgScore: StatisticsUtils.mean(averages),
      passRate: results.length > 0 ? (passCount / results.length) * 100 : 0,
      medianScore: StatisticsUtils.median(averages),
      stdDeviation: StatisticsUtils.stdDeviation(averages),
      atRiskCount,
      excellentCount: excellenceCount,
    };
  }

  private static generateComparisonInsights(classes: any[], subjectComparison: any[]): string[] {
    const insights: string[] = [];

    // Best and worst performing class
    const sorted = [...classes].sort((a, b) => b.metrics.avgScore - a.metrics.avgScore);
    if (sorted.length > 0) {
      insights.push(`${sorted[0].className} leading with avg ${Math.round(sorted[0].metrics.avgScore)}%`);
    }
    if (sorted.length > 1) {
      insights.push(`${sorted[sorted.length - 1].className} needs support (avg ${Math.round(sorted[sorted.length - 1].metrics.avgScore)}%)`);
    }

    // Subject performance gaps
    subjectComparison.forEach(subject => {
      const scores = subject.classPerformance.map((c: any) => c.avgScore);
      const max = Math.max(...scores);
      const min = Math.min(...scores);
      const gap = max - min;

      if (gap > 15) {
        insights.push(`${subject.subjectName}: Large variance across classes (gap: ${Math.round(gap)}%)`);
      }
    });

    // Pass rate comparison
    const passRates = classes.map(c => c.metrics.passRate);
    if (Math.max(...passRates) - Math.min(...passRates) > 20) {
      insights.push('Significant pass rate variation - some classes need intervention');
    }

    return insights;
  }
}
