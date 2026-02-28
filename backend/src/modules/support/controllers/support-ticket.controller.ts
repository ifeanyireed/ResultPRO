import { Request, Response } from 'express';
import { prisma } from '@config/database';

export class SupportTicketController {
  /**
   * POST /api/support/tickets
   * Create a new support ticket
   */
  static async createTicket(req: any, res: Response) {
    try {
      const { title, description, category, priority = 'MEDIUM', schoolId } = req.body;
      const userId = req.user?.id;

      if (!userId || !title || !description || !category) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, description, category',
        });
      }

      // Generate ticket number
      const latestTicket = await prisma.supportTicket.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { ticketNumber: true },
      });

      const ticketCount = latestTicket
        ? parseInt(latestTicket.ticketNumber.split('-')[1]) + 1
        : 1;
      const ticketNumber = `TICKET-${String(ticketCount).padStart(5, '0')}`;

      const ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          title,
          description,
          category,
          priority,
          status: 'OPEN',
          schoolId: schoolId || null,
          createdBy: userId,
        },
        include: {
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Create notification for super admin and support agents
      const supportAgents = await prisma.user.findMany({
        where: { role: 'SUPPORT_AGENT' },
        select: { id: true },
      });

      const superAdmins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true },
      });

      const notifyUsers = [...supportAgents, ...superAdmins];
      const notifications = notifyUsers.map((user) => ({
        userId: user.id,
        ticketId: ticket.id,
        type: 'TICKET_CREATED',
        title: 'New Support Ticket',
        message: `New ticket "${title}" from ${req.user?.firstName} ${req.user?.lastName}`,
        relatedId: ticket.id,
        actionUrl: `/support-agent/tickets/${ticket.id}`,
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      console.error('❌ Create ticket error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/support/tickets
   * Get tickets with filtering
   */
  static async getTickets(req: any, res: Response) {
    try {
      const { status, priority, category, assignedToMe, limit = '20', offset = '0' } = req.query;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const where: any = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (category) where.category = category;

      // Filter based on user role
      if (userRole === 'SUPPORT_AGENT') {
        where.assignedToAgent = assignedToMe ? userId : undefined;
      } else if (userRole === 'SCHOOL_ADMIN' || userRole === 'PARENT') {
        where.createdBy = userId;
      }
      // SUPER_ADMIN sees all tickets

      const tickets = await prisma.supportTicket.findMany({
        where,
        include: {
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignedAgent: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          school: {
            select: { id: true, name: true },
          },
          messages: {
            select: { id: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.supportTicket.count({ where });

      res.json({
        success: true,
        data: tickets.map((t) => ({
          ...t,
          lastMessage: t.messages[0]?.createdAt || null,
          messages: undefined,
        })),
        pagination: {
          total,
          limit: parseInt(limit as string, 10),
          offset: parseInt(offset as string, 10),
        },
      });
    } catch (error: any) {
      console.error('❌ Get tickets error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/support/tickets/:id
   * Get a specific ticket with full details
   */
  static async getTicket(req: any, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const ticket = await prisma.supportTicket.findUnique({
        where: { id },
        include: {
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignedAgent: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          school: {
            select: { id: true, name: true },
          },
          messages: {
            include: {
              sender: {
                select: { id: true, firstName: true, lastName: true, email: true, role: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket not found' });
      }

      // Check access permission
      if (
        userRole !== 'SUPER_ADMIN' &&
        userRole !== 'SUPPORT_AGENT' &&
        ticket.createdBy !== userId
      ) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this ticket',
        });
      }

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      console.error('❌ Get ticket error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/support/tickets/:id
   * Update ticket status/priority/assignment
   */
  static async updateTicket(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { status, priority, assignedToAgent } = req.body;
      const userRole = req.user?.role;

      // Only super admin and support agents can update tickets
      if (userRole !== 'SUPER_ADMIN' && userRole !== 'SUPPORT_AGENT') {
        return res.status(403).json({
          success: false,
          error: 'Only support staff can update tickets',
        });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (assignedToAgent !== undefined) updateData.assignedToAgent = assignedToAgent;

      const ticket = await prisma.supportTicket.update({
        where: { id },
        data: updateData,
        include: {
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignedAgent: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Create notification if status changed
      if (status && status !== 'OPEN') {
        await prisma.notification.create({
          data: {
            userId: ticket.createdBy,
            ticketId: ticket.id,
            type: 'STATUS_CHANGED',
            title: 'Ticket Status Updated',
            message: `Your ticket status changed to ${status}`,
            relatedId: ticket.id,
            actionUrl: `/tickets/${ticket.id}`,
          },
        });
      }

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      console.error('❌ Update ticket error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/support/tickets/:id/messages
   * Add a message to a ticket
   */
  static async addMessage(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Message content is required',
        });
      }

      // Verify ticket exists
      const ticket = await prisma.supportTicket.findUnique({
        where: { id },
        select: { createdBy: true, assignedToAgent: true },
      });

      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket not found' });
      }

      const message = await prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: userId,
          content,
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Notify other participants
      const notifyUserIds = new Set([ticket.createdBy, ticket.assignedToAgent].filter(Boolean));
      notifyUserIds.delete(userId); // Don't notify sender

      const notifications = Array.from(notifyUserIds).map((uid) => ({
        userId: uid as string,
        ticketId: id,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message on Your Ticket',
        message: `${req.user?.firstName} ${req.user?.lastName} sent a message`,
        relatedId: id,
        actionUrl: `/tickets/${id}`,
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      console.error('❌ Add message error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/support/stats
   * Get support dashboard statistics
   */
  static async getStats(req: any, res: Response) {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;

      const where = userRole === 'SUPPORT_AGENT' ? { assignedToAgent: userId } : {};

      const [open, pending, inProgress, resolved, total] = await Promise.all([
        prisma.supportTicket.count({ where: { ...where, status: 'OPEN' } }),
        prisma.supportTicket.count({ where: { ...where, status: 'PENDING' } }),
        prisma.supportTicket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.supportTicket.count({ where: { ...where, status: 'RESOLVED' } }),
        prisma.supportTicket.count({ where }),
      ]);

      const avgResolutionTime = await prisma.supportTicket.count({
        where: { ...where, resolvedAt: { not: null } },
      });

      res.json({
        success: true,
        data: {
          totalTickets: total,
          open,
          pending,
          inProgress,
          resolved,
          closed: await prisma.supportTicket.count({ where: { ...where, status: 'CLOSED' } }),
          averageResolutionTimeHours: 48, // Placeholder
        },
      });
    } catch (error: any) {
      console.error('❌ Get stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
