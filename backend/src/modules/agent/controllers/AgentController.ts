import { Request, Response } from 'express';
import {
  agentService,
  referralService,
  rewardService,
  withdrawalService,
} from '../services';

export class AgentController {
  // Create new agent account
  async createAgent(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id;
      const { specialization, bio, credentials, avatarUrl } = req.body;

      if (!userId || !specialization) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const agent = await agentService.createAgent({
        userId,
        specialization,
        bio,
        credentials,
        avatarUrl,
      });

      res.json({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get agent profile
  async getProfile(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const agent = await agentService.getAgent(agentId);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get current agent's profile
  async getMyProfile(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id;

      const agent = await agentService.getAgentByUserId(userId);

      if (!agent) {
        return res.status(404).json({ error: 'Agent profile not found' });
      }

      res.json({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update agent profile
  async updateProfile(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { bio, credentials, avatarUrl } = req.body;

      const agent = await agentService.updateAgent(agentId, {
        bio,
        credentials,
        avatarUrl,
      });

      res.json({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get subscription pricing
  async getSubscriptionPricing(req: Request, res: Response) {
    try {
      const pricing = {
        Free: agentService.getSubscriptionPricing('Free'),
        Pro: agentService.getSubscriptionPricing('Pro'),
        Premium: agentService.getSubscriptionPricing('Premium'),
      };

      res.json({
        success: true,
        data: pricing,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Upgrade subscription
  async upgradeSubscription(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { subscriptionTier } = req.body;

      if (!['Free', 'Pro', 'Premium'].includes(subscriptionTier)) {
        return res.status(400).json({ error: 'Invalid subscription tier' });
      }

      const agent = await agentService.updateSubscription(agentId, {
        subscriptionTier,
      });

      // Award premium badge if upgrading to premium
      if (subscriptionTier === 'Premium') {
        await rewardService.awardBadge(agentId, 'PREMIUM_SUBSCRIBER');
      }

      res.json({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get agent referrals
  async getReferrals(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { skip = 0, take = 20 } = req.query;

      const result = await referralService.getAgentReferrals(
        agentId,
        parseInt(skip as string),
        parseInt(take as string)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get referral stats
  async getReferralStats(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const stats = await referralService.getReferralStats(agentId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get agent rewards and badges
  async getRewards(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const summary = await rewardService.getRewardSummary(agentId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get leaderboard
  async getLeaderboard(req: Request, res: Response) {
    try {
      const { limit = 50 } = req.query;
      const leaderboard = await rewardService.getFullLeaderboard(
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Request withdrawal
  async requestWithdrawal(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const {
        amount,
        bankAccountName,
        bankCode,
        paypalEmail,
        walletAddress,
        cryptoCurrency,
      } = req.body;

      const withdrawal = await withdrawalService.requestWithdrawal({
        agentId,
        amount,
        bankAccountName,
        bankCode,
        paypalEmail,
        walletAddress,
        cryptoCurrency,
      });

      res.json({
        success: true,
        data: withdrawal,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get agent withdrawals
  async getWithdrawals(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { skip = 0, take = 20 } = req.query;

      const result = await withdrawalService.getAgentWithdrawals(
        agentId,
        parseInt(skip as string),
        parseInt(take as string)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get withdrawal stats
  async getWithdrawalStats(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const stats = await withdrawalService.getWithdrawalStats(agentId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all agents (admin only)
  async getAllAgents(req: Request, res: Response) {
    try {
      const { skip = 0, take = 20, status } = req.query;

      const result = await agentService.getAllAgents(
        parseInt(skip as string),
        parseInt(take as string),
        status as string
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verify agent (admin only)
  async verifyAgent(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const verifiedBy = (req.user as any)?.id;

      const agent = await agentService.verifyAgent(agentId, verifiedBy);

      res.json({
        success: true,
        data: agent,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Approve withdrawal (admin only)
  async approveWithdrawal(req: Request, res: Response) {
    try {
      const { withdrawalId } = req.params;
      const userId = (req.user as any)?.id;

      const withdrawal = await withdrawalService.approveWithdrawal(
        withdrawalId,
        userId
      );

      res.json({
        success: true,
        data: withdrawal,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get dashboard stats
  async getDashboardStats(req: Request, res: Response) {
    try {
      const { agentId } = req.params;

      const agent = await agentService.getAgent(agentId);
      const referralStats = await referralService.getReferralStats(agentId);
      const rewards = await rewardService.getRewardSummary(agentId);
      const withdrawalStats = await withdrawalService.getWithdrawalStats(
        agentId
      );

      res.json({
        success: true,
        data: {
          agent,
          referralStats,
          rewards,
          withdrawalStats,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const agentController = new AgentController();
