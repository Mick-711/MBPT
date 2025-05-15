import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Dumbbell, CheckCircle } from 'lucide-react';

export default function ClientWorkouts() {
  const { data: workoutPlans, isLoading } = useQuery({
    queryKey: ['/api/client/workout-plans'],
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const plans = workoutPlans?.plans || [];
  const nextWorkout = workoutPlans?.nextWorkout;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">My Workouts</h1>
      </div>

      {nextWorkout && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Next Workout</CardTitle>
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                {nextWorkout.daysUntil === 0 ? 'Today' : `In ${nextWorkout.daysUntil} days`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{nextWorkout.name}</p>
                  <p className="text-sm text-muted-foreground mb-1">{nextWorkout.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{nextWorkout.date} • {nextWorkout.time || 'Any time'}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/workouts/${nextWorkout.id}`}>
                      <Button size="sm">Start Workout</Button>
                    </Link>
                    <Button variant="outline" size="sm">Reschedule</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-bold mb-4">My Workout Plans</h2>

      {plans.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Workouts Yet</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any workout plans assigned yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan: any) => (
            <Card key={plan.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge variant="outline">
                    {plan.status || 'Active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {plan.description || 'No description provided.'}
                </p>

                {plan.progress !== undefined && (
                  <div className="flex items-center mb-4">
                    <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm font-medium">{plan.progress}%</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 border rounded-md">
                    <p className="text-xs text-muted-foreground">Workouts</p>
                    <p className="font-medium">{plan.workoutCount || 0}</p>
                  </div>
                  <div className="text-center p-2 border rounded-md">
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="font-medium">{plan.completedCount || 0}</p>
                  </div>
                </div>

                <Link href={`/workout-plan/${plan.id}`}>
                  <Button variant="outline" className="w-full">View Plan</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}