import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { EmailManagementController } from '../controllers/email-management.controller';

const router = Router();

// All email routes require authentication
router.use(authMiddleware);

// ========================
// Campaign Management Routes
// ========================

// Get all campaigns
router.get('/campaigns', EmailManagementController.getCampaigns);

// Create new campaign
router.post('/campaigns', EmailManagementController.createCampaign);

// Get campaign details
router.get('/campaigns/:id', EmailManagementController.getCampaignDetails);

// Update campaign
router.patch('/campaigns/:id', EmailManagementController.updateCampaign);

// Delete campaign
router.delete('/campaigns/:id', EmailManagementController.deleteCampaign);

// Send campaign (execute sending to all subscribers)
router.post('/campaigns/:id/send', EmailManagementController.sendCampaign);

// ========================
// Email Inbox Routes (S3)
// ========================

// Get inbox emails from S3
router.get('/inbox', EmailManagementController.getInbox);

// Read specific email from S3
router.get('/inbox/:emailKey', EmailManagementController.readEmail);

// ========================
// Subscriber Management Routes
// ========================

// Get all subscribers
router.get('/subscribers', EmailManagementController.getSubscribers);

// Add new subscriber
router.post('/subscribers', EmailManagementController.addSubscriber);

// Toggle subscriber status (active/inactive)
router.patch('/subscribers/:subscriberId/status', EmailManagementController.toggleSubscriberStatus);

// Delete subscriber
router.delete('/subscribers/:subscriberId', EmailManagementController.deleteSubscriber);

// ========================
// Unsubscribe Routes (PUBLIC - No Auth Required)
// ========================

// Remove auth for unsubscribe endpoint (it uses token)
router.get('/unsubscribe', EmailManagementController.processUnsubscribe);

// ========================
// Email Template Routes
// ========================

// Get all active email templates
router.get('/templates', EmailManagementController.getTemplates);

// Save/create email template
router.post('/templates', EmailManagementController.saveTemplate);

export default router;
