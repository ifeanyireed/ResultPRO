import { prisma } from '@config/database';

interface CreateReferralInput {
  agentId: string;
  referredSchoolId: string;
  referredByEmail: string;
  referralCode: string;
}

export class ReferralService {
  // Create referral
  async createReferral(input: CreateReferralInput) {
    return prisma.referral.create({
      data: {
        agentId: input.agentId,
        referredSchoolId: input.referredSchoolId,
        referredByEmail: input.referredByEmail,
        referralCode: input.referralCode,
        status: 'PENDING',
      },
      include: {
        agent: true,
        school: true,
      },
    });
  }

  // Track referral click
  async trackClick(referralId: string) {
    return prisma.referral.update({
      where: { id: referralId },
      data: {
        clickedAt: new Date(),
      },
    });
  }

  // Complete signup for referral
  async completeSignup(referralId: string) {
    return prisma.referral.update({
      where: { id: referralId },
      data: {
        signupCompletedAt: new Date(),
        status: 'APPROVED',
      },
      include: {
        agent: true,
        school: true,
      },
    });
  }

  // Get agent referrals
  async getAgentReferrals(agentId: string, skip: number = 0, take: number = 20) {
    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where: { agentId },
        include: {
          school: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.referral.count({ where: { agentId } }),
    ]);

    return {
      referrals,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  // Approve referral commission
  async approveReferral(referralId: string, approvedBy: string) {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { agent: true },
    });

    if (!referral) throw new Error('Referral not found');

    const commissionAmount = referral.commissionAmount || 0;

    const updated = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
      include: {
        agent: true,
        school: true,
      },
    });

    // Add commission to agent pending
    if (referral.agent) {
      await prisma.agent.update({
        where: { id: referral.agent.id },
        data: {
          pendingCommission: {
            increment: commissionAmount,
          },
        },
      });
    }

    return updated;
  }

  // Reject referral
  async rejectReferral(referralId: string, reason?: string) {
    return prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'REJECTED',
      },
      include: {
        agent: true,
        school: true,
      },
    });
  }

  // Get referral stats
  async getReferralStats(agentId: string) {
    const [total, pending, approved, clicks] = await Promise.all([
      prisma.referral.count({
        where: { agentId },
      }),
      prisma.referral.count({
        where: { agentId, status: 'PENDING' },
      }),
      prisma.referral.count({
        where: { agentId, status: 'APPROVED' },
      }),
      prisma.referral.findMany({
        where: { agentId },
        select: { clickedAt: true },
      }),
    ]);

    const commission = await prisma.referral.aggregate({
      where: { agentId, status: 'PAID' },
      _sum: { commissionAmount: true },
    });

    const clickedReferrals = clicks.filter((r: any) => r.clickedAt).length;

    return {
      totalReferrals: total,
      pendingReferrals: pending,
      approvedReferrals: approved,
      totalClicks: clickedReferrals,
      totalCommissionPaid: commission._sum.commissionAmount || 0,
    };
  }

  // Generate referral code
  generateReferralCode(agentId: string, firstName: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const namePart = firstName.substring(0, 3).toUpperCase();
    return `${namePart}-${timestamp}-${random}`;
  }

  // Process paid referrals
  async processPaidReferral(referralId: string, paymentMethod: string) {
    return prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod,
      },
      include: {
        agent: true,
        school: true,
      },
    });
  }
}

export const referralService = new ReferralService();
