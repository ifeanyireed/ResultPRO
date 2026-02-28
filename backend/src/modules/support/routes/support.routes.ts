import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { SupportTicketController } from '../controllers/support-ticket.controller';

const router = Router();

// All routes protected by authMiddleware
router.use(authMiddleware);

// Create new ticket
router.post('/', SupportTicketController.createTicket);

// Get tickets (with filters based on user role)
router.get('/', SupportTicketController.getTickets);

// Get specific ticket
router.get('/:id', SupportTicketController.getTicket);

// Update ticket (status, priority, assignment)
router.put('/:id', SupportTicketController.updateTicket);

// Add message to ticket
router.post('/:id/messages', SupportTicketController.addMessage);

// Get support dashboard stats
router.get('/stats/dashboard', SupportTicketController.getStats);

export default router;
