import { execSync } from 'child_process';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Execute Drizzle migration
async function createTables() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    return;
  }

  console.log('Creating database connection...');
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Add connection timeout settings
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    statement_timeout: 10000
  });
  
  const db = drizzle(pool);
  
  try {
    console.log('Creating schema directly with SQL statements...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "business_name" TEXT,
        "industry" TEXT,
        "monthly_revenue" TEXT,
        "is_admin" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "last_login_at" TIMESTAMP,
        "status" TEXT DEFAULT 'active',
        "currency" TEXT DEFAULT 'USD' NOT NULL
      );
    `);
    console.log('Created users table');
    
    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "description" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "type" TEXT NOT NULL,
        "category" TEXT,
        "date" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created transactions table');
    
    // Create profit_splits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "profit_splits" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "owner_pay" REAL DEFAULT 40 NOT NULL,
        "reinvestment" REAL DEFAULT 30 NOT NULL,
        "savings" REAL DEFAULT 20 NOT NULL,
        "tax_reserve" REAL DEFAULT 10 NOT NULL
      );
    `);
    console.log('Created profit_splits table');
    
    // Create growth_goals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "growth_goals" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "target_amount" REAL NOT NULL,
        "current_amount" REAL DEFAULT 0 NOT NULL,
        "target_date" TIMESTAMP,
        "is_completed" BOOLEAN DEFAULT FALSE NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created growth_goals table');
    
    // Create onboarding table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "onboarding" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "step" INTEGER DEFAULT 1 NOT NULL,
        "completed" BOOLEAN DEFAULT FALSE NOT NULL,
        "financial_goals" TEXT,
        "bank_connected" BOOLEAN DEFAULT FALSE NOT NULL
      );
    `);
    console.log('Created onboarding table');
    
    // Create support_tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "support_tickets" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "subject" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "status" TEXT DEFAULT 'open' NOT NULL,
        "priority" TEXT DEFAULT 'medium' NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP,
        "assigned_to_id" INTEGER,
        "resolution" TEXT
      );
    `);
    console.log('Created support_tickets table');
    
    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT DEFAULT 'announcement' NOT NULL,
        "target_user_ids" TEXT,
        "sent_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "expires_at" TIMESTAMP,
        "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
        "created_by_id" INTEGER NOT NULL
      );
    `);
    console.log('Created notifications table');
    
    // Create plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "plans" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" REAL NOT NULL,
        "billing_cycle" TEXT DEFAULT 'monthly' NOT NULL,
        "features" TEXT NOT NULL,
        "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP
      );
    `);
    console.log('Created plans table');
    
    // Create session table for authentication
    console.log('Creating session table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables().catch(error => console.error(error));