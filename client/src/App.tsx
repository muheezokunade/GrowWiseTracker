import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import TransactionsPage from "@/pages/transactions-page";
import ProfitSplitPage from "@/pages/profit-split-page";
import GrowthGoalsPage from "@/pages/growth-goals-page";
import ReportsPage from "@/pages/reports-page";
import SettingsPage from "@/pages/settings-page";
import HelpPage from "@/pages/help-page";
import OnboardingPage from "@/pages/onboarding-page";

// Admin pages
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminUsers from "@/pages/admin/admin-users";
import AdminSupport from "@/pages/admin/admin-support";
import AdminNotifications from "@/pages/admin/admin-notifications";
import AdminPlans from "@/pages/admin/admin-plans";

import { AuthProvider, useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Handle redirects when auth state changes
  useEffect(() => {
    if (!isLoading) {
      // If user is logged in but on the auth page or home, direct them to dashboard
      if (user && (location === "/auth" || location === "/")) {
        setLocation("/dashboard");
      }

      // If user is at onboarding but hasn't completed it, set to the beginning
      if (user && location === "/onboarding" && !location.includes("step")) {
        setLocation("/onboarding/step/1");
      }

      // If admin user tries to access normal dashboard, let them (they have dual role)
      // But if non-admin tries to access admin pages, they'll be redirected by AdminRoute
    }
  }, [user, isLoading, location, setLocation]);

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected user routes */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/transactions" component={TransactionsPage} />
      <ProtectedRoute path="/profit-split" component={ProfitSplitPage} />
      <ProtectedRoute path="/growth-goals" component={GrowthGoalsPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/help" component={HelpPage} />
      <ProtectedRoute path="/onboarding/step/:step" component={OnboardingPage} />
      
      {/* Admin routes */}
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/support-tickets" component={AdminSupport} />
      <AdminRoute path="/admin/notifications" component={AdminNotifications} />
      <AdminRoute path="/admin/plans" component={AdminPlans} />
      
      {/* Catch-all route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
