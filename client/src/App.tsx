import React from 'react';
import { Router, Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/use-auth';
import { ThemeProvider } from './components/shared/ThemeProvider';
import HomePage from './pages/home-page';
import AuthPage from './pages/auth-page';
import DashboardPage from './pages/dashboard-page';
import TransactionsPage from './pages/transactions-page';
import ProfitSplitPage from './pages/profit-split-page';
import GrowthGoalsPage from './pages/growth-goals-page';
import ReportsPage from './pages/reports-page';
import SettingsPage from './pages/settings-page';
import HelpPage from './pages/help-page';
import NotFound from './pages/not-found';
import ProtectedRoute from './lib/protected-route';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="growwise-theme">
        <AuthProvider>
          <Router>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/dashboard">
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/transactions">
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              </Route>
              <Route path="/profit-split">
                <ProtectedRoute>
                  <ProfitSplitPage />
                </ProtectedRoute>
              </Route>
              <Route path="/growth-goals">
                <ProtectedRoute>
                  <GrowthGoalsPage />
                </ProtectedRoute>
              </Route>
              <Route path="/reports">
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              </Route>
              <Route path="/settings">
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              </Route>
              <Route path="/help">
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              </Route>
              <Route component={NotFound} />
            </Switch>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;