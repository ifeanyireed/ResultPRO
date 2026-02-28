import { paystackService } from './paystack.service';
import { paymentRepository } from '../repositories/payment.repository';
import { subscriptionService } from './subscription.service';
import { prisma } from '@config/database';
import { config } from '@config/environment';

export class PaymentService {
  /**
   * Initialize a payment transaction
   */
  async initializePayment(data: {
    schoolId: string;
    planId: string;
    planName: string;
    amount: number;
    email: string;
    billingPeriod: 'term' | 'year';
  }) {
    try {
      // Ensure plans are initialized
      let plan: any = await paymentRepository.getPlanByName(data.planName);
      if (!plan) {
        // Initialize plans if they don't exist
        const plans = await paymentRepository.initializePlans();
        plan = plans.find((p: any) => p.name === data.planName);
      }

      if (!plan) {
        throw new Error(`Plan not found: ${data.planName}`);
      }

      // Calculate tax (7.5%)
      const TAX_RATE = 0.075;
      const baseAmount = data.amount;
      const taxAmount = Math.round(baseAmount * TAX_RATE);
      const totalAmount = baseAmount + taxAmount;

      // Create payment record
      const payment = await paymentRepository.createPayment({
        schoolId: data.schoolId,
        planId: plan.id,
        amount: totalAmount,
        currency: 'NGN',
        billingPeriod: data.billingPeriod,
      });

      // Initialize with Paystack
      const callbackUrl = `${config.FRONTEND_URL}/payment-complete`;
      const paystackResponse = await paystackService.initializeTransaction(
        totalAmount * 100, // Convert to kobo (includes tax)
        data.email,
        data.planName,
        {
          schoolId: data.schoolId,
          planId: plan.id,
          paymentId: payment.id,
          baseAmount: baseAmount,
          taxAmount: taxAmount,
          taxRate: TAX_RATE,
        },
        callbackUrl
      );

      // Update payment with Paystack details
      const updatedPayment = await paymentRepository.updatePaymentWithPaystackDetails(payment.id, {
        paystackReference: paystackResponse.reference,
        paystackAccessCode: paystackResponse.accessCode,
        authorizationUrl: paystackResponse.authorizationUrl,
      });

      return {
        success: true,
        paymentId: updatedPayment.id,
        authorizationUrl: paystackResponse.authorizationUrl,
        reference: paystackResponse.reference,
      };
    } catch (error: any) {
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  /**
   * Verify and complete payment
   */
  async verifyPayment(paystackReference: string) {
    try {
      // Verify with Paystack
      const verification = await paystackService.verifyTransaction(paystackReference);

      if (verification.status !== 'success') {
        throw new Error(`Payment verification failed: ${verification.status}`);
      }

      // Get payment record with plan
      const payment = await prisma.payment.findUnique({
        where: { paystackReference },
        include: { plan: true },
      });
      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Update payment status
      const updatedPayment = await paymentRepository.completePayment(paystackReference, {
        status: verification.status,
        verifiedAt: new Date(verification.paidAt),
      });

      // Calculate subscription end date based on billing period
      const now = new Date();
      let endDate = new Date(now);
      if (payment.billingPeriod === 'year') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        // term = 4 months (academic term)
        endDate.setMonth(endDate.getMonth() + 4);
      }

      // Create or update subscription
      await prisma.subscription.upsert({
        where: {
          schoolId_planId: {
            schoolId: payment.schoolId,
            planId: payment.planId,
          },
        },
        create: {
          schoolId: payment.schoolId,
          planId: payment.planId,
          status: 'ACTIVE',
          startDate: now,
          endDate: endDate,
          isAutoRenew: true,
        },
        update: {
          status: 'ACTIVE',
          startDate: now,
          endDate: endDate,
          isAutoRenew: true,
        },
      });

      // Update school with subscription info and mark as subscribed
      await prisma.school.update({
        where: { id: payment.schoolId },
        data: {
          subscriptionTier: payment.plan.name,
          subscriptionStartDate: now,
          subscriptionEndDate: endDate,
        },
      });

      // Create invoice
      await subscriptionService.createInvoice(updatedPayment.id, updatedPayment, payment.plan);

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: 'success',
      };
    } catch (error: any) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Get all available plans
   */
  async getAvailablePlans() {
    try {
      // Try to get existing plans
      let plans = await paymentRepository.getActivePlans();

      // If no plans, initialize them
      if (plans.length === 0) {
        plans = await paymentRepository.initializePlans();
      }

      return {
        success: true,
        plans: plans.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          priceNGN: plan.priceNGN,
          priceUSD: plan.priceUSD,
          maxStudents: plan.maxStudents,
          maxTeachers: plan.maxTeachers,
          storageGB: plan.storageGB,
          features: JSON.parse(plan.features),
          isPopular: plan.isPopular,
        })),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch plans: ${error.message}`);
    }
  }

  /**
   * Get active subscription for school
   */
  async getSchoolSubscription(schoolId: string) {
    try {
      const payment = await prisma.payment.findFirst({
        where: {
          schoolId,
          status: 'COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!payment) {
        return {
          success: false,
          subscription: null,
        };
      }

      return {
        success: true,
        subscription: {
          id: payment.id,
          planId: payment.planId,
          status: payment.status,
          paidAt: payment.paidAt,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }
  }

  /**
   * Handle webhook from Paystack (payment update)
   */
  async handlePaystackWebhook(payload: any) {
    try {
      const reference = payload.data?.reference;
      if (!reference) {
        throw new Error('Invalid webhook payload');
      }

      if (payload.event === 'charge.success') {
        // Payment successful
        return await this.verifyPayment(reference);
      } else if (payload.event === 'charge.failed') {
        // Payment failed
        const payment = await paymentRepository.getPaymentByReference(reference);
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              errorMessage: payload.data?.gateway_response || 'Payment failed',
            },
          });
        }
        return { success: false, message: 'Payment failed' };
      }

      return { success: true, message: 'Webhook processed' };
    } catch (error: any) {
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }
}

export const paymentService = new PaymentService();
