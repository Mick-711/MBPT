import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  Pizza, 
  Search, 
  Save, 
  Trash, 
  Edit, 
  Filter 
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { 
  saveMealPlansToStorage, 
  getMealPlansFromStorage,
  getFoodsFromStorage,
  MealPlanData,
  MealData,
  MealFoodItem,
  FoodData,
  calculateMealNutrition
} from '@/lib/nutritionHelpers';

export default function NewMealPlan() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('details');
  const [foodSearchTerm, setFoodSearchTerm] = useState('');
  const [foodDatabase, setFoodDatabase] = useState<FoodData[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<{[key: string]: FoodData[]}>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });
  const [foodQuantities, setFoodQuantities] = useState<{[key: string]: {[foodId: number]: number}}>({
    breakfast: {},
    lunch: {},
    dinner: {},
    snacks: {}
  });
  const [suggestedFoods, setSuggestedFoods] = useState<{
    protein: FoodData[],
    carbs: FoodData[],
    fat: FoodData[]
  }>({
    protein: [],
    carbs: [],
    fat: []
  });
  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);
  const [currentMealType, setCurrentMealType] = useState<string>('breakfast');
  
  const [mealPlan, setMealPlan] = useState<Partial<MealPlanData>>({
    id: Date.now(),
    name: '',
    description: '',
    isTemplate: false,
    days: [{ dayNumber: 1, meals: [] }],
    trainerId: 1, // Default trainer ID
    clientId: undefined,
    dailyCalories: 0,
    dailyProtein: 0,
    dailyCarbs: 0,
    dailyFat: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Load food database
  useEffect(() => {
    const foods = getFoodsFromStorage();
    setFoodDatabase(foods);
  }, []);

  // Check if we're loading from a template or from macro calculator
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateParam = urlParams.get('template');
    const templateIdParam = urlParams.get('templateId');
    
    // Check for macro parameters from calculator
    const proteinParam = urlParams.get('protein');
    const carbsParam = urlParams.get('carbs');
    const fatParam = urlParams.get('fat');
    
    // If we have macro parameters, use them
    if (proteinParam || carbsParam || fatParam) {
      const protein = proteinParam ? parseInt(proteinParam) : 0;
      const carbs = carbsParam ? parseInt(carbsParam) : 0;
      const fat = fatParam ? parseInt(fatParam) : 0;
      
      // Calculate total calories
      const calories = (protein * 4) + (carbs * 4) + (fat * 9);
      
      setMealPlan(prev => ({ 
        ...prev,
        name: 'Meal Plan Based on Calculated Macros',
        description: `Protein: ${protein}g, Carbs: ${carbs}g, Fat: ${fat}g`,
        dailyProtein: protein,
        dailyCarbs: carbs,
        dailyFat: fat,
        dailyCalories: calories
      }));
      
      // Set active tab to food selection
      setActiveTab('foods');
      
      // Fetch suggested foods based on macros
      fetch(`/api/food/suggestions?protein=${protein}&carbs=${carbs}&fat=${fat}`)
        .then(res => res.json())
        .then(data => {
          console.log('Suggested foods:', data);
          setSuggestedFoods(data);
          
          // Create default meals
          const defaultMeals = [
            {
              id: 1,
              name: 'Breakfast',
              description: 'Morning meal (25% of daily calories)',
              time: '08:00',
              foods: [],
              totalCalories: Math.round(calories * 0.25),
              totalProtein: Math.round(protein * 0.25),
              totalCarbs: Math.round(carbs * 0.25),
              totalFat: Math.round(fat * 0.25)
            },
            {
              id: 2,
              name: 'Lunch',
              description: 'Midday meal (40% of daily calories)',
              time: '13:00',
              foods: [],
              totalCalories: Math.round(calories * 0.4),
              totalProtein: Math.round(protein * 0.4),
              totalCarbs: Math.round(carbs * 0.4),
              totalFat: Math.round(fat * 0.4)
            },
            {
              id: 3,
              name: 'Dinner',
              description: 'Evening meal (35% of daily calories)',
              time: '19:00',
              foods: [],
              totalCalories: Math.round(calories * 0.35),
              totalProtein: Math.round(protein * 0.35),
              totalCarbs: Math.round(carbs * 0.35),
              totalFat: Math.round(fat * 0.35)
            }
          ];
          
          setMealPlan(prev => ({
            ...prev,
            days: [{ dayNumber: 1, meals: defaultMeals }]
          }));
        })
        .catch(err => console.error('Error fetching food suggestions:', err));
    }
    
    if (templateParam === 'true') {
      setMealPlan(prev => ({ ...prev, isTemplate: true }));
    }
    
    if (templateIdParam) {
      const plans = getMealPlansFromStorage();
      const template = plans.find(p => p.id === parseInt(templateIdParam));
      
      if (template) {
        // Create a new plan based on the template (with new ID)
        setMealPlan({
          ...template,
          id: Date.now(),
          name: `Copy of ${template.name}`,
          isTemplate: false
        });
      }
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMealPlan(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTemplateToggle = (checked: boolean) => {
    setMealPlan(prev => ({ ...prev, isTemplate: checked }));
  };
  
  // Add food to meal
  const openAddFoodDialog = (mealType: string) => {
    setCurrentMealType(mealType);
    setIsAddFoodDialogOpen(true);
  };
  
  // Add a food item to the current meal
  const addFoodToMeal = (food: FoodData) => {
    // Add to selected foods
    setSelectedFoods(prev => ({
      ...prev,
      [currentMealType]: [...prev[currentMealType], food]
    }));
    
    // Set default quantity to 1
    setFoodQuantities(prev => ({
      ...prev,
      [currentMealType]: {
        ...prev[currentMealType],
        [food.id]: 1
      }
    }));
    
    // Update the meal plan with the new food
    const updatedMealPlan = {...mealPlan};
    const dayIndex = 0; // We're working with a single day for simplicity
    let mealIndex = 0;
    
    // Find the meal index based on the type
    if (currentMealType === 'breakfast') mealIndex = 0;
    else if (currentMealType === 'lunch') mealIndex = 1;
    else if (currentMealType === 'dinner') mealIndex = 2;
    
    // Add food to the meal
    if (updatedMealPlan.days && updatedMealPlan.days[dayIndex] && updatedMealPlan.days[dayIndex].meals) {
      const currentMeal = updatedMealPlan.days[dayIndex].meals[mealIndex];
      
      // Create food item
      const newFoodItem: MealFoodItem = {
        foodId: food.id,
        quantity: 1
      };
      
      // Add to foods array
      if (!currentMeal.foods) {
        currentMeal.foods = [newFoodItem];
      } else {
        currentMeal.foods.push(newFoodItem);
      }
      
      // Recalculate meal nutrition totals
      const { calories, protein, carbs, fat } = calculateMealNutrition(
        currentMeal.foods, 
        [food, ...foodDatabase]  // Include the food in the calculation
      );
      
      currentMeal.totalCalories = calories;
      currentMeal.totalProtein = protein;
      currentMeal.totalCarbs = carbs;
      currentMeal.totalFat = fat;
      
      // Update the meal plan
      setMealPlan(updatedMealPlan);
    }
  };
  
  // Remove a food from a meal
  const removeFoodFromMeal = (mealType: string, foodId: number) => {
    // Remove from selected foods
    setSelectedFoods(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(f => f.id !== foodId)
    }));
    
    // Remove from quantities
    const updatedQuantities = {...foodQuantities};
    if (updatedQuantities[mealType] && updatedQuantities[mealType][foodId]) {
      delete updatedQuantities[mealType][foodId];
    }
    setFoodQuantities(updatedQuantities);
    
    // Update the meal plan to remove the food
    const updatedMealPlan = {...mealPlan};
    const dayIndex = 0;
    let mealIndex = 0;
    
    if (mealType === 'breakfast') mealIndex = 0;
    else if (mealType === 'lunch') mealIndex = 1;
    else if (mealType === 'dinner') mealIndex = 2;
    
    if (updatedMealPlan.days && updatedMealPlan.days[dayIndex] && updatedMealPlan.days[dayIndex].meals) {
      const currentMeal = updatedMealPlan.days[dayIndex].meals[mealIndex];
      
      // Remove the food
      if (currentMeal.foods) {
        currentMeal.foods = currentMeal.foods.filter(f => f.foodId !== foodId);
        
        // Recalculate nutrition
        if (currentMeal.foods.length > 0) {
          const { calories, protein, carbs, fat } = calculateMealNutrition(
            currentMeal.foods, 
            foodDatabase
          );
          
          currentMeal.totalCalories = calories;
          currentMeal.totalProtein = protein;
          currentMeal.totalCarbs = carbs;
          currentMeal.totalFat = fat;
        } else {
          // Reset to default values based on daily percentage
          const percentages = {
            breakfast: 0.25,
            lunch: 0.4,
            dinner: 0.35
          };
          const percentage = percentages[mealType as keyof typeof percentages] || 0.25;
          
          currentMeal.totalCalories = Math.round((mealPlan.dailyCalories || 0) * percentage);
          currentMeal.totalProtein = Math.round((mealPlan.dailyProtein || 0) * percentage);
          currentMeal.totalCarbs = Math.round((mealPlan.dailyCarbs || 0) * percentage);
          currentMeal.totalFat = Math.round((mealPlan.dailyFat || 0) * percentage);
        }
        
        // Update the meal plan
        setMealPlan(updatedMealPlan);
      }
    }
  };
  
  // Update food quantity
  const updateFoodQuantity = (mealType: string, foodId: number, quantity: number) => {
    // Update quantity
    setFoodQuantities(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        [foodId]: quantity
      }
    }));
    
    // Update the meal plan with the new quantity
    const updatedMealPlan = {...mealPlan};
    const dayIndex = 0;
    let mealIndex = 0;
    
    if (mealType === 'breakfast') mealIndex = 0;
    else if (mealType === 'lunch') mealIndex = 1;
    else if (mealType === 'dinner') mealIndex = 2;
    
    if (updatedMealPlan.days && updatedMealPlan.days[dayIndex] && updatedMealPlan.days[dayIndex].meals) {
      const currentMeal = updatedMealPlan.days[dayIndex].meals[mealIndex];
      
      // Update food quantity
      if (currentMeal.foods) {
        const foodIndex = currentMeal.foods.findIndex(f => f.foodId === foodId);
        if (foodIndex >= 0) {
          currentMeal.foods[foodIndex].quantity = quantity;
          
          // Recalculate nutrition
          const { calories, protein, carbs, fat } = calculateMealNutrition(
            currentMeal.foods, 
            foodDatabase
          );
          
          currentMeal.totalCalories = calories;
          currentMeal.totalProtein = protein;
          currentMeal.totalCarbs = carbs;
          currentMeal.totalFat = fat;
          
          // Update the meal plan
          setMealPlan(updatedMealPlan);
        }
      }
    }
  };
  
  // Filter foods based on search term
  const filteredFoods = foodSearchTerm
    ? foodDatabase.filter(food => 
        food.name.toLowerCase().includes(foodSearchTerm.toLowerCase()) ||
        food.category.toLowerCase().includes(foodSearchTerm.toLowerCase())
      )
    : foodDatabase;
    
  // Handle save
  const handleSave = () => {
    if (!mealPlan.name) {
      alert('Please enter a name for your meal plan');
      return;
    }
    
    // Save the meal plan
    const existingPlans = getMealPlansFromStorage() || [];
    const updatedPlans = [...existingPlans, mealPlan as MealPlanData];
    saveMealPlansToStorage(updatedPlans);
    
    // Navigate back to meal plans
    navigate('/nutrition/meal-plans');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/nutrition/meal-plans')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {mealPlan.isTemplate ? 'Create Meal Plan Template' : 'Create New Meal Plan'}
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">
            <Calendar className="mr-2 h-4 w-4" />
            Plan Details
          </TabsTrigger>
          <TabsTrigger value="foods">
            <Pizza className="mr-2 h-4 w-4" />
            Food Selection
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Meal Plan Details
              </CardTitle>
              <CardDescription>
                Enter the details for your new meal plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Meal Plan Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={mealPlan.name} 
                  onChange={handleChange} 
                  placeholder="Enter meal plan name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={mealPlan.description as string} 
                  onChange={handleChange} 
                  placeholder="Enter a description for this meal plan" 
                  rows={3} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="dailyCalories">Daily Calories</Label>
                  <Input 
                    id="dailyCalories" 
                    name="dailyCalories" 
                    type="number"
                    value={mealPlan.dailyCalories} 
                    onChange={handleChange} 
                    placeholder="Daily calories" 
                    readOnly={!!mealPlan.dailyCalories}
                  />
                </div>
                <div>
                  <Label htmlFor="dailyProtein">Daily Protein (g)</Label>
                  <Input 
                    id="dailyProtein" 
                    name="dailyProtein" 
                    type="number"
                    value={mealPlan.dailyProtein} 
                    onChange={handleChange} 
                    placeholder="Daily protein" 
                    readOnly={!!mealPlan.dailyProtein}
                  />
                </div>
                <div>
                  <Label htmlFor="dailyCarbs">Daily Carbs (g)</Label>
                  <Input 
                    id="dailyCarbs" 
                    name="dailyCarbs" 
                    type="number"
                    value={mealPlan.dailyCarbs} 
                    onChange={handleChange} 
                    placeholder="Daily carbs" 
                    readOnly={!!mealPlan.dailyCarbs}
                  />
                </div>
                <div>
                  <Label htmlFor="dailyFat">Daily Fat (g)</Label>
                  <Input 
                    id="dailyFat" 
                    name="dailyFat" 
                    type="number"
                    value={mealPlan.dailyFat} 
                    onChange={handleChange} 
                    placeholder="Daily fat" 
                    readOnly={!!mealPlan.dailyFat}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isTemplate" 
                  checked={mealPlan.isTemplate} 
                  onCheckedChange={handleTemplateToggle} 
                />
                <Label htmlFor="isTemplate" className="cursor-pointer">
                  Save as template for future use
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/nutrition/meal-plans')}>
                Cancel
              </Button>
              <Button onClick={() => setActiveTab('foods')}>
                Next: Select Foods
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="foods">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pizza className="h-5 w-5 mr-2 text-primary" />
                Food Selection
              </CardTitle>
              <CardDescription>
                Add foods to your meal plan based on the calculated macros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Macro Targets Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-base font-medium mb-2">Macro Targets</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-lg font-semibold">{mealPlan.dailyCalories} kcal</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-lg font-semibold">{mealPlan.dailyProtein}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="text-lg font-semibold">{mealPlan.dailyCarbs}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="text-lg font-semibold">{mealPlan.dailyFat}g</p>
                  </div>
                </div>
              </div>
              
              {/* Food Suggestions */}
              {suggestedFoods.protein.length > 0 && (
                <div>
                  <h3 className="text-base font-medium mb-2">Suggested Foods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Protein Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {suggestedFoods.protein.map(food => (
                            <li key={food.id} className="flex justify-between items-center text-sm">
                              <span>{food.name} ({food.protein}g per {food.servingSize}{food.servingUnit})</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setCurrentMealType('breakfast');
                                  addFoodToMeal(food);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Carb Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {suggestedFoods.carbs.map(food => (
                            <li key={food.id} className="flex justify-between items-center text-sm">
                              <span>{food.name} ({food.carbs}g per {food.servingSize}{food.servingUnit})</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setCurrentMealType('lunch');
                                  addFoodToMeal(food);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Fat Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {suggestedFoods.fat.map(food => (
                            <li key={food.id} className="flex justify-between items-center text-sm">
                              <span>{food.name} ({food.fat}g per {food.servingSize}{food.servingUnit})</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setCurrentMealType('dinner');
                                  addFoodToMeal(food);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              {/* Meal Plan Foods */}
              <div>
                <h3 className="text-base font-medium mb-2">Meal Plan</h3>
                
                {mealPlan.days && mealPlan.days[0]?.meals?.map((meal, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{meal.name}</CardTitle>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openAddFoodDialog(index === 0 ? 'breakfast' : index === 1 ? 'lunch' : 'dinner')}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Food
                        </Button>
                      </div>
                      <CardDescription>{meal.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2 text-sm mb-2">
                        <div>
                          <p className="text-muted-foreground">Calories</p>
                          <p className="font-medium">{meal.totalCalories} kcal</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Protein</p>
                          <p className="font-medium">{meal.totalProtein}g</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Carbs</p>
                          <p className="font-medium">{meal.totalCarbs}g</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fat</p>
                          <p className="font-medium">{meal.totalFat}g</p>
                        </div>
                      </div>
                      
                      {meal.foods && meal.foods.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-4 py-2 text-left">Food</th>
                                <th className="px-4 py-2 text-center">Quantity</th>
                                <th className="px-4 py-2 text-center">Calories</th>
                                <th className="px-4 py-2 text-center">Protein</th>
                                <th className="px-4 py-2 text-center">Carbs</th>
                                <th className="px-4 py-2 text-center">Fat</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {meal.foods.map((foodItem, foodIndex) => {
                                const food = foodDatabase.find(f => f.id === foodItem.foodId);
                                if (!food) return null;
                                
                                const mealType = index === 0 ? 'breakfast' : index === 1 ? 'lunch' : 'dinner';
                                const quantity = foodItem.quantity || 1;
                                
                                return (
                                  <tr key={foodIndex} className="border-t">
                                    <td className="px-4 py-2">{food.name}</td>
                                    <td className="px-4 py-2 text-center">
                                      <Input
                                        type="number"
                                        min="0.25"
                                        step="0.25"
                                        value={quantity}
                                        className="w-16 h-8 text-center mx-auto"
                                        onChange={(e) => updateFoodQuantity(
                                          mealType,
                                          food.id,
                                          parseFloat(e.target.value) || 1
                                        )}
                                      />
                                    </td>
                                    <td className="px-4 py-2 text-center">{Math.round(food.calories * quantity)} kcal</td>
                                    <td className="px-4 py-2 text-center">{Math.round(food.protein * quantity)}g</td>
                                    <td className="px-4 py-2 text-center">{Math.round(food.carbs * quantity)}g</td>
                                    <td className="px-4 py-2 text-center">{Math.round(food.fat * quantity)}g</td>
                                    <td className="px-4 py-2 text-right">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFoodFromMeal(mealType, food.id)}
                                      >
                                        <Trash className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4 text-center text-muted-foreground">
                          No foods added to this meal yet. Click 'Add Food' to get started.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('details')}>
                Back to Details
              </Button>
              <Button onClick={handleSave}>
                {mealPlan.isTemplate ? 'Save as Template' : 'Create Meal Plan'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Food Dialog */}
      <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Food to {
              currentMealType === 'breakfast' ? 'Breakfast' :
              currentMealType === 'lunch' ? 'Lunch' :
              currentMealType === 'dinner' ? 'Dinner' : 'Meal'
            }</DialogTitle>
            <DialogDescription>
              Search for foods to add to your meal plan
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search foods..."
                value={foodSearchTerm}
                onChange={(e) => setFoodSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            
            <div className="max-h-80 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Food</th>
                    <th className="px-4 py-2 text-center">Calories</th>
                    <th className="px-4 py-2 text-center">Protein</th>
                    <th className="px-4 py-2 text-center">Carbs</th>
                    <th className="px-4 py-2 text-center">Fat</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map(food => (
                    <tr key={food.id} className="border-t">
                      <td className="px-4 py-2">
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {food.servingSize}{food.servingUnit} serving
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">{food.calories}</td>
                      <td className="px-4 py-2 text-center">{food.protein}g</td>
                      <td className="px-4 py-2 text-center">{food.carbs}g</td>
                      <td className="px-4 py-2 text-center">{food.fat}g</td>
                      <td className="px-4 py-2 text-right">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            addFoodToMeal(food);
                            setIsAddFoodDialogOpen(false);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredFoods.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No foods found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFoodDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}