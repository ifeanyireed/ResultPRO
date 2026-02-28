import { prisma } from '@config/database';

export class SubscriptionService {
  /**
   * Get current active subscription for a school
   */
  async getActiveSubscription(schoolId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          schoolId,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
        },
      });

      if (!subscription) {
        return {
          success: false,
          subscription: null,
          message: 'No active subscription found',
        };
      }

      const now = new Date();
      const isExpiring = subscription.endDate && subscription.endDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000; // Within 7 days
      const daysRemaining = subscription.endDate
        ? Math.ceil((subscription.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        : null;

      return {
        success: true,
        subscription: {
          id: subscription.id,
          planName: subscription.plan.name,
          planId: subscription.planId,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          isAutoRenew: subscription.isAutoRenew,
          isExpiring,
          daysRemaining,
          maxStudents: subscription.plan.maxStudents,
          maxTeachers: subscription.plan.maxTeachers,
          storageGB: subscription.plan.storageGB,
          features: JSON.parse(subscription.plan.features),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get active subscription: ${error.message}`);
    }
  }

  /**
   * Get billing history/invoices for a school
   */
  async getBillingHistory(schoolId: string, limit = 12) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { schoolId },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return {
        success: true,
        invoices: invoices.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          planName: inv.plan.name,
          billingPeriod: inv.billingPeriod,
          periodStartDate: inv.periodStartDate,
          periodEndDate: inv.periodEndDate,
          baseAmount: inv.baseAmount,
          taxAmount: inv.taxAmount,
          totalAmount: inv.totalAmount,
          currency: inv.currency,
          status: inv.status,
          paidAt: inv.paidAt,
          dueDate: inv.dueDate,
          createdAt: inv.createdAt,
        })),
      };
    } catch (error: any) {
      throw new Error(`Failed to get billing history: ${error.message}`);
    }
  }

  /**
   * Check plan limits and usage for a school
   */
  async checkPlanLimits(schoolId: string) {
    try {
      const subscription = await this.getActiveSubscription(schoolId);

      if (!subscription.success || !subscription.subscription) {
        return {
          success: false,
          message: 'No active subscription',
        };
      }

      const studentCount = await prisma.student.count({
        where: { schoolId },
      });

      const teacherCount = await prisma.schoolAdminUser.count({
        where: { schoolId },
      });

      const sub = subscription.subscription;

      return {
        success: true,
        usage: {
          students: {
            used: studentCount,
            limit: sub.maxStudents,
            percentage: Math.round((studentCount / sub.maxStudents) * 100),
            isAtLimit: studentCount >= sub.maxStudents,
            remaining: Math.max(0, sub.maxStudents - studentCount),
          },
          teachers: {
            used: teacherCount,
            limit: sub.maxTeachers,
            percentage: Math.round((teacherCount / sub.maxTeachers) * 100),
            isAtLimit: teacherCount >= sub.maxTeachers,
            remaining: Math.max(0, sub.maxTeachers - teacherCount),
          },
          plan: sub,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to check plan limits: ${error.message}`);
    }
  }

  /**
   * Create invoice for a payment
   */
  async createInvoice(paymentId: string, payment: any, plan: any) {
    try {
      // Generate invoice number
      const count = await prisma.invoice.count({
        where: { schoolId: payment.schoolId },
      });
      const invoiceNumber = `INV-${payment.schoolId.substring(0, 6).toUpperCase()}-${String(count + 1).padStart(5, '0')}`;

      // Calculate billing period
      const startDate = new Date();
      const endDate = new Date();
      if (payment.billingPeriod === 'year') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        // term = 4 months
        endDate.setMonth(endDate.getMonth() + 4);
      }

      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + 30); // Invoice due in 30 days

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          schoolId: payment.schoolId,
          paymentId,
          planId: payment.planId,
          billingPeriod: payment.billingPeriod,
          periodStartDate: startDate,
          periodEndDate: endDate,
          baseAmount: payment.amount - (payment.amount * 0.075), // Remove tax to get base
          taxAmount: payment.amount * 0.075,
          totalAmount: payment.amount,
          currency: payment.currency,
          status: 'ISSUED',
          dueDate,
        },
      });

      return invoice;
    } catch (error: any) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Upgrade subscription to a new plan
   */
  async upgradePlan(schoolId: string, newPlanId: string) {
    try {
      const currentSubscription = await prisma.subscription.findFirst({
        where: {
          schoolId,
          status: 'ACTIVE',
        },
        include: { plan: true },
      });

      const newPlan = await prisma.plan.findUnique({
        where: { id: newPlanId },
      });

      if (!newPlan) {
        throw new Error('New plan not found');
      }

      if (currentSubscription) {
        const currentPlanPrice = currentSubscription.plan.priceNGN;
        const newPlanPrice = newPlan.priceNGN;

        // If new plan is more expensive, charge the difference
        const priceDifference = newPlanPrice - currentPlanPrice;

        if (priceDifference > 0) {
          // Cancel current
          await prisma.subscription.update({
            where: { id: currentSubscription.id },
            data: { status: 'CANCELLED' },
          });

          // Create new subscription request
          return {
            success: true,
            message: 'Plan upgrade requires payment',
            requiresPayment: true,
            priceDifference,
            newPlanId,
          };
        } else {
          // Downgrade - just update immediately
          await prisma.subscription.update({
            where: { id: currentSubscription.id },
            data: { planId: newPlanId },
          });

          await prisma.school.update({
            where: { id: schoolId },
            data: { subscriptionTier: newPlan.name },
          });

          return {
            success: true,
            message: 'Plan downgraded successfully',
            requiresPayment: false,
          };
        }
      } else {
        // No current subscription, this is initial purchase
        return {
          success: false,
          message: 'No active subscription to upgrade from',
        };
      }
    } catch (error: any) {
      throw new Error(`Failed to upgrade plan: ${error.message}`);
    }
  }

  /**
   * Downgrade or cancel subscription
   */
  async cancelSubscription(schoolId: string, reason?: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          schoolId,
          status: 'ACTIVE',
        },
      });

      if (!subscription) {
        throw new Error('No active subscription to cancel');
      }

      // Set end date to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          endDate: today,
        },
      });

      await prisma.school.update({
        where: { id: schoolId },
        data: { subscriptionTier: 'free' },
      });

      return {
        success: true,
        message: 'Subscription cancelled successfully',
      };
    } catch (error: any) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(invoiceId: string) {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      return invoice;
    } catch (error: any) {
      throw new Error(`Failed to mark invoice as paid: ${error.message}`);
    }
  }

  /**
   * Check and handle expired subscriptions
   */
  async checkAndHandleExpiredSubscriptions() {
    try {
      const now = new Date();

      // Find expired subscriptions
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            lte: now,
          },
        },
      });

      for (const subscription of expiredSubscriptions) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' },
        });

        // Update school to free plan
        await prisma.school.update({
          where: { id: subscription.schoolId },
          data: { subscriptionTier: 'free' },
        });
      }

      return {
        success: true,
        expiredCount: expiredSubscriptions.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to check expired subscriptions: ${error.message}`);
    }
  }

  /**
   * Get subscription statistics for admin
   */
  async getSubscriptionStats() {
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

      return {
        success: true,
        stats: {
          activeSubscriptions: activeCount,
          expiredSubscriptions: expiredCount,
          cancelledSubscriptions: cancelledCount,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          subscriptionsByPlan,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get subscription stats: ${error.message}`);
    }
  }
}

export const subscriptionService = new SubscriptionService();
