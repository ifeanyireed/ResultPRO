import { prisma } from '@config/database';

interface BadgeAward {
  type: string;
  name: string;
  description: string;
  icon: string;
}

export class RewardService {
  // Award badge to agent
  async awardBadge(agentId: string, badgeType: string) {
    const badges: Record<string, { type: string; name: string; description: string; icon: string }> = {
      FIRST_SCHOOL: {
        type: 'FIRST_SCHOOL',
        name: 'School Starter',
        description: 'Assigned to your first school',
        icon: 'star',
      },
      FIVE_SCHOOLS: {
        type: 'FIVE_SCHOOLS',
        name: 'School Builder',
        description: 'Managed 5 schools',
        icon: 'building',
      },
      TEN_SCHOOLS: {
        type: 'TEN_SCHOOLS',
        name: 'School Expert',
        description: 'Managed 10 schools',
        icon: 'award',
      },
      REFERRAL_MASTER: {
        type: 'REFERRAL_MASTER',
        name: 'Referral Master',
        description: '10 successful referrals',
        icon: 'users',
      },
      TOP_PERFORMER: {
        type: 'TOP_PERFORMER',
        name: 'Top Performer',
        description: 'Top 10 on leaderboard',
        icon: 'trophy',
      },
      POWER_AGENT: {
        type: 'POWER_AGENT',
        name: 'Power Agent',
        description: 'Earned 1000+ points',
        icon: 'zap',
      },
      PREMIUM_SUBSCRIBER: {
        type: 'PREMIUM_SUBSCRIBER',
        name: 'Premium Agent',
        description: 'Premium subscription tier',
        icon: 'crown',
      },
    };

    const badge = badges[badgeType];
    if (!badge) throw new Error('Invalid badge type');

    // Check if agent already has this badge
    const existing = await prisma.agentBadge.findFirst({
      where: { agentId, badgeType },
    });

    if (existing) return existing;

    return prisma.agentBadge.create({
      data: {
        agentId,
        badgeType,
        description: badge.description,
        iconUrl: badge.icon,
      },
    });
  }

  // Get agent badges
  async getAgentBadges(agentId: string) {
    return prisma.agentBadge.findMany({
      where: { agentId },
      orderBy: { earnedAt: 'desc' },
    });
  }

  // Get agent points and rewards
  async getRewardSummary(agentId: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        badges: true,
        rewards: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!agent) throw new Error('Agent not found');

    return {
      pointsBalance: agent.pointsBalance,
      lifetimePoints: agent.lifetimePoints,
      leaderboardRank: agent.leaderboardRank,
      badges: agent.badges,
      recentRewards: agent.rewards,
    };
  }

  // Award points for actions
  async awardPoints(agentId: string, action: string): Promise<number> {
    const pointsMap: Record<string, number> = {
      SCHOOL_ASSIGNED: 50,
      REFERRAL_COMPLETED: 100,
      REFERRAL_APPROVED: 150,
      SCHOOL_REVIEW: 25,
      PROFILE_COMPLETE: 75,
      SUBSCRIPTION_UPGRADE: 200,
      MONTHLY_GOAL_HIT: 300,
    };

    const points = pointsMap[action] || 0;
    if (points === 0) throw new Error('Invalid action type');

    return points;
  }

  // Check and award milestone badges
  async checkAndAwardBadges(agentId: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        schoolAssignments: true,
        referrals: {
          where: { status: 'APPROVED' },
        },
        badges: true,
      },
    });

    if (!agent) throw new Error('Agent not found');

    const awardedBadges = [];

    // Check for school milestones
    const schoolCount = agent.schoolAssignments?.length || 0;
    if (schoolCount === 1) {
      const hasFirstSchool = agent.badges.some((b) => b.badgeType === 'FIRST_SCHOOL');
      if (!hasFirstSchool) {
        await this.awardBadge(agentId, 'FIRST_SCHOOL');
        awardedBadges.push('FIRST_SCHOOL');
      }
    }
    if (schoolCount >= 5) {
      const hasBuilder = agent.badges.some((b) => b.badgeType === 'FIVE_SCHOOLS');
      if (!hasBuilder) {
        await this.awardBadge(agentId, 'FIVE_SCHOOLS');
        awardedBadges.push('FIVE_SCHOOLS');
      }
    }
    if (schoolCount >= 10) {
      const hasExpert = agent.badges.some((b) => b.badgeType === 'TEN_SCHOOLS');
      if (!hasExpert) {
        await this.awardBadge(agentId, 'TEN_SCHOOLS');
        awardedBadges.push('TEN_SCHOOLS');
      }
    }

    // Check for referral milestone
    const referralCount = agent.referrals?.length || 0;
    if (referralCount >= 10) {
      const hasMaster = agent.badges.some((b) => b.badgeType === 'REFERRAL_MASTER');
      if (!hasMaster) {
        await this.awardBadge(agentId, 'REFERRAL_MASTER');
        awardedBadges.push('REFERRAL_MASTER');
      }
    }

    // Check for points milestone
    if (agent.lifetimePoints >= 1000) {
      const hasPower = agent.badges.some((b) => b.badgeType === 'POWER_AGENT');
      if (!hasPower) {
        await this.awardBadge(agentId, 'POWER_AGENT');
        awardedBadges.push('POWER_AGENT');
      }
    }

    // Check for premium subscription
    if (agent.subscriptionTier === 'PREMIUM') {
      const hasPremium = agent.badges.some((b) => b.badgeType === 'PREMIUM_SUBSCRIBER');
      if (!hasPremium) {
        await this.awardBadge(agentId, 'PREMIUM_SUBSCRIBER');
        awardedBadges.push('PREMIUM_SUBSCRIBER');
      }
    }

    return awardedBadges;
  }

  // Get leaderboard with points and badges
  async getFullLeaderboard(limit: number = 50) {
    return prisma.agent.findMany({
      take: limit,
      where: { status: 'ACTIVE' },
      orderBy: { lifetimePoints: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        badges: true,
        schoolAssignments: {
          select: { school: { select: { name: true } } },
        },
      },
    });
  }

  // Record reward event
  async recordReward(agentId: string, points: number, reason: string) {
    return prisma.agentReward.create({
      data: {
        agentId,
        pointsEarned: points,
        eventType: 'CUSTOM',
        description: reason,
      },
    });
  }
}

export const rewardService = new RewardService();
