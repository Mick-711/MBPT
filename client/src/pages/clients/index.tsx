import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, UserPlus, Mail, BarChart3 } from 'lucide-react';

export default function ClientsList() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="active">Active Clients</TabsTrigger>
          <TabsTrigger value="pending">Pending Invites</TabsTrigger>
          <TabsTrigger value="all">All Clients</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          {!clients || clients.length === 0 ? (
            <div className="text-center p-10 bg-muted rounded-lg">
              <h3 className="text-xl font-medium mb-2">No Active Clients Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding a new client to your training roster.
              </p>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients?.map((client: any) => (
                <Card key={client.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={client.profileImage} />
                          <AvatarFallback>{client.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{client.fullName}</CardTitle>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Weight</p>
                        <p className="font-medium">{client.weight || '--'} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-medium">{client.height || '--'} cm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Subscription</p>
                        <p className="font-medium">{client.subscription || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Activity</p>
                        <p className="font-medium">{client.lastActivity || 'Never'}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="default">View Profile</Button>
                    </Link>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <div className="text-center p-10 bg-muted rounded-lg">
            <h3 className="text-xl font-medium mb-2">No Pending Invites</h3>
            <p className="text-muted-foreground mb-4">
              When you invite clients to join, they'll appear here.
            </p>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Client
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          {/* Same content as active tab or a more comprehensive list */}
          {!clients || clients.length === 0 ? (
            <div className="text-center p-10 bg-muted rounded-lg">
              <h3 className="text-xl font-medium mb-2">No Clients Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding a new client to your training roster.
              </p>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Same client cards as above */}
              {clients?.map((client: any) => (
                <Card key={client.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={client.profileImage} />
                          <AvatarFallback>{client.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{client.fullName}</CardTitle>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Weight</p>
                        <p className="font-medium">{client.weight || '--'} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-medium">{client.height || '--'} cm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Subscription</p>
                        <p className="font-medium">{client.subscription || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Activity</p>
                        <p className="font-medium">{client.lastActivity || 'Never'}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="default">View Profile</Button>
                    </Link>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}