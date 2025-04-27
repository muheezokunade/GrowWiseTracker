import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Users,
  BarChart3,
  ListTodo,
  LifeBuoy,
  Settings,
  Bell,
  CreditCard,
  Menu,
  Home,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: BarChart3,
      current: location === "/admin",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      current: location === "/admin/users",
    },
    {
      name: "Transactions Monitor",
      href: "/admin/transactions",
      icon: CreditCard,
      current: location === "/admin/transactions",
    },
    {
      name: "Growth Goals",
      href: "/admin/goals",
      icon: ListTodo,
      current: location === "/admin/goals",
    },
    {
      name: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
      current: location === "/admin/notifications",
    },
    {
      name: "Support Tickets",
      href: "/admin/support-tickets",
      icon: LifeBuoy,
      current: location === "/admin/support-tickets",
    },
    {
      name: "Plans",
      href: "/admin/plans",
      icon: CreditCard,
      current: location === "/admin/plans",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: location === "/admin/settings",
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <span className="text-xl font-bold">GrowWise Admin</span>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          <nav className="flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
          <Link href="/dashboard" className="mt-4 flex items-center text-sm hover:underline">
            <Home className="mr-2 h-4 w-4" />
            Back to App
          </Link>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">GrowWise Admin</span>
          <span className="w-10"></span> {/* Spacer to center the title */}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-muted/20 p-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}