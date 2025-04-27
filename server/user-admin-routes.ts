import { Express } from "express";
import { storage } from "./storage";

export function registerUserAdminRoutes(app: Express) {
  // Get user's support tickets
  app.get("/api/support-tickets", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const tickets = await storage.getSupportTicketsByUser(req.user.id);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ error: "Failed to fetch support tickets" });
    }
  });

  // Create a support ticket
  app.post("/api/support-tickets", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const ticket = await storage.createSupportTicket({
        userId: req.user.id,
        subject: req.body.subject,
        message: req.body.message,
        status: "open",
        priority: req.body.priority || "medium",
        assignedToId: null,
        resolution: null
      });
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ error: "Failed to create support ticket" });
    }
  });

  // Get notifications for the current user
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const allNotifications = await storage.getNotifications();
      
      // Filter notifications: show if it's active, not expired, and either targeted to all users or specifically to this user
      const currentDate = new Date();
      const userNotifications = allNotifications.filter(notification => 
        notification.isActive && 
        (!notification.expiresAt || new Date(notification.expiresAt) > currentDate) &&
        (notification.targetUserIds === "all" || 
         (notification.targetUserIds && notification.targetUserIds.split(',').includes(req.user.id.toString())))
      );
      
      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Get available subscription plans
  app.get("/api/plans", async (req, res) => {
    try {
      const allPlans = await storage.getPlans();
      
      // Only show active plans to users
      const activePlans = allPlans.filter(plan => plan.isActive);
      
      res.json(activePlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  // Get plan by ID
  app.get("/api/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      // Don't show inactive plans to users
      if (!plan.isActive) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  });
}