import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/layout/page-header";
import {
  ChevronLeft,
  UserRound,
  MessageSquare,
  FileText,
  BarChart3,
  DumbbellIcon,
  Utensils,
  Loader2,
  Calendar,
  ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";

export default function ClientDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch client details
  const { data: client, isLoading, error } = useQuery({
    queryKey: [`/api/trainer/clients/${id}`],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0], {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch client details");
      }
      return response.json();
    },
  });

  // Fetch client's workouts
  const { data: workouts } = useQuery({
    queryKey: [`/api/clients/${id}/workouts`],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0], {
          credentials: "include",
        });
        if (!response.ok) {
          return [];
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching workouts:", error);
        return [];
      }
    },
  });

  // Fetch client's nutrition plans
  const { data: nutritionPlans } = useQuery({
    queryKey: [`/api/clients/${id}/nutrition`],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0], {
          credentials: "include",
        });
        if (!response.ok) {
          return [];
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching nutrition plans:", error);
        return [];
      }
    },
  });

  // Fetch client's progress
  const { data: progress } = useQuery({
    queryKey: [`/api/progress/${id}`],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0], {
          credentials: "include",
        });
        if (!response.ok) {
          return [];
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching progress:", error);
        return [];
      }
    },
  });

  // Placeholder client data for initial implementation
  const demoClient = {
    id: parseInt(id || "1"),
    userId: 101,
    user: {
      id: 101,
      fullName: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      username: "sarah.j",
      profileImage: "",
    },
    height: 165,
    weight: 65,
    goals: "Lose 15lbs and improve overall fitness. Focus on improving cardiovascular health and building lean muscle.",
    healthInfo: "No major health issues. Mild knee pain during high-impact exercises.",
    notes: "Prefers morning workouts. Motivated by tracking progress and setting small achievable goals.",
    joinDate: "2023-07-15T00:00:00Z",
    lastActive: new Date().toISOString(),
  };

  // Demo workouts
  const demoWorkouts = [
    {
      id: 1,
      name: "12-Week Weight Loss Program",
      description: "Progressive program focusing on fat loss and muscle toning",
      startDate: "2023-07-18T00:00:00Z",
      endDate: "2023-10-10T00:00:00Z",
      progress: 65,
      status: "in_progress",
    },
    {
      id: 2,
      name: "Cardio Endurance Builder",
      description: "Focuses on improving cardiovascular endurance",
      startDate: "2023-06-01T00:00:00Z",
      endDate: "2023-07-15T00:00:00Z",
      progress: 100,
      status: "completed",
    },
  ];

  // Demo nutrition plans
  const demoNutritionPlans = [
    {
      id: 1,
      name: "Balanced Calorie Deficit Plan",
      description: "1800 calories per day with balanced macros",
      startDate: "2023-07-18T00:00:00Z",
      endDate: "2023-10-10T00:00:00Z",
      progress: 65,
      status: "in_progress",
    },
  ];

  // Demo progress records
  const demoProgress = [
    {
      id: 1,
      date: "2023-08-15T00:00:00Z",
      weight: 62,
      bodyFat: 26,
      notes: "Feeling stronger, seeing progress in arms and legs",
      measurements: {
        chest: 89,
        waist: 74,
        hips: 98,
        arms: 28,
      },
      photos: [
        { id: 1, photoType: "front", photoUrl: "" },
        { id: 2, photoType: "side", photoUrl: "" },
      ],
    },
    {
      id: 2,
      date: "2023-07-15T00:00:00Z",
      weight: 65,
      bodyFat: 28,
      notes: "Starting point. Feeling motivated and ready to start.",
      measurements: {
        chest: 91,
        waist: 78,
        hips: 102,
        arms: 27,
      },
      photos: [
        { id: 3, photoType: "front", photoUrl: "" },
        { id: 4, photoType: "side", photoUrl: "" },
      ],
    },
  ];

  // Upcoming sessions
  const demoUpcomingSessions = [
    {
      id: 1,
      title: "Upper Body Strength",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      time: "09:00 - 10:00",
      type: "workout",
    },
    {
      id: 2,
      title: "Nutrition Check-in",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      time: "14:00 - 14:30",
      type: "consultation",
    },
  ];

  // Format date function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading client details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Failed to load client details</p>
        <Link href="/clients">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>
    );
  }

  const clientData = client || demoClient;
  const clientWorkouts = workouts || demoWorkouts;
  const clientNutritionPlans = nutritionPlans || demoNutritionPlans;
  const clientProgress = progress || demoProgress;

  return (
    <>
      <PageHeader
        title={clientData.user.fullName}
        description={clientData.goals?.substring(0, 100) + (clientData.goals?.length > 100 ? "..." : "")}
        actions={[
          {
            label: "Back to Clients",
            icon: <ChevronLeft size={18} />,
            href: "/clients",
            variant: "outline",
          },
          {
            label: "Message",
            icon: <MessageSquare size={18} />,
            href: `/messages/${clientData.userId}`,
            variant: "outline",
          },
          {
            label: "Create Workout",
            icon: <FileText size={18} />,
            href: `/workouts/create?clientId=${clientData.id}`,
            variant: "default",
          },
        ]}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - Client Information */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                {clientData.user.profileImage ? (
                  <img
                    src={clientData.user.profileImage}
                    alt={clientData.user.fullName}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-3xl font-semibold dark:bg-primary-900 dark:text-primary-300">
                    {clientData.user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
                <h3 className="mt-4 font-semibold text-lg text-center">
                  {clientData.user.fullName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {clientData.user.email}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Height</p>
                  <p className="text-sm">{clientData.height ? `${clientData.height} cm` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</p>
                  <p className="text-sm">{clientData.weight ? `${clientData.weight} kg` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</p>
                  <p className="text-sm">{formatDate(clientData.joinDate || new Date().toISOString())}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</p>
                  <p className="text-sm">{formatDate(clientData.lastActive || new Date().toISOString())}</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Health Information</p>
                <p className="text-sm">{clientData.healthInfo || "No health information provided"}</p>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Trainer Notes</p>
                <p className="text-sm">{clientData.notes || "No notes added yet"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview" className="flex items-center">
                  <UserRound className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="workouts" className="flex items-center">
                  <DumbbellIcon className="mr-2 h-4 w-4" />
                  Workouts
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center">
                  <Utensils className="mr-2 h-4 w-4" />
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Progress
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Upcoming Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <CardDescription>Scheduled workouts and consultations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {demoUpcomingSessions.map((session) => (
                        <div key={session.id} className="flex items-start p-3 border rounded-lg">
                          <div className={`rounded-full p-2 mr-3 ${
                            session.type === 'workout' 
                              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
                              : 'bg-accent-100 text-accent-600 dark:bg-accent-900 dark:text-accent-400'
                          }`}>
                            {session.type === 'workout' ? (
                              <DumbbellIcon className="h-5 w-5" />
                            ) : (
                              <MessageSquare className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(session.date), "EEEE, MMMM d")} • {session.time}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Progress */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Recent Progress</CardTitle>
                        <CardDescription>Latest measurements and progress photos</CardDescription>
                      </div>
                      <Link href={`/clients/${id}/progress`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-primary">
                          View All
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {clientProgress.length > 0 ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="border rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Weight</p>
                            <p className="text-xl font-semibold mt-1">{clientProgress[0].weight} kg</p>
                            <p className="text-xs text-secondary-500">
                              {clientProgress.length > 1 ? 
                                `${(clientProgress[0].weight - clientProgress[1].weight).toFixed(1)} kg since last check-in` 
                                : "First check-in"}
                            </p>
                          </div>
                          <div className="border rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Body Fat</p>
                            <p className="text-xl font-semibold mt-1">{clientProgress[0].bodyFat}%</p>
                            <p className="text-xs text-secondary-500">
                              {clientProgress.length > 1 ? 
                                `${(clientProgress[0].bodyFat - clientProgress[1].bodyFat).toFixed(1)}% since last check-in` 
                                : "First check-in"}
                            </p>
                          </div>
                          <div className="border rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Waist</p>
                            <p className="text-xl font-semibold mt-1">{clientProgress[0].measurements.waist} cm</p>
                            <p className="text-xs text-secondary-500">
                              {clientProgress.length > 1 ? 
                                `${(clientProgress[0].measurements.waist - clientProgress[1].measurements.waist).toFixed(1)} cm since last check-in` 
                                : "First check-in"}
                            </p>
                          </div>
                          <div className="border rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Check-in</p>
                            <p className="text-xl font-semibold mt-1">{format(new Date(clientProgress[0].date), "MMM d")}</p>
                            <p className="text-xs text-gray-500">{format(new Date(clientProgress[0].date), "yyyy")}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Notes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{clientProgress[0].notes}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">No progress records yet</p>
                        <Link href={`/clients/${id}/progress/new`}>
                          <Button className="mt-3" variant="outline">Add First Progress Entry</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Current Programs Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Programs</CardTitle>
                    <CardDescription>Active workout and nutrition plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientWorkouts.filter(w => w.status === 'in_progress').map((workout) => (
                        <div key={workout.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="rounded-full bg-primary-100 p-2 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                              <DumbbellIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{workout.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(workout.startDate)} - {formatDate(workout.endDate)}
                              </p>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${workout.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-xs font-medium">{workout.progress}%</span>
                          </div>
                          <div className="mt-3">
                            <Link href={`/workouts/${workout.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary">
                                View Workout
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      
                      {clientNutritionPlans.filter(n => n.status === 'in_progress').map((plan) => (
                        <div key={plan.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="rounded-full bg-accent-100 p-2 text-accent-600 dark:bg-accent-900 dark:text-accent-400">
                              <Utensils className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{plan.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                              </p>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-2 bg-accent-500 rounded-full" 
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-xs font-medium">{plan.progress}%</span>
                          </div>
                          <div className="mt-3">
                            <Link href={`/nutrition/${plan.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary">
                                View Nutrition Plan
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      
                      {clientWorkouts.filter(w => w.status === 'in_progress').length === 0 && 
                      clientNutritionPlans.filter(n => n.status === 'in_progress').length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-gray-500 dark:text-gray-400">No active programs</p>
                          <div className="flex gap-2 justify-center mt-3">
                            <Link href={`/workouts/create?clientId=${clientData.id}`}>
                              <Button variant="outline">Create Workout</Button>
                            </Link>
                            <Link href={`/nutrition/create?clientId=${clientData.id}`}>
                              <Button variant="outline">Create Nutrition Plan</Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Workouts Tab */}
              <TabsContent value="workouts" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Workout Programs</h2>
                  <Link href={`/workouts/create?clientId=${clientData.id}`}>
                    <Button>Create Workout</Button>
                  </Link>
                </div>
                
                {clientWorkouts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <DumbbellIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No workout plans yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Create a workout plan to get started with this client
                      </p>
                      <Link href={`/workouts/create?clientId=${clientData.id}`}>
                        <Button>Create First Workout</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {clientWorkouts.map((workout) => (
                      <Card key={workout.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">{workout.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(workout.startDate)} - {formatDate(workout.endDate)}
                              </p>
                              <p className="text-sm mt-2">{workout.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                workout.status === 'completed' 
                                  ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300' 
                                  : workout.status === 'in_progress'
                                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {workout.status === 'in_progress' ? 'In Progress' : 
                                 workout.status === 'completed' ? 'Completed' : 'Not Started'}
                              </span>
                              <Link href={`/workouts/${workout.id}`}>
                                <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                            </div>
                          </div>
                          {workout.status === 'in_progress' && (
                            <div className="mt-4">
                              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-2 bg-primary rounded-full" 
                                  style={{ width: `${workout.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                                <span className="text-xs font-medium">{workout.progress}%</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Nutrition Plans</h2>
                  <Link href={`/nutrition/create?clientId=${clientData.id}`}>
                    <Button>Create Nutrition Plan</Button>
                  </Link>
                </div>
                
                {clientNutritionPlans.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Utensils className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No nutrition plans yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Create a nutrition plan to help this client reach their goals
                      </p>
                      <Link href={`/nutrition/create?clientId=${clientData.id}`}>
                        <Button>Create First Nutrition Plan</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {clientNutritionPlans.map((plan) => (
                      <Card key={plan.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">{plan.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                              </p>
                              <p className="text-sm mt-2">{plan.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                plan.status === 'completed' 
                                  ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300' 
                                  : plan.status === 'in_progress'
                                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {plan.status === 'in_progress' ? 'In Progress' : 
                                 plan.status === 'completed' ? 'Completed' : 'Not Started'}
                              </span>
                              <Link href={`/nutrition/${plan.id}`}>
                                <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                            </div>
                          </div>
                          {plan.status === 'in_progress' && (
                            <div className="mt-4">
                              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-2 bg-primary rounded-full" 
                                  style={{ width: `${plan.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                                <span className="text-xs font-medium">{plan.progress}%</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Progress Records</h2>
                  <Link href={`/clients/${id}/progress/new`}>
                    <Button>Add Progress Record</Button>
                  </Link>
                </div>
                
                {clientProgress.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No progress records yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Add the first progress record to start tracking this client's journey
                      </p>
                      <Link href={`/clients/${id}/progress/new`}>
                        <Button>Add First Progress Record</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Progress Summary Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Progress Summary</CardTitle>
                        <CardDescription>
                          Comparing latest measurements with initial check-in
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                            <p className="text-xl font-semibold">{clientProgress[0].weight} kg</p>
                            <p className="text-xs text-secondary-500">
                              {clientProgress.length > 1 &&
                                `${(
                                  clientProgress[0].weight - clientProgress[clientProgress.length - 1].weight
                                ).toFixed(1)} kg total`}
                            </p>
                          </div>
                          <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Body Fat</p>
                            <p className="text-xl font-semibold">{clientProgress[0].bodyFat}%</p>
                            <p className="text-xs text-secondary-500">
                              {clientProgress.length > 1 &&
                                `${(
                                  clientProgress[0].bodyFat - clientProgress[clientProgress.length - 1].bodyFat
                                ).toFixed(1)}% total`}
                            </p>
                          </div>
                          <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Waist</p>
                            <p className="text-xl font-semibold">{clientProgress[0].measurements.waist} cm</p>
                            <p className="text-xs text-secondary-500">
                              {clientProgress.length > 1 &&
                                `${(
                                  clientProgress[0].measurements.waist - 
                                  clientProgress[clientProgress.length - 1].measurements.waist
                                ).toFixed(1)} cm total`}
                            </p>
                          </div>
                          <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Progress Duration</p>
                            <p className="text-xl font-semibold">
                              {clientProgress.length > 1 
                                ? differenceInWeeks(
                                    new Date(clientProgress[0].date),
                                    new Date(clientProgress[clientProgress.length - 1].date)
                                  )
                                : 0} weeks
                            </p>
                            <p className="text-xs text-gray-500">
                              {clientProgress.length} check-ins
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Progress Records Timeline */}
                    <div className="space-y-6">
                      {clientProgress.map((record, index) => (
                        <Card key={record.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold">
                                    {formatDate(record.date)}
                                  </h3>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {index === 0 
                                      ? "Latest Check-in" 
                                      : index === clientProgress.length - 1 
                                      ? "Initial Check-in" 
                                      : `Check-in #${clientProgress.length - index}`}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                                    <p className="font-medium">{record.weight} kg</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Body Fat</p>
                                    <p className="font-medium">{record.bodyFat}%</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Waist</p>
                                    <p className="font-medium">{record.measurements.waist} cm</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Chest</p>
                                    <p className="font-medium">{record.measurements.chest} cm</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                                  <p className="text-sm">{record.notes}</p>
                                </div>
                              </div>
                              
                              {record.photos?.length > 0 && (
                                <div className="flex gap-2">
                                  {record.photos.map((photo) => (
                                    <div key={photo.id} className="relative w-24 h-32 border rounded-md overflow-hidden">
                                      {photo.photoUrl ? (
                                        <img 
                                          src={photo.photoUrl} 
                                          alt={`${photo.photoType} view`} 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                          <p className="text-xs text-gray-500 capitalize">{photo.photoType}</p>
                                        </div>
                                      )}
                                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 text-center capitalize">
                                        {photo.photoType}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}

// Helper function to calculate the difference in weeks between two dates
function differenceInWeeks(dateLeft: Date, dateRight: Date): number {
  const diffTime = Math.abs(dateLeft.getTime() - dateRight.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
}
