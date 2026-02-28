import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { AdminSubscriptionController } from '../controllers/admin-subscription.controller';

const router = Router();

// All admin routes require authentication (enforced at app level)
router.use(authMiddleware);

// Get all subscriptions with filters
router.get('/subscriptions', AdminSubscriptionController.getAllSubscriptions);

// Get subscription statistics
router.get('/subscriptions/stats', AdminSubscriptionController.getSubscriptionStats);

// Get invoices for a specific subscription
router.get('/subscriptions/:id/invoices', AdminSubscriptionController.getSubscriptionInvoices);

// Cancel a subscription
router.post('/subscriptions/:id/cancel', AdminSubscriptionController.cancelSubscription);

// Renew a subscription
router.post('/subscriptions/:id/renew', AdminSubscriptionController.renewSubscription);

export default router;
