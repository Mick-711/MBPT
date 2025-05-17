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
  ChevronDown,
  List
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Items</CardTitle>
          <CardDescription>Add new foods, meals, and nutrition templates to your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button className="h-auto py-4 flex flex-col" onClick={() => navigate('/nutrition/food-database/new')}>
              <ShoppingCart className="h-6 w-6 mb-2" />
              <span>Add New Food</span>
            </Button>
            <Button className="h-auto py-4 flex flex-col" onClick={() => navigate('/nutrition/meal-plans/new')}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
              Food Library
            </CardTitle>
            <CardDescription>Browse and manage your food database</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[150px]">
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
        
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Meal Plan Library
            </CardTitle>
            <CardDescription>Access your meal plans and templates</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[150px]">
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book className="h-5 w-5 mr-2 text-primary" />
            Nutrition Templates
          </CardTitle>
          <CardDescription>Quick access to your saved meal plan templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mealPlans
              ?.filter((plan) => plan.isTemplate)
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
                      <span>{template.meals?.length || 0} meals</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/nutrition/meal-plans/${template.id}`)}
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
        <CardFooter>
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mealPlans">Meal Plans</TabsTrigger>
          <TabsTrigger value="foodDatabase">Food Database</TabsTrigger>
          <TabsTrigger value="macroCalculator">Macro Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
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
                            {plan.dailyCalories} kcal • {plan.days.length} day plan
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
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-auto py-4 flex flex-col" onClick={() => navigate('/nutrition/food-database/new')}>
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span>Add New Food</span>
                </Button>
                <Button className="h-auto py-4 flex flex-col" onClick={() => navigate('/nutrition/meal-plans/new')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Create Meal Plan</span>
                </Button>
                <Button className="h-auto py-4 flex flex-col" onClick={() => navigate('/nutrition/calculator')}>
                  <Calculator className="h-6 w-6 mb-2" />
                  <span>Calculate Macros</span>
                </Button>
                <Button className="h-auto py-4 flex flex-col" variant="outline" onClick={() => navigate('/clients')}>
                  <List className="h-6 w-6 mb-2" />
                  <span>Assign to Client</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mealPlans" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Meal Plans</h2>
            <Button onClick={() => navigate('/nutrition/meal-plans/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Meal Plan
            </Button>
          </div>
          
          <div className="space-y-4">
            {mealPlans && mealPlans.length > 0 ? (
              mealPlans.map((plan: MealPlanData) => (
                <Card key={plan.id} className="hover:bg-accent/5 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge variant={plan.isTemplate ? 'outline' : 'default'}>
                        {plan.isTemplate ? 'Template' : 'Client Plan'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Daily Calories</p>
                        <p className="text-2xl font-bold">{plan.dailyCalories}</p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Protein</p>
                        <p className="text-2xl font-bold">{plan.dailyProtein}g</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((plan.dailyProtein * 4 / plan.dailyCalories) * 100)}% of calories
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Carbs</p>
                        <p className="text-2xl font-bold">{plan.dailyCarbs}g</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((plan.dailyCarbs * 4 / plan.dailyCalories) * 100)}% of calories
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Fat</p>
                        <p className="text-2xl font-bold">{plan.dailyFat}g</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((plan.dailyFat * 9 / plan.dailyCalories) * 100)}% of calories
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center cursor-pointer">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{plan.days.length} days planned</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => navigate(`/nutrition/meal-plans/${plan.id}`)}>
                      View Details
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/nutrition/meal-plans/${plan.id}/edit`)}>
                      Edit
                    </Button>
                    <Button onClick={() => navigate(`/nutrition/meal-plans/${plan.id}/assign`)}>
                      Assign to Client
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Pizza className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Meal Plans Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create meal plan templates for your clients to help them meet their nutrition goals.
                </p>
                <Button onClick={() => navigate('/nutrition/meal-plans/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Meal Plan
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="foodDatabase" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Food Database</h2>
            <Button onClick={() => navigate('/nutrition/food-database/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Food
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Foods</CardTitle>
              <CardDescription>
                Manage your food database with detailed nutritional information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-8 bg-muted/50 p-3 font-medium">
                  <div className="col-span-2">Name</div>
                  <div className="text-center">Serving</div>
                  <div className="text-center">Calories</div>
                  <div className="text-center">Protein</div>
                  <div className="text-center">Carbs</div>
                  <div className="text-center">Fat</div>
                  <div className="text-right">Actions</div>
                </div>
                {foods && foods.length > 0 ? (
                  foods.map((food: FoodData) => (
                    <div key={food.id} className="grid grid-cols-8 border-t p-3 items-center">
                      <div className="col-span-2">
                        <div className="font-medium">{food.name}</div>
                        <div className="text-xs text-muted-foreground">{food.brand || 'Generic'}</div>
                      </div>
                      <div className="text-center">{food.servingSize} {food.servingUnit}</div>
                      <div className="text-center">{food.calories}</div>
                      <div className="text-center">{food.protein}g</div>
                      <div className="text-center">{food.carbs}g</div>
                      <div className="text-center">{food.fat}g</div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/nutrition/food-database/${food.id}`)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/nutrition/food-database/${food.id}/edit`)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No foods found in database
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="macroCalculator" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Macro Calculator</h2>
          </div>
          
          <div className="text-center py-4">
            <Button onClick={() => navigate('/nutrition/calculator')}>
              <Calculator className="mr-2 h-4 w-4" />
              Open Macro Calculator
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}