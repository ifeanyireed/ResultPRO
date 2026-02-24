import { prisma } from '@config/database';

export class PaymentRepository {
  /**
   * Create a new payment record
   */
  async createPayment(data: {
    schoolId: string;
    planId: string;
    amount: number;
    currency: string;
    billingPeriod?: string;
    paystackReference?: string;
  }) {
    return await prisma.payment.create({
      data: {
        schoolId: data.schoolId,
        planId: data.planId,
        amount: data.amount,
        currency: data.currency,
        billingPeriod: data.billingPeriod || 'term',
        status: 'PENDING',
        paystackReference: data.paystackReference,
      },
    });
  }

  /**
   * Update payment with Paystack details
   */
  async updatePaymentWithPaystackDetails(
    paymentId: string,
    data: {
      paystackReference?: string;
      paystackAccessCode?: string;
      authorizationUrl?: string;
    }
  ) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paystackReference: data.paystackReference,
        paystackAccessCode: data.paystackAccessCode,
        paystackAuthUrl: data.authorizationUrl,
        status: 'PROCESSING',
      },
    });
  }

  /**
   * Mark payment as completed
   */
  async completePayment(
    paystackReference: string,
    data: {
      status: string;
      receiptNumber?: string;
      verifiedAt: Date;
    }
  ) {
    return await prisma.payment.update({
      where: { paystackReference },
      data: {
        status: data.status === 'success' ? 'COMPLETED' : 'FAILED',
        transactionId: data.receiptNumber,
        paidAt: data.verifiedAt,
      },
    });
  }

  /**
   * Get payment by reference
   */
  async getPaymentByReference(paystackReference: string) {
    return await prisma.payment.findUnique({
      where: { paystackReference },
    });
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string) {
    return await prisma.payment.findUnique({
      where: { id: paymentId },
    });
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string) {
    return await prisma.plan.findUnique({
      where: { id: planId },
    });
  }

  /**
   * Get plan by name
   */
  async getPlanByName(name: string) {
    return await prisma.plan.findUnique({
      where: { name },
    });
  }

  /**
   * Get all active plans
   */
  async getActivePlans() {
    return await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Initialize plans (seed if not exist)
   */
  async initializePlans() {
    const plans = [
      {
        name: 'Free',
        priceNGN: 0,
        priceUSD: 0,
        maxStudents: 200,
        maxTeachers: 50,
        storageGB: 10,
        features: JSON.stringify([
          'CSV result upload',
          'Basic result publishing',
          'Parent viewing portal',
          'Email notifications',
          'Basic analytics',
          'Email support',
        ]),
        isPopular: false,
        isActive: true,
        displayOrder: 1,
      },
      {
        name: 'Pro',
        priceNGN: 50000, // per term
        priceUSD: 33,
        maxStudents: 2000,
        maxTeachers: 200,
        storageGB: 100,
        features: JSON.stringify([
          'All Free features',
          'Result checker with scratch cards',
          'Parent mobile app access',
          'Advanced analytics',
          'SMS notifications',
          'Priority email support',
          'Custom branding',
          'Batch processing',
          'CSV data export',
        ]),
        isPopular: true,
        isActive: true,
        displayOrder: 2,
      },
      {
        name: 'Enterprise',
        priceNGN: 200000, // per term
        priceUSD: 133,
        maxStudents: 999999,
        maxTeachers: 999999,
        storageGB: 1000,
        features: JSON.stringify([
          'All Pro features',
          'Multiple schools management',
          'White-label platform',
          'Dedicated account manager',
          '24/7 phone & email support',
          'API access',
          'Custom integrations',
          'Advanced security features',
          'Custom SLA agreement',
        ]),
        isPopular: false,
        isActive: true,
        displayOrder: 3,
      },
    ];

    for (const plan of plans) {
      const { name, ...planWithoutName } = plan;
      await prisma.plan.upsert({
        where: { name },
        update: planWithoutName,
        create: plan as any,
      });
    }

    return await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }
}

// Instantiate singleton only when accessed
export const paymentRepository = new PaymentRepository();
