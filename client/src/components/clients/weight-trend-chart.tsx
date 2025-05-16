import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format, startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';

interface WeightTrendChartProps {
  weightData: Array<{ date: string; value: number }>;
}

export default function WeightTrendChart({ weightData }: WeightTrendChartProps) {
  const [view, setView] = useState<'daily' | 'weekly'>('weekly');
  const [weeklyData, setWeeklyData] = useState<Array<{ week: string; average: number }>>([]);
  
  // Process weekly averages from daily weight data
  useEffect(() => {
    if (!weightData || weightData.length === 0) return;
    
    const sortedData = [...weightData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group data by weeks
    const weekMap = new Map<string, { sum: number; count: number; startDate: Date }>();
    
    sortedData.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 }); // Start week on Monday
      const weekEnd = endOfWeek(entryDate, { weekStartsOn: 1 });
      
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { 
          sum: entry.value, 
          count: 1,
          startDate: weekStart 
        });
      } else {
        const current = weekMap.get(weekKey)!;
        weekMap.set(weekKey, {
          sum: current.sum + entry.value,
          count: current.count + 1,
          startDate: current.startDate
        });
      }
    });
    
    // Convert map to array of weekly averages
    const weeklyAverages = Array.from(weekMap.entries()).map(([weekKey, data]) => ({
      week: format(data.startDate, 'MMM d'),
      average: parseFloat((data.sum / data.count).toFixed(1))
    }));
    
    setWeeklyData(weeklyAverages);
  }, [weightData]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="font-medium">{payload[0].payload.week || label}</p>
          <p className="text-sm text-muted-foreground">
            Average: <span className="font-medium text-primary">{payload[0].value} kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="font-medium">{format(parseISO(payload[0].payload.date), 'MMM d, yyyy')}</p>
          <p className="text-sm text-muted-foreground">
            Weight: <span className="font-medium text-primary">{payload[0].value} kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Weight Trends</CardTitle>
          <Tabs 
            value={view} 
            onValueChange={(v) => setView(v as 'daily' | 'weekly')}
            className="w-auto"
          >
            <TabsList className="grid w-[180px] grid-cols-2">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Avg</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>
          {view === 'weekly' 
            ? 'Weekly average weight to smooth out daily fluctuations'
            : 'Daily weight measurements to track detailed progress'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {view === 'weekly' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickMargin={10}
                  tickFormatter={(value) => `${value} kg`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="average" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1}
                  fill="url(#colorWeight)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weightData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorDailyWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickMargin={10}
                  tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                />
                <YAxis 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickMargin={10}
                  tickFormatter={(value) => `${value} kg`}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1}
                  fill="url(#colorDailyWeight)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}