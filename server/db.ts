import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check if DATABASE_URL is available and use it
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. The application will use in-memory storage.");
}

// Database variables and connection state
let pool: Pool | null = null;
let db: any = null;
let databaseConnected: boolean = false;

// Create connection pool with error handling
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for some Supabase connections
      },
      // Add shorter timeout to fail faster when DB is not available
      connectionTimeoutMillis: 3000, // 3 seconds - shorter to fail faster
      // Reduce idle timeout to handle connection issues faster
      idleTimeoutMillis: 30000,
      // Add query timeout
      query_timeout: 3000, // 3 seconds - shorter to fail faster
      // Add statement timeout
      statement_timeout: 3000, // 3 seconds - shorter to fail faster
      // Maximum number of clients the pool should contain
      max: 20
    });

    // Test the connection
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      databaseConnected = false;
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
          databaseConnected = true;
          client.release();
        }
      } catch (err) {
        console.warn('Database connection test failed, fallback to memory storage will be used:', err);
        databaseConnected = false;
        
        // Attempt to clean up the pool if connection failed
        if (pool) {
          try {
            await pool.end();
          } catch (endError) {
            console.error('Error ending pool after connection failure:', endError);
          }
        }
      }
    }, 1000);
    
    // Set up periodic health checks
    setInterval(async () => {
      if (!pool) return;
      
      try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        
        if (!databaseConnected) {
          console.log('Database connection restored');
          databaseConnected = true;
        }
        
        client.release();
      } catch (err) {
        if (databaseConnected) {
          console.warn('Database connection lost:', err);
          databaseConnected = false;
        }
      }
    }, 30000); // Check every 30 seconds
    
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    pool = null;
    db = null;
    databaseConnected = false;
  }
}

// Helper function to check database connection status
export function isDatabaseConnected(): boolean {
  return databaseConnected && pool !== null && db !== null;
}

export { pool, db };