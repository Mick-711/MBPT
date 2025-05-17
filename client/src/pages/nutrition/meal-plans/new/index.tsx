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
  Filter,
  Sparkles
} from 'lucide-react';
import InlineMealPlanAI from '@/components/nutrition/InlineMealPlanAI';

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
  calculateMealNutrition,
  calculateCaloriesFromMacros
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
    dailyFiber: 0, // Added fiber tracking
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
    
    setMealPlan(prev => {
      const updatedPlan = { 
        ...prev, 
        [name]: name === 'dailyCalories' || name === 'dailyProtein' || 
                name === 'dailyCarbs' || name === 'dailyFat' || 
                name === 'dailyFiber' ? Number(value) : value 
      };
      
      // If changing any macro nutrient, recalculate calories automatically
      if (['dailyProtein', 'dailyCarbs', 'dailyFat', 'dailyFiber'].includes(name)) {
        // Get current macro values
        const protein = name === 'dailyProtein' ? Number(value) : Number(prev.dailyProtein || 0);
        const carbs = name === 'dailyCarbs' ? Number(value) : Number(prev.dailyCarbs || 0);
        const fat = name === 'dailyFat' ? Number(value) : Number(prev.dailyFat || 0);
        const fiber = name === 'dailyFiber' ? Number(value) : Number(prev.dailyFiber || 0);
        
        // Calculate calories using our formula that accounts for fiber differently
        const calories = calculateCaloriesFromMacros(protein, carbs, fat, fiber);
        
        // Update calories with the calculated value
        updatedPlan.dailyCalories = Math.round(calories);
      }
      
      return updatedPlan;
    });
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
    
    // Check if we need to add a snack meal
    if (currentMealType === 'snacks') {
      // Look for an existing snack meal
      const snackMealIndex = updatedMealPlan.days?.[dayIndex]?.meals?.findIndex(
        m => m.name === 'Snacks'
      );
      
      if (snackMealIndex === -1 || snackMealIndex === undefined) {
        // Create a new snack meal
        const snackMeal: MealData = {
          id: Date.now(),
          name: 'Snacks',
          description: 'Snacks throughout the day',
          time: '15:00',
          foods: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        };
        
        // Add to meal plan
        if (updatedMealPlan.days && updatedMealPlan.days[dayIndex]) {
          updatedMealPlan.days[dayIndex].meals.push(snackMeal);
          mealIndex = updatedMealPlan.days[dayIndex].meals.length - 1;
        }
      } else {
        // Use existing snack meal
        mealIndex = snackMealIndex;
      }
    } else {
      // Find the meal index based on the type
      if (currentMealType === 'breakfast') mealIndex = 0;
      else if (currentMealType === 'lunch') mealIndex = 1;
      else if (currentMealType === 'dinner') mealIndex = 2;
    }
    
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
    
    // Find the meal index based on the type
    if (mealType === 'snacks') {
      // Look for a snack meal
      const snackMealIndex = updatedMealPlan.days?.[dayIndex]?.meals?.findIndex(
        m => m.name === 'Snacks'
      );
      
      if (snackMealIndex !== -1 && snackMealIndex !== undefined) {
        mealIndex = snackMealIndex;
      } else {
        // No snack meal found, nothing to remove
        return;
      }
    } else {
      if (mealType === 'breakfast') mealIndex = 0;
      else if (mealType === 'lunch') mealIndex = 1;
      else if (mealType === 'dinner') mealIndex = 2;
    }
    
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
            dinner: 0.35,
            snacks: 0.1
          };
          const percentage = percentages[mealType as keyof typeof percentages] || 0.1;
          
          currentMeal.totalCalories = Math.round((mealPlan.dailyCalories || 0) * percentage);
          currentMeal.totalProtein = Math.round((mealPlan.dailyProtein || 0) * percentage);
          currentMeal.totalCarbs = Math.round((mealPlan.dailyCarbs || 0) * percentage);
          currentMeal.totalFat = Math.round((mealPlan.dailyFat || 0) * percentage);
        }
        
        // If it's a snack and there are no more foods, remove the whole snack meal
        if (mealType === 'snacks' && currentMeal.foods.length === 0) {
          updatedMealPlan.days[dayIndex].meals = updatedMealPlan.days[dayIndex].meals.filter(
            (_, i) => i !== mealIndex
          );
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
    
    // Find the meal index based on the type
    if (mealType === 'snacks') {
      // Look for a snack meal
      const snackMealIndex = updatedMealPlan.days?.[dayIndex]?.meals?.findIndex(
        m => m.name === 'Snacks'
      );
      
      if (snackMealIndex !== -1 && snackMealIndex !== undefined) {
        mealIndex = snackMealIndex;
      } else {
        // No snack meal found, nothing to update
        return;
      }
    } else {
      if (mealType === 'breakfast') mealIndex = 0;
      else if (mealType === 'lunch') mealIndex = 1;
      else if (mealType === 'dinner') mealIndex = 2;
    }
    
    if (updatedMealPlan.days && updatedMealPlan.days[dayIndex] && updatedMealPlan.days[dayIndex].meals) {
      const currentMeal = updatedMealPlan.days[dayIndex].meals[mealIndex];
      
      // Update food quantity
      if (currentMeal.foods) {
        const foodIndex = currentMeal.foods.findIndex(f => f.foodId === foodId);
        if (foodIndex >= 0) {
          currentMeal.foods[foodIndex].quantity = quantity;
          
          // Recalculate nutrition including fiber
          const { calories, protein, carbs, fat, fiber } = calculateMealNutrition(
            currentMeal.foods, 
            foodDatabase
          );
          
          currentMeal.totalCalories = calories;
          currentMeal.totalProtein = protein;
          currentMeal.totalCarbs = carbs;
          currentMeal.totalFat = fat;
          currentMeal.totalFiber = fiber;
          
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
          onClick={() => navigate('/nutrition')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Nutrition Dashboard
        </Button>
        <h1 className="text-2xl font-bold">
          {mealPlan.isTemplate ? 'Create Meal Plan Template' : 'Create New Meal Plan'}
        </h1>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Plan Details</h2>
        {(mealPlan.dailyCalories || 0) > 0 && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('details')}
              className={activeTab === 'details' ? 'bg-primary/10' : ''}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
            <Button 
              variant="outline"
              onClick={() => setActiveTab('foods')}
              className={activeTab === 'foods' ? 'bg-primary/10' : ''}
            >
              <Pizza className="mr-2 h-4 w-4" />
              Edit Foods
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Generate with AI
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    AI Meal Plan Generation
                  </DialogTitle>
                  <DialogDescription>
                    Create an AI-powered meal plan based on your macro targets
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <p>Using AI technology, we can generate personalized meal plans optimized for your macro targets.</p>
                  <div className="bg-muted p-3 rounded-md">
                    <h4 className="font-medium mb-1">AI-powered meal plans include:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Balanced breakfast, lunch, dinner and snacks</li>
                      <li>Precise macro distribution across meals</li>
                      <li>Food suggestions from your database</li>
                      <li>Customizations based on dietary needs</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Customize Meal Plan:</h4>
                    
                    <div className="space-y-1">
                      <Label htmlFor="mealCount">Number of Meals</Label>
                      <Select 
                        defaultValue="3"
                        onValueChange={(value) => {
                          const selectedCount = parseInt(value);
                          // Store the selected meal count in a variable or state to use later
                          (window as any).selectedMealCount = selectedCount;
                        }}
                      >
                        <SelectTrigger id="mealCount" className="w-full">
                          <SelectValue placeholder="Choose meal count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 (Breakfast, Lunch, Dinner)</SelectItem>
                          <SelectItem value="4">4 (Breakfast, Lunch, Dinner, Snack)</SelectItem>
                          <SelectItem value="5">5 (Breakfast, Lunch, Dinner, 2 Snacks)</SelectItem>
                          <SelectItem value="6">6 (Breakfast, Lunch, Dinner, 3 Snacks)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label>
                          Breakfast Macros
                          <span className="ml-1 text-xs text-muted-foreground">(25%)</span>
                        </Label>
                        <Input 
                          type="number" 
                          defaultValue="25"
                          min="5"
                          max="50"
                          className="w-full"
                          id="breakfast-percentage"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>
                          Lunch Macros
                          <span className="ml-1 text-xs text-muted-foreground">(40%)</span>
                        </Label>
                        <Input 
                          type="number" 
                          defaultValue="40"
                          min="10"
                          max="50"
                          className="w-full"
                          id="lunch-percentage"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>
                          Dinner Macros
                          <span className="ml-1 text-xs text-muted-foreground">(35%)</span>
                        </Label>
                        <Input 
                          type="number" 
                          defaultValue="35"
                          min="10"
                          max="50"
                          className="w-full"
                          id="dinner-percentage"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Checkbox id="includeSnacks" defaultChecked />
                        <Label htmlFor="includeSnacks" className="ml-2">
                          Include snacks if needed to balance total macros
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The system will automatically calculate and create snacks to help balance your daily macro targets
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex space-x-2 sm:justify-end">
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                      onClick={() => {
                        // Need to use setTimeout to allow dialog to close first before updating state
                        setTimeout(() => {
                          // Get meal count from UI
                          const mealCountSelect = parseInt((window as any).selectedMealCount || "3");
                          
                          // Get meal distribution percentages from UI
                          const breakfastPercentage = parseInt((document.getElementById('breakfast-percentage') as HTMLInputElement)?.value || "25");
                          const lunchPercentage = parseInt((document.getElementById('lunch-percentage') as HTMLInputElement)?.value || "40");
                          const dinnerPercentage = parseInt((document.getElementById('dinner-percentage') as HTMLInputElement)?.value || "35");
                          
                          // Validate percentages sum to 100 for the base 3 meals
                          let baseSum = breakfastPercentage + lunchPercentage + dinnerPercentage;
                          let adjustedBreakfastPct = breakfastPercentage;
                          let adjustedLunchPct = lunchPercentage;
                          let adjustedDinnerPct = dinnerPercentage;
                          
                          // Adjust if not 100%
                          if (baseSum !== 100) {
                            const adjustmentFactor = 100 / baseSum;
                            adjustedBreakfastPct = Math.round(breakfastPercentage * adjustmentFactor);
                            adjustedLunchPct = Math.round(lunchPercentage * adjustmentFactor);
                            // Ensure the total is exactly 100%
                            adjustedDinnerPct = 100 - adjustedBreakfastPct - adjustedLunchPct;
                          }
                          
                          // Determine meal configuration based on count
                          let mealNames = ['Breakfast', 'Lunch', 'Dinner'];
                          let times = ['08:00', '13:00', '19:00'];
                          let ratios = [
                            adjustedBreakfastPct/100, 
                            adjustedLunchPct/100, 
                            adjustedDinnerPct/100
                          ];
                          
                          // Add snacks if needed
                          if (mealCountSelect > 3) {
                            const snacksCount = mealCountSelect - 3;
                            const includeSnacks = (document.getElementById('includeSnacks') as HTMLInputElement)?.checked ?? true;
                            
                            if (includeSnacks) {
                              // Calculate percentage for snacks (evenly distributed)
                              const snackPercentage = 15; // 15% per snack
                              const totalSnackPercentage = snackPercentage * snacksCount;
                              
                              // Adjust main meal percentages
                              const mainMealsAdjustment = (100 - totalSnackPercentage) / 100;
                              ratios = ratios.map(r => r * mainMealsAdjustment);
                              
                              // Add snack ratios
                              const snackRatio = snackPercentage / 100;
                              
                              // Add snacks to meals
                              for (let i = 0; i < snacksCount; i++) {
                                const snackNum = i + 1;
                                mealNames.push(`Snack ${snacksCount > 1 ? snackNum : ''}`);
                                
                                // Set appropriate snack times
                                if (snacksCount === 1) {
                                  times.push('15:30'); // Mid-afternoon snack
                                } else if (snacksCount === 2) {
                                  times.push(i === 0 ? '10:30' : '15:30'); // Morning and afternoon
                                } else if (snacksCount === 3) {
                                  times.push(i === 0 ? '10:30' : (i === 1 ? '15:30' : '20:30')); // Morning, afternoon, evening
                                }
                                
                                ratios.push(snackRatio);
                              }
                            }
                          }
                          
                          const totalProtein = mealPlan.dailyProtein || 0;
                          const totalCarbs = mealPlan.dailyCarbs || 0;
                          const totalFat = mealPlan.dailyFat || 0;
                          const totalCalories = mealPlan.dailyCalories || 0;
                          
                          // Create meals based on calculated distribution
                          const meals = mealNames.map((name, index) => {
                            const ratio = ratios[index];
                            return {
                              id: Date.now() + index,
                              name,
                              description: `AI-generated ${name.toLowerCase()} suggestion`,
                              time: times[index],
                              foods: [],
                              totalCalories: Math.round(totalCalories * ratio),
                              totalProtein: Math.round(totalProtein * ratio),
                              totalCarbs: Math.round(totalCarbs * ratio),
                              totalFat: Math.round(totalFat * ratio)
                            };
                          });
                          
                          // Update meal plan with the new meals
                          setMealPlan(prev => ({
                            ...prev,
                            days: [{ dayNumber: 1, meals: meals }]
                          }));
                          
                          // Navigate to the foods tab
                          setActiveTab('foods');
                          
                          // Show success toast message
                          const toast = document.createElement('div');
                          toast.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-in slide-in-from-right';
                          toast.innerHTML = `
                            <div class="flex items-center">
                              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              <p><strong>Success!</strong> AI meal plan created with balanced macros.</p>
                            </div>
                          `;
                          document.body.appendChild(toast);
                          
                          // Remove toast after 3 seconds
                          setTimeout(() => {
                            toast.classList.add('animate-out', 'slide-out-to-right');
                            setTimeout(() => {
                              document.body.removeChild(toast);
                            }, 300);
                          }, 3000);
                        }, 100);
                      }}
                    >
                      Generate Plan
                    </Button>
                  </DialogTrigger>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
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
                <div>
                  <Label htmlFor="dailyFiber">Daily Fiber (g)</Label>
                  <Input 
                    id="dailyFiber" 
                    name="dailyFiber" 
                    type="number"
                    value={mealPlan.dailyFiber || 0} 
                    onChange={handleChange} 
                    placeholder="Daily fiber" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Fiber counts as 2 calories/g (instead of 4 for regular carbs)
                  </p>
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
                              <div className="flex items-center gap-1">
                                <Select 
                                  onValueChange={(value) => setCurrentMealType(value)}
                                  defaultValue="breakfast"
                                >
                                  <SelectTrigger className="h-8 w-24">
                                    <SelectValue placeholder="Meal" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="breakfast">Breakfast</SelectItem>
                                    <SelectItem value="lunch">Lunch</SelectItem>
                                    <SelectItem value="dinner">Dinner</SelectItem>
                                    <SelectItem value="snacks">Snacks</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => addFoodToMeal(food)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
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
                              <div className="flex items-center gap-1">
                                <Select 
                                  onValueChange={(value) => setCurrentMealType(value)}
                                  defaultValue="lunch"
                                >
                                  <SelectTrigger className="h-8 w-24">
                                    <SelectValue placeholder="Meal" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="breakfast">Breakfast</SelectItem>
                                    <SelectItem value="lunch">Lunch</SelectItem>
                                    <SelectItem value="dinner">Dinner</SelectItem>
                                    <SelectItem value="snacks">Snacks</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => addFoodToMeal(food)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
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
                              <div className="flex items-center gap-1">
                                <Select 
                                  onValueChange={(value) => setCurrentMealType(value)}
                                  defaultValue="dinner"
                                >
                                  <SelectTrigger className="h-8 w-24">
                                    <SelectValue placeholder="Meal" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="breakfast">Breakfast</SelectItem>
                                    <SelectItem value="lunch">Lunch</SelectItem>
                                    <SelectItem value="dinner">Dinner</SelectItem>
                                    <SelectItem value="snacks">Snacks</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => addFoodToMeal(food)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium">Meal Plan</h3>
                  {mealPlan.dailyCalories > 0 && (
                    <InlineMealPlanAI 
                      macroTargets={{
                        calories: mealPlan.dailyCalories || 0,
                        protein: mealPlan.dailyProtein || 0,
                        carbs: mealPlan.dailyCarbs || 0,
                        fat: mealPlan.dailyFat || 0
                      }}
                      onMealsGenerated={(generatedMeals) => {
                        // Update meal plan with the new meals
                        setMealPlan(prev => ({
                          ...prev,
                          days: prev.days ? [{ 
                            ...prev.days[0], 
                            meals: generatedMeals 
                          }] : [{ 
                            dayNumber: 1, 
                            meals: generatedMeals 
                          }]
                        }));
                      }}
                    />
                  )}
                </div>
                
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
                      <div className="grid grid-cols-5 gap-2 text-sm mb-2">
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
                        <div>
                          <p className="text-muted-foreground">Fiber</p>
                          <p className="font-medium">{meal.totalFiber || 0}g</p>
                          <p className="text-xs text-muted-foreground">(2cal/g)</p>
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