import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aXKv0jhnJ8Wk@ep-flat-sun-a4bsmk19-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Use standard pg with improved pool configuration
export const pool = new pg.Pool({
  connectionString: connectionString,
  // Add SSL configuration for secure connections
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 10, // Maximum number of clients in the pool
  min: 1, // Minimum number of idle clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait for a connection to be established
  // Add retries for connection issues and rate limiting
  maxUses: 100, // Max number of times a client can be used before being recycled
  allowExitOnIdle: true // Allow closing idle clients during shutdown
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // Don't crash the app, just log the error
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