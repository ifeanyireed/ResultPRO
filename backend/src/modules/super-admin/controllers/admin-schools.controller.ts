import { Request, Response } from 'express';
import { prisma } from '@config/database';

export class AdminSchoolsController {
  /**
   * GET /api/admin/schools/overview
   * Get network-wide statistics for Enterprise super admin
   */
  static async getNetworkOverview(req: any, res: Response) {
    try {
      const [
        totalSchools,
        activeSchools,
        totalStudents,
        totalTeachers,
        activeSubscriptions,
        totalRevenue,
        enterpriseSubscriptions,
      ] = await Promise.all([
        prisma.school.count(),
        prisma.school.count({ where: { status: 'ACTIVE' } }),
        prisma.student.count(),
        prisma.user.count({ where: { role: 'TEACHER' } }),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { totalAmount: true },
        }),
        prisma.subscription.count({
          where: {
            status: 'ACTIVE',
            plan: { name: 'Enterprise' },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalSchools,
          activeSchools,
          inactiveSchools: totalSchools - activeSchools,
          totalStudents,
          totalTeachers,
          activeSubscriptions,
          enterpriseSubscriptions,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          averageStudentsPerSchool: Math.round(totalStudents / (activeSchools || 1)),
          averageTeachersPerSchool: Math.round(totalTeachers / (activeSchools || 1)),
        },
      });
    } catch (error: any) {
      console.error('❌ Get network overview error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/schools/list
   * Get all schools with filtering and pagination
   */
  static async getSchoolsList(req: any, res: Response) {
    try {
      const {
        status = 'ACTIVE',
        planId,
        subscriptionStatus,
        limit = '50',
        offset = '0',
        search = '',
      } = req.query;

      const where: any = {};
      if (status) where.status = status;

      const schools = await prisma.school.findMany({
        where: {
          ...where,
          name: search ? { contains: search, mode: 'insensitive' } : undefined,
        },
        include: {
          subscriptions: {
            where: subscriptionStatus ? { status: subscriptionStatus } : undefined,
            include: {
              plan: true,
            },
            take: 1,
            orderBy: { startDate: 'desc' },
          },
        },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.school.count({
        where: {
          ...where,
          name: search ? { contains: search, mode: 'insensitive' } : undefined,
        },
      });

      // Get counts separately
      const schoolCounts = await Promise.all(
        schools.map(async (school) => {
          const [studentCount, staffCount] = await Promise.all([
            prisma.student.count({ where: { schoolId: school.id } }),
            prisma.schoolAdminUser.count({ where: { schoolId: school.id } }),
          ]);
          return { schoolId: school.id, studentCount, staffCount };
        })
      );

      const countMap = new Map(schoolCounts.map((c) => [c.schoolId, c]));

      res.json({
        success: true,
        data: schools.map((school) => {
          const count = countMap.get(school.id);
          return {
            id: school.id,
            name: school.name,
            status: school.status,
            studentCount: count?.studentCount || 0,
            staffCount: count?.staffCount || 0,
            subscription: school.subscriptions.length > 0
              ? {
                  planName: school.subscriptions[0].plan.name,
                  status: school.subscriptions[0].status,
                  startDate: school.subscriptions[0].startDate,
                  endDate: school.subscriptions[0].endDate,
                }
              : null,
            createdAt: school.createdAt,
          };
        }),
        pagination: {
          total,
          limit: parseInt(limit as string, 10),
          offset: parseInt(offset as string, 10),
        },
      });
    } catch (error: any) {
      console.error('❌ Get schools list error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/schools/analytics
   * Get consolidated analytics across all schools
   */
  static async getNetworkAnalytics(req: any, res: Response) {
    try {
      const { planId, months = '6' } = req.query;
      const monthsBack = parseInt(months as string, 10);

      const dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - monthsBack);

      const [
        resultsByPlan,
        studentProgressByPlan,
        topPerformingSchools,
      ] = await Promise.all([
        // Results distribution by subscription plan
        prisma.subscription.groupBy({
          by: ['planId'],
          where: {
            status: 'ACTIVE',
            ...(planId && { planId }),
          },
          _count: true,
        }),

        // Student progress by plan
        prisma.school.findMany({
          where: {
            subscriptions: {
              some: {
                status: 'ACTIVE',
              },
            },
          },
          select: {
            id: true,
            name: true,
          },
        }),

        // Top performing schools (by result count)
        prisma.studentResult.groupBy({
          by: ['schoolId'],
          where: {
            createdAt: { gte: dateFrom },
          },
          _count: true,
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
      ]);

      res.json({
        success: true,
        data: {
          resultsByPlan,
          studentProgressByPlan,
          topPerformingSchools,
        },
      });
    } catch (error: any) {
      console.error('❌ Get network analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/schools/financial
   * Get financial dashboard data
   */
  static async getFinancialDashboard(req: any, res: Response) {
    try {
      const { planId, months = '12' } = req.query;
      const monthsBack = parseInt(months as string, 10);

      const dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - monthsBack);

      const [
        revenueByPlan,
        revenueBySchool,
        invoiceStats,
        paymentIssues,
      ] = await Promise.all([
        // Revenue by plan
        prisma.invoice.groupBy({
          by: ['planId'],
          where: {
            status: 'PAID',
            createdAt: { gte: dateFrom },
          },
          _sum: { totalAmount: true },
          _count: true,
        }),

        // Top revenue schools
        prisma.invoice.groupBy({
          by: ['schoolId'],
          where: {
            status: 'PAID',
            createdAt: { gte: dateFrom },
          },
          _sum: { totalAmount: true },
          orderBy: { _sum: { totalAmount: 'desc' } },
          take: 10,
        }),

        // Invoice statistics
        prisma.invoice.groupBy({
          by: ['status'],
        }),

        // Payment issues (overdue invoices)
        prisma.invoice.findMany({
          where: {
            status: 'OVERDUE',
          },
          include: {
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 20,
        }),
      ]);

      res.json({
        success: true,
        data: {
          revenueByPlan,
          revenueBySchool,
          invoiceStats,
          paymentIssues: paymentIssues
            .filter((invoice: any) => invoice.dueDate !== null)
            .map((invoice: any) => ({
              invoiceNumber: invoice.invoiceNumber,
              schoolName: invoice.school.name,
              totalAmount: invoice.totalAmount,
              dueDate: invoice.dueDate,
              daysOverdue: Math.floor(
                (Date.now() - (invoice.dueDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)
              ),
            })),
        },
      });
    } catch (error: any) {
      console.error('❌ Get financial dashboard error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/schools/staff
   * Get staff management data across network
   */
  static async getNetworkStaff(req: any, res: Response) {
    try {
      const { planId, limit = '50', offset = '0' } = req.query;

      const staff = await prisma.schoolAdminUser.findMany({
        where: {
          role: { in: ['TEACHER', 'STAFF', 'ADMIN'] },
          school: planId
            ? {
                subscriptions: { some: { planId } },
              }
            : undefined,
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.schoolAdminUser.count({
        where: {
          role: { in: ['TEACHER', 'STAFF', 'ADMIN'] },
          school: planId
            ? {
                subscriptions: { some: { planId } },
              }
            : undefined,
        },
      });

      res.json({
        success: true,
        data: staff.map((user) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          schoolName: user.school?.name,
          createdAt: user.createdAt,
        })),
        pagination: {
          total,
          limit: parseInt(limit as string, 10),
          offset: parseInt(offset as string, 10),
        },
      });
    } catch (error: any) {
      console.error('❌ Get network staff error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/schools/alerts
   * Get system alerts and notifications
   */
  static async getNetworkAlerts(req: any, res: Response) {
    try {
      const alerts: any[] = [];

      // Check for expiring subscriptions
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 7);

      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: new Date(),
            lte: expiringDate,
          },
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
          plan: {
            select: {
              name: true,
            },
          },
        },
      });

      expiringSubscriptions.forEach((sub) => {
        if (sub.endDate) {
          alerts.push({
            id: `expiring-${sub.id}`,
            type: 'SUBSCRIPTION_EXPIRING',
            severity: 'WARNING',
            schoolName: sub.school.name,
            message: `Subscription expires in ${Math.ceil((sub.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`,
            dueDate: sub.endDate,
          });
        }
      });

      // Check for overdue invoices
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: 'OVERDUE',
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      overdueInvoices.forEach((invoice: any) => {
        alerts.push({
          id: `overdue-${invoice.id}`,
          type: 'PAYMENT_OVERDUE',
          severity: 'CRITICAL',
          schoolName: invoice.school.name,
          message: `Invoice ${invoice.invoiceNumber} is overdue`,
          amount: invoice.totalAmount,
          dueDate: invoice.dueDate,
        });
      });

      // Check for schools at usage limits
      const schoolsAtLimit = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
          plan: {
            select: {
              maxStudents: true,
            },
          },
        },
      });

      // Get student counts for schools with active subscriptions
      const schoolIds = schoolsAtLimit.map((sub) => sub.schoolId);
      const studentCounts = await prisma.student.groupBy({
        by: ['schoolId'],
        where: {
          schoolId: { in: schoolIds },
        },
        _count: true,
      });

      const countMap = new Map(studentCounts.map((c) => [c.schoolId, c._count]));

      schoolsAtLimit.forEach((sub) => {
        const studentCount = countMap.get(sub.schoolId) || 0;
        const usage = (studentCount / (sub.plan.maxStudents || 1)) * 100;
        if (usage >= 80) {
          alerts.push({
            id: `limit-${sub.id}`,
            type: 'USAGE_LIMIT',
            severity: usage >= 100 ? 'CRITICAL' : 'WARNING',
            schoolName: sub.school.name,
            message: `School using ${Math.round(usage)}% of student limit`,
            percentage: Math.round(usage),
          });
        }
      });

      // Sort by severity and date
      const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      alerts.sort(
        (a, b) =>
          severityOrder[a.severity as keyof typeof severityOrder] -
          severityOrder[b.severity as keyof typeof severityOrder]
      );

      res.json({
        success: true,
        data: {
          totalAlerts: alerts.length,
          critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
          warnings: alerts.filter((a) => a.severity === 'WARNING').length,
          alerts: alerts.slice(0, 50), // Return top 50 alerts
        },
      });
    } catch (error: any) {
      console.error('❌ Get network alerts error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/admin/schools/:schoolId/bulk-action
   * Perform bulk actions on schools
   */
  static async performBulkAction(req: any, res: Response) {
    try {
      const { schoolId } = req.params;
      const { action, data } = req.body;

      let result;

      switch (action) {
        case 'SYNC_SETTINGS':
          // Sync settings across network
          await prisma.school.update({
            where: { id: schoolId },
            data: {
              ...data,
            },
          });
          result = { message: 'Settings synced successfully' };
          break;

        case 'DOWNGRADE_PLAN':
          // Downgrade school to free plan
          const freePlan = await prisma.plan.findFirst({
            where: { name: 'Free' },
          });
          if (!freePlan) throw new Error('Free plan not found');

          await prisma.subscription.updateMany({
            where: { schoolId },
            data: {
              planId: freePlan.id,
              status: 'ACTIVE',
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          });
          result = { message: 'School downgraded to free plan' };
          break;

        case 'SUSPEND_SCHOOL':
          // Suspend school operations
          await prisma.school.update({
            where: { id: schoolId },
            data: { status: 'SUSPENDED' },
          });
          result = { message: 'School suspended' };
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action',
          });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Bulk action error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
