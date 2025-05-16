import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Camera, 
  Plus, 
  Droplets, 
  Footprints, 
  Dumbbell,
  Trophy,
  ListChecks,
  Calendar
} from 'lucide-react';

// Define interfaces for type safety
interface ProgressOverview {
  currentWeight?: number;
  goalWeight?: number;
  weightChange?: number;
  currentBodyFat?: number;
  goalBodyFat?: number;
  bodyFatChange?: number;
  currentMuscleMass?: number;
  steps?: number;
  stepsGoal?: number;
  waterIntake?: number;
  waterGoal?: number;
}

interface ProgressRecord {
  id: number;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  steps?: number;
  waterIntake?: number;
  notes?: string;
  hasPhotos?: boolean;
  photoCount?: number;
}

interface Habit {
  id: number;
  name: string;
  target: number;
  value: number;
  unit: string;
  streak: number;
  completed: boolean;
  icon: string;
}

interface RepMax {
  exerciseId: number;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

interface ExercisePerformance {
  exerciseId: number;
  exerciseName: string;
  weightData: Array<{date: string, weight: number}>;
  volumeData: Array<{date: string, volume: number}>;
}

// Component for daily habit tracking
function DailyHabits({ habits }: { habits: Habit[] }) {
  if (!habits || habits.length === 0) {
    return (
      <div className="text-center p-6 bg-muted rounded-lg">
        <ListChecks className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <h3 className="font-medium mb-2">No Daily Habits</h3>
        <p className="text-sm text-muted-foreground mb-4">Set up habits to track your daily progress</p>
        <Link href="/progress/habits/setup">
          <Button size="sm">Set Up Habits</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div key={habit.id} className="flex items-center space-x-3 p-3 border rounded-md">
          <div className="bg-primary/10 p-2 rounded-full">
            {habit.icon === 'water' && <Droplets className="h-5 w-5 text-blue-500" />}
            {habit.icon === 'steps' && <Footprints className="h-5 w-5 text-green-500" />}
            {habit.icon === 'workout' && <Dumbbell className="h-5 w-5 text-purple-500" />}
            {!['water', 'steps', 'workout'].includes(habit.icon) && <ListChecks className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="font-medium">{habit.name}</span>
              <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                {habit.streak} day streak
              </span>
            </div>
            <div className="mt-1 mb-1">
              <Progress value={(habit.value / habit.target) * 100} className="h-2" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{habit.value} / {habit.target} {habit.unit}</span>
              {habit.completed ? (
                <span className="text-green-500">Completed</span>
              ) : (
                <span>{Math.round((habit.value / habit.target) * 100)}%</span>
              )}
            </div>
          </div>
        </div>
      ))}
      <Link href="/progress/habits">
        <Button variant="outline" size="sm" className="w-full">
          Manage Habits
        </Button>
      </Link>
    </div>
  );
}

