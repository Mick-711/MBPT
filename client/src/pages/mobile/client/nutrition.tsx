import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pizza, Clock, CheckCircle, Calendar } from 'lucide-react';

export default function ClientNutrition() {
  const { data: nutritionData, isLoading } = useQuery({
    queryKey: ['/api/client/nutrition'],
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

  const plan = nutritionData?.currentPlan;
  const todaysMeals = nutritionData?.todaysMeals || [];
  const mealHistory = nutritionData?.mealHistory || [];

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Nutrition</h1>
        </div>
        
        {/* Only show the trainer view button when in trainer mode */}
        {window.IS_TRAINER_VIEW && (
          <Link href="/nutrition">
            <Button variant="outline" size="sm">
              <Pizza className="h-4 w-4 mr-2" />
              Nutrition Dashboard
            </Button>
          </Link>
        )}
      </div>

      {plan ? (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium text-lg mb-1">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-md p-3">
                <p className="text-xs text-muted-foreground">Daily Target</p>
                <p className="font-medium">{plan.dailyCalories} kcal</p>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-xs text-muted-foreground">Progress Today</p>
                <p className="font-medium">{plan.consumedToday || 0} kcal</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="font-medium">{plan.proteinPercentage}%</p>
                <p className="text-xs">{plan.proteinGrams}g</p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="font-medium">{plan.carbsPercentage}%</p>
                <p className="text-xs">{plan.carbsGrams}g</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground">Fat</p>
                <p className="font-medium">{plan.fatPercentage}%</p>
                <p className="text-xs">{plan.fatGrams}g</p>
              </div>
            </div>
            
            <Link href={`/nutrition/plan/${plan.id}`}>
              <Button variant="outline" className="w-full">View Full Plan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="text-center py-6">
            <Pizza className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Nutrition Plan</h3>
            <p className="text-muted-foreground mb-4">
              You don't have a nutrition plan assigned yet.
            </p>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-bold mb-4">Today's Meals</h2>
      
      {todaysMeals.length === 0 ? (
        <div className="text-center p-6 bg-muted rounded-lg mb-6">
          <p className="text-muted-foreground">No meals scheduled for today.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {todaysMeals.map((meal: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Pizza className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{meal.name}</h3>
                      <Badge variant={meal.completed ? "outline" : "secondary"}>
                        {meal.completed ? 'Completed' : meal.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{meal.calories} kcal</p>
                    <div className="text-sm mb-3">
                      {meal.description}
                    </div>
                    {!meal.completed && (
                      <Button size="sm" className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Eaten
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mealHistory.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">Recent History</h2>
          <div className="space-y-4">
            {mealHistory.map((entry: any, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <CardTitle className="text-base">{entry.date}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {entry.calories} kcal
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {entry.summary}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}