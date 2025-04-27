import type { Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { insertSupportTicketSchema } from "@shared/schema";

export function registerUserAdminRoutes(app: Express) {
  // === User: Support Tickets ===
  
  // Get all support tickets for a user
  app.get("/api/support-tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tickets = await storage.getSupportTicketsByUser(req.user.id);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  
  // Get support ticket by ID
  app.get("/api/support-tickets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicketById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      // Check authorization
      if (ticket.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this ticket" });
      }
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });
  
  // Create new support ticket
  app.post("/api/support-tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const ticket = await storage.createSupportTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid ticket data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create support ticket" });
      }
    }
  });
  
  // === User: Notifications ===
  
  // Get all notifications for a user
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const allNotifications = await storage.getNotifications();
      
      // Filter notifications that are meant for this user
      // A notification is for this user if:
      // 1. It targets 'all' users, or
      // 2. The user's ID is specifically included in the targetUserIds
      const userNotifications = allNotifications.filter(notification => {
        if (!notification.isActive) return false;
        
        // Check if notification has expired
        if (notification.expiresAt && new Date(notification.expiresAt) < new Date()) {
          return false;
        }
        
        if (!notification.targetUserIds || notification.targetUserIds === 'all') {
          return true;
        }
        
        // Check if user ID is in the comma-separated list
        const targetIds = notification.targetUserIds.split(',').map(id => parseInt(id.trim()));
        return targetIds.includes(req.user.id);
      });
      
      res.json(userNotifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
}