import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  LifeBuoy,
  Eye
} from "lucide-react";
import { UserTable } from "@/components/admin/UserTable";
import { BarChart } from "@/components/admin/BarChart";
import { DonutChart } from "@/components/admin/DonutChart";

interface DashboardStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    retentionRate: number;
  };
  financialStats: {
    totalTransactions: number;
    totalRevenue: number;
    averageTransactionValue: number;
  };
  goalStats: {
    totalGoals: number;
    completedGoals: number;
    completionRate: number;
  };
  supportStats: {
    totalTickets: number;
    openTickets: number;
    responseRate: number;
  };
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
  });

  return (
    <AdminLayout title="Admin Dashboard">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : stats?.userStats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : `${stats?.userStats.activeUsers} active users`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue Tracked
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : formatCurrency(stats?.financialStats.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : `${stats?.financialStats.totalTransactions} transactions`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Growth Goals
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : stats?.goalStats.totalGoals}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : `${stats?.goalStats.completionRate.toFixed(1)}% completion rate`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Support Tickets
                </CardTitle>
                <LifeBuoy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : stats?.supportStats.totalTickets}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : `${stats?.supportStats.openTickets} open tickets`}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue & User Growth</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>
                  Active vs Inactive Users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart 
                  data={[
                    { name: 'Active Users', value: stats?.userStats.activeUsers || 0 },
                    { name: 'Inactive Users', value: (stats?.userStats.totalUsers || 0) - (stats?.userStats.activeUsers || 0) }
                  ]} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Goal Types</CardTitle>
              <CardDescription>
                Distribution of goals created by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart horizontal />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Categories</CardTitle>
                <CardDescription>
                  Most common expense categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart 
                  data={[
                    { name: 'Operations', value: 35 },
                    { name: 'Marketing', value: 25 },
                    { name: 'Development', value: 20 },
                    { name: 'Other', value: 20 }
                  ]} 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>
                  Aggregated revenue tracked by all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                All registered users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}