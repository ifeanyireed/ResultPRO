import { Request, Response } from 'express';
import { prisma } from '@config/database';

export class AdminSubscriptionController {
  /**
   * GET /api/admin/subscriptions
   * Get all subscriptions with filters
   */
  static async getAllSubscriptions(req: any, res: Response) {
    try {
      const { status, planId, limit = '50', offset = '0' } = req.query;

      const where: any = {};
      if (status) where.status = status;
      if (planId) where.planId = planId;

      const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          include: {
            school: {
              select: {
                id: true,
                name: true,
              },
            },
            plan: true,
          },
          take: parseInt(limit as string),
          skip: parseInt(offset as string),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.subscription.count({ where }),
      ]);

      res.json({
        success: true,
        data: subscriptions.map(sub => ({
          id: sub.id,
          schoolId: sub.schoolId,
          schoolName: sub.school.name,
          planName: sub.plan.name,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          isAutoRenew: sub.isAutoRenew,
          createdAt: sub.createdAt,
        })),
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * GET /api/admin/subscriptions/stats
   * Get subscription statistics
   */
  static async getSubscriptionStats(req: any, res: Response) {
    try {
      const activeCount = await prisma.subscription.count({
        where: { status: 'ACTIVE' },
      });

      const expiredCount = await prisma.subscription.count({
        where: { status: 'EXPIRED' },
      });

      const cancelledCount = await prisma.subscription.count({
        where: { status: 'CANCELLED' },
      });

      const totalRevenue = await prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true },
      });

      const subscriptionsByPlan = await prisma.subscription.groupBy({
        by: ['planId'],
        where: { status: 'ACTIVE' },
        _count: { id: true },
      });

      res.json({
        success: true,
        data: {
          activeSubscriptions: activeCount,
          expiredSubscriptions: expiredCount,
          cancelledSubscriptions: cancelledCount,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          subscriptionsByPlan,
        },
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * POST /api/admin/subscriptions/:id/cancel
   * Cancel a subscription
   */
  static async cancelSubscription(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const subscription = await prisma.subscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found',
          code: 'NOT_FOUND',
        });
      }

      await prisma.subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });

      await prisma.school.update({
        where: { id: subscription.schoolId },
        data: { subscriptionTier: 'free' },
      });

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * POST /api/admin/subscriptions/:id/renew
   * Renew a subscription
   */
  static async renewSubscription(req: any, res: Response) {
    try {
      const { id } = req.params;

      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: { plan: true },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found',
          code: 'NOT_FOUND',
        });
      }

      const now = new Date();
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      await prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          endDate,
        },
      });

      res.json({
        success: true,
        message: 'Subscription renewed successfully',
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * GET /api/admin/subscriptions/:id/invoices
   * Get invoices for a subscription
   */
  static async getSubscriptionInvoices(req: any, res: Response) {
    try {
      const { id } = req.params;

      const subscription = await prisma.subscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found',
          code: 'NOT_FOUND',
        });
      }

      const invoices = await prisma.invoice.findMany({
        where: { schoolId: subscription.schoolId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: invoices,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }
}
