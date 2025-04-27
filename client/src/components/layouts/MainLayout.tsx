import { Link, useLocation } from "wouter";
import { 
  ChevronDown, 
  LayoutDashboard, 
  CreditCard, 
  PieChart, 
  Target, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Menu, 
  X, 
  LogOut,
  User,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location === "/dashboard",
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: CreditCard,
      current: location === "/transactions",
    },
    {
      name: "Profit Split",
      href: "/profit-split",
      icon: PieChart,
      current: location === "/profit-split",
    },
    {
      name: "Growth Goals",
      href: "/growth-goals",
      icon: Target,
      current: location === "/growth-goals",
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      current: location === "/reports",
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: Settings,
      current: location === "/settings",
    },
    { 
      name: "Help", 
      href: "/help", 
      icon: HelpCircle,
      current: location === "/help",
    },
  ];

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar for desktop */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex w-72 flex-col border-r bg-background transition-transform duration-300 md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">GrowWise</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="grid items-start px-2 gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm">
              <div className="font-medium">{user?.businessName || "My Business"}</div>
              <div className="text-muted-foreground">{user?.username}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help
                  </Link>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="flex-1 flex justify-between">
            {title && (
              <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
            )}
            <div className="ml-auto flex items-center gap-2 md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help">Help</Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}