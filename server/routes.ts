import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertTransactionSchema, 
  insertGrowthGoalSchema, 
  insertProfitSplitSchema,
  insertOnboardingSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // === Transactions API ===
  
  // Get all transactions for a user
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactions = await storage.getTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get transaction by ID
  app.get("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check authorization
      if (transaction.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this transaction" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Create new transaction
  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  // Update transaction
  app.put("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check authorization
      if (transaction.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this transaction" });
      }
      
      const updatedTransaction = await storage.updateTransaction(transactionId, req.body);
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Delete transaction
  app.delete("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check authorization
      if (transaction.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this transaction" });
      }
      
      const success = await storage.deleteTransaction(transactionId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete transaction" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // === Profit Split API ===
  
  // Get profit split for a user
  app.get("/api/profit-split", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const profitSplit = await storage.getProfitSplit(req.user.id);
      if (!profitSplit) {
        // If no profit split exists, create a default one
        const newProfitSplit = await storage.createProfitSplit({
          userId: req.user.id,
          ownerPay: 40,
          reinvestment: 30,
          savings: 20,
          taxReserve: 10
        });
        return res.json(newProfitSplit);
      }
      res.json(profitSplit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profit split" });
    }
  });

  // Update profit split
  app.put("/api/profit-split", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get existing profit split or create if doesn't exist
      let profitSplit = await storage.getProfitSplit(req.user.id);
      
      if (!profitSplit) {
        // Create new profit split with default values first
        profitSplit = await storage.createProfitSplit({
          userId: req.user.id,
          ownerPay: 40,
          reinvestment: 30,
          savings: 20,
          taxReserve: 10
        });
      }
      
      // Validate that percentages add up to 100%
      const { ownerPay, reinvestment, savings, taxReserve } = req.body;
      const total = Number(ownerPay) + Number(reinvestment) + Number(savings) + Number(taxReserve);
      
      if (Math.abs(total - 100) > 0.1) {
        return res.status(400).json({ message: "Percentages must add up to 100%" });
      }
      
      const updatedProfitSplit = await storage.updateProfitSplit(profitSplit.id, req.body);
      res.json(updatedProfitSplit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profit split" });
    }
  });

  // === Growth Goals API ===
  
  // Get all growth goals for a user
  app.get("/api/growth-goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const goals = await storage.getGrowthGoals(req.user.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch growth goals" });
    }
  });

  // Get growth goal by ID
  app.get("/api/growth-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGrowthGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Growth goal not found" });
      }
      
      // Check authorization
      if (goal.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this goal" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch growth goal" });
    }
  });

  // Create new growth goal
  app.post("/api/growth-goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertGrowthGoalSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const goal = await storage.createGrowthGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid growth goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create growth goal" });
      }
    }
  });

  // Update growth goal
  app.put("/api/growth-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGrowthGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Growth goal not found" });
      }
      
      // Check authorization
      if (goal.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this goal" });
      }
      
      const updatedGoal = await storage.updateGrowthGoal(goalId, req.body);
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update growth goal" });
    }
  });

  // Delete growth goal
  app.delete("/api/growth-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGrowthGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Growth goal not found" });
      }
      
      // Check authorization
      if (goal.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this goal" });
      }
      
      const success = await storage.deleteGrowthGoal(goalId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete growth goal" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete growth goal" });
    }
  });

  // === Onboarding API ===
  
  // Get onboarding status for a user
  app.get("/api/onboarding", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const onboarding = await storage.getOnboarding(req.user.id);
      if (!onboarding) {
        // If no onboarding record exists, create a default one
        const newOnboarding = await storage.createOnboarding({
          userId: req.user.id,
          step: 1,
          completed: false,
          bankConnected: false
        });
        return res.json(newOnboarding);
      }
      res.json(onboarding);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch onboarding status" });
    }
  });

  // Update onboarding status
  app.put("/api/onboarding", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get existing onboarding or create if doesn't exist
      let onboardingStatus = await storage.getOnboarding(req.user.id);
      
      if (!onboardingStatus) {
        // Create new onboarding record with default values
        onboardingStatus = await storage.createOnboarding({
          userId: req.user.id,
          step: 1,
          completed: false,
          bankConnected: false
        });
      }
      
      const updatedOnboarding = await storage.updateOnboarding(req.user.id, req.body);
      res.json(updatedOnboarding);
    } catch (error) {
      res.status(500).json({ message: "Failed to update onboarding status" });
    }
  });

  // === User Profile API ===

  // Update user profile
  app.put("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { businessName, industry, monthlyRevenue } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, {
        businessName,
        industry,
        monthlyRevenue
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // === Dashboard Summary API ===

  // Get dashboard summary data
  app.get("/api/dashboard/summary", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactions = await storage.getTransactions(req.user.id);
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      // Filter for current month transactions
      const currentMonthTransactions = transactions.filter(
        (t) => new Date(t.date) >= firstDayOfMonth
      );
      
      // Calculate total revenue and expenses
      const revenue = currentMonthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = currentMonthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const profit = revenue - expenses;
      
      // Get profit split percentages
      const profitSplit = await storage.getProfitSplit(req.user.id);
      
      // Get growth goals
      const growthGoals = await storage.getGrowthGoals(req.user.id);
      
      // Return the dashboard summary
      res.json({
        summary: {
          revenue,
          expenses,
          profit,
          cashReserve: 15750, // Placeholder for now
        },
        profitSplit: profitSplit || {
          ownerPay: 40,
          reinvestment: 30,
          savings: 20,
          taxReserve: 10
        },
        recentTransactions: currentMonthTransactions.slice(0, 5),
        growthGoals: growthGoals.slice(0, 3),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
