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
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  status: text("status").default("active"), // active, suspended, deleted
  currency: text("currency").default("USD").notNull(), // Default to USD, user can change it
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
  currency: true,
  businessName: true,
  industry: true,
  monthlyRevenue: true,
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

// Support tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, resolved
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  assignedToId: integer("assigned_to_id"), // Admin user ID
  resolution: text("resolution"),
});

// System notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("announcement"), // announcement, maintenance, alert
  targetUserIds: text("target_user_ids"), // Comma-separated IDs or 'all'
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdById: integer("created_by_id").notNull(), // Admin user ID
});

// Plans and pricing
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly, yearly
  features: text("features").notNull(), // JSON string of features
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Insert schemas for new tables
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  sentAt: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;
