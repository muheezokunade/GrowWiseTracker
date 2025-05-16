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
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

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
    // Use PostgreSQL for session storage
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // Get the database pool for direct queries
  getPool() {
    return pool;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Make sure all required fields are present with defaults if needed
    const userToInsert = {
      ...insertUser,
      currency: insertUser.currency || "USD",
    };

    const [user] = await db.insert(users).values(userToInsert).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId));
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const [transaction] = await db.update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions)
      .where(eq(transactions.id, id));
    return true; // In Drizzle, delete doesn't return a count but we assume success
  }

  // Profit split operations
  async getProfitSplit(userId: number): Promise<ProfitSplit | undefined> {
    const [profitSplit] = await db.select()
      .from(profitSplits)
      .where(eq(profitSplits.userId, userId));
    return profitSplit;
  }

  async createProfitSplit(insertProfitSplit: InsertProfitSplit): Promise<ProfitSplit> {
    const [profitSplit] = await db.insert(profitSplits)
      .values(insertProfitSplit)
      .returning();
    return profitSplit;
  }

  async updateProfitSplit(id: number, data: Partial<ProfitSplit>): Promise<ProfitSplit | undefined> {
    const [profitSplit] = await db.update(profitSplits)
      .set(data)
      .where(eq(profitSplits.id, id))
      .returning();
    return profitSplit;
  }

  // Growth goal operations
  async getGrowthGoals(userId: number): Promise<GrowthGoal[]> {
    return await db.select()
      .from(growthGoals)
      .where(eq(growthGoals.userId, userId));
  }

  async getGrowthGoalById(id: number): Promise<GrowthGoal | undefined> {
    const [goal] = await db.select()
      .from(growthGoals)
      .where(eq(growthGoals.id, id));
    return goal;
  }

  async createGrowthGoal(insertGrowthGoal: InsertGrowthGoal): Promise<GrowthGoal> {
    const [goal] = await db.insert(growthGoals)
      .values(insertGrowthGoal)
      .returning();
    return goal;
  }

  async updateGrowthGoal(id: number, data: Partial<GrowthGoal>): Promise<GrowthGoal | undefined> {
    const [goal] = await db.update(growthGoals)
      .set(data)
      .where(eq(growthGoals.id, id))
      .returning();
    return goal;
  }

  async deleteGrowthGoal(id: number): Promise<boolean> {
    await db.delete(growthGoals)
      .where(eq(growthGoals.id, id));
    return true;
  }

  async getAllGrowthGoals(): Promise<GrowthGoal[]> {
    return await db.select().from(growthGoals);
  }

  // Onboarding operations
  async getOnboarding(userId: number): Promise<Onboarding | undefined> {
    const [onboardingData] = await db.select()
      .from(onboarding)
      .where(eq(onboarding.userId, userId));
    return onboardingData;
  }

  async createOnboarding(insertOnboarding: InsertOnboarding): Promise<Onboarding> {
    const [onboardingData] = await db.insert(onboarding)
      .values(insertOnboarding)
      .returning();
    return onboardingData;
  }

  async updateOnboarding(userId: number, data: Partial<Onboarding>): Promise<Onboarding | undefined> {
    const [onboardingData] = await db.update(onboarding)
      .set(data)
      .where(eq(onboarding.userId, userId))
      .returning();
    return onboardingData;
  }

  // Support ticket operations
  async getSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets);
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return await db.select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId));
  }

  async getSupportTicketById(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));
    return ticket;
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db.insert(supportTickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [ticket] = await db.update(supportTickets)
      .set(data)
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket;
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications);
  }

  async getNotificationById(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const [notification] = await db.update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    await db.delete(notifications)
      .where(eq(notifications.id, id));
    return true;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans);
  }

  async getPlanById(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select()
      .from(plans)
      .where(eq(plans.id, id));
    return plan;
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updatePlan(id: number, data: Partial<Plan>): Promise<Plan | undefined> {
    const [plan] = await db.update(plans)
      .set(data)
      .where(eq(plans.id, id))
      .returning();
    return plan;
  }
}

