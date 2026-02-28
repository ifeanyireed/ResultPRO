import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

// All routes protected by authMiddleware
router.use(authMiddleware);

// Get all notifications
router.get('/', NotificationController.getNotifications);

// Get unread count
router.get('/count/unread', NotificationController.getUnreadCount);

// Mark specific notification as read
router.put('/:id/read', NotificationController.markAsRead);

// Mark all as read
router.put('/read/all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

// Clear all notifications
router.delete('/clear/all', NotificationController.clearAll);

export default router;
