import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Dumbbell,
  ChevronRight,
  Bell,
  TrendingUp,
  MessageSquare,
  Apple,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import MobileClientNav from '@/components/layout/mobile-client-nav';
import { useAuth } from '@/lib/auth';

interface Workout {
  id: number;
  title: string;
  scheduledDate: string;
  completed: boolean;
  type: string;
}

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'workout' | 'progress' | 'system';
}

interface DailyStats {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  water: number;
  waterGoal: number;
  steps: number;
  stepsGoal: number;
}

function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <Card className={`mb-3 ${workout.completed ? 'bg-muted' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${workout.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-primary/10 text-primary'}`}>
              {workout.completed ? 
                <CheckCircle2 className="h-5 w-5" /> :
                <Dumbbell className="h-5 w-5" />
              }
            </div>
            <div>
              <h3 className="font-medium">{workout.title}</h3>
              <p className="text-xs text-muted-foreground">
                {workout.completed ? 'Completed' : 
                 new Date(workout.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'workout':
        return <Dumbbell className="h-5 w-5 text-purple-500" />;
      case 'progress':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className={`p-3 border-b last:border-b-0 ${notification.read ? '' : 'bg-blue-50 dark:bg-blue-900/10'}`}>
      <div className="flex space-x-3">
        <div className="mt-0.5">
          {getIcon()}
        </div>
        <div>
          <p className="text-sm">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(notification.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, value, label, progress }: { icon: React.ReactNode; value: string; label: string; progress: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
        {icon}
      </div>
      <div className="h-1 bg-muted w-12 mb-1 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <span className="font-medium text-sm">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  
  // Fetch client dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/client/dashboard'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Default data for display
  const dashboardData = data || {
    upcomingWorkouts: [
      {
        id: 1,
        title: 'Upper Body Strength',
        scheduledDate: new Date().toISOString(),
        completed: false,
        type: 'strength'
      },
      {
        id: 2,
        title: 'Core & Mobility',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        completed: false,
        type: 'mobility'
      },
      {
        id: 3,
        title: 'Lower Body Focus',
        scheduledDate: new Date(Date.now() - 86400000).toISOString(), // yesterday
        completed: true,
        type: 'strength'
      }
    ],
    notifications: [
      {
        id: 1,
        message: 'New workout plan assigned by your trainer',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        read: false,
        type: 'workout'
      },
      {
        id: 2,
        message: 'Coach sent you a message',
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        read: true,
        type: 'message'
      },
      {
        id: 3,
        message: 'Congratulations! You hit a new personal record',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        read: true,
        type: 'progress'
      }
    ],
    dailyStats: {
      calories: 1680,
      caloriesGoal: 2200,
      protein: 120,
      proteinGoal: 150,
      water: 1800,
      waterGoal: 3000,
      steps: 6500,
      stepsGoal: 10000
    },
    streak: 5
  };

  const { dailyStats } = dashboardData;

  return (
    <div className="pb-16">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.fullName || 'Client'}
              </p>
            </div>
            <Link href="/mobile/client/profile">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <span className="sr-only">Profile</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {user?.fullName?.charAt(0) || 'C'}
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6 max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Streak banner */}
            <Card className="bg-gradient-to-r from-primary/80 to-primary text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-white/20 p-2">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Current Streak</h3>
                      <p className="text-sm text-white/80">Keep up the good work!</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{dashboardData.streak} days</div>
                </div>
              </CardContent>
            </Card>

            {/* Daily stats */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Today's Progress</h2>
                <Link href="/mobile/client/progress">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    Details <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <StatItem 
                  icon={<Flame className="h-5 w-5 text-orange-500" />} 
                  value={`${dailyStats.calories}`} 
                  label="kcal" 
                  progress={(dailyStats.calories / dailyStats.caloriesGoal) * 100} 
                />
                <StatItem 
                  icon={<Apple className="h-5 w-5 text-green-500" />} 
                  value={`${dailyStats.protein}g`} 
                  label="protein" 
                  progress={(dailyStats.protein / dailyStats.proteinGoal) * 100} 
                />
                <StatItem 
                  icon={<div className="text-blue-500">💧</div>} 
                  value={`${Math.round(dailyStats.water / 1000)}L`} 
                  label="water" 
                  progress={(dailyStats.water / dailyStats.waterGoal) * 100} 
                />
                <StatItem 
                  icon={<div className="text-purple-500">👣</div>} 
                  value={`${Math.round(dailyStats.steps / 1000)}k`} 
                  label="steps" 
                  progress={(dailyStats.steps / dailyStats.stepsGoal) * 100} 
                />
              </div>
            </div>

            {/* Upcoming workouts */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Your Workouts
                  </CardTitle>
                  <Link href="/mobile/client/workouts">
                    <Button variant="ghost" size="sm" className="h-8">
                      View all
                    </Button>
                  </Link>
                </div>
                <CardDescription>Upcoming and recent sessions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {dashboardData.upcomingWorkouts.map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-primary" />
                    Notifications
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-8">
                    Mark all read
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {dashboardData.notifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/mobile/client/progress/habits">
                <Button className="w-full h-auto py-4 flex flex-col" variant="outline">
                  <CheckCircle2 className="h-5 w-5 mb-1" />
                  <span>Daily Habits</span>
                </Button>
              </Link>
              <Link href="/mobile/client/messages">
                <Button className="w-full h-auto py-4 flex flex-col" variant="outline">
                  <MessageSquare className="h-5 w-5 mb-1" />
                  <span>Message Coach</span>
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>

      <MobileClientNav />
    </div>
  );
}