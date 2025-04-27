import { 
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  profitSplits, type ProfitSplit, type InsertProfitSplit,
  growthGoals, type GrowthGoal, type InsertGrowthGoal,
  onboarding, type Onboarding, type InsertOnboarding,
  supportTickets, type SupportTicket, type InsertSupportTicket,
  notifications, type Notification, type InsertNotification,
  plans, type Plan, type InsertPlan
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";
import { handleDatabaseError } from "./error-handler";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Profit split operations
  getProfitSplit(userId: number): Promise<ProfitSplit | undefined>;
  createProfitSplit(profitSplit: InsertProfitSplit): Promise<ProfitSplit>;
  updateProfitSplit(id: number, data: Partial<ProfitSplit>): Promise<ProfitSplit | undefined>;
  
  // Growth goal operations
  getGrowthGoals(userId: number): Promise<GrowthGoal[]>;
  getGrowthGoalById(id: number): Promise<GrowthGoal | undefined>;
  createGrowthGoal(goal: InsertGrowthGoal): Promise<GrowthGoal>;
  updateGrowthGoal(id: number, data: Partial<GrowthGoal>): Promise<GrowthGoal | undefined>;
  deleteGrowthGoal(id: number): Promise<boolean>;
  getAllGrowthGoals(): Promise<GrowthGoal[]>;
  
  // Onboarding operations
  getOnboarding(userId: number): Promise<Onboarding | undefined>;
  createOnboarding(onboarding: InsertOnboarding): Promise<Onboarding>;
  updateOnboarding(userId: number, data: Partial<Onboarding>): Promise<Onboarding | undefined>;
  
  // Support ticket operations
  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicketsByUser(userId: number): Promise<SupportTicket[]>;
  getSupportTicketById(id: number): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  
  // Notification operations
  getNotifications(): Promise<Notification[]>;
  getNotificationById(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Plan operations
  getPlans(): Promise<Plan[]>;
  getPlanById(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, data: Partial<Plan>): Promise<Plan | undefined>;
  
  sessionStore: session.Store;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      // Check if db instance is available first
      if (!db) {
        throw new Error('Database connection is not available');
      }
      
      // Only use PostgreSQL session store if pool is available
      if (pool) {
        this.sessionStore = new PostgresSessionStore({ 
          pool: pool as any, // Type assertion to avoid TypeScript errors
          createTableIfMissing: true,
          tableName: 'session' // Explicit table name
        });
        console.log('Using PostgreSQL session store');
      } else {
        throw new Error('Database pool is not available');
      }
      
      // Perform a simple test query to verify the database is accessible
      db.select({ value: sql`1` }).limit(1).then(() => {
        console.log('Successfully connected to the database');
      }).catch(err => {
        console.error('Database connection test failed:', err);
        throw new Error('Database connection test failed');
      });
    } catch (error) {
      // Fall back to memory store if PostgreSQL connection fails
      console.warn('Failed to create PostgreSQL session store, falling back to memory store:', error);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
      console.log('Using memory session store');
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      handleDatabaseError(error, `get user with id ${id}`);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      handleDatabaseError(error, `get user with username ${username}`);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Make sure all required fields are present with defaults if needed
      const userToInsert = {
        ...insertUser,
        currency: insertUser.currency || "USD",
      };

      const [user] = await db.insert(users).values(userToInsert).returning();
      return user;
    } catch (error) {
      handleDatabaseError(error, `create user`);
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    try {
      const [user] = await db.update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      handleDatabaseError(error, `update user with id ${id}`);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      handleDatabaseError(error, `get all users`);
    }
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    try {
      return await db.select()
        .from(transactions)
        .where(eq(transactions.userId, userId));
    } catch (error) {
      handleDatabaseError(error, `get transactions for user ${userId}`);
    }
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db.select()
        .from(transactions)
        .where(eq(transactions.id, id));
      return transaction;
    } catch (error) {
      handleDatabaseError(error, `get transaction with id ${id}`);
    }
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    try {
      const [transaction] = await db.insert(transactions)
        .values(insertTransaction)
        .returning();
      return transaction;
    } catch (error) {
      handleDatabaseError(error, `create transaction`);
    }
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db.update(transactions)
        .set(data)
        .where(eq(transactions.id, id))
        .returning();
      return transaction;
    } catch (error) {
      handleDatabaseError(error, `update transaction with id ${id}`);
    }
  }

  async deleteTransaction(id: number): Promise<boolean> {
    try {
      await db.delete(transactions)
        .where(eq(transactions.id, id));
      return true; // In Drizzle, delete doesn't return a count but we assume success
    } catch (error) {
      handleDatabaseError(error, `delete transaction with id ${id}`);
    }
  }

  // Profit split operations
  async getProfitSplit(userId: number): Promise<ProfitSplit | undefined> {
    try {
      const [profitSplit] = await db.select()
        .from(profitSplits)
        .where(eq(profitSplits.userId, userId));
      return profitSplit;
    } catch (error) {
      handleDatabaseError(error, `get profit split for user ${userId}`);
    }
  }

  async createProfitSplit(insertProfitSplit: InsertProfitSplit): Promise<ProfitSplit> {
    try {
      const [profitSplit] = await db.insert(profitSplits)
        .values(insertProfitSplit)
        .returning();
      return profitSplit;
    } catch (error) {
      handleDatabaseError(error, `create profit split`);
    }
  }

  async updateProfitSplit(id: number, data: Partial<ProfitSplit>): Promise<ProfitSplit | undefined> {
    try {
      const [profitSplit] = await db.update(profitSplits)
        .set(data)
        .where(eq(profitSplits.id, id))
        .returning();
      return profitSplit;
    } catch (error) {
      handleDatabaseError(error, `update profit split with id ${id}`);
    }
  }

  // Growth goal operations
  async getGrowthGoals(userId: number): Promise<GrowthGoal[]> {
    try {
      return await db.select()
        .from(growthGoals)
        .where(eq(growthGoals.userId, userId));
    } catch (error) {
      handleDatabaseError(error, `get growth goals for user ${userId}`);
    }
  }

  async getGrowthGoalById(id: number): Promise<GrowthGoal | undefined> {
    try {
      const [goal] = await db.select()
        .from(growthGoals)
        .where(eq(growthGoals.id, id));
      return goal;
    } catch (error) {
      handleDatabaseError(error, `get growth goal with id ${id}`);
    }
  }

  async createGrowthGoal(insertGrowthGoal: InsertGrowthGoal): Promise<GrowthGoal> {
    try {
      const [goal] = await db.insert(growthGoals)
        .values(insertGrowthGoal)
        .returning();
      return goal;
    } catch (error) {
      handleDatabaseError(error, `create growth goal`);
    }
  }

  async updateGrowthGoal(id: number, data: Partial<GrowthGoal>): Promise<GrowthGoal | undefined> {
    try {
      const [goal] = await db.update(growthGoals)
        .set(data)
        .where(eq(growthGoals.id, id))
        .returning();
      return goal;
    } catch (error) {
      handleDatabaseError(error, `update growth goal with id ${id}`);
    }
  }

  async deleteGrowthGoal(id: number): Promise<boolean> {
    try {
      await db.delete(growthGoals)
        .where(eq(growthGoals.id, id));
      return true;
    } catch (error) {
      handleDatabaseError(error, `delete growth goal with id ${id}`);
    }
  }

  async getAllGrowthGoals(): Promise<GrowthGoal[]> {
    try {
      return await db.select().from(growthGoals);
    } catch (error) {
      handleDatabaseError(error, `get all growth goals`);
    }
  }

  // Onboarding operations
  async getOnboarding(userId: number): Promise<Onboarding | undefined> {
    try {
      const [onboardingData] = await db.select()
        .from(onboarding)
        .where(eq(onboarding.userId, userId));
      return onboardingData;
    } catch (error) {
      handleDatabaseError(error, `get onboarding for user ${userId}`);
    }
  }

  async createOnboarding(insertOnboarding: InsertOnboarding): Promise<Onboarding> {
    try {
      const [onboardingData] = await db.insert(onboarding)
        .values(insertOnboarding)
        .returning();
      return onboardingData;
    } catch (error) {
      handleDatabaseError(error, `create onboarding`);
    }
  }

  async updateOnboarding(userId: number, data: Partial<Onboarding>): Promise<Onboarding | undefined> {
    try {
      const [onboardingData] = await db.update(onboarding)
        .set(data)
        .where(eq(onboarding.userId, userId))
        .returning();
      return onboardingData;
    } catch (error) {
      handleDatabaseError(error, `update onboarding for user ${userId}`);
    }
  }

  // Support ticket operations
  async getSupportTickets(): Promise<SupportTicket[]> {
    try {
      return await db.select().from(supportTickets);
    } catch (error) {
      handleDatabaseError(error, `get all support tickets`);
    }
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    try {
      return await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, userId));
    } catch (error) {
      handleDatabaseError(error, `get support tickets for user ${userId}`);
    }
  }

  async getSupportTicketById(id: number): Promise<SupportTicket | undefined> {
    try {
      const [ticket] = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.id, id));
      return ticket;
    } catch (error) {
      handleDatabaseError(error, `get support ticket with id ${id}`);
    }
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    try {
      const [ticket] = await db.insert(supportTickets)
        .values(insertTicket)
        .returning();
      return ticket;
    } catch (error) {
      handleDatabaseError(error, `create support ticket`);
    }
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    try {
      const [ticket] = await db.update(supportTickets)
        .set(data)
        .where(eq(supportTickets.id, id))
        .returning();
      return ticket;
    } catch (error) {
      handleDatabaseError(error, `update support ticket with id ${id}`);
    }
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    try {
      return await db.select().from(notifications);
    } catch (error) {
      handleDatabaseError(error, `get all notifications`);
    }
  }

  async getNotificationById(id: number): Promise<Notification | undefined> {
    try {
      const [notification] = await db.select()
        .from(notifications)
        .where(eq(notifications.id, id));
      return notification;
    } catch (error) {
      handleDatabaseError(error, `get notification with id ${id}`);
    }
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    try {
      const [notification] = await db.insert(notifications)
        .values(insertNotification)
        .returning();
      return notification;
    } catch (error) {
      handleDatabaseError(error, `create notification`);
    }
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    try {
      const [notification] = await db.update(notifications)
        .set(data)
        .where(eq(notifications.id, id))
        .returning();
      return notification;
    } catch (error) {
      handleDatabaseError(error, `update notification with id ${id}`);
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      await db.delete(notifications)
        .where(eq(notifications.id, id));
      return true;
    } catch (error) {
      handleDatabaseError(error, `delete notification with id ${id}`);
    }
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    try {
      return await db.select().from(plans);
    } catch (error) {
      handleDatabaseError(error, `get all plans`);
    }
  }

  async getPlanById(id: number): Promise<Plan | undefined> {
    try {
      const [plan] = await db.select()
        .from(plans)
        .where(eq(plans.id, id));
      return plan;
    } catch (error) {
      handleDatabaseError(error, `get plan with id ${id}`);
    }
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    try {
      const [plan] = await db.insert(plans)
        .values(insertPlan)
        .returning();
      return plan;
    } catch (error) {
      handleDatabaseError(error, `create plan`);
    }
  }

  async updatePlan(id: number, data: Partial<Plan>): Promise<Plan | undefined> {
    try {
      const [plan] = await db.update(plans)
        .set(data)
        .where(eq(plans.id, id))
        .returning();
      return plan;
    } catch (error) {
      handleDatabaseError(error, `update plan with id ${id}`);
    }
  }
}

// Create the storage implementation with database or fallback
let storageImpl: IStorage;

try {
  storageImpl = new DatabaseStorage();
} catch (error) {
  console.warn('Failed to create database storage, falling back to memory storage:', error);
  
  // Import and use memory storage if database connection fails
  const { MemoryStorage } = require('./memory-storage');
  storageImpl = new MemoryStorage();
}

export const storage = storageImpl;