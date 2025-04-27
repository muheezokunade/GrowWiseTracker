import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  percentageChange?: number;
  comparisonText?: string;
  isProfitCard?: boolean;
}

export function KpiCard({
  title,
  value,
  percentageChange,
  comparisonText = "vs last month",
  isProfitCard = false,
}: KpiCardProps) {
  const formattedValue = typeof value === 'number' 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : value;
  
  const isPositiveChange = percentageChange && percentageChange > 0;
  const isNegativeChange = percentageChange && percentageChange < 0;
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={cn(
        "text-2xl font-semibold mt-1",
        isProfitCard ? "text-[#27AE60]" : ""
      )}>
        {formattedValue}
      </p>
      {percentageChange !== undefined && (
        <div className="flex items-center mt-1 text-xs">
          <span className={cn(
            "flex items-center",
            isPositiveChange ? "text-green-600" : isNegativeChange ? "text-red-600" : "text-gray-600"
          )}>
            {isPositiveChange && <ArrowUp className="h-3 w-3 mr-1" />}
            {isNegativeChange && <ArrowDown className="h-3 w-3 mr-1" />}
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
          <span className="text-gray-400 ml-1">{comparisonText}</span>
        </div>
      )}
    </div>
  );
}
