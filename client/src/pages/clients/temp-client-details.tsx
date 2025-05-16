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
import { ClientExerciseRecommendations } from '@/components/clients/client-exercise-recommendations';

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
                    <AvatarImage src={client.profileImage || undefined} />
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
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Notes</CardTitle>
                    <EditNotesDialog client={client} onSuccess={() => {
                      // Refresh client data after editing notes
                    }} />
                  </CardHeader>
                  <CardContent>
                    {client.notes ? (
                      <p className="text-muted-foreground">{client.notes}</p>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p className="mb-4">No notes have been added for this client.</p>
                        <EditNotesDialog 
                          client={client} 
                          variant="default"
                          size="default"
                          onSuccess={() => {
                            // Refresh client data after editing notes
                          }} 
                        />
                      </div>
                    )}
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
                  { date: "Jan 22", value: 79.5, goal: 75 },
                  { date: "Jan 29", value: 79, goal: 75 },
                  { date: "Feb 05", value: 78.5, goal: 75 },
                  { date: "Feb 12", value: 78, goal: 75 },
                  { date: "Feb 19", value: 77.5, goal: 75 },
                  { date: "Feb 26", value: 77, goal: 75 },
                  { date: "Mar 05", value: 76.5, goal: 75 },
                  { date: "Mar 12", value: 76, goal: 75 },
                  { date: "Mar 19", value: 75.5, goal: 75 },
                  { date: "Mar 26", value: 75, goal: 75 },
                ]}
                workoutData={[
                  { date: "Jan 01", value: 2, goal: 4 },
                  { date: "Jan 08", value: 3, goal: 4 },
                  { date: "Jan 15", value: 3, goal: 4 },
                  { date: "Jan 22", value: 4, goal: 4 },
                  { date: "Jan 29", value: 3, goal: 4 },
                  { date: "Feb 05", value: 4, goal: 4 },
                  { date: "Feb 12", value: 4, goal: 4 },
                  { date: "Feb 19", value: 3, goal: 4 },
                  { date: "Feb 26", value: 5, goal: 4 },
                  { date: "Mar 05", value: 4, goal: 4 },
                  { date: "Mar 12", value: 4, goal: 4 },
                  { date: "Mar 19", value: 4, goal: 4 },
                  { date: "Mar 26", value: 4, goal: 4 },
                ]}
                nutritionData={[
                  { date: "Jan 01", value: 70, goal: 90 },
                  { date: "Jan 08", value: 75, goal: 90 },
                  { date: "Jan 15", value: 80, goal: 90 },
                  { date: "Jan 22", value: 78, goal: 90 },
                  { date: "Jan 29", value: 85, goal: 90 },
                  { date: "Feb 05", value: 82, goal: 90 },
                  { date: "Feb 12", value: 87, goal: 90 },
                  { date: "Feb 19", value: 85, goal: 90 },
                  { date: "Feb 26", value: 90, goal: 90 },
                  { date: "Mar 05", value: 92, goal: 90 },
                  { date: "Mar 12", value: 88, goal: 90 },
                  { date: "Mar 19", value: 93, goal: 90 },
                  { date: "Mar 26", value: 95, goal: 90 },
                ]}
                streakCount={12}
              />
            </TabsContent>
            
            {/* Exercise Recommendations Tab */}
            <TabsContent value="exercises" className="space-y-6">
              <ClientExerciseRecommendations clientId={client.id} />
            </TabsContent>

            <TabsContent value="workouts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Workout Plans</h2>
                <Button>
                  Create Workout Plan
                </Button>
              </div>
              
              {isLoadingWorkouts ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : workoutPlans && workoutPlans.length > 0 ? (
                <div className="space-y-6">
                  {workoutPlans.map((plan: any) => (
                    <Card key={plan.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.startDate} - {plan.endDate}</CardDescription>
                          </div>
                          <Badge variant={plan.status === 'Active' ? 'default' : 'outline'}>
                            {plan.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{plan.description}</p>
                        
                        <div className="space-y-2">
                          {plan.workouts && plan.workouts.map((workout: any) => (
                            <div key={workout.id} className="flex justify-between px-3 py-2 rounded-md hover:bg-muted transition-colors">
                              <div className="flex items-center">
                                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-xs">
                                  {workout.day}
                                </span>
                                <span>{workout.name}</span>
                              </div>
                              <div className="flex gap-1 items-center">
                                <span className="text-xs text-muted-foreground">{workout.exerciseCount} exercises</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Workout Plans</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This client doesn't have any active workout plans. Create a new workout plan to get started.
                  </p>
                  <Button>Create Workout Plan</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Nutrition Plans</h2>
                <Button>
                  Create Nutrition Plan
                </Button>
              </div>
              
              {isLoadingNutrition ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : nutritionPlans && nutritionPlans.length > 0 ? (
                <div className="space-y-6">
                  {nutritionPlans.map((plan: any) => (
                    <Card key={plan.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.startDate} - {plan.endDate}</CardDescription>
                          </div>
                          <Badge variant={plan.status === 'Active' ? 'default' : 'outline'}>
                            {plan.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{plan.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Daily Calories</p>
                              <p className="text-xl font-bold">{plan.dailyCalories}</p>
                              <p className="text-xs text-muted-foreground">kcal</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Protein</p>
                              <p className="text-xl font-bold">{plan.protein}g</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round((plan.protein * 4 / plan.dailyCalories) * 100)}%
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Fats</p>
                              <p className="text-xl font-bold">{plan.fat}g</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round((plan.fat * 9 / plan.dailyCalories) * 100)}%
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                              <p className="text-xl font-bold">{plan.carbs}g</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round((plan.carbs * 4 / plan.dailyCalories) * 100)}%
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Button variant="outline" className="w-full">View Full Plan</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Pizza className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Nutrition Plans</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This client doesn't have any active nutrition plans. Create a new nutrition plan to get started.
                  </p>
                  <Button>Create Nutrition Plan</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Progress Records</h2>
                <Button>
                  Add Progress Record
                </Button>
              </div>
              
              {isLoadingProgress ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : progressRecords && progressRecords.length > 0 ? (
                <div className="space-y-6">
                  {progressRecords.map((record: any) => (
                    <Card key={record.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Progress Record</CardTitle>
                            <CardDescription>{record.date}</CardDescription>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Weight</p>
                              <p className="text-xl font-bold">{record.weight} kg</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Body Fat</p>
                              <p className="text-xl font-bold">{record.bodyFat}%</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Muscle Mass</p>
                              <p className="text-xl font-bold">{record.muscleMass} kg</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Waist</p>
                              <p className="text-xl font-bold">{record.measurements.waist} cm</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {record.notes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-1">Notes</p>
                            <p className="text-sm text-muted-foreground">{record.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Progress Records</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This client doesn't have any progress records. Add a new progress record to start tracking their fitness journey.
                  </p>
                  <Button>Add Progress Record</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Messages</h2>
                <ClientMessageDialog 
                  client={client} 
                  onSuccess={() => {
                    // Refresh messages after sending
                  }} 
                />
              </div>
              
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Messages</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven't exchanged any messages with this client yet. Send a message to start the conversation.
                </p>
                <ClientMessageDialog 
                  client={client} 
                  variant="default"
                  size="default"
                  onSuccess={() => {
                    // Refresh messages after sending
                  }} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}