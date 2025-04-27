import { 
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  profitSplits, type ProfitSplit, type InsertProfitSplit,
  growthGoals, type GrowthGoal, type InsertGrowthGoal,
  onboarding, type Onboarding, type InsertOnboarding
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
  
  // Onboarding operations
  getOnboarding(userId: number): Promise<Onboarding | undefined>;
  createOnboarding(onboarding: InsertOnboarding): Promise<Onboarding>;
  updateOnboarding(userId: number, data: Partial<Onboarding>): Promise<Onboarding | undefined>;
  
  sessionStore: session.SessionStore;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private profitSplits: Map<number, ProfitSplit>;
  private growthGoals: Map<number, GrowthGoal>;
  private onboardingSteps: Map<number, Onboarding>;
  private userIdCounter: number;
  private transactionIdCounter: number;
  private profitSplitIdCounter: number;
  private growthGoalIdCounter: number;
  private onboardingIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.profitSplits = new Map();
    this.growthGoals = new Map();
    this.onboardingSteps = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.profitSplitIdCounter = 1;
    this.growthGoalIdCounter = 1;
    this.onboardingIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
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
    const user: User = { ...insertUser, id };
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
    const transaction: Transaction = { ...insertTransaction, id };
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
    const profitSplit: ProfitSplit = { ...insertProfitSplit, id };
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
    const growthGoal: GrowthGoal = { ...insertGrowthGoal, id, createdAt };
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
    const onboardingStep: Onboarding = { ...insertOnboarding, id };
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
