import { Request, Response } from 'express';
import { prisma } from '@config/database';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get notifications for current user
   */
  static async getNotifications(req: any, res: Response) {
    try {
      const { limit = '20', offset = '0', unreadOnly = 'false' } = req.query;
      const userId = req.user?.id;

      const where: any = { userId };
      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          include: {
            ticket: {
              select: {
                id: true,
                ticketNumber: true,
                title: true,
                status: true,
              },
            },
          },
          take: parseInt(limit as string, 10),
          skip: parseInt(offset as string, 10),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where }),
      ]);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          total,
          unread: await prisma.notification.count({ where: { userId, isRead: false } }),
        },
      });
    } catch (error: any) {
      console.error('❌ Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/notifications/:id/read
   * Mark notification as read
   */
  static async markAsRead(req: any, res: Response) {
    try {
      const { id } = req.params;

      const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
      });

      res.json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      console.error('❌ Mark as read error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/notifications/mark-all-read
   * Mark all notifications as read
   */
  static async markAllAsRead(req: any, res: Response) {
    try {
      const userId = req.user?.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      console.error('❌ Mark all as read error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  static async deleteNotification(req: any, res: Response) {
    try {
      const { id } = req.params;

      await prisma.notification.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error: any) {
      console.error('❌ Delete notification error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/notifications/clear-all
   * Clear all notifications for user
   */
  static async clearAll(req: any, res: Response) {
    try {
      const userId = req.user?.id;

      await prisma.notification.deleteMany({
        where: { userId },
      });

      res.json({
        success: true,
        message: 'All notifications cleared',
      });
    } catch (error: any) {
      console.error('❌ Clear all error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count
   */
  static async getUnreadCount(req: any, res: Response) {
    try {
      const userId = req.user?.id;

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      res.json({
        success: true,
        data: {
          unreadCount,
        },
      });
    } catch (error: any) {
      console.error('❌ Get unread count error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
