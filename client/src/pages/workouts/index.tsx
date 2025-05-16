import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Dumbbell, Copy } from 'lucide-react';

export default function WorkoutsList() {
  const { data: workoutPlans, isLoading } = useQuery({
    queryKey: ['/api/workout-plans'],
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
        <h1 className="text-3xl font-bold">Workout Plans</h1>
        <Link href="/workouts/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </Link>
      </div>

      {!workoutPlans || workoutPlans.length === 0 ? (
        <div className="text-center p-10 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No Workout Plans Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first workout plan to get started.</p>
          <Link href="/workouts/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutPlans?.map((plan: any) => (
            <Card key={plan.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.isTemplate ? 'Template' : `Client: ${plan.clientName}`}
                    </CardDescription>
                  </div>
                  {plan.isTemplate && (
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
                      Template
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center mb-2">
                  <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {plan.workoutCount || 0} {plan.workoutCount === 1 ? 'workout' : 'workouts'}
                  </span>
                </div>
                <p className="text-sm line-clamp-2">{plan.description || 'No description provided.'}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Link href={`/workouts/${plan.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                {plan.isTemplate && (
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <Copy className="h-4 w-4 mr-2" />
                    Use as Template
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}