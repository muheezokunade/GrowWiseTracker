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
    }
  });
  
  const db = drizzle(pool);
  
  try {
    console.log('Creating schema...');
    
    // We'll use the drizzle-kit push command instead of writing custom SQL
    // This will automatically create tables based on our schema
    execSync('npx drizzle-kit push:pg --schema=./shared/schema.ts');
    
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
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables().catch(console.error);