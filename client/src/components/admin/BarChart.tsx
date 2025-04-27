import React from "react";
import {
  Bar,
  BarChart as RechartBarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const demoData = [
  { name: "Jan", users: 40, revenue: 2400 },
  { name: "Feb", users: 30, revenue: 1398 },
  { name: "Mar", users: 50, revenue: 9800 },
  { name: "Apr", users: 80, revenue: 3908 },
  { name: "May", users: 65, revenue: 4800 },
  { name: "Jun", users: 90, revenue: 3800 },
  { name: "Jul", users: 100, revenue: 4300 },
];

interface BarChartProps {
  data?: any[];
  horizontal?: boolean;
}

export function BarChart({ data = demoData, horizontal = false }: BarChartProps) {
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <RechartBarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={!horizontal} vertical={horizontal} />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip
            formatter={(value: number) => [`${value}`, ""]}
            labelFormatter={(value) => `${value}`}
          />
          <Legend />
          <Bar dataKey="value" name="Value" fill="#8884d8" radius={[0, 4, 4, 0]} />
        </RechartBarChart>
      </ResponsiveContainer>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${name === "revenue" ? "$" : ""}${value}`,
            name === "revenue" ? "Revenue" : "Users",
          ]}
          labelFormatter={(value) => `Month: ${value}`}
        />
        <Legend />
        <Bar dataKey="users" name="Users" fill="#8884d8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" radius={[4, 4, 0, 0]} />
      </RechartBarChart>
    </ResponsiveContainer>
  );
}