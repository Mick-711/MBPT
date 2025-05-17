import React, { useState, useEffect } from 'react';
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
  List,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { 
  initializeNutritionStorage, 
  getMealPlansFromStorage,
  getFoodsFromStorage,
  MealPlanData,
  FoodData
} from '@/lib/nutritionHelpers';

export default function NutritionPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
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
  
  // Handle navigation between sections
  const navigateTo = (section: string) => {
    switch(section) {
      case 'food-database':
        navigate('/nutrition/food-database');
        break;
      case 'meal-plans':
        navigate('/nutrition/meal-plans');
        break;
      case 'calculator':
        navigate('/nutrition/calculator');
        break;
      default:
        // Stay on current page
        break;
    }
  };
  
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
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
              Food Library
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
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Meal Plan Library
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
      
      {/* Templates section */}
      <Card className="mb-5 card">
        <CardHeader className="card-header">
          <CardTitle className="flex items-center">
            <Book className="h-5 w-5 mr-2 text-primary" />
            Nutrition Templates
          </CardTitle>
          <CardDescription>Quick access to your saved meal plan templates</CardDescription>
        </CardHeader>
        <CardContent className="card-content">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mealPlans?.filter((plan) => plan.isTemplate)
              .slice(0, 3)
              .map((template) => (
                <Card key={template.id} className="overflow-hidden border border-muted">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-sm flex items-center gap-2 mb-2">
                      <List className="h-4 w-4 text-muted-foreground" />
                      <span>{template.days?.length || 0} day plan</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/nutrition/meal-plans?id=${template.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/nutrition/meal-plans/new?templateId=${template.id}`)}
                      >
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {(!mealPlans || mealPlans.filter(p => p.isTemplate).length === 0) && (
              <div className="col-span-3 py-8 text-center text-muted-foreground">
                <Book className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No templates created yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/nutrition/meal-plans/new?template=true')}
                >
                  Create Your First Template
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="card-footer">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center"
            onClick={() => navigate('/nutrition/meal-plans?filter=templates')}
          >
            View All Templates
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          if (value === 'mealPlans') navigateTo('meal-plans');
          if (value === 'foodDatabase') navigateTo('food-database');
          if (value === 'macroCalculator') navigateTo('calculator');
        }} 
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mealPlans">Meal Plans</TabsTrigger>
          <TabsTrigger value="foodDatabase">Food Database</TabsTrigger>
          <TabsTrigger value="macroCalculator">Macro Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 tab-content">
          {/* Stats overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Meal Plans
                </CardTitle>
                <CardDescription>Manage your meal plan templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mealPlans?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total meal plan templates</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-between" onClick={() => navigate('/nutrition/meal-plans')}>
                  View All 
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
                  Food Database
                </CardTitle>
                <CardDescription>Catalog of foods and recipes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{foods?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total foods in database</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-between" onClick={() => navigate('/nutrition/food-database')}>
                  Manage Foods
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-primary" />
                  Macro Calculator
                </CardTitle>
                <CardDescription>Calculate client nutrition needs</CardDescription>
              </CardHeader>
              <CardContent className="pb-0 flex flex-col justify-between h-[105px]">
                <p className="text-sm">Calculate personalized macros based on client metrics, goals, and activity level</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-between" onClick={() => navigate('/nutrition/calculator')}>
                  Open Calculator
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
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
        </TabsContent>
        
        <TabsContent value="mealPlans" className="tab-content">
          <div className="flex justify-center items-center p-12">
            <p className="text-muted-foreground">Redirecting to Meal Plans...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="foodDatabase" className="tab-content">
          <div className="flex justify-center items-center p-12">
            <p className="text-muted-foreground">Redirecting to Food Database...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="macroCalculator" className="tab-content">
          <div className="flex justify-center items-center p-12">
            <p className="text-muted-foreground">Redirecting to Macro Calculator...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}