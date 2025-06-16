import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated, isSuperAdmin } from "../middleware/auth";
import { insertSupportTicketSchema, insertSupportTicketResponseSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

const router = Router();

// Get all support tickets (Super admin only)
router.get("/tickets", isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const tickets = await storage.getAllSupportTickets();
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ message: "Failed to fetch support tickets" });
  }
});

// Create a new support ticket
router.post("/tickets", isAuthenticated, async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      submitterId: req.session.userId!,
      submitterName: req.user?.email || "Unknown User",
      submitterEmail: req.user?.email || "unknown@example.com"
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
router.get("/tickets/:id", isAuthenticated, async (req, res) => {
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

// Update ticket status (Super admin only)
router.put("/tickets/:id/status", isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const { status } = req.body;
    if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ticket = await storage.updateSupportTicketStatus(ticketId, status);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ message: "Failed to update ticket status" });
  }
});

// Add response to a ticket
router.post("/tickets/:id/responses", isAuthenticated, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const validatedData = insertSupportTicketResponseSchema.parse(req.body);
    
    // Check if ticket exists and user has permission
    const ticket = await storage.getSupportTicket(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (req.user?.role !== "super_admin" && ticket.submitterId !== req.session.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const responseData = {
      ...validatedData,
      ticketId,
      createdBy: req.user?.email || "Unknown User",
      createdByRole: req.user?.role || "unknown"
    };

    const response = await storage.createSupportTicketResponse(responseData);
    res.status(201).json(response);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating support response:", error);
    res.status(500).json({ message: "Failed to create support response" });
  }
});

// Get responses for a ticket
router.get("/tickets/:id/responses", isAuthenticated, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    // Check if ticket exists and user has permission
    const ticket = await storage.getSupportTicket(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (req.user?.role !== "super_admin" && ticket.submitterId !== req.session.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const responses = await storage.getSupportTicketResponses(ticketId);
    res.json(responses);
  } catch (error) {
    console.error("Error fetching support responses:", error);
    res.status(500).json({ message: "Failed to fetch support responses" });
  }
});

export default router;