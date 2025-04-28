import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use standard pg instead of Neon's serverless version with WebSockets
export const pool = new pg.Pool({
  // Use individual connection parameters instead of connectionString
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '5432'),
  // Add SSL configuration for secure connections
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
    // Don't crash the app, just log the error
  } else {
    console.log('Database connection successful:', res.rows[0]);
  }
});

export const db = drizzle(pool, { schema });