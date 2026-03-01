import { Request, Response, NextFunction } from 'express';
import { MessagingService } from '../services/messaging.service';

export class MessagingController {
  /**
   * POST /api/messages/send
   * Send message from current user to another user
   */
  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipientId, studentId, body, subject } = req.body;
      const senderId = (req as any).user?.userId;
      const schoolId = (req as any).user?.schoolId;
      const userRole = (req as any).user?.role;

      if (!senderId || !schoolId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!recipientId || !studentId || !body) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      let message;

      if (userRole === 'TEACHER') {
        message = await MessagingService.sendTeacherMessage(
          senderId,
          recipientId,
          studentId,
          schoolId,
          body,
          subject
        );
      } else if (userRole === 'PARENT') {
        message = await MessagingService.sendParentMessage(
          senderId,
          recipientId,
          studentId,
          schoolId,
          body,
          subject
        );
      } else {
        return res.status(403).json({
          success: false,
          message: 'Only teachers and parents can send messages',
        });
      }

      res.json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/messages/conversations
   * Get list of conversations for current user
   */
  static async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const schoolId = (req as any).user?.schoolId;
      const userRole = (req as any).user?.role;

      if (!userId || !schoolId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      let conversations;

      if (userRole === 'TEACHER') {
        conversations = await MessagingService.getTeacherConversations(
          userId,
          schoolId
        );
      } else if (userRole === 'PARENT') {
        conversations = await MessagingService.getParentConversations(
          userId,
          schoolId
        );
      } else {
        return res.status(403).json({
          success: false,
          message: 'Only teachers and parents can view conversations',
        });
      }

      res.json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/messages/thread/:otherUserId/:studentId
   * Get message thread with another user about a student
   */
  static async getMessageThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { otherUserId, studentId } = req.params;
      const userId = (req as any).user?.userId;
      const schoolId = (req as any).user?.schoolId;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId || !schoolId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!otherUserId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
      }

      const messages = await MessagingService.getMessageThread(
        userId,
        otherUserId,
        studentId,
        schoolId,
        limit
      );

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/messages/unread
   * Get unread message count
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const schoolId = (req as any).user?.schoolId;

      if (!userId || !schoolId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const count = await MessagingService.getUnreadCount(userId, schoolId);

      res.json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/messages/:messageId/read
   * Mark message as read
   */
  static async markMessageAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({
          success: false,
          message: 'Message ID required',
        });
      }

      const message = await MessagingService.markAsRead(messageId);

      res.json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
}
