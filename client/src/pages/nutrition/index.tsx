import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Pizza,
  ShoppingCart,
  Calendar,
  Calculator,
  Plus,
  ChevronRight,
  Book,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { 
  initializeNutritionStorage, 
  getMealPlansFromStorage,
  getFoodsFromStorage,
} from '@/lib/nutritionHelpers';

export default function NutritionPage() {
  const [, navigate] = useLocation();
  
  // Initialize nutrition storage if empty
  useEffect(() => {
    initializeNutritionStorage();
  }, []);
  
  // Fetch meal plans
  const { data: mealPlans } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => getMealPlansFromStorage()
  });
  
  // Fetch food database
  const { data: foods } = useQuery({
    queryKey: ['foods'],
    queryFn: () => getFoodsFromStorage()
  });
  
  // Sample data for recently used foods
  const recentlyUsedFoods = foods?.slice(0, 5) || [];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition Management</h1>
          <p className="text-muted-foreground">
            Create and manage meal plans, track client nutrition, and monitor progress
          </p>
        </div>
      </div>
      
      {/* Main action buttons section */}
      <Card className="mb-5 card">
        <CardHeader className="card-header">
          <CardTitle>Create New Items</CardTitle>
          <CardDescription>Add new foods, meals, and nutrition templates to your database</CardDescription>
        </CardHeader>
        <CardContent className="card-content">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button className="h-auto py-4 flex flex-col" onClick={() => navigate('/nutrition/food-database/new')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mb-2">
                <path d="M18 6h-9.5L6 8.5V9c0 .28.22.5.5.5h13.22" />
                <path d="M20 15c0-1.66-1.34-3-3-3h-1c-1.66 0-3 1.34-3 3h-2c0-1.66-1.34-3-3-3H7c-1.66 0-3 1.34-3 3" />
                <path d="M11 3h2v3h-2z" />
                <path d="M3 15h18v2c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-2z" />
                <path d="M7 10v1" />
                <path d="M17 10v1" />
              </svg>
              <span>Add New Food</span>
            </Button>
            <Button 
              className="h-auto py-4 flex flex-col" 
              onClick={() => {
                // Use React 18's startTransition API to prevent suspension error
                if (typeof window !== 'undefined' && 'React' in window && 'startTransition' in (window as any).React) {
                  (window as any).React.startTransition(() => {
                    navigate('/nutrition/meal-plans/new');
                  });
                } else {
                  // Fallback for when React.startTransition is not available
                  setTimeout(() => {
                    navigate('/nutrition/meal-plans/new');
                  }, 0);
                }
              }}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>Create Meal Plan</span>
            </Button>
            <Button className="h-auto py-4 flex flex-col" onClick={() => navigate('/nutrition/calculator')}>
              <Calculator className="h-6 w-6 mb-2" />
              <span>Calculate Macros</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Library navigation section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <Card className="h-full card">
          <CardHeader className="card-header">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
                Food Library
              </div>
              <Badge variant="outline" className="ml-2">
                {foods?.length || 0} items
              </Badge>
            </CardTitle>
            <CardDescription>Browse and manage your food database</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[140px] card-content">
            <p className="text-sm text-muted-foreground mb-4">
              Access your complete food database with detailed nutritional information for meal planning.
            </p>
            <div className="mt-auto">
              <Button className="w-full" onClick={() => navigate('/nutrition/food-database')}>
                Open Food Library
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-full card">
          <CardHeader className="card-header">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Meal Plan Library
              </div>
              <Badge variant="outline" className="ml-2">
                {mealPlans?.length || 0} plans
              </Badge>
            </CardTitle>
            <CardDescription>Access your meal plans and templates</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[140px] card-content">
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your complete collection of meal plans, recipes, and templates.
            </p>
            <div className="mt-auto">
              <Button className="w-full" onClick={() => navigate('/nutrition/meal-plans')}>
                Open Meal Plans
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Pizza className="h-5 w-5 mr-2 text-primary" />
              Recently Used Foods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentlyUsedFoods.length > 0 ? (
                recentlyUsedFoods.map((food) => (
                  <div key={food.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {food.servingSize} {food.servingUnit} • {food.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{food.calories} kcal</div>
                      <div className="text-sm text-muted-foreground">
                        P: {food.protein}g C: {food.carbs}g F: {food.fat}g
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recently used foods</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/nutrition/food-database')}>View All Foods</Button>
            <Button onClick={() => navigate('/nutrition/food-database/new')}>
              <Plus className="mr-1 h-4 w-4" />
              Add Food
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Book className="h-5 w-5 mr-2 text-primary" />
              Recent Meal Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mealPlans && mealPlans.length > 0 ? (
                mealPlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="flex justify-between items-start py-2 border-b">
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.dailyCalories} kcal • {plan.days?.length || 0} day plan
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={plan.isTemplate ? 'outline' : 'default'}>
                        {plan.isTemplate ? 'Template' : 'Client Plan'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/nutrition/meal-plans/${plan.id}`)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No meal plans yet</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/nutrition/meal-plans')}>
              View All Plans
            </Button>
            <Button onClick={() => navigate('/nutrition/meal-plans/new')}>
              <Plus className="mr-1 h-4 w-4" />
              Create Plan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}