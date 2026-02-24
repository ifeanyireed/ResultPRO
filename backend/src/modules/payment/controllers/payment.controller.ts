import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { paystackService } from '../services/paystack.service';

export class PaymentController {
  /**
   * POST /api/payment/initialize
   * Initialize a payment transaction
   */
  static async initializePayment(req: any, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      const email = req.user?.email;

      if (!schoolId || !email) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - missing school id or email',
          code: 'UNAUTHORIZED',
        });
      }

      const { planId, planName, amount } = req.body;

      console.log('Payment initialization request received:', {
        schoolId,
        email,
        planId,
        planName,
        amount,
      });

      if (!planName || amount === undefined || amount === null) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: planName=${planName}, amount=${amount}`,
          code: 'VALIDATION_ERROR',
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0',
          code: 'VALIDATION_ERROR',
        });
      }

      // Extract billing period from planId
      const billingPeriod = planId.includes('year') ? 'year' : 'term';

      const result = await paymentService.initializePayment({
        schoolId,
        planId,
        planName,
        amount,
        email,
        billingPeriod,
      });

      res.json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          paymentId: result.paymentId,
          authorizationUrl: result.authorizationUrl,
          reference: result.reference,
        },
      });
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      const status = error.status || 400;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * GET /api/payment/verify/:reference
   * Verify a payment transaction
   */
  static async verifyPayment(req: any, res: Response) {
    try {
      const { reference } = req.params;

      if (!reference) {
        return res.status(400).json({
          success: false,
          error: 'Payment reference is required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await paymentService.verifyPayment(reference);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: result,
      });
    } catch (error: any) {
      const status = error.status || 400;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * GET /api/payment/plans
   * Get all available plans
   */
  static async getPlans(req: Request, res: Response) {
    try {
      const result = await paymentService.getAvailablePlans();

      res.json({
        success: true,
        data: result.plans,
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
   * GET /api/payment/subscription
   * Get school's active subscription
   */
  static async getSubscription(req: any, res: Response) {
    try {
      const schoolId = req.user?.schoolId;

      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await paymentService.getSchoolSubscription(schoolId);

      res.json({
        success: true,
        data: result.subscription,
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
   * POST /api/payment/webhook
   * Paystack webhook handler (public, no auth required)
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const body = req.body;

      if (!signature) {
        return res.status(401).json({
          success: false,
          error: 'Missing signature',
          code: 'SIGNATURE_MISSING',
        });
      }

      // Verify signature
      const payload = JSON.stringify(body);
      const isValid = paystackService.verifyWebhookSignature(payload, signature);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature',
          code: 'SIGNATURE_INVALID',
        });
      }

      // Process webhook
      const result = await paymentService.handlePaystackWebhook(body);

      res.json({
        success: true,
        message: 'Webhook processed',
        data: result,
      });
    } catch (error: any) {
      console.error('Webhook error:', error);
      // Always return 200 to Paystack
      res.status(200).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/payment/config
   * Get Paystack public key for frontend
   */
  static async getConfig(req: Request, res: Response) {
    try {
      const publicKey = paystackService.getPublicKey();

      res.json({
        success: true,
        data: {
          paystackPublicKey: publicKey,
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
