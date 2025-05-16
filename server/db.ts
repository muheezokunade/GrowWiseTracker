import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use Neon DB connection string
const connectionString = 'postgresql://neondb_owner:npg_aXKv0jhnJ8Wk@ep-flat-sun-a4bsmk19-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Use standard pg instead of Neon's serverless version with WebSockets
export const pool = new pg.Pool({
  connectionString: connectionString,
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