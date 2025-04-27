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
import createMemoryStore from "memorystore";

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

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private profitSplits: Map<number, ProfitSplit>;
  private growthGoals: Map<number, GrowthGoal>;
  private onboardingSteps: Map<number, Onboarding>;
  private supportTickets: Map<number, SupportTicket>;
  private notifications: Map<number, Notification>;
  private plans: Map<number, Plan>;
  private userIdCounter: number;
  private transactionIdCounter: number;
  private profitSplitIdCounter: number;
  private growthGoalIdCounter: number;
  private onboardingIdCounter: number;
  private supportTicketIdCounter: number;
  private notificationIdCounter: number;
  private planIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.profitSplits = new Map();
    this.growthGoals = new Map();
    this.onboardingSteps = new Map();
    this.supportTickets = new Map();
    this.notifications = new Map();
    this.plans = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.profitSplitIdCounter = 1;
    this.growthGoalIdCounter = 1;
    this.onboardingIdCounter = 1;
    this.supportTicketIdCounter = 1;
    this.notificationIdCounter = 1;
    this.planIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }
  
  // Additional methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getAllGrowthGoals(): Promise<GrowthGoal[]> {
    return Array.from(this.growthGoals.values());
  }
  
  // Support ticket methods
  async getSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values());
  }
  
  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values()).filter(
      (ticket) => ticket.userId === userId
    );
  }
  
  async getSupportTicketById(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }
  
  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.supportTicketIdCounter++;
    const createdAt = new Date();
    const supportTicket: SupportTicket = { 
      ...insertTicket, 
      id, 
      createdAt, 
      updatedAt: null,
      status: insertTicket.status || "open",
      priority: insertTicket.priority || "medium",
      assignedToId: insertTicket.assignedToId ?? null,
      resolution: insertTicket.resolution ?? null
    };
    this.supportTickets.set(id, supportTicket);
    return supportTicket;
  }
  
  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...data, updatedAt: new Date() };
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }
  
  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }
  
  async getNotificationById(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const sentAt = new Date();
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      sentAt,
      type: insertNotification.type || "announcement",
      targetUserIds: insertNotification.targetUserIds ?? null,
      expiresAt: insertNotification.expiresAt ?? null,
      isActive: insertNotification.isActive ?? true
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, ...data };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  // Plan methods
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }
  
  async getPlanById(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }
  
  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = this.planIdCounter++;
    const createdAt = new Date();
    const plan: Plan = { 
      ...insertPlan, 
      id, 
      createdAt, 
      updatedAt: null,
      isActive: insertPlan.isActive ?? true,
      billingCycle: insertPlan.billingCycle || "monthly" 
    };
    this.plans.set(id, plan);
    return plan;
  }
  
  async updatePlan(id: number, data: Partial<Plan>): Promise<Plan | undefined> {
    const plan = this.plans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...data, updatedAt: new Date() };
    this.plans.set(id, updatedPlan);
    return updatedPlan;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      businessName: null, 
      industry: null, 
      monthlyRevenue: null,
      isAdmin: false,
      createdAt,
      lastLoginAt: null,
      status: "active"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      date: insertTransaction.date || new Date(),
      category: insertTransaction.category ?? null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...data };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Profit split methods
  async getProfitSplit(userId: number): Promise<ProfitSplit | undefined> {
    return Array.from(this.profitSplits.values()).find(
      (split) => split.userId === userId
    );
  }

  async createProfitSplit(insertProfitSplit: InsertProfitSplit): Promise<ProfitSplit> {
    const id = this.profitSplitIdCounter++;
    const profitSplit: ProfitSplit = { 
      ...insertProfitSplit, 
      id,
      ownerPay: insertProfitSplit.ownerPay || 0,
      reinvestment: insertProfitSplit.reinvestment || 0,
      savings: insertProfitSplit.savings || 0,
      taxReserve: insertProfitSplit.taxReserve || 0
    };
    this.profitSplits.set(id, profitSplit);
    return profitSplit;
  }

  async updateProfitSplit(id: number, data: Partial<ProfitSplit>): Promise<ProfitSplit | undefined> {
    const profitSplit = this.profitSplits.get(id);
    if (!profitSplit) return undefined;
    
    const updatedProfitSplit = { ...profitSplit, ...data };
    this.profitSplits.set(id, updatedProfitSplit);
    return updatedProfitSplit;
  }

  // Growth goal methods
  async getGrowthGoals(userId: number): Promise<GrowthGoal[]> {
    return Array.from(this.growthGoals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async getGrowthGoalById(id: number): Promise<GrowthGoal | undefined> {
    return this.growthGoals.get(id);
  }

  async createGrowthGoal(insertGrowthGoal: InsertGrowthGoal): Promise<GrowthGoal> {
    const id = this.growthGoalIdCounter++;
    const createdAt = new Date();
    const growthGoal: GrowthGoal = { 
      ...insertGrowthGoal, 
      id, 
      createdAt,
      currentAmount: insertGrowthGoal.currentAmount || 0,
      targetDate: insertGrowthGoal.targetDate || null,
      isCompleted: insertGrowthGoal.isCompleted || false
    };
    this.growthGoals.set(id, growthGoal);
    return growthGoal;
  }

  async updateGrowthGoal(id: number, data: Partial<GrowthGoal>): Promise<GrowthGoal | undefined> {
    const growthGoal = this.growthGoals.get(id);
    if (!growthGoal) return undefined;
    
    const updatedGrowthGoal = { ...growthGoal, ...data };
    this.growthGoals.set(id, updatedGrowthGoal);
    return updatedGrowthGoal;
  }

  async deleteGrowthGoal(id: number): Promise<boolean> {
    return this.growthGoals.delete(id);
  }

  // Onboarding methods
  async getOnboarding(userId: number): Promise<Onboarding | undefined> {
    return Array.from(this.onboardingSteps.values()).find(
      (step) => step.userId === userId
    );
  }

  async createOnboarding(insertOnboarding: InsertOnboarding): Promise<Onboarding> {
    const id = this.onboardingIdCounter++;
    const onboardingStep: Onboarding = { 
      ...insertOnboarding, 
      id,
      step: insertOnboarding.step || 1,
      completed: insertOnboarding.completed || false,
      financialGoals: insertOnboarding.financialGoals || null,
      bankConnected: insertOnboarding.bankConnected || false
    };
    this.onboardingSteps.set(id, onboardingStep);
    return onboardingStep;
  }

  async updateOnboarding(userId: number, data: Partial<Onboarding>): Promise<Onboarding | undefined> {
    const onboardingStep = Array.from(this.onboardingSteps.values()).find(
      (step) => step.userId === userId
    );
    if (!onboardingStep) return undefined;
    
    const updatedOnboarding = { ...onboardingStep, ...data };
    this.onboardingSteps.set(onboardingStep.id, updatedOnboarding);
    return updatedOnboarding;
  }
}

export const storage = new MemStorage();
