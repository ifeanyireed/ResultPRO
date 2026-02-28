import { prisma } from '@config/database';
import { Prisma } from '@prisma/client';

interface CreateAgentInput {
  userId: string;
  specialization: string;
  bio?: string;
  credentials?: Record<string, any>;
  avatarUrl?: string;
}

interface UpdateAgentInput {
  bio?: string;
  credentials?: Record<string, any>;
  avatarUrl?: string;
}

interface UpdateSubscriptionInput {
  subscriptionTier: 'FREE' | 'PRO' | 'PREMIUM';
}

export class AgentService {
  // Create new agent account
  async createAgent(input: CreateAgentInput) {
    const referralCode = this.generateReferralCode(input.userId);
    return prisma.agent.create({
      data: {
        userId: input.userId,
        specialization: input.specialization,
        bio: input.bio,
        credentials: input.credentials ? JSON.stringify(input.credentials) : null,
        avatarUrl: input.avatarUrl,
        subscriptionTier: 'Free',
        verificationStatus: 'PENDING',
        status: 'ACTIVE',
        pointsBalance: 0,
        lifetimePoints: 0,
        totalCommissionEarned: 0,
        pendingCommission: 0,
        referralLinkClicks: 0,
        uniqueReferralCode: referralCode,
      },
      include: {
        user: true,
      },
    });
  }

  // Generate referral code
  private generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userPart = userId.substring(0, 3).toUpperCase();
    return `${userPart}-${timestamp}-${random}`;
  }

  // Get agent profile
  async getAgent(agentId: string) {
    return prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        user: true,
        schoolAssignments: {
          include: { school: true },
        },
        badges: true,
      },
    });
  }

  // Get agent by user ID
  async getAgentByUserId(userId: string) {
    return prisma.agent.findUnique({
      where: { userId },
      include: {
        user: true,
        schoolAssignments: {
          include: { school: true },
        },
      },
    });
  }

  // Update agent profile
  async updateAgent(agentId: string, input: UpdateAgentInput) {
    return prisma.agent.update({
      where: { id: agentId },
      data: {
        bio: input.bio,
        credentials: input.credentials,
        avatarUrl: input.avatarUrl,
      },
      include: {
        user: true,
      },
    });
  }

  // Update subscription tier
  async updateSubscription(agentId: string, input: UpdateSubscriptionInput) {
    const tier = input.subscriptionTier as 'Free' | 'Pro' | 'Premium';
    return prisma.agent.update({
      where: { id: agentId },
      data: {
        subscriptionTier: tier,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      include: {
        user: true,
      },
    });
  }

  // Get subscription pricing
  getSubscriptionPricing(tier: 'Free' | 'Pro' | 'Premium') {
    const pricing = {
      Free: {
        monthlyFee: 0,
        commissionRate: 0.15, // 15%
        maxSchools: 3,
        features: ['Basic referrals', 'Commission tracking'],
      },
      Pro: {
        monthlyFee: 29.99,
        commissionRate: 0.2, // 20%
        maxSchools: 15,
        features: [
          'Advanced referrals',
          'Commission tracking',
          'Gamification',
          'Analytics',
        ],
      },
      Premium: {
        monthlyFee: 99.99,
        commissionRate: 0.25, // 25%
        maxSchools: 100,
        features: [
          'Advanced referrals',
          'Commission tracking',
          'Gamification',
          'Analytics',
          'Dedicated support',
          'Custom branding',
        ],
      },
    };
    return pricing[tier];
  }

  // Verify agent identity
  async verifyAgent(agentId: string, verifiedBy: string) {
    return prisma.agent.update({
      where: { id: agentId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy,
      },
      include: {
        user: true,
      },
    });
  }

  // Reject agent verification
  async rejectAgent(agentId: string, reason: string) {
    return prisma.agent.update({
      where: { id: agentId },
      data: {
        verificationStatus: 'REJECTED',
        rejectionReason: reason,
      },
      include: {
        user: true,
      },
    });
  }

  // Get all agents (admin)
  async getAllAgents(
    skip: number = 0,
    take: number = 20,
    status?: string
  ) {
    const where: Prisma.AgentWhereInput = status ? { status } : {};

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        include: {
          user: true,
          schoolAssignments: true,
          badges: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agent.count({ where }),
    ]);

    return { agents, total, page: Math.floor(skip / take) + 1, pages: Math.ceil(total / take) };
  }

  // Get agent leaderboard
  async getLeaderboard(limit: number = 50) {
    return prisma.agent.findMany({
      take: limit,
      orderBy: { lifetimePoints: 'desc' },
      include: {
        user: true,
        badges: true,
      },
    });
  }

  // Update agent points
  async addPoints(agentId: string, points: number, reason: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) throw new Error('Agent not found');

    const newBalance = agent.pointsBalance + points;
    const newLifetime = agent.lifetimePoints + points;

    // Create reward record
    await prisma.agentReward.create({
      data: {
        agentId,
        pointsEarned: points,
        eventType: 'CUSTOM',
        description: reason,
      },
    });

    return prisma.agent.update({
      where: { id: agentId },
      data: {
        pointsBalance: newBalance,
        lifetimePoints: newLifetime,
      },
    });
  }

  // Update leaderboard ranks
  async updateLeaderboardRanks() {
    const agents = await prisma.agent.findMany({
      orderBy: { lifetimePoints: 'desc' },
    });

    const updates = agents.map((agent: any, index: number) =>
      prisma.agent.update({
        where: { id: agent.id },
        data: { leaderboardRank: index + 1 },
      })
    );

    return Promise.all(updates);
  }
}

export const agentService = new AgentService();
