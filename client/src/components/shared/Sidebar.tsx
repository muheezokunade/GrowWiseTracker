import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BadgeDollarSign,
  CircleHelp,
  Home,
  LayoutList,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";

interface SidebarProps {
  currentPath: string;
  className?: string;
}

export function Sidebar({ currentPath, className }: SidebarProps) {
  const mainNavItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: LayoutList,
    },
    {
      path: "/profit-split",
      label: "Profit Split",
      icon: BadgeDollarSign,
    },
    {
      path: "/growth-goals",
      label: "Growth Goals",
      icon: TrendingUp,
    },
    {
      path: "/reports",
      label: "Reports",
      icon: BarChart3,
    },
  ];

  const settingsNavItems = [
    {
      path: "/settings",
      label: "Account",
      icon: User,
    },
    {
      path: "/settings/preferences",
      label: "Settings",
      icon: Settings,
    },
    {
      path: "/help",
      label: "Help & Support",
      icon: CircleHelp,
    },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-16 bottom-0 w-56 bg-white border-r border-gray-200 overflow-y-auto",
      className
    )}>
      <nav className="mt-4 px-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-300",
                currentPath === item.path
                  ? "bg-[#27AE60]/10 text-[#27AE60]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </a>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Settings
          </h3>
          <div className="mt-2 space-y-1">
            {settingsNavItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-300",
                  currentPath === item.path
                    ? "bg-[#27AE60]/10 text-[#27AE60]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}>
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
