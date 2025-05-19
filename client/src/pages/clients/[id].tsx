// client/src/pages/clients/[id].tsx
import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Dumbbell, Mail, LineChart, User, Users, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Client Overview Component
const ClientOverview = ({ client }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
              <dd>{client.user.fullName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd>{client.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Height</dt>
              <dd>{client.height ? `${client.height} cm` : 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Weight</dt>
              <dd>{client.weight ? `${client.weight} kg` : 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
              <dd>{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
              <dd>{new Date(client.joinedDate || client.user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Goals & Health Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Goals</h3>
            <p className="text-sm">{client.goals || 'No goals set'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Health Information</h3>
            <p className="text-sm">{client.healthInfo || 'No health information provided'}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{client.notes || 'No notes'}</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Client Workouts Component
const ClientWorkouts = ({ clientId }: { clientId: string }) => {
  const { data: workouts, isLoading, error } = useQuery({
    queryKey: ['client', clientId, 'workouts'],
    queryFn: async () => {
      const response = await fetch(`/api/trainer/clients/${clientId}/workouts`);
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      return response.json();
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading workouts</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workout Plans</h2>
        <Button>Create New Plan</Button>
      </div>
      
      {workouts?.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No workout plans yet</p>
          <Button variant="outline" className="mt-4">Create First Workout Plan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts?.map((workout: any) => (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{workout.name}</CardTitle>
                  <Badge variant="outline">{workout.isTemplate ? 'Template' : 'Active'}</Badge>
                </div>
                <CardDescription>
                  {new Date(workout.startDate).toLocaleDateString()} - {workout.endDate ? new Date(workout.endDate).toLocaleDateString() : 'Ongoing'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{workout.description || 'No description'}</p>
                <Button variant="outline" className="w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Client Nutrition Plans Component
const ClientNutrition = ({ clientId }: { clientId: string }) => {
  const { data: nutritionPlans, isLoading, error } = useQuery({
    queryKey: ['client', clientId, 'nutrition'],
    queryFn: async () => {
      const response = await fetch(`/api/trainer/clients/${clientId}/nutrition`);
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plans');
      }
      return response.json();
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading nutrition plans</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Nutrition Plans</h2>
        <Button>Create New Plan</Button>
      </div>
      
      {nutritionPlans?.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No nutrition plans yet</p>
          <Button variant="outline" className="mt-4">Create First Nutrition Plan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nutritionPlans?.map((plan: any) => (
            <Card key={plan.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge variant="outline">{plan.isTemplate ? 'Template' : 'Active'}</Badge>
                </div>
                <CardDescription>
                  {new Date(plan.startDate).toLocaleDateString()} - {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'Ongoing'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <div className="text-sm font-medium">Daily Calories: {plan.calories || 'Not set'}</div>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div className="text-xs">Protein: {plan.protein || '0'}g</div>
                    <div className="text-xs">Carbs: {plan.carbs || '0'}g</div>
                    <div className="text-xs">Fat: {plan.fat || '0'}g</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Client Progress Component
const ClientProgress = ({ clientId }: { clientId: string }) => {
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['client', clientId, 'progress'],
    queryFn: async () => {
      const response = await fetch(`/api/trainer/clients/${clientId}/progress`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      return response.json();
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading progress data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Progress Records</h2>
        <Button>Add Progress Record</Button>
      </div>
      
      {progress?.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No progress records yet</p>
          <Button variant="outline" className="mt-4">Record First Progress Update</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {progress?.map((record: any) => (
            <Card key={record.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {new Date(record.date).toLocaleDateString()}
                  </CardTitle>
                  <Badge>{record.weight ? `${record.weight} kg` : 'No weight recorded'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{record.notes || 'No notes'}</p>
                <div className="flex flex-wrap gap-4">
                  {record.photos?.map((photo: any, index: number) => (
                    <div key={photo.id} className="w-24 h-24 relative bg-muted rounded overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        Photo {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                {record.photos?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No photos uploaded</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Client Messages Component
const ClientMessages = ({ clientId }: { clientId: string }) => {
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['client', clientId, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/trainer/clients/${clientId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
  });

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading messages</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Messages</h2>
        <Button>Send New Message</Button>
      </div>
      
      {messages?.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No messages yet</p>
          <Button variant="outline" className="mt-4">Start Conversation</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {messages?.map((message: any) => (
            <div 
              key={message.id} 
              className={`p-3 rounded-lg max-w-[80%] ${
                message.senderId === parseInt(clientId) 
                  ? 'ml-auto bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.sentAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Client Detail Page Component
export default function ClientDetail() {
  const params = useParams();
  const clientId = params.id;
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/trainer/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h2 className="text-red-700 font-semibold mb-2">Error Loading Client</h2>
        <p className="text-red-600">Unable to load client details. Please try again or contact support.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/clients')}
        >
          Return to Clients List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/clients/${clientId}`}>{client?.user?.fullName || 'Client Details'}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Client Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-full p-2" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {client?.user?.fullName?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{client?.user?.fullName}</h1>
            <p className="text-muted-foreground">{client?.user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline">Edit Profile</Button>
          <Button>Schedule Session</Button>
        </div>
      </div>
      
      {/* Client Details Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <User className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex gap-2 items-center">
            <Dumbbell className="h-4 w-4" /> Workouts
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex gap-2 items-center">
            <Utensils className="h-4 w-4" /> Nutrition
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex gap-2 items-center">
            <LineChart className="h-4 w-4" /> Progress
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex gap-2 items-center">
            <Mail className="h-4 w-4" /> Messages
          </TabsTrigger>
        </TabsList>
        
        <div className="pt-6">
          <TabsContent value="overview">
            <ClientOverview client={client} />
          </TabsContent>
          
          <TabsContent value="workouts">
            <ClientWorkouts clientId={clientId} />
          </TabsContent>
          
          <TabsContent value="nutrition">
            <ClientNutrition clientId={clientId} />
          </TabsContent>
          
          <TabsContent value="progress">
            <ClientProgress clientId={clientId} />
          </TabsContent>
          
          <TabsContent value="messages">
            <ClientMessages clientId={clientId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}