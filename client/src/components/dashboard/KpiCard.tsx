import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

interface KpiCardProps {
  title: string;
  value: string | number;
  percentageChange?: number;
  comparisonText?: string;
  isProfitCard?: boolean;
  icon?: React.ReactNode;
}

export function KpiCard({
  title,
  value,
  percentageChange,
  comparisonText = "vs last month",
  isProfitCard = false,
  icon,
}: KpiCardProps) {
  const { formatCurrency } = useCurrency();
  
  const formattedValue = typeof value === 'number' 
    ? formatCurrency(value)
    : value;
  
  const isPositiveChange = percentageChange && percentageChange > 0;
  const isNegativeChange = percentageChange && percentageChange < 0;
  
  return (
    <div className="stat-card card-hover">
      <div className="absolute right-2 top-2 opacity-10">
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="stat-card-label">{title}</p>
        <p className={cn(
          "stat-card-value",
          isProfitCard ? "text-primary" : ""
        )}>
          {formattedValue}
        </p>
        
        {percentageChange !== undefined && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "flex items-center text-sm font-medium",
              isPositiveChange ? "stat-card-trend-up" : 
              isNegativeChange ? "stat-card-trend-down" : 
              "text-muted-foreground"
            )}>
              {isPositiveChange && <ArrowUp className="h-3 w-3 mr-1" />}
              {isNegativeChange && <ArrowDown className="h-3 w-3 mr-1" />}
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
            <span className="text-muted-foreground text-xs ml-2">{comparisonText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
