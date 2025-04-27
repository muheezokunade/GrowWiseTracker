import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { BarChart3, BadgeDollarSign, Home, LayoutList, TrendingUp } from "lucide-react";

interface MobileNavigationProps {
  currentPath: string;
  className?: string;
}

export function MobileNavigation({ currentPath, className }: MobileNavigationProps) {
  const navItems = [
    {
      path: "/dashboard",
      label: "Home",
      icon: Home,
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: LayoutList,
    },
    {
      path: "/profit-split",
      label: "Profit",
      icon: BadgeDollarSign,
    },
    {
      path: "/growth-goals",
      label: "Goals",
      icon: TrendingUp,
    },
    {
      path: "/reports",
      label: "Reports",
      icon: BarChart3,
    },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between items-center p-2 md:hidden z-40",
      className
    )}>
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors duration-300",
            currentPath === item.path
              ? "text-[#27AE60]"
              : "text-gray-600 hover:text-[#27AE60]"
          )}>
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
}
