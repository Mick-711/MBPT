import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart3,
  Dumbbell,
  Droplets,
  ListChecks,
  TrendingUp,
  Scale,
  CalendarCheck,
  Clock,
  Camera,
  ChevronRight
} from 'lucide-react';
import MobileClientNav from '@/components/layout/mobile-client-nav';

// Define types for our progress data
interface ProgressData {
  overview: {
    weight: {
      current: number;
      change: number;
      unit: string;
    };
    bodyFat: {
      current: number;
      change: number;
      unit: string;
    };
    completedWorkouts: number;
    streak: number;
  };
  history: {
    weights: {
      date: string;
      value: number;
    }[];
    measurements: {
      date: string;
      type: string;
      value: number;
    }[];
  };
  habits: {
    totalHabits: number;
    completionRate: number;
    currentStreak: number;
  };
  repMaxes: {
    exerciseName: string;
    weight: number;
    reps: number;
  }[];
  performances: {
    exerciseName: string;
    progress: number;
  }[];
}

// Card component for each progress section
function ProgressCard({ 
  title, 
  icon, 
  value, 
  subtitle, 
  link 
}: { 
  title: string; 
  icon: React.ReactNode; 
  value: React.ReactNode; 
  subtitle: string; 
  link: string; 
}) {
  return (
    <Link href={link}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-base font-medium">{value}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Recent progress snapshot
function ProgressSnapshot({ data }: { data: ProgressData }) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-medium">Recent Progress</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-100 dark:bg-green-900/30 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
          <div className="flex justify-between items-center">
            <p className="font-medium">{data.overview.weight.current} {data.overview.weight.unit}</p>
            <span className={`text-xs ${data.overview.weight.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.overview.weight.change > 0 ? '+' : ''}{data.overview.weight.change} {data.overview.weight.unit}
            </span>
          </div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1">Body Fat</p>
          <div className="flex justify-between items-center">
            <p className="font-medium">{data.overview.bodyFat.current}%</p>
            <span className={`text-xs ${data.overview.bodyFat.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.overview.bodyFat.change > 0 ? '+' : ''}{data.overview.bodyFat.change}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main progress page
export default function ProgressPage() {
  // Fetch progress data
  const { data, isLoading } = useQuery<ProgressData>({
    queryKey: ['/api/client/progress'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Default/placeholder data while loading or if API fails
  const progressData: ProgressData = data || {
    overview: {
      weight: { current: 80.5, change: -1.5, unit: 'kg' },
      bodyFat: { current: 18.2, change: -0.8, unit: '%' },
      completedWorkouts: 12,
      streak: 5
    },
    history: {
      weights: Array(7).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: 82 - (i * 0.2)
      })),
      measurements: []
    },
    habits: {
      totalHabits: 4,
      completionRate: 85,
      currentStreak: 5
    },
    repMaxes: [
      { exerciseName: 'Bench Press', weight: 100, reps: 1 },
      { exerciseName: 'Squat', weight: 140, reps: 1 },
      { exerciseName: 'Deadlift', weight: 160, reps: 1 }
    ],
    performances: [
      { exerciseName: 'Bench Press', progress: 10 },
      { exerciseName: 'Squat', progress: 15 },
      { exerciseName: 'Deadlift', progress: 20 }
    ]
  };

  return (
    <div className="pb-16">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="container mx-auto p-4">
          <h1 className="text-xl font-bold">Progress</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6 max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <ProgressSnapshot data={progressData} />

            <div className="space-y-4">
              <h2 className="text-sm font-medium">Track Your Progress</h2>
              
              <ProgressCard
                title="Body Stats"
                icon={<Scale className="h-5 w-5" />}
                value={`${progressData.overview.weight.current} ${progressData.overview.weight.unit}`}
                subtitle="Weight, body fat, measurements"
                link="/progress/body"
              />
              
              <ProgressCard
                title="Lifting Performance"
                icon={<Dumbbell className="h-5 w-5" />}
                value={`${progressData.repMaxes.length} PRs`}
                subtitle="Rep maxes, volume tracking"
                link="/progress/performance"
              />
              
              <ProgressCard
                title="Daily Habits"
                icon={<ListChecks className="h-5 w-5" />}
                value={`${progressData.habits.completionRate}%`}
                subtitle={`${progressData.habits.currentStreak} day streak`}
                link="/progress/habits"
              />

              <ProgressCard
                title="Hydration"
                icon={<Droplets className="h-5 w-5" />}
                value="Track water"
                subtitle="Daily intake monitoring"
                link="/progress/hydration"
              />
              
              <ProgressCard
                title="Progress Photos"
                icon={<Camera className="h-5 w-5" />}
                value="Visual tracking"
                subtitle="Weekly comparison"
                link="/progress/photos"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-medium">Statistics</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <CalendarCheck className="h-6 w-6 text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{progressData.overview.streak}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Clock className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{progressData.overview.completedWorkouts}</p>
                    <p className="text-xs text-muted-foreground">Workouts</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1 text-primary" />
                      Weight Trend
                    </h3>
                    <span className="text-xs text-muted-foreground">Last 7 days</span>
                  </div>
                  
                  {/* Simple weight chart visualization */}
                  <div className="h-12 flex items-end space-x-1">
                    {progressData.history.weights.map((point, idx) => (
                      <div 
                        key={idx} 
                        className="flex-1 bg-primary/80 rounded-t"
                        style={{ 
                          height: `${((point.value - 70) / (85 - 70)) * 100}%`,
                          minHeight: '4px'
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(progressData.history.weights[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(progressData.history.weights[progressData.history.weights.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      <MobileClientNav />
    </div>
  );
}