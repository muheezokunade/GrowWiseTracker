import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { MobileNavigation } from "../shared/MobileNavigation";
import { Sidebar } from "../shared/Sidebar";
import { buttonVariants } from "@/components/ui/button";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get first letter of username for avatar
  const userInitial = user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="py-4 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* App Logo and Name */}
              <Link href="/dashboard" className="flex items-center">
                <svg className="h-8 w-8 text-[#27AE60]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="ml-2 text-xl font-heading font-semibold text-slate-800">GrowWise</span>
              </Link>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-1">
                <button
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-all duration-300"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-all duration-300">
                    <div className="h-8 w-8 rounded-full bg-[#6FCF97] flex items-center justify-center text-white font-semibold">
                      {userInitial}
                    </div>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/settings" className="w-full">
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth" className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "px-4 py-2 text-[#27AE60] font-medium hover:bg-[#27AE60]/10 rounded-lg transition-all duration-300"
                )}>
                  Log in
                </Link>
                <Link href="/auth" className={cn(
                  buttonVariants({ variant: "default" }),
                  "px-4 py-2 bg-[#27AE60] text-white font-medium rounded-lg hover:bg-[#219653] transition-all duration-300"
                )}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {user && <MobileNavigation currentPath={location} />}

      {/* Main Content Area */}
      <main className="flex-1 py-4 md:py-6 px-4 sm:px-6 md:px-8 mb-16 md:mb-0">
        {/* Desktop Sidebar with Content */}
        <div className="flex">
          {user && <Sidebar currentPath={location} className="hidden md:block" />}
          
          <div className={cn(
            "w-full",
            user ? "md:ml-56" : ""
          )}>
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-heading font-bold text-slate-800">{title}</h1>
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
