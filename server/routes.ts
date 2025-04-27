import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertTransactionSchema, 
  insertGrowthGoalSchema, 
  insertProfitSplitSchema,
  insertOnboardingSchema,
  Transaction
} from "@shared/schema";
import { registerAdminRoutes } from "./admin-routes";
import { registerUserAdminRoutes } from "./user-admin-routes";

// Helper function to generate cash reserve chart data based on transactions
function generateCashReserveData(transactions: Transaction[]) {
  const now = new Date();
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  
  // Create date points from two months ago to current date (5 data points)
  const datePoints: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const pointDate = new Date(twoMonthsAgo);
    pointDate.setDate(15); // Middle of month
    pointDate.setMonth(pointDate.getMonth() + Math.floor(i / 2));
    
    // Offset by 15 days for even indices to get start/mid month pattern
    if (i % 2 === 1) {
      pointDate.setDate(1);
      pointDate.setMonth(pointDate.getMonth() + 1);
    }
    
    // Make sure we don't exceed the current date
    if (pointDate > now) {
      pointDate.setTime(now.getTime());
    }
    
    datePoints.push(pointDate);
  }
  
  // Always add current date as the final point to ensure we show the most up-to-date balance
  if (datePoints.length > 0 && datePoints[datePoints.length - 1].getTime() !== now.getTime()) {
    datePoints.push(now);
  }
  
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Generate cash reserve data for each date point
  const cashReserveData = datePoints.map((date) => {
    // Sum all transactions up to this date point
    const relevantTransactions = sortedTransactions.filter(
      (t) => new Date(t.date) <= date
    );
    
    // Calculate balance at this point
    let balance = 0;
    for (const transaction of relevantTransactions) {
      if (transaction.type === "income") {
        balance += transaction.amount;
      } else if (transaction.type === "expense") {
        balance -= transaction.amount;
      }
    }
    
    // Ensure we don't have negative values for chart display purposes
    // In a real app, you might want to show negative balances
    balance = Math.max(0, balance);
    
    return {
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      amount: balance,
    };
  });
  
  // Ensure we have at least one data point
  if (cashReserveData.length === 0) {
    cashReserveData.push({
      date: now.toISOString().split('T')[0],
      amount: 0,
    });
  }
  
  // Make sure the last point is today with the current balance
  const totalBalance = transactions.reduce((sum, t) => {
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
  
  // Add or update the final point to ensure it has the current total
  if (cashReserveData.length > 0) {
    cashReserveData[cashReserveData.length - 1] = {
      date: now.toISOString().split('T')[0],
      amount: Math.max(0, totalBalance), // Prevent negative for display purposes
    };
  }
  
  return cashReserveData;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Register admin-specific routes
  registerAdminRoutes(app);
  
  // Register user-facing admin-related routes (support tickets, notifications)
  registerUserAdminRoutes(app);

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
      
      // Calculate total cash reserve (all time)
      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const cashReserve = Math.max(0, totalIncome - totalExpenses);
      
      // Calculate cash reserve data points for the chart
      // Create 5 data points from 2 months ago to current date
      const cashReserveData = generateCashReserveData(transactions);
      
      // Ensure the last data point has the correct cash reserve amount
      if (cashReserveData.length > 0) {
        cashReserveData[cashReserveData.length - 1].amount = cashReserve;
      }
      
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
          cashReserve: cashReserve,
        },
        cashReserveData: cashReserveData,
        profitSplit: profitSplit || {
          ownerPay: 40,
          reinvestment: 30,
          savings: 20,
          taxReserve: 10
        },
        recentTransactions: transactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 5), // Show most recent transactions first
        growthGoals: growthGoals.slice(0, 3),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // ===== REPORTS API ENDPOINTS =====
  
  // Get recent reports
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Here we're returning mock data, but in a real app you would fetch from database
      const recentReports = [
        {
          id: 1,
          name: "March 2023 Profit & Loss",
          type: "Profit & Loss",
          period: "March 2023",
          createdAt: new Date("2023-04-02"),
          url: "/reports/pl-march-2023.pdf"
        },
        {
          id: 2,
          name: "Q1 2023 Cash Flow",
          type: "Cash Flow",
          period: "Q1 2023",
          createdAt: new Date("2023-04-10"),
          url: "/reports/cashflow-q1-2023.pdf"
        },
        {
          id: 3,
          name: "2022 Annual Growth Analysis",
          type: "Growth Analysis",
          period: "2022",
          createdAt: new Date("2023-01-15"),
          url: "/reports/growth-2022.pdf"
        },
      ];
      
      res.json(recentReports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  
  // Generate a new report
  app.post("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { reportType, period } = req.body;
      
      if (!reportType || !period) {
        return res.status(400).json({ message: "Report type and period are required" });
      }
      
      // In a real app, this would generate an actual report based on transaction data
      // For now, we'll just return a mock report object
      const newReport = {
        id: Math.floor(Math.random() * 1000),
        name: `${period} ${reportType}`,
        type: reportType,
        period: period,
        createdAt: new Date(),
        url: `/reports/${reportType.toLowerCase().replace(/\s+/g, '-')}-${period.toLowerCase().replace(/\s+/g, '-')}.pdf`
      };
      
      res.status(201).json(newReport);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });
  
  // Download a report
  app.get("/api/reports/:id/download", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const reportId = parseInt(req.params.id);
      
      // In a real app, you would look up the report from the database
      // and return the actual file for download
      
      // For now, just return a success response
      res.json({ success: true, message: "Report download initiated", reportId });
    } catch (error) {
      res.status(500).json({ message: "Failed to download report" });
    }
  });
  
  // Email a report
  app.post("/api/reports/:id/email", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const reportId = parseInt(req.params.id);
      
      // In a real app, you would look up the report from the database
      // and send an email with the report attached
      
      // For now, just return a success response
      res.json({ success: true, message: "Report sent to email", reportId });
    } catch (error) {
      res.status(500).json({ message: "Failed to email report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
