import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { PaymentController } from '../controllers/payment.controller';
import { SubscriptionController } from '../controllers/subscription.controller';

const router = Router();

// Public endpoints - no auth needed
router.post('/webhook', PaymentController.handleWebhook);
router.get('/config', PaymentController.getConfig);
router.get('/plans', PaymentController.getPlans);

// Protected endpoints
router.use(authMiddleware);

// Payment endpoints
router.post('/initialize', PaymentController.initializePayment);
router.get('/verify/:reference', PaymentController.verifyPayment);
router.get('/subscription', PaymentController.getSubscription);

// Subscription endpoints
router.get('/subscription/active', SubscriptionController.getActiveSubscription);
router.get('/subscription/billing-history', SubscriptionController.getBillingHistory);
router.get('/subscription/usage', SubscriptionController.checkPlanLimits);
router.post('/subscription/upgrade', SubscriptionController.upgradePlan);
router.post('/subscription/cancel', SubscriptionController.cancelSubscription);
router.post('/subscription/renew', SubscriptionController.renewSubscription);

export default router;

