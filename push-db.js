import { execSync } from 'child_process';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

neonConfig.webSocketConstructor = ws;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the schema file content
const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Create SQL for each table
const tableRegex = /export const (\w+) = pgTable\("([^"]+)".*?\);/gs;
let match;
let sqlStatements = [];

while ((match = tableRegex.exec(schemaContent))) {
  const tableName = match[2];
  sqlStatements.push(`
  CREATE TABLE IF NOT EXISTS "${tableName}" (
    id SERIAL PRIMARY KEY,
    -- Add other columns based on schema
    created_at TIMESTAMP DEFAULT NOW()
  );
  `);
}

// Execute SQL statements
async function createTables() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    for (const sql of sqlStatements) {
      await pool.query(sql);
    }
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables().catch(console.error);