// Component for hydration tracking
function HydrationTracker({ waterIntake, waterGoal }: { waterIntake?: number, waterGoal?: number }) {
  const defaultGoal = 2000; // Default water goal in ml (2 liters)
  const goal = waterGoal || defaultGoal;
  const current = waterIntake || 0;
  const percentage = (current / goal) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <Droplets className="h-5 w-5 text-blue-500 mr-2" />
            Hydration Tracking
          </CardTitle>
          <span className="text-sm">{Math.round(percentage)}%</span>
        </div>
        <CardDescription>Today's water intake</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">{current} ml</span>
            <span className="text-muted-foreground">Goal: {goal} ml</span>
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Water
            </Button>
            <Link href="/progress/hydration">
              <Button variant="ghost" size="sm">
                History
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for step tracking
function StepTracker({ steps, stepsGoal }: { steps?: number, stepsGoal?: number }) {
  const defaultGoal = 10000; // Default step goal
  const goal = stepsGoal || defaultGoal;
  const current = steps || 0;
  const percentage = (current / goal) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <Footprints className="h-5 w-5 text-green-500 mr-2" />
            Step Tracker
          </CardTitle>
          <span className="text-sm">{Math.round(percentage)}%</span>
        </div>
        <CardDescription>Today's step count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">{current.toLocaleString()} steps</span>
            <span className="text-muted-foreground">Goal: {goal.toLocaleString()} steps</span>
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Update Steps
            </Button>
            <Link href="/progress/steps">
              <Button variant="ghost" size="sm">
                History
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for exercise performance tracking
function ExercisePerformance({ repMaxes, performances }: { repMaxes: RepMax[], performances: ExercisePerformance[] }) {
  if (!repMaxes || repMaxes.length === 0) {
    return (
      <div className="text-center p-6 bg-muted rounded-lg">
        <Dumbbell className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <h3 className="font-medium mb-2">No Lifting Records</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete workouts to see your lifting progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-3 flex items-center">
          <Trophy className="h-5 w-5 text-amber-500 mr-2" /> 
          Personal Records
        </h3>
        <div className="space-y-2">
          {repMaxes.map((record, index) => (
            <div key={index} className="p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">{record.exerciseName}</span>
                <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 px-2 py-0.5 rounded-full">
                  {record.reps}RM
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-lg font-bold">{record.weight} kg</span>
                <span className="text-xs text-muted-foreground">{record.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Link href="/progress/performance">
        <Button variant="outline" size="sm" className="w-full">
          View Full Performance
        </Button>
      </Link>
    </div>
  );
}

export default function ClientProgress() {
  // Tabs for different progress sections
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch progress data
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['/api/client/progress'],
    staleTime: 1000 * 60, // 1 minute
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

  // Safely extract data with defaults
  const overview: ProgressOverview = progressData?.overview || {};
  const history: ProgressRecord[] = progressData?.history || [];
  const habits: Habit[] = progressData?.habits || [];
  const repMaxes: RepMax[] = progressData?.repMaxes || [];
  const performances: ExercisePerformance[] = progressData?.performances || [];
  
  return (
    <div className="container mx-auto p-4 max-w-lg pb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Progress</h1>
        </div>
        <Link href="/progress/add">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="performance">Lifting</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Body Metrics</CardTitle>
              <CardDescription>Your current progress statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-medium">Weight</h3>
                    {overview.weightChange !== undefined && (
                      <div className={`flex items-center text-xs ${
                        overview.weightChange > 0 
                          ? 'text-red-500' 
                          : overview.weightChange < 0 
                            ? 'text-green-500' 
                            : ''
                      }`}>
                        {overview.weightChange > 0 && <TrendingUp className="h-3 w-3 mr-1" />}
                        {overview.weightChange < 0 && <TrendingDown className="h-3 w-3 mr-1" />}
                        {overview.weightChange !== 0 && `${Math.abs(overview.weightChange)} kg`}
                      </div>
                    )}
                  </div>
                  <p className="font-medium">{overview.currentWeight || '--'} kg</p>
                  <p className="text-xs text-muted-foreground">Goal: {overview.goalWeight || '--'} kg</p>
                </div>
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-medium">Body Fat</h3>
                    {overview.bodyFatChange !== undefined && (
                      <div className={`flex items-center text-xs ${
                        overview.bodyFatChange > 0 
                          ? 'text-red-500' 
                          : overview.bodyFatChange < 0 
                            ? 'text-green-500' 
                            : ''
                      }`}>
                        {overview.bodyFatChange > 0 && <TrendingUp className="h-3 w-3 mr-1" />}
                        {overview.bodyFatChange < 0 && <TrendingDown className="h-3 w-3 mr-1" />}
                        {overview.bodyFatChange !== 0 && `${Math.abs(overview.bodyFatChange)}%`}
                      </div>
                    )}
                  </div>
                  <p className="font-medium">{overview.currentBodyFat || '--'}%</p>
                  <p className="text-xs text-muted-foreground">Goal: {overview.goalBodyFat || '--'}%</p>
                </div>
                <div className="border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-1">Muscle Mass</h3>
                  <p className="font-medium">{overview.currentMuscleMass || '--'}%</p>
                  <p className="text-xs text-muted-foreground">↑ Since last check-in</p>
                </div>
                <div className="border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-1">Measurements</h3>
                  <Link href="/progress/measurements">
                    <Button variant="ghost" size="sm" className="w-full mt-1 h-7">View Details</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <HydrationTracker waterIntake={overview.waterIntake} waterGoal={overview.waterGoal} />
            <StepTracker steps={overview.steps} stepsGoal={overview.stepsGoal} />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Progress Charts</h2>
              <Link href="/progress/charts">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Weight Progress</h3>
                  <div className="text-xs text-muted-foreground">Last 30 days</div>
                </div>
                {/* Weight chart would go here - showing a placeholder */}
                <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Recent Records</h2>
              <Link href="/progress/history">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            
            {history.length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Progress Records</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first progress record to start tracking.
                </p>
                <Link href="/progress/add">
                  <Button>Add First Record</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 3).map((record, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{record.date}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="font-medium">{record.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Body Fat</p>
                          <p className="font-medium">{record.bodyFat || '--'}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Muscle</p>
                          <p className="font-medium">{record.muscleMass || '--'}%</p>
                        </div>
                      </div>
                      
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mb-3">{record.notes}</p>
                      )}
                      
                      {record.hasPhotos && (
                        <div className="flex items-center">
                          <Camera className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{record.photoCount} photos</span>
                        </div>
                      )}
                      
                      <Link href={`/progress/${record.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-3">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Habits Tab */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Habits</CardTitle>
              <CardDescription>Track your daily habits and streaks</CardDescription>
            </CardHeader>
            <CardContent>
              <DailyHabits habits={habits} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Daily Tracking</CardTitle>
              <CardDescription>Monitor your daily progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <HydrationTracker waterIntake={overview.waterIntake} waterGoal={overview.waterGoal} />
              <StepTracker steps={overview.steps} stepsGoal={overview.stepsGoal} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Progress History</CardTitle>
              <CardDescription>View your complete history</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground mb-4">No progress records yet</p>
                  <Link href="/progress/add">
                    <Button size="sm">Add Record</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{record.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.weight ? `${record.weight} kg` : ''} 
                          {record.bodyFat ? ` • ${record.bodyFat}% BF` : ''}
                        </p>
                      </div>
                      <Link href={`/progress/${record.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                  
                  <Link href="/progress/history">
                    <Button variant="outline" size="sm" className="w-full">
                      View Full History
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lifting Performance</CardTitle>
              <CardDescription>Track your strength progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ExercisePerformance repMaxes={repMaxes} performances={performances} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}