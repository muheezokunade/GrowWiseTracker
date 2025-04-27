import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/MainLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CashReserveChart } from "@/components/dashboard/CashReserveChart";
import { SmartSuggestionCard } from "@/components/dashboard/SmartSuggestionCard";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, PlusCircle, TrendingUp, BadgeDollarSign } from "lucide-react";

// Sample cash reserve data
const sampleCashReserveData = [
  { date: "2023-02-01", amount: 10000 },
  { date: "2023-02-15", amount: 11200 },
  { date: "2023-03-01", amount: 12500 },
  { date: "2023-03-15", amount: 14000 },
  { date: "2023-04-01", amount: 15750 },
];

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

export default function DashboardPage() {
  // Fetch dashboard summary
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/summary"],
  });
  
  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#27AE60]" />
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout title="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading dashboard data. Please try again.
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
          <select className="bg-white border border-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60]">
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
          />
          
          <KpiCard
            title="Expenses"
            value={summary.expenses}
            percentageChange={-3.4}
            comparisonText="vs last month"
          />
          
          <KpiCard
            title="Profit"
            value={summary.profit}
            percentageChange={14.3}
            comparisonText="vs last month"
            isProfitCard={true}
          />
        </div>
        
        {/* Cash Reserve Graph Card */}
        <CashReserveChart
          data={sampleCashReserveData}
          availableAmount={summary.cashReserve}
        />
        
        {/* Quick Actions Grid */}
        <h2 className="font-heading font-semibold text-lg mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Link href="/transactions?action=add">
            <Button variant="outline" className="h-auto w-full py-4 flex flex-col items-center space-y-2 bg-white hover:bg-gray-50">
              <div className="h-10 w-10 bg-[#27AE60]/20 rounded-full flex items-center justify-center">
                <PlusCircle className="h-5 w-5 text-[#27AE60]" />
              </div>
              <span className="text-sm font-medium">Add Expense</span>
            </Button>
          </Link>
          
          <Link href="/growth-goals?action=create">
            <Button variant="outline" className="h-auto w-full py-4 flex flex-col items-center space-y-2 bg-white hover:bg-gray-50">
              <div className="h-10 w-10 bg-[#27AE60]/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#27AE60]" />
              </div>
              <span className="text-sm font-medium">Create Goal</span>
            </Button>
          </Link>
          
          <Link href="/profit-split">
            <Button variant="outline" className="h-auto w-full py-4 flex flex-col items-center space-y-2 bg-white hover:bg-gray-50">
              <div className="h-10 w-10 bg-[#27AE60]/20 rounded-full flex items-center justify-center">
                <BadgeDollarSign className="h-5 w-5 text-[#27AE60]" />
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
            <a className="text-sm font-medium text-[#27AE60] hover:text-[#219653]">
              View all
            </a>
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
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
