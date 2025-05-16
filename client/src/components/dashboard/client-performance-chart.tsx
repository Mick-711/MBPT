import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";

const weeklyData = [
  { name: "Sun", workouts: 4, nutrition: 85, clients: 2 },
  { name: "Mon", workouts: 7, nutrition: 90, clients: 5 },
  { name: "Tue", workouts: 10, nutrition: 92, clients: 6 },
  { name: "Wed", workouts: 8, nutrition: 88, clients: 4 },
  { name: "Thu", workouts: 9, nutrition: 95, clients: 5 },
  { name: "Fri", workouts: 11, nutrition: 86, clients: 7 },
  { name: "Sat", workouts: 6, nutrition: 82, clients: 3 },
];

const monthlyData = [
  { name: "Week 1", workouts: 30, nutrition: 87, clients: 18 },
  { name: "Week 2", workouts: 42, nutrition: 89, clients: 20 },
  { name: "Week 3", workouts: 38, nutrition: 91, clients: 19 },
  { name: "Week 4", workouts: 45, nutrition: 93, clients: 22 },
];

type ChartType = "adherence" | "sessions";
type TimeFrame = "weekly" | "monthly";

export default function ClientPerformanceChart() {
  const [chartType, setChartType] = useState<ChartType>("adherence");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("weekly");

  const data = timeFrame === "weekly" ? weeklyData : monthlyData;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100">
            Performance Metrics
          </h2>
          <div className="flex space-x-2">
            <div className="flex space-x-1 mr-4">
              <Button
                variant={chartType === "adherence" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setChartType("adherence")}
                className="text-xs"
              >
                Adherence
              </Button>
              <Button
                variant={chartType === "sessions" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setChartType("sessions")}
                className="text-xs"
              >
                Sessions
              </Button>
            </div>
            <div className="flex space-x-1">
              <Button
                variant={timeFrame === "weekly" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTimeFrame("weekly")}
                className="text-xs"
              >
                Weekly
              </Button>
              <Button
                variant={timeFrame === "monthly" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTimeFrame("monthly")}
                className="text-xs"
              >
                Monthly
              </Button>
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "adherence" ? (
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                  axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                  axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                  domain={[60, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="workouts"
                  name="Workout Completion"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="nutrition"
                  name="Nutrition Compliance"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                  axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                  axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="workouts" 
                  name="Completed Workouts" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="clients" 
                  name="Active Clients" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg">
            <p className="text-xs text-primary-700 dark:text-primary-300 font-medium">Avg. Workout Completion</p>
            <p className="text-xl font-semibold mt-1 text-primary-600 dark:text-primary-400">
              {chartType === "adherence" ? "89%" : "42"}
              <span className="text-xs ml-1 text-green-500">↑ 4%</span>
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
              {chartType === "adherence" ? "Nutrition Compliance" : "Active Clients"}
            </p>
            <p className="text-xl font-semibold mt-1 text-purple-600 dark:text-purple-400">
              {chartType === "adherence" ? "90%" : "18"}
              <span className="text-xs ml-1 text-green-500">↑ 2%</span>
            </p>
          </div>
          <div className="bg-secondary-50 dark:bg-secondary-900/30 p-3 rounded-lg">
            <p className="text-xs text-secondary-700 dark:text-secondary-300 font-medium">Client Retention</p>
            <p className="text-xl font-semibold mt-1 text-secondary-600 dark:text-secondary-400">
              96%
              <span className="text-xs ml-1 text-green-500">↑ 1%</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}