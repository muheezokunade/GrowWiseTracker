import { 
  type User, type InsertUser,
  type Transaction, type InsertTransaction,
  type ProfitSplit, type InsertProfitSplit,
  type GrowthGoal, type InsertGrowthGoal,
  type Onboarding, type InsertOnboarding,
  type SupportTicket, type InsertSupportTicket,
  type Notification, type InsertNotification,
  type Plan, type InsertPlan
} from "@shared/schema";
import { IStorage } from "./storage";
import session from "express-session";
import createMemoryStore from "memorystore";

// Create memory store for session
const MemoryStore = createMemoryStore(session);

// Helper function to generate incremental IDs
let idCounter = 1;
function generateId(): number {
  return idCounter++;
}

// Memory Storage Implementation
export class MemoryStorage implements IStorage {
  sessionStore: session.Store;
  private users: User[] = [];
  private transactions: Transaction[] = [];
  private profitSplits: ProfitSplit[] = [];
  private growthGoals: GrowthGoal[] = [];
  private onboardingData: Onboarding[] = [];
  private supportTickets: SupportTicket[] = [];
  private notifications: Notification[] = [];
  private plans: Plan[] = [];

  constructor() {
    console.log('Using in-memory session and data storage');
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
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
      id: generateId(),
      username: insertUser.username,
      password: insertUser.password,
      businessName: insertUser.businessName || null,
      industry: insertUser.industry || null,
      monthlyRevenue: insertUser.monthlyRevenue || null,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      status: 'active',
      currency: insertUser.currency || 'USD'
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
    return this.transactions.filter(t => t.userId === userId);
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.find(t => t.id === id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      id: generateId(),
      userId: insertTransaction.userId,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      description: insertTransaction.description,
      category: insertTransaction.category || null,
      date: insertTransaction.date || new Date()
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    this.transactions[index] = { ...this.transactions[index], ...data };
    return this.transactions[index];
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.transactions.splice(index, 1);
    return true;
  }

  // Profit split operations
  async getProfitSplit(userId: number): Promise<ProfitSplit | undefined> {
    return this.profitSplits.find(ps => ps.userId === userId);
  }

  async createProfitSplit(insertProfitSplit: InsertProfitSplit): Promise<ProfitSplit> {
    const profitSplit: ProfitSplit = {
      ...insertProfitSplit,
      id: generateId()
    };
    this.profitSplits.push(profitSplit);
    return profitSplit;
  }

  async updateProfitSplit(id: number, data: Partial<ProfitSplit>): Promise<ProfitSplit | undefined> {
    const index = this.profitSplits.findIndex(ps => ps.id === id);
    if (index === -1) return undefined;
    
    this.profitSplits[index] = { ...this.profitSplits[index], ...data };
    return this.profitSplits[index];
  }

  // Growth goal operations
  async getGrowthGoals(userId: number): Promise<GrowthGoal[]> {
    return this.growthGoals.filter(g => g.userId === userId);
  }

  async getGrowthGoalById(id: number): Promise<GrowthGoal | undefined> {
    return this.growthGoals.find(g => g.id === id);
  }

  async createGrowthGoal(insertGrowthGoal: InsertGrowthGoal): Promise<GrowthGoal> {
    const goal: GrowthGoal = {
      ...insertGrowthGoal,
      id: generateId(),
      currentAmount: insertGrowthGoal.currentAmount || 0,
      isCompleted: insertGrowthGoal.isCompleted || false,
      createdAt: new Date()
    };
    this.growthGoals.push(goal);
    return goal;
  }

  async updateGrowthGoal(id: number, data: Partial<GrowthGoal>): Promise<GrowthGoal | undefined> {
    const index = this.growthGoals.findIndex(g => g.id === id);
    if (index === -1) return undefined;
    
    this.growthGoals[index] = { ...this.growthGoals[index], ...data };
    return this.growthGoals[index];
  }

  async deleteGrowthGoal(id: number): Promise<boolean> {
    const index = this.growthGoals.findIndex(g => g.id === id);
    if (index === -1) return false;
    
    this.growthGoals.splice(index, 1);
    return true;
  }

  async getAllGrowthGoals(): Promise<GrowthGoal[]> {
    return [...this.growthGoals];
  }

  // Onboarding operations
  async getOnboarding(userId: number): Promise<Onboarding | undefined> {
    return this.onboardingData.find(o => o.userId === userId);
  }

  async createOnboarding(insertOnboarding: InsertOnboarding): Promise<Onboarding> {
    const onboarding: Onboarding = {
      ...insertOnboarding,
      id: generateId()
    };
    this.onboardingData.push(onboarding);
    return onboarding;
  }

  async updateOnboarding(userId: number, data: Partial<Onboarding>): Promise<Onboarding | undefined> {
    const index = this.onboardingData.findIndex(o => o.userId === userId);
    if (index === -1) return undefined;
    
    this.onboardingData[index] = { ...this.onboardingData[index], ...data };
    return this.onboardingData[index];
  }

  // Support ticket operations
  async getSupportTickets(): Promise<SupportTicket[]> {
    return [...this.supportTickets];
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return this.supportTickets.filter(t => t.userId === userId);
  }

  async getSupportTicketById(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.find(t => t.id === id);
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      ...insertTicket,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertTicket.status || 'open'
    };
    this.supportTickets.push(ticket);
    return ticket;
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const index = this.supportTickets.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    this.supportTickets[index] = { ...this.supportTickets[index], ...data, updatedAt: new Date() };
    return this.supportTickets[index];
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    return [...this.notifications];
  }

  async getNotificationById(id: number): Promise<Notification | undefined> {
    return this.notifications.find(n => n.id === id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      ...insertNotification,
      id: generateId(),
      createdAt: new Date(),
      isRead: false
    };
    this.notifications.push(notification);
    return notification;
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return undefined;
    
    this.notifications[index] = { ...this.notifications[index], ...data };
    return this.notifications[index];
  }

  async deleteNotification(id: number): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    this.notifications.splice(index, 1);
    return true;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return [...this.plans];
  }

  async getPlanById(id: number): Promise<Plan | undefined> {
    return this.plans.find(p => p.id === id);
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const plan: Plan = {
      ...insertPlan,
      id: generateId(),
      createdAt: new Date()
    };
    this.plans.push(plan);
    return plan;
  }

  async updatePlan(id: number, data: Partial<Plan>): Promise<Plan | undefined> {
    const index = this.plans.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.plans[index] = { ...this.plans[index], ...data };
    return this.plans[index];
  }
}