// ESM version of database setup for direct execution
import pkg from 'pg';
const { Pool } = pkg;

async function pushTables() {
  try {
    console.log('Connecting to database with standard PostgreSQL driver...');
    
    const pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: parseInt(process.env.PGPORT || '5432'),
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', testResult.rows[0]);
    
    console.log('Creating tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        business_name TEXT,
        industry TEXT,
        monthly_revenue TEXT,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login_at TIMESTAMP,
        status TEXT DEFAULT 'active',
        currency TEXT DEFAULT 'USD' NOT NULL
      );
    `);
    console.log('Users table created');
    
    // Create demo users
    await pool.query(`
      INSERT INTO users (username, password, business_name, industry, monthly_revenue, is_admin, currency)
      VALUES 
        ('admin', '$2b$10$9ZKZB9SLG9EnKKbxuVzl6.LnH1aFXLXS1SUhC/8tNgPFEk7.WviC2', 'GrowWise Admin', 'Technology', '$100,000+', true, 'USD'),
        ('demo', '$2b$10$9ZKZB9SLG9EnKKbxuVzl6.LnH1aFXLXS1SUhC/8tNgPFEk7.WviC2', 'Demo Business', 'Retail', '$10,000-$50,000', false, 'USD')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('Demo users created');
    
    // Create other tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        date TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS profit_splits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        owner_pay REAL NOT NULL DEFAULT 40,
        reinvestment REAL NOT NULL DEFAULT 30,
        savings REAL NOT NULL DEFAULT 20,
        tax_reserve REAL NOT NULL DEFAULT 10
      );
      
      CREATE TABLE IF NOT EXISTS growth_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL NOT NULL DEFAULT 0,
        target_date TIMESTAMP,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS onboarding (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        step INTEGER NOT NULL DEFAULT 1,
        completed BOOLEAN NOT NULL DEFAULT false,
        financial_goals TEXT,
        bank_connected BOOLEAN NOT NULL DEFAULT false
      );
      
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        target_user_ids TEXT,
        sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_by_id INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        billing_cycle TEXT NOT NULL DEFAULT 'monthly',
        features TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS session (
        sid varchar NOT NULL COLLATE "default",
        sess json NOT NULL,
        expire timestamp(6) NOT NULL,
        CONSTRAINT session_pkey PRIMARY KEY (sid)
      );
    `);
    
    console.log('All tables created successfully!');
    await pool.end();
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Execute the function
pushTables().catch(console.error);