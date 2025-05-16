import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Dumbbell,
  ChevronRight,
  CheckCircle2,
  CalendarClock,
  Clock,
  Layers,
  BarChart,
  PlayCircle,
  MoreVertical
} from 'lucide-react';
import MobileClientNav from '@/components/layout/mobile-client-nav';
import { useAuth } from '@/lib/auth';

interface Workout {
  id: number;
  title: string;
  scheduledDate: string;
  completed: boolean;
  duration: number; // in minutes
  exercises: number;
  type: string;
  muscleGroups: string[];
}

function WorkoutCard({ workout }: { workout: Workout }) {
  const formattedDate = new Date(workout.scheduledDate).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const muscleGroupBadges = workout.muscleGroups.map((group, index) => (
    <Badge key={index} variant="outline" className="mr-1 text-xs py-0 h-5">
      {group}
    </Badge>
  ));
  
  return (
    <Card className={`mb-3 ${workout.completed ? 'bg-muted/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-md p-2 ${workout.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-primary/10 text-primary'}`}>
            {workout.completed ? 
              <CheckCircle2 className="h-6 w-6" /> :
              <Dumbbell className="h-6 w-6" />
            }
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{workout.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <CalendarClock className="h-3 w-3 mr-1" /> {formattedDate}
                  <span className="mx-2">•</span>
                  <Clock className="h-3 w-3 mr-1" /> {workout.duration} min
                  <span className="mx-2">•</span>
                  <Layers className="h-3 w-3 mr-1" /> {workout.exercises} exercises
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {muscleGroupBadges}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="h-8 gap-1 text-xs">
                  <BarChart className="h-3 w-3" /> Results
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  <CalendarClock className="h-3 w-3" /> Reschedule
                </Button>
              </div>
              
              <Button variant="default" size="sm" className="h-8 gap-1 text-xs">
                <PlayCircle className="h-3 w-3" /> Start
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientWorkouts() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { user } = useAuth();
  
  // Fetch client workouts data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/client/workouts'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Default data for display
  const workoutsData = data || {
    upcomingWorkouts: [
      {
        id: 1,
        title: 'Upper Body Strength',
        scheduledDate: new Date().toISOString(),
        completed: false,
        duration: 45,
        exercises: 8,
        type: 'strength',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps']
      },
      {
        id: 2,
        title: 'Core & Mobility',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        completed: false,
        duration: 30,
        exercises: 6,
        type: 'mobility',
        muscleGroups: ['Core', 'Lower Back', 'Hips']
      }
    ],
    completedWorkouts: [
      {
        id: 3,
        title: 'Lower Body Focus',
        scheduledDate: new Date(Date.now() - 86400000).toISOString(), // yesterday
        completed: true,
        duration: 60,
        exercises: 10,
        type: 'strength',
        muscleGroups: ['Quads', 'Glutes', 'Hamstrings']
      },
      {
        id: 4,
        title: 'Full Body HIIT',
        scheduledDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        completed: true,
        duration: 40,
        exercises: 12,
        type: 'hiit',
        muscleGroups: ['Full Body', 'Cardio']
      }
    ],
    savedWorkouts: [
      {
        id: 5,
        title: 'Quick Morning Routine',
        scheduledDate: '',
        completed: false,
        duration: 20,
        exercises: 5,
        type: 'mobility',
        muscleGroups: ['Full Body', 'Mobility']
      },
      {
        id: 6,
        title: 'Back & Biceps',
        scheduledDate: '',
        completed: false,
        duration: 50,
        exercises: 9,
        type: 'strength',
        muscleGroups: ['Back', 'Biceps', 'Forearms']
      }
    ]
  };

  return (
    <div className="pb-16">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Workouts</h1>
              <p className="text-sm text-muted-foreground">
                Manage your training sessions
              </p>
            </div>
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6 max-w-lg">
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : workoutsData.upcomingWorkouts.length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Workouts</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any scheduled workouts. Contact your trainer to plan your next session.
                </p>
                <Button>Request Workout</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">This Week</h2>
                  <p className="text-sm text-muted-foreground">
                    {workoutsData.upcomingWorkouts.length} workouts
                  </p>
                </div>
                
                {workoutsData.upcomingWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : workoutsData.completedWorkouts.length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Completed Workouts</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't completed any workouts yet. Start your fitness journey today!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Recent Workouts</h2>
                  <p className="text-sm text-muted-foreground">
                    {workoutsData.completedWorkouts.length} workouts
                  </p>
                </div>
                
                {workoutsData.completedWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : workoutsData.savedWorkouts.length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Saved Workouts</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't saved any workouts yet. Save your favorite routines for quick access!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your Templates</h2>
                  <p className="text-sm text-muted-foreground">
                    {workoutsData.savedWorkouts.length} saved
                  </p>
                </div>
                
                {workoutsData.savedWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <MobileClientNav />
    </div>
  );
}