import { useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Dumbbell, MessageSquare, UserCircle, Utensils, LineChart, Edit, Mail, Phone } from 'lucide-react';

// Client overview tab content
const ClientOverview = ({ clientId }: { clientId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/trainer/clients/${clientId}`],
  });

  if (isLoading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const client = data || {};
  const user = client.user || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Basic details about your client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Full Name</div>
              <div className="font-medium">{user.fullName || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{user.email || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Height</div>
              <div className="font-medium">{client.height ? `${client.height} cm` : 'Not recorded'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Weight</div>
              <div className="font-medium">{client.weight ? `${client.weight} kg` : 'Not recorded'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Date of Birth</div>
              <div className="font-medium">
                {client.dateOfBirth 
                  ? new Date(client.dateOfBirth).toLocaleDateString() 
                  : 'Not recorded'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Joined Date</div>
              <div className="font-medium">
                {client.joinedDate 
                  ? new Date(client.joinedDate).toLocaleDateString() 
                  : new Date(client.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals & Health Information</CardTitle>
          <CardDescription>Client's fitness goals and health notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Goals</h4>
              <p className="text-sm text-muted-foreground">{client.goals || 'No goals recorded'}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Health Information</h4>
              <p className="text-sm text-muted-foreground">{client.healthInfo || 'No health information recorded'}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Additional Notes</h4>
              <p className="text-sm text-muted-foreground">{client.notes || 'No additional notes'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Client workouts tab content
const ClientWorkouts = ({ clientId }: { clientId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/trainer/clients/${clientId}/workouts`],
  });

  if (isLoading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const workouts = data || [];

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Workout Plans</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              This client doesn't have any workout plans assigned yet. Create a workout plan to help them achieve their fitness goals.
            </p>
            <Button>Create Workout Plan</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Workout Plans</h3>
        <Button>Assign New Plan</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {workouts.map((plan: any) => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? "default" : "outline"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Created {new Date(plan.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goal:</span>
                  <span>{plan.goal || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{plan.duration || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span>{plan.frequency || 'Not specified'}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">View</Button>
                <Button variant="outline" size="sm" className="flex-1">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Client nutrition tab content
const ClientNutrition = ({ clientId }: { clientId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/trainer/clients/${clientId}/nutrition`],
  });

  if (isLoading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const nutritionPlans = data || [];

  if (nutritionPlans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Nutrition Plans</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              This client doesn't have any nutrition plans assigned yet. Create a nutrition plan to help them achieve their dietary goals.
            </p>
            <Button>Create Nutrition Plan</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Nutrition Plans</h3>
        <Button>Assign New Plan</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {nutritionPlans.map((plan: any) => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? "default" : "outline"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>
                Created {new Date(plan.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Calories:</span>
                  <span>{plan.dailyCalories || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protein (g):</span>
                  <span>{plan.proteinGrams || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carbs (g):</span>
                  <span>{plan.carbGrams || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fat (g):</span>
                  <span>{plan.fatGrams || 'Not specified'}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">View</Button>
                <Button variant="outline" size="sm" className="flex-1">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Client progress tab content
const ClientProgress = ({ clientId }: { clientId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/trainer/clients/${clientId}/progress`],
  });

  if (isLoading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const { progressRecords = [] } = data || {};

  if (progressRecords.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Progress Records</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              This client doesn't have any progress records yet. Record their progress to track their fitness journey.
            </p>
            <Button>Add Progress Record</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Progress Records</h3>
        <Button>Add New Record</Button>
      </div>
      
      <div className="space-y-4">
        {progressRecords.map((record: any) => (
          <Card key={record.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>Progress Report</CardTitle>
                <Badge>
                  {new Date(record.recordDate || record.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Weight</div>
                  <div className="font-medium">{record.weight ? `${record.weight} kg` : 'Not recorded'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Body Fat %</div>
                  <div className="font-medium">{record.bodyFatPercentage ? `${record.bodyFatPercentage}%` : 'Not recorded'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Muscle Mass</div>
                  <div className="font-medium">{record.muscleMass ? `${record.muscleMass} kg` : 'Not recorded'}</div>
                </div>
              </div>
              
              {record.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">{record.notes}</p>
                </div>
              )}
              
              <div className="mt-4">
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Client messages tab content
const ClientMessages = ({ clientId }: { clientId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/trainer/clients/${clientId}/messages`],
  });

  if (isLoading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const { messages = [] } = data || {};
  const { client = {} } = data || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>Messages between you and {client.user?.fullName || 'this client'}</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't exchanged any messages with this client yet. Start the conversation to better communicate about their fitness journey.
              </p>
              <Button>Send Message</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Message list would go here */}
              <div className="flex flex-col space-y-4">
                {messages.map((message: any) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.senderId === client.userId ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.senderId === client.userId 
                          ? 'bg-gray-100 dark:bg-gray-800 text-left' 
                          : 'bg-primary text-primary-foreground text-right'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(message.sentAt || message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message input would go here */}
              <div className="mt-4 flex gap-2">
                <Input placeholder="Type your message..." className="flex-1" />
                <Button>Send</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Missing component - need to add
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default function ClientDetailPage() {
  const [params] = useParams();
  const [location] = useLocation();
  const { id } = params || {};
  
  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.includes('/workouts')) return 'workouts';
    if (location.includes('/nutrition')) return 'nutrition';
    if (location.includes('/progress')) return 'progress';
    if (location.includes('/messages')) return 'messages';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Query for client data
  const { data: clientData, isLoading } = useQuery({
    queryKey: [`/api/trainer/clients/${id}`],
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const client = clientData || {};
  const user = client.user || {};

  return (
    <div className="container p-6">
      <div className="mb-6">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImage} alt={user.fullName} />
              <AvatarFallback className="text-lg">{user.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'CL'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.fullName || 'Client Details'}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {user.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>{user.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="self-start md:self-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-1">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Nutrition</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ClientOverview clientId={id} />
        </TabsContent>
        
        <TabsContent value="workouts">
          <ClientWorkouts clientId={id} />
        </TabsContent>
        
        <TabsContent value="nutrition">
          <ClientNutrition clientId={id} />
        </TabsContent>
        
        <TabsContent value="progress">
          <ClientProgress clientId={id} />
        </TabsContent>
        
        <TabsContent value="messages">
          <ClientMessages clientId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}