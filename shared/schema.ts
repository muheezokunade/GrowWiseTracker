import { pgTable, text, serial, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name"),
  industry: text("industry"),
  monthlyRevenue: text("monthly_revenue"),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // "income" or "expense"
  category: text("category"),
  date: timestamp("date").notNull().defaultNow(),
});

// Profit split settings
export const profitSplits = pgTable("profit_splits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ownerPay: real("owner_pay").notNull().default(40), // Percentages
  reinvestment: real("reinvestment").notNull().default(30),
  savings: real("savings").notNull().default(20),
  taxReserve: real("tax_reserve").notNull().default(10),
});

// Growth goals
export const growthGoals = pgTable("growth_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0),
  targetDate: timestamp("target_date"),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Onboarding steps tracking
export const onboarding = pgTable("onboarding", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  step: integer("step").notNull().default(1),
  completed: boolean("completed").notNull().default(false),
  financialGoals: text("financial_goals"), // JSON string of selected goals
  bankConnected: boolean("bank_connected").notNull().default(false),
});

// Define schemas for insert operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export const insertProfitSplitSchema = createInsertSchema(profitSplits).omit({
  id: true,
});

export const insertGrowthGoalSchema = createInsertSchema(growthGoals).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingSchema = createInsertSchema(onboarding).omit({
  id: true,
});

// Define types for select and insert operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertProfitSplit = z.infer<typeof insertProfitSplitSchema>;
export type ProfitSplit = typeof profitSplits.$inferSelect;

export type InsertGrowthGoal = z.infer<typeof insertGrowthGoalSchema>;
export type GrowthGoal = typeof growthGoals.$inferSelect;

export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type Onboarding = typeof onboarding.$inferSelect;
