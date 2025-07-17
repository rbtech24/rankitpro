import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, isSuperAdmin } from '../middleware/auth';
import { insertSupportTicketSchema } from '@shared/schema';
import { fromZodError } from 'zod-validation-error';

const router = Router();

// Get support tickets
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let tickets;
    
    if (req.user?.role === "super_admin") {
      // Super admin sees all tickets
      tickets = await storage.getAllSupportTickets();
    } else {
      // Company users see only their company's tickets
      const companyId = req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with this user" });
      }
      tickets = await storage.getSupportTicketsByCompany(companyId);
    }
    
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ message: "Failed to fetch support tickets" });
  }
});

// Create a new support ticket
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      submitterId: req.session.userId!,
      submitterName: req.user?.email || "Unknown User",
      submitterEmail: req.user?.email || "unknown@user.com"
    };
    
    const validatedData = insertSupportTicketSchema.parse(ticketData);

    const ticket = await storage.createSupportTicket(validatedData);
    res.status(201).json(ticket);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating support ticket:", error);
    res.status(500).json({ message: "Failed to create support ticket" });
  }
});

// Get a specific support ticket
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await storage.getSupportTicket(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if user has permission to view this ticket
    if (req.user?.role !== "super_admin" && ticket.submitterId !== req.session.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    res.status(500).json({ message: "Failed to fetch support ticket" });
  }
});

// Update ticket status (admin only)
router.put('/:id/status', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedTicket = await storage.updateSupportTicketStatus(ticketId, status);
    res.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ message: "Failed to update ticket status" });
  }
});

// Resolve ticket (admin only)
router.put('/:id/resolve', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { resolution } = req.body;

    if (!resolution || resolution.trim().length === 0) {
      return res.status(400).json({ message: "Resolution is required" });
    }

    const resolvedTicket = await storage.resolveSupportTicket(ticketId, resolution, req.session.userId!);
    res.json(resolvedTicket);
  } catch (error) {
    console.error("Error resolving ticket:", error);
    res.status(500).json({ message: "Failed to resolve ticket" });
  }
});

export default router;