import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Droplets, 
  Plus, 
  Settings, 
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define interfaces for type safety
interface DailyHydration {
  date: string;
  target: number; // in ml
  consumed: number; // in ml
  percentage: number;
  entries: HydrationEntry[];
}

interface HydrationEntry {
  id: number;
  time: string;
  amount: number; // in ml
  type: string; // e.g. "water", "coffee", "tea", etc.
}

interface HydrationStats {
  averageDaily: number;
  weeklyAverage: number;
  monthlyAverage: number;
  currentStreak: number;
  bestDay: {
    date: string;
    amount: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

// Quick add preset amounts component
function QuickAddButtons({ onAdd }: { onAdd: (amount: number) => void }) {
  const presets = [
    { label: "Small", amount: 150 },
    { label: "Medium", amount: 250 },
    { label: "Large", amount: 500 },
    { label: "Bottle", amount: 750 }
  ];
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {presets.map((preset) => (
        <Button 
          key={preset.label} 
          variant="outline" 
          className="flex flex-col h-20 py-2"
          onClick={() => onAdd(preset.amount)}
        >
          <Droplets className="h-5 w-5 mb-1 text-blue-500" />
          <span className="text-xs">{preset.label}</span>
          <span className="text-xs text-muted-foreground">{preset.amount}ml</span>
        </Button>
      ))}
    </div>
  );
}

// Add water dialog component
function AddHydrationDialog({ onAdd }: { onAdd: (amount: number, type: string) => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("250");
  const [type, setType] = useState("water");
  
  const handleAdd = () => {
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    
    onAdd(parsedAmount, type);
    setOpen(false);
    setAmount("250");
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Water
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Hydration</DialogTitle>
          <DialogDescription>Track your water intake</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Add</label>
            <QuickAddButtons 
              onAdd={(amount) => {
                setAmount(amount.toString());
              }} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Amount</label>
            <div className="flex items-center">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                min="1"
              />
              <span className="ml-2">ml</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["water", "coffee", "tea"].map((t) => (
                <Button 
                  key={t}
                  variant={type === t ? "default" : "outline"}
                  className="capitalize"
                  onClick={() => setType(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleAdd} disabled={!amount}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Daily hydration summary component
function DailyHydrationSummary({ 
  data, 
  onDelete 
}: { 
  data: DailyHydration, 
  onDelete: (id: number) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Today's Hydration</h3>
          <span className="text-sm">{data.percentage}%</span>
        </div>
        <div className="h-4 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full" 
            style={{ width: `${Math.min(data.percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium">{data.consumed} ml</span>
          <span className="text-muted-foreground">Goal: {data.target} ml</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Today's Entries</h3>
        {data.entries.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No entries yet today
          </div>
        ) : (
          <div className="space-y-2">
            {data.entries.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">{entry.amount} ml</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.time} • {entry.type}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onDelete(entry.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// History chart component (simplified placeholder)
function HydrationChart({ data }: { data: ChartData }) {
  // This is a placeholder for a real chart component
  // In a real implementation, you'd use a library like Recharts
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">7-Day History</h3>
      <div className="h-60 relative rounded-md bg-muted/50 p-4 flex items-end space-x-2">
        {data.datasets[0].data.map((value, i) => (
          <div 
            key={i} 
            className="flex flex-col items-center justify-end flex-1"
          >
            <div 
              className="bg-blue-500 rounded-t-sm w-full" 
              style={{ 
                height: `${(value / Math.max(...data.datasets[0].data)) * 100}%`,
                minHeight: '4px'
              }}
            />
            <span className="text-xs mt-1 text-muted-foreground">
              {data.labels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HydrationPage() {
  const [activeTab, setActiveTab] = useState('today');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch hydration data
  const { data: hydrationData, isLoading } = useQuery({
    queryKey: ['/api/client/hydration'],
    staleTime: 1000 * 60, // 1 minute
  });

  // Add hydration entry mutation
  const addHydrationMutation = useMutation({
    mutationFn: (data: { amount: number, type: string }) => {
      return apiRequest('POST', '/api/client/hydration', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/hydration'] });
      toast({
        title: "Added",
        description: "Hydration entry has been recorded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add",
        description: error.message || "There was an error recording your hydration",
        variant: "destructive",
      });
    }
  });

  // Delete hydration entry mutation
  const deleteHydrationMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/client/hydration/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/hydration'] });
      toast({
        title: "Deleted",
        description: "Hydration entry has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete",
        description: error.message || "There was an error removing the entry",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Extract data with safe defaults
  const today: DailyHydration = hydrationData?.today || {
    date: new Date().toLocaleDateString(),
    target: 2000,
    consumed: 0,
    percentage: 0,
    entries: []
  };
  
  const stats: HydrationStats = hydrationData?.stats || {
    averageDaily: 0,
    weeklyAverage: 0,
    monthlyAverage: 0,
    currentStreak: 0,
    bestDay: { date: '-', amount: 0 }
  };
  
  // Chart data for weekly history
  const chartData: ChartData = hydrationData?.chartData || {
    labels: Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [{
      label: 'Water Intake (ml)',
      data: [0, 0, 0, 0, 0, 0, 0]
    }]
  };
  
  // Add hydration entry
  const handleAddHydration = (amount: number, type: string) => {
    addHydrationMutation.mutate({ amount, type });
  };
  
  // Delete hydration entry
  const handleDeleteHydration = (id: number) => {
    deleteHydrationMutation.mutate(id);
  };

  return (
    <div className="container mx-auto p-4 max-w-lg pb-16">
      <div className="flex items-center mb-6">
        <Link href="/progress">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Hydration Tracking</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Droplets className="h-6 w-6 mr-2 text-blue-500" />
              Water Intake
            </CardTitle>
            <AddHydrationDialog onAdd={handleAddHydration} />
          </div>
          <CardDescription>
            Track your daily hydration
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        {/* Today's hydration tab */}
        <TabsContent value="today" className="space-y-6">
          <DailyHydrationSummary 
            data={today} 
            onDelete={handleDeleteHydration} 
          />
        </TabsContent>
        
        {/* History tab */}
        <TabsContent value="history" className="space-y-6">
          <HydrationChart data={chartData} />
          
          <div className="space-y-4">
            <h3 className="font-medium">Daily Records</h3>
            <div className="space-y-2">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{chartData.datasets[0].data[index]} ml</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((chartData.datasets[0].data[index] / today.target) * 100)}% of goal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Stats tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Hydration Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                    <p className="font-medium">{stats.currentStreak} days</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Daily Average</p>
                    <p className="font-medium">{stats.averageDaily} ml</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Weekly Average</p>
                    <p className="font-medium">{stats.weeklyAverage} ml</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Monthly Average</p>
                    <p className="font-medium">{stats.monthlyAverage} ml</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Best Day</p>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{stats.bestDay.amount} ml</p>
                    <p className="text-xs text-muted-foreground">{stats.bestDay.date}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Daily Target</span>
                  <span className="font-medium">{today.target} ml</span>
                </div>
                <Button variant="outline" className="w-full">
                  Update Target
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}