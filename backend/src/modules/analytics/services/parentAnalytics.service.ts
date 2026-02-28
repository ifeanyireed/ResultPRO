// Parent Analytics Service - Track child's performance from parent perspective
import { prisma } from "@config/database";
import {
  StatisticsUtils,
  getLetterGrade,
  getTrendDirection,
  percentageChange,
  getPerformanceTier,
} from "../utils/statistics.util";
import { RiskScoreService } from "./riskScore.service";
import { StudentProgressService } from "./studentProgress.service";

export class ParentAnalyticsService {
  /**
   * Get all children for a parent
   */
  static async getParentChildren(userId: string) {
    try {
      const parent = await prisma.parent.findUnique({
        where: { userId },
        include: {
          students: {
            include: {
              class: true,
              school: true,
            },
          },
        },
      });

      if (!parent) {
        throw new Error("Parent profile not found");
      }

      return parent.students.map((student: any) => ({
        id: student.id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        class: student.class.name,
        classId: student.classId,
        schoolId: student.schoolId,
        schoolName: student.school.name,
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get comprehensive analytics for a single child
   */
  static async getChildAnalytics(parentUserId: string, studentId: string) {
    try {
      // Verify parent owns this student
      const parent = await prisma.parent.findUnique({
        where: { userId: parentUserId },
        include: {
          students: {
            where: { id: studentId },
          },
        },
      });

      if (!parent || parent.students.length === 0) {
        throw new Error(
          "Unauthorized: Parent does not have access to this student",
        );
      }

      // Get student analytics using existing service
      return StudentProgressService.getStudentAnalytics(studentId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get child's current term performance summary
   */
  static async getChildCurrentTermSummary(studentId: string) {
    try {
      const latestResult = await prisma.studentResult.findFirst({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        include: {
          student: true,
          class: true,
        },
      });

      if (!latestResult) {
        throw new Error("No results found for student");
      }

      const subjectResults = JSON.parse(latestResult.subjectResults || "{}");
      const affective = JSON.parse(latestResult.affectiveDomain || "{}");
      const psychomotor = JSON.parse(latestResult.psychomotorDomain || "{}");

      // Get class average for comparison
      const classResults = await prisma.studentResult.findMany({
        where: {
          classId: latestResult.classId,
          sessionId: latestResult.sessionId,
          termId: latestResult.termId,
        },
      });

      const classAverages = classResults.map((r) => r.overallAverage || 0);
      const classAverage = StatisticsUtils.mean(classAverages);
      const classMedian = StatisticsUtils.median(classAverages);

      // Calculate risk score
      const riskScore = await RiskScoreService.calculateStudentRiskScore(
        latestResult,
        {
          average: classAverage,
          median: classMedian,
          stdDev: StatisticsUtils.stdDeviation(classAverages),
        },
        [],
      );

      // Subject breakdown
      const subjectBreakdown = Object.entries(subjectResults).map(
        ([name, data]: any) => ({
          subject: name,
          score: data.total || 0,
          grade: data.grade || getLetterGrade(data.total || 0),
          classAverage: data.classAverage || 0,
          position: data.positionInClass || 0,
          remark: data.remark || "",
        }),
      );

      // Calculate strengths and weaknesses
      const sortedByScore = subjectBreakdown.sort((a, b) => b.score - a.score);
      const strengths = sortedByScore.slice(0, 3).map((s) => s.subject);
      const weaknesses = sortedByScore.slice(-3).map((s) => s.subject);

      return {
        studentName: latestResult.student.name,
        overallAverage: latestResult.overallAverage || 0,
        classAverage,
        position: latestResult.overallPosition || 0,
        classSize: classResults.length,
        attendance: {
          daysPresent: latestResult.daysPresent,
          daysSchoolOpen: latestResult.daysSchoolOpen,
          percentage: (
            (latestResult.daysPresent / latestResult.daysSchoolOpen) *
            100
          ).toFixed(1),
        },
        riskLevel: riskScore.riskLevel,
        riskScore: riskScore.riskScore,
        subjectBreakdown,
        affectiveDomainScores: Object.entries(affective).map(
          ([trait, score]: any) => ({
            trait,
            score,
          }),
        ),
        psychomotorDomainScores: Object.entries(psychomotor).map(
          ([skill, score]: any) => ({
            skill,
            score,
          }),
        ),
        strengths,
        weaknesses,
        recommendations: riskScore.recommendations,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get child's term-over-term progress
   */
  static async getChildProgressTrend(studentId: string, limit: number = 3) {
    try {
      const results = await prisma.studentResult.findMany({
        where: { studentId },
        orderBy: { createdAt: "asc" },
        take: limit,
        include: {
          class: true,
        },
      });

      if (results.length === 0) {
        throw new Error("No results found for student");
      }

      const progressData = results.map((result, idx) => {
        const previousAvg = idx > 0 ? results[idx - 1].overallAverage || 0 : 0;
        const currentAvg = result.overallAverage || 0;

        return {
          term: `Term ${idx + 1}`,
          average: currentAvg,
          position: result.overallPosition || 0,
          attendance: (
            (result.daysPresent / result.daysSchoolOpen) *
            100
          ).toFixed(1),
          trend:
            idx === 0
              ? "initial"
              : getTrendDirection([previousAvg, currentAvg]),
          change: idx === 0 ? 0 : percentageChange(previousAvg, currentAvg),
        };
      });

      return progressData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get child's subject-specific performance
   */
  static async getChildSubjectAnalysis(studentId: string, subjectName: string) {
    try {
      const results = await prisma.studentResult.findMany({
        where: { studentId },
        orderBy: { createdAt: "asc" },
        take: 3,
      });

      if (results.length === 0) {
        throw new Error("No results found for student");
      }

      const subjectScores = results.map((result) => {
        const subjects = JSON.parse(result.subjectResults || "{}");
        return subjects[subjectName] || { total: 0, grade: "N/A" };
      });

      const scores = subjectScores.map((s) => s.total);
      const avgScore = StatisticsUtils.mean(scores);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      return {
        subject: subjectName,
        termScores: subjectScores.map((score, idx) => ({
          term: `Term ${idx + 1}`,
          score: score.total,
          grade: score.grade,
          remark: score.remark || "",
        })),
        statistics: {
          average: avgScore.toFixed(1),
          highest: maxScore,
          lowest: minScore,
          trend: getTrendDirection(scores),
        },
        performanceTier: getPerformanceTier(avgScore),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get attendance analysis for child
   */
  static async getChildAttendanceAnalysis(studentId: string) {
    try {
      const results = await prisma.studentResult.findMany({
        where: { studentId },
        orderBy: { createdAt: "asc" },
        take: 3,
      });

      if (results.length === 0) {
        throw new Error("No results found for student");
      }

      const attendanceData = results.map((result, idx) => {
        const percentage = (
          (result.daysPresent / result.daysSchoolOpen) *
          100
        ).toFixed(1);
        return {
          term: `Term ${idx + 1}`,
          daysPresent: result.daysPresent,
          daysSchoolOpen: result.daysSchoolOpen,
          percentage: parseFloat(percentage),
        };
      });

      const percentages = attendanceData.map((a) => a.percentage);
      const avgAttendance = StatisticsUtils.mean(percentages);

      return {
        current: attendanceData[attendanceData.length - 1],
        history: attendanceData,
        average: avgAttendance.toFixed(1),
        trend: getTrendDirection(percentages),
        impact:
          avgAttendance >= 75 ? "Good" : avgAttendance >= 60 ? "Fair" : "Poor",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get parent dashboard overview
   */
  static async getParentDashboardOverview(userId: string) {
    try {
      const parent = await prisma.parent.findUnique({
        where: { userId },
        include: {
          students: {
            include: {
              class: true,
              school: true,
            },
          },
        },
      });

      if (!parent) {
        throw new Error("Parent profile not found");
      }

      // Get latest results for all children
      const childrenSummaries = await Promise.all(
        parent.students.map(async (student: any) => {
          const latestResult = await prisma.studentResult.findFirst({
            where: { studentId: student.id },
            orderBy: { createdAt: "desc" },
          });

          if (!latestResult) {
            return {
              studentId: student.id,
              studentName: student.name,
              className: student.class.name,
              average: 0,
              position: 0,
              status: "NO_DATA",
            };
          }

          // Get class metrics for risk score
          const classResults = await prisma.studentResult.findMany({
            where: {
              classId: student.classId,
              sessionId: latestResult.sessionId,
              termId: latestResult.termId,
            },
          });

          const classAverages = classResults.map(
            (r: any) => r.overallAverage || 0,
          );
          const riskScore = await RiskScoreService.calculateStudentRiskScore(
            latestResult,
            {
              average: StatisticsUtils.mean(classAverages),
              median: StatisticsUtils.median(classAverages),
              stdDev: StatisticsUtils.stdDeviation(classAverages),
            },
            [],
          );

          return {
            studentId: student.id,
            studentName: student.name,
            className: student.class.name,
            average: latestResult.overallAverage || 0,
            position: latestResult.overallPosition || 0,
            riskLevel: riskScore.riskLevel,
            status: "OK",
          };
        }),
      );

      // Count alerts
      const criticalCount = childrenSummaries.filter(
        (c: any) => c.riskLevel === "CRITICAL",
      ).length;
      const highCount = childrenSummaries.filter(
        (c: any) => c.riskLevel === "HIGH",
      ).length;
      const mediumCount = childrenSummaries.filter(
        (c: any) => c.riskLevel === "MEDIUM",
      ).length;

      // Get the user data to access parent name
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      return {
        parentName: user?.fullName || user?.firstName || "Parent",
        totalChildren: parent.students.length,
        children: childrenSummaries,
        alerts: {
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
