import { Router } from 'express';
import { MessagingController } from '../controllers/messaging.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * Send message
 */
router.post('/send', MessagingController.sendMessage);

/**
 * Get conversations
 */
router.get('/conversations', MessagingController.getConversations);

/**
 * Get message thread
 */
router.get('/thread/:otherUserId/:studentId', MessagingController.getMessageThread);

/**
 * Get unread count
 */
router.get('/unread', MessagingController.getUnreadCount);

/**
 * Mark message as read
 */
router.put('/:messageId/read', MessagingController.markMessageAsRead);

export default router;
