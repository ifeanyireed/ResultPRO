import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { paymentService } from '../services/payment.service';

export class SubscriptionController {
  /**
   * GET /api/payment/subscription/active
   * Get active subscription for the school
   */
  static async getActiveSubscription(req: any, res: Response) {
    try {
      const schoolId = req.user?.schoolId;

      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await subscriptionService.getActiveSubscription(schoolId);

      res.json({
        success: result.success,
        data: result.subscription,
        message: result.message,
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
   * GET /api/payment/subscription/billing-history
   * Get billing history (invoices)
   */
  static async getBillingHistory(req: any, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      const limit = parseInt(req.query.limit) || 12;

      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await subscriptionService.getBillingHistory(schoolId, limit);

      res.json({
        success: result.success,
        data: result.invoices,
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
   * GET /api/payment/subscription/usage
   * Check plan limits and current usage
   */
  static async checkPlanLimits(req: any, res: Response) {
    try {
      const schoolId = req.user?.schoolId;

      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await subscriptionService.checkPlanLimits(schoolId);

      res.json({
        success: result.success,
        data: result.usage,
        message: result.message,
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
   * POST /api/payment/subscription/upgrade
   * Upgrade subscription to a new plan
   */
  static async upgradePlan(req: any, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      const { newPlanId } = req.body;

      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      if (!newPlanId) {
        return res.status(400).json({
          success: false,
          error: 'New plan ID is required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await subscriptionService.upgradePlan(schoolId, newPlanId);

      res.json({
        success: result.success,
        data: result,
        message: result.message,
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
   * POST /api/payment/subscription/cancel
   * Cancel subscription
   */
  static async cancelSubscription(req: any, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      const { reason } = req.body;

      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await subscriptionService.cancelSubscription(schoolId, reason);

      res.json({
        success: result.success,
        message: result.message,
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
   * POST /api/payment/subscription/renew
   * Manually renew subscription
   */
  static async renewSubscription(req: any, res: Response) {
    try {
      const schoolId = req.user?.schoolId;

      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      // This would typically initiate a payment for renewal
      // For now, just return a message
      res.json({
        success: true,
        message: 'Subscription renewal initiated',
        data: {
          message: 'Please proceed to payment',
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
}
