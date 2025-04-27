import type { Express } from "express";
import { requireAdmin } from "./middleware/admin";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertNotificationSchema,
  insertPlanSchema
} from "@shared/schema";

export function registerAdminRoutes(app: Express) {
  // === Admin: User Management ===
  
  // Get all users
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get user by ID
  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Update user (admin operations like suspending account)
  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Admin can only update specific fields like status, isAdmin
      const { status, isAdmin } = req.body;
      const updatedUser = await storage.updateUser(userId, {
        status,
        isAdmin
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // === Admin: Transaction Monitoring ===
  
  // Get all transactions (with optional filters)
  app.get("/api/admin/transactions", requireAdmin, async (req, res) => {
    try {
      // In a real app, we would filter by date range, user, etc.
      // For our in-memory database, we'll collect all transactions
      // and do client-side filtering in the admin UI
      const users = await storage.getAllUsers();
      const allTransactions = [];
      
      for (const user of users) {
        const userTransactions = await storage.getTransactions(user.id);
        allTransactions.push(...userTransactions);
      }
      
      res.json(allTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  // === Admin: Growth Goal Insights ===
  
  // Get all growth goals across all users
  app.get("/api/admin/growth-goals", requireAdmin, async (req, res) => {
    try {
      const allGoals = await storage.getAllGrowthGoals();
      res.json(allGoals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch growth goals" });
    }
  });
  
  // === Admin: Notifications Management ===
  
  // Get all notifications
  app.get("/api/admin/notifications", requireAdmin, async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  // Create new notification
  app.post("/api/admin/notifications", requireAdmin, async (req, res) => {
    try {
      // req.user is guaranteed to exist because of the requireAdmin middleware
      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        createdById: req.user!.id
      });
      
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create notification" });
      }
    }
  });
  
  // Update notification
  app.put("/api/admin/notifications/:id", requireAdmin, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const updatedNotification = await storage.updateNotification(notificationId, req.body);
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });
  
  // Delete notification
  app.delete("/api/admin/notifications/:id", requireAdmin, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const success = await storage.deleteNotification(notificationId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete notification" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  
  // === Admin: Support Tickets ===
  
  // Get all support tickets
  app.get("/api/admin/support-tickets", requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  
  // Get support ticket by ID
  app.get("/api/admin/support-tickets/:id", requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicketById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });
  
  // Update support ticket (assign, change status, add resolution)
  app.put("/api/admin/support-tickets/:id", requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicketById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      const updatedTicket = await storage.updateSupportTicket(ticketId, {
        ...req.body,
        updatedAt: new Date()
      });
      
      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });
  
  // === Admin: Plans Management ===
  
  // Get all plans
  app.get("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  
  // Create new plan
  app.post("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPlanSchema.parse(req.body);
      
      const plan = await storage.createPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create plan" });
      }
    }
  });
  
  // Update plan
  app.put("/api/admin/plans/:id", requireAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      const updatedPlan = await storage.updatePlan(planId, req.body);
      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update plan" });
    }
  });
  
  // === Admin: Dashboard Data ===
  
  // Get admin dashboard statistics
  app.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const activeUsers = users.filter(user => user.status === "active");
      
      // Get all transactions to calculate total revenue monitored
      let totalTransactions = 0;
      let totalRevenue = 0;
      
      for (const user of users) {
        const transactions = await storage.getTransactions(user.id);
        totalTransactions += transactions.length;
        
        // Sum up income transactions
        const revenue = transactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
          
        totalRevenue += revenue;
      }
      
      // Get all growth goals
      const growthGoals = await storage.getAllGrowthGoals();
      const completedGoals = growthGoals.filter(goal => goal.isCompleted);
      
      // Get all support tickets
      const supportTickets = await storage.getSupportTickets();
      const openTickets = supportTickets.filter(ticket => ticket.status === "open");
      
      res.json({
        userStats: {
          totalUsers: users.length,
          activeUsers: activeUsers.length,
          retentionRate: users.length > 0 ? (activeUsers.length / users.length * 100) : 0
        },
        financialStats: {
          totalTransactions,
          totalRevenue,
          averageTransactionValue: totalTransactions > 0 ? (totalRevenue / totalTransactions) : 0
        },
        goalStats: {
          totalGoals: growthGoals.length,
          completedGoals: completedGoals.length,
          completionRate: growthGoals.length > 0 ? (completedGoals.length / growthGoals.length * 100) : 0
        },
        supportStats: {
          totalTickets: supportTickets.length,
          openTickets: openTickets.length,
          responseRate: 95 // Placeholder
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin dashboard data" });
    }
  });
}