// Memory Storage Implementation for development
export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: User[] = [];
  private transactions: Transaction[] = [];
  private profitSplits: ProfitSplit[] = [];
  private growthGoals: GrowthGoal[] = [];
  private onboardingData: Onboarding[] = [];
  private supportTicketsData: SupportTicket[] = [];
  private notificationsData: Notification[] = [];
  private plansData: Plan[] = [];
  private idCounter = { 
    user: 1,
    transaction: 1,
    profitSplit: 1,
    growthGoal: 1,
    onboarding: 1,
    supportTicket: 1,
    notification: 1,
    plan: 1
  };

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add demo admin user
    this.users.push({
      id: this.idCounter.user++,
      username: "admin",
      password: "$2b$10$9ZKZB9SLG9EnKKbxuVzl6.LnH1aFXLXS1SUhC/8tNgPFEk7.WviC2", // password: admin
      businessName: "GrowWise Admin",
      industry: "Technology",
      monthlyRevenue: "$100,000+",
      isAdmin: true,
      createdAt: new Date(),
      lastLoginAt: null,
      status: "active",
      currency: "USD"
    });
    
    // Add demo regular user
    this.users.push({
      id: this.idCounter.user++,
      username: "demo",
      password: "$2b$10$9ZKZB9SLG9EnKKbxuVzl6.LnH1aFXLXS1SUhC/8tNgPFEk7.WviC2", // password: admin
      businessName: "Demo Business",
      industry: "Retail",
      monthlyRevenue: "$10,000-$50,000",
      isAdmin: false,
      createdAt: new Date(),
      lastLoginAt: null,
      status: "active",
      currency: "USD"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.idCounter.user++,
      username: insertUser.username,
      password: insertUser.password,
      businessName: insertUser.businessName || null,
      industry: insertUser.industry || null,
      monthlyRevenue: insertUser.monthlyRevenue || null,
      createdAt: new Date(),
      lastLoginAt: null,
      status: "active",
      isAdmin: false,
      currency: insertUser.currency || "USD"
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return this.transactions.filter(transaction => transaction.userId === userId);
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.find(transaction => transaction.id === id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.idCounter.transaction++,
      ...insertTransaction,
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const index = this.transactions.findIndex(transaction => transaction.id === id);
    if (index === -1) return undefined;
    this.transactions[index] = { ...this.transactions[index], ...data };
    return this.transactions[index];
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const index = this.transactions.findIndex(transaction => transaction.id === id);
    if (index === -1) return false;
    this.transactions.splice(index, 1);
    return true;
  }

  // Profit split operations
  async getProfitSplit(userId: number): Promise<ProfitSplit | undefined> {
    return this.profitSplits.find(profitSplit => profitSplit.userId === userId);
  }

  async createProfitSplit(insertProfitSplit: InsertProfitSplit): Promise<ProfitSplit> {
    const profitSplit: ProfitSplit = {
      id: this.idCounter.profitSplit++,
      ...insertProfitSplit,
    };
    this.profitSplits.push(profitSplit);
    return profitSplit;
  }

  async updateProfitSplit(id: number, data: Partial<ProfitSplit>): Promise<ProfitSplit | undefined> {
    const index = this.profitSplits.findIndex(profitSplit => profitSplit.id === id);
    if (index === -1) return undefined;
    this.profitSplits[index] = { ...this.profitSplits[index], ...data };
    return this.profitSplits[index];
  }

  // Growth goal operations
  async getGrowthGoals(userId: number): Promise<GrowthGoal[]> {
    return this.growthGoals.filter(goal => goal.userId === userId);
  }

  async getGrowthGoalById(id: number): Promise<GrowthGoal | undefined> {
    return this.growthGoals.find(goal => goal.id === id);
  }

  async createGrowthGoal(insertGrowthGoal: InsertGrowthGoal): Promise<GrowthGoal> {
    const goal: GrowthGoal = {
      id: this.idCounter.growthGoal++,
      ...insertGrowthGoal,
      createdAt: new Date(),
    };
    this.growthGoals.push(goal);
    return goal;
  }

  async updateGrowthGoal(id: number, data: Partial<GrowthGoal>): Promise<GrowthGoal | undefined> {
    const index = this.growthGoals.findIndex(goal => goal.id === id);
    if (index === -1) return undefined;
    this.growthGoals[index] = { ...this.growthGoals[index], ...data };
    return this.growthGoals[index];
  }

  async deleteGrowthGoal(id: number): Promise<boolean> {
    const index = this.growthGoals.findIndex(goal => goal.id === id);
    if (index === -1) return false;
    this.growthGoals.splice(index, 1);
    return true;
  }

  async getAllGrowthGoals(): Promise<GrowthGoal[]> {
    return [...this.growthGoals];
  }

  // Onboarding operations
  async getOnboarding(userId: number): Promise<Onboarding | undefined> {
    return this.onboardingData.find(data => data.userId === userId);
  }

  async createOnboarding(insertOnboarding: InsertOnboarding): Promise<Onboarding> {
    const onboardingData: Onboarding = {
      id: this.idCounter.onboarding++,
      ...insertOnboarding,
    };
    this.onboardingData.push(onboardingData);
    return onboardingData;
  }

  async updateOnboarding(userId: number, data: Partial<Onboarding>): Promise<Onboarding | undefined> {
    const index = this.onboardingData.findIndex(onb => onb.userId === userId);
    if (index === -1) return undefined;
    this.onboardingData[index] = { ...this.onboardingData[index], ...data };
    return this.onboardingData[index];
  }

  // Support ticket operations
  async getSupportTickets(): Promise<SupportTicket[]> {
    return [...this.supportTicketsData];
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return this.supportTicketsData.filter(ticket => ticket.userId === userId);
  }

  async getSupportTicketById(id: number): Promise<SupportTicket | undefined> {
    return this.supportTicketsData.find(ticket => ticket.id === id);
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: this.idCounter.supportTicket++,
      ...insertTicket,
      createdAt: new Date(),
      updatedAt: null,
      status: "open",
      priority: "medium",
      assignedToId: null,
      resolution: null,
    };
    this.supportTicketsData.push(ticket);
    return ticket;
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const index = this.supportTicketsData.findIndex(ticket => ticket.id === id);
    if (index === -1) return undefined;
    this.supportTicketsData[index] = { 
      ...this.supportTicketsData[index], 
      ...data,
      updatedAt: new Date()
    };
    return this.supportTicketsData[index];
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    return [...this.notificationsData];
  }

  async getNotificationById(id: number): Promise<Notification | undefined> {
    return this.notificationsData.find(notification => notification.id === id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.idCounter.notification++,
      ...insertNotification,
      sentAt: new Date(),
      isActive: true,
    };
    this.notificationsData.push(notification);
    return notification;
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const index = this.notificationsData.findIndex(notification => notification.id === id);
    if (index === -1) return undefined;
    this.notificationsData[index] = { ...this.notificationsData[index], ...data };
    return this.notificationsData[index];
  }

  async deleteNotification(id: number): Promise<boolean> {
    const index = this.notificationsData.findIndex(notification => notification.id === id);
    if (index === -1) return false;
    this.notificationsData.splice(index, 1);
    return true;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return [...this.plansData];
  }

  async getPlanById(id: number): Promise<Plan | undefined> {
    return this.plansData.find(plan => plan.id === id);
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const plan: Plan = {
      id: this.idCounter.plan++,
      ...insertPlan,
      createdAt: new Date(),
      updatedAt: null,
      isActive: true,
    };
    this.plansData.push(plan);
    return plan;
  }

  async updatePlan(id: number, data: Partial<Plan>): Promise<Plan | undefined> {
    const index = this.plansData.findIndex(plan => plan.id === id);
    if (index === -1) return undefined;
    this.plansData[index] = { 
      ...this.plansData[index], 
      ...data,
      updatedAt: new Date()
    };
    return this.plansData[index];
  }
}

// Use the PostgreSQL storage implementation instead of memory storage
export const storage = new DatabaseStorage();