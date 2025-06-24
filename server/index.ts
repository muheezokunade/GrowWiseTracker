import express from "express";
import cors from "cors";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, transactions, profitSplits, growthGoals, onboarding } from "../shared/schema.js";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aXKv0jhnJ8Wk@ep-flat-sun-a4bsmk19-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql_client = neon(DATABASE_URL);
const db = drizzle(sql_client);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://growwise-financial.netlify.app'] 
    : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      if (user.length === 0) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isValid = await bcrypt.compare(password, user[0].password);
      if (!isValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user[0]);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    done(null, user[0] || null);
  } catch (error) {
    done(error);
  }
});

// Auth middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, businessName, industry, monthlyRevenue, currency } = req.body;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      username,
      password: hashedPassword,
      businessName,
      industry,
      monthlyRevenue,
      currency: currency || 'USD'
    }).returning();

    // Create default profit split
    await db.insert(profitSplits).values({
      userId: newUser[0].id,
      ownerPay: 40,
      reinvestment: 30,
      savings: 20,
      taxReserve: 10
    });

    // Create onboarding record
    await db.insert(onboarding).values({
      userId: newUser[0].id,
      step: 1,
      completed: false
    });

    res.json({ message: 'User created successfully', user: { id: newUser[0].id, username: newUser[0].username } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Dashboard data
app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Get transactions for current month
    const monthlyTransactions = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        )
      );

    // Calculate totals
    const totalRevenue = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = totalRevenue - totalExpenses;

    // Get cash reserve (simplified - sum of all profits)
    const allTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    const allRevenue = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const allExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashReserve = allRevenue - allExpenses;

    // Get growth goals
    const goals = await db.select()
      .from(growthGoals)
      .where(eq(growthGoals.userId, userId))
      .orderBy(desc(growthGoals.createdAt));

    res.json({
      totalRevenue,
      totalExpenses,
      profit,
      cashReserve,
      profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
      goals: goals.slice(0, 3) // Latest 3 goals
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transactions
app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const userTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    res.json(userTransactions);
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/transactions', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { description, amount, type, category, date } = req.body;

    const newTransaction = await db.insert(transactions).values({
      userId,
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(date)
    }).returning();

    res.json(newTransaction[0]);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profit splits
app.get('/api/profit-splits', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const splits = await db.select()
      .from(profitSplits)
      .where(eq(profitSplits.userId, userId))
      .limit(1);

    res.json(splits[0] || { ownerPay: 40, reinvestment: 30, savings: 20, taxReserve: 10 });
  } catch (error) {
    console.error('Profit splits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profit-splits', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { ownerPay, reinvestment, savings, taxReserve } = req.body;

    // Check if splits exist
    const existing = await db.select()
      .from(profitSplits)
      .where(eq(profitSplits.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      const updated = await db.update(profitSplits)
        .set({ ownerPay, reinvestment, savings, taxReserve })
        .where(eq(profitSplits.userId, userId))
        .returning();
      
      res.json(updated[0]);
    } else {
      // Create new
      const created = await db.insert(profitSplits).values({
        userId,
        ownerPay,
        reinvestment,
        savings,
        taxReserve
      }).returning();
      
      res.json(created[0]);
    }
  } catch (error) {
    console.error('Update profit splits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Growth goals
app.get('/api/growth-goals', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const goals = await db.select()
      .from(growthGoals)
      .where(eq(growthGoals.userId, userId))
      .orderBy(desc(growthGoals.createdAt));

    res.json(goals);
  } catch (error) {
    console.error('Growth goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/growth-goals', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { name, targetAmount, targetDate } = req.body;

    const newGoal = await db.insert(growthGoals).values({
      userId,
      name,
      targetAmount: parseFloat(targetAmount),
      targetDate: targetDate ? new Date(targetDate) : null,
      currentAmount: 0,
      isCompleted: false
    }).returning();

    res.json(newGoal[0]);
  } catch (error) {
    console.error('Add growth goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist/public')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/public/index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});