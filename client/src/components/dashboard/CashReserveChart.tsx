import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useCurrency } from "@/hooks/use-currency";
import { formatDate as formatDateUtil } from "@/lib/utils";

interface CashReserveChartProps {
  data: Array<{ date: string; amount: number }>;
  availableAmount: number;
}

export function CashReserveChart({ data, availableAmount }: CashReserveChartProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const { formatCurrency, currencyCode } = useCurrency();
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      setHoveredValue(payload[0].value);
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-sm">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-[#27AE60]">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    setHoveredValue(null);
    return null;
  };
  
  // Check if data is empty and return a placeholder
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading font-semibold">Cash Reserve</h2>
          <div className="text-sm text-gray-600">
            {formatCurrency(availableAmount)} available
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold">Cash Reserve</h2>
        <div className="text-sm text-gray-600">
          {formatCurrency(availableAmount)} available
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseLeave={() => setHoveredValue(null)}
          >
            <defs>
              <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#27AE60" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#27AE60" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
            <XAxis 
              dataKey="date"
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
            />
            <YAxis 
              tickFormatter={(value) => {
                // Format based on currency but simplified for axis labels
                const formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currencyCode,
                  notation: 'compact',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                });
                return formatter.format(value);
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
              width={60}
            />
            <Tooltip content={customTooltip} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#27AE60" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCash)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
        <div>{formatDate(data[0].date)}</div>
        <div>Current: {formatDate(data[data.length - 1].date)}</div>
      </div>
    </div>
  );
}
