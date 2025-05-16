import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Line, Legend
} from 'recharts';
import { format, startOfWeek, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface WeightTrendChartProps {
  weightData: Array<{ date: string; value: number }>;
}

// Reference to ComposedChart in LSP errors - this is an implementation with only AreaChart
export default function WeightTrendChart({ weightData }: WeightTrendChartProps) {
  const [combinedData, setCombinedData] = useState<Array<{
    date: string;
    displayDate: string;
    weight: number;
    weeklyAvg?: number;
    weekLabel?: string;
  }>>([]);
  
  // Process data to combine daily weights with weekly averages
  useEffect(() => {
    if (!weightData || weightData.length === 0) return;
    
    const sortedData = [...weightData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group data by weeks
    const weekMap = new Map<string, { 
      sum: number; 
      count: number; 
      startDate: Date;
      dates: Set<string>;
    }>();
    
    sortedData.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 }); // Start week on Monday
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { 
          sum: entry.value, 
          count: 1,
          startDate: weekStart,
          dates: new Set([entry.date])
        });
      } else {
        const current = weekMap.get(weekKey)!;
        current.dates.add(entry.date);
        weekMap.set(weekKey, {
          sum: current.sum + entry.value,
          count: current.count + 1,
          startDate: current.startDate,
          dates: current.dates
        });
      }
    });
    
    // Calculate weekly averages
    const weeklyAverages = new Map<string, number>();
    weekMap.forEach((data, weekKey) => {
      const average = parseFloat((data.sum / data.count).toFixed(1));
      // Associate this average with all dates in the week
      data.dates.forEach(date => {
        weeklyAverages.set(date, average);
      });
    });
    
    // Combine into a single dataset
    const combined = sortedData.map(entry => {
      const parsedDate = parseISO(entry.date);
      const weekStart = startOfWeek(parsedDate, { weekStartsOn: 1 });
      const weekLabel = format(weekStart, 'MMM d') + ' week';
      
      return {
        date: entry.date,
        displayDate: format(parsedDate, 'MMM d'),
        weight: entry.value,
        weeklyAvg: weeklyAverages.get(entry.date),
        weekLabel
      };
    });
    
    setCombinedData(combined);
  }, [weightData]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const date = payload[0]?.payload?.displayDate;
      const dailyWeight = payload[0]?.value;
      const weeklyAvg = payload[1]?.value;
      const weekLabel = payload[0]?.payload?.weekLabel;
      
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="font-medium mb-1">{format(parseISO(payload[0].payload.date), 'MMM d, yyyy')}</p>
          <div className="space-y-1">
            <p className="text-sm flex justify-between gap-3">
              <span className="text-muted-foreground">Daily:</span>
              <span className="font-medium">{dailyWeight} kg</span>
            </p>
            <p className="text-sm flex justify-between gap-3">
              <span className="text-muted-foreground">Weekly avg:</span>
              <span className="font-medium text-blue-500">{weeklyAvg} kg</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              Week of {weekLabel?.split(' ')[0]}
            </p>
          </div>
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background">
              <div className="w-2 h-2 bg-primary rounded-full mr-1"></div>
              <span className="text-xs">Daily</span>
            </Badge>
            <Badge variant="outline" className="bg-background">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-xs">Weekly Avg</span>
            </Badge>
          </div>
        </div>
        <CardDescription>
          Weight tracking with weekly averages to smooth out daily fluctuations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={combinedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWeeklyAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="displayDate" 
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
              {/* Daily weight as first layer */}
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorWeight)" 
                fillOpacity={1}
                strokeWidth={1.5}
                dot={{ r: 3 }}
                name="Daily Weight"
              />
              {/* Weekly average as second layer */}
              <Area 
                type="monotone" 
                dataKey="weeklyAvg" 
                stroke="rgb(59, 130, 246)" // blue-500
                fill="url(#colorWeeklyAvg)"
                fillOpacity={0}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "rgb(59, 130, 246)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}