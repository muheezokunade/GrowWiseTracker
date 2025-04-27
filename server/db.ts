import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check if DATABASE_URL is available and use it
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. The application will use in-memory storage.");
}

let pool: Pool | null = null;
let db: any = null;

// Create connection pool with error handling
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for some Supabase connections
      },
      // Add shorter timeout to fail faster when DB is not available
      connectionTimeoutMillis: 5000,
      // Reduce idle timeout to handle connection issues faster
      idleTimeoutMillis: 30000,
      // Add query timeout
      query_timeout: 5000,
      // Add statement timeout
      statement_timeout: 5000,
      // Maximum number of clients the pool should contain
      max: 20
    });

    // Test the connection
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Add connection event handlers
    pool.on('connect', (client) => {
      console.log('New client connected to PostgreSQL');
    });

    pool.on('remove', (client) => {
      console.log('Client disconnected from PostgreSQL pool');
    });

    // Initialize Drizzle ORM
    db = drizzle(pool, { schema });

    console.log('PostgreSQL database connection initialized');
    
    // Add async connection test that won't block startup
    setTimeout(async () => {
      if (!pool) return;
      
      try {
        const client = await pool.connect();
        if (client) {
          await client.query('SELECT 1');
          console.log('Database connection confirmed working');
          client.release();
        }
      } catch (err) {
        console.warn('Database connection test failed, fallback to memory storage may be used:', err);
      }
    }, 1000);
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    pool = null;
    db = null;
  }
}

export { pool, db };