import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function NutritionList() {
  const { data: nutritionPlans, isLoading } = useQuery({
    queryKey: ['/api/nutrition-plans'],
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
        <h1 className="text-3xl font-bold">Nutrition Plans</h1>
        <Link href="/nutrition/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </Link>
      </div>

      {nutritionPlans?.length === 0 ? (
        <div className="text-center p-10 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No Nutrition Plans Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first nutrition plan to get started.</p>
          <Link href="/nutrition/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nutritionPlans?.map((plan: any) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.isTemplate ? 'Template' : `Client: ${plan.clientName}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {plan.dailyCalories} calories/day
                </p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded text-center">
                    <div className="text-xs text-muted-foreground">Protein</div>
                    <div className="font-medium">{plan.proteinPercentage}%</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-950 p-2 rounded text-center">
                    <div className="text-xs text-muted-foreground">Carbs</div>
                    <div className="font-medium">{plan.carbsPercentage}%</div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-950 p-2 rounded text-center">
                    <div className="text-xs text-muted-foreground">Fat</div>
                    <div className="font-medium">{plan.fatPercentage}%</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/nutrition/${plan.id}`}>
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}