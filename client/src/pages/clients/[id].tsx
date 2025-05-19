import { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, History, MessageSquare, Dumbbell, Utensils } from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Overview tab components
import ClientOverview from '@/components/clients/client-overview';

// This will be completed in future implementations
const ClientWorkoutTab = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">Workout Plans</h3>
    <p className="text-muted-foreground mb-8">Manage workout plans and training schedules for this client.</p>
    <Card>
      <CardHeader>
        <CardTitle>No Workout Plans</CardTitle>
        <CardDescription>This client doesn't have any workout plans assigned yet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Create Workout Plan</Button>
      </CardContent>
    </Card>
  </div>
);

// This will be completed in future implementations
const ClientNutritionTab = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">Nutrition Plans</h3>
    <p className="text-muted-foreground mb-8">Manage meal plans and nutrition guidelines for this client.</p>
    <Card>
      <CardHeader>
        <CardTitle>No Nutrition Plans</CardTitle>
        <CardDescription>This client doesn't have any nutrition plans assigned yet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Create Nutrition Plan</Button>
      </CardContent>
    </Card>
  </div>
);

// This will be completed in future implementations
const ClientProgressTab = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">Progress Tracking</h3>
    <p className="text-muted-foreground mb-8">Track and visualize this client's progress over time.</p>
    <Card>
      <CardHeader>
        <CardTitle>No Progress Records</CardTitle>
        <CardDescription>No progress data has been recorded for this client yet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Add Progress Record</Button>
      </CardContent>
    </Card>
  </div>
);

// This will be completed in future implementations
const ClientMessagesTab = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">Messages</h3>
    <p className="text-muted-foreground mb-8">Communicate with your client and keep all messages in one place.</p>
    <Card>
      <CardHeader>
        <CardTitle>No Messages</CardTitle>
        <CardDescription>You haven't exchanged any messages with this client yet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Send Message</Button>
      </CardContent>
    </Card>
  </div>
);

export default function ClientDetailPage() {
  const [, params] = useRoute('/clients/:id');
  const clientId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch client details
  const { data: client, isLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });

  if (isLoading || !client) {
    return <ClientDetailSkeleton />;
  }

  return (
    <div className="container p-6">
      <div className="mb-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
      </div>

      <PageHeader
        heading={client.user?.fullName || 'Client Details'}
        text={client.user?.email || ''}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workouts" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            Workouts
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="gap-2">
            <Utensils className="h-4 w-4" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <History className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ClientOverview client={client} />
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <ClientWorkoutTab />
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <ClientNutritionTab />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <ClientProgressTab />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <ClientMessagesTab />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Calendar</h3>
            <p className="text-muted-foreground mb-8">Schedule sessions and view upcoming appointments.</p>
            <Card>
              <CardHeader>
                <CardTitle>No Scheduled Events</CardTitle>
                <CardDescription>No appointments or events have been scheduled yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Schedule Session</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClientDetailSkeleton() {
  return (
    <div className="container p-6">
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="gap-2" disabled>
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
      </div>

      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-10 w-full max-w-md mb-8" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  );
}