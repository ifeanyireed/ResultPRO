import express, { Router } from 'express';
import { agentController } from '../controllers';

const router: Router = express.Router();

// Public routes (for agent signup/landing page)
router.get('/subscription-pricing', (req, res) => {
  agentController.getSubscriptionPricing(req, res);
});

// Protected routes - Agent operations
router.post('/create', (req, res) => {
  agentController.createAgent(req, res);
});

router.get('/profile/me', (req, res) => {
  agentController.getMyProfile(req, res);
});

router.get('/profile/:agentId', (req, res) => {
  agentController.getProfile(req, res);
});

router.patch('/profile/:agentId', (req, res) => {
  agentController.updateProfile(req, res);
});

router.post('/subscription/:agentId/upgrade', (req, res) => {
  agentController.upgradeSubscription(req, res);
});

// Referral routes
router.get('/:agentId/referrals', (req, res) => {
  agentController.getReferrals(req, res);
});

router.get('/:agentId/referrals/stats', (req, res) => {
  agentController.getReferralStats(req, res);
});

// Rewards routes
router.get('/:agentId/rewards', (req, res) => {
  agentController.getRewards(req, res);
});

router.get('/leaderboard', (req, res) => {
  agentController.getLeaderboard(req, res);
});

// Withdrawal routes
router.post('/:agentId/withdrawals/request', (req, res) => {
  agentController.requestWithdrawal(req, res);
});

router.get('/:agentId/withdrawals', (req, res) => {
  agentController.getWithdrawals(req, res);
});

router.get('/:agentId/withdrawals/stats', (req, res) => {
  agentController.getWithdrawalStats(req, res);
});

// Dashboard
router.get('/:agentId/dashboard', (req, res) => {
  agentController.getDashboardStats(req, res);
});

// Admin routes
router.get('/', (req, res) => {
  agentController.getAllAgents(req, res);
});

router.post('/:agentId/verify', (req, res) => {
  agentController.verifyAgent(req, res);
});

router.post('/withdrawals/:withdrawalId/approve', (req, res) => {
  agentController.approveWithdrawal(req, res);
});

export default router;
