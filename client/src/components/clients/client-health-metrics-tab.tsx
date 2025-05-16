import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { 
  Heart, 
  TrendingUp, 
  Target,
  Scale,
  Utensils,
  Activity
} from "lucide-react";

// Mock data for client health metrics
const weeklyData = [
  { name: "Week 1", weight: 82.5, bodyFat: 24, muscleMass: 36, steps: 5200, sleep: 6.2 },
  { name: "Week 2", weight: 81.8, bodyFat: 23.7, muscleMass: 36.2, steps: 5800, sleep: 6.5 },
  { name: "Week 3", weight: 81.2, bodyFat: 23.5, muscleMass: 36.4, steps: 6200, sleep: 6.8 },
  { name: "Week 4", weight: 80.7, bodyFat: 23.2, muscleMass: 36.7, steps: 6500, sleep: 7.0 },
  { name: "Week 5", weight: 80.0, bodyFat: 22.8, muscleMass: 37.0, steps: 6800, sleep: 7.2 },
  { name: "Week 6", weight: 79.5, bodyFat: 22.5, muscleMass: 37.2, steps: 7100, sleep: 7.4 },
  { name: "Week 7", weight: 79.0, bodyFat: 22.0, muscleMass: 37.5, steps: 7500, sleep: 7.5 },
  { name: "Week 8", weight: 78.6, bodyFat: 21.6, muscleMass: 37.8, steps: 7800, sleep: 7.6 },
];

const nutritionData = [
  { name: "Mon", calories: 1850, protein: 130, carbs: 180, fat: 55 },
  { name: "Tue", calories: 1920, protein: 135, carbs: 190, fat: 60 },
  { name: "Wed", calories: 1780, protein: 140, carbs: 160, fat: 58 },
  { name: "Thu", calories: 1830, protein: 135, carbs: 170, fat: 62 },
  { name: "Fri", calories: 1900, protein: 145, carbs: 175, fat: 59 },
  { name: "Sat", calories: 2100, protein: 150, carbs: 210, fat: 65 },
  { name: "Sun", calories: 1970, protein: 140, carbs: 195, fat: 60 },
];

// Types for props
interface HealthMetricProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  color: string;
  bgColor: string;
}

