import { Express } from "express";
import { requireAdmin } from "./middleware/admin";
import { storage } from "./storage";

export function registerAdminRoutes(app: Express) {
  // Apply admin middleware to all admin routes
  app.use("/api/admin", requireAdmin);

  // Get admin dashboard statistics
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const transactions = await Promise.all(
        users.map(user => storage.getTransactions(user.id))
      ).then(results => results.flat());
      const goals = await storage.getAllGrowthGoals();
      const tickets = await storage.getSupportTickets();

      // Calculate statistics
      const activeUsers = users.filter(u => u.status === "active").length;
      const totalRevenue = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const completedGoals = goals.filter(g => g.isCompleted).length;
      const openTickets = tickets.filter(t => t.status === "open").length;

      const stats = {
        userStats: {
          totalUsers: users.length,
          activeUsers,
          retentionRate: users.length > 0 ? (activeUsers / users.length) * 100 : 0
        },
        financialStats: {
          totalTransactions: transactions.length,
          totalRevenue,
          averageTransactionValue: transactions.length > 0 
            ? totalRevenue / transactions.filter(t => t.type === "income").length 
            : 0
        },
        goalStats: {
          totalGoals: goals.length,
          completedGoals,
          completionRate: goals.length > 0 ? (completedGoals / goals.length) * 100 : 0
        },
        supportStats: {
          totalTickets: tickets.length,
          openTickets,
          responseRate: tickets.length > 0 
            ? ((tickets.length - openTickets) / tickets.length) * 100 
            : 0
        }
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // USERS MANAGEMENT
  // Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user
  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // SUPPORT TICKETS
  // Get all support tickets
  app.get("/api/admin/support-tickets", async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets();
      
      // Enhance tickets with username information
      const ticketsWithUsernames = await Promise.all(
        tickets.map(async (ticket) => {
          const user = await storage.getUser(ticket.userId);
          return {
            ...ticket,
            username: user?.username || `User ${ticket.userId}`
          };
        })
      );
      
      res.json(ticketsWithUsernames);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ error: "Failed to fetch support tickets" });
    }
  });

  // Get support ticket by ID
  app.get("/api/admin/support-tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicketById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // Add username to ticket
      const user = await storage.getUser(ticket.userId);
      const ticketWithUsername = {
        ...ticket,
        username: user?.username || `User ${ticket.userId}`
      };
      
      res.json(ticketWithUsername);
    } catch (error) {
      console.error("Error fetching support ticket:", error);
      res.status(500).json({ error: "Failed to fetch support ticket" });
    }
  });

  // Update support ticket
  app.put("/api/admin/support-tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicketById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      const updatedTicket = await storage.updateSupportTicket(ticketId, {
        ...req.body,
        assignedToId: req.body.assignedToId || (req.user ? req.user.id : null),
        updatedAt: new Date()
      });
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ error: "Failed to update support ticket" });
    }
  });

  // NOTIFICATIONS
  // Get all notifications
  app.get("/api/admin/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Get notification by ID
  app.get("/api/admin/notifications/:id", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error("Error fetching notification:", error);
      res.status(500).json({ error: "Failed to fetch notification" });
    }
  });

  // Create notification
  app.post("/api/admin/notifications", async (req, res) => {
    try {
      const newNotification = await storage.createNotification({
        ...req.body,
        createdById: req.user ? req.user.id : 1, // Fallback to ID 1 if req.user is undefined
        sentAt: new Date(),
        // Ensure required fields have default values
        type: req.body.type || "announcement",
        isActive: req.body.isActive === undefined ? true : req.body.isActive
      });
      
      res.status(201).json(newNotification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  // Update notification
  app.put("/api/admin/notifications/:id", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      const updatedNotification = await storage.updateNotification(notificationId, req.body);
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // Delete notification
  app.delete("/api/admin/notifications/:id", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotificationById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      await storage.deleteNotification(notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // PLANS
  // Get all plans
  app.get("/api/admin/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  // Get plan by ID
  app.get("/api/admin/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  // Create plan
  app.post("/api/admin/plans", async (req, res) => {
    try {
      const newPlan = await storage.createPlan({
        ...req.body,
        isActive: req.body.isActive === undefined ? true : req.body.isActive,
        billingCycle: req.body.billingCycle || "monthly"
      });
      
      res.status(201).json(newPlan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(500).json({ error: "Failed to create plan" });
    }
  });

  // Update plan
  app.put("/api/admin/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      const updatedPlan = await storage.updatePlan(planId, {
        ...req.body,
        updatedAt: new Date()
      });
      
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ error: "Failed to update plan" });
    }
  });

  // Database setup endpoint for initial setup in production
  app.post('/api/admin/setup-db', requireAdmin, async (req, res) => {
    try {
      // This endpoint will initialize the database in production
      // Create all necessary tables and demo data
      
      // Use the pg pool from storage
      const pool = storage.getPool();
      
      // Create users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          business_name TEXT,
          industry TEXT,
          monthly_revenue TEXT,
          is_admin BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          last_login_at TIMESTAMP,
          status TEXT DEFAULT 'active',
          currency TEXT DEFAULT 'USD' NOT NULL
        );
      `);
      
      // Create demo users
      await pool.query(`
        INSERT INTO users (username, password, business_name, industry, monthly_revenue, is_admin, currency)
        VALUES 
          ('admin', '$2b$10$9ZKZB9SLG9EnKKbxuVzl6.LnH1aFXLXS1SUhC/8tNgPFEk7.WviC2', 'GrowWise Admin', 'Technology', '$100,000+', true, 'USD'),
          ('demo', '$2b$10$9ZKZB9SLG9EnKKbxuVzl6.LnH1aFXLXS1SUhC/8tNgPFEk7.WviC2', 'Demo Business', 'Retail', '$10,000-$50,000', false, 'USD')
        ON CONFLICT (username) DO NOTHING;
      `);
      
      // Create other tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          category TEXT,
          date TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS profit_splits (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          owner_pay REAL NOT NULL DEFAULT 40,
          reinvestment REAL NOT NULL DEFAULT 30,
          savings REAL NOT NULL DEFAULT 20,
          tax_reserve REAL NOT NULL DEFAULT 10
        );
        
        CREATE TABLE IF NOT EXISTS growth_goals (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          target_amount REAL NOT NULL,
          current_amount REAL NOT NULL DEFAULT 0,
          target_date TIMESTAMP,
          is_completed BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS onboarding (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          step INTEGER NOT NULL DEFAULT 1,
          completed BOOLEAN NOT NULL DEFAULT false,
          financial_goals TEXT,
          bank_connected BOOLEAN NOT NULL DEFAULT false
        );
        
        CREATE TABLE IF NOT EXISTS support_tickets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          resolved_at TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          target_user_ids TEXT,
          sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMP,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_by_id INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS plans (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price REAL NOT NULL,
          billing_cycle TEXT NOT NULL DEFAULT 'monthly',
          features TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS session (
          sid varchar NOT NULL COLLATE "default",
          sess json NOT NULL,
          expire timestamp(6) NOT NULL,
          CONSTRAINT session_pkey PRIMARY KEY (sid)
        );
      `);
      
      res.status(200).json({ success: true, message: 'Database initialized successfully' });
    } catch (error) {
      console.error('Database initialization error:', error);
      res.status(500).json({ success: false, message: 'Database initialization failed', error: String(error) });
    }
  });
}