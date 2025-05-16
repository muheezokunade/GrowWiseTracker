import { defineConfig } from "drizzle-kit";

// Use Neon DB connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_aXKv0jhnJ8Wk@ep-flat-sun-a4bsmk19-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