// Health Metric Card Component
const HealthMetricCard = ({ icon, title, value, change, isPositive, color, bgColor }: HealthMetricProps) => (
  <div className="border rounded-lg p-4 flex flex-col">
    <div className="flex items-center mb-3">
      <div className={`p-2 rounded-full ${bgColor} ${color}`}>
        {icon}
      </div>
      <span className={`ml-auto text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </span>
    </div>
    <div className="mt-2">
      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </span>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {title}
      </p>
    </div>
  </div>
);

export default function ClientHealthMetricsTab({ clientId }: { clientId: number }) {
  const [timeFrame, setTimeFrame] = React.useState('8weeks');
  const [chartType, setChartType] = React.useState('weight');

  // Select chart data based on selected metric
  const getChartData = () => {
    switch (chartType) {
      case 'weight':
        return { 
          data: weeklyData, 
          dataKey: 'weight',
          name: 'Weight (kg)',
          color: '#6366f1' 
        };
      case 'bodyFat':
        return { 
          data: weeklyData, 
          dataKey: 'bodyFat',
          name: 'Body Fat (%)',
          color: '#8b5cf6' 
        };
      case 'muscleMass':
        return { 
          data: weeklyData, 
          dataKey: 'muscleMass',
          name: 'Muscle Mass (%)', 
          color: '#2dd4bf' 
        };
      case 'nutrition':
        return { 
          data: nutritionData, 
          dataKey: 'calories',
          name: 'Calories (kcal)',
          color: '#f59e0b' 
        };
      default:
        return { 
          data: weeklyData, 
          dataKey: 'weight',
          name: 'Weight (kg)',
          color: '#6366f1' 
        };
    }
  };

  const chartConfig = getChartData();

  // Mick's client details
  const healthMetrics = [
    {
      icon: <Scale size={20} />,
      title: "Current Weight",
      value: "78.6 kg",
      change: "-3.9 kg",
      isPositive: true,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Body Fat",
      value: "21.6%",
      change: "-2.4%",
      isPositive: true,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      icon: <Activity size={20} />,
      title: "Muscle Mass",
      value: "37.8%",
      change: "+1.8%",
      isPositive: true,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-100 dark:bg-teal-900/30"
    },
    {
      icon: <Heart size={20} />,
      title: "Resting Heart Rate",
      value: "62 bpm",
      change: "-8 bpm",
      isPositive: true,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => (
          <HealthMetricCard 
            key={index}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            isPositive={metric.isPositive}
            color={metric.color}
            bgColor={metric.bgColor}
          />
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle>Progress Tracking</CardTitle>
            <div className="flex space-x-4">
              <Tabs value={chartType} onValueChange={setChartType} className="w-full">
                <TabsList className="grid grid-cols-4 w-full max-w-md">
                  <TabsTrigger value="weight" className="text-xs">Weight</TabsTrigger>
                  <TabsTrigger value="bodyFat" className="text-xs">Body Fat</TabsTrigger>
                  <TabsTrigger value="muscleMass" className="text-xs">Muscle Mass</TabsTrigger>
                  <TabsTrigger value="nutrition" className="text-xs">Nutrition</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartConfig.data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
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
                <Line
                  type="monotone"
                  dataKey={chartConfig.dataKey}
                  name={chartConfig.name}
                  stroke={chartConfig.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workout Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { week: 'Week 1', completed: 3, scheduled: 4 },
                    { week: 'Week 2', completed: 4, scheduled: 4 },
                    { week: 'Week 3', completed: 3, scheduled: 4 },
                    { week: 'Week 4', completed: 4, scheduled: 4 },
                    { week: 'Week 5', completed: 5, scheduled: 5 },
                    { week: 'Week 6', completed: 4, scheduled: 5 },
                    { week: 'Week 7', completed: 5, scheduled: 5 },
                    { week: 'Week 8', completed: 5, scheduled: 5 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="scheduled" name="Scheduled" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Overall Adherence</p>
                <p className="text-2xl font-bold text-primary">85%</p>
              </div>
              <Button variant="outline" size="sm">View Workout History</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrition Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { day: 'Mon', target: 2000, actual: 1850 },
                    { day: 'Tue', target: 2000, actual: 1920 },
                    { day: 'Wed', target: 2000, actual: 1780 },
                    { day: 'Thu', target: 2000, actual: 1830 },
                    { day: 'Fri', target: 2000, actual: 1900 },
                    { day: 'Sat', target: 2200, actual: 2100 },
                    { day: 'Sun', target: 2200, actual: 1970 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name="Actual Calories" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" name="Target Calories" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Weekly Macro Targets</p>
                <div className="flex space-x-4 mt-1">
                  <span className="text-sm">Protein: <span className="font-bold">140g</span></span>
                  <span className="text-sm">Carbs: <span className="font-bold">180g</span></span>
                  <span className="text-sm">Fat: <span className="font-bold">60g</span></span>
                </div>
              </div>
              <Button variant="outline" size="sm">View Nutrition Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fitness Assessment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Weight</th>
                  <th className="py-3 px-4 text-left">Body Fat</th>
                  <th className="py-3 px-4 text-left">Muscle Mass</th>
                  <th className="py-3 px-4 text-left">Resting HR</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">May 10, 2025</td>
                  <td className="py-3 px-4">78.6 kg</td>
                  <td className="py-3 px-4">21.6%</td>
                  <td className="py-3 px-4">37.8%</td>
                  <td className="py-3 px-4">62 bpm</td>
                  <td className="py-3 px-4">Significant improvement in core strength</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Apr 12, 2025</td>
                  <td className="py-3 px-4">80.0 kg</td>
                  <td className="py-3 px-4">22.8%</td>
                  <td className="py-3 px-4">37.0%</td>
                  <td className="py-3 px-4">64 bpm</td>
                  <td className="py-3 px-4">Increased cardio endurance</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Mar 15, 2025</td>
                  <td className="py-3 px-4">81.2 kg</td>
                  <td className="py-3 px-4">23.5%</td>
                  <td className="py-3 px-4">36.4%</td>
                  <td className="py-3 px-4">68 bpm</td>
                  <td className="py-3 px-4">Struggling with maintaining nutrition plan</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Feb 17, 2025</td>
                  <td className="py-3 px-4">82.5 kg</td>
                  <td className="py-3 px-4">24.0%</td>
                  <td className="py-3 px-4">36.0%</td>
                  <td className="py-3 px-4">70 bpm</td>
                  <td className="py-3 px-4">Initial assessment</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button>Record New Assessment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}