import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Calendar, Dumbbell, Pizza, BarChart3, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';

// Define types for our dashboard data
interface WorkoutItem {
  id: string;
  name: string;
  description: string;
}

interface NutritionData {
  consumedCalories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ProgressData {
  currentWeight: number | null;
  goalWeight: number | null;
  bodyFat: number | null;
}

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface ActivityItem {
  id: string;
  type: 'workout' | 'nutrition' | 'progress';
  title: string;
  time: string;
  description: string;
}

interface DashboardData {
  upcomingWorkouts: WorkoutItem[];
  nutrition: NutritionData;
  progress: ProgressData;
  tasks: TaskItem[];
  activityFeed: ActivityItem[];
}

// Define extended user interface
interface ExtendedUser {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: 'trainer' | 'client';
  profileImage?: string;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const extendedUser = user as ExtendedUser | null;

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/client/dashboard'],
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Safely declare data types with fallbacks
  const upcomingWorkouts = dashboardData?.upcomingWorkouts || [];
  const nutrition = dashboardData?.nutrition || {
    consumedCalories: 0,
    targetCalories: 2000,
    protein: 0,
    carbs: 0,
    fat: 0
  };
  const progress = dashboardData?.progress || {
    currentWeight: null,
    goalWeight: null,
    bodyFat: null
  };
  const tasks = dashboardData?.tasks || [];
  const activityFeed = dashboardData?.activityFeed || [];

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">{extendedUser?.fullName}</p>
        </div>
        <Avatar>
          <AvatarImage src={extendedUser?.profileImage} />
          <AvatarFallback>{extendedUser?.fullName?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </div>

      {/* Today's Plan */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Today's Plan</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingWorkouts.length > 0 ? (
            <div className="space-y-4">
              {upcomingWorkouts.slice(0, 1).map((workout, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{workout.name}</p>
                    <p className="text-sm text-muted-foreground">{workout.description}</p>
                    <div className="mt-2">
                      <Link href={`/workouts/${workout.id}`}>
                        <Button variant="outline" size="sm" className="w-full">View Workout</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No workouts scheduled for today.</p>
              <Link href="/workouts">
                <Button variant="outline" size="sm" className="mt-2">View All Workouts</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Progress */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Today's Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="font-medium">{nutrition.consumedCalories} / {nutrition.targetCalories} kcal</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 py-1 px-2 rounded text-xs font-medium">
                {Math.round((nutrition.consumedCalories / nutrition.targetCalories) * 100)}%
              </div>
            </div>
            <Progress value={(nutrition.consumedCalories / nutrition.targetCalories) * 100} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="font-medium">{nutrition.protein}g</p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="font-medium">{nutrition.carbs}g</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded">
                <p className="text-xs text-muted-foreground">Fat</p>
                <p className="font-medium">{nutrition.fat}g</p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/nutrition">
                <Button variant="outline" size="sm" className="w-full">
                  <Pizza className="mr-2 h-4 w-4" />
                  View Meal Plan
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Progress</CardTitle>
            <Link href="/progress">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <p className="text-sm">Current Weight</p>
              <p className="font-medium">{progress.currentWeight || '--'} kg</p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-sm">Goal Weight</p>
              <p className="font-medium">{progress.goalWeight || '--'} kg</p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-sm">Body Fat</p>
              <p className="font-medium">{progress.bodyFat || '--'}%</p>
            </div>
            <div className="pt-2">
              <Link href="/progress/update">
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Update Progress
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      {tasks.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                  </div>
                  {!task.completed && (
                    <Button variant="ghost" size="sm">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityFeed.length > 0 ? (
              activityFeed.map((activity, index) => (
                <div key={index} className="flex space-x-4 items-start">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full shrink-0">
                    {activity.type === 'workout' && <Dumbbell className="h-4 w-4 text-primary" />}
                    {activity.type === 'nutrition' && <Pizza className="h-4 w-4 text-primary" />}
                    {activity.type === 'progress' && <BarChart3 className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    <p className="text-sm">{activity.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No recent activity to display.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}