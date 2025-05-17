import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calendar, Dumbbell, Mail, MessageSquare, Pizza, User, UserCog, ChevronLeft, Heart, Star, Trophy, Medal, Award, ArrowRight } from 'lucide-react';
import ClientHealthMetricsTab from '@/components/clients/client-health-metrics-tab';
import { EditProfileDialog } from '@/components/clients/edit-profile-dialog';
import { EditNotesDialog } from '@/components/clients/edit-notes-dialog';
import { ClientMessageDialog } from '@/components/clients/client-message-dialog';
import { ScheduleSessionDialog } from '@/components/clients/schedule-session-dialog';
import { AddActivityDialog } from '@/components/clients/add-activity-dialog';
import TrainerStreakView from '@/components/clients/trainer-streak-view';
import AnimatedProgressChart from '@/components/clients/animated-progress-chart';
import ClientExerciseTab from '@/pages/clients/client-exercise-tab';

// Global context to disable confetti/celebrations in trainer views
window.IS_TRAINER_VIEW = true;

export default function ClientDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  // Use static data for the sample client profile
  const isLoading = false;
  const isLoadingWorkouts = false;
  const isLoadingNutrition = false;
  const isLoadingProgress = false;
  
  // Mock data for client
  const client = {
    id: parseInt(id || '1'),
    fullName: "Mick Smith",
    email: "mick.711@hotmail.com",
    profileImage: null,
    height: 175,
    weight: 78.6,
    goals: "Lose weight and increase muscle tone. Looking to drop 5 kg by summer while improving core strength.",
    healthInfo: "No major health issues. Mild knee pain during heavy squats. Taking daily multivitamin supplements.",
    subscription: "Premium",
    joinedDate: "Feb 17, 2025",
    notes: "Highly motivated client. Responds well to positive reinforcement. Prefers morning workouts.",
    activities: [
      {
        type: 'workout',
        title: 'Completed Workout',
        date: 'May 14, 2025',
        description: 'Finished full upper body routine with 3 additional sets'
      },
      {
        type: 'nutrition',
        title: 'Followed Meal Plan',
        date: 'May 13, 2025',
        description: 'Hit daily macros with 95% compliance'
      },
      {
        type: 'progress',
        title: 'New Measurement',
        date: 'May 12, 2025',
        description: 'Lost 0.5kg since last week'
      }
    ],
    upcomingSessions: [
      {
        title: 'One-on-One Training',
        date: 'May 18, 2025',
        time: '7:30 AM'
      },
      {
        title: 'Monthly Assessment',
        date: 'May 24, 2025',
        time: '9:00 AM'
      }
    ]
  };
  
  // Mock data for workout plans
  const workoutPlans = [
    {
      id: 1,
      name: 'Weight Loss Program',
      status: 'Active',
      description: 'High-intensity program designed for maximum calorie burn with progressive strength components.',
      startDate: 'Apr 1, 2025',
      endDate: 'Jun 30, 2025',
      workouts: [
        { id: 1, name: 'Upper Body Push', day: 1, exerciseCount: 6 },
        { id: 2, name: 'Lower Body', day: 2, exerciseCount: 7 },
        { id: 3, name: 'Upper Body Pull', day: 4, exerciseCount: 6 },
        { id: 4, name: 'HIIT Cardio', day: 5, exerciseCount: 5 }
      ]
    }
  ];
  
  // Mock data for nutrition plans
  const nutritionPlans = [
    {
      id: 1,
      name: 'Fat Loss Nutrition Plan',
      status: 'Active',
      description: 'Calorie-controlled nutrition plan with higher protein for muscle preservation.',
      startDate: 'Apr 1, 2025',
      endDate: 'Jun 30, 2025',
      dailyCalories: 1900,
      protein: 150,
      carbs: 180,
      fat: 60
    }
  ];
  
  // Mock data for progress records
  const progressRecords = [
    {
      id: 1,
      date: 'May 10, 2025',
      weight: 78.6,
      bodyFat: 21.6,
      muscleMass: 37.8,
      measurements: {
        chest: 94,
        waist: 84,
        hips: 98
      },
      notes: 'Significant progress in core strength and posture.'
    },
    {
      id: 2,
      date: 'Apr 12, 2025',
      weight: 80.0,
      bodyFat: 22.8,
      muscleMass: 37.0,
      measurements: {
        chest: 95,
        waist: 86,
        hips: 99
      },
      notes: 'Increased cardio endurance. Able to run 5k without stopping.'
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Client Not Found</h1>
          <p className="text-muted-foreground mb-6">The client you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate('/clients')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/clients')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={client.profileImage} />
                    <AvatarFallback className="text-2xl">{client.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl text-center">{client.fullName}</CardTitle>
                  <CardDescription className="text-center">{client.email}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="font-medium">{client.height || '--'} cm</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-medium">{client.weight || '--'} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Subscription</p>
                    <p className="font-medium">{client.subscription || 'None'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium">{client.joinedDate || '--'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Goals</p>
                  <p className="text-sm text-muted-foreground">
                    {client.goals || 'No goals specified.'}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Health Information</p>
                  <p className="text-sm text-muted-foreground">
                    {client.healthInfo || 'No health information provided.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-6 border-t">
                <EditProfileDialog client={client} onSuccess={() => {
                  // Refresh client data after edit (handled by the component itself)
                }} />
                <ClientMessageDialog client={client} onSuccess={() => {
                  // Refresh client data after sending message
                }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-7 mb-8">
              <TabsTrigger value="overview" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger value="workouts" className="flex items-center">
                <Dumbbell className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Workouts</span>
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center">
                <Trophy className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Exercises</span>
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex items-center">
                <Pizza className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nutrition</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Recent Activity</CardTitle>
                  <AddActivityDialog client={client} onSuccess={() => {
                    // Refresh client data after adding activity
                  }} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {client.activities && client.activities.length > 0 ? (
                      client.activities.map((activity: any, index: number) => (
                        <div key={index} className="flex">
                          <div className="mr-4 flex flex-col items-center">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              activity.type === 'workout' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                              activity.type === 'nutrition' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                              activity.type === 'progress' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' :
                              activity.type === 'assessment' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' :
                              'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                            }`}>
                              {activity.type === 'workout' && <Dumbbell className="h-5 w-5" />}
                              {activity.type === 'nutrition' && <Pizza className="h-5 w-5" />}
                              {activity.type === 'progress' && <BarChart3 className="h-5 w-5" />}
                              {activity.type === 'message' && <MessageSquare className="h-5 w-5" />}
                              {activity.type === 'assessment' && <Calendar className="h-5 w-5" />}
                            </div>
                            {index < client.activities.length - 1 && <div className="h-full w-px bg-muted" />}
                          </div>
                          <div>
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-muted-foreground mb-2">{activity.date}</div>
                            <div className="text-sm">{activity.description}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p className="mb-4">No recent activity to display.</p>
                        <AddActivityDialog 
                          client={client} 
                          variant="default"
                          size="default"
                          onSuccess={() => {
                            // Refresh client data after adding activity
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <ScheduleSessionDialog client={client} onSuccess={() => {
                      // Refresh client data after scheduling session
                    }} />
                  </CardHeader>
                  <CardContent>
                    {client.upcomingSessions && client.upcomingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {client.upcomingSessions.map((session: any, index: number) => (
                          <div key={index} className="flex items-start space-x-4 p-3 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                              <div className="font-medium">{session.title}</div>
                              <div className="text-sm text-muted-foreground">{session.date} • {session.time}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Calendar className="h-4 w-4" />
                                <span className="sr-only">Add to Calendar</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p className="mb-4">No upcoming sessions scheduled.</p>
                        <ScheduleSessionDialog 
                          client={client} 
                          variant="default"
                          size="default"
                          onSuccess={() => {
                            // Refresh client data after scheduling session
                          }} 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {client.notes || 'No notes available for this client.'}
                    </p>
                    <EditNotesDialog client={client} onSuccess={() => {
                      // Refresh client data after edit (handled by the component itself)
                    }} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <ClientHealthMetricsTab clientId={parseInt(id || '0')} />
              
              {/* Animated Progress Chart */}
              <AnimatedProgressChart 
                clientId={parseInt(id || '0')}
                weightData={[
                  { date: "Jan 01", value: 82, goal: 75 },
                  { date: "Jan 08", value: 81, goal: 75 },
                  { date: "Jan 15", value: 80, goal: 75 },
                  { date: "Jan 22", value: 79, goal: 75 },
                  { date: "Jan 29", value: 78, goal: 75 },
                  { date: "Feb 05", value: 77, goal: 75 },
                  { date: "Feb 12", value: 76.5, goal: 75 }
                ]}
                workoutData={[
                  { date: "Jan 01", value: 3, goal: 4 },
                  { date: "Jan 08", value: 4, goal: 4 },
                  { date: "Jan 15", value: 3, goal: 4 },
                  { date: "Jan 22", value: 5, goal: 4 },
                  { date: "Jan 29", value: 4, goal: 4 },
                  { date: "Feb 05", value: 4, goal: 4 },
                  { date: "Feb 12", value: 5, goal: 4 }
                ]}
                nutritionData={[
                  { date: "Jan 01", value: 65, goal: 80 },
                  { date: "Jan 08", value: 70, goal: 80 },
                  { date: "Jan 15", value: 75, goal: 80 },
                  { date: "Jan 22", value: 72, goal: 80 },
                  { date: "Jan 29", value: 78, goal: 80 },
                  { date: "Feb 05", value: 82, goal: 80 },
                  { date: "Feb 12", value: 85, goal: 80 }
                ]}
                streakCount={14}
              />
              
              {/* Habit Streak Tracker */}
              <TrainerStreakView 
                streakCount={14}
                longestStreak={21}
                totalCompletedDays={32}
                streakDays={[
                  { date: "Mon 06", completed: true, activities: ["Morning Workout", "Nutrition Plan"] },
                  { date: "Tue 07", completed: true, activities: ["Cardio Session", "Meal Prep"] },
                  { date: "Wed 08", completed: true, activities: ["Rest Day", "Nutrition Plan"] },
                  { date: "Thu 09", completed: true, activities: ["Strength Training", "Recovery"] },
                  { date: "Fri 10", completed: true, activities: ["HIIT Workout", "Nutrition Plan"] },
                  { date: "Sat 11", completed: true, activities: ["Yoga Session", "Meal Prep"] },
                  { date: "Sun 12", completed: true, activities: ["Active Recovery", "Nutrition Plan"] }
                ]}
                rewards={[
                  { 
                    id: 1, 
                    name: "7-Day Streak", 
                    description: "Completed activities for 7 days in a row", 
                    icon: <Star className="h-6 w-6" />, 
                    unlocked: true, 
                    unlocksAt: 7 
                  },
                  { 
                    id: 2, 
                    name: "14-Day Streak", 
                    description: "Completed activities for 14 days in a row", 
                    icon: <Award className="h-6 w-6" />, 
                    unlocked: true, 
                    unlocksAt: 14 
                  },
                  { 
                    id: 3, 
                    name: "30-Day Streak", 
                    description: "Completed activities for 30 days in a row", 
                    icon: <Trophy className="h-6 w-6" />, 
                    unlocked: false, 
                    unlocksAt: 30 
                  },
                  { 
                    id: 4, 
                    name: "100-Day Streak", 
                    description: "Completed activities for 100 days in a row", 
                    icon: <Medal className="h-6 w-6" />, 
                    unlocked: false, 
                    unlocksAt: 100 
                  }
                ]}
              />
            </TabsContent>

            <TabsContent value="exercises" className="space-y-6">
              <ClientExerciseTab clientId={client.id} />
            </TabsContent>

            <TabsContent value="workouts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Workout Plans</h2>
                <Button>
                  Create Workout Plan
                </Button>
              </div>

              {isLoadingWorkouts ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !workoutPlans || workoutPlans.length === 0 ? (
                <Card>
                  <CardContent className="text-center p-10">
                    <h3 className="text-xl font-medium mb-2">No Workout Plans</h3>
                    <p className="text-muted-foreground mb-4">
                      This client doesn't have any workout plans yet.
                    </p>
                    <Button>
                      Create Workout Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {workoutPlans.map((plan: any) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{plan.name}</CardTitle>
                          <Badge variant="outline">
                            {plan.status || 'Active'}
                          </Badge>
                        </div>
                        <CardDescription>
                          {plan.startDate} - {plan.endDate || 'Ongoing'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{plan.description}</p>
                        <div className="space-y-2">
                          {plan.workouts && plan.workouts.map((workout: any) => (
                            <div key={workout.id} className="border rounded-md p-3 flex justify-between items-center">
                              <div>
                                <p className="font-medium">{workout.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Day {workout.day} • {workout.exerciseCount} exercises
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">View</Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Nutrition Plans</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/nutrition')}>
                    <Pizza className="mr-2 h-4 w-4" />
                    Nutrition Dashboard
                  </Button>
                  <Button onClick={() => navigate('/nutrition/meal-plans/new')}>
                    Create Nutrition Plan
                  </Button>
                </div>
              </div>

              {isLoadingNutrition ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !nutritionPlans || nutritionPlans.length === 0 ? (
                <Card>
                  <CardContent className="text-center p-10">
                    <h3 className="text-xl font-medium mb-2">No Nutrition Plans</h3>
                    <p className="text-muted-foreground mb-4">
                      This client doesn't have any nutrition plans yet.
                    </p>
                    <Button>
                      Create Nutrition Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {nutritionPlans.map((plan: any) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{plan.name}</CardTitle>
                          <Badge variant="outline">
                            {plan.status || 'Active'}
                          </Badge>
                        </div>
                        <CardDescription>
                          {plan.startDate} - {plan.endDate || 'Ongoing'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p>{plan.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-md text-center">
                            <p className="text-xs text-muted-foreground">Daily Calories</p>
                            <p className="font-medium">{plan.dailyCalories} kcal</p>
                          </div>
                          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-md text-center">
                            <p className="text-xs text-muted-foreground">Protein</p>
                            <p className="font-medium">{plan.proteinPercentage}%</p>
                          </div>
                          <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md text-center">
                            <p className="text-xs text-muted-foreground">Carbs</p>
                            <p className="font-medium">{plan.carbsPercentage}%</p>
                          </div>
                        </div>

                        <Button variant="outline" size="sm">View Full Plan</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Progress Tracking</h2>
                <Button>
                  Add New Record
                </Button>
              </div>

              {isLoadingProgress ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !progressRecords || progressRecords.length === 0 ? (
                <Card>
                  <CardContent className="text-center p-10">
                    <h3 className="text-xl font-medium mb-2">No Progress Records</h3>
                    <p className="text-muted-foreground mb-4">
                      Start tracking this client's progress by adding their first record.
                    </p>
                    <Button>
                      Add First Record
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Progress History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {progressRecords.map((record: any) => (
                        <div key={record.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{record.date}</h3>
                            <Button variant="ghost" size="sm">View Details</Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Weight</p>
                              <p className="font-medium">{record.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Body Fat</p>
                              <p className="font-medium">{record.bodyFat || '--'}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Muscle Mass</p>
                              <p className="font-medium">{record.muscleMass || '--'}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Photos</p>
                              <p className="font-medium">{record.photoCount || 0}</p>
                            </div>
                          </div>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground">{record.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Your conversation with {client.fullName}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col h-[500px]">
                    <div className="flex-1 overflow-y-auto p-4">
                      {client.messages && client.messages.length > 0 ? (
                        client.messages.map((message: any, index: number) => (
                          <div 
                            key={index}
                            className={`mb-4 flex ${message.fromClient ? 'justify-start' : 'justify-end'}`}
                          >
                            <div 
                              className={`max-w-[75%] rounded-lg p-3 ${
                                message.fromClient 
                                  ? 'bg-muted text-foreground' 
                                  : 'bg-primary text-primary-foreground'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className={`text-xs mt-1 ${message.fromClient ? 'text-muted-foreground' : 'text-primary-foreground/80'}`}>
                                {message.time}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <p className="text-xl font-medium mb-2">No messages yet</p>
                            <p className="text-muted-foreground">Start a conversation with {client.fullName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t p-4">
                      <div className="flex space-x-2">
                        <textarea 
                          className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={`Message ${client.fullName}...`}
                        />
                        <Button className="mt-auto">Send</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}