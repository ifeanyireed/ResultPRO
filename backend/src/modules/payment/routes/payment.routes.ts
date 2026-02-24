import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

// Public endpoints - no auth needed
router.post('/webhook', PaymentController.handleWebhook);
router.get('/config', PaymentController.getConfig);
router.get('/plans', PaymentController.getPlans);

// Protected endpoints
router.use(authMiddleware);

// Initialize payment
router.post('/initialize', PaymentController.initializePayment);

// Verify payment
router.get('/verify/:reference', PaymentController.verifyPayment);

// Get school subscription
router.get('/subscription', PaymentController.getSubscription);

export default router;
