import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const dummyData = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 1900 },
  { name: 'Mar', value: 1500 },
  { name: 'Apr', value: 2400 },
  { name: 'May', value: 2100 },
  { name: 'Jun', value: 3000 },
  { name: 'Jul', value: 2500 }
];

const goalTypeData = [
  { name: 'Marketing', value: 35 },
  { name: 'Hiring', value: 25 },
  { name: 'Product Development', value: 18 },
  { name: 'Expansion', value: 15 },
  { name: 'Equipment', value: 7 }
];

interface BarChartProps {
  data?: Array<{ name: string; value: number }>;
  horizontal?: boolean; 
}

export function BarChart({ data, horizontal = false }: BarChartProps) {
  const chartData = data || (horizontal ? goalTypeData : dummyData);
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsBarChart
        data={chartData}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        {horizontal ? (
          <>
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={150} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" />
            <YAxis />
          </>
        )}
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', borderColor: '#e2e8f0' }}
        />
        <Bar 
          dataKey="value" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]} 
          barSize={horizontal ? 20 : 30}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}