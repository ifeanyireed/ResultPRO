// Teacher Analytics Service - Class and student analytics for teachers
import { prisma } from '@config/database';
import {
  StatisticsUtils,
  getLetterGrade,
  getPerformanceTier,
} from '../utils/statistics.util';
import { RiskScoreService } from './riskScore.service';
import { SubjectAnalyticsService } from './subjectAnalytics.service';

export class TeacherAnalyticsService {
  /**
   * Get all classes for a teacher
   */
  static async getTeacherClasses(userId: string) {
    try {
      const teacher = await prisma.schoolAdminUser.findUnique({
        where: { id: userId },
        include: {
          school: true,
        },
      });

      if (!teacher) {
        throw new Error('Teacher profile not found');
      }

      const classes = await prisma.class.findMany({
        where: { schoolId: teacher.schoolId },
      });

      return classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        classTeacher: cls.classTeacher,
        schoolId: cls.schoolId,
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get comprehensive class overview
   */
  static async getClassOverview(classId: string, sessionId: string, termId: string) {
    try {
      const classData = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classData) {
        throw new Error('Class not found');
      }

      // Get all results for this class/session/term
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
        return {
          className: classData.name,
          classSize: 0,
          classAverage: 0,
          medianScore: 0,
          stdDeviation: 0,
          passRate: 0,
          failCount: 0,
          gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
          subjectStats: [],
          attendanceStats: { averageAttendance: 0, absentCount: 0 },
          affectiveStats: {},
          psychomotorStats: {},
        };
      }

      // Overall statistics
      const overallScores = results
        .map((r) => r.overallAverage || 0)
        .filter((s) => s > 0);
      const classAverage = StatisticsUtils.mean(overallScores);
      const medianScore = StatisticsUtils.median(overallScores);
      const stdDev = StatisticsUtils.stdDeviation(overallScores);

      // Grade distribution
      const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
      results.forEach((r) => {
        const grade = getLetterGrade(r.overallAverage || 0);
        gradeDistribution[grade as keyof typeof gradeDistribution]++;
      });

      const passCount = overallScores.filter((s) => s >= 60).length;
      const passRate = (passCount / results.length) * 100;

      // Subject statistics
      const subjectStats = await this.analyzeClassSubjects(results);

      // Attendance statistics
      const attendanceStats = {
        averageAttendance:
          StatisticsUtils.mean(results.map((r) => r.daysPresent || 0)) /
          StatisticsUtils.mean(results.map((r) => r.daysSchoolOpen || 1)),
        absentCount: results.reduce(
          (sum, r) => sum + ((r.daysSchoolOpen || 0) - (r.daysPresent || 0)),
          0
        ),
      };

      // Affective domain aggregates
      const affectiveStats = this.aggregateDomain(
        results,
        'affectiveDomain'
      );

      // Psychomotor domain aggregates
      const psychomotorStats = this.aggregateDomain(
        results,
        'psychomotorDomain'
      );

      return {
        className: classData.name,
        classSize: results.length,
        classAverage,
        medianScore,
        stdDeviation: stdDev,
        passRate,
        failCount: results.length - passCount,
        gradeDistribution,
        subjectStats,
        attendanceStats,
        affectiveStats,
        psychomotorStats,
        trend: 'stable', // calculated from previous terms if available
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Analyze performance by subject for a class
   */
  private static async analyzeClassSubjects(results: any[]) {
    const subjectMap: Record<string, any[]> = {};

    results.forEach((result) => {
      const subjectResults = JSON.parse(result.subjectResults || '{}');
      Object.entries(subjectResults).forEach(([subjectName, data]: any) => {
        if (!subjectMap[subjectName]) {
          subjectMap[subjectName] = [];
        }
        subjectMap[subjectName].push(data);
      });
    });

    return Object.entries(subjectMap).map(([subjectName, scores]: any[]) => {
      const totalScores: number[] = scores.map((s: any) => s.total || 0);
      const classAverage = StatisticsUtils.mean(totalScores);
      const passCount = totalScores.filter((s: number) => s >= 60).length;
      const passRate = (passCount / scores.length) * 100;

      // CA vs Exam analysis
      const ca1Avg = StatisticsUtils.mean(scores.map((s: any) => s.ca1 || 0));
      const ca2Avg = StatisticsUtils.mean(scores.map((s: any) => s.ca2 || 0));
      const examAvg = StatisticsUtils.mean(scores.map((s: any) => s.exam || 0));

      return {
        subjectName,
        classAverage,
        passRate,
        failCount: scores.length - passCount,
        assessment: {
          ca1: ca1Avg,
          ca2: ca2Avg,
          exam: examAvg,
          caAverage: (ca1Avg + ca2Avg) / 2,
        },
        difficulty:
          passRate < 40
            ? 'high'
            : passRate < 70
              ? 'medium'
              : 'low',
      };
    });
  }

  /**
   * Get list of at-risk students for a class
   */
  static async getAtRiskStudents(classId: string, sessionId: string, termId: string) {
    try {
      const results = await prisma.studentResult.findMany({
        where: {
          classId,
          sessionId,
          termId,
        },
        include: {
          student: true,
          class: true,
        },
      });

      // Calculate risk for each student
      const studentRisks = await Promise.all(
        results.map(async (result) => {
          const classAverages = results.map((r) => r.overallAverage || 0);
          const classMetrics = {
            average: StatisticsUtils.mean(classAverages),
            median: StatisticsUtils.median(classAverages),
            stdDev: StatisticsUtils.stdDeviation(classAverages),
          };

          const riskScore = await RiskScoreService.calculateStudentRiskScore(
            result,
            classMetrics,
            []
          );

          const subjectResults = JSON.parse(result.subjectResults || '{}');
          const failingSubjects = Object.entries(subjectResults)
            .filter(([_, data]: any) => (data.total || 0) < 60)
            .map(([name]) => name);

          return {
            studentId: result.studentId,
            studentName: result.student.name,
            admissionNumber: result.student.admissionNumber,
            overallAverage: result.overallAverage || 0,
            attendance: result.daysPresent
              ? (result.daysPresent / (result.daysSchoolOpen || 1)) * 100
              : 0,
            riskScore: riskScore.riskScore,
            riskLevel: riskScore.riskLevel,
            riskFactors: Object.keys(riskScore.factors || {}),
            failingSubjects,
            position: result.overallPosition || 0,
            classSize: results.length,
          };
        })
      );

      // Sort by risk score
      return studentRisks.sort((a, b) => b.riskScore - a.riskScore);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get detailed student performance
   */
  static async getStudentDetail(studentId: string, sessionId: string, termId: string) {
    try {
      const result = await prisma.studentResult.findFirst({
        where: {
          studentId,
          sessionId,
          termId,
        },
        include: {
          student: {
            include: {
              parent: {
                include: {
                  user: true,
                },
              },
            },
          },
          class: true,
        },
      });

      if (!result) {
        throw new Error('Student result not found');
      }

      const subjectResults = JSON.parse(result.subjectResults || '{}');
      const affective = JSON.parse(result.affectiveDomain || '{}');
      const psychomotor = JSON.parse(result.psychomotorDomain || '{}');

      // Get class statistics for comparison
      const classResults = await prisma.studentResult.findMany({
        where: {
          classId: result.classId,
          sessionId,
          termId,
        },
      });

      const classAverages = classResults.map((r) => r.overallAverage || 0);

      // Subject breakdown
      const subjects = Object.entries(subjectResults).map(([name, data]: any) => ({
        name,
        score: data.total || 0,
        grade: getLetterGrade(data.total || 0),
        ca1: data.ca1 || 0,
        ca2: data.ca2 || 0,
        exam: data.exam || 0,
        project: data.project || 0,
        classAverage: data.classAverage || 0,
      }));

      return {
        studentName: result.student.name,
        admissionNumber: result.student.admissionNumber,
        className: result.class.name,
        parentContact: result.student.parent?.user?.email || result.student.parentEmail || '',
        overallAverage: result.overallAverage || 0,
        position: result.overallPosition || 0,
        classSize: classResults.length,
        classAverage: StatisticsUtils.mean(classAverages),
        attendance: {
          daysPresent: result.daysPresent || 0,
          daysSchoolOpen: result.daysSchoolOpen || 0,
          percentage: (
            ((result.daysPresent || 0) / (result.daysSchoolOpen || 1)) *
            100
          ).toFixed(2),
        },
        subjects,
        affectiveDomain: affective,
        psychomotorDomain: psychomotor,
        trend: 'stable', // calculated from previous terms
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cohort analysis - group students by performance tiers
   */
  static async getCohortAnalysis(classId: string, sessionId: string, termId: string) {
    try {
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

      // Group by performance tier
      const tiers = {
        excellent: [] as any[],
        good: [] as any[],
        average: [] as any[],
        atRisk: [] as any[],
      };

      results.forEach((result) => {
        const student = {
          id: result.studentId,
          name: result.student.name,
          average: result.overallAverage || 0,
          position: result.overallPosition || 0,
        };

        const avg = result.overallAverage || 0;
        if (avg >= 80) {
          tiers.excellent.push(student);
        } else if (avg >= 70) {
          tiers.good.push(student);
        } else if (avg >= 60) {
          tiers.average.push(student);
        } else {
          tiers.atRisk.push(student);
        }
      });

      return {
        excellent: {
          count: tiers.excellent.length,
          percentage: (tiers.excellent.length / results.length) * 100,
          students: tiers.excellent,
        },
        good: {
          count: tiers.good.length,
          percentage: (tiers.good.length / results.length) * 100,
          students: tiers.good,
        },
        average: {
          count: tiers.average.length,
          percentage: (tiers.average.length / results.length) * 100,
          students: tiers.average,
        },
        atRisk: {
          count: tiers.atRisk.length,
          percentage: (tiers.atRisk.length / results.length) * 100,
          students: tiers.atRisk,
        },
        totalStudents: results.length,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Aggregate domain scores
   */
  private static aggregateDomain(results: any[], domain: string) {
    const allTraits: Record<string, number[]> = {};

    results.forEach((result) => {
      const domainData = JSON.parse(result[domain] || '{}');
      Object.entries(domainData).forEach(([trait, value]: any) => {
        if (!allTraits[trait]) {
          allTraits[trait] = [];
        }
        allTraits[trait].push(value);
      });
    });

    return Object.entries(allTraits).map(([trait, values]) => ({
      trait,
      average: StatisticsUtils.mean(values),
      distribution: this.getDistributionStats(values),
    }));
  }

  /**
   * Get distribution statistics
   */
  private static getDistributionStats(values: number[]) {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      median: StatisticsUtils.median(values),
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)],
    };
  }
}
