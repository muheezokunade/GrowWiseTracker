import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/MainLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CashReserveChart } from "@/components/dashboard/CashReserveChart";
import { SmartSuggestionCard } from "@/components/dashboard/SmartSuggestionCard";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, PlusCircle, TrendingUp, BadgeDollarSign, BarChart, ArrowDownCircle, PiggyBank, PieChart, AlertCircle } from "lucide-react";
import { Transaction } from "@shared/schema";

// Smart suggestions
const smartSuggestions = [
  {
    type: "tip" as const,
    text: "Your cash reserve is growing well. Consider boosting your reinvestment allocation this month.",
  },
  {
    type: "alert" as const,
    text: "It's a good time to review your software subscriptions - they've increased 15% from last month.",
  },
];

interface DashboardData {
  summary: {
    revenue: number;
    expenses: number;
    profit: number;
    cashReserve: number;
  };
  cashReserveData: Array<{ date: string; amount: number }>;
  recentTransactions: Array<Transaction>;
  growthGoals: Array<any>;
  profitSplit?: {
    ownerPay: number;
    reinvestment: number;
    savings: number;
    taxReserve: number;
  };
}

export default function DashboardPage() {
  // Fetch dashboard summary
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard/summary"],
    refetchOnMount: true, // Always refetch when mounting this component
  });
  
  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="loading-spinner" />
          <p className="text-muted-foreground mt-4 text-sm animate-pulse-soft">Loading your financial dashboard...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout title="Dashboard">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-destructive flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">Unable to load dashboard data</h3>
            <p className="text-sm">Please refresh the page or try again later.</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const summary = data?.summary || {
    revenue: 12450,
    expenses: 7128,
    profit: 5322,
    cashReserve: 15750,
  };
  
  const recentTransactions = data?.recentTransactions || [];
  
  return (
    <MainLayout title="Dashboard">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <select className="bg-card border border-input text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>Year to Date</option>
          </select>
        </div>
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 mb-6">
          <KpiCard
            title="Revenue"
            value={summary.revenue}
            percentageChange={8.2}
            comparisonText="vs last month"
            icon={<BarChart className="h-10 w-10" />}
          />
          
          <KpiCard
            title="Expenses"
            value={summary.expenses}
            percentageChange={-3.4}
            comparisonText="vs last month"
            icon={<ArrowDownCircle className="h-10 w-10" />}
          />
          
          <KpiCard
            title="Profit"
            value={summary.profit}
            percentageChange={14.3}
            comparisonText="vs last month"
            isProfitCard={true}
            icon={<PiggyBank className="h-10 w-10" />}
          />
        </div>
        
        {/* Cash Reserve Graph Card */}
        <CashReserveChart
          data={data?.cashReserveData || []}
          availableAmount={summary.cashReserve}
        />
        
        {/* Quick Actions Grid */}
        <h2 className="font-heading font-semibold text-lg mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Link href="/transactions?action=add">
            <Button variant="outline" className="card-hover h-auto w-full py-4 flex flex-col items-center space-y-2">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <PlusCircle className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Add Expense</span>
            </Button>
          </Link>
          
          <Link href="/growth-goals?action=create">
            <Button variant="outline" className="card-hover h-auto w-full py-4 flex flex-col items-center space-y-2">
              <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-medium">Create Goal</span>
            </Button>
          </Link>
          
          <Link href="/profit-split">
            <Button variant="outline" className="card-hover h-auto w-full py-4 flex flex-col items-center space-y-2">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <BadgeDollarSign className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Split Profit</span>
            </Button>
          </Link>
        </div>
        
        {/* Smart Suggestions Card */}
        <SmartSuggestionCard suggestions={smartSuggestions} />
        
        {/* Recent Transactions Preview */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-heading font-semibold text-lg">Recent Transactions</h2>
          <Link href="/transactions">
            <span className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all
            </span>
          </Link>
        </div>
        <div className="bg-card rounded-xl border shadow-card overflow-hidden card-hover">
          <div className="divide-y divide-border">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <>
                <TransactionItem
                  transaction={{
                    id: 1,
                    userId: 1,
                    description: "Software Subscription",
                    amount: 49.99,
                    type: "expense",
                    category: "Software",
                    date: new Date("2023-03-12"),
                  }}
                />
                <TransactionItem
                  transaction={{
                    id: 2,
                    userId: 1,
                    description: "Client Payment",
                    amount: 1200,
                    type: "income",
                    category: "Income",
                    date: new Date("2023-03-10"),
                  }}
                />
                <TransactionItem
                  transaction={{
                    id: 3,
                    userId: 1,
                    description: "Office Rent",
                    amount: 850,
                    type: "expense",
                    category: "Rent",
                    date: new Date("2023-03-05"),
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
